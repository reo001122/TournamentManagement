import json
import boto3

dynamodb = boto3.resource('dynamodb')
table_FC = dynamodb.Table('TournamentManagement-FixedCourt')

def lambda_handler(event, context):
    response_all = table_FC.scan(ProjectionExpression='match_id, court_number, done')
    for item in response_all['Items']:
        if int(item["match_id"]) == int(event['match_id']):
            court_num_del = int(item["court_number"])
            done_del = int(item["done"])
    
    try:
        if(done_del>-1):
            # 同一コートの削除した試合より後にある試合のdone減らす
            changing_matches = [[int(match["match_id"]), int(match["done"])] for match in response_all["Items"]
            if int(match["done"])>done_del and int(match["court_number"])==court_num_del]
            for changing_match in changing_matches:
                update_expression = 'add #done :done'
                expression_attribute_values = {":done": -1}
                expression_attribute_names = {"#done": "done",}
                # match_idをキーにして変更
                key = {
                    "match_id": changing_match[0]
                }
                table_FC.update_item(
                    Key=key,
                    UpdateExpression=update_expression,
                    ExpressionAttributeNames=expression_attribute_names,
                    ExpressionAttributeValues=expression_attribute_values,
                )
        
        #対象試合の削除
        key = {
            'match_id': event['match_id']
        }
        table_FC.delete_item(Key=key)
        return {
            'statusCode': 200,
            'body': 'その試合を削除しました'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': 'エラーが発生しました: {}'.format(str(e))
        }