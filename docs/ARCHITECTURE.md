# 🏛️ POLAR-OPS System Architecture

This document outlines the full-stack architecture of the POLAR-OPS digital twin platform, emphasizing the backend processing, database structures, and real-time data ingestion pipelines.

## 1. High-Level Architecture

POLAR-OPS has transitioned from a static frontend demo into a robust, mission-critical enterprise product utilizing a modern **Next.js 14 App Router** architecture with a **Serverless Node.js backend** and a **PostgreSQL** database managed by **Prisma ORM**.

```text
┌───────────────────────────────────────────────────────────────────────┐
│                          POLAR-OPS PLATFORM                           │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────┐     ┌───────────────────┐     ┌─────────────────┐  │
│  │  UI/Frontend  │ ──> │   API Routes      │ ──> │ Core Processing │  │
│  │ (React/Next)  │ <── │ (Next.js Server)  │ <── │ (TS Engines)    │  │
│  └───────────────┘     └───────────────────┘     └─────────────────┘  │
│                                  │                        │           │
│                                  v                        v           │
│                        ┌───────────────────┐     ┌─────────────────┐  │
│                        │   Prisma ORM      │     │ Open-Meteo API  │  │
│                        │ (PostgreSQL DB)   │     │ (Live Weather)  │  │
│                        └───────────────────┘     └─────────────────┘  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## 2. Core Components

### 2.1 Backend APIs
All heavy computations have been moved to the backend to ensure clients (station commanders) can run the app efficiently on low-power devices.

- **`/api/environmental`**: Handles GET requests by fetching the latest real-time weather data for Maitri or Bharati stations from Open-Meteo. It synchronizes this data into the PostgreSQL `EnvironmentalData` model before serving it to the frontend.
- **`/api/monte-carlo`**: Executes the 10,000 iteration Monte Carlo risk simulation. It dynamically queries the DB to fetch the *real-world* current station temperature as the baseline, runs the physics simulation entirely in Node.js, and stores the results in the `Simulation` table.
- **`/api/simulation`**: Runs deterministic failure cascades (e.g. "What if a generator fails?").
- **`/api/copilot`**: Handles natural language queries to the AI assistant.
- **`/api/auth`**: NextAuth authentication endpoints with Role-Based Access Control (RBAC).

### 2.2 Telemetry Ingestion Pipeline
To simulate IoT sensor integration, the backend acts as a synchronization worker:
1. Client requests environment data.
2. `weather-sync.ts` queries the PostgreSQL database.
3. If the telemetry is older than 15 minutes, it triggers a live HTTP request to the Open-Meteo API using the precise GPS coordinates of the Antarctic stations.
4. The database is updated with the real temperature, wind speed, visibility, and pressure.

## 3. Database Schema (PostgreSQL)

The system relies on a heavily normalized relational database schema designed for analytical querying and audit compliance.

- **`User` & `Role`**: NextAuth models storing `ADMIN`, `ENGINEER`, and `VIEWER` permissions.
- **`Station`**: Represents the physical parameters of Maitri and Bharati (Coordinates, active crew count, current fuel capacity).
- **`Subsystem`**: Tracks individual systems (Generators, RO Plants, HVAC) with JSON `details` for dynamic metrics.
- **`EnvironmentalData`**: A time-series compliant table recording all historical weather and telemetry data.
- **`Simulation`**: An audit trail of all "What-If" scenarios and Monte Carlo distributions requested by the operators.
- **`Component`**: Tracks MTBF (Mean Time Between Failures) and Weibull distribution parameters for Predictive Maintenance.
- **`AuditLog`**: Tracks sensitive actions taken by personnel.

## 4. Security & Compliance
- **Server-side execution**: No sensitive station data or API keys are exposed to the browser.
- **Authentication**: Bcrypt password hashing and secure JWT session tokens managed by NextAuth.
- **Type Safety**: End-to-end TypeScript safety enforced by Prisma generation schemas.

## 5. Future Roadmap
1. **Edge/Local Deployment**: Containerize the PostgreSQL DB and Node.js server into a Docker image for local air-gapped deployment directly onto station servers to survive VSAT satellite blackouts.
2. **Local LLM Integration**: Migrate the AI Copilot from cloud APIs to a locally hosted quantized model (e.g., Llama-3-8B via Ollama).
3. **TimescaleDB Integration**: Convert the `EnvironmentalData` table into a TimescaleDB hypertable for optimized billions-row time-series querying.
