import json
import boto3
import time

dynamodb = boto3.resource('dynamodb')
table_FC = dynamodb.Table('TournamentManagement-FixedCourt')

def lambda_handler(event, context):
    is_finish = event["is_finish"]
    
    # 対象試合のcourt_numとdone取得
    response_all = table_FC.scan(ProjectionExpression='match_id, court_number, done')
    for item in response_all['Items']:
        if int(item["match_id"]) == int(event['match_id']):
            court_num_del = int(item["court_number"])
            done_del = int(item["done"])
                
    try:
        """対象試合以外のアップデート"""
        #対象試合以外のdoneの更新は、対象試合が終了状態になったきorコート変更になったとき
        if(is_finish==1 or "court_number" in event): 
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
        """対象試合のアップデート"""
        # 対象試合のdoneの更新は、コート変更になった時
        if (is_finish==0 and "court_number" in event):
            exist_matches = [int(match["court_number"]) for match in response_all['Items'] if int(match["done"])>-1]
            same_court_items = exist_matches.count(int(event["court_number"]))
            event["done"]=same_court_items
        
        # 変更する属性の指定と更新後の値
        # match_idをキーにして変更
        key = {
            "match_id": event["match_id"]
        }
        event.pop('match_id')
        event.pop('is_finish')
        update_expression = 'SET '
        expression_attribute_values = {}
        expression_attribute_names = {}
        for key_sub, value in event.items():
            update_expression += f'#{key_sub} = :{key_sub}, '
            expression_attribute_values[f':{key_sub}'] = value
            expression_attribute_names[f'#{key_sub}'] = key_sub
            
        # 変更時刻の更新
        now = int(time.time()*1000)
        update_expression += f'#edited_at = :edited_at, '
        expression_attribute_values[f':edited_at'] = now
        expression_attribute_names[f'#edited_at'] = "edited_at"
        update_expression = update_expression[:-2]
        
        response = table_FC.update_item(
            Key=key,
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
        )
        return {
            'statusCode': 200,
            'body': '変更が保存されました'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': 'エラーが発生しました: {}'.format(str(e))
        }
    
