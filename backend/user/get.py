# user/get.py
import json
from _utils import users_table, get_user, CORS_HEADERS


def lambda_handler(event, context):
    body = event.get("body")
    if isinstance(body, str):
        body = json.loads(body)
    tenant = body["tenant"]
    user_id = body["id"]
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
        user = get_user(
            tenant,
            user_id,
        )
        if not user:
            return {
                "statusCode": 404,
                "body": json.dumps({"message": "not found"}),
                "headers": CORS_HEADERS,
            }
        return {"statusCode": 200, "body": json.dumps(user), "headers": CORS_HEADERS}
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
            "headers": CORS_HEADERS,
        }
