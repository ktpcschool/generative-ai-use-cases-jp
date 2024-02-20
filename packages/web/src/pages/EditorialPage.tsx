import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Location, useLocation } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Textarea from '../components/Textarea';
import ExpandableField from '../components/ExpandableField';
import Switch from '../components/Switch';
import useChat from '../hooks/useChat';
import { create } from 'zustand';
import Texteditor from '../components/TextEditor';
import { DocumentComment } from 'generative-ai-use-cases-jp';
import debounce from 'lodash.debounce';
import { editorialPrompt } from '../prompts';
import { EditorialPageLocationState } from '../@types/navigate';
import { SelectField } from '@aws-amplify/ui-react';
import { MODELS } from '../hooks/useModel';

const REGEX_BRACKET = /\{(?:[^{}])*\}/g;
const REGEX_ZENKAKU =
  /[Ａ-Ｚａ-ｚ０-９！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝]/g;

type StateType = {
  modelId: string;
  setModelId: (c: string) => void;
  sentence: string;
  setSentence: (s: string) => void;
  additionalContext: string;
  setAdditionalContext: (s: string) => void;
  comments: DocumentComment[];
  setComments: (comments: DocumentComment[]) => void;
  commentState: { [name: string]: boolean }; // excerpt -> bool
  setCommentState: (s: { [name: string]: boolean }) => void;
  clear: () => void;
};

const useEditorialPageState = create<StateType>((set) => {
  const INIT_STATE = {
    modelId: '',
    sentence: '',
    additionalContext: '',
    comments: [],
    commentState: {},
  };
  return {
    ...INIT_STATE,
    setModelId: (s: string) => {
      set(() => ({
        modelId: s,
      }));
    },
    setSentence: (s: string) => {
      set(() => ({
        sentence: s,
      }));
    },
    setAdditionalContext: (s: string) => {
      set(() => ({
        additionalContext: s,
      }));
    },
    setComments: (comments: DocumentComment[]) => {
      set(() => ({
        comments: comments,
      }));
    },
    setCommentState: (s: { [name: string]: boolean }) => {
      set(() => ({
        commentState: s,
      }));
    },
    clear: () => {
      set(INIT_STATE);
    },
  };
});

