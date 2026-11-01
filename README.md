# Learning Management System (LMS)

A full-stack Learning Management System built with the MERN stack. Students browse and enroll in courses, watch lessons, take quizzes, track progress and earn certificates. Instructors build and manage courses. Admins moderate the platform.

> **Status:** Backend complete (REST API with 62 automated tests). React frontend in progress.

## Features

**Students**
- Register, log in, manage profile, change password
- Browse published courses with search, category/level filters, sorting and pagination
- Enroll in free courses, access lessons, mark lessons complete
- Resume from the last accessed lesson; progress calculated on the server
- Take quizzes (graded on the server) and view results across multiple attempts
- Earn a certificate after completing all lessons and passing every quiz
- Rate and review enrolled courses

**Instructors**
- Create, edit, delete and publish their own courses (drafts supported)
- Organize courses into sections and lessons, with reordering
- Build multiple-choice quizzes
- View enrolled students, per-course analytics, ratings and quiz pass rates

**Admins**
- Platform dashboard statistics and enrollment statistics
- Search users, suspend and reactivate accounts
- Moderate courses (publish, draft, archive)
- Manage categories

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend (planned) | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express 5, ES modules |
| Database | MongoDB (local Community Server), Mongoose |
| Auth and security | JWT, bcryptjs, express-validator, Helmet, CORS, express-rate-limit |
| Testing | Node built-in test runner, Supertest |

## Architecture

```
lms/
└── backend/
    ├── src/
    │   ├── config/        Database connection
    │   ├── models/        Mongoose schemas
    │   ├── controllers/   Request handling and business logic
    │   ├── routes/        URL to controller wiring
    │   ├── middleware/    Auth, validation, errors, rate limits, sanitizing
    │   ├── services/      Reusable logic (ownership checks, progress, ratings)
    │   ├── validators/    Request validation rules
    │   ├── utils/         Helpers (AppError, pagination, tokens, slugs)
    │   ├── scripts/       Seed scripts
    │   ├── app.js         Express app setup
    │   └── server.js      Entry point
    └── tests/             Automated integration tests
```

**Request flow:** route, then middleware (`protect`, `authorize`), then validator, then `validate`, then controller, then the central error handler on any failure.

### Data model

`User`, `Category`, `Course`, `Section`, `Lesson`, `Enrollment`, `Quiz` (with embedded questions), `QuizAttempt`, `Review`, `Certificate`.

Key relationships: a Course belongs to an instructor (User) and a Category. Sections and Lessons belong to a Course. An Enrollment links a student to a course (unique per pair) and stores progress. Attempts, reviews and certificates link students to courses.

### Key design decisions

- **Authorization on the server:** role checks (`authorize`) and ownership checks (`getCourseForManagement`) live in the backend. Hiding buttons in the UI is never relied on.
- **Safe role policy:** public registration allows only `student` and `instructor`. Admins are created with a seed script.
- **Mass-assignment protection:** controllers copy only whitelisted fields from the request body. Clients cannot set `status`, `role`, `instructorId`, scores or progress.
- **Server-side truth:** progress percentage, quiz grading, completion and certificate eligibility are all computed by the server.
- **Answer protection:** quiz correct answers are never sent to students. Video links are hidden from non-enrolled users, except preview lessons.
- **Duplicate prevention in the database:** unique compound indexes on enrollments, reviews and certificates, so races cannot create duplicates.
- **Instant suspension:** the user is reloaded on every authenticated request, so a suspended account stops working immediately.
- **Consistent responses:** every response uses `{ success, message?, data?, pagination?, errors? }`.

## Getting Started

### Prerequisites
- Node.js 20 or newer
- MongoDB Community Server running locally (default `mongodb://127.0.0.1:27017`)

### Setup

```bash
git clone <your-repo-url>
cd lms/backend
npm install
```

Create `backend/.env` (see the table below), then:

```bash
npm run seed:admin        # creates the first admin account
npm run seed:categories   # creates default categories
npm run dev               # starts the API with auto-restart
```

Check it works: open `http://localhost:5000/api/health`.

### Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | `development` or `production` | `development` |
| `MONGODB_URI` | Local MongoDB connection string | `mongodb://127.0.0.1:27017/lms` |
| `CLIENT_URL` | Frontend origin allowed by CORS | `http://localhost:5173` |
| `JWT_SECRET` | Token signing key, at least 32 characters | long random string |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `ADMIN_NAME` | Seeded admin name | `Admin` |
| `ADMIN_EMAIL` | Seeded admin email | `admin@lms.com` |
| `ADMIN_PASSWORD` | Seeded admin password | a strong password |

