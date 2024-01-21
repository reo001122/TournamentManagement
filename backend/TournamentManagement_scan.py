import json
import boto3
from decimal import Decimal

#Decimal->float,int変換用の関数を作成
def decimal_to_num(obj):
    if isinstance(obj, Decimal):
        return int(obj) if float(obj).is_integer() else float(obj)

dynamodb = boto3.resource('dynamodb')
table_FC = dynamodb.Table('TournamentManagement-FixedCourt')
table_UnFC = dynamodb.Table('TournamentManagement-UnFixedCourt')
table_Pl = dynamodb.Table('TournamentManagement-Players')

def lambda_handler(event, context):
    
    # write name and time to the DynamoDB table using the object we instantiated and save response in a variable
    response_FC = table_FC.scan()
    response_UnFC = table_UnFC.scan()
    response_Pl = table_Pl.scan()
    items_FC = response_FC["Items"]
    items_UnFC = response_UnFC["Items"]
    items_Pl = response_Pl["Items"]
    
    body = {
        "items_FC": items_FC,
        "items_UnFC": items_UnFC,
        "items_Pl": items_Pl
    }
    # return a properly formatted JSON object
    return {
        'statusCode': 200,
        'body': json.dumps(body, ensure_ascii=False, default=decimal_to_num)
    }
