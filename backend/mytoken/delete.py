# token/delete.py
import json
import os
from _utils import tokens_table, split_token, CORS_HEADERS


def lambda_handler(event, context):
    print(event)
    body = event.get("body")
    if isinstance(body, str):
        body = json.loads(body)
    token = body.get("token")
    if not token:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "token required"}),
            "headers": CORS_HEADERS,
        }
    tenant, _ = split_token(token)

    try:
        tokens_table.delete_item(Key={"tenant": tenant, "id": token})
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "logged out"}),
            "headers": CORS_HEADERS,
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
            "headers": CORS_HEADERS,
        }
