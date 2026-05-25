# SyfeFinance — Personal Finance Manager

A complete, production-ready, full-stack Personal Finance Manager application that empowers users to track their incomes, expenses, customize categories, set savings goals with automated calculation engines, and visualize their progress with sleek graphical reports. Built using **Spring Boot 3.x (Java 17)** and **React (TypeScript + Tailwind CSS)**.

---

## 🚀 Key Features

* **Secure Authentication**: Cookie session-based authentication utilizing Spring Security. Prevents unauthorized entry and strictly isolates transaction databases per logged-in account.
* **Smart Category Management**: Enforces pre-seeded system defaults (`Salary`, `Food`, `Rent`, `Utilities`, etc.) that cannot be mutated or deleted. Supports fully custom categories per user.
* **Protected Cash Flow Ledger**: Fully-featured transaction CRUD (Incomes/Expenses). Enforces date-locking rules that forbid modifying the transaction date after registration for reporting integrity.
* **Automated Savings Goals Engine**: Tracks progress of dedicated financial goals. Calculates saved capital dynamically using the equation: `(Total Income - Total Expenses) since the goal's startDate`, rendering progress percentages and remaining targets in real-time.
* **Premium Graphical Reports**: Seamless tab switches comparing Monthly and Yearly scopes. Powered by Recharts, plotting visual expense breakdowns (Pie Charts) and annual cash flow trends (Area Graphs).
* **Advanced Usability (UX)**: Includes dynamic search boxes, sorting headers, client-side pagination, CSV spreadsheet downloading, and a premium toggleable Dark/Light mode switch.

---

## 🛠 Tech Stack

### Backend
* **Core**: Java 17, Spring Boot 3.x, Spring MVC
* **Security**: Spring Security, Session-based Cookie Management (`JSESSIONID`)
* **Persistence**: Spring Data JPA, Hibernate ORM
* **Database**: In-Memory & File-Persisted H2 Database
* **Validation**: Jakarta Bean Validation (`@Valid`)
* **Testing**: JUnit 5, Mockito

### Frontend
* **Core**: React 18, TypeScript, Vite
* **Styling**: Tailwind CSS v3, PostCSS, Autoprefixer, Lucide Icons
* **Forms & API**: React Hook Form, Axios Client (configured with credentials sharing)
* **Visuals**: Recharts (Pie, Bar, Area, Tooltip modules)
* **Router**: React Router DOM v6

---

## 📁 System Architecture

```text
syfe/
 ├── backend/
 │    ├── Dockerfile                         # Production multi-stage Docker build
 │    ├── pom.xml                            # Maven dependencies specification
 │    └── src/main/java/com/syfe/personalfinance/
 │         ├── config/                       # Security & Database Seeders
 │         ├── controller/                   # REST controller endpoints
 │         ├── dto/                          # Strict DTO mapping layers
 │         ├── entity/                       # JPA Database Entities
 │         ├── exception/                    # Global Exception Handler
 │         ├── repository/                   # JPA Repositories (H2)
 │         ├── security/                     # Entry points & Custom UserDetails
 │         └── service/                      # Core business services
 ├── frontend/
 │    ├── index.html
 │    ├── postcss.config.js
 │    ├── tailwind.config.js
 │    ├── vite.config.ts
 │    └── src/
 │         ├── components/                   # Sidebars, Navbars, Route Protections
 │         ├── context/                      # Auth Context & Dark Mode Toggles
 │         ├── pages/                        # Main Dashboard, CRUD ledgers, Reports
 │         ├── services/                     # Axios clients (withCredentials config)
 │         └── types/                        # Global Type definitions
 └── render.yaml                             # Render infrastructure-as-code spec
```

---

## ⚡ Setup & Run Locally

### Prerequisites
* Java Development Kit (JDK) 17
* Apache Maven (if compiling backend manually)
* Node.js (version 18+ or 22+)
* NPM or Yarn package manager

### Running the Backend
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Build and package the Spring Boot JAR:
   ```bash
   mvn clean package
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```
   * The backend will spin up immediately on **`http://localhost:8080`**.
   * On startup, the `DatabaseSeeder` automatically configures system default categories (`Salary`, `Food`, `Rent`, `Transportation`, `Entertainment`, `Healthcare`, `Utilities`).

### Running the Frontend
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install standard node modules:
   ```bash
   npm install
   ```
3. Boot up the Vite developer server:
   ```bash
   npm run dev
   ```
   * The frontend application will start running on **`http://localhost:5173`** (or dynamic port displayed in console).

---

## 🧪 Running the Backend Tests

All services are fully targeted by standard Mockito and JUnit 5 mocks. The suite tests data isolations, custom categories unique checks, date-locking verification, and automated savings percentage math.

