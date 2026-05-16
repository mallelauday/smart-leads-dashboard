# Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack + TypeScript.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React.js, TypeScript, TailwindCSS   |
| Backend  | Node.js, Express.js, TypeScript     |
| Database | MongoDB + Mongoose                  |
| Auth     | JWT + bcrypt                        |
| DevOps   | Docker + Docker Compose             |

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Docker (optional)

### Local Setup

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd smart-leads-dashboard
```

**2. Setup the server**
```bash
cd server
cp .env.example .env        # Fill in your values
npm install
npm run dev
```

**3. Setup the client**
```bash
cd client
cp .env.example .env        # Fill in your values
npm install
npm start
```

### Docker Setup
```bash
cp server/.env.example server/.env   # Edit JWT_SECRET
docker-compose up --build
```

- Client: http://localhost:3000
- Server: http://localhost:5000
- MongoDB: localhost:27017

## Project Structure

```
smart-leads-dashboard/
├── client/                   # React frontend
│   └── src/
│       ├── api/              # Axios instance
│       ├── components/       # Reusable UI components
│       │   ├── auth/         # Login, Register forms
│       │   ├── layout/       # Navbar, Sidebar
│       │   ├── leads/        # Lead table, filters, modal
│       │   └── ui/           # Button, Input, Badge, etc.
│       ├── context/          # Auth context
│       ├── hooks/            # useDebounce, etc.
│       ├── pages/            # Route-level pages
│       ├── types/            # TypeScript interfaces
│       └── utils/            # CSV export, helpers
├── server/                   # Express backend
│   └── src/
│       ├── config/           # DB connection
│       ├── controllers/      # Route logic
│       ├── middleware/        # Auth, RBAC, error handler
│       ├── models/           # Mongoose schemas
│       ├── routes/           # Express routers
│       ├── types/            # TypeScript types
│       └── utils/            # Shared utilities
├── docker-compose.yml
└── README.md
```

## API Endpoints

| Method | Endpoint             | Auth     | Description         |
|--------|----------------------|----------|---------------------|
| POST   | /api/auth/register   | Public   | Register new user   |
| POST   | /api/auth/login      | Public   | Login user          |
| GET    | /api/leads           | Required | Get all leads       |
| POST   | /api/leads           | Required | Create a lead       |
| PUT    | /api/leads/:id       | Required | Update a lead       |
| DELETE | /api/leads/:id       | Admin    | Delete a lead       |
| GET    | /api/leads/export    | Required | Export leads as CSV |

## Roles

| Feature        | Admin | Sales |
|----------------|-------|-------|
| View leads     | ✅    | ✅    |
| Create leads   | ✅    | ✅    |
| Update leads   | ✅    | ✅    |
| Delete leads   | ✅    | ❌    |
| Export CSV     | ✅    | ✅    |
