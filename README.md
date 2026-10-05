# UnveiledLens

### Discover Beyond the Known.

UnveiledLens is an ownership-aware external exposure intelligence platform that discovers publicly indexed API, storage, configuration, GraphQL, and related technical resources associated with a domain.

It combines search-engine intelligence, safe HTTP validation, deterministic exposure classification, evidence generation, optional local AI interpretation, redaction, and PDF reporting.

> UnveiledLens identifies publicly discoverable exposure signals. It does not claim to discover every vulnerability or every exposed resource.

---

## What It Does

**Discover → Filter → Validate → Classify → Interpret → Report**

1. A verified user domain is used as the scan target.
2. SerpApi discovers publicly indexed resources.
3. Results are normalized and deduplicated.
4. Domain and asset relevance filters remove unrelated resources.
5. `SafeHttpScanner` performs non-destructive HTTP validation.
6. Exposure categories and severity are determined deterministically.
7. API specifications are analyzed when relevant.
8. Evidence, remediation guidance, attack-chain signals, and DPDP relevance are generated.
9. Ollama optionally provides concise security interpretations.
10. Sensitive evidence is redacted before administrative/report output.
11. Results are cached and can be exported as PDF reports.

---

## Architecture

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │   Vite + Tailwind   │
                    └──────────┬──────────┘
                               │ REST / JWT
                               ▼
                    ┌─────────────────────┐
                    │   Spring Security   │
                    │   JWT + RBAC        │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┴─────────────────┐
             ▼                                   ▼
      ┌──────────────┐                    ┌──────────────┐
      │ User / Auth  │                    │ Admin Access │
      │ Controllers  │                    │ Controllers  │
      └──────┬───────┘                    └──────┬───────┘
             │                                   │
             ▼                                   ▼
      ┌──────────────┐                    ┌──────────────┐
      │ Auth / OTP   │                    │ Admin Access │
      │ Services     │                    │ Service      │
      └──────┬───────┘                    └──────┬───────┘
             │                                   │
             └─────────────────┬─────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │  DiscoveryService   │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
          ┌──────────┐  ┌────────────┐  ┌──────────────┐
          │ SerpApi  │  │ Relevance  │  │ Safe HTTP    │
          │ Search   │  │ Filtering  │  │ Scanner      │
          └────┬─────┘  └─────┬──────┘  └──────┬───────┘
               └──────────────┼────────────────┘
                              ▼
                    ┌─────────────────────┐
                    │ Exposure Classifier │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
   │ API Spec    │     │ Evidence     │     │ Attack Chain│
   │ Analysis    │     │ Engine       │     │ Correlation │
   └─────────────┘     └──────────────┘     └─────────────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Remediation + DPDP  │
                    │ Mapping             │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Ollama Interpretation│
                    │      (Optional)      │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Report / PDF / Cache│
                    └─────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      MySQL 8        │
                    │ JPA + Hibernate     │
                    │      Flyway         │
                    └─────────────────────┘
```

### Important architectural principle

The scanner and security decisions are **deterministic**.

Ollama is only used for interpretation/report wording. It does not control:

* scan scope
* target selection
* SSRF safety
* authentication bypass
* exploitation
* exposure classification
* redaction
* security decisions

The application also has fallback interpretations when Ollama is unavailable.

---

## Tech Stack

### Frontend

* React 19
* Vite
* JavaScript / JSX
* React Router
* Tailwind CSS 4
* Lucide React

### Backend

* Java 17
* Spring Boot 3.2
* Spring Web / WebFlux
* Spring Security
* Spring Data JPA
* Hibernate
* Jakarta Validation
* JWT
* Maven

### Database

* MySQL 8
* Flyway
* JPA / Hibernate

### External Services

* SerpApi — public search discovery
* Ollama — optional local AI interpretation
* SMTP — OTP and administrative emails

### Reporting

* OpenHTMLToPDF
* PDFBox

---

## Repository Structure

Only the important application structure is shown below.

```text
UnveiledLens/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/unveiledlens/
│   │   │   │   ├── admin/
│   │   │   │   ├── ai/
│   │   │   │   ├── audit/
│   │   │   │   ├── auth/
│   │   │   │   ├── common/
│   │   │   │   ├── compliance/
│   │   │   │   ├── config/
│   │   │   │   ├── discovery/
│   │   │   │   ├── remediation/
│   │   │   │   ├── report/
│   │   │   │   ├── scanner/
│   │   │   │   ├── security/
│   │   │   │   ├── spec/
│   │   │   │   ├── user/
│   │   │   │   └── verification/
│   │   │   └── resources/
│   │   │       ├── db/migration/
│   │   │       └── application.yml
│   │   └── test/
│   │
│   ├── .env.example
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── frontend/
│   ├── public/
│   │   ├── videos/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── components/
│   │   │   └── Intro/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   ├── Auth/
│   │   │   ├── Landing/
│   │   │   ├── SearchResults/
│   │   │   └── Settings/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# Requirements

