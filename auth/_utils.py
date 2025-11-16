# _utils.py
import os
import hashlib
import binascii
import uuid
import time
import boto3
from typing import Tuple

USERS_TABLE = os.environ.get("USERS_TABLE", "UsersTable")
TOKENS_TABLE = os.environ.get("TOKENS_TABLE", "TokensTable")

dynamodb = boto3.resource("dynamodb")
users_table = dynamodb.Table(USERS_TABLE)
tokens_table = dynamodb.Table(TOKENS_TABLE)


# Password hashing using PBKDF2-HMAC-SHA256
def hash_password(password: str, salt: str = None) -> Tuple[str, str]:
    if salt is None:
        salt = uuid.uuid4().hex
    pwd = password.encode("utf-8")
    salt_b = salt.encode("utf-8")
    dk = hashlib.pbkdf2_hmac("sha256", pwd, salt_b, 200_000)
    hashed = binascii.hexlify(dk).decode()
    return hashed, salt


def verify_password(password: str, hashed: str, salt: str) -> bool:
    h, _ = hash_password(password, salt)
    return h == hashed


def now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def epoch_seconds_in(duration_seconds: int) -> int:
    return int(time.time()) + int(duration_seconds)


def get_user(tenant, id):
    resp = users_table.get_item(Key={"tenant": tenant, "id": id})
    item = resp.get("Item")
    if not item:
        return None
    return item


def split_token(token):
    return token.split("#")


def get_token(tenant, token):
    resp = tokens_table.get_item(Key={"tenant": tenant, "id": token})
    print(resp)
    item = resp.get("Item")
    print(item)
    if not item:
        return None
    return item


def get_token_data(token):
    tenant, _ = split_token(token)
    print(tenant, token)
    return get_token(tenant, id)
