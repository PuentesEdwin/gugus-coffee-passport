# Gugus Coffee Passport · New York City

A private coffee passport for two: 30 suggested NYC cafés plus blank pages for your own finds. Each page has two photos (storefront + your coffee/beans), the drink, a 1–5 bean bitterness scale, stars, price and handwritten-style notes. Saved pages get a rubber stamp and show up in the photo album, the borough stamps, the stats and the badges. "Coffee 101" explains every drink with a cup cross-section.

Stack: Vite + React + TypeScript, Vercel Functions in `/api`, Supabase (Postgres + private Storage bucket).

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173, preview mode: data stays in this browser
```

## Shared mode (both phones, behind a PIN)
1. **Supabase**: create a project (free tier is fine, region East US). In **SQL Editor** run `supabase/schema.sql` (creates the table and the private `passport-photos` bucket).
2. Copy from **Project Settings → API**: the Project URL and the `service_role` key (keep it secret; it only lives on Vercel).
3. **Vercel**: push this folder to GitHub, then **Add New → Project** and import it (framework: Vite).
4. In **Settings → Environment Variables** add:
   - `PASSPORT_PIN` – the PIN you both type on the cover (use 6+ digits)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET` – optional, any long random text
5. Deploy. Open the URL on both phones, type the PIN, and use **Share → Add to Home Screen** so it opens like an app.

Changing `PASSPORT_PIN` logs every device out.

## Where things are
- `src/data/cafes.ts` – the 30 suggested cafés (checked Oct 2026; edit freely)
- `src/data/drinks.ts` – drink glossary, bitterness scale, tasting steps
- `src/components/` – Cover (PIN), Passport (book), Editor, Album, Explore, Stats, Guide
- `src/lib/storage.ts` – preview mode (IndexedDB) vs shared mode (`/api`)
- `api/` – PIN login cookie, entries, photo upload/signed URLs
