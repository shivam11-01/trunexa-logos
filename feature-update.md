# Trunexa Logo Repository — Feature Update Prompt

Add the following features to the existing Trunexa Logo Repository Next.js project.
Do not rebuild from scratch — extend what already exists.

---

## 1. FONT — Instrument Sans

Replace Inter with Instrument Sans throughout the app.

- Install via `next/font/google`: `import { Instrument_Sans } from 'next/font/google'`
- Apply as the root font in `/app/layout.tsx`
- Remove all references to Inter

---

## 2. COLOR VARIANT DROPDOWN (Black & White)

Add a second dropdown alongside the existing File Format dropdown inside the Logo Modal.

**Component:** Add a `ColorVariantSelect` (shadcn `Select`) in `LogoModal.tsx`

**Options:**
- Full Color *(default)*
- Black
- White

**Behavior:**
- Selecting a variant updates the logo preview image in the modal
- The selected color variant + format together determine which file is fetched from Firestore
- Update the `LogoModal` props and state to handle `colorVariant` alongside `format`
- Update the download and copy actions to use the correct variant file path

**UI placement:** Place the Color Variant dropdown to the left of the File Format dropdown, on the same row, equal width. Label above each: "Variant" and "Format".

---

## 3. SHARE BUTTON (Per Logo Card)

Add a share icon button to each `LogoCard`.

**Behavior:**
- Clicking share copies a deep link URL to that specific logo to the clipboard
- URL format: `https://[your-domain]/brands/[brand-slug]?logo=[logo-id]`
- Show a shadcn `Toast` on success: "Link copied to clipboard"
- On page load, check if `?logo=[logo-id]` is present in the URL — if yes, auto-open the Logo Modal for that logo

**UI:**
- Small icon-only button (share/link icon) positioned at the top-right corner of the logo card
- Visible on hover only (opacity: 0 by default, opacity: 1 on card hover)
- Use shadcn `Tooltip` with label "Copy link"

**Implementation notes:**
- Add `useSearchParams` in the brand section or homepage to detect `?logo=` on load
- Pass `logoId` into the URL using `window.location.origin + pathname + ?logo=` + logo.id
- `navigator.clipboard.writeText(url)` on click

---

## 4. FIREBASE SETUP

Complete Firebase project setup before writing any integration code. Follow these steps exactly.

---

### 4a. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Project name: `trunexa-logo-repository` (or your preferred name)
4. Disable Google Analytics (not needed)
5. Click "Create project"

---

### 4b. Register Web App

