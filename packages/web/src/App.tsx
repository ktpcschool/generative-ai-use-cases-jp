import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  PiList,
  PiHouse,
  PiChatCircleText,
  PiPencil,
  PiNote,
  PiChatsCircle,
  PiPenNib,
  PiMagnifyingGlass,
  PiTranslate,
  PiImages,
  PiSpeakerHighBold,
  PiGear,
  PiGlobe,
  PiX,
  PiBookOpen,
  PiChatCenteredTextThin,
  PiRobot,
  PiUploadSimple,
} from 'react-icons/pi';
import { Outlet } from 'react-router-dom';
import Drawer, { ItemProps } from './components/Drawer';
import ButtonIcon from './components/ButtonIcon';
import '@aws-amplify/ui-react/styles.css';
import useDrawer from './hooks/useDrawer';
import useConversation from './hooks/useConversation';
import PopupInterUseCasesDemo from './components/PopupInterUseCasesDemo';
import useInterUseCases from './hooks/useInterUseCases';

const ragEnabled: boolean = import.meta.env.VITE_APP_RAG_ENABLED === 'true';
const agentEnabled: boolean = import.meta.env.VITE_APP_AGENT_ENABLED === 'true';
const recognizeFileEnabled: boolean =
  import.meta.env.VITE_APP_RECOGNIZE_FILE_ENABLED === 'true';

const items: ItemProps[] = [
  {
    label: 'ホーム',
    to: '/',
    icon: <PiHouse />,
    display: 'usecase' as const,
  },
  {
    label: '設定情報',
    to: '/setting',
    icon: <PiGear />,
    display: 'none' as const,
  },
  {
    label: 'チャット',
    to: '/chat',
    icon: <PiChatsCircle />,
    display: 'usecase' as const,
  },
  ragEnabled
    ? {
        label: 'RAG チャット',
        to: '/rag',
        icon: <PiChatCircleText />,
        display: 'usecase' as const,
      }
    : null,
  agentEnabled
    ? {
        label: 'Agent チャット',
        to: '/agent',
        icon: <PiRobot />,
        display: 'usecase' as const,
      }
    : null,
  {
    label: '文章生成',
    to: '/generate',
    icon: <PiPencil />,
    display: 'usecase' as const,
  },
  {
    label: '要約',
    to: '/summarize',
    icon: <PiNote />,
    display: 'usecase' as const,
  },
  {
    label: '校正',
    to: '/editorial',
    icon: <PiPenNib />,
    display: 'usecase' as const,
  },
  {
    label: '翻訳',
    to: '/translate',
    icon: <PiTranslate />,
    display: 'usecase' as const,
  },
  {
    label: 'Web コンテンツ抽出',
    to: '/web-content',
    icon: <PiGlobe />,
    display: 'usecase' as const,
  },
  {
    label: '画像生成',
    to: '/image',
    icon: <PiImages />,
    display: 'usecase' as const,
  },
  {
    label: '音声認識',
    to: '/transcribe',
    icon: <PiSpeakerHighBold />,
    display: 'tool' as const,
  },
  recognizeFileEnabled
    ? {
        label: 'ファイルアップロード',
        to: '/file',
        icon: <PiUploadSimple />,
        display: 'tool' as const,
      }
    : null,
  ragEnabled
    ? {
        label: 'Kendra 検索',
        to: '/kendra',
        icon: <PiMagnifyingGlass />,
        display: 'tool' as const,
      }
    : null,
  {
    label: 'マイテンプレート',
    to: '/templates/mytemplate',
    icon: <PiBookOpen className="text-base" />,
    display: 'template' as const,
  },
  {
    label: '営業マネジメント',
    to: '/templates/tags/00000000-0000-0000-0000-000000000020',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'template' as const,
  },
  {
    label: 'スタッフマネジメント',
    to: '/templates/tags/00000000-0000-0000-0000-000000000021',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'template' as const,
  },
  {
    label: '企画（MD）',
    to: '/templates/tags/00000000-0000-0000-0000-000000000022',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'template' as const,
  },
  {
    label: 'デザイナー',
    to: '/templates/tags/00000000-0000-0000-0000-000000000023',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'template' as const,
  },
  {
    label: '生産',
    to: '/templates/tags/00000000-0000-0000-0000-000000000024',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'template' as const,
  },
  {
    label: 'DB',
    to: '/templates/tags/00000000-0000-0000-0000-000000000025',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'template' as const,
  },
  {
    label: '販売（営業）',
    to: '/templates/tags/00000000-0000-0000-0000-000000000026',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'template' as const,
  },
  {
    label: 'EC',
    to: '/templates/tags/00000000-0000-0000-0000-000000000027',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'template' as const,
  },
  {
    label: 'エンジニア',
    to: '/templates/tags/00000000-0000-0000-0000-000000000028',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'template' as const,
  },
  {
    label: 'タグから探す',
    to: '/templates/tags',
    icon: <PiMagnifyingGlass className="w-4 fill-white" />,
    display: 'template' as const,
  },
  {
    label: 'ガーメントグループ',
    to: '/templates/tags/00000000-0000-0000-0000-000000000004',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'templateSec' as const,
  },
  {
    label: '素材開発／販売グループ',
    to: '/templates/tags/00000000-0000-0000-0000-000000000005',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'templateSec' as const,
  },
  {
    label: 'グローバルブランドグループ',
    to: '/templates/tags/00000000-0000-0000-0000-000000000006',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'templateSec' as const,
  },
  {
    label: 'マテリアルグループ',
    to: '/templates/tags/00000000-0000-0000-0000-000000000007',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'templateSec' as const,
  },
  {
    label: 'ライフスタイルグループ',
    to: '/templates/tags/00000000-0000-0000-0000-000000000008',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'templateSec' as const,
  },
  {
    label: '経営企画セクション',
    to: '/templates/tags/00000000-0000-0000-0000-000000000009',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'templateSec' as const,
  },
  {
    label: '物流セクション',
    to: '/templates/tags/00000000-0000-0000-0000-000000000010',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'templateSec' as const,
  },
  {
    label: '業務監査セクション',
    to: '/templates/tags/00000000-0000-0000-0000-000000000011',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'templateSec' as const,
  },
  {
    label: '法務・コンプライアンスセクション',
    to: '/templates/tags/00000000-0000-0000-0000-000000000012',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'templateSec' as const,
  },
  {
    label: 'システムセクション',
    to: '/templates/tags/00000000-0000-0000-0000-000000000013',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'templateSec' as const,
  },
  {
    label: '人材開発セクション',
    to: '/templates/tags/00000000-0000-0000-0000-000000000014',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'templateSec' as const,
  },
  {
    label: '総務セクション',
    to: '/templates/tags/00000000-0000-0000-0000-000000000015',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'templateSec' as const,
  },
  {
    label: '経理セクション',
    to: '/templates/tags/00000000-0000-0000-0000-000000000016',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'templateSec' as const,
  },
  {
    label: '広報・IRセクション',
    to: '/templates/tags/00000000-0000-0000-0000-000000000017',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'templateSec' as const,
  },
  {
    label: '営業サポートセクション',
    to: '/templates/tags/00000000-0000-0000-0000-000000000018',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'templateSec' as const,
  },
  {
    label: 'QC管理グループ',
    to: '/templates/tags/00000000-0000-0000-0000-000000000019',
    icon: <PiChatCenteredTextThin className="w-4 fill-white" />,
    display: 'templateSec' as const,
  },
].flatMap((i) => (i !== null ? [i] : []));

