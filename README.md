# UnveiledLens

**Discover Beyond the Known.**

UnveiledLens is an ownership-verified, SerpApi-powered external exposure auditor. 

Its purpose is to discover publicly indexed API/storage resources and other relevant exposure signals associated with a verified domain, safely determine whether discovered resources appear accessible without authentication, classify the exposure, and provide privacy-conscious security findings.

**Core Product Loop:** Discover → Verify → Classify → Safely Validate → Interpret → Inform

## What UnveiledLens Is (And Isn't)
UnveiledLens identifies publicly discoverable exposure signals through search-engine intelligence. It turns publicly discoverable exposure signals into actionable security findings. 

**Disclaimer**: UnveiledLens does not claim to discover every exposed API, every vulnerability, or every security issue. It is NOT a full vulnerability scanning tool or a complete attack-surface discovery platform. It performs non-destructive, safe HTTP validation of resources discovered via search engines. 

## Architecture

### Frontend
- **Stack**: React, Vite, Tailwind CSS, React Router (No TypeScript)
- **Features**: Registration (User/Admin), Login, Landing Page, Authenticated Search Results Shell
- **Design**: Minimal, premium, charcoal/burnt-orange aesthetic

### Backend
- **Stack**: Java 17+, Spring Boot, Spring Web, Spring Security, Spring Data JPA, Hibernate, JWT Auth
- **Database**: MySQL 8.x + Flyway Migrations
- **Integrations**: SerpApi, Ollama (optional), Gmail SMTP, SMS Provider

## Security & Privacy Model
- **Domain Verification**: Mandatory verification (DNS or Email OTP) before active scanning
- **Safe Scanner Model**: SSRF protections (no localhost, private IPs, cloud metadata). Strictly non-destructive requests (GET/HEAD)
- **Redaction Model**: Sensitive data (passwords, JWTs, OTPs, API keys) are not stored. Evidence is redacted before presentation or AI interpretation
- **Role-based Auth**: Separate User and Admin roles enforced by the backend

## Setup & Execution

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.x
- Local Ollama (Optional, with `llama3` or similar model)

### Database Setup
1. Ensure MySQL is running on localhost:3306
2. Create a database named `unveiledlens`
3. Flyway migrations will run automatically on Spring Boot startup

### Backend
1. `cd backend`
2. Create `.env` based on `.env.example`
3. Run `mvnw.cmd spring-boot:run` (or use VS Code IDE)

### Frontend
1. `cd frontend`
2. Run `npm install`
3. Create `.env` based on `.env.example`
4. Run `npm run dev`

### External Integrations
- **SerpApi**: Requires a SerpApi key (set `SERPAPI_KEY`)
- **Gmail**: Uses SMTP for Email OTP. Set `GMAIL_USER` and `GMAIL_PASS`
- **SMS**: Requires an SMS provider API key
- **Ollama**: Requires Ollama running locally at `OLLAMA_URL`

## Testing
Run unit and integration tests for the backend using `mvn clean test`. Tests prioritize authentication flows, SSRF protection, discovery, and finding classifications.

---
*Note for Hackathons: This project was developed with AI-assisted development tools to scaffold the architecture and streamline the implementation.*
