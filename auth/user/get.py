# user/get.py
import json
from _utils import users_table, get_user


def lambda_handler(event, context):
    tenant = event["tenant"]
    user_id = event["id"]
    if not tenant:
        return {"statusCode": 400, "body": json.dumps({"message": "tenant required"})}
    if not user_id:
        return {"statusCode": 400, "body": json.dumps({"message": "id required"})}
    try:
        user = get_user(
            tenant,
            user_id,
        )
        if not user:
            return {"statusCode": 404, "body": json.dumps({"message": "not found"})}
        return {"statusCode": 200, "body": json.dumps(user)}
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
        }
