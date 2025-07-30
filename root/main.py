import json
from datetime import datetime, timedelta
import requests
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException

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
    You are an experienced neurosurgery triage nurse. Your task is to triage a patient for an outpatient neurosurgery clinic.

        Please evaluate and assign the following:
        1. A severity score from 1 to 10 based on the patient's condition, age, and potential urgency.
        2. A priority rank from 1 to 5 based on the patient's visit type and the official clinic patient priority guide.

        Use the following criteria to determine priority:
        - Priority 1: Discharged Inpatients (2 weeks post discharge has precedence over 1 week post discharge)
        - Priority 2: New patients from internal hospital referrals
        - Priority 3: External referrals (first-time visitors)
        - Priority 4: Follow-up review cases
        - Priority 5: Private Cases 
        Consider neurological symptoms, age, chronic conditions, and urgency in your severity assessment.
        
    INPUT:
    - Appointment ID: {{appointment_id}}
    - Age: {{age}}
    - Gender: {{gender}}
    - Visiting Status: {{visiting_status}}
    - Medical Condition: {{medical_condition}}
    - Registration Time: {{registration_time}}
 

    OUTPUT
    Return a JSON response of all patients with the following structure:
    results: {{
               "{{appointment_id}}": {{
                                        "priority_rank": {{priority_rank}},
                                        "severity_score": {{severity_score}},
                                        "scheduled_start": "{{scheduled_start}}",
                                        "scheduled_end": "{{scheduled_end}}",
                                      }},
            }}
    Assign:
    - The `request_id`, `result_status`, `priority_rank`, `severity_score`.
    - Date for `scheduled_start` and `scheduled_end` will be filled later by the backend.
    Focus on neurological symptoms, potential complications, and urgency indicators specific to neurosurgery patients.
"""


app = FastAPI(title="Test API",
              description="Test API")


@app.post("/sort")
async def sort(patients):
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
        "temperature": 0,

    }
    try:
        response = requests.post(url, headers=headers, data=json.dumps(data))

        ai_response = response.json()
        patient_queue = ai_response["choices"][0]["message"]["content"]
        patient_queue = json.loads(patient_queue)

        patient_capacity = 170

        # Add an APPROVED status to first n patient in the queue
        for i, patient in enumerate(patient_queue["results"].values()):
            if i < patient_capacity:  # Approved patients are the first 170 in the queue
                patient["status"] = "APPROVED"
            else:
                patient["status"] = "PENDING"

        return patient_queue

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Error communicating with Groq API: {str(e)}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to decode JSON response from Groq API")
