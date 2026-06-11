# Inventory App

Inventory App is an Angular web application for managing item inventories with geographic location, photo uploads, category organization, and AI-powered item suggestions. It connects authenticated users to their personal inventories through map-based item placement, image galleries, and Ollama-powered form autocompletion.

The product goal is to provide a centralized platform for individuals and organizations to catalog, organize, and locate physical items with visual references and spatial context.

## Main Features

- Firebase authentication with email/password and Google sign-in.
- Personal inventory management with create, edit, and delete flows.
- Category-based item organization with autocomplete selection.
- Item creation with map-based location picker (Leaflet) and reverse geocoding.
- Multi-photo upload per item with Cloudinary integration.
- AI-powered item form suggestions from photos using Ollama vision models.
- Public inventory sharing and item filtering by name, category, and year.
- Statistics dashboard with charts (Chart.js) for inventory and item metrics.

## Tech Stack

- Angular 21 (Standalone Components, Signals)
- TypeScript
- RxJS
- Firebase Authentication
- Leaflet (interactive maps)
- Chart.js / ng2-charts (statistics)
- Tailwind CSS 4
- PostCSS
- Vitest through Angular's unit test builder

## Requirements

- Node.js compatible with Angular 21
- npm
- A running Inventory backend API
- Firebase project credentials for authentication
- Cloudinary account for image uploads
- Ollama with a vision model (e.g. `llava`) for AI suggestions

## Setup

Install dependencies:

```bash
npm install
```

For local development, the app uses `src/environments/environment.development.ts`, which points to:

```text
http://localhost:8080
```

Make sure the backend API is available at that URL, or update `API_BASE_URL` in the environment file for your local setup.

## Execution

Start the local development server:

```bash
ng serve
```

Open the app at:

```text
http://localhost:4200
```

Create a production build:

```bash
npm run build
```

## Testing

Tests are configured through Angular's unit test builder and Vitest.

### Run Tests

```bash
npm test
```

This runs the full suite once. Vitest runs in watch mode by default; `npm test` maps to `ng test --watch=false` so it exits after the run.

### Run Coverage

```bash
npm run test:coverage
```

Generates a text summary in the terminal, a JSON summary at `coverage/coverage-summary.json`, and an HTML report at `coverage/index.html`.

### Test Architecture

| Pattern | Use |
|---------|-----|
| `TestBed.configureTestingModule` with `provideHttpClient`/`provideHttpClientTesting` | API service specs — mock `HttpTestingController` |
| `TestBed.runInInjectionContext` | Functional guards and interceptors |
| `TestBed.createComponent` + `fixture.componentRef.setInput` | Standalone component specs with signal inputs |
| Plain function imports | Pure mappers, utilities, pipes, validators |
| Store `@Injectable()` classes with mocked dependencies via `TestBed` | State store specs (`provide` dependency overrides) |
| `vi.mock('@angular/fire/auth', ...)` | Firebase auth mocking for auth service |

## Architecture Overview

The application follows a feature-first Angular structure.

```text
src/app/
  core/       Cross-cutting app infrastructure
  features/   Route-level product areas
  shared/     Reusable components, models, services, and utilities
```

### Core

`src/app/core` contains application-wide infrastructure:

- `guards`: authentication and role-based route guards.
- `interceptors`: auth token attachment and API error handling.
- `layout`: navbar and layout components.
- `constants`: API route definitions.
- `services`: authentication, API, map, toast notifications, and geocoding services.

### Features

`src/app/features` contains route-level business areas:

- `auth`: login and registration pages.
- `inventories`: personal inventory CRUD and public inventory browsing.
- `items`: item CRUD with map location, photo upload, and AI suggestion integration.

### Shared

`src/app/shared` contains reusable building blocks:

- UI components: autocomplete, form fields, modal, pagination, back button.
- DTO and view-model definitions.
- API services for categories, coordinates, items, photos, and inventories.
- Data stores (signals-based) for categories.
- Utility functions.

### Routing And Data Flow

Routes are defined in `src/app/app.routes.ts` and lazy-load standalone components. Protected routes use `authGuard`.

HTTP requests go through Angular's `HttpClient` with the configured auth and error interceptors. Backend calls use `environment.API_BASE_URL`. Firebase Authentication provides the user session.

## AI-Powered Item Suggestions

The app includes an AI suggestion feature that analyzes item photos and auto-fills the create-item form:

1. Select one or more photos in the create-item form.
2. Click **Suggest** — the photos are sent to the backend's `POST /api/ai/item-suggestions` endpoint.
3. Ollama's vision model (`llava`) analyzes the images and returns suggested `name`, `description`, `year`, and `categoryName`.
4. The form fields are automatically populated, including category autocomplete selection.

## Environment Variables

Production builds read environment variables and generate `src/environments/environment.ts`.

| Variable | Description | Default |
|----------|-------------|---------|
| `API_BASE_URL` | Base URL for the Inventory backend API. | `http://localhost:8080` |
| `FIREBASE_API_KEY` | Firebase web API key. | None |
| `FIREBASE_AUTH_DOMAIN` | Firebase authentication domain. | None |
| `FIREBASE_PROJECT_ID` | Firebase project ID. | None |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket. | None |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID. | None |
| `FIREBASE_APP_ID` | Firebase app ID. | None |

## Useful Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies. |
| `ng serve` | Start the local development server. |
| `npm run build` | Build the app for production. |
| `npm test` | Run unit tests. |
| `npm run test:coverage` | Run unit tests with coverage report. |
