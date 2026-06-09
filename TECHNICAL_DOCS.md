# Makina Masters Inventory Platform - Technical Architecture

This document outlines the technical stack, system architecture, and inner workings of the Makina Masters Inventory Platform.

## 🏗 Architecture Overview

The platform uses a decoupled **Client-Server Architecture**, but with a specific deployment strategy to handle cross-origin constraints and cookie persistence. 

- **Frontend:** Single Page Application (SPA) built with React.
- **Backend:** RESTful API built with Node.js and Express.
- **Database:** SQLite managed via Prisma ORM.
- **Proxy Layer:** The frontend acts as a reverse proxy for backend requests to bypass CORS limitations and allow secure, same-site cookie exchange.

---

## 🎨 Frontend Stack

- **Framework:** React (bootstrapped with Vite for fast HMR and optimized builds).
- **Styling:** Pure Vanilla CSS. The UI features a modern, dark-themed "glassmorphism" aesthetic with neon accents, custom drop shadows, and an animated HTML5 Canvas starfield background.
- **Routing:** `react-router-dom` for client-side navigation.
- **State Management:** React Context API (`AuthContext`, `CartContext`) to globally manage user sessions and the component request cart.
- **Deployment:** Hosted on **Vercel**. 
  - **Vercel Rewrites:** `vercel.json` is configured with reverse proxy rules. Any request to `makina-inventory.vercel.app/api/*` is seamlessly rewritten and forwarded to the Render backend. This ensures the browser treats the backend as the same origin, preserving HTTP-only authentication cookies.

---

## ⚙️ Backend Stack

- **Runtime:** Node.js.
- **Framework:** Express.js for routing and middleware management.
- **Authentication:** 
  - **JSON Web Tokens (JWT):** Used for session management. Tokens are stored in secure, HTTP-only cookies.
  - **OAuth 2.0:** Integrated with the **42 Intra API**. Members authenticate via 42, and the backend verifies the callback, extracts user data, and issues a session JWT.
  - **Local Auth:** Admins can log in using a standard username/password flow.
- **Email Notifications:** `nodemailer` is configured via SMTP to send automated email alerts to admins whenever a member submits a new component request.
- **File Storage:** `multer` is used to handle multipart form data and save component images locally to the `back/uploads/` directory.
- **Deployment:** Hosted on **Render** (Web Service).
  - Uses a **Persistent Disk** mounted to the backend to ensure that the SQLite database (`dev.db`) and uploaded images are not wiped out during Render's ephemeral container restarts.

---

## 🗄️ Database (Prisma + SQLite)

SQLite was chosen for its file-based simplicity, which is perfectly suited for a low-concurrency club inventory system. **Prisma ORM** provides type safety and easy schema migrations.

**Core Models:**
1. **User:** Stores users (42 Intra students and local Admins). Contains fields for `intraId`, `name`, `role` (ADMIN or MEMBER).
2. **Item:** Represents a physical hardware component. Tracks `name`, `description`, `category`, `totalQuantity`, `availableQuantity`, and an `imageUrl`.
3. **Request:** Tracks a hardware request made by a user. Has a `status` enum (`PENDING`, `APPROVED`, `REJECTED`, `RETURNED`).
4. **RequestItem:** A join table that links specific `Items` to a `Request` along with the requested `quantity`.

---

## 🔐 Authentication & Security Flow

1. **Member Login (42 OAuth):**
   - User clicks "Login with 42 Intra".
   - Frontend redirects to the Express backend (`/auth/42`), which redirects to the 42 API authorization screen.
   - 42 redirects back to the Vercel frontend callback URL.
   - Vercel's proxy catches the `/auth/42/callback` route and forwards it to Render.
   - Render exchanges the code for an access token, fetches the user's 42 profile, creates/updates the User in the SQLite DB, and sets an HTTP-only JWT cookie.
   - The user is securely authenticated without tokens being exposed to JavaScript.

2. **Admin Login:**
   - Admins use the hidden tab on the login page to submit credentials.
   - The backend validates the password and issues the same HTTP-only JWT cookie with an `ADMIN` role payload.

---

## 🚀 Lifecycle of a Component Request

1. **Carting:** A member adds components to their local React state cart.
2. **Checkout:** The frontend POSTs the cart data to `/api/requests`.
3. **Transaction:** The Express backend uses Prisma to:
   - Create a new `Request` record.
   - Map the cart items to `RequestItem` records.
   - Automatically decrement the `availableQuantity` of the requested `Items`.
4. **Notification:** The backend triggers `nodemailer` to dispatch an email to the board members/admins, alerting them of a pending request.
5. **Review:** An admin logs into the dashboard, views the pending request, and clicks "Accept" or "Reject".
   - If rejected, the backend restores the `availableQuantity` of the items.

---

## 🔄 Development & Maintenance Commands

- **Start Frontend:** `npm run dev` (in `/front`)
- **Start Backend:** `npm run dev` (in `/back`)
- **Database Migrations:** `npx prisma migrate dev` (in `/back`)
- **Seed Database:** `npx prisma db seed` (in `/back` - populates the DB with the default sensors, boards, and modules).
