# user/create.py
import json
import os
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
    tenant = body["tenant"]
    email = body["email"]
    password = body["password"]
    roles = body.get("roles") or []
    full_name = body.get("fullName", "")
    phone = body.get("phone", "")
    notes = body.get("notes", "")
    status = (body.get("status") or "ACTIVE").upper()
    if status not in VALID_USER_STATUSES:
        return {
            "statusCode": 400,
            "body": json.dumps(
                {"message": f"status must be one of {sorted(VALID_USER_STATUSES)}"}
            ),
            "headers": CORS_HEADERS,
        }

    if not tenant or not email or not password:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "tenant, email and password required"}),
            "headers": CORS_HEADERS,
        }

    user_id = email  # as in your TS, id is duplicate of email
    password_hash, salt = hash_password(password)
    now = now_iso()

    user_item = {
        "id": user_id,
        "tenant": tenant,
        "email": email,
        "passwordHash": password_hash,
        "salt": salt,
        "roles": roles,
        "fullName": full_name,
        "phone": phone,
        "notes": notes,
        "status": status,
        "createdAt": now,
        "updatedAt": now,
        "searchKey": build_user_search_key(full_name, email, roles, status),
    }

    try:
        users_table.put_item(
            Item=user_item, ConditionExpression="attribute_not_exists(id)"
        )
        # don't include passwordHash/salt in response
        return {
            "statusCode": 201,
            "body": json.dumps(user_item),
            "headers": CORS_HEADERS,
        }
    except Exception as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "could not create user", "error": str(e)}),
            "headers": CORS_HEADERS,
        }