// /chat/:chatId の形式から :chatId を返す
// path が別の形式の場合は null を返す
const extractChatId = (path: string): string | null => {
  const pattern = /\/chat\/(.+)/;
  const match = path.match(pattern);

  return match ? match[1] : null;
};

const App: React.FC = () => {
  const { switchOpen: switchDrawer, opened: isOpenDrawer } = useDrawer();
  const { pathname } = useLocation();
  const { getConversationTitle } = useConversation();
  const { isShow } = useInterUseCases();

  const label = useMemo(() => {
    const chatId = extractChatId(pathname);

    if (chatId) {
      return getConversationTitle(chatId) || '';
    } else {
      return items.find((i) => i.to === pathname)?.label || '';
    }
  }, [pathname, getConversationTitle]);

  return (
    <div className="screen:w-screen screen:h-screen overflow-x-hidden">
      <main className="flex-1">
        <header className="bg-aws-squid-ink visible flex h-12 w-full items-center justify-between text-lg text-white lg:invisible lg:h-0 print:hidden">
          <div className="flex w-10 items-center justify-start">
            <button
              className="focus:ring-aws-sky mr-2 rounded-full  p-2 hover:opacity-50 focus:outline-none focus:ring-1"
              onClick={() => {
                switchDrawer();
              }}>
              <PiList />
            </button>
          </div>

          {label}

          {/* label を真ん中にするためのダミーのブロック */}
          <div className="w-10" />
        </header>

        <div
          className={`fixed -left-64 top-0 z-50 transition-all lg:left-0 lg:z-0 ${
            isOpenDrawer ? 'left-0' : '-left-64'
          }`}>
          <Drawer items={items} />
        </div>

        <div
          id="smallDrawerFiller"
          className={`${isOpenDrawer ? 'visible' : 'invisible'} lg:invisible`}>
          <div
            className="screen:h-screen fixed top-0 z-40 w-screen bg-gray-900/90"
            onClick={switchDrawer}></div>
          <ButtonIcon
            className="fixed left-64 top-0 z-40 text-white"
            onClick={switchDrawer}>
            <PiX />
          </ButtonIcon>
        </div>
        <div className="text-aws-font-color lg:ml-64" id="main">
          {/* ユースケース間連携時に表示 */}
          {isShow && <PopupInterUseCasesDemo />}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default App;
