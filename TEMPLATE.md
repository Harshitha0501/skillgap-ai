# farm-ts — context capsule

Read this once: it holds every template fact you need and you will not have to
re-open it. README.md carries the workflow, this file the facts. Skip
`components/ui/**`, `tsconfig*`, `package.json`, `node_modules/`, and
`vite.config.ts` — their contents are reproduced below, so opening them only
spends turns.

## 1. Environment state at start

Every service (frontend, backend, mongodb) is ALREADY RUNNING under supervisor
and the preview URL is healthy when your session begins — the "preview must start
before the first ask_human" precondition is ALREADY MET, and nothing you run can
make it more true. Do not run `supervisorctl status`, curl a health endpoint, or
restart anything at session start. This applies to the testing subagent too.

Ports: frontend `3000`, backend `8001` (Vite proxies `/api/*` → `8001`). Alias:
`@/*` → `frontend/src/*`. There is no cross-language alias — the boundary is HTTP.
`python` already resolves to the backend venv interpreter.

Testing subagent, in one line each: seed facts and credentials are in
`memory/spec.md` + `memory/test_credentials.md`; screenshot `path` must be a bare
filename and `quality` is JPEG-only; `page.goto` needs an absolute
`http://localhost:3000/…` URL. Details in §9.

## 2. Preinstalled — never install these

- **Frontend icons**: `lucide-react`. No other icon set is installed or needed.
- **Frontend fonts**: 16 `@fontsource` families ship in the image. Variable
  (`@fontsource-variable/<name>`): `dm-sans`, `geist`, `geist-mono`,
  `instrument-sans`, `inter`, `jetbrains-mono`, `lora`, `manrope`, `outfit`,
  `playfair-display`, `plus-jakarta-sans`, `sora`, `space-grotesk`. Plain
  (`@fontsource/<name>`): `ibm-plex-sans`, `ibm-plex-mono`, `poppins` — these
  three have no `-variable` build, so `@fontsource-variable/ibm-plex-sans` does
  not resolve. Never `yarn add` a font, and never `@import` Google Fonts: a CDN
  import ships a runtime dependency inside the delivered app.
- **Frontend data/UI**: `@tanstack/react-query`, `sonner`, `motion`,
  `react-router-dom`, `date-fns`, `next-themes`, `react-day-picker`,
  `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`,
  `tw-animate-css`.
- **Frontend charts**: `recharts` (with `react-is` pinned to the React 19 line).
- **Backend** (`backend/requirements.txt`): `fastapi`, `uvicorn`, `motor`,
  `pymongo`, `pydantic` v2, `python-dotenv`, `httpx`, `requests`, `pandas`,
  `numpy`, `emergentintegrations`, `boto3`, `typer`, `pytest` +
  `pytest-asyncio`/`xdist`; auth and uploads are covered too — `pyjwt`,
  `python-jose`, `passlib`, `cryptography`, `email-validator`,
  `python-multipart`.
- **Absent**, install before use: `leaflet`/`@types/leaflet`, `openpyxl`, any
  other icon pack, any font package outside the §2 manifest.

This list is why you never need to read `package.json` or list `node_modules`.

## 3. Dir map

