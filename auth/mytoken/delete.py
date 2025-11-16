# token/delete.py
import json
import os
from _utils import tokens_table


def lambda_handler(event, context):
    # Accept tokenId in body or Authorization header
    body = event.get("body")
    if isinstance(body, str):
        try:
            body = json.loads(body)
        except Exception:
            body = {}
    token_id = body.get("tokenId")
    # Check Authorization header as fallback
    headers = event.get("headers") or {}
    auth = headers.get("Authorization") or headers.get("authorization")
    if not token_id and auth:
        # If clients only give token value, we must look it up (inefficient). Prefer tokenId.
        # auth: "Bearer <token>"
        parts = auth.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token_value = parts[1]
            # find token record by scanning (could be optimized with a GSI token->id)
            resp = tokens_table.scan(
                FilterExpression="token = :t",
                ExpressionAttributeValues={":t": token_value},
            )
            items = resp.get("Items", [])
            if items:
                token_id = items[0]["id"]
    if not token_id:
        return {"statusCode": 400, "body": json.dumps({"message": "tokenId required"})}

    try:
        tokens_table.delete_item(Key={"id": token_id})
        return {"statusCode": 200, "body": json.dumps({"message": "logged out"})}
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
        }
