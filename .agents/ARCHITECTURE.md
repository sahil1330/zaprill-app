# Architecture Guidelines

This project is a web application, not a static marketing site. To maintain a clean separation of concerns and ensure a robust application architecture, the following rules must be followed for all new features and refactors.

## 1. Separation of Frontend and Backend
We maintain a strict separation between the frontend UI and the backend logic. 

- **Frontend**: Primarily client-side components (`"use client"`) that interact with the backend via standard HTTP requests.
- **Backend**: API routes and server-side services that handle data processing, database interactions, and business logic.

## 2. API Routes over Server Actions
While Next.js supports Server Actions and React Server Components (RSC) for data fetching/mutations, we prefer a traditional API-driven approach for this application.

- **Mandatory**: Use API routes (`src/app/api/...`) for:
    - Data fetching (GET requests).
    - Form submissions and data mutations (POST, PUT, DELETE requests).
    - Complex business logic.
- **Discouraged**: 
    - Do not use Server Actions (`"use server"`) for primary application features.
    - Avoid performing heavy data fetching directly inside Server Components if they can be moved to a client component with an API call.

## 3. Client-Side Data Fetching
Use standard patterns for client-side data fetching (e.g., `useEffect` with `fetch`, or libraries like SWR/React Query if available).

- Fetch data from `/api/...` endpoints.
- Manage loading and error states in the client component.
- Use optimistic updates in the UI where appropriate.

## 4. When to use Server Components
Server Components should be used sparingly, primarily for:
- Initial page metadata (SEO).
- Layout structures that don't require high interactivity.
- Passing initial context/props to the root client components of a page.

## 5. Security and Validation
All backend logic must be implemented in API routes where:
- Authentication is strictly verified (using `auth.api.getSession`).
- Input validation is performed before any database operation.
- Rate limiting and other security measures are applied.

---

**Note to Antigravity LLM**: When creating or modifying features, always refer to this document. If a task involves data mutation, create a corresponding API route instead of a Server Action.
