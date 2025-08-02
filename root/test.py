import json
import requests

patients = [
    {
        "appointment_id": "P001",
        "visiting_status": "External referrals (1st Timer)",
        "age": 68,
        "medical_condition": "slurred speech and facial drooping",
        "gender": "Male"
    },
    {
        "appointment_id": "P002",
        "visiting_status": "Internal referrals (New)",
        "age": 45,
        "medical_condition": "persistent migraines and blurred vision",
        "gender": "Female"
    },
    {
        "appointment_id": "P003",
        "visiting_status": "Review",
        "age": 59,
        "medical_condition": "loss of balance and dizziness",
        "gender": "Male"
    },
    {
        "appointment_id": "P004",
        "visiting_status": "External referrals (1st Timer)",
        "age": 80,
        "medical_condition": "loss of consciousness after head trauma",
        "gender": "Female"
    },
    {
        "appointment_id": "P005",
        "visiting_status": "Internal referrals (New)",
        "age": 30,
        "medical_condition": "chronic headaches and eye twitching",
        "gender": "Male"
    },
    {
        "appointment_id": "P006",
        "visiting_status": "Review",
        "age": 72,
        "medical_condition": "memory loss and confusion",
        "gender": "Female"
    },
    {
        "appointment_id": "P007",
        "visiting_status": "External referrals (1st Timer)",
        "age": 22,
        "medical_condition": "tingling in limbs and neck stiffness",
        "gender": "Male"
    },
    {
        "appointment_id": "P008",
        "visiting_status": "Review",
        "age": 50,
        "medical_condition": "sharp pain behind eyes and blurred vision",
        "gender": "Female"
    },
    {
        "appointment_id": "P009",
        "visiting_status": "Internal referrals (New)",
        "age": 65,
        "medical_condition": "speech difficulty and right arm weakness",
        "gender": "Male"
    },
    {
        "appointment_id": "P010",
        "visiting_status": "External referrals (1st Timer)",
        "age": 39,
        "medical_condition": "BP check and mild dizziness",
        "gender": "Female"
    }
]



with requests.post("http://127.0.0.1:8000/sort/", json=patients) as response:
    #print and write json output to sorted.json
    print(response.status_code)
    sorted_patients = response.json()["results"]
    with open("patient_queue.json", "w") as file:
        json.dump(sorted_patients, file, indent=4)