| Path | Purpose |
|---|---|
| `backend/server.py` | FastAPI bootstrap: `app = FastAPI()`, `api_router = APIRouter(prefix="/api")`, routes registered on the **router**, `app.include_router(api_router)` last. `status` is the pattern to copy |
| `backend/lib/db.py` | ships the motor client + `db` handle and self-loads `.env`; import it from `server.py` *and* every router — defining `db` in `server.py` and importing it back is a circular import |
| `backend/models/*.py` | Pydantic v2 request/response models once `server.py` gets crowded — package exists with `__init__.py`, just add modules |
| `backend/routers/*.py` | one `APIRouter` per resource, mounted from `server.py` — package exists with `__init__.py`, just add modules |
| `backend/seed.py` | **create this** for seed data; run `cd /app/backend && python seed.py`. Idempotent, not imported by `server.py`, and gets env + client via `from lib.db import db` |
| `backend/lib/dates.py` | `today_iso(tz=None)` — server-side "today"; pod clock is UTC |
| `backend/.env` | `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`; loaded by `python-dotenv`, read via `os.environ` |
| `frontend/src/main.tsx` | already mounts `StrictMode` + `QueryClientProvider` + `BrowserRouter` — never edit, and never re-add any of the three in `App.tsx` (a second Router breaks routing; `<Routes>` in `App.tsx` just works) |
| `frontend/src/App.tsx` | the `<Routes>` table and nothing else — one `<Route>` per page, added in the same edit that creates the page. A page with no `<Route>` is unreachable, and any URL without a matching `<Route>` renders a **blank page** — `<Routes>` matches nothing and mounts nothing |
| `frontend/src/pages/*.tsx` | one screen per file, default-exported, imported into `App.tsx` as `@/pages/<Name>`; `Home.tsx` ships as the worked example |
| `frontend/src/lib/api.ts` | `apiGet/apiPost/apiPut/apiPatch/apiDelete<T>` over base `/api`, throwing `ApiError` |
| `frontend/src/lib/utils.ts` | `cn()` |
| `frontend/src/components/ui/` | shadcn `base-nova` on **@base-ui/react** (index in §11) |
| `frontend/src/index.css` | Tailwind v4 entry + theme tokens (no `tailwind.config.js`) |
| `memory/spec.md`, `memory/test_credentials.md` | write seed facts + credentials here before delegating — the testing subagent reads them first |
| `backend/pytest.ini`, `backend/tests/`, `tests/` | pytest + Playwright scaffolding, pre-configured — don't edit or recreate; browser checks land in `.emergent/scripts/checks/` |
## 4. The typed-fetch boundary

Nothing infers across Python↔TypeScript. Each endpoint has **two** declarations
you keep in sync in the same edit: a Pydantic model in `backend/` and a TS
interface in `frontend/`.

```python
# backend/routers/things.py — every route hangs off a router, never off app
class Thing(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str

@router.get("/things/{id}", response_model=Thing)         # ← braces, FastAPI style
async def get_thing(id: str):
    doc = await db.things.find_one({"id": id})
    if not doc:
        raise HTTPException(status_code=404, detail="not found")
    return Thing(**doc)
```

```ts
// frontend — mirror the model, call the relative path
interface Thing { id: string; name: string }
const thing = await apiGet<Thing>(`/things/${id}`);   // → /api/things/<id>
```

Ids are string `uuid4`, never Mongo `ObjectId` (not JSON-serializable, leaks into
response bodies). Mongo is async motor: `await db.things.insert_one(...)`,
`await db.things.find().to_list(1000)`. FastAPI rejects a bad body with `422` and
a `{"detail": [...]}` payload before your handler runs — `ApiError.body` carries it.

**Datetimes are the same class of trap as `ObjectId`, and more expensive.** BSON
stores UTC but motor hands back **naive** `datetime` objects. Subtracting or
comparing one against an aware `datetime.now(timezone.utc)` raises `TypeError`
and surfaces as a 500 (the classic "stop the timer" bug). Normalise on read —
`dt.replace(tzinfo=timezone.utc)` — and store aware UTC on write, so Pydantic
serialises with the offset and JavaScript `new Date(...)` parses it correctly.

### The app is also served with no backend — never gate a page on a fetch

When an environment is paused, the platform builds `frontend/` and serves it as a
**static bundle on the preview CDN**. There is no backend behind it, so every
`apiGet`/`apiPost` rejects. That build is what people see in a shared preview.

So a failed fetch must degrade to a *partial* page, never a blank one or an error
screen: render the shell, nav and static copy unconditionally, and let only the
data-dependent region show an empty/skeleton state. A page whose entire return is
`error ? <Error/> : <Content/>` renders as an outage on the CDN even though the
app is fine — and it reads to the user as a broken app.

Also gate on the error state, not just on missing data: react-query keeps the last
successful `data` through a failed refetch, so `data ? …` alone will keep showing
stale content as live after the backend goes away.

### Auth apps: sessions are httpOnly cookies; `lib/session.ts` owns the cache

- Sessions are httpOnly cookies the backend sets on login/signup and clears on
  logout (all auth routes under `/api/auth/*`). Never return tokens in JSON and
  never store or attach tokens in the frontend — cookies ride same-origin
  fetches automatically, and `GET /api/auth/me` answers "who am I".
- Frontend: after successful login/signup, `beginSession()`. Every sign-out
  control must `await endSession()`; never hand-roll logout — clearing only the
  server session leaks the previous account's react-query cache to the next
  login on this browser.

## 5. base-ui contract — read before using any `components/ui` component

