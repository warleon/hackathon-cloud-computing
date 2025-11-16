import os
import boto3

dynamodb = boto3.resource("dynamodb")
ws_table = dynamodb.Table(os.environ["WEBSOCKETS_TABLE"])

def handler(event, context):
    connection_id = event["requestContext"]["connectionId"]
    query = event.get("queryStringParameters") or {}

    item = {"connectionId": connection_id}

    if "userId" in query:
        item["userId"] = query["userId"]
    if "tenantId" in query:
        item["tenantId"] = query["tenantId"]

    ws_table.put_item(Item=item)

    return {
        "statusCode": 200,
        "body": "Connected",
    }
