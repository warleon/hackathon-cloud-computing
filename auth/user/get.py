# user/get.py
import json
from _utils import users_table


def lambda_handler(event, context):
    user_id = None
    path_params = event.get("pathParameters") or {}
    user_id = path_params.get("id") or (event.get("queryStringParameters") or {}).get(
        "id"
    )
    if not user_id:
        return {"statusCode": 400, "body": json.dumps({"message": "id required"})}
    try:
        resp = users_table.get_item(Key={"id": user_id})
        item = resp.get("Item")
        if not item:
            return {"statusCode": 404, "body": json.dumps({"message": "not found"})}
        safe_user = {k: v for k, v in item.items() if k not in ("passwordHash", "salt")}
        return {"statusCode": 200, "body": json.dumps(safe_user)}
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
        }
