# EventOps

### A scalable event management platform with secure registration, concurrency-safe seat booking, payments, refunds, and waitlist management.

EventOps is a full-stack event management platform designed to handle the complete lifecycle of an event — from event creation and user registration to seat allocation, payments, cancellations, refunds, and waitlist management.

Unlike a basic event CRUD application, EventOps focuses on backend engineering problems that occur when multiple users interact with the same event concurrently.

---

## 🚀 Key Features

### Authentication & Authorization

* User registration and login
* Password hashing
* JWT-based authentication
* Role-based access control
* Separate permissions for attendees and organizers
* Protected API routes
* Resource-level authorization for event ownership

### Event Management

* Create and manage events
* Configure event capacity
* Publish and update events
* View event details
* Organizer-specific event management

### Concurrency-Safe Registration

EventOps is designed to prevent overbooking when multiple users attempt to register for the last available seat simultaneously.

The registration flow uses database transactions and row-level locking to ensure that:

```text
Available Seats = 1

User A ──────┐
             ├──> Database Transaction ──> Only one succeeds
User B ──────┘
```

This prevents race conditions where multiple requests could otherwise reserve the same seat.

### Payment Integration

* Payment creation and verification
* Payment status tracking
* Webhook-based payment updates
* Idempotent payment processing using unique gateway event/payment identifiers

The idempotency layer prevents the same payment event from being processed multiple times.

### Cancellation & Refunds

* Event registration cancellation
* Refund eligibility based on cancellation timing
* Configurable refund tiers
* Refund status tracking

### Waitlist Management

When an event reaches capacity:

```text
Event Full
    ↓
User joins Waitlist
    ↓
Seat becomes available
    ↓
Eligible user selected
    ↓
Temporary claim period
    ↓
User completes registration
```

The waitlist is designed to support ordered allocation and temporary seat claims.

### QR-Based Check-in

Planned functionality for event-day attendance:

* Registration QR generation
* QR validation
* Duplicate check-in prevention
* Attendance tracking

### Notifications

Planned asynchronous notification system for:

* Registration confirmation
* Payment confirmation
* Waitlist promotion
* Seat claim expiry
* Cancellation/refund updates

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │      Frontend       │
                         │      React.js       │
                         └──────────┬──────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌─────────────────────┐
                         │      Express.js     │
                         │      API Server     │
                         └──────────┬──────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                ┌─────────────────┐   ┌─────────────────┐
                │  Auth / RBAC    │   │   Controllers   │
                │   Middleware    │   │                 │
                └─────────────────┘   └────────┬────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │    Services     │
                                      │ Business Logic  │
                                      └────────┬────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │     Prisma      │
                                      │      ORM        │
                                      └────────┬────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │   PostgreSQL    │
                                      │    Database     │
                                      └─────────────────┘
```

External payment services and notification services integrate with the backend through dedicated service modules and webhooks.

---

# 🧠 Engineering Challenges

EventOps is intentionally designed around backend problems that require more than basic CRUD operations.

### 1. Race Conditions During Seat Booking

If only one seat remains:

```text
Request A → Check seats → 1 available
Request B → Check seats → 1 available

Both requests may attempt to book the seat.
```

A simple:

```text
SELECT → CHECK → INSERT
```

is not sufficient under concurrency.

EventOps uses database transactions and row-level locking to make seat allocation atomic.

---

### 2. Payment Idempotency

Payment providers can retry webhook events.

Without idempotency:

```text
Webhook
   ↓
Process Payment
   ↓
Retry Webhook
   ↓
Process Again ❌
```

EventOps tracks unique payment/webhook identifiers so that the same event cannot be processed twice.

---

### 3. Waitlist Allocation

When a cancellation releases a seat, the system must determine which waiting user should receive it.

The system maintains an ordered waitlist and supports temporary seat claims so that a promoted user cannot hold the seat indefinitely.

---

### 4. Authorization

Authentication answers:

> "Who is this user?"

Authorization answers:

> "What is this user allowed to do?"

EventOps uses both role-based and resource-level authorization.

For example:

```text
Attendee
   ├── View events
   ├── Register
   └── Cancel own registration

Organizer
   ├── Create events
   ├── Manage own events
   └── View registrations for own events
```

An organizer should not automatically be allowed to modify another organizer's event simply because both have the same role.

---

# 🗄️ Database

EventOps uses PostgreSQL with Prisma ORM.

Core entities include:

```text
User
 │
 ├────────────── Event
 │                  │
 │                  └── Registration
 │                         │
 │                         ├── Payment
 │                         └── Refund
 │
 └────────────── Registration
