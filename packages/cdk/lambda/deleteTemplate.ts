import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';


const client = new DynamoDBClient();
const dynamoDb = DynamoDBDocumentClient.from(client);

async function deleteTemplate(templateid: string): Promise<boolean> {
    const templateTableName = process.env.TEMPLATE_TABLE_NAME;
    const tagTableName = process.env.TAG_TABLE_NAME;

    // DynamoDB 上に保存されている、削除前のデータを取得する
    const getCommand = new QueryCommand({
        TableName: templateTableName,
        KeyConditionExpression: 'id = :id AND templateid = :templateid',
        ExpressionAttributeValues: {
            ':id': "template#" + templateid,
            ':templateid': templateid
        }
    });

    const getResult = await dynamoDb.send(getCommand);
    let existTemplate;
    if (getResult.Items && getResult.Items.length > 0) {
        existTemplate = getResult.Items[0];
    } else {
        console.log("DynamoDB テーブルにデータが存在しませんでした。id : template#" + templateid + ", templateid : " + templateid);
        return false
    }

    console.log(existTemplate);

    // Template Table 上のテンプレートを削除する
    const deleteCommand = new DeleteCommand({
        TableName: templateTableName,
        Key: {
            'id': existTemplate.id,
            'templateid': existTemplate.templateid
        }
    });

    const response = await dynamoDb.send(deleteCommand);
    if (!response || response.$metadata.httpStatusCode !== 200) {
        return false;
    }

    // 削除するタグの処理
    const deletedTags = existTemplate.tags;
    for (const tagId of Object.keys(deletedTags)) {
        console.log('Deleting tag#' + tagId);
        const deleteCommand = new DeleteCommand({
            TableName: templateTableName,
            Key: {
                'id': 'tag#' + tagId,
                'templateid': existTemplate.templateid
            }
        });
        const response = await dynamoDb.send(deleteCommand);
        if (!response || response.$metadata.httpStatusCode !== 200) {
            return false;
        }
    }

    // タグに紐づくテンプレートが完全に 0 件になったときに、そのタグを削除する。
    // 営業, デザイナー, マーチャンダイザー等 は除外
    for (const [tagId, tagName] of Object.entries(deletedTags)) {
        // ここで DynamoDB に対してクエリーを実行します。
        const queryCommand = new QueryCommand({
            TableName: templateTableName,
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {
                ':id': 'tag#' + tagId
            }
        });

        const queryResult = await dynamoDb.send(queryCommand);
        const tagList = [
<<<<<<< HEAD
            '営業',
            'デザイナー',
            'マーチャンダイザー',
=======
>>>>>>> 67f34c699a5d573b381342599601e0c56984c302
            'ガーメントグループ',
            '素材開発／販売グループ',
            'グローバルブランドグループ',
            'マテリアルグループ',
            'ライフスタイルグループ',
            '経営企画セクション',
            '物流セクション',
            '業務監査セクション',
            '法務・コンプライアンスセクション',
            'システムセクション',
            '人材開発セクション',
            '総務セクション',
            '経理セクション',
            '広報・IRセクション',
            '営業サポートセクション',
            'QC管理グループ',
            '営業マネジメント',
            'スタッフマネジメント',
            '企画（MD）',
            'デザイナー',
            '生産',
            'DB',
            '販売（営業）',
            'EC',
            'エンジニア'
        ];

        if (typeof tagName === 'string' && tagList.includes(tagName) && queryResult.Items) {
            // タグテーブルの templateCount (gsi_sk) を減らす
            const updateCommand = new UpdateCommand({
                TableName: tagTableName,
                Key: {
                    'tagname': tagName,
                },
                UpdateExpression: 'SET gsi_sk = :newCount',
                ExpressionAttributeValues: {
                    ':newCount': queryResult.Items.length,
                }
            });

            await dynamoDb.send(updateCommand);
            continue;
        }

        if (queryResult.Items && queryResult.Items.length === 0) {
            console.log(`Deleting tagId: ${tagId}, tagName: ${tagName}`);

            // タグに紐づくテンプレートがない場合、タグを削除する
            const deleteCommand = new DeleteCommand({
                TableName: tagTableName,
                Key: {
                    'tagname': tagName,
                }
            });
            await dynamoDb.send(deleteCommand);
        } else if (queryResult.Items && queryResult.Items.length > 0) {
            // タグテーブルの templateCount (gsi_sk) を減らす
            const updateCommand = new UpdateCommand({
                TableName: tagTableName,
                Key: {
                    'tagname': tagName,
                },
                UpdateExpression: 'SET gsi_sk = :newCount',
                ExpressionAttributeValues: {
                    ':newCount': queryResult.Items.length,
                }
            });

            await dynamoDb.send(updateCommand);
        }
    }

    return true;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Log 出力
    console.log('Lambda event:' + JSON.stringify(event));

    try {
        // event から Request を生成する。
        const templateid = event.pathParameters?.templateId ? event.pathParameters.templateId : "";
        const success = await deleteTemplate(templateid);

        if (!success) {
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    message: 'Error delete template',
                }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: 'seccess deleted',
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};
