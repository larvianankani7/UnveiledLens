# UnveiledLens

> **Discover Beyond the Known.**

UnveiledLens is a security-focused web platform designed to discover publicly exposed API documentation and related endpoints, verify ownership of target domains, and provide AI-assisted interpretation of discovered API information.

The platform combines automated discovery, domain verification, deterministic data redaction, and local AI analysis into a single workflow.

---

## Features

* User registration and authentication
* Email OTP verification
* JWT-based authentication
* Admin access request and approval workflow
* Admin Authorization ID + email OTP authentication
* Domain ownership verification
* DNS TXT verification
* Automated API/Swagger endpoint discovery
* SerpAPI-powered web discovery
* Sensitive-data redaction before AI processing
* Local Ollama AI analysis
* Audit logging
* MySQL persistence
* Flyway database migrations
* Role-based access control using Spring Security

---

## Tech Stack

### Frontend

* React
* Vite
* JavaScript / JSX
* CSS

### Backend

* Java 17
* Spring Boot
* Spring Security
* JWT
* Spring Data JPA
* Hibernate
* Flyway
* Maven

### Database

* MySQL 8

### External Services

* Gmail SMTP — email OTPs and admin notifications
* SerpAPI — API/Swagger discovery
* Ollama — local AI interpretation

---

# Project Structure

```text
UnveiledLens/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/unveiledlens/
│   │   │   └── resources/
│   │   │       ├── db/migration/
│   │   │       ├── application.yml
│   │   │       └── application-dev.yml
│   │   └── test/
│   │
│   ├── .env
│   ├── .env.example
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# Prerequisites

Install the following before running the project:

* Java 17
* Maven or Maven Wrapper
* Node.js and npm
* MySQL 8
* Ollama
* Git

You also need:

* A Gmail account with an App Password
* A SerpAPI account/API key

---

# 1. Clone the Repository

```bash
git clone https://github.com/larvianankani7/UnveiledLens.git
cd UnveiledLens
```

---

# 2. Database Setup

Start MySQL and create the database:

```sql
CREATE DATABASE unveiledlens;
```

The application uses Flyway to create and update the required tables automatically.

You do **not** need to manually create the tables.

The backend uses:

```text
Database: unveiledlens
Host: localhost
Port: 3306
```

---

# 3. Backend Environment Variables

Go to:

```text
backend/
```

Create a `.env` file.

Use `.env.example` as the template.

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=unveiledlens
DB_USER=root
DB_PASS=YOUR_MYSQL_PASSWORD

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=YOUR_GMAIL_ADDRESS
SMTP_PASS=YOUR_GMAIL_APP_PASSWORD

JWT_SECRET=YOUR_JWT_SECRET

SERPAPI_KEY=YOUR_SERPAPI_KEY

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

ADMIN_APPROVAL_EMAIL=YOUR_ADMIN_EMAIL
```

**Never commit `.env` to Git.**

---

# 4. Gmail SMTP Setup

UnveiledLens uses Gmail SMTP to send:

* Registration OTPs
* Login OTPs
* Admin approval emails
* Admin approval/rejection notifications

The application uses:

```text
SMTP Host: smtp.gmail.com
SMTP Port: 587
Security: STARTTLS
Authentication: enabled
```

## Create a Gmail App Password

Do **not** use your normal Gmail password.

Your Google account must have **2-Step Verification enabled**.

Then:

1. Open your Google Account.
2. Go to **Security**.
3. Enable **2-Step Verification** if it is not already enabled.
4. Open **App passwords**.
5. Create a new App Password.
6. Give it a name such as:

```text
UnveiledLens
```

7. Google will generate a 16-character App Password.
8. Put that password in:

```env
SMTP_PASS=YOUR_GMAIL_APP_PASSWORD
```

Your configuration should look like:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

Do not put quotation marks around the App Password unless your environment specifically requires them.

---

# 5. JWT Secret Setup

UnveiledLens uses JWT for authenticated user sessions.

The JWT secret is used by the backend to:

* Sign JWT tokens
* Validate JWT tokens
* Protect authenticated endpoints

Add a strong random value to:

```env
JWT_SECRET=YOUR_SECRET
```

For example:

```env
JWT_SECRET=replace-this-with-a-long-random-secret
```

For development, a long random string is sufficient.

For production, generate a cryptographically random secret and never expose it publicly.

### Important

The JWT secret must remain the same while existing tokens are expected to remain valid.

If you change the JWT secret:

```text
Old JWT
   ↓
Signed with old secret
   ↓
No longer validates with new secret
```

Therefore existing sessions/tokens will become invalid.

---

# 6. SerpAPI Setup

UnveiledLens uses SerpAPI for automated discovery of publicly indexed API documentation and related endpoints.

Create a SerpAPI account and obtain an API key.

