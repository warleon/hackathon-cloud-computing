# user/update.py
import json
from _utils import (
    users_table,
    hash_password,
    now_iso,
    CORS_HEADERS,
    VALID_USER_STATUSES,
    build_user_search_key,
)
from hasPermission import has_permission


def lambda_handler(event, context):
    if not has_permission(event, context):
        return {
            "statusCode": 403,
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

    current_resp = users_table.get_item(Key={"tenant": tenant, "id": user_id})
    current = current_resp.get("Item")
    if not current:
        return {
            "statusCode": 404,
            "body": json.dumps({"message": "user not found"}),
            "headers": CORS_HEADERS,
        }

    update_expr = []
    expr_attr_vals = {}
    expr_attr_names = {}

    if "roles" in body:
        update_expr.append("#r = :r")
        expr_attr_vals[":r"] = body["roles"]
        expr_attr_names["#r"] = "roles"
    if "password" in body and body["password"]:
        password_hash, salt = hash_password(body["password"])
        update_expr.append("passwordHash = :ph")
        update_expr.append("salt = :s")
        expr_attr_vals[":ph"] = password_hash
        expr_attr_vals[":s"] = salt
    if "fullName" in body:
        update_expr.append("#fn = :fn")
        expr_attr_vals[":fn"] = body["fullName"]
        expr_attr_names["#fn"] = "fullName"
    if "phone" in body:
        update_expr.append("#phn = :phone")
        expr_attr_vals[":phone"] = body["phone"]
        expr_attr_names["#phn"] = "phone"
    if "notes" in body:
        update_expr.append("#notes = :notes")
        expr_attr_vals[":notes"] = body["notes"]
        expr_attr_names["#notes"] = "notes"
    status = None
    if "status" in body:
        status = (body["status"] or "").upper()
        if status not in VALID_USER_STATUSES:
            return {
                "statusCode": 400,
                "body": json.dumps(
                    {"message": f"status must be one of {sorted(VALID_USER_STATUSES)}"}
                ),
                "headers": CORS_HEADERS,
            }
        update_expr.append("status = :status")
        expr_attr_vals[":status"] = status
    else:
        status = current.get("status", "ACTIVE")

    update_expr.append("updatedAt = :u")
    expr_attr_vals[":u"] = now_iso()

    if not update_expr:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "no updatable fields provided"}),
            "headers": CORS_HEADERS,
        }

    resulting_full_name = (
        body["fullName"] if "fullName" in body else current.get("fullName", "")
    )
    resulting_roles = body["roles"] if "roles" in body else current.get("roles", [])
    resulting_status = status or current.get("status", "ACTIVE")
    expr_attr_vals[":searchKey"] = build_user_search_key(
        resulting_full_name, current["email"], resulting_roles, resulting_status
    )
    update_expr.append("searchKey = :searchKey")

    update_expression = "SET " + ", ".join(update_expr)
    try:
        users_table.update_item(
            Key={"tenant": tenant, "id": user_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expr_attr_vals,
            ExpressionAttributeNames=expr_attr_names if expr_attr_names else None,
        )
        resp = users_table.get_item(Key={"tenant": tenant, "id": user_id})
        item = resp.get("Item")
        return {
            "statusCode": 200,
            "body": json.dumps(item),
            "headers": CORS_HEADERS,
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
            "headers": CORS_HEADERS,
        }
