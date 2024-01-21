import json
import boto3
import time
from boto3.dynamodb.conditions import Key
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table_FC = dynamodb.Table('TournamentManagement-FixedCourt')


def lambda_handler(event, context):
    now = int(time.time()*1000)
    
    # すべての試合の一部属性を取得(match_idの値決定)
    response_all = table_FC.scan(ProjectionExpression='match_id, court_number, done')
    exist_ids = [int(match["match_id"]) for match in response_all['Items']]
    new_id = 1
    while 1:
        if new_id not in exist_ids:
            break
        new_id += 1
    
    # 同じコートの試合の数を取得(doneの値決定)
    exist_matches = [int(match["court_number"]) for match in response_all['Items'] if int(match["done"])>-1]
    same_court_items = exist_matches.count(int(event["court_number"]))

    try:
        Item={
            'match_id': new_id,
            'court_number': event['court_number'],
            'done': same_court_items,
            'edited_at': now,
            'match_name': event['match_name'],
            'player1': event['player1'],
            'player2': event['player2'],
            'umpire': event['umpire'],
            'score1': '0',
            'score2': '0'
        }
        response = table_FC.put_item(Item=Item)
        return {
            'statusCode': 200,
            'body': "新しい試合が追加されました"
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': 'エラーが発生しました: {}, event: "{}"'.format(str(e), event)
        }
