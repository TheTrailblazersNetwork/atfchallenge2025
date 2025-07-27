import json
from datetime import datetime, timedelta
from uuid import uuid4
import requests
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Literal, List

# load environment variables from .env file
load_dotenv()
url = os.getenv("LITELLM_ENDPOINT") + "/chat/completions"

# Assign date variable to the next available Thursday
# This will be used for scheduling the appointment time
today = datetime.today()
if today.weekday() == 3:  # If today is Thursday
    next_available_thursday = today
else:
    # Calculate the next Thursday
    days_until_thursday = (3 - today.weekday()) % 7
    next_available_thursday = today + timedelta(days=days_until_thursday)

next_available_thursday_date = next_available_thursday.strftime("%Y-%m-%d")
print(next_available_thursday_date)

headers = {
    "Authorization": "Bearer " + os.getenv("VIRTUAL_KEY"),
    "Content-Type": "application/json"
}

# Prompt for the AI model
system_prompt = f"""
    You are an experienced neurosurgery triage nurse. Please assess the clinical severity of this patient
    on a scale of 1–10, where:
    - 1–3: Low severity (routine, non-urgent conditions)
    - 4–6: Moderate severity (concerning but stable)
    - 7–8: High severity (urgent, requires prompt attention)
    - 9–10: Critical severity (emergency, life-threatening)

    PATIENT INFORMATION:
    - Patient ID: {{patient_id}}
    - Age: {{age}}
    - Gender: {{gender}}
    - Visiting Status: {{visiting_status}}
    - Medical Condition: {{medical_condition}}


    OUTPUT
    Return a JSON response of all patients with the following structure:
    results:[
                "patient_id": "{{patient_id}}":
                                     {{
                                      "request_id": "{str(uuid4())}",
                                      "result_status": "APPROVED",
                                      "priority_rank": <integer from 1 (most urgent) to 4 (least urgent)>,
                                      "severity_score": <integer from 1 to 10>,
                                      "scheduled_start": "<scheduled_start_date will be inserted by user, 
                                      but time starts at 8 AM>",
                                      "scheduled_end": "<30 minutes after scheduled_start_datetime>",
                                      "note": "Kindly be there 30 minutes before appointment time.",
                                    }},
    ]
    Assign:
    - The `request_id`, `result_status`, `priority_rank`, `severity_score`.
    - `scheduled_start` and `scheduled_end` will be filled later by the backend.
    Focus on neurological symptoms, potential complications, and urgency indicators specific to neurosurgery patients.
"""


# Define the expected input format using Pydantic
class PatientData(BaseModel):
    patient_id: str
    visiting_status: str
    age: int
    medical_condition: str
    gender: Literal["Male", "Female", "Other"]


class PatientQueueResponse(BaseModel):
    request_id: str
    result_status: str
    priority_rank: int
    severity_score: int
    scheduled_start: str
    scheduled_end: str
    note: str
    patient_id: str


# This is a simple FastAPI application that takes patients data in dict format and returns a
# sorted list of patients based on their condition.

app = FastAPI(title="Test API",
              description="Test API")


@app.post("/sort", response_model=List[PatientQueueResponse])
async def sort(patients: List[PatientData]):
    """Sorts a dict of patients by their condition."""
    data = {
        "model": "groq/llama-3.3-70b-versatile",
        "messages": [
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": f"""{patients}, date: {next_available_thursday_date}"""
            }

        ],
        "response_format": {"type": "json_object"},
        "temperature": 0

    }

    response = requests.post(url, headers=headers, data=json.dumps(data))

    ai_response = response.json()
    patient_queue = ai_response["choices"][0]["message"]["content"]
    return {PatientQueueResponse(**patient_queue)}