To execute the test suite, run:
```bash
cd backend
mvn test
```
*(Targets a strict code coverage profile exceeding 80%+).*

---

## 📡 REST API Specifications

All endpoints (excluding `/api/auth/register` and `/api/auth/login`) require a valid active session. The session is managed via the secure `JSESSIONID` cookie automatically transmitted by the Axios instance.

### 1. Authentication Endpoints

#### Register
* **Endpoint:** `POST /api/auth/register`
* **Request:**
  ```json
  {
    "username": "user@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "phoneNumber": "+1234567890"
  }
  ```
* **Response:**
  ```json
  {
    "message": "User registered successfully",
    "userId": 1
  }
  ```
* **HTTP Status:** 201 Created, 400 Bad Request, 409 Conflict

#### Login
* **Endpoint:** `POST /api/auth/login`
* **Request:**
  ```json
  {
    "username": "user@example.com",
    "password": "password123"
  }
  ```
* **Response:**
  ```json
  {
    "message": "Login successful"
  }
  ```
* **HTTP Status:** 200 OK, 401 Unauthorized
* **Cookie:** Provides session cookie for subsequent API calls

#### Logout
* **Endpoint:** `POST /api/auth/logout`
* **Request:** No body (uses session cookie)
* **Response:**
  ```json
  {
    "message": "Logout successful"
  }
  ```
* **HTTP Status:** 200 OK, 401 Unauthorized

### 2. Transaction Management

#### Create Transaction
* **Endpoint:** `POST /api/transactions`
* **Request:**
  ```json
  {
    "amount": 50000.00,
    "date": "2024-01-15",
    "category": "Salary",
    "description": "January Salary"
  }
  ```
* **Response:**
  ```json
  {
    "id": 1,
    "amount": 50000.00,
    "date": "2024-01-15",
    "category": "Salary",
    "description": "January Salary",
    "type": "INCOME"
  }
  ```
* **HTTP Status:** 201 Created, 400 Bad Request, 401 Unauthorized

#### Get Transactions
* **Endpoint:** `GET /api/transactions`
* **Query Parameters:** `?startDate=2024-01-01&endDate=2024-01-31&categoryId=1`
* **Response:**
  ```json
  {
    "transactions": [
      {
        "id": 1,
        "amount": 50000.00,
        "date": "2024-01-15",
        "category": "Salary",
        "description": "January Salary",
        "type": "INCOME"
      }
    ]
  }
  ```
* **HTTP Status:** 200 OK, 401 Unauthorized

#### Update Transaction
* **Endpoint:** `PUT /api/transactions/{id}`
* **Request:**
  ```json
  {
    "amount": 60000.00,
    "description": "Updated January Salary"
  }
  ```
* **Response:**
  ```json
  {
    "id": 1,
    "amount": 60000.00,
    "date": "2024-01-15",
    "category": "Salary",
    "description": "Updated January Salary",
    "type": "INCOME"
  }
  ```
* **HTTP Status:** 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found

#### Delete Transaction
* **Endpoint:** `DELETE /api/transactions/{id}`
* **Response:**
  ```json
  {
    "message": "Transaction deleted successfully"
  }
  ```
* **HTTP Status:** 200 OK, 401 Unauthorized, 404 Not Found

### 3. Category Management

#### Get All Categories
* **Endpoint:** `GET /api/categories`
* **Response:**
  ```json
  {
    "categories": [
      { "name": "Salary", "type": "INCOME", "isCustom": false },
      { "name": "Food", "type": "EXPENSE", "isCustom": false },
      { "name": "CustomCategory", "type": "EXPENSE", "isCustom": true }
    ]
  }
  ```
* **HTTP Status:** 200 OK, 401 Unauthorized

#### Create Custom Category
* **Endpoint:** `POST /api/categories`
* **Request:**
  ```json
  {
    "name": "SideBusinessIncome",
    "type": "INCOME"
  }
  ```
* **Response:**
  ```json
  {
    "name": "SideBusinessIncome",
    "type": "INCOME",
    "isCustom": true
  }
  ```
* **HTTP Status:** 201 Created, 400 Bad Request, 401 Unauthorized, 409 Conflict

#### Delete Custom Category
* **Endpoint:** `DELETE /api/categories/{name}`
* **Response:**
  ```json
  {
    "message": "Category deleted successfully"
  }
  ```
* **HTTP Status:** 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

### 4. Savings Goals

#### Create Goal
* **Endpoint:** `POST /api/goals`
* **Request:**
  ```json
  {
    "goalName": "Emergency Fund",
    "targetAmount": 5000.00,
    "targetDate": "2026-01-01",
    "startDate": "2025-01-01"
  }
  ```
