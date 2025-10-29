# Vacation Management Interface

A complete full-stack web application for managing employee vacation requests.  
Built with **Vue 3 (Vite)** on the frontend and **Node.js + Express + Knex.js + PostgreSQL** on the backend.  
Includes requester and validator interfaces, form validation, approval/rejection workflow, pagination, sorting, and a clean responsive design.  
Created as part of a **Web Development Intern recruitment assignment**.

---

## Tech Stack

### Frontend
- **Vue 3 (Vite)**
- **Vue Router**
- **Axios**
- **Responsive UI** (Dark mode, flex/grid)
- Modern composition API & reusable components

### Backend
- **Node.js / Express**
- **Knex.js** (SQL query builder)
- **PostgreSQL** (relational DB)
- Input validation, error handling, RESTful endpoints
- CORS enabled for dev (`5173 → 4000`)

---

## Run Locally

### 1- Backend Setup
```bash
cd backend
cp .env.example .env   # (or edit manually)
npm install
npm run migrate        # create tables
npm run seed           # insert demo users
npm run dev            # start local API
```

=> **API URL:** http://localhost:4000  
=> **Health Check:** http://localhost:4000/api/health

---

### 2- Frontend Setup
```bash
cd frontend
npm install
echo "VITE_API_BASE=http://localhost:4000/api" > .env
npm run dev
```

=> **App URL:** http://localhost:5173

---

## API Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| **POST** | `/api/requests` | Create a vacation request (`user_id`, `start_date`, `end_date`, `reason?`) |
| **GET** | `/api/requests/:userId` | Get all requests for a specific requester |
| **GET** | `/api/requests?status=Pending|Approved|Rejected` | Get all requests (for validator) |
| **PATCH** | `/api/requests/:id` | Approve or reject a request (`status`, `comments?`) |
| **GET** | `/api/health` | Simple healthcheck |


---

## Database Schema

### users
| id | name | role |
|----|------|------|
| 1 | Natan Ouaki | Requester |
| 2 | Laura HR | Validator |

### vacation_requests
| id | user_id | start_date | end_date | reason | status | comments | created_at |
|----|----------|-------------|-----------|---------|----------|-----------|-------------|

---

## Features

- **Requester View**
  - Submit new vacation request  
  - Validation (date range, missing fields)
  - See personal history (Pending / Approved / Rejected)
  - Sort by date (Created / Start / End)


- **Validator View**
  - Review all requests
  - Filter by status
  - Sort by date (Created / Start / End)
  - Pagination
  - Approve / Reject with comments
  - Auto-refresh

- **Extras**
  - Day counter (duration between start/end)
  - Form & table responsive layout
  - Dark modern UI  

---

## Testing
```bash
cd backend
npm test
```

Simple test cases for migration, seeding, and API endpoints.  
(Framework-agnostic setup, can integrate Jest or Vitest.)

---

## Design & Technical Choices

- Clean modular architecture (`src/api`, `src/views`, `src/components`)
- Separation of concerns between backend / frontend
- Vue composition API for reactivity and maintainability
- Simple `.env` config to adapt base URLs
- No authentication (not required per assignment)
- Seeded demo users:
  - **Requester:** Natan Ouaki  
  - **Validator:** Laura HR

---

## Deployment Notes

- Works with any PostgreSQL instance
- CORS configured to allow frontend dev server (`http://localhost:5173`)
- Compatible with Node v18+ and npm v10+

---

## Known Limitations
- No login/authentication (by assignment choice)
- Simple pagination (client-side)
- Limited error UI (for clarity)

---

## Credits
Project developed by **Natan Ouaki**  
Frontend: Vue 3 + Vite | Backend: Node.js + Express | DB: PostgreSQL

---
