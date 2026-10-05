# UnveiledLens

> **Discover Beyond the Known.**

**UnveiledLens** is an ownership-verified external exposure auditor that uses search-engine intelligence to discover publicly indexed API, storage, documentation, and other exposure signals associated with a verified domain.

It combines **domain ownership verification, SerpApi-powered discovery, deterministic exposure classification, safe HTTP validation, sensitive-data redaction, local AI interpretation, audit logging, and PDF reporting** into one security-focused workflow.

### Core Workflow

```text
Discover
   ↓
Verify
   ↓
Classify
   ↓
Safely Validate
   ↓
Redact
   ↓
Interpret
   ↓
Report
```

> **Important:** UnveiledLens is not a replacement for a full vulnerability scanner, penetration-testing platform, or complete attack-surface management solution. It identifies publicly discoverable exposure signals through search-engine intelligence and performs controlled, non-destructive validation of discovered resources.

---

## Table of Contents

* [Overview](#overview)
* [Key Features](#key-features)
* [How It Works](#how-it-works)
* [Architecture](#architecture)
* [Technology Stack](#technology-stack)
* [Repository Structure](#repository-structure)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Environment Configuration](#environment-configuration)
* [Database Setup](#database-setup)
* [Run the Backend](#run-the-backend)
* [Run the Frontend](#run-the-frontend)
* [Application Flow](#application-flow)
* [Security Architecture](#security-architecture)
* [Discovery Pipeline](#discovery-pipeline)
* [Safe HTTP Validation](#safe-http-validation)
* [AI Analysis](#ai-analysis)
* [Caching and Concurrency](#caching-and-concurrency)
* [Database and Migrations](#database-and-migrations)
* [Testing](#testing)
* [Production Deployment](#production-deployment)
* [Environment Variables](#environment-variables)
* [Troubleshooting](#troubleshooting)
* [Security Considerations](#security-considerations)
* [Limitations](#limitations)
* [Future Improvements](#future-improvements)
* [License](#license)

---

# Overview

Modern organizations can unintentionally expose API documentation, endpoints, cloud-storage resources, configuration information, and other infrastructure-related data through the public web.

UnveiledLens approaches this problem from a simple question:

> **What has the public web already revealed about this organization?**

Instead of attempting to blindly crawl or exploit an entire target, UnveiledLens starts with publicly indexed information and progressively validates what it discovers.

The platform:

1. Verifies ownership of the target domain.
2. Uses search-engine intelligence to discover relevant public resources.
3. Filters and classifies discovered assets.
4. Performs controlled HTTP validation.
5. Evaluates the evidence deterministically.
6. Redacts sensitive information.
7. Optionally uses a locally hosted Ollama model to explain findings.
8. Generates structured exposure reports.
9. Provides PDF reporting and administrative visibility.
10. Records security-relevant events through audit logging.

---

# Key Features

## 🔎 Search-Engine-Based Discovery

Uses **SerpApi** to discover publicly indexed resources related to a verified domain.

Potential discoveries include:

* API documentation
* Swagger/OpenAPI resources
* API endpoints
* Storage resources
* Documentation pages
* Other relevant publicly indexed resources

---

## 🔐 Domain Ownership Verification

Scanning is tied to a verified domain.

Supported verification concepts include:

* Email OTP verification
* Domain normalization
* DNS TXT verification
* Domain/email consistency checks

This creates a security boundary before discovery and validation operations are performed.

---

## 👤 Authentication

The backend uses:

* Spring Security
* JWT authentication
* Password hashing
* Role-based authorization
* OTP verification

The application separates normal user and administrative authentication/authorization flows.

---

## 🛡️ Safe HTTP Validation

Discovered resources can be validated using a dedicated `SafeHttpScanner`.

The scanner is designed around non-destructive requests and SSRF protections.

The system is designed to reject dangerous destinations such as:

* `localhost`
* Private IP ranges
* Cloud metadata endpoints
* Other restricted network destinations

Validation is intended to use safe HTTP operations rather than exploitation.

---

## 🧠 Deterministic Exposure Classification

Security decisions are not delegated to the AI model.

The backend contains dedicated components for:

* Asset relevance filtering
* Domain relevance filtering
* Exposure classification
* Evidence processing
* Finding generation
* API specification analysis

This keeps security-critical decisions deterministic.

---

## 🔒 Sensitive Data Redaction

UnveiledLens includes redaction logic designed to prevent sensitive information from being unnecessarily exposed to users or AI services.

Examples of sensitive information that should not be retained or presented directly include:

* Passwords
* OTPs
* JWTs
* API keys
* Credentials
* Sensitive response data

Redaction occurs before AI interpretation and reporting.

---

## 🤖 Local AI Interpretation

UnveiledLens optionally integrates with **Ollama**.

The AI layer is responsible for:

* Explaining findings
* Summarizing evidence
* Providing security context
* Generating remediation-oriented explanations
* Improving report readability

The AI layer does **not** determine:

* Scanner scope
* SSRF safety
* Target selection
* Authentication bypass
* Exploitation
* Credential testing
* Redaction decisions
* Core security classifications

If Ollama is unavailable, the deterministic discovery and scanning components can still operate.

---

## 📄 PDF Reporting

The backend contains a dedicated PDF report service using OpenHTMLToPDF.

Reports can incorporate:

* Discovered assets
* Exposure findings
* Security evidence
* Redacted information
* Explanations
* Remediation guidance

---

## 🧾 Audit Logging

Security-relevant application events can be recorded through the audit subsystem.

Examples include:

* Registration
* Login
* OTP requests
* Domain creation
* Domain verification
* Administrative actions

Sensitive credentials and secrets should not be written to audit records.

---

## ⚡ Scan Caching

The discovery subsystem includes an in-memory scan cache to reduce repeated work.

Configurable controls include:

* Cache TTL
* Maximum cache entries
* Background concurrency
* I/O concurrency
* Request wait time

No Redis dependency is required.

---

# How It Works

A simplified end-to-end flow looks like this:

```text
                         ┌───────────────────┐
                         │    React Client   │
                         └─────────┬─────────┘
                                   │
                                   │ REST / HTTP
                                   ▼
                         ┌───────────────────┐
                         │   Spring Boot     │
                         │     Backend       │
                         └─────────┬─────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
                ▼                  ▼                  ▼
         Authentication       Domain Layer       Discovery
                │                  │                  │
                │                  │                  ▼
                │                  │             SerpApi
                │                  │                  │
                │                  │                  ▼
                │                  │          Asset Filtering
                │                  │                  │
                │                  │                  ▼
                │                  │          Classification
                │                  │                  │
                │                  │                  ▼
                │                  │          Safe HTTP Scanner
                │                  │                  │
                │                  │                  ▼
                │                  │              Evidence
                │                  │                  │
                │                  │                  ▼
                │                  │             Redaction
                │                  │                  │
                │                  │                  ▼
                │                  │             Ollama AI
                │                  │                  │
                └──────────────────┴──────────────────┘
                                   │
                                   ▼
                         Findings / Reports
                                   │
                          ┌────────┴────────┐
                          ▼                 ▼
                     Web Results        PDF Report
```

---

# Architecture

UnveiledLens follows a modular Spring Boot architecture.

```text
Frontend
   │
   │ HTTP / REST
   ▼
Controllers
   │
   ▼
Services
   │
   ├── Authentication
   ├── Verification
   ├── Discovery
   ├── Scanner
   ├── Classification
   ├── Redaction
   ├── AI
   ├── Reporting
   ├── Audit
   └── Administration
   │
   ▼
Repositories
   │
   ▼
MySQL
```

External integrations are isolated from the core business logic:

```text
SerpApi
   ↓
SerpApiService / SearchProvider
   ↓
DiscoveryService
```

and:

```text
Ollama
   ↓
OllamaService
   ↓
AI interpretation
```

This keeps external dependencies replaceable and prevents provider-specific logic from spreading throughout the application.

---

# Technology Stack

## Frontend

| Technology       | Purpose                   |
| ---------------- | ------------------------- |
| React 19         | UI                        |
| Vite 8           | Development/build tooling |
| JavaScript / JSX | Application language      |
| React Router     | Client-side routing       |
| Tailwind CSS     | Styling                   |
| Lucide React     | Icons                     |
| Oxlint           | Linting                   |

The current frontend package configuration uses React 19.2.x, Vite 8.3.x, Tailwind CSS 4.3.x, React Router 7.18.x and Lucide React.

---

## Backend

| Technology         | Purpose                      |
| ------------------ | ---------------------------- |
| Java 17            | Backend runtime              |
| Spring Boot 3.2.3  | Application framework        |
| Spring Web         | REST APIs                    |
| Spring WebFlux     | Reactive HTTP capabilities   |
| Spring Security    | Authentication/authorization |
| Spring Data JPA    | Persistence                  |
| Hibernate          | ORM                          |
| Flyway             | Database migrations          |
| Maven              | Build/dependency management  |
| JWT                | Stateless authentication     |
| Jakarta Validation | Request validation           |
| Lombok             | Boilerplate reduction        |
| Spring Mail        | Email delivery               |
| OpenHTMLToPDF      | PDF generation               |
| MySQL Connector/J  | Database connectivity        |

The Maven configuration currently targets Java 17 and Spring Boot 3.2.3.

---

## External Services

| Service                    | Purpose                            |
| -------------------------- | ---------------------------------- |
| SerpApi                    | Search-engine-based discovery      |
| Ollama                     | Local AI interpretation            |
| Gmail SMTP / SMTP provider | OTP and application email delivery |
| MySQL                      | Persistent storage                 |

---

# Repository Structure

```text
UnveiledLens/
│
├── .vscode/
│   └── settings.json
│
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── .mvn/
│   │   └── wrapper/
│   │       └── maven-wrapper.properties
│   │
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   │
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/unveiledlens/
│   │   │   │       │
│   │   │   │       ├── UnveiledLensApplication.java
│   │   │   │       │
│   │   │   │       ├── admin/
│   │   │   │       │   ├── AdminAccessController.java
│   │   │   │       │   ├── AdminAccessService.java
│   │   │   │       │   ├── AdminController.java
│   │   │   │       │   ├── AdminDiscoveryController.java
│   │   │   │       │   └── dto/
│   │   │   │       │
│   │   │   │       ├── ai/
│   │   │   │       │   └── OllamaService.java
│   │   │   │       │
│   │   │   │       ├── audit/
│   │   │   │       │   ├── AuditLog.java
│   │   │   │       │   ├── AuditRepository.java
│   │   │   │       │   └── AuditService.java
│   │   │   │       │
│   │   │   │       ├── auth/
│   │   │   │       │   ├── AuthController.java
│   │   │   │       │   ├── AuthService.java
│   │   │   │       │   ├── LoginRequest.java
│   │   │   │       │   ├── RegisterRequest.java
│   │   │   │       │   └── VerifyOtpRequest.java
│   │   │   │       │
│   │   │   │       ├── common/
│   │   │   │       │   └── Role.java
│   │   │   │       │
│   │   │   │       ├── compliance/
│   │   │   │       │   └── DpdpMappingService.java
│   │   │   │       │
│   │   │   │       ├── config/
│   │   │   │       │   ├── ApplicationConfig.java
│   │   │   │       │   ├── GlobalExceptionHandler.java
│   │   │   │       │   └── SecurityConfig.java
│   │   │   │       │
│   │   │   │       ├── discovery/
│   │   │   │       │   ├── DiscoveryController.java
│   │   │   │       │   ├── DiscoveryService.java
│   │   │   │       │   ├── DiscoveryExecutionConfig.java
│   │   │   │       │   ├── SearchOrchestrator.java
│   │   │   │       │   ├── SearchProvider.java
│   │   │   │       │   ├── SerpApiService.java
│   │   │   │       │   ├── SerpApiSearchProvider.java
│   │   │   │       │   ├── FallbackSearchProvider.java
│   │   │   │       │   ├── AssetRelevanceFilter.java
│   │   │   │       │   ├── DomainRelevanceFilter.java
│   │   │   │       │   ├── ExposureClassifier.java
│   │   │   │       │   ├── EvidenceEngine.java
│   │   │   │       │   ├── AttackChainService.java
│   │   │   │       │   ├── ScanCacheService.java
│   │   │   │       │   └── dto/
│   │   │   │       │
│   │   │   │       ├── domain/
│   │   │   │       │   ├── Domain.java
│   │   │   │       │   └── DomainRepository.java
│   │   │   │       │
│   │   │   │       ├── finding/
│   │   │   │       │   └── FindingService.java
│   │   │   │       │
│   │   │   │       ├── remediation/
│   │   │   │       │   └── RemediationTemplateService.java
│   │   │   │       │
│   │   │   │       ├── report/
│   │   │   │       │   └── PdfReportService.java
│   │   │   │       │
│   │   │   │       ├── scanner/
│   │   │   │       │   └── SafeHttpScanner.java
│   │   │   │       │
│   │   │   │       ├── security/
│   │   │   │       │   ├── JwtAuthenticationFilter.java
│   │   │   │       │   └── JwtService.java
│   │   │   │       │
│   │   │   │       ├── spec/
│   │   │   │       │   ├── ApiSpecAnalyzer.java
│   │   │   │       │   ├── ApiSpecResult.java
│   │   │   │       │   └── ApiSpecService.java
│   │   │   │       │
│   │   │   │       ├── user/
│   │   │   │       │   ├── User.java
│   │   │   │       │   ├── UserController.java
│   │   │   │       │   ├── UserRepository.java
│   │   │   │       │   └── ...
│   │   │   │       │
│   │   │   │       └── verification/
│   │   │   │           ├── EmailService.java
│   │   │   │           ├── OtpService.java
│   │   │   │           ├── OtpRepository.java
│   │   │   │           └── OtpVerification.java
│   │   │   │
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── db/
│   │   │           └── migration/
│   │   │               ├── V1__init.sql
│   │   │               ├── V2__admin_access_requests.sql
│   │   │               ├── V3__user_domain.sql
│   │   │               ├── V4__user_username.sql
│   │   │               └── V5__admin_request_domain.sql
│   │   │
│   │   └── test/
│   │       └── java/
│   │           └── com/unveiledlens/
│   │               ├── UnveiledLensApplicationTests.java
│   │               ├── discovery/
│   │               │   └── ScanCacheServiceTest.java
│   │               └── report/
│   │                   └── PdfReportRedactionTest.java
│   │
│   └── README.md
│
├── frontend/
│   ├── .env.example
│   ├── .gitignore
│   ├── .oxlintrc.json
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   │
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── videos/
│   │       ├── auth-bg.mp4
│   │       ├── cyber-bg.mp4
│   │       └── intro.mp4
│   │
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── main.jsx
│       │
│       ├── assets/
│       │   └── hero.png
│       │
│       ├── components/
│       │   ├── CyberBackground.jsx
│       │   └── Intro/
│       │       ├── IntroExperience.jsx
│       │       ├── IntroVideo.jsx
│       │       └── StartButton.jsx
│       │
│       ├── hooks/
│       │   ├── useIntroTiming.js
│       │   └── useTheme.js
│       │
│       ├── layouts/
│       │   ├── AuthLayout.jsx
│       │   └── MainLayout.jsx
│       │
│       └── pages/
│           ├── Admin/
│           │   └── AdminDashboard.jsx
│           ├── Auth/
│           │   ├── AdminApproval.jsx
│           │   ├── AdminRequest.jsx
│           │   ├── AdminVerify.jsx
│           │   ├── Login.jsx
│           │   └── Register.jsx
│           ├── Landing/
│           │   └── Landing.jsx
│           ├── SearchResults/
│           │   └── SearchResults.jsx
│           └── Settings/
│               └── Settings.jsx
│
├── get_url.js
├── get_url.py
├── rename_words.js
├── replace_colors.js
├── update_theme.js
├── requirements.txt
└── README.md
```

The structure above reflects the current repository rather than an idealized architecture. The repository currently contains dedicated backend modules for admin, AI, audit, authentication, compliance, discovery, domain management, findings, remediation, reporting, scanning, JWT security, API-spec analysis, users, and verification.

---

# Prerequisites

Before running UnveiledLens locally, install:

* Git
* Java 17+
* Node.js
* npm
* MySQL 8.x
* Ollama
* A SerpApi account/API key
* An SMTP provider/account for email delivery

The backend is configured for Java 17 and MySQL, while the frontend is a Vite/React application.

Verify installations:

```bash
git --version
java -version
node --version
npm --version
mysql --version
ollama --version
```

---

# Installation

## 1. Clone the repository

```bash
git clone https://github.com/larvianankani7/UnveiledLens.git
cd UnveiledLens
```

---

# Database Setup

Start MySQL and create the application database:

```sql
CREATE DATABASE unveiledlens;
```

The backend expects:

```text
Host:     localhost
Port:     3306
Database: unveiledlens
```

You do **not** need to manually create application tables.

Flyway manages schema migrations automatically.

The backend uses:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate

  flyway:
    enabled: true
    baseline-on-migrate: true
```

This means Hibernate validates the schema while Flyway owns schema evolution.

---

# Environment Configuration

## Backend

Create:

```text
backend/.env
```

Use:

```text
backend/.env.example
```

as the template.

The repository currently defines the following backend configuration:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=unveiledlens
DB_USER=root
DB_PASS=YOUR_MYSQL_PASSWORD

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=YOUR_SMTP_USERNAME
SMTP_PASS=YOUR_SMTP_PASSWORD

ADMIN_APPROVAL_EMAIL=YOUR_ADMIN_EMAIL

JWT_SECRET=YOUR_LONG_RANDOM_SECRET

SERPAPI_KEY=YOUR_SERPAPI_KEY

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

These variables correspond to the current backend environment template and `application.yml`.

---

## Frontend

Create:

```text
frontend/.env
```

with:

```env
VITE_API_BASE_URL=http://localhost:8080
```

This is the variable currently expected by the frontend environment template.

---

# Gmail / SMTP Configuration

For Gmail SMTP:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Use a **Google App Password**, not your normal Google account password.

For production deployments, use a dedicated transactional email provider or dedicated SMTP identity rather than exposing personal credentials.

---

# JWT Configuration

Generate a strong random JWT secret.

Example:

```env
JWT_SECRET=replace-with-a-long-random-production-secret
```

Never commit this value.

The current application configuration uses separate expiration periods for normal and administrative JWTs:

```text
User JWT: 24 hours
Admin JWT: 8 hours
```

Changing the signing secret invalidates tokens signed using the previous secret.

---

# SerpApi Configuration

UnveiledLens uses SerpApi for public-web discovery.

Set:

```env
SERPAPI_KEY=YOUR_SERPAPI_KEY
```

Without a valid key, SerpApi-backed discovery cannot operate normally.

SerpApi interaction is isolated in the backend discovery layer rather than being called directly from the frontend.

---

# Ollama Configuration

Install Ollama and download the configured model:

```bash
ollama pull llama3
```

Verify:

```bash
ollama list
```

Default configuration:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

The backend also exposes timeout and output-size configuration:

```env
OLLAMA_TIMEOUT_MS=5000
OLLAMA_MAX_TOKENS=96
```

Ollama is used as a **local interpretation layer**, not as the security decision engine.

---

# Run the Backend

Open a terminal:

```bash
cd backend
```

### Windows

```bash
mvnw.cmd spring-boot:run
```

### Linux / macOS

```bash
./mvnw spring-boot:run
```

Or with Maven installed:

```bash
mvn spring-boot:run
```

The backend is expected to run on:

```text
http://localhost:8080
```

---

# Run the Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

The frontend normally becomes available at:

```text
http://localhost:5173
```

---

# Production Frontend Build

Create a production build:

```bash
cd frontend
npm ci
npm run build
```

The resulting production assets are generated by Vite.

To locally preview the production build:

```bash
npm run preview
```

---

# Backend Production Build

From:

```text
backend/
```

run:

### Windows

```bash
mvnw.cmd clean package
```

### Linux / macOS

```bash
./mvnw clean package
```

The generated Spring Boot artifact can then be deployed using your preferred Java 17 runtime.

---

# Application Flow

## User Registration

Conceptually:

```text
User
  │
  ▼
Email + Password + Domain
  │
  ▼
Input Validation
  │
  ▼
Domain Normalization
  │
  ▼
Email / Domain Verification
  │
  ▼
OTP Generation
  │
  ▼
SMTP Delivery
  │
  ▼
OTP Verification
  │
  ▼
Account Verification
```

---

# User Login

```text
Email + Password
       │
       ▼
Credential Validation
       │
       ▼
OTP Verification
       │
       ▼
JWT Generation
       │
       ▼
Authenticated API Requests
```

JWT authentication is implemented through Spring Security and the dedicated JWT filter/service components.

---

# Administrative Flow

Administrative functionality is separated from normal user functionality.

The repository contains dedicated administrative controllers, services, DTOs and frontend pages.

The administrative subsystem handles concepts such as:

* Access requests
* Approval
* Administrative verification
* Administrative discovery
* Administrative findings
* Administrative redaction
* Administrative reporting

Backend authorization is enforced using Spring Security rather than relying solely on frontend route protection.

---

# Domain Verification

Domains are normalized before being used by discovery.

For example:

```text
https://example.com/
```

is treated as:

```text
example.com
```

The ownership-verification boundary exists to ensure that discovery is associated with a domain that the user is authorized to investigate.

---

# Discovery Pipeline

The discovery subsystem is one of the core parts of UnveiledLens.

```text
Verified Domain
      │
      ▼
Search Orchestration
      │
      ▼
SerpApi
      │
      ▼
Search Results
      │
      ▼
Normalization
      │
      ▼
Domain Relevance Filtering
      │
      ▼
Asset Relevance Filtering
      │
      ▼
Deduplication
      │
      ▼
Asset Classification
      │
      ▼
Safe Validation
      │
      ▼
Evidence Generation
      │
      ▼
Exposure Classification
      │
      ▼
Findings / Report
```

Relevant backend components include:

```text
DiscoveryService
SearchOrchestrator
SearchProvider
SerpApiSearchProvider
SerpApiService
FallbackSearchProvider
AssetRelevanceFilter
DomainRelevanceFilter
ExposureClassifier
EvidenceEngine
AttackChainService
ScanCacheService
```

---

# Asset Classification

Discovered resources are categorized before they become findings.

The system is designed to distinguish relevant resources such as:

```text
API_ENDPOINT
STORAGE_RESOURCE
DOCUMENTATION
OTHER_RELEVANT_RESOURCE
```

This prevents every search result from automatically becoming a security finding.

---

# API Specification Analysis

The backend includes a dedicated API specification subsystem:

```text
spec/
├── ApiSpecAnalyzer.java
├── ApiSpecResult.java
└── ApiSpecService.java
```

This allows discovered API specifications to be analyzed separately from generic web resources.

---

# Safe HTTP Validation

Discovered resources can be passed into:

```text
SafeHttpScanner
```

The scanner is intentionally designed for controlled validation.

Its security model includes protections against dangerous network destinations such as:

```text
localhost
127.0.0.1
private network ranges
cloud metadata endpoints
```

The scanner is designed around safe, non-destructive HTTP validation rather than exploitation.

---

# Evidence and Findings

The discovery system separates raw discovery from actual security findings.

```text
Search Result
     ↓
Relevant Asset
     ↓
Validation
     ↓
Evidence
     ↓
Exposure Classification
     ↓
Finding
```

This distinction is important because:

> A publicly indexed URL is not automatically a vulnerability.

The system therefore uses evidence and deterministic classification before presenting an exposure finding.

---

# Redaction

Sensitive information should never unnecessarily flow into reporting or AI interpretation.

The intended pipeline is:

```text
Raw Discovery / Response
          │
          ▼
Sensitive Data Detection
          │
          ▼
Redaction
          │
          ▼
Sanitized Evidence
          │
          ├──────────────► Report
          │
          └──────────────► Ollama
```

The repository includes dedicated redaction functionality in the administrative/discovery/reporting layers.

---

# AI Analysis

Ollama is accessed through:

```text
OllamaService
```

The AI layer is intentionally separated from security-critical logic.

### AI can help with:

* Explanation
* Summarization
* Security context
* Remediation suggestions
* Report prose

### AI should not control:

* Scan scope
* Target selection
* SSRF protection
* Authentication bypass
* Exploitation
* Credential testing
* Redaction
* Deterministic security decisions

This separation makes the application safer and keeps core scanner behavior predictable.

---

# PDF Reporting

The reporting layer contains:

```text
PdfReportService
```

It uses OpenHTMLToPDF/PDFBox dependencies to generate PDF reports.

The report pipeline can combine:

```text
Discovered Assets
       +
Exposure Findings
       +
Redacted Evidence
       +
Security Interpretation
       +
Remediation
       ↓
PDF Report
```

The repository also contains dedicated PDF redaction tests.

---

# Caching and Concurrency

UnveiledLens does not require Redis.

The discovery layer contains an in-memory:

```text
ScanCacheService
```

Configuration includes:

```env
DISCOVERY_REQUEST_WAIT_SECONDS=60
DISCOVERY_CACHE_TTL_MINUTES=15
DISCOVERY_CACHE_MAX_ENTRIES=500
DISCOVERY_BACKGROUND_CONCURRENCY=2
DISCOVERY_IO_CONCURRENCY=8
```

These controls help prevent repeated discovery work and provide bounded concurrency.

The values are configurable through environment variables.

---

# Database and Migrations

Flyway migrations are located at:

```text
backend/src/main/resources/db/migration/
```

Current migrations:

```text
V1__init.sql
V2__admin_access_requests.sql
V3__user_domain.sql
V4__user_username.sql
V5__admin_request_domain.sql
```

Migration execution is automatic when the backend starts.

Do not manually alter application tables in production without understanding how that affects Flyway's migration history.

---

# Testing

Run the backend test suite from:

```text
backend/
```

### Windows

```bash
mvnw.cmd clean test
```

### Linux / macOS

```bash
./mvnw clean test
```

The repository currently contains tests covering areas including:

```text
Application startup
Scan caching
PDF report redaction
```

Relevant test files include:

```text
backend/src/test/java/com/unveiledlens/
├── UnveiledLensApplicationTests.java
├── discovery/
│   └── ScanCacheServiceTest.java
└── report/
    └── PdfReportRedactionTest.java
```

---

# Frontend Linting

Run:

```bash
cd frontend
npm run lint
```

The frontend currently uses Oxlint.

---

# Frontend Production Validation

Recommended local validation:

```bash
cd frontend

npm ci
npm run lint
npm run build
```

---

# Production Deployment

For production, deploy the application as two independently buildable components:

```text
                 Internet
                    │
                    ▼
             Reverse Proxy
          HTTPS / TLS termination
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
     React Static         Spring Boot
       Assets                API
                              │
                  ┌───────────┼───────────┐
                  │           │           │
                  ▼           ▼           ▼
                MySQL      SerpApi      Ollama
```

A typical production deployment should include:

* HTTPS
* Secure secret management
* Production MySQL
* Restricted database access
* Backend/API rate limiting
* Secure CORS configuration
* Strong JWT secret
* Production SMTP credentials
* Proper domain configuration
* Monitoring/logging
* Regular dependency updates
* Backups
* Database migration control

---

# Production Environment Checklist

Before deployment:

```text
[ ] Replace development JWT secret
[ ] Configure production database
[ ] Configure production SMTP
[ ] Configure SerpApi key
[ ] Configure Ollama or disable optional AI functionality
[ ] Configure production frontend API URL
[ ] Enable HTTPS
[ ] Configure secure CORS
[ ] Verify domain ownership configuration
[ ] Review scanner SSRF protections
[ ] Review rate limits
[ ] Review logs for sensitive data
[ ] Verify .env is excluded from Git
[ ] Run backend tests
[ ] Run frontend lint
[ ] Run frontend production build
[ ] Test authentication
[ ] Test OTP delivery
[ ] Test domain verification
[ ] Test discovery
[ ] Test redaction
[ ] Test PDF reporting
```

---

# Environment Variables

## Backend

| Variable                           | Purpose                       | Example                  |
| ---------------------------------- | ----------------------------- | ------------------------ |
| `DB_HOST`                          | MySQL host                    | `localhost`              |
| `DB_PORT`                          | MySQL port                    | `3306`                   |
| `DB_NAME`                          | Database name                 | `unveiledlens`           |
| `DB_USER`                          | Database user                 | `root`                   |
| `DB_PASS`                          | Database password             | —                        |
| `SMTP_HOST`                        | SMTP server                   | `smtp.gmail.com`         |
| `SMTP_PORT`                        | SMTP port                     | `587`                    |
| `SMTP_USER`                        | SMTP username                 | —                        |
| `SMTP_PASS`                        | SMTP password/app password    | —                        |
| `JWT_SECRET`                       | JWT signing secret            | —                        |
| `SERPAPI_KEY`                      | SerpApi API key               | —                        |
| `OLLAMA_BASE_URL`                  | Ollama endpoint               | `http://localhost:11434` |
| `OLLAMA_MODEL`                     | Ollama model                  | `llama3`                 |
| `OLLAMA_TIMEOUT_MS`                | AI request timeout            | `5000`                   |
| `OLLAMA_MAX_TOKENS`                | Maximum AI output tokens      | `96`                     |
| `SERPAPI_TIMEOUT_MS`               | SerpApi timeout               | `5000`                   |
| `DISCOVERY_REQUEST_WAIT_SECONDS`   | Discovery wait time           | `60`                     |
| `DISCOVERY_CACHE_TTL_MINUTES`      | Cache TTL                     | `15`                     |
| `DISCOVERY_CACHE_MAX_ENTRIES`      | Cache size                    | `500`                    |
| `DISCOVERY_BACKGROUND_CONCURRENCY` | Background concurrency        | `2`                      |
| `DISCOVERY_IO_CONCURRENCY`         | I/O concurrency               | `8`                      |
| `ADMIN_APPROVAL_EMAIL`             | Administrative approval email | —                        |
| `ADMIN_APPROVAL_BASE_URL`          | Admin approval URL            | —                        |

The backend's current configuration maps these variables into Spring Boot properties.

---

## Frontend

| Variable            | Purpose         | Example                 |
| ------------------- | --------------- | ----------------------- |
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8080` |

---

# Troubleshooting

## MySQL connection error

Check:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=unveiledlens
DB_USER=root
DB_PASS=your-password
```

Make sure MySQL is running.

Test the connection independently before debugging Spring Boot.

---

## Flyway migration failure

Check:

```text
backend/src/main/resources/db/migration/
```

Do not rename or modify an already-applied migration casually.

If a migration has already been executed in a shared/production database, create a new migration instead of rewriting history.

---

## SMTP authentication failure

Verify:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

For Gmail, use an App Password where required.

---

## SerpApi errors

Verify:

```env
SERPAPI_KEY=...
```

Also check the configured timeout:

```env
SERPAPI_TIMEOUT_MS=5000
```

---

## Ollama connection error

Check:

```bash
ollama list
```

Then:

```bash
ollama pull llama3
```

Verify Ollama is available at:

```text
http://localhost:11434
```

---

## Frontend cannot connect to backend

Check:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Then verify that Spring Boot is actually running on port `8080`.

---

## JWT authentication stops working

Check:

```env
JWT_SECRET=...
```

Changing the JWT signing secret invalidates previously issued tokens.

Log in again after changing it.

---

# Security Considerations

UnveiledLens handles security-related information and should be treated as security-sensitive software.

### Never commit:

```text
.env
```

or real:

```text
JWT secrets
Database passwords
SMTP passwords
API keys
Production credentials
```

### Do not use production credentials in development source code.

### Do not disable SSRF protections simply to make a scan succeed.

### Do not treat search-engine discovery as proof of a vulnerability.

### Do not send raw sensitive evidence to external AI services.

### Use HTTPS in production.

### Restrict database access to trusted application infrastructure.

### Keep dependencies patched.

---

# Responsible Use

UnveiledLens is intended for:

* Security teams
* Developers
* Organizations auditing their own domains
* Authorized security assessments
* Security research conducted with permission

Only scan domains and resources for which you have appropriate authorization.

The system is intentionally designed around ownership verification and safe, non-destructive validation.

---

# Limitations

UnveiledLens does **not** claim to:

* Discover every exposed API.
* Discover every vulnerability.
* Discover every cloud-storage exposure.
* Replace penetration testing.
* Replace a full vulnerability scanner.
* Replace a complete attack-surface-management platform.
* Exploit discovered systems.
* Perform destructive testing.
* Guarantee that a discovered resource is vulnerable.

Search engines only expose a subset of publicly indexed information, and discovery results can change over time.

A discovery result should therefore be interpreted as an **exposure signal**, not automatically as a confirmed vulnerability.

---

# Development Utilities

The repository also contains root-level scripts such as:

```text
get_url.js
get_url.py
rename_words.js
replace_colors.js
update_theme.js
```

These are development/maintenance utilities rather than core runtime components.

Similarly, the root:

```text
requirements.txt
```

is a project requirements/specification document describing architectural and implementation requirements. It is **not** a Python package dependency file.

---

# Recommended Development Workflow

```bash
# Clone
git clone https://github.com/larvianankani7/UnveiledLens.git
cd UnveiledLens

# Configure MySQL
# Create database: unveiledlens

# Configure backend
cd backend
# create .env

# Run backend
mvnw.cmd spring-boot:run
```

In another terminal:

```bash
cd frontend

# Install dependencies
npm ci

# Configure frontend
# create .env

# Start frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# Production Build Workflow

## Frontend

```bash
cd frontend
npm ci
npm run lint
npm run build
```

## Backend

```bash
cd backend
mvnw.cmd clean test
mvnw.cmd clean package
```

For Linux/macOS:

```bash
cd backend
./mvnw clean test
./mvnw clean package
```

---

# Project Philosophy

UnveiledLens follows several core principles:

### 1. Discovery before assumptions

The system starts with what the public web actually reveals.

### 2. Verification before active scanning

Domain ownership is treated as a security boundary.

### 3. Evidence before conclusions

A discovered URL is not automatically a vulnerability.

### 4. Deterministic security logic

Security-critical decisions should not depend on an LLM.

### 5. Privacy-conscious AI

Sensitive evidence is redacted before AI interpretation.

### 6. Non-destructive validation

The scanner validates discovered resources without attempting exploitation.

### 7. Modular architecture

Search providers, AI providers, persistence and business logic are kept separated.

---

# Roadmap

Potential future improvements include:

* More search providers
* Expanded asset classification
* More API specification formats
* Stronger scan scheduling
* Persistent scan history
* Expanded finding taxonomy
* Improved remediation guidance
* More comprehensive test coverage
* Production observability
* Background job infrastructure
* Distributed scanning architecture
* More granular RBAC
* Additional compliance mappings
* Containerized deployment
* CI/CD automation

---

# Contributing

Contributions are welcome.

Before submitting changes:

1. Create a feature branch.
2. Keep changes focused.
3. Follow the existing module structure.
4. Do not commit secrets.
5. Add or update tests where appropriate.
6. Run backend tests.
7. Run frontend linting.
8. Run the frontend production build.
9. Open a pull request with a clear description.

Example:

```bash
git checkout -b feature/your-feature

git add .
git commit -m "feat: describe your change"

git push origin feature/your-feature
```

---

# License

If this repository is intended for public/open-source distribution, add the project's chosen license here.

Example:

```text
MIT License
```

Do not claim a license until one has actually been added to the repository.

---

# Disclaimer

UnveiledLens is a security auditing and exposure-discovery project intended for authorized use.

You are responsible for ensuring that you have permission to inspect, validate, or analyze the domains and resources you provide to the application.

The project does not guarantee complete discovery or vulnerability detection and should not be treated as a substitute for professional security testing.

---

## UnveiledLens

> **Discover Beyond the Known.**

Search the public surface.
Verify what belongs to you.
Understand what has been exposed.
