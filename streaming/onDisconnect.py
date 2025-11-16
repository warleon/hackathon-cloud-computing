import os
import boto3

dynamodb = boto3.resource("dynamodb")
ws_table = dynamodb.Table(os.environ["WEBSOCKETS_TABLE"])

def handler(event, context):
    connection_id = event["requestContext"]["connectionId"]

    ws_table.delete_item(
        Key={"connectionId": connection_id}
    )

    return {
        "statusCode": 200,
        "body": "Disconnected",
    }
