# incident/list.py
import json
from typing import Any, Dict

from boto3.dynamodb.conditions import Attr

from _utils import CORS_HEADERS, incidents_table, VALID_INCIDENT_STATES


def lambda_handler(event, context):
    body = event.get("body")
    if isinstance(body, str):
        body = json.loads(body)

    tenant = body.get("tenant")
    if not tenant:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "tenant query param required"}),
            "headers": CORS_HEADERS,
        }

    filter_expr = Attr("tenant").eq(tenant)
    states = body.get("states")
    state = body.get("state")
    if states:
        normalized = []
        for item in states:
            if not item:
                continue
            upper = str(item).upper()
            if upper not in VALID_INCIDENT_STATES:
                return {
                    "statusCode": 400,
                    "body": json.dumps(
                        {
                            "message": f"states values must be within {sorted(VALID_INCIDENT_STATES)}"
                        }
                    ),
                    "headers": CORS_HEADERS,
                }
            normalized.append(upper)
        if normalized:
            filter_expr = filter_expr & Attr("state").is_in(normalized)
    elif state:
        state_upper = state.upper()
        if state_upper not in VALID_INCIDENT_STATES:
            return {
                "statusCode": 400,
                "body": json.dumps(
                    {"message": f"state must be one of {sorted(VALID_INCIDENT_STATES)}"}
                ),
                "headers": CORS_HEADERS,
            }
        filter_expr = filter_expr & Attr("state").eq(state_upper)

    creator = body.get("creator")
    if creator:
        filter_expr = filter_expr & Attr("creator").eq(creator)

    search = (body.get("search") or "").strip().lower()
    if search:
        filter_expr = filter_expr & Attr("searchKey").contains(search)

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
        scan_kwargs = {"FilterExpression": filter_expr, "Limit": limit}
        if last_key:
            scan_kwargs["ExclusiveStartKey"] = last_key

        resp = incidents_table.scan(**scan_kwargs)
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
