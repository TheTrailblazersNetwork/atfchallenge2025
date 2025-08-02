# 🧠 NeuroQueue API: **Think Fast. Treat Faster.**

**NeuroQueue** is an AI-powered triage and scheduling API built for neurosurgery outpatient departments. It uses LLM (Groq via LiteLLM) to assess patient severity, apply hospital-defined priority rules, and return structured schedules for weekly clinics.

---

## 🚀 Features

- AI-assisted triage based on symptoms, age, and condition
- Automatic priority ranking using hospital OPD rules
- Scheduling system based on clinic capacity
- JSON-based request and response format
- Batch or single-patient request support
- Defined Capacity approval
- Built with **FastAPI**, integrated with **Groq + LiteLLM**

---

## 📥 Request Format

Send a `POST` request to `/sort` with a dictionary of patients:

```json
{
  "P001": {
    "appointment_id": "P001",
    "age": 72,
    "gender": "Male",
    "visiting_status": "External referrals (first-time visitors)",
    "medical_condition": "slurred speech and facial drooping"
  },
  "P002": {
    "..."
  }
}
```

---

## 📤 Response Format

```json
{
  "results": {
    "P001": {
      "priority_rank": 3,
      "severity_score": 9,
      "status": "APPROVED",
      "schedule_date": "2023-10-26"
    },
    "..."
  }
}
```

---

## 📦 Setup

```bash
# Clone repo and cd into it
pip install -r requirements.txt
uvicorn main:app --reload
```

Create a `.env` file:

```env
LITELLM_ENDPOINT=https://api.litellm.ai
VIRTUAL_KEY=your_key_here
```

---


## 📚 Patient Prioritization Logic

| Priority | Description                              |
| -------- | ---------------------------------------- |
| 1        | Discharged Inpatients (2 weeks > 1 week) |
| 2        | Internal new referrals                   |
| 3        | External first-time referrals            |
| 4        | Review/follow-up cases                   |
| 5        | Private patients                         |

---

## ⚠️ Note

- Emergency cases are **excluded** from the OPD queue (they bypass triage)
- Clinic runs on **Thursdays only** — all scheduling targets the next Thursday

---

## 🤖 Powered By

- [FastAPI](https://fastapi.tiangolo.com/)
- [Groq via LiteLLM](https://github.com/BerriAI/litellm)
- [Python Requests](https://docs.python-requests.org/)

---



