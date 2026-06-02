# StarVnt Vendor Booking Dashboard

A production-ready Vendor Booking Dashboard built as a technical assessment for StarVnt Entertainment.

**GitHub:** https://github.com/satyaabrata/starvnt-vendor-dashboard

---

## Features

- **Authentication** — Secure register/login/logout with JWT sessions stored in HttpOnly cookies (jose + bcryptjs)
- **Vendor Profile Management** — Create and update your business profile: name, category, description, location, pricing, contact details
- **Event Inquiry Management** — View, filter, and manage incoming booking requests with status updates (pending / confirmed / rejected / completed)
- **Dashboard Analytics** — Stats cards, 6-month line chart, status donut chart, recent inquiries table
- **Public Inquiry Form** — Shareable URL for clients to send booking requests directly
- **Responsive Design** — Mobile-first layout with collapsible sidebar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) |
| Language | TypeScript |
| Auth | JWT (jose) + bcryptjs, cookie-based sessions |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 7 (custom output path) |
| UI | shadcn/ui v4 (Base UI) + Tailwind CSS v4 |
| Charts | Recharts |
| Forms | React `useActionState` + Zod validation |
| Deploy | Vercel |

---

## Architecture

```
src/
├── actions/          # Server Actions (auth, vendor, inquiry)
├── app/
│   ├── dashboard/    # Protected dashboard pages
│   │   ├── page.tsx          # Analytics overview
│   │   ├── profile/          # Vendor profile management
│   │   └── inquiries/        # Inquiry management
│   ├── login/        # Login page
│   ├── register/     # Registration page
│   ├── inquire/[id]/ # Public client inquiry form
│   └── api/seed/     # Demo data seeder (dev only)
├── components/
│   ├── auth/         # Login & register forms
│   ├── dashboard/    # Sidebar, header, charts, stats
│   ├── inquiries/    # Inquiry table, detail dialog, public form
│   ├── profile/      # Profile edit form
│   └── ui/           # shadcn/ui base components
├── lib/
│   ├── db.ts         # Prisma client singleton (with Pg adapter)
│   ├── session.ts    # JWT encrypt/decrypt, cookie management
│   ├── dal.ts        # Data Access Layer (verifySession, getCurrentUser)
│   └── validations.ts # Zod schemas
└── proxy.ts          # Route protection (Next.js 16 Proxy)
```

### Authentication Flow

1. User submits credentials via Server Action
2. Server validates with Zod, hashes/checks password with bcryptjs
3. JWT created with `jose`, stored as HttpOnly cookie (7 day expiry)
4. `proxy.ts` reads cookie on every request, redirects unauthenticated users
5. `dal.ts` `verifySession()` is called in every Server Component to verify auth

### Database Schema

```
User ──── VendorProfile ──── EventInquiry[]
```

---

## Local Development

### 1. Clone & Install

```bash
git clone https://github.com/satyaabrata/starvnt-vendor-dashboard.git
cd starvnt-vendor-dashboard
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection string → URI**
3. Copy the connection string

### 3. Configure Environment

```bash
# .env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
SESSION_SECRET="your-random-secret-min-32-characters"
```

### 4. Push Schema & Generate Client

```bash
npx prisma db push
npx prisma generate
```

### 5. Run Dev Server

```bash
npm run dev
```

### 6. Seed Demo Data (Optional)

```bash
curl -X POST http://localhost:3000/api/seed
# Demo credentials: demo@starvnt.com / password123
```

---

## Deployment on Vercel

1. Push to GitHub (already done)
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Add environment variables:
   - `DATABASE_URL` — Supabase connection string
   - `SESSION_SECRET` — Random 32+ char secret
4. Deploy — `prisma generate && next build` runs automatically

---

## Demo Credentials

After seeding:
- **Email:** `demo@starvnt.com`
- **Password:** `password123`

---

## Author

**Satyabrata Das**  
Built for StarVnt Entertainment Technical Assessment — June 2025
