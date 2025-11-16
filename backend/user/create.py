# user/create.py
import json
import os
from _utils import users_table, hash_password, now_iso, CORS_HEADERS


def lambda_handler(event, context):
    body = event.get("body")
    if isinstance(body, str):
        body = json.loads(body)
    tenant = body["tenant"]
    email = body["email"]
    password = body["password"]
    roles = body["roles"] if body["roles"] else []

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
        "createdAt": now,
        "updatedAt": now,
    }

    try:
        users_table.put_item(
            Item=user_item, ConditionExpression="attribute_not_exists(id)"
        )
        # don't include passwordHash/salt in response
        safe_user = {
            k: v for k, v in user_item.items() if k not in ("passwordHash", "salt")
        }
        return {"statusCode": 201, "body": json.dumps(safe_user), "headers": CORS_HEADERS}
    except Exception as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "could not create user", "error": str(e)}),
            "headers": CORS_HEADERS,
        }
