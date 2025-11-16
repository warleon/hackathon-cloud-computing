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
        "incidents": {"view": True, "create": True, "update": False, "delete": False},
    },
    "user": {"tokens": {"delete": True}},
}

ARN_ACTION = {"POST/auth/token/delete": ("tokens", "delete")}


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

    arn_end = arn.split(STAGE, 1)[1]
    resource, action = ARN_ACTION[arn_end]

    data = get_token_data(token)
    allowed = has_permission(data.get("user"), resource, action)

    if allowed:
        return generate_policy(token, "Allow", arn)

    raise Exception("Unauthorized")


def generate_policy(principal_id, effect, resource):
    """
    Generates an IAM policy document for API Gateway.
    """
    auth_response = {}
    auth_response["principalId"] = principal_id

    if effect and resource:
        policy_document = {
            "Version": "2012-10-17",
            "Statement": [
                {"Action": "execute-api:Invoke", "Effect": effect, "Resource": resource}
            ],
        }
        auth_response["policyDocument"] = policy_document

    return auth_response
