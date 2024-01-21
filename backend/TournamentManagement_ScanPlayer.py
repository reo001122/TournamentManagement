import json
import boto3
from decimal import Decimal
import re

dynamodb = boto3.resource('dynamodb')
table_FC = dynamodb.Table('TournamentManagement-FixedCourt')
table_UnFC = dynamodb.Table('TournamentManagement-UnFixedCourt')
table_Pl = dynamodb.Table('TournamentManagement-Players')

def lambda_handler(event, context):
    
    response_FC = table_FC.scan(ProjectionExpression='player1, player2, umpire')
    response_UnFC = table_UnFC.scan(ProjectionExpression='player1, player2')
    response_Pl = table_Pl.scan(ProjectionExpression='player_name')
    items_FC = response_FC["Items"]
    items_UnFC = response_UnFC["Items"]
    items_Pl = response_Pl["Items"]

    
    people = []
    
    # 各テーブルの試合ごとにチェック
    for item in items_FC:
        # 各試合のplayer1, player2をチェック
        player1 = [s for s in re.split('[-+#、,.。/　 _~|・]', item['player1']) if s]
        player2 = [s for s in re.split('[-+#、,.。/　 _~|・]', item['player2']) if s]
        umpire = [s for s in re.split('[-+#、,.。/　 _~|・]', item['umpire']) if s]
        for person in player1+player2+umpire:
            person = person.replace("さん", "").replace("なし", "").replace("未定", "").replace("（", "(").replace("）", ")")
            if person not in people:
                people.append(person)
                
    for item in items_UnFC:
        # 各試合のplayer1, player2をチェック
        player1 = [s for s in re.split('[-+#、,.。/　 _~|・]', item['player1']) if s]
        player2 = [s for s in re.split('[-+#、,.。/　 _~|・]', item['player2']) if s]
        for person in player1+player2:
            person = person.replace("さん", "").replace("なし", "").replace("未定", "").replace("（", "(").replace("）", ")")
            if person not in people:
                people.append(person)
    
    exist_people = []
    for item in items_Pl:
        exist_people.append(item["player_name"])
    
    try:
        for person in people:
            if (person not in exist_people) and len(person)>0:
                item={
                    'player_name': person,
                    'grade': 0
                }
                response = table_Pl.put_item(
                    Item=item,
                )
    except Exception as e:
        return {
            'statusCode': 500,
            'body': 'エラーが発生しました: {}'.format(str(e))
        }
    
    return {
        'statusCode': 200,
        'body': "成功しました"
    }
