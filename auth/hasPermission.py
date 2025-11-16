# hasPermission.py
from typing import Dict, Any, Callable, Optional
from _utils import get_token_data
import os

Action = str  # "view" | "create" | "update" | "delete"
Role = str  # "reporter" | "admin" | "attendant"
Incident = Dict[str, Any]
User = Dict[str, Any]

STAGE = os.environ.get("STAGE", "")

PermissionCheck = Callable[[User, Any], bool]


# ROLES mapping: similar to TS version
def _creator_matches(user: User, data: Any) -> bool:
    return user.get("id") == data.get("creator")


ROLES = {
    "admin": {
        "users": {"view": True, "create": True, "update": True, "delete": True},
        "incidents": {"view": True, "create": True, "update": True, "delete": True},
    },
    "attendant": {
        # "users": {"view": True, "create": False, "update": False, "delete": False},
        "incidents": {"view": True, "create": False, "update": True, "delete": False},
    },
    "reporter": {
        # "users": {"view": False, "create": False, "update": False, "delete": False},
        "incidents": {
            "view": True,
            "create": True,
            "update": _creator_matches,
            "delete": _creator_matches,
        },
    },
    "user": {"tokens": {"delete": True}},
}

ARN_ACTION = {"POST/auth/token/delete": "tokens:delete"}


def has_permission(
    user: User, resource: str, action: str, data: Optional[Dict] = None
) -> bool:
    """
    Returns True if the user has permission to perform `action` on `resource`.
    `user` is expected to have a 'roles' field that's a list of role names.
    """
    roles = user.get("roles", [])
    for role in roles:
        role_cfg = ROLES.get(role)
        if not role_cfg:
            continue
        res_cfg = role_cfg.get(resource)
        if not res_cfg:
            continue
        permission = res_cfg.get(action)
        if permission is None:
            continue
        if isinstance(permission, bool):
            if permission:
                return True
            else:
                continue
        # callable permission
        if callable(permission):
            if data is None:
                # data required for callable permission checks
                continue
            try:
                if permission(user, data):
                    return True
            except Exception:
                continue
    return False


def lambda_handler(event, context):
    print(event)
    token = event.get("authorizationToken")
    arn = event.get("methodArn")

    token_prefix = "Bearer "
    if token.startswith(token_prefix):
        token = token[len(token_prefix) :]

    action = arn.split(STAGE, 1)[1]

    data = get_token_data(token)
    allowed = has_permission(
        data.get("user"),
        action,
    )

    if allowed:
        allow()


def allow(principal_id, resource):
    return generate_policy(principal_id, "Allow", resource)


def deny(principal_id):
    return generate_policy(principal_id, "Deny", principal_id)


def generate_policy(principal_id, effect, resource):
    return {
        "principalId": principal_id,
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {"Action": "execute-api:Invoke", "Effect": effect, "Resource": resource}
            ],
        },
    }
