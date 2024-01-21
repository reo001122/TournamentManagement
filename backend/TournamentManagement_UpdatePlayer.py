import json
import boto3
import time

dynamodb = boto3.resource('dynamodb')
table_Pl = dynamodb.Table('TournamentManagement-Players')

def lambda_handler(event, context):
    key = {
        "player_name": event["player_name"]
    }
    
    try:
        update_expression = 'SET #grade = :grade'
        expression_attribute_values = {':grade': event["grade"]}
        expression_attribute_names = {'#grade': "grade"}
        
        response = table_Pl.update_item(
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