```

Additional entities support functionality such as:

* Waitlist management
* Refund tiers
* Payment tracking
* Event ownership
* Registration status
* Check-in

The database schema is maintained using Prisma migrations.

---

# 🔐 Authentication & Authorization Flow

```text
User
 │
 ▼
Login
 │
 ▼
Credentials Verified
 │
 ▼
JWT Generated
 │
 ▼
Protected API Request
 │
 ▼
Authentication Middleware
 │
 ▼
User Identified
 │
 ▼
Role / Resource Authorization
 │
 ▼
Controller
```

Authorization is enforced at the API level rather than relying only on frontend route protection.

---

# 🛠️ Tech Stack

## Frontend

* React.js
* JavaScript
* REST API integration

## Backend

* Node.js
* Express.js
* JavaScript
* JWT Authentication

## Database

* PostgreSQL
* Prisma ORM

## Engineering Concepts

* REST APIs
* Authentication
* RBAC
* Resource-level authorization
* Database transactions
* Row-level locking
* Concurrency control
* Idempotency
* Webhooks
* Queue/waitlist management
* Error handling
* Input validation

---

# 📁 Project Structure

```text
EventOps/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── validators/
│       ├── app.js
│       └── server.js
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── context/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── docs/
│   ├── architecture.md
│   ├── database.md
│   └── api.md
│
├── .gitignore
├── .env.example
├── LICENSE
└── README.md
```

---

# ⚙️ Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* PostgreSQL
* Git

---

## 1. Clone the Repository

```bash
git clone <repository-url>

cd EventOps
```

---

## 2. Setup Backend

```bash
cd backend

npm install
```

Create a `.env` file using `.env.example`.

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/eventops"

JWT_SECRET="your-secret-key"

PORT=5000
```

---

## 3. Setup Database

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

---

## 4. Start Backend

```bash
npm run dev
```

The API will run locally on the configured port.

---

## 5. Setup Frontend

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

---

# 🔌 API Overview

The API follows a RESTful structure.

### Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
```

### Events

```text
GET    /api/events
GET    /api/events/:id
POST   /api/events
PATCH  /api/events/:id
DELETE /api/events/:id
```

### Registrations

```text
POST   /api/events/:eventId/register
GET    /api/registrations
DELETE /api/registrations/:id
```

### Payments

```text
POST   /api/payments/create
POST   /api/payments/webhook
```

> Exact endpoints may change as the implementation evolves.

---

# 🧪 Testing Concurrency

One of the main engineering scenarios tested by EventOps is concurrent registration.

Example:

```text
Event capacity = 100

99 users already registered

Remaining seats = 1

200 concurrent registration requests
              ↓
       Database transaction
              ↓
       Row-level locking
              ↓
     Exactly one reservation
```

The objective is to guarantee that the number of successful registrations never exceeds the configured event capacity.

---

# 🔒 Environment Variables

Secrets and credentials are never committed to the repository.

Create your local `.env` file from:

```text
.env.example
```

Typical environment variables include:

```env
DATABASE_URL=
JWT_SECRET=
PORT=
PAYMENT_SECRET=
PAYMENT_WEBHOOK_SECRET=
```

Actual credentials must remain outside version control.

---

# 📌 Project Status

EventOps is being developed incrementally.

### Completed / In Progress

* [x] Database architecture
* [x] Prisma + PostgreSQL setup
* [x] Authentication foundation
* [x] JWT authentication
* [x] Role-based authorization foundation
* [ ] Resource-level authorization
* [ ] Event management
* [ ] Concurrency-safe registration
* [ ] Payment integration
* [ ] Payment webhook idempotency
* [ ] Cancellation and refunds
* [ ] Waitlist allocation
* [ ] Temporary seat claims
* [ ] Notifications
* [ ] QR check-in
* [ ] Production deployment

Features marked as incomplete are intentionally not presented as production-ready functionality.

---

# 🎯 Future Improvements

Potential future improvements include:

* Redis-based distributed locking where appropriate
* Background job processing
* Rate limiting
* Caching
* Observability and structured logging
* Automated integration testing
* Load testing for concurrent registration
* Containerized deployment
* CI/CD pipeline

These improvements can be added as the core system stabilizes.

---

# 👨‍💻 Author

Built as a full-stack engineering project to explore real-world backend challenges involving:

* Distributed requests
* Database concurrency
* Authentication and authorization
* Payment processing
* Transaction management
* Event-driven workflows

---

## ⭐ Why EventOps?

Most event-management projects primarily demonstrate CRUD operations.

EventOps focuses on the problems that become difficult when multiple users interact with the same resources simultaneously.

The goal is to build an event platform where correctness matters under real-world conditions — particularly around **seat allocation, payments, cancellations, and waitlist management**.
