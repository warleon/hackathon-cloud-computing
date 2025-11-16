# user/update.py
import json
from _utils import users_table, hash_password, now_iso, CORS_HEADERS


def lambda_handler(event, context):
    body = event.get("body")
    if isinstance(body, str):
        body = json.loads(body)
    user_id = body.get("id")
    if not user_id:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "id required"}),
            "headers": CORS_HEADERS,
        }

    update_expr = []
    expr_attr_vals = {}
    expr_attr_names = {}

    if "roles" in body:
        update_expr.append("#r = :r")
        expr_attr_vals[":r"] = body["roles"]
        expr_attr_names["#r"] = "roles"
    if "password" in body:
        password_hash, salt = hash_password(body["password"])
        update_expr.append("passwordHash = :ph")
        update_expr.append("salt = :s")
        expr_attr_vals[":ph"] = password_hash
        expr_attr_vals[":s"] = salt
    # other updatable fields (e.g., location) can be added similarly
    update_expr.append("updatedAt = :u")
    expr_attr_vals[":u"] = now_iso()

    if not update_expr:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "no updatable fields provided"}),
            "headers": CORS_HEADERS,
        }

    update_expression = "SET " + ", ".join(update_expr)
    try:
        users_table.update_item(
            Key={"id": user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expr_attr_vals,
            ExpressionAttributeNames=expr_attr_names if expr_attr_names else None,
            ReturnValues="ALL_NEW",
        )
        resp = users_table.get_item(Key={"id": user_id})
        item = resp.get("Item")
        safe_user = {k: v for k, v in item.items() if k not in ("passwordHash", "salt")}
        return {"statusCode": 200, "body": json.dumps(safe_user), "headers": CORS_HEADERS}
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
            "headers": CORS_HEADERS,
        }