## Required Software

Install:

* Java 17+
* Maven 3.9+ if you do not use the Maven wrapper
* Node.js 20+
* npm
* MySQL 8+
* Git

Optional:

* Ollama
* An Ollama model such as `llama3`

---

# Environment Setup

## Backend

Go to the backend:

```bash
cd backend
```

Create the environment file:

### Linux / macOS / WSL

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Configure the values in `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=unveiledlens
DB_USER=root
DB_PASS=your_mysql_password

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password

ADMIN_APPROVAL_EMAIL=your_admin_email

JWT_SECRET=replace_with_a_long_random_secret

SERPAPI_KEY=your_serpapi_key

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
OLLAMA_TIMEOUT_MS=5000
OLLAMA_MAX_TOKENS=96

SERPAPI_TIMEOUT_MS=5000
DISCOVERY_REQUEST_WAIT_SECONDS=60
DISCOVERY_CACHE_TTL_MINUTES=15
DISCOVERY_CACHE_MAX_ENTRIES=500
DISCOVERY_BACKGROUND_CONCURRENCY=2
DISCOVERY_IO_CONCURRENCY=8
```

Do not commit `.env`.

---

# Database Setup

Start MySQL and create the database:

```sql
CREATE DATABASE unveiledlens;
```

The application uses Flyway migrations, so tables are created/updated automatically when the backend starts.

Migrations are located at:

```text
backend/src/main/resources/db/migration/
```

---

# SerpApi Setup

Create a SerpApi account and obtain an API key.

Set:

```env
SERPAPI_KEY=your_key
```

Without a SerpApi key, the discovery pipeline can start, but meaningful search discovery will not occur.

---

# Ollama Setup

Ollama is optional.

Install Ollama and pull the configured model:

```bash
ollama pull llama3
```

Start Ollama normally.

The backend uses:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

If Ollama is unavailable, UnveiledLens falls back to deterministic security interpretations.

---

# Email / OTP Setup

Configure SMTP:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
```

For Gmail, use an **App Password** rather than your normal Gmail password.

The application uses email delivery for authentication and administrative approval flows.

---

# Frontend Environment

Go to the frontend:

```bash
cd frontend
```

Create the environment file.

### Linux / macOS / WSL

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Set:

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

# Run the Application

Open two terminals.

## Terminal 1 — Backend

```bash
cd backend
```

### Windows

```powershell
.\mvnw.cmd spring-boot:run
```

### Linux / macOS / WSL

```bash
./mvnw spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

---

## Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite development server runs on:

```text
http://localhost:3000
```

Open:

```text
http://localhost:3000
```

---

# Project Principles

UnveiledLens follows several core principles:

* Public discovery before active validation
* Ownership-aware scanning
* Non-destructive validation
* Deterministic security decisions
* AI as an interpretation layer, not a security authority
* Redaction before sensitive information reaches reports
* Backend-enforced authorization
* Environment-based configuration
* Small, single-responsibility services

---

## Disclaimer

UnveiledLens is intended for authorized security assessment and defensive security research.
Only scan domains and resources for which you have appropriate authorization.
Discovery results represent externally observable signals and should not be interpreted as guaranteed proof of vulnerability or exploitation.
