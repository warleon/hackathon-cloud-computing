# user/seed.py
import json
import os
import secrets
import string
from _utils import users_table, hash_password, now_iso


def random_string(length=10):
    alphabet = string.ascii_lowercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def generate_password(length=16):
    # strong random password
    alphabet = (
        string.ascii_lowercase
        + string.ascii_uppercase
        + string.digits
        + "!@#$%^&*()_-+=[]{}"
    )
    return "".join(secrets.choice(alphabet) for _ in range(length))


def lambda_handler(event, context):
    body = event.get("body")
    if isinstance(body, str):
        body = json.loads(body)

    tenant = body.get("tenant")
    email_suffix = body.get("emailSuffix")

    if not tenant or not email_suffix:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "tenant and emailSuffix required"}),
        }

    # Generate random email
    local_part = random_string(10)
    email = f"{local_part}@{email_suffix}"

    # Generate random password
    password = generate_password()

    # Hash
    password_hash, salt = hash_password(password)
    now = now_iso()

    user_item = {
        "id": email,
        "tenant": tenant,
        "email": email,
        "passwordHash": password_hash,
        "salt": salt,
        "roles": ["admin"],
        "createdAt": now,
        "updatedAt": now,
    }

    try:
        users_table.put_item(
            Item=user_item, ConditionExpression="attribute_not_exists(id)"
        )

        # return the credentials so the tenant admin can log in
        return {
            "statusCode": 201,
            "body": json.dumps({"email": email, "password": password}),
        }

    except Exception as e:
        return {
            "statusCode": 400,
            "body": json.dumps(
                {
                    "message": "could not seed user",
                    "error": str(e),
                }
            ),
        }
