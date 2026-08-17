<p align="center">
  <img src="./frontend/public/logo.png" alt="EventHub Logo" width="120" />
</p>

# EventHub

**A Premium, High-Fidelity Event Management and Ticketing Engine.**

EventHub is a modern event management platform inspired by the minimalist, high-fidelity aesthetic of platforms like Luma. It provides a seamless, edge-to-edge experience for discovering, registering for, and managing events, featuring robust role-based access control and automated email ticketing.

---

## About The Project
Traditional event management systems are often bloated and visually unappealing. EventHub solves this by focusing on a premium user experience and lightweight, high-performance architecture:

- **Edge-to-Edge Aesthetic**: Escapes standard global CSS wrappers to deliver immersive, full-width landing pages with floating visual elements.
- **Role-Based Access Control**: Secure JWT authentication ensuring standard users can only view and book events, while administrators have full CRUD capabilities.
- **Automated Ticketing**: Integrates with Nodemailer to instantly dispatch HTML ticket confirmations upon successful registration.
- **Raw SQL Performance**: Bypasses heavy ORMs in favor of highly optimized, raw PostgreSQL queries for maximum database efficiency.

---

## Key Features
- **Custom UI Architecture**: Built completely without CSS frameworks to allow for hyper-specific styling, transparent navigation, and floating micro-animations.
- **Real-Time Registration Tracking**: Administrators can monitor available seats, total registrations, and live capacity in real-time.
- **JWT Stateless Authentication**: Secure, horizontal-scalable authentication utilizing HTTP-bearer tokens stored in memory.
- **Bcrypt Password Hashing**: Industry-standard cryptographic salt and hashing for user security.
- **Zod Payload Validation**: Strict TypeScript-first schema validation preventing malformed data from hitting the database.

---

### 1. High-Level Architecture Overview
```mermaid
flowchart TB
    subgraph ClientLayer["Client & User Touchpoints"]
        WebUI["Web App (React 18 / Vite)"]
    end

    subgraph BackendLayer["EventHub Core Engine (Express Backend)"]
        APIRouter["API Gateway & Express Router"]
        AuthEngine["Authentication & RBAC Engine"]
        EventEngine["Event & Capacity Engine"]
        TicketEngine["Ticketing & Registration Engine"]
    end

    subgraph DataLayer["Data & Communication Layer"]
        SMTP["Nodemailer / Ethereal SMTP"]
        DB[(PostgreSQL Database)]
    end

    WebUI -->|REST Requests| APIRouter

    APIRouter --> AuthEngine
    APIRouter --> EventEngine
    APIRouter --> TicketEngine

    AuthEngine <-->|Verify JWT & Hash| DB
    EventEngine <-->|Raw SQL Queries| DB
    TicketEngine <-->|Transaction & Capacity Check| DB

    TicketEngine -->|Generate Ticket HTML| SMTP
    SMTP -->|Dispatch Email| ClientLayer
```

---

### 2. Ticketing & Registration Flow
```mermaid
flowchart LR
    User["User Clicks Register"] --> AuthCheck{"Is Authenticated?"}
    AuthCheck -->|No| Login["Redirect to Login"]
    AuthCheck -->|Yes| CapacityCheck{"Check Event Capacity"}
    
    CapacityCheck -->|Sold Out| Error["Return 400: Event Full"]
    CapacityCheck -->|Available| Transaction["Begin SQL Transaction"]
    
    Transaction --> Deduct["Decrement Available Seats"]
    Deduct --> Insert["Insert Registration Record"]
    Insert --> Commit["Commit Transaction"]
    
    Commit --> EmailTrigger["Trigger Email Service"]
    EmailTrigger --> HTMLGen["Generate Ticket HTML"]
    HTMLGen --> Send["Send via SMTP"]
```

---

### Frontend
![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router_6-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

* **Framework**: React 18 powered by Vite for lightning-fast HMR.
* **Styling**: Custom CSS Design System (Variables, Flexbox, CSS Grid).
* **State Management**: React Context API & Custom Hooks.

---

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

* **Server**: Node.js & Express.
* **Database**: PostgreSQL (using raw `pg` pool).
* **Validation**: Zod schema validation middleware.
* **Email**: Nodemailer with automated Ethereal fallback for local development.

---

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **PostgreSQL**: v14 or higher

---

### Manual Setup
#### 1. Clone the Repository
```bash
git clone https://github.com/Ayush-Srivastava63/EventHub.git
cd EventHub
```

#### 2. Database Initialization
1. Create a PostgreSQL database named `event_management`.
2. The schema will be automatically generated when the backend starts.

#### 3. Setup Backend Server
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/event_management
JWT_SECRET=your_jwt_secret
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=test
SMTP_PASS=test
```

Start the backend server:
```bash
npm run dev
```

#### 4. Setup Frontend Web App
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

---

## Project Structure
```
EventHub/
├── backend/                   
│   ├── src/
│   │   ├── controllers/       # Route logic (Auth, Events, Registrations)
│   │   ├── db/                # Connection pool & schema initialization
│   │   ├── middleware/        # JWT Auth, Zod Validation, Error Handling
│   │   ├── routes/            # Express route definitions
│   │   ├── scripts/           # Admin seeding utilities
│   │   └── services/          # Core business logic and SMTP mailing
├── frontend/                  
│   ├── public/                # Static assets (logo.png)
│   └── src/
│       ├── api/               # Axios client and API wrappers
│       ├── components/        # Reusable UI (Navbar, EventCard, Modal)
│       ├── context/           # AuthContext provider
│       └── pages/             # App routing views (Home, Dashboard, Events)
```

---

## Security & Privacy
- **Stateless Verification**: JWTs are verified strictly in middleware, preventing unauthorized access to protected endpoints without querying the database per request.
- **Password Cryptography**: Passwords are never stored in plaintext. Bcrypt with a 10-round salt ensures high resistance to brute-force and rainbow table attacks.
- **SQL Injection Prevention**: All `pg` database interactions utilize parameterized queries (`$1`, `$2`), eliminating SQL injection vulnerabilities.

---

## License
Distributed under the MIT License. See `LICENSE` for details.
