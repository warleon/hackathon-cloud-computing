# incident/create.py
import json
import uuid

from _utils import (
    incidents_table,
    now_iso,
    CORS_HEADERS,
    VALID_INCIDENT_STATES,
)


def lambda_handler(event, context):
    body = event.get("body")
    if isinstance(body, str):
        body = json.loads(body)

    tenant = body.get("tenant")
    title = body.get("title")
    creator = body.get("creator")
    location = body.get("location")
    media = body.get("media", "")
    state = (body.get("state") or "PENDING").upper()

    if state not in VALID_INCIDENT_STATES:
        return {
            "statusCode": 400,
            "body": json.dumps(
                {"message": f"state must be one of {sorted(VALID_INCIDENT_STATES)}"}
            ),
            "headers": CORS_HEADERS,
        }

    if not all([tenant, title, creator, location]):
        return {
            "statusCode": 400,
            "body": json.dumps(
                {"message": "tenant, title, creator and location are required"}
            ),
            "headers": CORS_HEADERS,
        }

    incident_id = body.get("id") or uuid.uuid4().hex
    now = now_iso()

    item = {
        "tenant": tenant,
        "id": incident_id,
        "title": title,
        "creator": creator,
        "location": location,
        "media": media or "",
        "state": state,
        "createdAt": now,
        "updatedAt": now,
    }

    try:
        incidents_table.put_item(Item=item)
        return {
            "statusCode": 201,
            "body": json.dumps(item),
            "headers": CORS_HEADERS,
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
            "headers": CORS_HEADERS,
        }
