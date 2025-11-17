# user/delete.py
import json
from _utils import users_table, CORS_HEADERS
from hasPermission import has_permission


def lambda_handler(event, context):
    code = has_permission(event, context)
    if code != 200:
        return {
            "statusCode": code,
            "headers": CORS_HEADERS,
            "body": json.dumps({"message": "forbidden"}),
        }

    body = event.get("body")
    if isinstance(body, str):
        body = json.loads(body)
    tenant = body.get("tenant")
    user_id = body.get("id")
    if not tenant:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "tenant required"}),
            "headers": CORS_HEADERS,
        }
    if not user_id:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "id required"}),
            "headers": CORS_HEADERS,
        }
    try:
        users_table.delete_item(Key={"tenant": tenant, "id": user_id})
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "deleted"}),
            "headers": CORS_HEADERS,
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
            "headers": CORS_HEADERS,
        }
