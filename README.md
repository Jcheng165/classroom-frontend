## Live Frontend

`https://acanode.vercel.app/`

This is the deployed Classroom UI. Use the demo accounts from the backend README to log in as admin / teacher / student.

---

## Classroom Frontend

This is the **React + Refine** frontend for the Classroom demo application. It provides:

- **Authentication UI** (login/register) using Better-Auth on the backend.
- **Role-based dashboards** for **students**, **teachers**, and **admins**.
- CRUD pages for **classes**, **subjects**, **departments**, **faculty**, and **enrollments**.
- Integration with **Cloudinary** for class banner images.

### Tech Stack

- **React 18** with **TypeScript**
- **Refine Core** (`@refinedev/core`, `@refinedev/react-hook-form`, `@refinedev/react-router`) for resource-based routing, data fetching, and auth.
- **React Hook Form** + **Zod** for forms and validation
- **Vite** for bundling
- **Tailwind CSS** + custom components for styling

### Getting Started (Local)

1. Install dependencies:

```bash
cd classroom-frontend
npm install
```

2. Create a `.env` file (already present in this repo) and ensure it points to your backend:

```env
VITE_BACKEND_BASE_URL=http://localhost:8000/api/
BACKEND_BASE_URL=https://classroom-backend-production-364b.up.railway.app/api/
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...
VITE_CLOUDINARY_UPLOAD_URL=...
```

3. Run the dev server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

### Demo Accounts

These users are seeded by the backend and are useful for demos/interviews (credentials provided on the backend README):

- **Admin:** manage everything (users, classes, subjects, departments).
- **Teacher:** create classes, manage their subjects, view rosters.
- **Student:** enroll in classes and view their schedule.

### Notable Features (Good for Resume)

- **Role-based UI** – pages and actions adapt based on `admin` / `teacher` / `student` roles.
- **Refine data provider** configured with `credentials: "include"` to send Better-Auth cookies for secure cross-origin requests.
- **Robust list pages** – server-side pagination, search, and filtering for all major resources.
- **Form UX** – validation with clear error messages and disabled submit buttons when input is invalid.
- **Tailwind class helper (`cn`)** – small utility built on top of `clsx` and `twMerge` to safely merge Tailwind classNames without conflicts.