1. In your Firebase project, click the web icon `</>` to add a web app
2. App nickname: `trunexa-logo-repo-web`
3. Do NOT check "Firebase Hosting" (you're using Vercel)
4. Click "Register app"
5. Copy the `firebaseConfig` object — you'll need these values for your `.env.local`

---

### 4c. Enable Firestore

1. In the Firebase console sidebar, go to **Build → Firestore Database**
2. Click "Create database"
3. Choose **"Start in production mode"** (you'll set rules manually below)
4. Select region: `asia-south1` (Mumbai) — closest to your users in India
5. Click "Enable"

**Firestore Security Rules** — paste these in the Rules tab:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /brands/{brandId} {
      allow read: if true;
      allow write: if false;
    }
    match /brands/{brandId}/logos/{logoId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```
> Write is blocked from the client. Uploads go through Firebase Storage + a server-side path. You can relax this later with Admin SDK authentication.

---

### 4d. Enable Firebase Storage

1. In the Firebase console sidebar, go to **Build → Storage**
2. Click "Get started"
3. Choose **"Start in production mode"**
4. Same region as Firestore: `asia-south1`
5. Click "Done"

**Storage Security Rules** — paste these in the Rules tab:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /logos/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```
> Uploads will be handled via Firebase Admin SDK or manually via the console for now. Public read is enabled so logo files load correctly in the browser.

---

### 4e. Enable CORS for Storage (Required for Browser Downloads)

Create a file called `cors.json` locally:
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "maxAgeSeconds": 3600
  }
]
```

Then run this command (requires Google Cloud SDK installed):
```bash
gsutil cors set cors.json gs://[your-storage-bucket-name]
```

Your bucket name is in your Firebase config as `storageBucket` (e.g. `trunexa-logo-repository.appspot.com`).

---

### 4f. Environment Variables

Create `.env.local` in the root of your Next.js project and add:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_UPLOAD_PIN=your_4_digit_pin
```

Also add all of the above to your **Vercel project settings** under Settings → Environment Variables.

> Never commit `.env.local` to Git. Confirm `.gitignore` already includes it.

---

### 4g. Install Firebase SDK

```bash
npm install firebase
```

---

### 4h. Firebase Initialization File

Create `/lib/firebase.ts`:
```ts
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const storage = getStorage(app)
```

---

### 4i. Seed Initial Brand Data

After Firestore is enabled, manually add the 6 brands via the Firebase console or run a one-time seed script.

**Seed script** — create `/scripts/seed.ts` and run once with `npx ts-node scripts/seed.ts`:
```ts
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'

const firebaseConfig = { /* paste your config here */ }
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const brands = [
  { name: 'Trunexa', slug: 'trunexa', description: 'Our own technology house', category: 'Parent Brand', order: 1 },
  { name: 'Trucrux', slug: 'trucrux', description: 'Core infrastructure and platform services', category: 'Infrastructure', order: 2 },
  { name: 'Chargnex', slug: 'chargnex', description: 'EV charging solutions', category: 'EV Charging', order: 3 },
  { name: 'Flownex', slug: 'flownex', description: 'Workflow and operations platform', category: 'Operations', order: 4 },
  { name: 'Paynex', slug: 'paynex', description: 'Payments and financial infrastructure', category: 'Payments', order: 5 },
  { name: 'Others', slug: 'others', description: 'Miscellaneous and umbrella brand assets', category: 'Miscellaneous', order: 6 },
]

async function seed() {
  for (const brand of brands) {
    const ref = await addDoc(collection(db, 'brands'), brand)
    console.log(`Added brand: ${brand.name} with ID: ${ref.id}`)
  }
}

seed()
```

---

## 5. FIRESTORE INTEGRATION

Replace the static `/lib/brands.config.ts` data source with Firebase Firestore.

**Environment variables (add to `.env.local` and Vercel project settings):**
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**Firestore schema:**

Collection: `brands`
```
brands/{brandId}
  - id: string
  - name: string
  - slug: string
  - description: string
  - category: string
  - order: number        ← controls display order on homepage
```

Collection: `logos` (subcollection under each brand)
```
brands/{brandId}/logos/{logoId}
  - id: string
  - name: string
  - variant: string      ← "Primary", "Icon", "Stacked", etc.
  - colorVariants:
      fullColor: { svg: string, png1x: string, png2x: string, png4x: string, pdf: string }
      black:     { svg: string, png1x: string, png2x: string, png4x: string, pdf: string }
      white:     { svg: string, png1x: string, png2x: string, png4x: string, pdf: string }
  - fileType: string     ← "SVG" | "PNG" | "PDF" | "JPG"
  - createdAt: timestamp
```

**Fetch functions in `/lib/firestore.ts`:**
- `getBrands()` — fetch all brands ordered by `order` field
- `getLogosByBrand(brandId)` — fetch all logos for a brand
- Use `getDocs`, `collection`, `query`, `orderBy` from `firebase/firestore`

**Update components:**
- `BrandSection.tsx` — fetch logos from Firestore on mount using `useEffect`
- Show a skeleton loader (shadcn `Skeleton`) while logos are loading
- Handle empty states gracefully

---

## 6. ADD NEW LOGO (PIN-PROTECTED UPLOAD MODAL)

Add a floating "Add Logo" button on the homepage and each brand section.

---

### 6a. Add Logo Button

- Position: bottom-right corner of each brand section header row
- Label: "+ Add Logo"
- Style: outlined button (accent color border + text, white bg)
- On click: open PIN entry modal

---

### 6b. PIN Entry Modal (shadcn Dialog)

- Title: "Enter PIN to continue"
- Single 4-digit PIN input (type="password", maxLength=4, centered, large font)
- Submit button: "Verify"
- PIN is stored as an environment variable: `NEXT_PUBLIC_UPLOAD_PIN`
- On correct PIN: close this modal, open the Upload Logo modal
- On wrong PIN: show inline error "Incorrect PIN. Try again." and clear the input
- Do not expose PIN validation logic on the client beyond a simple string compare

---

### 6c. Upload Logo Modal (shadcn Dialog)

Title: "Add New Logo"

**Fields:**

| Field | Type | Notes |
|---|---|---|
| Logo File | File upload (drag & drop + click to browse) | Accept: .svg, .png, .jpg, .pdf |
| Logo Name | Text input | e.g. "Trunexa Primary Horizontal" |
| Logo Variant | Text input | e.g. "Primary", "Icon", "Stacked" |
| Color | Dropdown (shadcn Select) | Options: Full Color, Black, White |
| File Type | Dropdown (shadcn Select) | Options: SVG, PNG, JPG, PDF |
| Brand | Dropdown (shadcn Select) | Populated from Firestore brands list |

**File upload area:**
- Dashed border, rounded, centered icon + text: "Drag & drop your file here or click to browse"
- Show file name + size after selection
- Accepted formats shown below: SVG · PNG · JPG · PDF

**Actions:**
- [Upload Logo] — primary button (accent bg)
- [Cancel] — ghost button

**Upload behavior:**
- Upload file to Firebase Storage at path: `logos/{brandSlug}/{colorVariant}/{filename}`
- Get the download URL after upload
- Save a new document to `brands/{brandId}/logos/` in Firestore with all fields + file URL
- Show progress indicator during upload (shadcn Progress bar)
- On success: show toast "Logo uploaded successfully", close modal, refresh the brand's logo grid
- On error: show toast "Upload failed. Please try again."

**Implementation files to create/update:**
- `/components/AddLogoButton.tsx`
- `/components/PinModal.tsx`
- `/components/UploadLogoModal.tsx`
- `/lib/storage.ts` — Firebase Storage upload helper
- `/lib/firestore.ts` — add `addLogo(brandId, logoData)` function

---

## NOTES

- Keep all existing UI, routing, and component structure intact
- All new modals use shadcn `Dialog`
- All notifications use shadcn `Toast` (Toaster already in layout)
- Ensure Firestore security rules allow read for all, write only from authenticated context or validate PIN server-side in a future iteration
- Add loading and error states for all async operations