const EditorialPage: React.FC = () => {
  const {
    modelId,
    setModelId,
    sentence,
    setSentence,
    additionalContext,
    setAdditionalContext,
    comments,
    setComments,
    commentState,
    setCommentState,
    clear,
  } = useEditorialPageState();

  const { state } = useLocation() as Location<EditorialPageLocationState>;
  const { pathname } = useLocation();
  const { loading, messages, postChat, clear: clearChat } = useChat(pathname);
  const { modelIds: availableModels, textModels } = MODELS;
  const [auto, setAuto] = useState(true);

  // Memo 変数
  const filterComment = (
    _comments: DocumentComment[],
    _commentState: { [name: string]: boolean }
  ) => {
    return _comments.filter(
      (x) =>
        x.excerpt &&
        _commentState[x.excerpt] === undefined &&
        x.excerpt !== x.replace
    );
  };
  const shownComment = useMemo(
    () => filterComment(comments, commentState),
    [comments, commentState]
  );
  const disabledExec = useMemo(() => {
    return sentence === '' || loading;
  }, [sentence, loading]);

  useEffect(() => {
    if (state !== null) {
      setSentence(state.sentence);
    }
  }, [state, setSentence]);

  useEffect(() => {
    if (!modelId) {
      setModelId(availableModels[0]);
    }
  }, [modelId, availableModels, setModelId]);

  // 文章の更新時にコメントを更新
  useEffect(() => {
    if (auto) {
      // Claude だと全角を半角に変換して出力するため入力を先に正規化
      if (sentence !== '') {
        setSentence(
          sentence
            .replace(REGEX_ZENKAKU, (s) => {
              return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
            })
            .replace(/[‐－―]/g, '-') // ハイフンなど
            .replace(/[～〜]/g, '~') // チルダ
            // eslint-disable-next-line no-irregular-whitespace
            .replace(/　/g, ' ') // スペース
        );
      }

      // debounce した後コメント更新
      onSentenceChange(
        modelId,
        sentence,
        additionalContext,
        comments,
        commentState,
        loading
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId, sentence]);

  // debounce した後コメントを更新
  // 入力を止めて1秒ほど待ってからコメントを更新し新規コメント追加リクエストを送信
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSentenceChange = useCallback(
    debounce(
      (
        _modelId: string,
        _sentence: string,
        _additionalContext: string,
        _comments: DocumentComment[],
        _commentState: { [name: string]: boolean },
        _loading: boolean
      ) => {
        // ハイライト部分が変更されたらコメントを削除
        for (const _comment of _comments) {
          if (_sentence.indexOf(_comment.excerpt) === -1) {
            _commentState[_comment.excerpt] = true;
          }
        }
        setCommentState({ ..._commentState });

        // コメントがなくなったらコメントを取得
        const _shownComment = filterComment(_comments, _commentState);
        if (_shownComment.length === 0 && _sentence !== '' && !_loading) {
          getAnnotation(_modelId, _sentence, _additionalContext);
        }
      },
      1000
    ),
    []
  );

  // コメントの更新時にリアルタイムで JSON 部分を抽出してコメントに変換
  useEffect(() => {
    if (messages.length === 0) return;
    const _lastMessage = messages[messages.length - 1];
    if (_lastMessage.role !== 'assistant') return;
    const _response = messages[messages.length - 1].content;
    const _comments = [..._response.matchAll(REGEX_BRACKET)].map((x) => {
      try {
        return JSON.parse(x[0]) as DocumentComment;
      } catch (error) {
        console.log(error);
        return { excerpt: '' };
      }
    });
    setComments(_comments);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, commentState]);

  // コメントで指定された修正を実行
  const replaceSentence = (_comment: DocumentComment) => {
    if (_comment.replace) {
      setSentence(sentence.replace(_comment.excerpt, _comment.replace));
    }
    removeComment(_comment);
  };

  // コメントを削除
  const removeComment = (_comment: DocumentComment) => {
    commentState[_comment.excerpt] = true;
    setCommentState({ ...commentState });
  };

  // LLM にリクエスト送信
  const getAnnotation = (
    modelId: string,
    sentence: string,
    context: string
  ) => {
    setCommentState({});
    postChat(
      editorialPrompt.generatePrompt({
        sentence,
        context: context === '' ? undefined : context,
      }),
      true,
      textModels.find((m) => m.modelId === modelId)
    );
  };

  // コメントを取得
  const onClickExec = useCallback(() => {
    if (loading) return;
    getAnnotation(modelId, sentence, additionalContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId, sentence, additionalContext, loading]);

  // リセット
  const onClickClear = useCallback(() => {
    clear();
    clearChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-12">
      <div className="invisible col-span-12 my-0 flex h-0 items-center justify-center text-xl font-semibold lg:visible lg:my-5 lg:h-min print:visible print:my-5 print:h-min">
        校正
      </div>
      <div className="col-span-12 col-start-1 mx-2 lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2">
        <Card label="校正したい文章">
          <div className="mb-4 flex w-full items-center justify-between">
            <SelectField
              label="モデル"
              labelHidden
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}>
              {availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </SelectField>
            <Switch
              label="自動校正"
              checked={auto}
              onChange={() => {
                setAuto(!auto);
              }}
            />
          </div>
          <Texteditor
            placeholder="入力してください"
            value={sentence}
            loading={loading}
            onChange={setSentence}
            comments={shownComment}
            replaceSentence={replaceSentence}
            removeComment={removeComment}
          />
          <ExpandableField label="追加コンテキスト" optional>
            <Textarea
              placeholder="追加で指摘してほしい点を入力することができます"
              value={additionalContext}
              onChange={setAdditionalContext}
            />
          </ExpandableField>
          <div className="flex justify-end gap-3">
            <Button outlined onClick={onClickClear} disabled={disabledExec}>
              クリア
            </Button>

            <Button disabled={disabledExec} onClick={onClickExec}>
              実行
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EditorialPage;
