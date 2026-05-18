# 📡 Smart Leads Dashboard — API Documentation

**Base URL (Production):** `https://smart-leads-backend.onrender.com/api`  
**Base URL (Local):** `http://localhost:5000/api`

All protected routes require a `Bearer` token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication

### POST `/auth/register`
Register a new user account.

**Auth Required:** No

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "sales"
}
```

**Field Rules:**
| Field    | Type   | Required | Validation                  |
|----------|--------|----------|-----------------------------|
| name     | string | Yes      | 2–50 characters             |
| email    | string | Yes      | Valid email, unique         |
| password | string | Yes      | Minimum 6 characters        |
| role     | string | No       | `admin` or `sales` (default: `sales`) |

**Success Response — 201 Created:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "664abc123def456",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "sales"
  }
}
```

**Error Response — 400 Bad Request:**
```json
{
  "message": "User already exists with this email"
}
```

---

### POST `/auth/login`
Login with existing credentials.

**Auth Required:** No

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Success Response — 200 OK:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "664abc123def456",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "sales"
  }
}
```

**Error Response — 401 Unauthorized:**
```json
{
  "message": "Invalid email or password"
}
```

---

### GET `/auth/me`
Get the currently authenticated user's profile.

**Auth Required:** Yes

**Success Response — 200 OK:**
```json
{
  "_id": "664abc123def456",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "sales",
  "createdAt": "2026-05-16T07:13:00.000Z"
}
```

---

## 📋 Leads

### GET `/leads`
Get all leads. Supports filtering, search, sorting, and pagination.

**Auth Required:** Yes  
**Roles:** Admin, Sales

**Query Parameters:**
| Parameter | Type   | Description                                   | Example          |
|-----------|--------|-----------------------------------------------|------------------|
| search    | string | Search by name or email                       | `?search=john`   |
| status    | string | Filter by status                              | `?status=New`    |
| source    | string | Filter by source                              | `?source=Website`|
| page      | number | Page number (default: 1)                      | `?page=2`        |
| limit     | number | Results per page (default: 10)                | `?limit=20`      |
| sort      | string | Sort field and direction                      | `?sort=-createdAt`|

**Status values:** `New`, `Contacted`, `Qualified`, `Lost`  
**Source values:** `Website`, `Instagram`, `Referral`

**Success Response — 200 OK:**
```json
{
  "leads": [
    {
      "_id": "664abc111aaa",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "status": "New",
      "source": "Website",
      "createdBy": {
        "_id": "664abc123def456",
        "name": "John Doe"
      },
      "createdAt": "2026-05-16T10:00:00.000Z",
      "updatedAt": "2026-05-16T10:00:00.000Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pages": 5
}
```

---

### POST `/leads`
Create a new lead.

**Auth Required:** Yes  
**Roles:** Admin, Sales

**Request Body:**
```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "status": "New",
  "source": "Website"
}
```

**Field Rules:**
| Field  | Type   | Required | Validation                              |
|--------|--------|----------|-----------------------------------------|
| name   | string | Yes      | 2–100 characters                        |
| email  | string | Yes      | Valid email format                      |
| status | string | No       | `New`, `Contacted`, `Qualified`, `Lost` (default: `New`) |
| source | string | Yes      | `Website`, `Instagram`, `Referral`      |

**Success Response — 201 Created:**
```json
{
  "_id": "664abc222bbb",
  "name": "Alice Smith",
  "email": "alice@example.com",
  "status": "New",
  "source": "Website",
  "createdBy": "664abc123def456",
  "createdAt": "2026-05-16T11:00:00.000Z"
}
```

---

### GET `/leads/:id`
Get a single lead by ID.

**Auth Required:** Yes  
**Roles:** Admin, Sales

**Success Response — 200 OK:**
```json
{
  "_id": "664abc222bbb",
  "name": "Alice Smith",
  "email": "alice@example.com",
  "status": "New",
  "source": "Website",
  "createdBy": {
    "_id": "664abc123def456",
    "name": "John Doe"
  },
  "createdAt": "2026-05-16T11:00:00.000Z"
}
```

**Error Response — 404 Not Found:**
```json
{
  "message": "Lead not found"
}
```

---

### PUT `/leads/:id`
Update an existing lead.

**Auth Required:** Yes  
**Roles:** Admin, Sales

**Request Body (all fields optional):**
```json
{
  "name": "Alice Johnson",
  "email": "alicejohnson@example.com",
  "status": "Contacted",
  "source": "Referral"
}
```

**Success Response — 200 OK:**
```json
{
  "_id": "664abc222bbb",
  "name": "Alice Johnson",
  "email": "alicejohnson@example.com",
  "status": "Contacted",
  "source": "Referral",
  "updatedAt": "2026-05-16T12:00:00.000Z"
}
```

---

### DELETE `/leads/:id`
Delete a lead permanently.

**Auth Required:** Yes  
**Roles:** Admin only

**Success Response — 200 OK:**
```json
{
  "message": "Lead deleted successfully"
}
```

**Error Response — 403 Forbidden (Sales role):**
```json
{
  "message": "Access denied. Admin role required."
}
```

---

### GET `/leads/export`
Export all leads (with current filters applied) as a CSV file.

**Auth Required:** Yes  
**Roles:** Admin, Sales

**Query Parameters:** Same as `GET /leads` (search, status, source)

**Success Response — 200 OK:**  
Returns a `text/csv` file download with headers:
```
Name,Email,Status,Source,Created By,Created At
Alice Smith,alice@example.com,New,Website,John Doe,2026-05-16
```

---

## ⚠️ Error Codes

| Status Code | Meaning                          |
|-------------|----------------------------------|
| 200         | Success                          |
| 201         | Created                          |
| 400         | Bad Request (validation error)   |
| 401         | Unauthorized (missing/invalid token) |
| 403         | Forbidden (insufficient role)    |
| 404         | Resource not found               |
| 500         | Internal Server Error            |

---

## 🔒 Data Models

### User Schema
```
name       String   required, 2–50 chars
email      String   required, unique, lowercase
password   String   required, hashed (bcrypt), min 6 chars
role       String   enum: admin | sales, default: sales
createdAt  Date     auto
updatedAt  Date     auto
```

### Lead Schema
```
name       String           required, 2–100 chars
email      String           required, valid email
status     String           enum: New|Contacted|Qualified|Lost, default: New
source     String           required, enum: Website|Instagram|Referral
createdBy  ObjectId(User)   required
createdAt  Date             auto
updatedAt  Date             auto
```
