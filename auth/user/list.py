# user/list.py
import json
from _utils import users_table
from boto3.dynamodb.conditions import Attr


def lambda_handler(event, context):
    params = event.get("queryStringParameters") or {}
    tenant = params.get("tenant")
    if not tenant:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "tenant query param required"}),
        }
    try:
        resp = users_table.scan(FilterExpression=Attr("tenant").eq(tenant))
        items = resp.get("Items", [])
        safe = [
            {k: v for k, v in it.items() if k not in ("passwordHash", "salt")}
            for it in items
        ]
        return {"statusCode": 200, "body": json.dumps(safe)}
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
        }
