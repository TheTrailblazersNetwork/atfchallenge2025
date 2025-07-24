# ATFChallenge2025 - Patient Booking System

A full-stack patient appointment booking application built as a monorepo using Next.js (frontend) and Express (backend).

🌐 **Frontend**: Next.js 15 (App Router)  
🔧 **Backend**: Node.js + Express  
📦 **Monorepo**: Powered by `pnpm` workspaces  
🚫 **Turbopack Disabled**: Known issue on Windows with pnpm (see notes)  
🚀 **Goal**: Clean separation, scalable architecture, easy onboarding.

---

## 🧩 Project Structure

```
atfchallenge2025/
├── frontend/ # Next.js frontend
│   ├── app/ # Pages, layout, route handlers
│   ├── components/ # Reusable UI
│   ├── lib/ # Utilities, auth, db
│   └── ...
│
├── backend/ # Express backend
│   ├── src/
│   │   ├── routes/ # API endpoints
│   │   ├── controllers/ # Route logic
│   │   ├── services/ # Business logic
│   │   ├── models/ # Data types
│   │   ├── middleware/ # Auth, logging, 
│   │   ├── utils/ # Helpers
│   │   └── server.ts # Entry point
│   └── ...
│
├── pnpm-workspace.yaml # Defines pnpm workspaces
├── package.json # Root scripts (e.g., pnpm dev)
├── tsconfig.json # Root TypeScript config
└── README.md # You are here!
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/TheTrailblazersNetwork/atfchallenge2025.git
cd atfchallenge2025
```

### 2. Install Dependencies

This is a pnpm-based monorepo. Install globally if needed:

```bash
npm install -g pnpm
```

Then install all dependencies:

```bash
pnpm install
```

This installs dependencies for both frontend and backend. 

---

## 🛠️ Development

### Start Both Servers

```bash
pnpm dev
```

This runs:

- Frontend: `next dev` → http://localhost:3000  
- Backend: `ts-node-dev` → http://localhost:5000

### Start Individually

```bash
# Only frontend
pnpm --filter frontend dev

# Only backend
pnpm --filter backend dev
```

---

## 💼 Adding New Dependencies

**Frontend-only package**:

```bash
pnpm --filter frontend add <package-name>
```

**Backend-only package**:

```bash
pnpm --filter backend add <package-name>
```

**Tool used across projects**:

```bash
pnpm add -w <package-name>
```
