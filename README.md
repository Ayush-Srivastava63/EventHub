# 🎪 EventHub

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=flat&logo=postgresql&logoColor=white)

EventHub is a modern, premium event management platform inspired by the minimalist, high-fidelity aesthetic of platforms like Luma. It provides a seamless, edge-to-edge experience for discovering, registering for, and managing events.

## ✨ Key Features

- **Premium UI/UX:** A stunning, fully custom dark-mode interface built without heavy CSS frameworks. Features include edge-to-edge gradient hero sections, floating visual cards, and a sleek transparent navigation system.
- **Robust Authentication:** Secure JWT-based authentication system with Role-Based Access Control (RBAC). Differentiates standard users from administrators.
- **Admin Dashboard:** A centralized control panel for event creators to manage events, track registrations, and monitor available seats in real-time.
- **Automated Email Notifications:** Integrates with Nodemailer to dispatch beautiful HTML registration confirmation emails directly to users' inboxes upon successful ticket booking.
- **Responsive Architecture:** Fully responsive layout with custom mobile hamburger menus, ensuring the platform looks incredible on desktops, tablets, and mobile devices.

## 🛠️ Technology Stack

### Frontend
- **React (via Vite):** Chosen for lightning-fast Hot Module Replacement (HMR) and optimized production builds.
- **TypeScript:** Enforces strict type safety across the entire application, preventing runtime errors and improving developer experience.
- **React Router (v6):** Handles client-side routing, protected routes (guards), and dynamic URL parameters.
- **Vanilla CSS (Custom Design System):** We deliberately avoided Tailwind/Bootstrap in favor of a custom CSS variable-driven architecture. This allows for hyper-specific styling (like the edge-to-edge "breakout" hero section and floating micro-animations) without utility-class bloat.

### Backend
- **Node.js & Express:** A lightweight, unopinionated server framework that allows for rapid API development.
- **TypeScript:** Shares types and interfaces with the frontend, ensuring full-stack data consistency.
- **PostgreSQL (via `pg`):** A powerful, open-source object-relational database. We use raw SQL queries via a connection pool to maximize performance and maintain absolute control over data execution.
- **Zod:** A TypeScript-first schema declaration and validation library. Used extensively in middleware to sanitize and validate incoming request payloads before they hit the database.
- **JSON Web Tokens (JWT) & Bcrypt:** Industry-standard tools for stateless authentication and secure password hashing.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)

### 1. Database Setup
1. Create a PostgreSQL database named `event_management`.
2. The necessary tables (`users`, `events`, `registrations`) will automatically initialize when you start the backend server via `init.ts`.

### 2. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory (use `.env.example` as a reference):
   ```env
   PORT=5000
   DATABASE_URL=postgresql://your_db_user:your_db_password@localhost:5432/event_management
   JWT_SECRET=your_super_secret_jwt_string
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=your_ethereal_user
   SMTP_PASS=your_ethereal_pass
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Configuration
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`.

---

## 🏗️ Architecture & Design Decisions

### The "Full-Bleed" Layout Challenge
One of the core design goals was to create an immersive, full-screen hero section while keeping the rest of the application constrained to a readable `1200px` max-width. 
Instead of fighting global CSS wrappers, we implemented a dynamic routing structure in `App.tsx` that conditionally applies layout containers based on the current URL. The landing page escapes all constraints, while internal pages (like the Dashboard) are neatly boxed.

### Stateless Authentication
The application relies entirely on JWTs stored securely in `localStorage` (alongside a user context provider). This eliminates the need for server-side sessions, allowing the backend to scale horizontally without memory bottlenecks.

### Raw SQL vs ORM
We chose to use the raw `pg` driver instead of heavy ORMs like Prisma or TypeORM. This drastically reduces the dependency footprint, completely eliminates the "N+1 query" problem often hidden by ORMs, and allows for highly optimized, handcrafted SQL statements.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