Add it to:

```env
SERPAPI_KEY=YOUR_SERPAPI_KEY
```

Without a valid SerpAPI key, discovery functionality that depends on SerpAPI will not work.

---

# 7. Ollama Setup

UnveiledLens uses Ollama for local AI interpretation.

Install Ollama and make sure it is running.

Then download the configured model:

```bash
ollama pull llama3
```

Verify Ollama:

```bash
ollama list
```

The default configuration is:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

Ollama runs locally, so discovered information can be interpreted without sending the analysis request to a hosted AI API.

---

# 8. Backend Configuration

The backend reads environment variables from `.env`.

The important configuration groups are:

```text
MySQL
  ↓
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASS

Gmail SMTP
  ↓
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS

Authentication
  ↓
JWT_SECRET

Discovery
  ↓
SERPAPI_KEY

Local AI
  ↓
OLLAMA_BASE_URL
OLLAMA_MODEL
```

The backend uses:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate

  flyway:
    enabled: true
```

This means Hibernate validates the schema while Flyway manages database migrations.

---

# 9. Run the Backend

Open a terminal:

```bash
cd backend
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

Or if Maven is installed globally:

```bash
mvn spring-boot:run
```

The backend starts on:

```text
http://localhost:8080
```

A successful startup should show:

```text
Tomcat started on port 8080
Started UnveiledLensApplication
```

You should also see Flyway successfully validating the migrations.

---

# 10. Run the Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Start the development server:

```bash
npm run dev
```

Vite will normally start the frontend at:

```text
http://localhost:5173
```

Open that URL in your browser.

---

# 11. Authentication Flow

## User Registration

The registration flow is:

```text
User
 ↓
Enter email + password + domain
 ↓
Backend validates data
 ↓
User account created
 ↓
OTP generated
 ↓
OTP stored securely in database
 ↓
OTP sent through Gmail SMTP
 ↓
User enters OTP
 ↓
OTP verified
 ↓
Registration verified
```

The OTP is stored using a password encoder rather than storing the raw OTP.

---

# 12. User Login Flow

Login uses two stages.

```text
Email / Phone + Password
          ↓
Spring Security authentication
          ↓
Credentials valid
          ↓
Email OTP generated
          ↓
Gmail SMTP
          ↓
User enters OTP
          ↓
OTP verified
          ↓
JWT generated
          ↓
Authenticated session
```

This means knowing the password alone is not sufficient to complete the login.

---

# 13. JWT Authentication

After successful login, the backend generates a JWT.

The token is then used to access protected endpoints.

Conceptually:

```text
Login
  ↓
Password verification
  ↓
OTP verification
  ↓
JWT generated
  ↓
Frontend stores token
  ↓
Authenticated API requests
  ↓
JwtAuthenticationFilter
  ↓
Token validation
  ↓
Request authorized
```

Spring Security uses stateless JWT authentication rather than server-side sessions.

---

# 14. Admin Authentication

Admin authentication is separate from normal user authentication.

The general flow is:

```text
Admin access request
        ↓
Admin approval
        ↓
Admin Authorization ID
        ↓
Authorization ID verification
        ↓
Email OTP
        ↓
OTP verification
        ↓
Admin JWT
        ↓
Protected admin endpoints
```

Admin endpoints are protected using Spring Security roles.

The application uses:

```text
ROLE_USER
ROLE_ADMIN
```

---

# 15. Domain Verification

Users provide a domain during registration.

The domain is normalized before being stored.

Examples:

```text
https://example.com/
```

becomes:

```text
example.com
```

The system then uses domain verification mechanisms to confirm ownership before allowing security-sensitive discovery operations.

DNS TXT verification is used as part of the verification process.

---

# 16. API Discovery

Once a domain is verified, UnveiledLens can perform automated discovery.

SerpAPI is used to discover publicly indexed resources such as:

```text
Swagger documentation
OpenAPI documentation
API endpoints
Cloud storage exposure
Other publicly indexed API-related resources
```

The goal is to identify potentially exposed API information rather than blindly crawling arbitrary systems.

---

# 17. Sensitive Data Redaction

Before information is passed to the local AI layer, deterministic redaction is applied.

Potentially sensitive information can be removed or masked before analysis.

Conceptually:

```text
Discovered API information
          ↓
Sensitive-data detection
          ↓
Redaction
          ↓
Sanitized information
          ↓
Ollama
          ↓
AI interpretation
```

This provides a deterministic privacy/security layer before AI processing.

---

# 18. Local AI Analysis

Ollama is used for local interpretation.

The flow is:

```text
Discovery
   ↓
Raw information
   ↓
Redaction
   ↓
Sanitized information
   ↓
Ollama
   ↓
Interpretation
   ↓
Security-focused result
```