Generate a secret with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Never commit `.env`. A template is provided in `.env.example`.

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start with nodemon |
| `npm start` | Start normally |
| `npm test` | Run the automated tests (uses a separate `lms_test` database) |
| `npm run seed:admin` | Create the admin user |
| `npm run seed:categories` | Create default categories |

## Testing

```bash
npm test
```

62 integration tests cover authentication, course CRUD, enrollment, lesson access, progress tracking and role permissions. Tests run against an isolated `lms_test` database and refuse to run on any database whose name does not end in `_test`.

## API Documentation

**Base URL:** `http://localhost:5000/api`

**Authentication:** send `Authorization: Bearer <token>` on protected routes.

**Success response**
```json
{ "success": true, "message": "Optional message", "data": { }, "pagination": { "total": 25, "page": 1, "limit": 12, "totalPages": 3 } }
```

**Error response**
```json
{ "success": false, "message": "Validation failed", "errors": [ { "field": "email", "message": "Please provide a valid email address" } ] }
```

**Status codes:** `200` OK, `201` created, `400` validation error, `401` not logged in or bad token, `403` not allowed, `404` not found, `409` conflict (duplicate), `413` body too large, `429` too many requests.

**Rate limits:** 300 requests per 15 minutes per IP for the whole API. 10 per 15 minutes for login and register.

### Health

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/health` | Public |

### Authentication

| Method | Endpoint | Access | Body |
|--------|----------|--------|------|
| POST | `/auth/register` | Public | `name`, `email`, `password`, `role` (optional: `student` or `instructor`) |
| POST | `/auth/login` | Public | `email`, `password` |
| GET | `/auth/me` | Logged in | none |
| PATCH | `/auth/me` | Logged in | `name`, `bio`, `profileImage` (all optional) |
| PATCH | `/auth/change-password` | Logged in | `currentPassword`, `newPassword` |

Passwords need at least 8 characters, with a letter and a number. Login and register return `{ user, token }`.

### Categories

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/categories` | Public |

### Courses

| Method | Endpoint | Access | Notes |
|--------|----------|--------|-------|
| GET | `/courses` | Public | Published only. Query: `page`, `limit`, `search`, `category`, `level`, `sort` (`newest`, `oldest`, `price_asc`, `price_desc`, `title`, `rating`) |
| GET | `/courses/mine` | Instructor | Own courses including drafts |
| POST | `/courses` | Instructor | Body: `title`, `shortDescription`, `description`, `categoryId`, `level`, `thumbnail`, `price`, `learningObjectives`, `prerequisites`. Created as a draft |
| GET | `/courses/:courseId` | Public | Drafts visible only to owner or admin |
| PATCH | `/courses/:courseId` | Owner or admin | Any editable field |
| DELETE | `/courses/:courseId` | Owner or admin | Also deletes its sections, lessons, enrollments, quizzes, attempts, reviews and certificates |
| PATCH | `/courses/:courseId/publish` | Owner or admin | Body: `{ "publish": true }` (default) or `false`. Needs at least one lesson |

