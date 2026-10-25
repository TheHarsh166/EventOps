# EventOps API Integration & Security Reference

This document provides a comprehensive audit of all integrated frontend and backend API contracts in EventOps. It details route paths, HTTP methods, required roles, payload requirements, response formats, and security invariants.

---

## 1. Authentication & Session Security

The system employs a dual-token architecture:
- **Access Token**: Short-lived JWT stored in memory/localStorage for `Authorization: Bearer <token>` API requests.
- **Refresh Token**: 7-day token stored in an **HttpOnly**, `SameSite=lax` cookie with a cryptographic hash (`tokenHash`) stored in PostgreSQL.
- **Session Auto-Refresh**: Centralized Axios interceptor in `api.js` automatically traps `401 Unauthorized` responses and refreshes the access token transparently without infinite refresh loops.

| Feature | Method | Endpoint | Allowed Roles | Request Body / Query | Response Structure | Frontend Service Caller |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Attendee Signup** | `POST` | `/api/auth/register/attendee` | Public | `{ name, email, password }` | `{ message, user: { id, name, email, role } }` | `authService.registerAttendee` |
| **Organizer Signup**| `POST` | `/api/auth/register/organizer` | Public | `{ name, email, password }` | `{ message, user: { id, name, email, role } }` | `authService.registerOrganizer` |
| **Login** | `POST` | `/api/auth/login` | Public | `{ email, password }` | `{ message, accessToken, user }` + sets HttpOnly cookie | `authService.login` |
| **Token Refresh** | `POST` | `/api/auth/refresh` | Cookie (`refreshToken`) | None | `{ accessToken }` | `api.js (interceptor)` |
| **Logout** | `POST` | `/api/auth/logout` | Authenticated | None | `{ message }` + clears cookie | `authService.logout` |
| **Current User Profile**| `GET` | `/api/users/me` | `ATTENDEE`, `ORGANIZER`, `ADMIN` | None | `{ user: { id, name, email, role } }` | `authService.getCurrentUser` |

---

## 2. Event Management & Discovery

Events have five lifecycle statuses: `DRAFT`, `PENDING_APPROVAL`, `PUBLISHED`, `CANCELLED`, `COMPLETED`.

| Feature | Method | Endpoint | Allowed Roles | Request Body / Query | Response Structure | Frontend Service Caller |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Browse Published**| `GET` | `/api/events` | Public | None | `{ events: Event[] }` | `eventService.getPublishedEvents` |
| **Event Details** | `GET` | `/api/events/:eventId` | Public | None | `{ event: Event }` | `eventService.getEventById` |
| **Organizer Events**| `GET` | `/api/events/organizer/me` | `ORGANIZER`, `ADMIN` | None | `{ success, events: Event[] }` | `eventService.getOrganizerEvents` |
| **Admin All Events**| `GET` | `/api/events/admin/all` | `ADMIN` | `?status=&search=&page=&limit=` | `{ success, events, pagination }` | `adminService.getAllEvents` |
| **Create Event** | `POST` | `/api/events` | `ORGANIZER`, `ADMIN` | `{ title, description, location, startTime, endTime, capacity, approvalRequired, overbookingBuffer }` | `{ message, event }` | `eventService.createEvent` |
| **Update Event** | `PATCH` | `/api/events/:eventId` | `ORGANIZER` (owner) or `ADMIN` | `{ title, description, location, startTime, endTime }` | `{ message, event }` | `eventService.updateEvent` |
| **Publish Event** | `POST` | `/api/events/:eventId/publish`| `ORGANIZER` (owner) or `ADMIN` | None | `{ message, event }` | `eventService.publishEvent` / `adminService.publishEvent` |
| **Cancel Event** | `POST` | `/api/events/:eventId/cancel` | `ORGANIZER` (owner) or `ADMIN` | None | `{ message, event }` | `eventService.cancelEvent` / `adminService.cancelEvent` |

---

## 3. Registrations, Waitlists & Approvals

Seat allocation is strictly managed on the backend using atomic PostgreSQL row decrement operations within Prisma transactions.

