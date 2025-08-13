# ATFChallenge2025 – AI-Assisted OPD Scheduling & Patient Flow Management System

🧠 **Think Fast. Treat Faster.**

A full-stack, AI-powered Outpatient Department (OPD) scheduling and patient flow management system designed specifically for neurosurgery clinics.

---

## 🔍 Overview

ATFChallenge2025 is a comprehensive monorepo solution that transforms manual, unstructured patient flow into an intelligent, capacity-aware scheduling system. It combines:

- 🌐 **Next.js 15 Frontend** (App Router) - Registration, queue visualization, staff/admin dashboards
- 🔧 **Express.js Backend** - Authentication, user management, booking orchestration
- 🧠 **NeuroQueue API** (FastAPI) - AI-powered triage, severity scoring, and smart scheduling
- 📦 **Monorepo Architecture** - Powered by `pnpm` workspaces for seamless development

**Goal**: Transform chaotic clinic workflows into structured, fair, explainable patient scheduling while maintaining extensibility for EMR integrations.

---

## 📋 Problem Statement

### Current Challenges in Neurosurgical OPD

In our neurosurgical outpatient clinic at KBTH, patient flow is largely unstructured and manual, leading to:

- ⏰ **Long queues and waiting times**
- 📈 **Overbooking beyond allowable limits** determined by available doctors
- 😤 **Overcrowding and tension** in clinic environments
- 🦽 **Lost opportunities** to prioritize vulnerable patients (wheelchair-bound, elderly)
- 🔄 **Poor case distinction** between new, follow-up, post-op, and referral cases
- 📝 **Missed cases** due to lack of real-time registration tracking
- 📊 **Limited analytics** on no-shows, defaulters, or high-risk patterns

### Required Solutions

An AI-driven OPD system that can:

- 📱 **QR codes/mobile check-ins** for automatic patient registration
- 🏷️ **Smart categorization** (new, follow-up, post-op, referral cases)
- 🎯 **Auto-prioritization** of vulnerable groups (elderly, wheelchair users, urgent referrals)
- 📺 **Real-time queue display** for staff and patients
- 🔔 **Smart notifications** for doctors about patient categories and queue positions
- 📤 **EMR integration** for daily logs and research databases
- 📈 **Analytics dashboard** for no-shows, repeat defaulters, and risk patterns

---

## 🏗️ System Architecture

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

### 📊 Data Flow

1. **Patient Arrival** → QR/Mobile/Reception Registration
2. **Frontend** → Posts registration to Express Backend
3. **Backend** → Assigns provisional category → Calls NeuroQueue API
4. **NeuroQueue** → Returns severity_score, priority_rank, schedule_date
5. **Backend** → Persists booking, enforces capacity limits
6. **Frontend** → Updates real-time queue displays
7. **Staff** → Receives notifications with patient context

---

## ✨ Key Features

### 🏥 Patient Flow & Registration
- 📱 Multiple registration pathways (QR codes, mobile app, reception desk)
- 🏷️ Automatic categorization and vulnerability detection
- 🔄 Clear distinction between case types:
  - 🆕 New patients
  - 🔄 Follow-up appointments
  - 🏥 Post-operative reviews
  - 📋 Internal/External referrals
  - 💰 Private patients
  - 🏥 Discharged inpatients

### 🧠 AI-Powered Triage (NeuroQueue)
- 🤖 LLM-assisted symptom interpretation using Groq
- 📊 Severity scoring (0-10 scale) with explainable results
- 🎯 Deterministic priority ranking via hospital rule matrix
- 📅 Thursday-only clinic scheduling (configurable)
- ⚖️ Capacity-aware approval (APPROVED/WAITLIST/DEFERRED)

### 📅 Smart Scheduling & Capacity Management
- 👨‍⚕️ Per-session maximum slots to prevent overbooking
- 📈 Rule-based priority adjustments for high-severity cases
- 🔄 Rolling Thursday scheduling system
- ⚠️ Real-time capacity monitoring

### 📺 Real-Time Queue Visualization
- 🔴 Live queue updates with category badges
- 🦽 Vulnerability indicators (elderly, wheelchair users)
- 👨‍⚕️ Separate staff and patient-optimized views
- 📱 Mobile-responsive design

### 📊 Analytics & Reporting
- 📈 No-show tracking and pattern analysis
- 🔄 Repeat defaulter identification
- 📋 Risk pattern detection
- 📤 EMR export capabilities (CSV/FHIR)
- 📊 Attendance trend analytics

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
- 🧠 NeuroQueue API: http://127.0.0.1:8000/sort or https://atfchallenge2025.onrender.com/sort/

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

## 💾 Technology Stack

### 🌐 Frontend Technologies
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (assumed)
- **State Management**: React Context/Zustand
- **Authentication**: NextAuth.js (planned)

### 🔧 Backend Technologies  
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Development**: ts-node-dev
- **Database**: (To be configured - Prisma/MongoDB)

### 🧠 AI/ML Technologies
- **Framework**: FastAPI (Python)
- **AI Provider**: Groq via LiteLLM
- **Configuration**: YAML-based rule engine
- **Deployment**: Render.com (current)

### 🛠️ Development Tools
- **Monorepo**: pnpm workspaces
- **TypeScript**: Shared configuration
- **Linting**: ESLint (configured)
- **Version Control**: Git

---

## 🔧 Development Workflow

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

### 🔄 Development Best Practices
- 🌿 Feature branches: `feature/<feature-name>`
- 🐛 Bug fixes: `bugfix/<issue-description>`
- 🏗️ Chores: `chore/<task-description>`
- 📝 Conventional commits for clear history
- 🧪 Test changes before pushing

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

## 🗺️ Roadmap

### 🎯 Phase 1 (Current)
- ✅ Basic monorepo structure
- ✅ NeuroQueue AI triage system
- ✅ Frontend dashboard framework
- 🔄 Authentication system
- 🔄 Real-time queue updates

### 🚀 Phase 2 (Next Quarter)
- 📱 Mobile app for patient check-in
- 📊 Advanced analytics dashboard
- 🔔 SMS/Email notification system
- 🏥 EMR integration adapters
- 👨‍⚕️ Multi-clinician support

### 🌟 Phase 3 (Future)
- 🤖 Predictive no-show modeling
- 🌐 Multi-clinic support
- 📱 Offline kiosk mode
- 🔄 Dynamic overbooking algorithms
- 📊 Research data export pipeline

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
