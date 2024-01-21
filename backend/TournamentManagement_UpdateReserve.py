import json
import boto3
import time

dynamodb = boto3.resource('dynamodb')
table_UnFC = dynamodb.Table('TournamentManagement-UnFixedCourt')

def lambda_handler(event, context):
    # match_idをキーにして変更
    key = {
        "reserve_id": event["reserve_id"]
    }
    event.pop('reserve_id')
    
    try:
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
    
        
        response = table_UnFC.update_item(
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
    

