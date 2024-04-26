import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import {
    Handler,
    CdkCustomResourceEvent,
    CdkCustomResourceResponse,
    Context,
} from 'aws-lambda';

export const handler: Handler = async (event: any, context: Context,) => {
    // Log 出力
    console.log('Lambda is invoked with:' + JSON.stringify(event));

    const client = new DynamoDBClient({});
    const ddbDocClient = DynamoDBDocumentClient.from(client);
    const tableName = process.env.TABLE_NAME;
    const items = [
        { tagname: 'ガーメントグループ', tagid: '00000000-0000-0000-0000-000000000004', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: '素材開発／販売グループ', tagid: '00000000-0000-0000-0000-000000000005', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: 'グローバルブランドグループ', tagid: '00000000-0000-0000-0000-000000000006', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: 'マテリアルグループ', tagid: '00000000-0000-0000-0000-000000000007', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: 'ライフスタイルグループ', tagid: '00000000-0000-0000-0000-000000000008', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: '経営企画セクション', tagid: '00000000-0000-0000-0000-000000000009', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: '物流セクション', tagid: '00000000-0000-0000-0000-000000000010', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: '業務監査セクション', tagid: '00000000-0000-0000-0000-000000000011', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: '法務・コンプライアンスセクション', tagid: '00000000-0000-0000-0000-000000000012', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: 'システムセクション', tagid: '00000000-0000-0000-0000-000000000013', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: '人材開発セクション', tagid: '00000000-0000-0000-0000-000000000014', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: '総務セクション', tagid: '00000000-0000-0000-0000-000000000015', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: '経理セクション', tagid: '00000000-0000-0000-0000-000000000016', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: '広報・IRセクション', tagid: '00000000-0000-0000-0000-000000000017', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: '営業サポートセクション', tagid: '00000000-0000-0000-0000-000000000018', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: 'QC管理グループ', tagid: '00000000-0000-0000-0000-000000000019', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: '営業マネジメント', tagid: '00000000-0000-0000-0000-000000000020', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: 'スタッフマネジメント', tagid: '00000000-0000-0000-0000-000000000021', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: '企画（MD）', tagid: '00000000-0000-0000-0000-000000000022', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: 'デザイナー', tagid: '00000000-0000-0000-0000-000000000023', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: '生産', tagid: '00000000-0000-0000-0000-000000000024', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: 'DB', tagid: '00000000-0000-0000-0000-000000000025', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: '販売（営業）', tagid: '00000000-0000-0000-0000-000000000026', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: 'EC', tagid: '00000000-0000-0000-0000-000000000027', gsi_pk: 'templateCount', gsi_sk: 0 },
        { tagname: 'エンジニア', tagid: '00000000-0000-0000-0000-000000000028', gsi_pk: 'templateCount', gsi_sk: 0 }
    ];

    for (const item of items) {
        await ddbDocClient.send(new PutCommand({ TableName: tableName, Item: item }));
    }
};


// CDK でカスタムリソースを定義した場合の関数 (動かなかったもの)
// export const handler: Handler = async (event: CdkCustomResourceEvent, context: Context,): Promise<CdkCustomResourceResponse> => {
//     // Log 出力
//     console.log('Lambda is invoked with:' + JSON.stringify(event));

//     // CustomResource 用のレスポンス構造体を宣言
//     const response: CdkCustomResourceResponse = {
//         StackId: event.StackId,
//         RequestId: event.RequestId,
//         LogicalResourceId: event.LogicalResourceId,
//         PhysicalResourceId: context.logGroupName,
//     };

//     if (event.RequestType == 'Delete') {
//         response.Status = 'SUCCESS';
//         response.Data = { Result: 'None' };
//         return response;
//     }

//     try {
//         const client = new DynamoDBClient({});
//         const ddbDocClient = DynamoDBDocumentClient.from(client);
//         const tableName = process.env.TABLE_NAME;
//         const items = [
//             { name: 'デザイナー', tagid: '00000000-0000-0000-0000-000000000001' },
//             { name: '営業', tagid: '00000000-0000-0000-0000-000000000002' },
//             { name: 'マーチャンダイザー', tagid: '00000000-0000-0000-0000-000000000003' },
//         ];

//         for (const item of items) {
//             await ddbDocClient.send(new PutCommand({ TableName: tableName, Item: item }));
//         }

//         response.Status = 'SUCCESS';
//         response.Data = { Result: 'SUCCESS' };

//         console.log('Lambda response:' + JSON.stringify(response));

//         return response;
//     } catch (error) {
//         if (error instanceof Error) {
//             response.Reason = error.message;
//         }
//         response.Status = 'FAILED';
//         response.Data = { Result: error };

//         console.log('Lambda response:' + JSON.stringify(response));
//         return response;
//     }
// };
