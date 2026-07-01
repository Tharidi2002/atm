# ATM Security Monitoring System

A comprehensive monitoring and management system designed for tracking and managing ATM machine security alerts across multiple banks, branches, and zones. The application consists of a Spring Boot backend API, a React + Vite frontend dashboard, and a MySQL database.

---

## 🏗️ Architecture & Project Structure

The project is structured into three main components:

1. **`atm-security-service/`**
   * **Technology**: Java 17, Spring Boot 3.4.4, JPA/Hibernate, Spring Security (JWT authentication).
   * **Role**: Exposes REST endpoints for managing users, banks, branches, ATMs, and alert handling.
2. **`atm-security-dashboard/`**
   * **Technology**: React, Vite, Tailwind CSS, Axios.
   * **Role**: Admin and user dashboard for real-time monitoring of alerts, managing ATM nodes, and handling alerts.
3. **`atm_security_db.sql`**
   * **Technology**: MySQL 8.
   * **Role**: Schema definitions, views for reporting, indexes, and stored procedures for alerts.

---

## 🌟 Key Features

* **Role-Based Access Control (RBAC)**: Supports roles: `SUPER_ADMIN`, `BANK_ADMIN`, `BRANCH_ADMIN`, and `BANK_USER`.
* **Bank & Branch Hierarchy**: Manage organizations, branches, and specific ATM nodes.
* **Real-time Alert Logging**: Track ATM alerts by zone number, type, and raw packet details.
* **Alert Resolution Workflow**: Transitions alerts from `PENDING` ➡️ `ACKNOWLEDGED` ➡️ `RESOLVED` with user tracking and notes.
* **Predefined Database Views**: Optimized performance for reporting through views (`v_recent_alerts`, `v_alert_summary`).
* **Stored Procedures**: Efficient querying of branch-specific alerts and transactional resolution updates.

---

## 🛠️ Tech Stack

### Backend
* **Java** 17
* **Spring Boot** 3.4.4 (Starter Web, Data JPA, Security)
* **JWT (jjwt-api 0.12.6)** for token-based authentication
* **Lombok** for boilerplate reduction
* **Maven** (packaged with `mvnw` wrapper)

### Frontend
* **React** + **Vite**
* **Tailwind CSS** (for utility-first styling)
* **ESLint** (linting configuration setup)

### Database
* **MySQL 8**

---

## 🚀 Getting Started

### 1. Database Setup
1. Open your MySQL client (e.g., MySQL Workbench or CLI).
2. Execute the setup script:
   ```sql
   SOURCE /path/to/atm_security_db.sql;
   ```
   *This creates the `atm` database, tables, views, stored procedures, and indexes.*

### 2. Backend Setup (`atm-security-service`)
1. Navigate to the backend directory:
   ```bash
   cd atm-security-service
   ```
2. Configure your MySQL credentials in [application.properties](file:///atm/atm-security-service/src/main/resources/application.properties):
   ```properties
   spring.datasource.username=your_mysql_username
   spring.datasource.password=your_mysql_password
   ```
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend API will start on `http://localhost:8080`.

### 3. Frontend Setup (`atm-security-dashboard`)
1. Navigate to the dashboard directory:
   ```bash
   cd atm-security-dashboard
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Open the browser at the local address displayed in the console (usually `http://localhost:5173`).

---

## 🔒 Security Configuration
* Authentication utilizes JWT tokens passed in the `Authorization: Bearer <token>` header.
* Configure the JWT secret and expiration time under [application.properties](file:///atm/atm-security-service/src/main/resources/application.properties):
  ```properties
  jwt.secret=atmSecuritySystemSecretKey2026ForJWTGenerationWithEnoughLength
  jwt.expiration=86400000
  ```