| Feature | Method | Endpoint | Allowed Roles | Request Body / Query | Response Structure | Frontend Service Caller |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Register for Event**| `POST` | `/api/events/:eventId/registrations` | `ATTENDEE` | None | `{ success, message, registration }` | `eventService.registerForEvent` |
| **Join Waitlist** | `POST` | `/api/events/:eventId/waitlist` | `ATTENDEE` | None | `{ success, message, registration, waitlistEntry }` | `eventService.joinWaitlist` |
| **My Registrations** | `GET` | `/api/registrations/me` | `ATTENDEE` | None | `{ success, registrations }` | `registrationService.getMyRegistrations` |
| **Cancel Registration**| `PATCH` | `/api/registrations/:id/cancel` | `ATTENDEE` (owner) | None | `{ success, message, registration, promotedAttendee }` | `registrationService.cancelRegistration` |
| **Event Attendees** | `GET` | `/api/events/:eventId/registrations` | `ORGANIZER` (owner) | None | `{ success, registrations }` | `registrationService.getEventRegistrations` |
| **Approve Registration**| `PATCH`| `/api/registrations/:id/approve` | `ORGANIZER` (owner) | None | `{ success, message, registration }` | `registrationService.approveRegistration` |
| **Reject Registration**| `PATCH` | `/api/registrations/:id/reject` | `ORGANIZER` (owner) | None | `{ success, message, registration, promotedAttendee }` | `registrationService.rejectRegistration` |

---

## 4. Payments & Refunds (PayU Integration)

- **Initiation**: The backend signs the transaction hash using `PAYU_MERCHANT_KEY` and `PAYU_MERCHANT_SALT`.
- **Checkout**: The browser POSTs the signed fields to `https://test.payu.in/_payment`.
- **Callback Verification**: PayU sends IPN callbacks to `/api/payments/payu/success` and `/api/payments/payu/failure`. The backend recalculates `SHA512` hash before changing payment status. Browser redirect is never treated as payment proof.
- **Refunds**: Executed through `requestPayURefund` outside the DB transaction to prevent distributed locking.

| Feature | Method | Endpoint | Allowed Roles | Request Body / Query | Response Structure | Frontend Service Caller |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Initiate Payment** | `POST` | `/api/payments/:regId/initiate` | `ATTENDEE` (owner) | None | `{ success, message, action, fields }` | `paymentService.initiatePayment` |
| **Get Payment Details**| `GET` | `/api/payments/:regId` | `ATTENDEE` (owner) | None | `{ success, payment }` | `paymentService.getPayment` |
| **Cancel & Refund** | `POST` | `/api/registrations/:id/refund` | `ATTENDEE` (owner) | None | `{ success, message, refundId, payu }` | `registrationService.requestRefund` |
| **PayU Success Webhook**| `POST` | `/api/payments/payu/success` | Public / PayU | Form POST body | Redirects to `/payment/success` | Browser form submission |
| **PayU Failure Webhook**| `POST` | `/api/payments/payu/failure` | Public / PayU | Form POST body | Redirects to `/payment/failed` | Browser form submission |

---

## 5. Administrative Operations & Analytics

| Feature | Method | Endpoint | Allowed Roles | Request Body / Query | Response Structure | Frontend Service Caller |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **User Directory** | `GET` | `/api/users` | `ADMIN` | `?search=&role=&page=&limit=` | `{ success, users, pagination }` | `adminService.getUsers` |
| **Update User Role** | `PATCH` | `/api/users/:userId/role` | `ADMIN` | `{ role: 'ATTENDEE' \| 'ORGANIZER' \| 'ADMIN' }` | `{ message, user }` | `adminService.updateUserRole` |
| **Platform Analytics**| `GET` | `/api/organizer/analytics/platform` | `ADMIN` | None | `{ success, analytics: { overview, events } }` | `adminService.getPlatformAnalytics` |
| **Organizer Analytics**| `GET` | `/api/organizer/analytics` | `ORGANIZER`, `ADMIN` | None | `{ success, analytics: { overview, eventBreakdown } }` | `analyticsService.getOrganizerAnalytics` |
| **In-App Notifications**| `GET`| `/api/notifications` | `ATTENDEE`, `ORGANIZER`, `ADMIN` | None | `{ success, notifications: Notification[] }` | `notificationService.getNotifications` |
| **Mark Notification Read**| `PATCH`| `/api/notifications/:id/read` | Authenticated (owner) | None | `{ success, notification }` | `notificationService.markAsRead` |
| **Mark All Read** | `PATCH` | `/api/notifications/read-all` | Authenticated | None | `{ success, count }` | `notificationService.markAllAsRead` |