- No `asChild`. Swap the rendered element with `render={<MyEl />}`:
  `<DialogClose render={<Button />} />`. For link-styled buttons prefer
  `<Link className={buttonVariants({ variant, size })}>` over `render={<Link/>}`.
- `Select`'s `onValueChange` gives `string` (the wrapper coerces base-ui's
  `null`) — type handlers `(value: string)`, never `string | null`. And
  `SelectValue` renders the RAW value, not the item's label (unlike radix) —
  pass a children function that maps value → label:
  `<SelectValue>{(v) => LABELS[v as string]}</SelectValue>`.
- Selected/checked state is `data-selected` / `data-checked`, not
  `data-state="active"`.
- `DropdownMenuContent`, `PopoverContent`, `SelectContent` self-portal — never
  wrap them in your own portal.
- Controlled inputs: set `value` + `onChange` together; a value-only `Input`
  produces a caret/hydration mismatch.
- **StrictMode double-invokes effects in dev** — on-mount side effects fire twice; mutations belong behind user actions.

## 6. Stack traps

| Flag / fact | Implication |
|---|---|
| frontend `tsc --noEmit` checks **0 files** | root tsconfig is `"files": []` + project references — the working command is `yarn typecheck` from `frontend/` |
| frontend `noUnusedLocals` | an unused import is a build error, not a warning |
| frontend `verbatimModuleSyntax` | types must use `import type { X }` |
| frontend `erasableSyntaxOnly` | no `enum`, no constructor parameter properties (declare fields, assign in the body) |
| frontend `strict: true` | never loosen it to clear an error; fix the type |
| backend route on `app` instead of `api_router` | lands outside `/api`, so the Vite proxy never reaches it — always the router |
| backend is fully async | `async def` handlers, `await` every motor call; a sync handler blocks the loop |
| lint is oxlint | `react/rules-of-hooks` = error; `react/only-export-components` = warn → hoist inline components out of render |
| logout without `endSession()` | previous account's react-query cache renders for the next login — route every sign-out through `lib/session` |

The dev servers surface compile errors as you write. These are facts for writing
correct code, not commands to run mid-build.

## 7. Common traps

- `dark` is a Tailwind v4 `@custom-variant` — NEVER `@apply dark`; for
  dark-by-default replace the opening `<html>` tag in `frontend/index.html`
  with the commented `class="dark"` variant beside it.
- Link-styled buttons: `<Link className={buttonVariants({ variant, size })}>` —
  never `<Button render={<Link/>}>`.
- uvicorn runs with directory=/app/backend: imports are `from lib.x import y`,
  never `from backend.lib.x`.
- Standalone scripts (seed.py etc.) do not inherit server.py's dotenv — import
  `lib.db` or call `load_dotenv` yourself before touching `os.environ`.
- Fonts: only the §2 manifest is installed. Variable families import as
  `@fontsource-variable/<name>`; the only plain `@fontsource/<name>` are
  `ibm-plex-sans`, `ibm-plex-mono`, `poppins` — any other font import breaks the
  CSS build (blank page).
- `recharts` + `react-is` are preinstalled; `leaflet`/`@types/leaflet` and
  `openpyxl` are NOT — install before use.
- Node is 24.x — check package `engines` bounds before installing dependencies.

## 8. Theming

`frontend/src/index.css` is the Tailwind v4 entry: `@import`s (the last one is
the active `@fontsource` family) → `@custom-variant dark` → `@theme inline`
aliases (incl. `--font-sans` / `--font-heading`) → `:root` light tokens →
`.dark` → `@layer base`. Retheme = swap the font import, those two font lines,
and the hex values in `:root` + `.dark`; leave the other aliases and
`@layer base` alone. One `create_file` overwrite beats three `search_replace`es.

## 9. Verify before you finish

- **Typecheck once, as a named gate step** when the build is complete:
  `cd /app/frontend && yarn typecheck`, and
  `cd /app/backend && python -c 'import server'` for backend import sanity.
- **Screenshots** (`mcp_screenshot_tool_ts`): `path` must be a **bare filename**
  (`home.png`) — a directory prefix is written but never returned, landing under
  `/root/.emergent/automation_output/<ts>/`. `quality` is **JPEG-only**: passing
  it with a `.png` path fails the whole browser run (`options.quality is
  unsupported for the png screenshots`). Set the viewport before capturing; the
  image returns inline, so never `find` it on disk.
