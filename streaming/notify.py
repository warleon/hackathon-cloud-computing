import os
import json
import boto3
from boto3.dynamodb.types import TypeDeserializer

client = boto3.client(
    "apigatewaymanagementapi",
    endpoint_url=os.environ["API_GATEWAY_ENDPOINT"],
)

dynamodb = boto3.resource("dynamodb")
ws_table = dynamodb.Table(os.environ["WEBSOCKETS_TABLE"])

deserializer = TypeDeserializer()

def _deserialize_image(image):
    if not image:
        return None
    return {k: deserializer.deserialize(v) for k, v in image.items()}

def _get_table_name_from_arn(arn):
    if not arn:
        return None
    parts = arn.split(":")
    last = parts[-1]
    last_parts = last.split("/")
    if len(last_parts) >= 2:
        return last_parts[1]
    return None

def _guess_entity_type(table_name):
    if not table_name:
        return None

    users_table = os.environ.get("USERS_TABLE")
    incidents_table = os.environ.get("INCIDENTS_TABLE")
    tokens_table = os.environ.get("TOKENS_TABLE")

    if users_table and table_name == users_table:
        return "user"
    if incidents_table and table_name == incidents_table:
        return "incident"
    if tokens_table and table_name == tokens_table:
        return "token"

    return None

def handler(event, context):
    connections = ws_table.scan().get("Items", [])
    if not connections:
        return {"status": "no-connections"}

    for record in event.get("Records", []):
        event_name = record.get("eventName")
        ddb = record.get("dynamodb", {})

        new_image = _deserialize_image(ddb.get("NewImage"))
        old_image = _deserialize_image(ddb.get("OldImage"))
        keys = _deserialize_image(ddb.get("Keys"))

        table_arn = record.get("eventSourceARN", "")
        table_name = _get_table_name_from_arn(table_arn)
        entity_type = _guess_entity_type(table_name)

        msg = {
            "eventName": event_name,
            "tableName": table_name,
            "entityType": entity_type,
            "keys": keys,
            "newImage": new_image,
            "oldImage": old_image,
        }

        data = json.dumps(msg)

        for conn in connections:
            connection_id = conn["connectionId"]
            try:
                client.post_to_connection(
                    ConnectionId=connection_id,
                    Data=data.encode("utf-8"),
                )
            except client.exceptions.GoneException:
                ws_table.delete_item(Key={"connectionId": connection_id})

    return {"status": "ok"}