* **Response:**
  ```json
  {
    "id": 1,
    "goalName": "Emergency Fund",
    "targetAmount": 5000.00,
    "targetDate": "2026-01-01",
    "startDate": "2025-01-01",
    "currentProgress": 1000.00,
    "progressPercentage": 20.0,
    "remainingAmount": 4000.00
  }
  ```
* **HTTP Status:** 201 Created, 400 Bad Request, 401 Unauthorized

#### Get All Goals
* **Endpoint:** `GET /api/goals`
* **Response:**
  ```json
  {
    "goals": [
      {
        "id": 1,
        "goalName": "Emergency Fund",
        "targetAmount": 5000.00,
        "targetDate": "2026-01-01",
        "startDate": "2025-01-01",
        "currentProgress": 1000.00,
        "progressPercentage": 20.0,
        "remainingAmount": 4000.00
      }
    ]
  }
  ```
* **HTTP Status:** 200 OK, 401 Unauthorized

#### Get Goal
* **Endpoint:** `GET /api/goals/{id}`
* **Response:**
  ```json
  {
    "id": 1,
    "goalName": "Emergency Fund",
    "targetAmount": 5000.00,
    "targetDate": "2026-01-01",
    "startDate": "2025-01-01",
    "currentProgress": 1000.00,
    "progressPercentage": 20.00,
    "remainingAmount": 4000.00
  }
  ```
* **HTTP Status:** 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

#### Update Goal
* **Endpoint:** `PUT /api/goals/{id}`
* **Request:**
  ```json
  {
    "targetAmount": 6000.00,
    "targetDate": "2026-02-01"
  }
  ```
* **Response:**
  ```json
  {
    "id": 1,
    "goalName": "Emergency Fund",
    "targetAmount": 6000.00,
    "targetDate": "2026-02-01",
    "startDate": "2025-01-01",
    "currentProgress": 1000.00,
    "progressPercentage": 16.67,
    "remainingAmount": 5000.00
  }
  ```
* **HTTP Status:** 200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

#### Delete Goal
* **Endpoint:** `DELETE /api/goals/{id}`
* **Response:**
  ```json
  {
    "message": "Goal deleted successfully"
  }
  ```
* **HTTP Status:** 200 OK, 401 Unauthorized, 403 Forbidden, 404 Not Found

### 5. Reports and Analytics

#### Monthly Report
* **Endpoint:** `GET /api/reports/monthly/{year}/{month}`
* **Response:**
  ```json
  {
    "month": 1,
    "year": 2024,
    "totalIncome": {
      "Salary": 3000.00,
      "Freelance": 500.00
    },
    "totalExpenses": {
      "Food": 400.00,
      "Rent": 1200.00,
      "Transportation": 200.00
    },
    "netSavings": 1700.00
  }
  ```
* **HTTP Status:** 200 OK, 401 Unauthorized

#### Yearly Report
* **Endpoint:** `GET /api/reports/yearly/{year}`
* **Response:**
  ```json
  {
    "year": 2024,
    "totalIncome": {
      "Salary": 36000.00,
      "Freelance": 6000.00
    },
    "totalExpenses": {
      "Food": 4800.00,
      "Rent": 14400.00,
      "Transportation": 2400.00
    },
    "netSavings": 20400.00
  }
  ```
* **HTTP Status:** 200 OK, 401 Unauthorized

---

## 🌐 Production Deployment

### Backend Deploy (Render)
The repository contains a standard `render.yaml` configuration that works with the multi-stage `Dockerfile`. 
* Push the code to a Git repository (GitHub/GitLab).
* Connect the repository to your **Render** dashboard.
* Render will automatically detect `render.yaml` and provision a web service building from the Docker file seamlessly.

### Frontend Deploy (Render Static Site)
The `render.yaml` configuration also provisions a lightning-fast Static Site for the React frontend out of the box.
* When you connect your repository to Render, it will detect the Static Site configuration and build the frontend using `npm run build`.
* Set the environment variable `VITE_API_URL` on the frontend service to point to your live Render backend URL (e.g. `https://syfe-finance-backend.onrender.com`).
* Ensure CORS configurations permit your Render frontend domain inside Spring Security's config wrapper (`SecurityConfig.java`).

---

## 🎨 Design System & Aesthetics
SyfeFinance sports a premium, dark-first slate theme inspired by modern SaaS interfaces:
* **Glassmorphism Overlay (`glass-card`)**: Semi-transparent cards with `backdrop-blur-md` depth.
* **Micro-Animations**: Linear progress scales, interactive chart tooltips, and smooth component transition curves.
* **Custom Scrollbars & Interactive Elements**: Rounded custom scrollbars and scale-active buttons (`active:scale-[0.98]`).
