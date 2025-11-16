# user/list.py
import json
from typing import Any, Dict

from boto3.dynamodb.conditions import Attr

from _utils import CORS_HEADERS, users_table


def lambda_handler(event, context):
    body = event.get("body")
    if isinstance(body, str):
        body = json.loads(body)
    tenant = body["tenant"]
    if not tenant:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "tenant query param required"}),
            "headers": CORS_HEADERS,
        }

    search = (body.get("search") or "").strip().lower()
    role_filter = body.get("role")
    status_filter = body.get("status")
    if status_filter:
        status_filter = status_filter.upper()

    default_limit = 50
    max_limit = 100
    limit_raw = body.get("pageSize") or body.get("limit")
    try:
        limit = int(limit_raw) if limit_raw is not None else default_limit
    except (TypeError, ValueError):
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "pageSize/limit must be a number"}),
            "headers": CORS_HEADERS,
        }
    if limit <= 0:
        limit = default_limit
    limit = min(limit, max_limit)

    last_key: Dict[str, Any] | None = body.get("lastEvaluatedKey") or body.get("lastKey")
    if last_key is not None and not isinstance(last_key, dict):
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "lastEvaluatedKey must be an object"}),
            "headers": CORS_HEADERS,
        }
    try:
        filter_expr = Attr("tenant").eq(tenant)
        if role_filter and role_filter != "all":
            filter_expr = filter_expr & Attr("roles").contains(role_filter)
        if status_filter and status_filter != "ALL":
            filter_expr = filter_expr & Attr("status").eq(status_filter)
        if search:
            filter_expr = filter_expr & Attr("searchKey").contains(search)

        scan_kwargs = {"FilterExpression": filter_expr, "Limit": limit}
        if last_key:
            scan_kwargs["ExclusiveStartKey"] = last_key

        resp = users_table.scan(**scan_kwargs)
        items = resp.get("Items", [])

        response_body = {
            "items": items,
            "lastEvaluatedKey": resp.get("LastEvaluatedKey"),
        }
        return {
            "statusCode": 200,
            "body": json.dumps(response_body),
            "headers": CORS_HEADERS,
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
            "headers": CORS_HEADERS,
        }
