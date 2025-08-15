# ATFChallenge2025 – AI-Assisted OPD Scheduling & Patient Flow Management System
<img width="1536" height="1023" alt="image" src="https://github.com/user-attachments/assets/96185d23-f52b-4703-9d3f-38dd6c74b923" /> 

---
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Issues](https://img.shields.io/github/issues/TheTrailblazersNetwork/atfchallenge2025)
![PRs](https://img.shields.io/github/issues-pr/TheTrailblazersNetwork/atfchallenge2025)

---

**Problem Statement Six (6)** - ATF AI Challenge
**Team:** TRAILBLAZERS

This project proposes an **AI-driven solution to revolutionize Outpatient Department (OPD) operations** at Korle Bu Teaching Hospital's Neurological Centre, addressing critical challenges such as extended wait times and inefficient patient management.

## Table of Contents
- [Project Overview](#project-overview)
- [Demo Video](#demo-video)
- [Problem Statement](#problem-statement)
- [Proposed Solution](#proposed-solution)
- [Technical Architecture](#technical-architecture)
- [Key Features](#key-features)
  - [Phase One — Patient & Appointment Management](#phase-one--patient--appointment-management)
  - [Phase Two — AI Triage & OPD Flow](#phase-two--ai-triage--opd-flow)
- [AI-Powered Triage (NeuroQueue)](#ai-powered-triage-neuroqueue)
  - [Priority Ranking System](#priority-ranking-system)
- [Technology Stack](#technology-stack)
- [System Structure](#system-structure)
- [Workflow Diagram](#workflow-diagram)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [NeuroQueue API Documentation](#neuroqueue-api-documentation)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Support](#support)

---

## Project Overview

This comprehensive README, submitted by **TRAILBLAZERS** for the **ATF AI Challenge**, specifically targets **Problem Statement 6** from Korle Bu Teaching Hospital. The core objective is to develop an **AI-Assisted Outpatient Department (OPD) Scheduling and Patient Flow Management System** for the Korle Bu Neurological Centre.

The initiative aims to **transform current manual OPD operations** by automating scheduling, enhancing patient prioritization, and providing real-time queue transparency. This will ultimately lead to **reduced wait times, improved patient satisfaction, and optimized staff efficiency**. The solution leverages **advanced AI technologies**, including **open-source models hosted on the Groq platform**. .

---
 ## Demo Video
[![Watch the Demo Video](https://img.youtube.com/vi/TAvrJp9Nrf0/0.jpg)](https://youtu.be/TAvrJp9Nrf0)

---

## Problem Statement

Korle Bu Teaching Hospital, a leading healthcare institution in Ghana, faces significant operational inefficiencies in its Neurological Clinic due to a **current manual scheduling system**. These inefficiencies severely impact both patient experience and staff productivity.

---
![Overcrowded Clinic at Korle Bu](https://github.com/user-attachments/assets/0c4e03b9-3af4-4d1e-8d68-9cc0f424d589)  
**Figure:** Overcrowded clinic environment at Korle Bu Neurological Centre.


---

The **key challenges identified** are:

*   **Extended Waiting Times and Long Queues**: Patients frequently endure **hours of waiting** because of unstructured scheduling processes, leading to frustration and dissatisfaction.
*   **Overbooking Beyond Capacity**: The manual system often schedules **more patients than doctors can accommodate**, resulting in significant delays and overburdened healthcare providers.
*   **Overcrowding and Tension in the Clinic Environment**: High patient volumes create a **chaotic atmosphere**, disproportionately affecting vulnerable groups like the elderly and those with mobility challenges.
*   **Inadequate Prioritization of Vulnerable Patients**: There is a **lack of automated prioritization**, meaning patients requiring urgent care (e.g., elderly, wheelchair users, or those with acute conditions) are not seen promptly.
*   **Inefficient Tracking and Follow-Up Management**: Without real-time registration and tracking, patients are often missed, and **follow-up appointments are poorly managed**, disrupting continuity of care.
*   **Limited Administrative Oversight**: The **absence of real-time data and analytics** prevents administrators from effectively monitoring no-shows, defaulters, or high-risk patients, hindering strategic resource allocation.
  
![Korle Bu OPD Corridor – Waiting Area](https://github.com/user-attachments/assets/91e14edc-9471-4cc2-8773-843c72759c8f)  
**Figure:** Patients awaiting their turn in the busy OPD corridor of Korle Bu Teaching Hospital's Neurological Centre.



The project's objective is to address these challenges by implementing an AI-driven system that automates scheduling, prioritizes patients based on medical urgency, provides real-time queue updates, and enables administrative oversight.

---

## Proposed Solution

The proposed solution is a **comprehensive, AI-driven OPD Scheduling and Patient Flow Management System** designed to transform Korle Bu’s outpatient operations. It incorporates advanced technologies to streamline processes, enhance transparency, and improve overall efficiency, specifically for the Neurological Centre.

The system comprises several interconnected modules:

*   **Online Patient Registration & Verification** — Patients register via a simple interface, verify their phone/email, and create a digital profile.
*    **Appointment Booking** — Patients select their visiting status, describe their condition, and submit a booking.
*    **Batch AI Scheduling** — Every Wednesday at midday, all pending bookings are sent to the AI triage service in a single batch for:
            - Priority ranking (1–4)
            - Severity scoring (0–10)
*   **Staff Notification System**: Doctors and administrative staff will receive **real-time alerts via a web-based dashboard** about schedule changes, urgent cases, and queue statuses, enabling proactive management.
*   **Administrative Dashboard**: A comprehensive dashboard will provide administrators with **real-time insights** into slot usage, no-show rates, and other data, facilitating data-driven decision-making.
*   **EMR Integration Layer**: The system will **sync patient visit logs** with Korle Bu’s Electronic Medical Records (EMR) system for seamless follow-up scheduling and neurological research initiatives.
*   Automates the prioritization of patient appointments based on urgency and severity.
- Processes appointment requests in bulk at scheduled intervals (e.g., Wednesdays).
- Updates patients in real-time via their preferred communication channels (SMS, Email, or both).
- Reduces manual workload for healthcare staff and increases operational efficiency.
---
<img width="1536" height="1023" alt="image" src="https://github.com/user-attachments/assets/01a50375-c6d6-4cc3-b10e-4e785b82e0cc" />

---

## Technical Architecture

 <img width="1650" height="880" alt="image" src="https://github.com/user-attachments/assets/a9b41be4-524a-413f-83fa-2784f214d661" />
    (https://app.eraser.io/workspace/ZPz0cNtGVELpPFJ5svtm?origin=share&elements=4kDWu6OS1cz0pY4dFUCD4g)
---

## Key Features

### **Phase One — Patient & Appointment Management**
- **Patient Registration**
  - Collects first & last name, gender, date of birth (calculates age), phone, email, password, preferred communication type.
  - Email/phone OTP verification.
- **Login & Authentication**
  - Secure JWT-based login.
- **Appointment Booking**
  - Stepper form with visiting status, medical description, preview & confirmation.
- **Database Storage**
  - PostgreSQL database with relational structure for patients & appointments.
- **Password Reset**
  - Via email or SMS based on communication preference.

### **Phase Two — AI Triage & OPD Flow**
- **Batch AI Scheduling**
  - Triggered automatically every Wednesday 12 PM.
  - Sends only required details (Appointment ID, age, gender, visiting status, medical description) to AI API.
  - AI returns priority rank & severity score.
- **OPD Queue Dashboard**
  - Displays all approved patients for the day.
  - Actions: Skip, Mark Unavailable, Complete.
  - Unavailable patients pushed to the back of the queue.
- **Real-time Status Updates**
  - Patient statuses: Pending → Approved/Rebooked → Completed/Unavailable.

---

## AI-Powered Triage (NeuroQueue)
The AI system uses a **FastAPI service** integrated with a **Groq/LLaMA model**.  
The AI:
- Assigns **priority rank** based on clinic guidelines.
- Calculates **severity score** using condition, age, urgency.
- Generates appointment order, starting at 8 AM in 30-minute slots.
- Approves first N patients (e.g., 170 capacity), others remain pending/rebook.

---

## Technology Stack

| Component          | Technology |
|--------------------|------------|
| Frontend           | Next.js (React) |
| Backend API        | Node.js + Express |
| Database           | PostgreSQL |
| AI Triage Service  | FastAPI + Groq/LLaMA |
| Email Service      | Nodemailer (Gmail) |
| SMS Service        | TXT Connect |
| Auth               | JWT |
| Deployment         | Render / Vercel |

---


## 🏗️ System Structure

```
ATFChallenge2025 Monorepo
├── 🌐 Frontend (Next.js 15)
│   ├── Patient Registration (QR/Mobile/Desk)
│   ├── Real-time Queue Display
│   ├── Staff/Admin Dashboards
│   └── Analytics & Reporting
│
├── 🔧 Backend (Express.js)
│   ├── Authentication & User Management
│   ├── Booking Orchestration
│   ├── EMR Integration Layer
│   └── Notification Services
│
├── 🧠 NeuroQueue API (FastAPI)
│   ├── AI-Powered Triage (Groq + LiteLLM)
│   ├── Severity Scoring (0-10 scale)
│   ├── Priority Ranking Algorithm
│   └── Capacity-Aware Scheduling
│
└── 📊 Shared Configuration
    ├── TypeScript Configs
    ├── Workspace Management
    └── Environment Variables
```

## Workflow Diagram

```text
+-------------------------------------+
| Registration & OTP Verification     |
+----------------------+--------------+
                       |
                       v
                +------+------+
                |    Login     |
                +------+------+
                       |
                       v
      +----------------+------------------+
      |   Book Appointment → Pending DB   |
      +----------------+------------------+
                       |
                       | (Wed 12 PM CRON)
                       v
+----------------------+-------------------------+
|    Batch Send to AI → Update Appointment Status|
+----------------------+-------------------------+
                       |
                       v
          +------------+-------------+
          | Notify Patients of Outcome |
          +------------+-------------+
                       |
                       | (Thu)
                       v
        +--------------+----------------+
        | Approved → Proceed to OPD     |
        +-------------------------------+
```
---

## 🧩 Project Structure

```
atfchallenge2025/
├── 📄 README.md                # This comprehensive guide
├── 📦 pnpm-workspace.yaml      # Monorepo workspace configuration
├── 📋 package.json             # Root scripts and dependencies
├── ⚙️ tsconfig.json            # Base TypeScript configuration
├── 
├── 🌐 frontend/                # Next.js 15 Frontend
│   ├── 📱 app/                 # App Router pages and layouts
│   │   ├── 🏥 dashboard/       # Main dashboard
│   │   ├── 👨‍⚕️ opdDashboard/   # OPD-specific dashboard
│   │   ├── 👤 login/           # Authentication pages
│   │   └── 👑 admin/           # Administrative interface
│   ├── 🧩 components/          # Reusable UI components
│   ├── 🔧 services/           # API client services
│   ├── 🗃️ store/              # State management
│   └── 📚 types/              # TypeScript definitions
│
├── 🔧 backend/                 # Express.js Backend
│   └── 📁 src/
│       ├── 🛣️ routes/          # API endpoints
│       ├── 🎮 controllers/     # Request handlers
│       ├── 🏢 services/        # Business logic
│       ├── 📊 models/          # Data models
│       ├── 🔐 middleware/      # Authentication & logging
│       ├── 🛠️ utils/           # Helper functions
│       └── ⚙️ config/          # Configuration files
│
├── 🧠 root/                    # NeuroQueue FastAPI Service
│   ├── 🚀 main.py             # FastAPI application entry
│   ├── 📋 NeuroTriage.yaml    # Triage rules configuration
│   ├── 📄 readme.md           # API documentation
│   ├── 📦 requirements.txt    # Python dependencies
│   └── 🧪 test.py             # Test suite
│
└── 📸 demo/                    # Screenshots and media
    └── shots/                  # Application screenshots
```

---

## 🚀 Getting Started

### 1. 📥 Clone the Repository

```bash
git clone https://github.com/TheTrailblazersNetwork/atfchallenge2025.git
cd atfchallenge2025
```

### 2. 📦 Install JavaScript Dependencies

Install pnpm globally if needed:
```bash
npm install -g pnpm
```

Install all workspace dependencies:
```bash
pnpm install
```

### 3. 🔧 Start Development Servers

**Start both Frontend & Backend:**
```bash
pnpm dev
```
- 🌐 Frontend: http://localhost:3000
- 🔧 Backend: http://localhost:5000

**Start individually:**
```bash
# Frontend only
pnpm --filter frontend dev

# Backend only  
pnpm --filter backend dev
```

### 4. 🧠 Start NeuroQueue API (Python FastAPI)

In a new terminal:
```bash
cd root
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
- 🧠 NeuroQueue API: `http://127.0.0.1:8000/sort` or [https://atfchallenge2025.onrender.com/sort/](https://atfchallenge2025.onrender.com/sort/)

---

## 🧠 NeuroQueue API Documentation

### 🎯 Core Functionality
The NeuroQueue API is the AI brain of the system, providing intelligent triage and scheduling capabilities - see [NeuroQueue API Documentation](root/readme.md) for detailed API endpoints and usage.

### 📥 Request Format
Send POST requests to `/sort/` with patient data:

```Arrayjson
[
  "P001": {
    "appointment_id": "P001",
    "age": 72,
    "gender": "Male", 
    "visiting_status": "External referrals (first-time visitors)",
    "medical_condition": "slurred speech and facial drooping"
  },
  "P002": {
    "appointment_id": "P002",
    "age": 45,
    "gender": "Female",
    "visiting_status": "Follow-up",
    "medical_condition": "headache monitoring post-surgery"
  }
]
```

### 📤 Response Format
```json
{
  "results": {
    "P001": {
      "priority_rank": 3,
      "severity_score": 9,
      "status": "APPROVED",
      "schedule_date": "2025-08-15"
    },
    "P002": {
      "priority_rank": 4,
      "severity_score": 3,
      "status": "APPROVED", 
      "schedule_date": "2025-08-15"
    }
  }
}
```

### 🎯 Priority Ranking System

| Priority | Description | Example |
|----------|-------------|---------|
| 1 | 🏥 Discharged Inpatients | Post-surgery follow-up (urgent) |
| 2 | 🏥 Internal new referrals | Referred by hospital doctors |
| 3 | 🌐 External first-time referrals | Referred by external doctors |
| 4 | 🔄 Review/follow-up cases | Routine monitoring |
| 5 | 💰 Private patients | Self-paying patients |

### ⚙️ Environment Configuration
Create a `.env` file in the `root/` directory:

```env
LITELLM_ENDPOINT=https://api.litellm.ai
VIRTUAL_KEY=your_groq_api_key_here
```

---

### 📦 Adding Dependencies

**Frontend-only package:**
```bash
pnpm --filter frontend add <package-name>
```

**Backend-only package:**
```bash
pnpm --filter backend add <package-name>
```

**Shared tool/utility:**
```bash
pnpm add -w <package-name>
```

**Python service:**
```bash
cd root
pip install <package>
pip freeze > requirements.txt
```

---

## 🌍 Environment Variables

### 🔧 Backend (.env)
```env
PORT=5000
DATABASE_URL=your_database_connection
JWT_SECRET=your_jwt_secret_key
NEUROQUEUE_API_URL=http://127.0.0.1:8000
```

### 🌐 Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE=http://localhost:5000
NEXT_PUBLIC_NEUROQUEUE_API=http://127.0.0.1:8000
```

### 🧠 NeuroQueue (.env)
```env
LITELLM_ENDPOINT=https://api.litellm.ai
VIRTUAL_KEY=your_groq_api_key
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. 🍴 **Fork the repository**
2. 🌿 **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. 💾 **Commit changes** (`git commit -m 'Add amazing feature'`)
4. 📤 **Push to branch** (`git push origin feature/amazing-feature`)
5. 🔄 **Open a Pull Request**

### 📋 Code Standards
- 📝 Follow existing code style
- 🧪 Add tests for new features
- 📚 Update documentation
- ✅ Ensure all checks pass

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- 🏥 **Neurosurgery Department, KBTH** - Problem definition and requirements
- 🤖 **Groq & LiteLLM** - Enabling rapid AI-powered triage
- ⚛️ **Next.js & FastAPI Communities** - Amazing frameworks
- 🎯 **The Trailblazers Network** - Project coordination and support

---

## 📞 Support

For questions, issues, or contributions:

- 📧 **Email**: [thetrailblazersteam.network@gmail.com](mailto:thetrailblazersteam.network@gmail.com)
- 🐙 **GitHub Issues**: [Create an issue](https://github.com/TheTrailblazersNetwork/atfchallenge2025/issues)
- 📚 **Documentation**: Check this README and inline code comments

---

**🧠 Think Fast. Treat Faster. Transform Healthcare. 🚀**
