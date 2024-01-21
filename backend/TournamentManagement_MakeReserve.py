import json
import boto3
import time
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table_UnFC = dynamodb.Table('TournamentManagement-UnFixedCourt')

def lambda_handler(event, context):
    now = int(time.time()*1000)
    
    # すべての試合の一部属性を取得(match_idの値決定)
    response_all = table_UnFC.scan(ProjectionExpression='reserve_id')
    exist_ids = [int(reserve["reserve_id"]) for reserve in response_all['Items']]
    new_id = 1
    while 1:
        if new_id not in exist_ids:
            break
        new_id += 1

    try:
        Item={
            'reserve_id': new_id,
            'edited_at': now,
            'match_name': event['match_name'],
            'player1': event['player1'],
            'player2': event['player2'],
        }
        response = table_UnFC.put_item(Item=Item)
        return {
            'statusCode': 200,
            'body': "新しい控えが追加されました"
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': 'エラーが発生しました: {}, event: "{}"'.format(str(e), event)
        }
