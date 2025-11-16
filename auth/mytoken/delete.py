# token/delete.py
import json
import os
from _utils import tokens_table, split_token


def lambda_handler(event, context):
    token = event.get("token")
    if not token:
        return {"statusCode": 400, "body": json.dumps({"message": "token required"})}
    tenant, _ = split_token(token)

    try:
        tokens_table.delete_item(Key={"tenant": tenant, "id": token})
        return {"statusCode": 200, "body": json.dumps({"message": "logged out"})}
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
        }
