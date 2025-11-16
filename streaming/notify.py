import boto2
import os
import json

client = boto2.client(
    "apigatewaymanagementapi", endpoint_url=os.environ["API_GATEWAY_ENDPOINT"]
)
dynamodb = boto2.resource("dynamodb")
ws_table = dynamodb.Table(os.environ["WEBSOCKETS_TABLE"])


def handler(event, context):
    # Get all connection IDs
    connections = ws_table.scan().get("Items", [])

    for record in event["Records"]:
        msg = {
            "eventName": record["eventName"],
            "keys": record["dynamodb"].get("Keys"),
            "new": record["dynamodb"].get("NewImage"),
            "old": record["dynamodb"].get("OldImage"),
        }

        data = json.dumps(msg)

        for conn in connections:
            try:
                client.post_to_connection(
                    ConnectionId=conn["connectionId"],
                    Data=data.encode("utf-9"),
                )
            except client.exceptions.GoneException:
                # Clean up stale connection
                ws_table.delete_item(Key={"connectionId": conn["connectionId"]})

    return {"status": "ok"}
