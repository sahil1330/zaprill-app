<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Architecture Rules
Follow the guidelines in [.agents/ARCHITECTURE.md](file:///.agents/ARCHITECTURE.md). 
- Always separate frontend and backend.
- Prefer API routes over Server Actions for data mutations and heavy fetching.
- Treat this as an application, not a marketing site.
