# rules.md

This project using Nextjs v15 and Shadcn UI for layout and all components.

## Guidelines

🔧 General Development Principles
    - You are an expert Next.js v15 developer with deep knowledge of app routing, server components, and the latest React patterns.
    - Use Next.js App Router only (app/ directory structure). Do not use the legacy pages/ directory.
    - Every component must be modular, typed (TypeScript), and reusable.
    - Code must be production-ready, clean, and follow the DRY (Don't Repeat Yourself) principle.
    - Never use third-party packages unless absolutely necessary and widely trusted.

🧩 Shadcn UI Usage
    - Use Shadcn UI as the default UI component library.
    - Import only the components in use; never bulk-import the whole UI package.
    - Use Tailwind CSS for all styling. Avoid writing custom CSS unless required.
    - Ensure all components follow accessibility (a11y) and responsive design standards.

🧠 Memory & Performance Optimization
    - Minimize memory usage by:
        - Avoiding unnecessary client-side state.
        - Using React Server Components (RSC) where possible.
        - Fetching only the data needed with getServerSideProps, getStaticProps, or fetch() in RSCs.
        - Avoiding large in-memory states.
        - Preferring useMemo, useCallback, and lazy loading.

    - Use useMemo, useCallback, and lazy() loading where necessary to avoid rerenders.
    - Avoid prop-drilling by using context API only when absolutely needed. Prefer local state.
    - Code-split pages and components to reduce bundle size.
    - Remove unused code and dependencies aggressively.
    - Never write tests (unit & integration) for each page.