The application does not require a hosted OpenAI API for this component.

---

# 19. Database Migrations

Flyway manages database schema changes.

Migration files are located under:

```text
backend/src/main/resources/db/migration/
```

Current migrations are versioned sequentially:

```text
V1
V2
V3
V4
V5
```

When the backend starts, Flyway checks the database and applies any migrations that have not already been executed.

You should **not manually modify the database schema** unless you understand the corresponding migration requirements.

---

# 20. Common Problems

## MySQL Access Denied

Example:

```text
Access denied for user 'root'@'localhost'
```

Check:

```env
DB_USER=root
DB_PASS=YOUR_MYSQL_PASSWORD
```

Make sure MySQL is running and the credentials are correct.

---

## SMTP Authentication Failed

Check:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

The password should be a **Google App Password**, not your normal Gmail password.

---

## Connection Refused on Port 1025

If you see:

```text
Couldn't connect to host, port: localhost, 1025
Connection refused
```

the application is configured for Mailpit/local SMTP rather than Gmail.

For the normal local setup, use:

```yaml
spring:
  mail:
    host: ${SMTP_HOST:smtp.gmail.com}
    port: ${SMTP_PORT:587}
```

with:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

---

## JWT Errors

If authentication suddenly stops working after changing configuration, check:

```env
JWT_SECRET=...
```

Changing the JWT secret invalidates tokens signed using the previous secret.

Log in again after changing it.

---

## Ollama Connection Error

Check that Ollama is running:

```bash
ollama list
```

The default endpoint is:

```text
http://localhost:11434
```

Make sure the configured model exists:

```bash
ollama pull llama3
```

---

# 21. Development Ports

| Service      |  Port |
| ------------ | ----: |
| React / Vite |  5173 |
| Spring Boot  |  8080 |
| MySQL        |  3306 |
| Ollama       | 11434 |
| Gmail SMTP   |   587 |

---

# 22. Recommended Startup Order

For a fresh development session:

### 1. Start MySQL

Make sure MySQL is running.

### 2. Start Ollama

Make sure the required model is available:

```bash
ollama list
```

### 3. Start Backend

```bash
cd backend
mvnw.cmd spring-boot:run
```

### 4. Start Frontend

In another terminal:

```bash
cd frontend
npm run dev
```

### 5. Open the application

```text
http://localhost:5173
```

---

# 23. Environment Security

Never commit:

```text
.env
```

to Git.

The following values are sensitive:

```text
DB_PASS
SMTP_PASS
JWT_SECRET
SERPAPI_KEY
```

Use `.env.example` to document required variables without exposing real credentials.

---

# 24. Overall Architecture

```text
                    ┌──────────────────┐
                    │     React UI     │
                    │    Vite / JSX    │
                    └────────┬─────────┘
                             │
                             │ HTTP / REST
                             ▼
                    ┌──────────────────┐
                    │   Spring Boot    │
                    │     Backend      │
                    └────────┬─────────┘
                             │
             ┌───────────────┼────────────────┐
             │               │                │
             ▼               ▼                ▼
        ┌─────────┐    ┌────────────┐   ┌──────────┐
        │ MySQL   │    │ Gmail SMTP │   │ SerpAPI  │
        └─────────┘    └────────────┘   └──────────┘
                             │
                             │
                             ▼
                       Email OTPs

                    ┌──────────────────┐
                    │      Ollama      │
                    │   Local AI Model │
                    └──────────────────┘
```

---

# 25. Security Architecture

```text
                     Request
                        │
                        ▼
              ┌──────────────────┐
              │ Spring Security  │
              └────────┬─────────┘
                       │
                       ▼
              JwtAuthenticationFilter
                       │
                       ▼
                  JWT Validation
                       │
                       ▼
                 Role Checking
                  /          \
                 /            \
          ROLE_USER         ROLE_ADMIN
              │                  │
              ▼                  ▼
        User Endpoints     Admin Endpoints
```

---

# 26. Quick Start

For someone who already has all prerequisites installed:

```bash
git clone https://github.com/larvianankani7/UnveiledLens.git

cd UnveiledLens/backend
mvnw.cmd spring-boot:run
```

In another terminal:

```bash
cd UnveiledLens/frontend
npm install
npm run dev
```

Before starting the backend, make sure:

```text
MySQL is running
.env exists
Gmail App Password is configured
SerpAPI key is configured
Ollama is running
```

Then open:

```text
http://localhost:5173
```

---

## Development Note

The project is currently designed around a **local development setup**:

```text
MySQL       → Local
Spring Boot → Local
React       → Local
Ollama      → Local
SMTP        → Gmail SMTP
SerpAPI     → External API
```

Docker/Mailpit configuration can be maintained separately for future testing, but it is **not required for the normal development workflow**.
