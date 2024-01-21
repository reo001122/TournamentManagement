import json
import boto3

dynamodb = boto3.resource('dynamodb')
table_Pl = dynamodb.Table('TournamentManagement-Players')

def lambda_handler(event, context):
    key = {
        'player_name': event['player_name']
    }
    try:
        table_Pl.delete_item(Key=key)
        return {
            'statusCode': 200,
            'body': '名簿から削除しました'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': 'エラーが発生しました: {}'.format(str(e))
        }