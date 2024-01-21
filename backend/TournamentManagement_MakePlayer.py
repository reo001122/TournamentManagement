import json
import boto3

dynamodb = boto3.resource('dynamodb')
table_Pl = dynamodb.Table('TournamentManagement-Players')

def lambda_handler(event, context):
    item = {
        'player_name': event["player_name"]
    }
    if "grade" in event:
        item['grade'] = event['grade']
    else:
        item['grade'] = 0
        
    try:
        response = table_Pl.put_item(
            Item=item,
            ConditionExpression="attribute_not_exists(player_name)"
        )
        return {
            'statusCode': 200,
            'body': '名簿に追加しました'
        }
    except Exception as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            return {
                'statusCode': 500,
                'body': 'すでに名簿に存在します'
            }
        else:
            return {
                'statusCode': 500,
                'body': 'エラーが発生しました: {}'.format(str(e))
            }