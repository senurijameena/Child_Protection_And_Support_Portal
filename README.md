# Child Protection and Support Portal

A role-based web platform to report child protection concerns, request support services, and coordinate case handling across Public Users, Social Workers, Admins, and Police.

## Project Overview

This project is built as a full-stack application:

- **Frontend:** React + TypeScript (`frontend/childFrontend`)
- **Backend:** Spring Boot (Java) + MongoDB (`backend`)

The system supports:

- Case reporting and help requests
- Social worker assignment and request handling
- Service package workflow (propose, accept/reject, execute)
- Resource assignment and follow-up tracking
- Collaboration and transfer workflows
- Feedback and request lifecycle (`COMPLETED -> CLOSED -> ARCHIVED`)

## Main Modules

### Public User

- Submit case reports and help requests
- Track request details and timeline
- View assigned resources and follow-up updates
- Submit feedback after support completion

### Social Worker

- View assigned requests and manage request actions
- Accept/reject/transfer requests
- Assign resources and schedule follow-ups
- Collaborate with other social workers
- Review feedback and send one final response

### Admin

- Monitor all users, cases, and help requests
- Manage announcements and reports
- Oversee transfers and platform operations

### Police

- View and manage police-relevant case records

## Repository Structure

```text
Child_Protection_And_Support_Portal/
  backend/                  # Spring Boot backend
  frontend/childFrontend/   # React frontend
```

## Prerequisites

- **Node.js** 18+ and npm
- **Java** 17+
- **Maven** (or use Maven Wrapper in `backend`)
- **MongoDB** running locally or remotely

## Local Setup

## 1) Backend

```bash
cd backend
./mvnw spring-boot:run
```

For Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Default API base (typical): `http://localhost:8080/api`

## 2) Frontend

```bash
cd frontend/childFrontend
npm install
npm run dev
```

Default frontend URL (typical): `http://localhost:5173`

## Environment Notes

- Configure backend DB and security settings in backend configuration files.
- Configure frontend API target using Vite environment variables (for example `VITE_API_URL`) if needed.

## API and Integration

Frontend service files connect UI to backend APIs:

- `frontend/childFrontend/src/services/dashboardApi.ts`
- `frontend/childFrontend/src/services/socialWorkerApi.ts`
- `frontend/childFrontend/src/services/feedbackApi.ts`

Backend controllers/services handle role workflows and business rules (examples):

- `backend/src/main/java/com/example/childPortal/controller/HelpController.java`
- `backend/src/main/java/com/example/childPortal/controller/DashboardController.java`
- `backend/src/main/java/com/example/childPortal/service/impl/FeedbackServiceImpl.java`
- `backend/src/main/java/com/example/childPortal/service/FollowUpSchedulerService.java`

## Notes

- This repository may include generated build output under `backend/target/`.
- Prefer excluding build artifacts from version control where possible.

