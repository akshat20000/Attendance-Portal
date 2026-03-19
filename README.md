# Campus Attendance Management System

A full-stack web application for academic institutions to manage student attendance, class offerings, subjects, and programs. Built with a Node.js/Express REST API backend, MongoDB database, Redis caching, and a React/TypeScript frontend with Redux state management.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [Project Structure](#project-structure)
6. [Data Models](#data-models)
7. [API Reference](#api-reference)
8. [Authentication & Security](#authentication--security)
9. [Rate Limiting](#rate-limiting)
10. [Frontend Architecture](#frontend-architecture)
11. [State Management](#state-management)
12. [Getting Started](#getting-started)
13. [Environment Variables](#environment-variables)
14. [Known Issues & TODOs](#known-issues--todos)

---

## Project Overview

The Campus Attendance Management System is designed to streamline attendance tracking across three user roles:

- **Admin**: Manages programs (courses), subjects, and class offerings. Can enroll/unenroll students.
- **Teacher**: Views assigned classes and marks daily attendance for students.
- **Student**: Views enrolled classes and checks their personal attendance records.

The system supports a hierarchical data model: **Program → Subject → Class Offering → Attendance Record**.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend (React/Vite)                  │
│  Redux Store │ React Router │ Axios Interceptors │ Tailwind   │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP/REST (JSON)
┌────────────────────────▼─────────────────────────────────────┐
│                     Backend (Express.js)                       │
│  Auth Middleware │ Rate Limiters │ Error Handler │ Controllers │
└────────┬──────────────────────────────────────┬──────────────┘
         │                                      │
┌────────▼────────┐                  ┌──────────▼──────────────┐
│   MongoDB       │                  │   Redis                  │
│  (Mongoose ODM) │                  │  - Refresh tokens        │
│  - Users        │                  │  - User cache            │
│  - Classes      │                  │  - Role-based limiter    │
│  - Attendance   │                  │  - Rate limit store      │
│  - Subjects     │                  └─────────────────────────┘
│  - Courses      │
└─────────────────┘
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Primary database and ODM |
| Redis (`ioredis`) | Token caching, rate limit storage |
| JSON Web Tokens (JWT) | Access token authentication |
| bcryptjs | Password hashing, refresh token hashing |
| express-rate-limit + rate-limit-redis | Rate limiting |
| dotenv | Environment configuration |
| cookie-parser | HTTP-only cookie handling |
| cors | Cross-origin resource sharing |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool and dev server |
| Redux Toolkit | Global state management |
| React Router v6 | Client-side routing |
| Axios | HTTP client with interceptors |
| Tailwind CSS v4 | Utility-first styling |
| Framer Motion | Animations |
| Lucide React | Icon library |

---

## Features

### Admin
- Create, view, update, and delete **Programs** (courses)
- Create, view, update, and delete **Subjects** linked to programs
- Create, view, update, and delete **Class Offerings** linked to subjects and programs
- Assign a primary teacher to each class by CMS ID (validated in real-time)
- Enroll and unenroll students by CMS ID (with real-time validation)
- Define weekly class **schedules** (day, time, room) per class offering
- View an overview dashboard with counts of programs, subjects, and classes

### Teacher
- View all classes where they are the primary teacher
- Mark attendance (present / absent / late) for each student in a class
- Attendance is recorded per-student per-class per-date

### Student
- View all enrolled classes
- View personal attendance record for each class (date, subject, status)
- Visual attendance summary with percentage, present/absent/late/excused counts

### Authentication
- Register and login with university-format email (`@university.edu.in`)
- Role-based access: admin, teacher, student
- JWT access tokens (1-hour expiry) with HTTP-only cookie refresh tokens (7-day expiry)
- Token refresh via `/api/auth/refresh`
- Secure logout with token invalidation in Redis and database

---

## Project Structure

```
project-root/
├── backend/
│   ├── controllers/
│   │   ├── attendanceController.js   # Attendance CRUD logic
│   │   ├── authControllers.js        # Register, login, logout, refresh
│   │   ├── classController.js        # Class offering CRUD + enrollment
│   │   ├── courseController.js       # Program CRUD
│   │   └── subjectController.js      # Subject CRUD
│   ├── middleware/
│   │   ├── asyncHandle.js            # Async error wrapper
│   │   ├── authMiddleware.js         # JWT protect + role authorizer
│   │   ├── errorHandler.js           # Global error handler
│   │   └── rateLimiter.js            # strict / moderate / role-based limiters
│   ├── models/
│   │   ├── attendance.js             # Attendance schema
│   │   ├── class.js                  # Class offering + schedule slot schemas
│   │   ├── courses.js                # Program/Course schema
│   │   ├── payment.js                # Payment schema (not yet wired up)
│   │   ├── subject.js                # Subject schema
│   │   └── user.js                   # User schema with CMS ID generation
│   ├── Routes/
│   │   ├── attendanceRoutes.js
│   │   ├── auth.js
│   │   ├── classRoutes.js
│   │   ├── courseRoutes.js
│   │   └── subjectRoute.js
│   ├── utils/
│   │   ├── errorClasses.js           # Custom error types
│   │   └── redisClient.js            # Shared Redis client instance
│   └── index.js                      # App entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Layout.tsx
        │   ├── ProtectedRoute.tsx
        │   └── ui/                   # Shared UI primitives (Button, Input, Card)
        ├── features/
        │   ├── Auth/authSlice.ts     # Login, register, logout, refresh thunks
        │   ├── attendance/attendanceSlice.ts
        │   ├── class/classSlice.ts
        │   ├── course/courseSlice.ts
        │   ├── subject/subjectSlice.ts
        │   └── user/userslice.ts
        ├── pages/
        │   ├── Login.tsx
        │   ├── Signup.tsx
        │   ├── MarkAttendance.tsx
        │   ├── StudentDashboard.tsx
        │   ├── StudentAttendanceRecord.tsx
        │   ├── TeacherDashboard.tsx
        │   └── admin/
        │       ├── AdminDashboard.tsx
        │       ├── Classes.tsx
        │       ├── Courses.tsx
        │       └── Subjects.tsx
        ├── services/
        │   ├── api.ts                # Axios instance + interceptors
        │   ├── attendanceService.ts
        │   ├── authServices.ts
        │   ├── classService.ts
        │   ├── courseServices.ts
        │   └── subjectServices.ts
        ├── store/store.ts
        ├── types/index.ts
        └── App.tsx
```

---

## Data Models

### User
```
cmsid        String    Auto-generated: currentYear + 4 random digits (e.g., 20240391)
name         String    Required
email        String    Unique; must match @university.edu.in
password     String    Bcrypt-hashed
role         Enum      admin | teacher | student (default: student)
assignedClasses  [ObjectId]  Ref: Class
refreshToken String    Bcrypt-hashed refresh token
```
CMS IDs are generated on first save using a loop that guarantees uniqueness.

### Course (Program)
```
name         String    Unique (e.g., "BE Computer Science")
description  String
duration     String    (e.g., "4 Years")
coordinator  ObjectId  Ref: User
```

### Subject
```
name         String
code         String    Unique (e.g., "CS301")
description  String
program      ObjectId  Ref: Course
type         Enum      Theory | Lab
credits      Number
```

### Class Offering
```
subject         ObjectId  Ref: Subject
program         ObjectId  Ref: Course
sectionName     String    (e.g., "A", "Group 2")
primaryTeacher  ObjectId  Ref: User (teacher)
students        [ObjectId] Ref: User (students)
schedule        [ScheduleSlot]
academicYear    String    (e.g., "2024-2025")
semester        Enum      Fall | Spring | Summer | Odd | Even | Yearly
startDate       Date
endDate         Date
```
**Unique index**: `{ subject, program, sectionName, academicYear, semester }`

**ScheduleSlot** (embedded):
```
dayOfWeek       Enum      Monday–Sunday
startTime       String    (e.g., "09:00")
endTime         String
room            String
assignedTeacher ObjectId  Ref: User (optional override)
```

### Attendance
```
class       ObjectId  Ref: Class
student     ObjectId  Ref: User
date        Date
status      Enum      present | absent | late | excused
markedBy    ObjectId  Ref: User (teacher)
slotTime    String    Optional
```
**Unique index**: `{ class, student, date, slotTime }` — prevents duplicate attendance records.

---

## API Reference

Base URL: `http://localhost:5000/api`

### Auth Routes (`/api/auth` or `/api/users`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login and receive tokens |
| POST | `/auth/logout` | Public | Logout and invalidate tokens |
| POST | `/auth/refresh` | Public | Refresh access token via cookie |
| GET | `/users/:role/:cmsid` | Public | Look up a user by role and CMS ID |

**Register/Login Response:**
```json
{
  "message": "Logged in successfully",
  "user": { "id": "...", "cmsid": "20240391", "name": "...", "email": "...", "role": "student" },
  "token": "<access_token>"
}
```

### Course Routes (`/api/courses`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/courses` | Public | Get all programs |
| GET | `/courses/:id` | Public | Get program by ID |
| POST | `/courses` | Admin | Create a program |
| PUT | `/courses/:id` | Admin | Update a program |
| DELETE | `/courses/:id` | Admin | Delete a program |

### Subject Routes (`/api/subjects`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/subjects` | Public | Get all subjects |
| GET | `/subjects/:id` | Public | Get subject by ID |
| POST | `/subjects` | Admin | Create a subject |
| PUT | `/subjects/:id` | Admin | Update a subject |
| DELETE | `/subjects/:id` | Admin | Delete a subject |

### Class Routes (`/api/classes`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/classes` | Public | Get all class offerings |
| GET | `/classes/:id` | Public | Get class by ID |
| POST | `/classes` | Admin | Create a class offering |
| PUT | `/classes/:id` | Admin | Update a class offering |
| DELETE | `/classes/:id` | Admin | Delete a class offering |
| PUT | `/classes/:id/enroll` | Admin | Enroll students into a class |
| PUT | `/classes/:id/unenroll` | Admin | Unenroll students from a class |

### Attendance Routes (`/api/attendance`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/attendance/:classId` | Teacher/Admin | Mark attendance for a class |
| GET | `/attendance/class/:classId` | Public | Get all attendance for a class |
| GET | `/attendance/student/:studentId` | Public | Get all attendance for a student |
| GET | `/attendance/student/:studentId/class/:classId` | Public | Get attendance for student in a specific class |
| PUT | `/attendance/:id` | Teacher/Admin | Update an attendance record |
| DELETE | `/attendance/:id` | Teacher/Admin | Delete an attendance record |

**Mark Attendance Request Body:**
```json
{
  "date": "2024-11-15",
  "records": [
    { "studentId": "<ObjectId>", "status": "present" },
    { "studentId": "<ObjectId>", "status": "absent" }
  ]
}
```

---

## Authentication & Security

The system uses a **dual-token** authentication strategy:

### Access Token
- JWT signed with `JWT_SECRET`
- Expires in **1 hour**
- Sent in the `Authorization: Bearer <token>` header
- Stored in `localStorage` on the frontend

### Refresh Token
- 64-byte random hex string, **bcrypt-hashed** before storage in the database
- Stored in Redis: `refreshToken:<token>` → `userId`
- Sent as an **HTTP-only cookie** (`jwt`) — inaccessible to JavaScript
- Expires in **7 days**
- On refresh: old token is deleted from Redis and DB, new token is issued

### Refresh Flow
1. On 401 response, the Axios interceptor calls `POST /api/auth/refresh`
2. Backend reads the `jwt` cookie, looks up the userId in Redis
3. Falls back to DB lookup if Redis misses
4. Issues a new access token and rotates the refresh token
5. Frontend stores the new access token and retries the original request

### Password Security
- Passwords are hashed with bcrypt (salt rounds: 10) in a Mongoose `pre('save')` hook
- Refresh tokens are also bcrypt-hashed before database storage

### Route Protection
- `protect` middleware: validates JWT, fetches user from DB (excluding password)
- `authorizeRoles(...roles)`: checks `req.user.role` against allowed roles

---

## Rate Limiting

Three layers of rate limiting are implemented using `express-rate-limit` backed by a Redis store.

| Limiter | Window | Max Requests | Key Strategy | Used On |
|---------|--------|-------------|--------------|---------|
| `strictLimiter` | 15 min | 100 | IP + email (if present) | Sensitive read endpoints |
| `moderateLimiter` | 60 min | 200 | IP + email (if present) | Write operations (CUD) |
| `rolebasedLimiter` | Dynamic | Dynamic | Role-aware: admin → moderate, others → strict | Login, class/course reads |

The `rolebasedLimiter` middleware:
1. Checks `req.user.role` if the request is already authenticated
2. Otherwise, looks up the role by email — first in Redis cache (`role:<email>`, TTL 600s), then in MongoDB
3. Falls back to `strictLimiter` on any error

---

## Frontend Architecture

### Routing (`App.tsx`)

Routes are protected via a `<ProtectedRoute>` component that checks the Redux auth state and redirects unauthenticated users to `/login`.

| Path | Component | Roles |
|------|-----------|-------|
| `/login` | Login | Public |
| `/signup` | Signup | Public |
| `/student` | StudentDashboard | student |
| `/student/attendance/:classId` | StudentAttendanceRecord | student |
| `/teacher` | TeacherDashboard | teacher |
| `/teacher/class/:classId` | MarkAttendance | teacher |
| `/admin` | AdminDashboard | admin |
| `/admin/classes` | AdminClasses | admin |
| `/admin/courses` | AdminCourses | admin |
| `/admin/subjects` | AdminSubjects | admin |

### Axios Interceptors (`services/api.ts`)

- **Request interceptor**: Attaches `Authorization: Bearer <token>` from `localStorage`
- **Response interceptor**: On 401, attempts a silent token refresh; if refresh fails, clears storage and redirects to `/login`

### Session Persistence (`App.tsx`)

On application load, if an `accessToken` exists in `localStorage`, `dispatch(refreshToken())` is called to verify the session is still valid. A loading spinner is shown during this check.

---

## State Management

The Redux store contains six slices:

| Slice | State Shape | Key Actions |
|-------|-------------|-------------|
| `auth` | `{ user, token, loading, error }` | `login`, `register`, `logout`, `refreshToken` |
| `user` | `{ user, users, isAuthenticated, status, error }` | `loginUser`, `registerUser`, `fetchUsers` |
| `course` | `{ courses, status, error }` | `fetchCourses`, `createCourse` |
| `subject` | `{ subjects, status, error }` | `fetchSubjects`, `createSubject` |
| `class` | `{ offerings, selectedClass, status, error }` | `fetchClasses`, `fetchClassOffering`, `createClass`, `updateClass`, `deleteClass` |
| `attendance` | `{ records, status, error }` | `fetchAttendanceByClass`, `fetchAttendanceByStudent`, `fetchAttendanceByStudentAndClass`, `markAttendance`, `updateAttendance` |

> **Note:** There are currently two auth-related slices: `auth` (in `features/Auth/authSlice.ts`) and `user` (in `features/user/userslice.ts`). The `user` slice is what most pages read from (`state.user.user`). The `auth` slice handles the token-refresh flow on app load.

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Redis (local or cloud, e.g., Redis Cloud)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (see [Environment Variables](#environment-variables) below).

```bash
node index.js
# Server starts on port 5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Vite dev server starts on http://localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Redis
redis-username=default
redis-password=your_redis_password
redis-host=your_redis_host
redis-port=6379
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Known Issues & TODOs

### Backend Issues

1. **`handleRefreshToken` is broken** (`authControllers.js`): The function references the `User` model class directly instead of the authenticated user instance. This endpoint does not work as implemented — the working refresh logic lives in `refreshAccessToken`, which is not currently exported to the router.

2. **`createSubject` has a stale `res.send(error)` call**: In `subjectController.js`, there is an erroneous `res.send(error)` before the `throw new ValidationError(...)` line, which would cause a response-already-sent error.

3. **Attendance GET routes lack authentication**: `getAttendanceByClass` and `getAttendanceByStudent` do not use the `protect` middleware, meaning attendance data is publicly accessible.

4. **`Payment` model is unused**: The model is defined but no routes, controllers, or frontend service exist for payments.

### Frontend TODOs

1. **Edit/Delete on Courses and Subjects pages**: The Edit and Delete buttons on `AdminCourses.tsx` and `AdminSubjects.tsx` render correctly but have no `onClick` handlers — they are not yet implemented.

2. **Duplicate Provider in `main.tsx`**: `<Provider store={store}>` is present in both `main.tsx` and `App.tsx`. The outer one in `main.tsx` is redundant.

3. **Dual auth slices**: The `auth` slice and `user` slice have overlapping responsibilities (both store the current user and handle login/register). These should be consolidated into a single slice.

4. **`fetchUsers` endpoint**: `authService.getAllUsers()` calls `GET /api/users`, which maps to the auth router. The auth router has no `GET /` handler, so this will return 404. A dedicated users list endpoint is needed.

5. **`classService.ts` has unused methods**: `getTeacherClasses` and `getStudentClasses` reference endpoints (`/classes/teacher/:id`, `/classes/student/:id`) that do not exist on the backend.
