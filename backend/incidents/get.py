# incident/get.py
import json

from _utils import CORS_HEADERS, get_incident
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

    try:
        incident = get_incident(tenant, incident_id)
        if not incident:
            return {
                "statusCode": 404,
                "body": json.dumps({"message": "not found"}),
                "headers": CORS_HEADERS,
            }
        return {
            "statusCode": 200,
            "body": json.dumps(incident),
            "headers": CORS_HEADERS,
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "internal error", "error": str(e)}),
            "headers": CORS_HEADERS,
        }
