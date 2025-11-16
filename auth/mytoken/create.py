# token/create.py
import json
import os
import uuid
from _utils import (
    users_table,
    tokens_table,
    verify_password,
    epoch_seconds_in,
    CORS_HEADERS,
)

DEFAULT_TTL_SECONDS = int(
    os.environ.get("TOKEN_TTL_SECONDS", 60 * 60 * 24 * 7)
)  # 7 days


def lambda_handler(event, context):
    body = event.get("body")
    if isinstance(body, str):
        body = json.loads(body)
    tenant = body["tenant"]
    email = body["email"]
    password = body["password"]
    ttl = body.get("ttlSeconds", DEFAULT_TTL_SECONDS)

    if not tenant or not email or not password:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "tenant, email and password required"}),
            "headers": CORS_HEADERS,
        }

    # Retrieve user by id (we store id==email)
    # If you had tenant+email composite key you'd query; here we will get by PK email and check tenant.
    try:
        resp = users_table.get_item(Key={"tenant": tenant, "id": email})
        user = resp["Item"]
        if "passwordHash" not in user or "salt" not in user:
            return {
                "statusCode": 401,
                "body": json.dumps({"message": "invalid credentials"}),
                "headers": CORS_HEADERS,
            }

        if not verify_password(password, user["passwordHash"], user["salt"]):
            return {
                "statusCode": 401,
                "body": json.dumps({"message": "invalid credentials"}),
                "headers": CORS_HEADERS,
            }

        token_value = uuid.uuid4()  # opaque token given to client
        token_id = f"{tenant}#{token_value.hex}"
        token_value = token_value.hex
        expires_epoch = epoch_seconds_in(ttl)

        token_item = {
            "id": token_id,
            "token": token_value,
            "tenant": tenant,
            "userId": user["id"],
            "user": user,
            "expiresAt": expires_epoch,  # use as TTL attribute
        }

        tokens_table.put_item(Item=token_item)

        result = {
            "tenant": tenant,
            "token": token_value,
            "tokenId": token_id,
            "expiresAt": expires_epoch,
            "user": {
                k: v for k, v in user.items() if k != "passwordHash" and k != "salt"
            },
        }
        return {
            "statusCode": 200,
            "body": json.dumps(result),
            "headers": CORS_HEADERS,
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
            "headers": CORS_HEADERS,
        }