- **Browser scripts**: every `page.goto` needs an absolute
  `http://localhost:3000/...` URL — a relative `'/'` throws `Cannot navigate to
  invalid URL`.
- **Write the handoff**: seed facts into `memory/spec.md`, any credentials into
  `memory/test_credentials.md`. The testing subagent reads both first; if they
  are empty it re-derives them from your source and seed script.
- Then run the gate your system prompt defines (curl smoke + one happy-path
  browser pass). Anything deeper belongs to the testing subagent.

## 10. Restart — after a config change only

Both dev servers hot-reload (uvicorn `--reload`, Vite HMR). Restart ONLY after
changing `.env`, `requirements.txt`, or `vite.config.ts` — never at session start.

```bash
sudo supervisorctl restart frontend backend
for i in $(seq 30); do curl -sf http://localhost:8001/api/ >/dev/null && { echo "backend up"; break; }; sleep 1; done
for i in $(seq 30); do curl -sf http://localhost:3000 >/dev/null && { echo "frontend up"; break; }; sleep 1; done
```

## 11. components/ui index

Every wrapper spreads its remaining props onto the underlying primitive, so
rest-props = that primitive's props. Import from `@/components/ui/<file>`. Read
§5 first — the behavioural contract matters more than these prop lists.

| File | Exports — own props (defaults) |
|---|---|
| `badge.tsx` | `Badge` (span) `variant`: default \| secondary \| destructive \| outline \| ghost \| link; `badgeVariants` |
| `button.tsx` | `Button` `variant`: default \| outline \| secondary \| ghost \| destructive \| link; `size`: default \| xs \| sm \| lg \| icon \| icon-xs \| icon-sm \| icon-lg; `buttonVariants` |
| `calendar.tsx` | `Calendar` (react-day-picker `DayPicker` props) + `buttonVariant` (ghost), `showOutsideDays` (true), `captionLayout` ("label"), `locale`; `CalendarDayButton` |
| `card.tsx` | `Card` `size`: default \| sm; `CardHeader/Title/Description/Action/Content/Footer` (div props) |
| `checkbox.tsx` | `Checkbox` = base-ui `Checkbox.Root` (`checked`, `defaultChecked`, `onCheckedChange`, `indeterminate`); indicator built in |
| `dialog.tsx` | `Dialog`, `DialogTrigger/Portal/Close/Overlay/Title/Description`; `DialogContent` + `showCloseButton` (true); `DialogHeader`, `DialogFooter` |
| `dropdown-menu.tsx` | `DropdownMenu` = base-ui `Menu.Root`; `…Trigger/Portal/Group/RadioGroup/Sub/SubTrigger/Separator/Label/Shortcut`; `…Content`, `…SubContent` (self-portal) + `align`, `alignOffset`, `side`, `sideOffset`; `…Item`/`…CheckboxItem`/`…RadioItem` + `inset`, `variant`: default \| destructive |
| `input.tsx`, `label.tsx`, `textarea.tsx` | `Input` / `Label` / `Textarea` — plain element props |
| `popover.tsx` | `Popover` = base-ui `Popover.Root`; `PopoverTrigger/Title/Description/Header`; `PopoverContent` (self-portals) + `align` ("center"), `alignOffset`, `side` ("bottom"), `sideOffset` (4) |
| `select.tsx` | `Select` (wrapped `Select.Root`), `SelectGroup/Value/Content/Label/Item/Separator/ScrollUpButton/ScrollDownButton`; `SelectTrigger` + `size`: sm \| default |
| `sheet.tsx` | `Sheet`, `SheetTrigger/Close/Portal/Overlay/Title/Description/Header/Footer`; `SheetContent` + `side`: top \| right (default) \| bottom \| left, `showCloseButton` (true) |
| `sonner.tsx` | `Toaster` — sonner `ToasterProps` (`position`, `richColors`, …), theme from `next-themes`. Mount once, then `toast()` from `sonner` |
| `table.tsx` | `Table` (in an `overflow-x-auto` div), `TableHeader/Body/Footer/Row/Head/Cell/Caption` |
| `tabs.tsx` | `Tabs` + `orientation`: horizontal (default) \| vertical; `TabsList` + `variant`: default \| line; `TabsTrigger`, `TabsContent`; `tabsListVariants` |

Everything above is installed — run `npx shadcn@latest add <name>` only for a
component that is *not* in this index.
