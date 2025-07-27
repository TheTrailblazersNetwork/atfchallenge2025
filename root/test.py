import requests

patients = [
    {
        "patient_id": "P001",
        "visiting_status": "External referrals (1st Timer)",
        "age": 68,
        "medical_condition": "slurred speech and facial drooping",
        "gender": "Male"
    },
    {
        "patient_id": "P002",
        "visiting_status": "Internal referrals (New)",
        "age": 45,
        "medical_condition": "persistent migraines and blurred vision",
        "gender": "Female"
    },
    {
        "patient_id": "P003",
        "visiting_status": "Review",
        "age": 59,
        "medical_condition": "loss of balance and dizziness",
        "gender": "Male"
    },
    {
        "patient_id": "P004",
        "visiting_status": "External referrals (1st Timer)",
        "age": 80,
        "medical_condition": "loss of consciousness after head trauma",
        "gender": "Female"
    },
    {
        "patient_id": "P005",
        "visiting_status": "Internal referrals (New)",
        "age": 30,
        "medical_condition": "chronic headaches and eye twitching",
        "gender": "Male"
    },
    {
        "patient_id": "P006",
        "visiting_status": "Review",
        "age": 72,
        "medical_condition": "memory loss and confusion",
        "gender": "Female"
    },
    {
        "patient_id": "P007",
        "visiting_status": "External referrals (1st Timer)",
        "age": 22,
        "medical_condition": "tingling in limbs and neck stiffness",
        "gender": "Male"
    },
    {
        "patient_id": "P008",
        "visiting_status": "Review",
        "age": 50,
        "medical_condition": "sharp pain behind eyes and blurred vision",
        "gender": "Female"
    },
    {
        "patient_id": "P009",
        "visiting_status": "Internal referrals (New)",
        "age": 65,
        "medical_condition": "speech difficulty and right arm weakness",
        "gender": "Male"
    },
    {
        "patient_id": "P010",
        "visiting_status": "External referrals (1st Timer)",
        "age": 39,
        "medical_condition": "BP check and mild dizziness",
        "gender": "Female"
    }
]



with requests.get(f"http://127.0.0.1:8000/sort/{patients}") as response:
    #print and write json output to sorted.json
    sorted_patients = response.text
    print(sorted_patients)
