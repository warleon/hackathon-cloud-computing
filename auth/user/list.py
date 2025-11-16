# user/list.py
import json
from _utils import users_table
from boto3.dynamodb.conditions import Attr


def lambda_handler(event, context):
    body = event.get("body")
    if isinstance(body, str):
        body = json.loads(body)
    tenant = body["tenant"]
    if not tenant:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "tenant query param required"}),
        }
    try:
        resp = users_table.scan(FilterExpression=Attr("tenant").eq(tenant))
        items = resp.get("Items", [])
        return {"statusCode": 200, "body": json.dumps(items)}
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
        }
