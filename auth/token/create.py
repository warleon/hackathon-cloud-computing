# token/create.py
import json
import os
import uuid
from _utils import (
    users_table,
    tokens_table,
    hash_password,
    verify_password,
    now_iso,
    epoch_seconds_in,
)
from boto3.dynamodb.conditions import Key

DEFAULT_TTL_SECONDS = int(
    os.environ.get("TOKEN_TTL_SECONDS", 60 * 60 * 24 * 7)
)  # 7 days


def lambda_handler(event, context):
    body = event.get("body")
    if isinstance(body, str):
        body = json.loads(body)
    tenant = body.get("tenant")
    email = body.get("email")
    password = body.get("password")
    ttl = body.get("ttlSeconds", DEFAULT_TTL_SECONDS)

    if not tenant or not email or not password:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "tenant, email and password required"}),
        }

    # Retrieve user by id (we store id==email)
    # If you had tenant+email composite key you'd query; here we will get by PK email and check tenant.
    try:
        resp = users_table.get_item(Key={"id": email})
        user = resp.get("Item")
        if not user or user.get("tenant") != tenant:
            return {
                "statusCode": 401,
                "body": json.dumps({"message": "invalid credentials"}),
            }

        if "passwordHash" not in user or "salt" not in user:
            return {
                "statusCode": 401,
                "body": json.dumps({"message": "invalid credentials"}),
            }

        if not verify_password(password, user["passwordHash"], user["salt"]):
            return {
                "statusCode": 401,
                "body": json.dumps({"message": "invalid credentials"}),
            }

        token_id = f"{user['id']}#{uuid.uuid4().hex}"
        token_value = uuid.uuid4().hex  # opaque token given to client
        expires_epoch = epoch_seconds_in(ttl)
        expires_iso = now_iso()

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
            "token": token_value,
            "tokenId": token_id,
            "expiresAt": expires_epoch,
            "user": {
                k: v for k, v in user.items() if k != "passwordHash" and k != "salt"
            },
        }
        return {"statusCode": 200, "body": json.dumps(result)}
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
        }