### Sections and lessons

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/courses/:courseId/sections` | Owner or admin |
| GET | `/courses/:courseId/sections` | Public (video links shown only to preview lessons, enrolled students, owner, admin) |
| PATCH | `/courses/:courseId/sections/reorder` | Owner or admin. Body: `{ "sectionIds": [...] }` |
| PATCH | `/sections/:sectionId` | Owner or admin |
| DELETE | `/sections/:sectionId` | Owner or admin |
| POST | `/sections/:sectionId/lessons` | Owner or admin. Body: `title`, `videoUrl`, `description`, `duration` (minutes), `isPreview`, `resources` |
| PATCH | `/sections/:sectionId/lessons/reorder` | Owner or admin. Body: `{ "lessonIds": [...] }` |
| GET | `/lessons/:lessonId` | Preview lessons public, others need enrollment |
| PATCH | `/lessons/:lessonId` | Owner or admin |
| DELETE | `/lessons/:lessonId` | Owner or admin |

A published course cannot lose its last lesson. Unpublish it first.

### Enrollment and progress

| Method | Endpoint | Access | Notes |
|--------|----------|--------|-------|
| POST | `/courses/:courseId/enroll` | Student | Free, published courses only |
| GET | `/enrollments/my-courses` | Student | Paginated |
| GET | `/courses/:courseId/enrollments` | Owner or admin | Paginated, with `completedCount` |
| GET | `/enrollments/:enrollmentId` | Student, owner or admin | |
| PATCH | `/enrollments/:enrollmentId/progress` | Student | Body: `{ "lessonId": "...", "completed": true }`. Server returns `progressPercentage`, `completedLessonIds`, `lastAccessedLessonId`, `isCompleted` |

### Quizzes

| Method | Endpoint | Access | Notes |
|--------|----------|--------|-------|
| POST | `/courses/:courseId/quizzes` | Owner or admin | Body: `title`, `description`, `passingScore` (percent), `sectionId`, `questions` |
| GET | `/courses/:courseId/quizzes` | Enrolled, owner, admin | Summaries only |
| GET | `/quizzes/:quizId` | Enrolled, owner, admin | Students never receive `correctAnswer` |
| PATCH | `/quizzes/:quizId` | Owner or admin | |
| DELETE | `/quizzes/:quizId` | Owner or admin | |
| POST | `/quizzes/:quizId/attempts` | Enrolled student | Max 5 attempts per 24 hours |
| GET | `/quizzes/:quizId/attempts/my-results` | Student | Attempt history |

**Question format**
```json
{ "questionText": "What is React?", "options": ["A database", "A JavaScript library", "An OS"], "correctAnswer": 1, "points": 2 }
```
`correctAnswer` is the zero-based position of the right option.

**Attempt body**
```json
{ "answers": [ { "questionId": "<id>", "selectedOption": 1 } ] }
```
The server returns `score`, `totalPoints`, `percentage`, `passed`, `attemptsLeftToday`, and per-question `isCorrect`.

### Certificates

| Method | Endpoint | Access | Notes |
|--------|----------|--------|-------|
| POST | `/courses/:courseId/certificate` | Student | Issued only if all lessons are complete and every quiz is passed |
| GET | `/certificates/my-certificates` | Student | |
| GET | `/certificates/:certificateId` | Public | For verification. Returns student name, course, instructor and date only |

### Reviews

| Method | Endpoint | Access | Notes |
|--------|----------|--------|-------|
| POST | `/courses/:courseId/reviews` | Enrolled student | Needs at least one completed lesson. Body: `rating` (1 to 5), `comment`. One review per course |
| GET | `/courses/:courseId/reviews` | Public | Paginated, with `ratingAverage` and `ratingCount` |
| PATCH | `/reviews/:reviewId` | Author | |
| DELETE | `/reviews/:reviewId` | Author or admin | |

### Instructor analytics

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/courses/:courseId/analytics` | Owner or admin |
| GET | `/instructor/dashboard` | Instructor |

### Admin

All admin routes require an admin token.

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/admin/dashboard` | Platform statistics and recent activity |
| GET | `/admin/users` | Query: `search`, `role`, `status`, `page`, `limit` |
| PATCH | `/admin/users/:userId/status` | Body: `{ "isActive": false }`. Cannot suspend yourself or another admin |
| GET | `/admin/courses` | Query: `search`, `status`, `category`, `page`, `limit` |
| PATCH | `/admin/courses/:courseId/status` | Body: `{ "status": "published" \| "draft" \| "archived" }` |
| GET | `/admin/enrollments` | Totals, completion rate, enrollments per day, top courses |
| GET | `/admin/categories` | With course counts |
| POST | `/admin/categories` | Body: `name`, `description` |
| PATCH | `/admin/categories/:categoryId` | |
| DELETE | `/admin/categories/:categoryId` | Blocked while courses use it |

## Security Summary

- bcrypt password hashing (cost 12), hashes never returned in responses
- JWT authentication with startup checks for a strong secret
- Role-based access control and resource ownership checks
- Request validation on every route, plus a NoSQL operator sanitizer
- Helmet security headers, restricted CORS, request body size limit
- Rate limiting on the whole API and a stricter limit on login and register
- Centralized error handling with no stack traces in production

## Known Limitations and Future Work

- JWTs are stateless and there is no logout endpoint. Tokens remain valid until they expire (suspended users are still blocked immediately).
- Rate limit counters are in memory. A shared store such as Redis would be needed for multiple servers.
- Only free courses can be enrolled in. Payments are not implemented.
- Videos and images are URLs. File upload is not implemented.
- Tests do not yet cover quizzes, certificates, reviews or analytics.
- Frontend (React, Vite, Tailwind) is the next phase.

## License

ISC
