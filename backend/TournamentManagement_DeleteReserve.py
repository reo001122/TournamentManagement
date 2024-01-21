import json
import boto3

dynamodb = boto3.resource('dynamodb')
table_UnFC = dynamodb.Table('TournamentManagement-UnFixedCourt')

def lambda_handler(event, context):
    key = {
        'reserve_id': event['reserve_id']
    }
    try:
        table_UnFC.delete_item(Key=key)
        return {
            'statusCode': 200,
            'body': 'その控えを削除しました'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': 'エラーが発生しました: {}'.format(str(e))
        }
