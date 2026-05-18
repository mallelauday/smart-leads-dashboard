# 🚀 Smart Leads Dashboard

A full-stack **Lead Management Dashboard** built with the MERN stack + TypeScript. Supports role-based access control (Admin/Sales), real-time filtering, CSV export, and Docker deployment.

---

## 🌐 Live Demo

| Service  | URL |
|----------|-----|
| Frontend | https://smart-leads-dashboard-8co1.vercel.app |
| Backend  | https://dashboard.render.com/project/prj-d84721beo5us73e2dpmg |

---

## 🛠 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React.js, TypeScript, TailwindCSS |
| Backend   | Node.js, Express.js, TypeScript   |
| Database  | MongoDB + Mongoose                |
| Auth      | JWT + bcrypt                      |
| DevOps    | Docker + Docker Compose           |

---

## ✨ Features

- 🔐 JWT Authentication (Register / Login)
- 👥 Role-Based Access Control — **Admin** and **Sales** roles
- 📋 Full Lead CRUD (Create, Read, Update, Delete)
- 🔍 Search & Filter leads by status, source, and keyword
- 📤 Export leads to CSV
- 📱 Responsive UI with TailwindCSS
- 🐳 Dockerized for easy deployment

---

## 📁 Project Structure

```
smart-leads-dashboard/
├── client/                   # React frontend (TypeScript)
│   └── src/
│       ├── api/              # Axios instance & interceptors
│       ├── components/
│       │   ├── auth/         # Login & Register forms
│       │   ├── layout/       # Navbar, Sidebar
│       │   ├── leads/        # Lead table, filters, modal
│       │   └── ui/           # Reusable UI components
│       ├── context/          # Auth context (JWT state)
│       ├── hooks/            # useDebounce, etc.
│       ├── pages/            # DashboardPage, LoginPage, RegisterPage
│       ├── types/            # TypeScript interfaces
│       └── utils/            # CSV export helper
├── server/                   # Express backend (TypeScript)
│   └── src/
│       ├── config/           # MongoDB connection
│       ├── controllers/      # authController, leadController
│       ├── middleware/        # JWT auth, RBAC, error handler
│       ├── models/           # User, Lead (Mongoose schemas)
│       ├── routes/           # /api/auth, /api/leads
│       └── types/            # Shared TS types
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Docker *(optional)*

---

### Option 1 — Local Setup (Manual)

**1. Clone the repository**
```bash
git clone https://github.com/mallelauday/smart-leads-dashboard.git
cd smart-leads-dashboard
```

**2. Setup the Backend**
```bash
cd server
cp .env.example .env      # Fill in your values (see .env.example)
npm install
npm run dev               # Runs on http://localhost:5000
```

**3. Setup the Frontend**
```bash
cd ../client
cp .env.example .env      # Fill in your values
npm install
npm start                 # Runs on http://localhost:3000
```

---

### Option 2 — Docker Setup

```bash
git clone https://github.com/mallelauday/smart-leads-dashboard.git
cd smart-leads-dashboard
cp server/.env.example server/.env    # Edit JWT_SECRET at minimum
docker-compose up --build
```

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3000  |
| Backend  | http://localhost:5000  |
| MongoDB  | localhost:27017        |

---

## 🔑 Environment Variables

### Server (`server/.env`)

| Variable    | Description                      | Example                          |
|-------------|----------------------------------|----------------------------------|
| PORT        | Server port                      | `5000`                           |
| MONGO_URI   | MongoDB connection string        | `mongodb+srv://...`              |
| JWT_SECRET  | Secret key for JWT signing       | `your_super_secret_key`          |
| NODE_ENV    | Environment                      | `development` / `production`     |
| CLIENT_URL  | Frontend URL (for CORS)          | `http://localhost:3000`          |

### Client (`client/.env`)

| Variable           | Description          | Example                       |
|--------------------|----------------------|-------------------------------|
| REACT_APP_API_URL  | Backend API base URL | `http://localhost:5000/api`   |

---

## 👤 User Roles

| Feature        | Admin | Sales |
|----------------|:-----:|:-----:|
| View leads     | ✅    | ✅    |
| Create leads   | ✅    | ✅    |
| Update leads   | ✅    | ✅    |
| Delete leads   | ✅    | ❌    |
| Export CSV     | ✅    | ✅    |

---

## 📡 API Endpoints

### Auth

| Method | Endpoint             | Auth     | Description       |
|--------|----------------------|----------|-------------------|
| POST   | /api/auth/register   | Public   | Register new user |
| POST   | /api/auth/login      | Public   | Login user        |
| GET    | /api/auth/me         | Required | Get current user  |

### Leads

| Method | Endpoint           | Auth     | Role  | Description         |
|--------|--------------------|----------|-------|---------------------|
| GET    | /api/leads         | Required | Any   | Get all leads       |
| POST   | /api/leads         | Required | Any   | Create a lead       |
| GET    | /api/leads/:id     | Required | Any   | Get lead by ID      |
| PUT    | /api/leads/:id     | Required | Any   | Update a lead       |
| DELETE | /api/leads/:id     | Required | Admin | Delete a lead       |
| GET    | /api/leads/export  | Required | Any   | Export leads as CSV |

---

## 📦 Data Models

### User
```json
{
  "name": "string (2–50 chars)",
  "email": "string (unique)",
  "password": "string (hashed, min 6 chars)",
  "role": "admin | sales"
}
```

### Lead
```json
{
  "name": "string (2–100 chars)",
  "email": "string",
  "status": "New | Contacted | Qualified | Lost",
  "source": "Website | Instagram | Referral",
  "createdBy": "ObjectId (ref: User)"
}
```
