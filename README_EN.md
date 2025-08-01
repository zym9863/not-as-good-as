# Not As Good As

English | [中文](./README.md)

A lightweight application that helps with emotional farewell and cherishing memories through "ritual".  
Tech Stack: React + TypeScript + Vite, Package Manager: pnpm.

This project implements two core features:
1) Memories in a Bottle  
- Create memories (text/images/audio/dates)  
- Seal: Set future unlock date, invisible before unlocking  
- Let Go: Elegant animation followed by permanent deletion, non-recoverable

2) The First Encounter  
- Independent "first encounter" storyline page, recording time/location/weather/dialogue/mood etc.  
- Once locked, enters read-only mode to ensure initial beauty isn't polluted by subsequent emotions

---

## Quick Start

Requirements: Node 18+, pnpm 8+

Install dependencies:
```bash
pnpm install
```

Development:
```bash
pnpm dev
```

Build:
```bash
pnpm build
```

Preview:
```bash
pnpm preview
```

Lint:
```bash
pnpm lint
```

---

## Routes & Page Structure

Planned routes:
- `/` Ritual entrance page (guide to "Memories in a Bottle" and "The First Encounter")
- `/memories` Memory list page (with creation entry and filtering)
- `/memories/new` Create memory page
- `/memories/:id` Memory detail page  
  - Sealed and not yet due: Only show sealed card and unlock time  
  - Auto-unsealed when due: Show content
- `/first-encounter` First encounter page  
  - Not created: Creation form  
  - Not locked: Editable  
  - Locked: Read-only display
- `*` 404 fallback

Initially complete page skeleton and navigation, then iterate features.

---

## Data Models

Memory
```ts
type MemoryType = "text" | "image" | "audio" | "date";

interface MemoryContent {
  text?: string;
  imageBlobIds?: string[]; // IndexedDB Blob references
  audioBlobId?: string;    // IndexedDB Blob reference
  date?: string;           // ISO string
}

interface Memory {
  id: string;
  type: MemoryType;
  content: MemoryContent;
  createdAt: string;       // ISO
  status: "active" | "sealed" | "drifted";
  sealedUntil?: string;    // ISO, only when sealed
  driftedAt?: string;      // ISO, drift completion timestamp (optional)
  meta?: { tags?: string[] };
}
```

FirstEncounter
```ts
interface FirstEncounter {
  id: "first-encounter";
  createdAt: string;       // ISO
  locked: boolean;
  details: {
    time?: string;         // ISO
    location?: string;
    weather?: string;
    dialogues?: string[];  // fragments
    mood?: string;
    story?: string;        // Markdown/rich text (plain text for first version)
    photos?: string[];     // IndexedDB Blob references
  };
}
```

---

## Persistence Strategy

- Prefer IndexedDB (recommend Dexie or idb-keyval), store structured data and Blobs (images, audio).
- localStorage as fallback, only save lightweight index and metadata, no large files.
- Load index on startup; large objects loaded on demand.
- Sealed display strategy:
  - List hides unlocked items by default; provide "View Sealed" toggle to show sealed cards (content masked, only show unlock time)
  - Automatically considered active after reaching `sealedUntil`
- Drift deletion strategy:
  - Two-step confirmation + "I understand non-recoverable" checkbox
  - Play drift animation, physically delete from IndexedDB after animation ends
- First encounter read-only lock:
  - Locking is irreversible; UI and storage layer both prohibit writes

---

## Interaction Flow (MVP)

1) Create Memory  
- Enter `/memories/new`, select type and fill content  
- Save as `active`

2) Seal Memory  
- Click "Seal" on detail page  
- Pop up time capsule dialog, set future date  
- Save as `sealed`, invisible before unlock (or only show sealed card)

3) Drift Memory  
- Click "Let it drift"  
- Two-step confirmation + checkbox understanding non-recoverable  
- Play drift animation → delete record and Blob

4) Return to First Encounter  
- `/first-encounter` shows form if not created, save as editable  
- Click "Lock First Encounter" to enter read-only mode  
- Read-only page supports browsing, optional export (future enhancement)

---

## Accessibility & Animation Guidelines

- Keyboard accessible: Forms and buttons have clear focus management; modals set focus traps
- Copy matches ritual feeling: Light hints (Toast) and operation confirmations clearly layered
- Animations:
  - Drift: Bottle moving away and fading (CSS + keyframes or Lottie)
  - Seal: Particles gathering and halo shrinking, showing unlock date
- Respect system motion preferences: `prefers-reduced-motion` reduces animation intensity/duration
- Color and contrast: Follow WCAG AA

---

## Directory & Component Planning

- `src/main.tsx` Application entry
- `src/App.tsx` Routing and framework (later introduce React Router)
- `src/pages/`
  - `Home.tsx`
  - `Memories/`
    - `List.tsx`
    - `New.tsx`
    - `Detail.tsx`
  - `FirstEncounter/`
    - `Index.tsx`
- `src/components/`
  - `memories/MemoryCard.tsx`
  - `memories/SealDialog.tsx`
  - `memories/LetGoDialog.tsx`
  - `memories/DriftAnimation.tsx`
  - `firstEncounter/FirstEncounterEditor.tsx`
  - `firstEncounter/FirstEncounterView.tsx`
  - `shared/MediaUploader.tsx`
  - `shared/AudioRecorder.tsx`
  - `shared/DateTimePicker.tsx`
  - `shared/ConfirmModal.tsx`
  - `shared/Toast.tsx`
- `src/state/`
  - `types.ts`
  - `db.ts` IndexedDB wrapper
  - `store.ts` Lightweight state management (Context/Reducer or Zustand)
- `src/utils/`
  - `date.ts`
  - `a11y.ts`

---

## Development Milestones

MVP
- Routing and page skeleton
- Memory creation/list/detail (primarily text)
- Seal/unseal logic (time-based)
- Drift confirmation and basic animation + deletion
- First encounter creation/lock read-only
- Basic IndexedDB read/write + Blob storage
- Basic README and documentation

Enhancement
- Image/audio upload and recording
- List filtering and tags
- Export read-only page as image/PDF
- Animation refinement and sound effects (mutable)
- Data encryption/privacy enhancement (optional)

---

## Conventions & Limitations

- Data stored only in local browser, no cloud sync
- Drift deletion is non-recoverable, please confirm carefully
- Recording depends on browser MediaRecorder, fallback to audio file upload when permission denied

---

## Contributing & Code Standards

- Use TypeScript, follow ESLint and basic naming conventions
- Keep components reusable and side-effect free
- Clear commit messages: feat/fix/chore/docs prefixes

---

## License

MIT