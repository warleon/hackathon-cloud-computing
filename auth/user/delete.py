# user/delete.py
import json
from _utils import users_table


def lambda_handler(event, context):
    body = event.get("body")
    if isinstance(body, str):
        body = json.loads(body)
    user_id = body["id"]
    if not user_id:
        return {"statusCode": 400, "body": json.dumps({"message": "id required"})}
    try:
        users_table.delete_item(Key={"id": user_id})
        return {"statusCode": 200, "body": json.dumps({"message": "deleted"})}
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
        }
