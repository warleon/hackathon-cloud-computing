# incident/update.py
import json

from _utils import (
    incidents_table,
    now_iso,
    CORS_HEADERS,
    VALID_INCIDENT_STATES,
    build_incident_search_key,
)
from hasPermission import has_permission


def lambda_handler(event, context):
    code = has_permission(event, context)
    if code != 200:
        return {
            "statusCode": code,
            "headers": CORS_HEADERS,
            "body": json.dumps({"message": "forbidden"}),
        }

    body = event.get("body")
    if isinstance(body, str):
        body = json.loads(body)

    tenant = body.get("tenant")
    incident_id = body.get("id")
    if not tenant:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "tenant required"}),
            "headers": CORS_HEADERS,
        }
    if not incident_id:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "id required"}),
            "headers": CORS_HEADERS,
        }

    allowed_fields = {"title", "location", "media", "state", "description"}
    update_expr = []
    expr_attr_vals = {}
    expr_attr_names = {}

    for field in allowed_fields:
        if field in body:
            if field == "state":
                state_val = (body[field] or "").upper()
                if state_val not in VALID_INCIDENT_STATES:
                    return {
                        "statusCode": 400,
                        "body": json.dumps(
                            {
                                "message": f"state must be one of {sorted(VALID_INCIDENT_STATES)}"
                            }
                        ),
                        "headers": CORS_HEADERS,
                    }
                expr_attr_vals[":state"] = state_val
                update_expr.append("state = :state")
            elif field == "description":
                placeholder = ":description"
                name_placeholder = "#description"
                expr_attr_vals[placeholder] = body[field]
                expr_attr_names[name_placeholder] = field
                update_expr.append(f"{name_placeholder} = {placeholder}")
            else:
                placeholder = f":{field[0]}"
                name_placeholder = f"#{field[0]}"
                expr_attr_vals[placeholder] = body[field]
                expr_attr_names[name_placeholder] = field
                update_expr.append(f"{name_placeholder} = {placeholder}")

    expr_attr_vals[":updated_at"] = now_iso()
    update_expr.append("updatedAt = :updated_at")

    if len(update_expr) == 1:  # only updatedAt added
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "no updatable fields provided"}),
            "headers": CORS_HEADERS,
        }

    # Need latest values to refresh searchKey
    current = incidents_table.get_item(Key={"tenant": tenant, "id": incident_id}).get(
        "Item"
    )
    if not current:
        return {
            "statusCode": 404,
            "body": json.dumps({"message": "incident not found"}),
            "headers": CORS_HEADERS,
        }

    new_title = body.get("title", current.get("title", ""))
    new_location = body.get("location", current.get("location", ""))
    new_creator = current.get("creator", "")
    new_description = body.get("description", current.get("description", ""))

    expr_attr_vals[":searchKey"] = build_incident_search_key(
        new_title, new_location, new_creator, new_description
    )
    update_expr.append("searchKey = :searchKey")

    update_expression = "SET " + ", ".join(update_expr)

    try:
        incidents_table.update_item(
            Key={"tenant": tenant, "id": incident_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expr_attr_vals,
            ExpressionAttributeNames=expr_attr_names if expr_attr_names else None,
            ReturnValues="NONE",
        )
        updated = incidents_table.get_item(Key={"tenant": tenant, "id": incident_id})
        return {
            "statusCode": 200,
            "body": json.dumps(updated.get("Item")),
            "headers": CORS_HEADERS,
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
            "headers": CORS_HEADERS,
        }
