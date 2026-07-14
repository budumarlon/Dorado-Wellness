# Dorado Wellness — Web App

A real, deployable Vite + React + Tailwind project for Dorado Wellness
(East Legon, Accra, Ghana), wired up to Supabase so bookings and contact
messages are actually saved and only visible to signed-in staff.

## What's inside
- Home / About / Services / Booking / Gallery / Contact — one-page site
- A working booking flow (service → date → time → details → confirmation)
- A staff dashboard (login required) to approve/cancel real bookings
- A contact form that saves real messages
- A floating WhatsApp button

## Set up Supabase (do this before anything else)
1. Go to [supabase.com](https://supabase.com), create a free account and a
   new project.
2. In your new project, go to the **SQL Editor**, paste in the contents of
   `supabase-schema.sql` (included in this folder), and run it. This creates
   the `bookings` and `contact_messages` tables with the right security
   rules: anyone can submit a booking or message, but only signed-in staff
   can read them.
3. Go to **Authentication > Users** and click "Add user" to create a login
   for whoever manages bookings (e.g. the owner's email + a password).
   This is the account used to view the Staff dashboard on the live site.
4. Go to **Settings > API** and copy the **Project URL** and the
   **anon public key**.
5. Copy `.env.example` to a new file named `.env` in this folder, and paste
   those two values in.

Without this step, the site still works as a local-only demo (bookings just
live in the browser tab and disappear on refresh) — but nothing will be
saved for real until Supabase is connected.

## Run it locally
You'll need [Node.js](https://nodejs.org) (v18 or newer) installed.

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173). Try the
booking flow, then go to Supabase's **Table Editor** to see the row appear
in the `bookings` table. Try signing in on the Staff view tab with the
login you created above.

## Build for production
```bash
npm run build
```
This creates a `dist/` folder with the finished static site.

## Deploying it live

### Option A — Vercel
1. Push this folder to a GitHub repo.
2. Go to vercel.com → "Add New Project" → import the repo.
3. Under Environment Variables, add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` (same values as your `.env`).
4. Deploy. Add your custom domain under Project Settings → Domains.

### Option B — Netlify
1. Push this folder to a GitHub repo (or drag-and-drop the `dist/` folder
   after `npm run build` at netlify.com/drop for a quick one-off — note
   the drag-and-drop route won't have your Supabase env vars, so bookings
   won't save; use the GitHub route for the real launch).
2. "Add new site" → import repo → build command `npm run build`, publish
   directory `dist`.
3. Under Site Settings → Environment variables, add the same two
   `VITE_SUPABASE_...` values.
4. Add your custom domain under Site Settings → Domain management.

Either way, you'll also want a real domain (Namecheap/GoDaddy, or a
Ghanaian registrar for `.com.gh`) pointed at the deployment.

## Making the contact form send real email notifications (optional, next step)
Right now, contact messages save to Supabase but nothing pings anyone.
Two easy ways to add a notification:
- A **Supabase Database Webhook** (Database > Webhooks) on the
  `contact_messages` table that calls a service like **Resend** or
  **Zapier** to email the owner on every new row.
- Or check the Supabase Table Editor periodically — messages and bookings
  are all sitting there in real time either way.

## Updating content
- Service names, prices, and descriptions: `src/App.jsx`, near the top,
  in the `SERVICES` array.
- Contact info, hours, address: search `src/App.jsx` for the phone number
  or "East Legon" to find those spots.
- Logo and photos: embedded as base64 images inside `App.jsx` — replace
  the relevant constant (e.g. `LOGO_DATA_URI`, `ROOM_PHOTO`) with a new
  one if assets change.
