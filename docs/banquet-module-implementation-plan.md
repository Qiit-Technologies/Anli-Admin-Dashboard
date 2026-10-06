# Banquet Module — Audit & Implementation Plan

**Client context (Mayfair / `spec.ts`):** Membership items are largely done (QR codes still open). Banquet feedback: *“Details not accurate”*, *“Make menu type and menu options optional”*, plus general expectation that banquet is a **production-ready** operations module.

**Audit date:** 2026-05-25  
**Scope:** `orion-frontend` (`/banquet`, `components/banquest`) + `orion-backend` (`src/banquet`)

---

## 1. Executive summary

| Area | Status | Notes |
|------|--------|--------|
| **Bookings** | Partial | List + create wired to `GET/POST /banquet/bookings`; form sub-steps mostly **not** bound to state; create likely **fails validation** on backend (`eventDuration`, `food`/`amenities` empty, field name mismatch). |
| **Events** | Stub | Empty page component. |
| **Menu Details** | Stub | Empty page component. |
| **Amenities** | Wired | Inventory CRUD at `/banquet/inventory`; booking form loads from same API. |
| **Rented Items** | UI shell | Dialog only; no table. |
| **Reports** | Stub | Route `/banquet/reports` exists; API pending (Phase 4). |

**Root cause of “details not accurate”:** Review step, customer search, food picker, amenities picker, and payment summary use **hardcoded sample data** or local state that never updates the parent booking form or persisted booking.

---

## 2. Current architecture

### 2.1 Frontend routes (`/banquet/*`)

| Nav label | Path | File | State |
|-----------|------|------|--------|
| Bookings | `/bookings` | `app/banquet/bookings/page.tsx` | SWR → `getAllBanquetBookings` |
| Events | `/events` | `app/banquet/events/page.tsx` | Empty |
| Menu Details | `/menu-details` | `app/banquet/menu-details/page.tsx` | Empty |
| Amenities | `/amenities` | `app/banquet/amenities/page.tsx` | Dummy table + hardcoded stats |
| Rented Item | `/rented-item` | `app/banquet/rented-item/page.tsx` | Partial UI |
| Reports | `/reports` | **Missing** (`report/page.tsx` only) | 404 / wrong path |

Server actions: `app/actions/banquet-booking.ts` — bookings CRUD only (no amenities/events/menu actions).

### 2.2 Backend (`/banquet`)

| Endpoint | Status |
|----------|--------|
| `POST /banquet/bookings` | Active |
| `GET /banquet/bookings` | Active |
| `GET /banquet/bookings/:id` | Active (relations **not** loaded on `findOne`) |
| `PUT /banquet/bookings/:id` | Active |
| `DELETE /banquet/bookings/:id` | Active |
| `POST/GET/PUT/DELETE /banquet/amenities` | **Commented out** in controller; service file fully commented |

**Entities:** `BanquetBooking`, `BanquetAmenity` (per-booking line items), `BanquetFood` (per-booking line items).  
**Separate:** `Banquet` entity (`banquets` table) looks like a **financial account**, not event inventory — do not conflate with booking amenities.

---

## 3. Dummy / placeholder inventory (remove or replace)

| Location | What is fake | Impact |
|----------|----------------|--------|
| `tables/columns/amenities.tsx` → `dummyAmenityData` | 4 amenity rows | Amenities page shows false inventory |
| `app/banquet/amenities/page.tsx` → `stats` | Fixed KPI numbers (150, 78, 62) | Misleading dashboard |
| `ReviewDetails.tsx` | Fixed Lagos wedding sample | Review step always wrong |
| `CustomerSearcher.tsx` → `sampleCustomerList` | John/Jane Doe | Search never fills booking form |
| `FoodSelect.tsx` | Pizza, burger, etc. | Selection not sent to API |
| `AmenitiesSearch.tsx` → `amenitiesData` | Chair, projector, mic | Not linked to `formData.amenities` |
| `PaymentSummary.tsx` → `Summary` | total/discount/tax 100/20/10 | Payment step wrong |
| `tables/columns/bookings.tsx` → `dummyBookingData` | Unused in page but confusing | Dead code |
| `BookingAction.tsx` | Hardcoded status `"confirmed"` | View dialog inaccurate |
| Amenity forms | `onSubmit` → `console.log` | No persistence |

---

## 4. Backend ↔ frontend contract gaps (blockers)

These must be aligned **before** calling banquet “functional.”

### 4.1 `eventDuration`

- **DTO:** `CreateBanquetBookingDto.eventDuration` — **required** `@IsString()`.
- **Entity:** `BanquetBooking` — **no column**.
- **Form:** No field collected.

**Decision needed:** Add column + migration, or make optional in DTO and drop from UI.

### 4.2 Amenity field names

| Layer | Cost field |
|-------|------------|
| Frontend types / DTO | `cost` |
| DB entity `BanquetAmenity` | `amount` |

**Decision:** Standardize on `cost` (rename column) or map in service on create/update.

### 4.3 Nested creates

- `food` and `amenities` arrays are required in DTO; form often submits **empty arrays** while Zod on step 4 allows empty amenities with `total: 0`.
- `findOne` does not use `relations: ['amenities', 'food']` — detail views incomplete.

### 4.4 Hotel / multi-tenant

- Bookings have **no `hotelId`** (unlike membership). Confirm whether Mayfair is single-tenant or needs scoping like other modules.

### 4.5 Inventory vs booking line items

Two concepts are conflated in UI:

1. **Catalog amenities** (inventory: type, quantity, remaining, status) — needs new entity + CRUD (commented service).
2. **Booking amenities** (lines on a reservation: name, qty, cost) — exists on `BanquetBooking`.

Clarify product: inventory module first, then attach to bookings (like membership facility booking).

---

## 5. Client requirements → work mapping

| Client ask (`spec.ts`) | Proposed work |
|------------------------|---------------|
| Menu type & menu options **optional** | Backend: `@IsOptional()` on `menuType`, `cuisineType`, `menuName`; allow empty `food[]`. Frontend: Zod `menuDetailsSchema` optional fields; skip step or “No menu” toggle. |
| Details not accurate | Wire Review/Payment/View to **real** `formData` / API; remove all hardcoded review cards. |
| Reservation table | Likely **front-office** `table-reservations` — confirm with client if banquet should embed table layout or link out. |
| Export for transparency | Add banquet export (bookings CSV/PDF) once data is real — mirror `MembershipExportButton`. |
| Reports (daily capture, timing-only edits) | New backend report aggregate + frontend `/banquet/reports` — separate epic from bookings CRUD. |

---

## 6. Phased implementation (confirm each phase before coding)

### Phase 0 — Hygiene (frontend, no new APIs) — largely done

- [x] Remove or stop rendering all dummy datasets; use empty states + copy (“No amenities yet”).
- [x] Fix nav: `/banquet/reports` ↔ `report` folder alignment.
- [x] Bookings list: normalize SWR response (`Array.isArray`, handle `{ error }`), loading/error UI (match membership bookings).
- [x] Delete or relocate `dummyBookingData` / `dummyAmenityData` exports.
- [x] `createBanquetBooking`: surface API validation errors in toast (not generic message).
- [x] Booking create/edit moved from drawer to full pages: `/banquet/bookings/new`, `/banquet/bookings/[id]/edit`.

### Phase 1 — Bookings end-to-end (backend + frontend)

**Backend**

- [x] Remove `eventDuration` from DTO (not on entity).
- [x] Align amenity `cost` ↔ `amount` mapping in `BanquetBookingService.create`.
- [x] `findOne` / `update` load `amenities`, `food`.
- [x] Optional menu fields in DTO + nullable DB columns (`BanquetOptionalMenuFields` migration).
- [ ] Add `hotelId` if required by platform.
- [ ] Integration tests: create booking with amenities + food.

**Frontend**

- [x] Lift state: `CustomerSearcher`, `FoodSelect`, `AmenitiesSearch` accept `value` + `onChange` from `BookingMultiStepForm`.
- [x] `ReviewDetails` + `PaymentSummary` read from `formData` / live pricing (`banquet-pricing.ts`).
- [x] Amenities step: catalog selection, custom lines, discount/tax, auto total.
- [x] Guest search via `searchGuestProfiles` (replaces sample customers).
- [ ] Add `eventDuration` input (or remove from payload).
- [x] Optional menu step — “No menu for this event” + optional field labels (client requirement).
- [ ] Edit flow: `BookingAction` → open sheet with `mode="update"` + `updateBanquetBooking`.
- [ ] Delete with confirm + `deleteBanquetBooking` + `mutate` SWR.
- [ ] Map API response shape to `BookingForm` (status fields, nested items).

### Phase 2 — Amenity inventory & rentals (new backend module)

**Backend** (inventory catalog done)

- [x] `BanquetInventoryItem` + CRUD `/banquet/inventory` + `/inventory/stats`.
- [ ] Decrement `remaining` when a booking is confirmed.
- [ ] Rental assignment / return tracking.

**Frontend** (catalog done)

- [x] `banquet-inventory.ts`, amenities page, booking form loads inventory (no hardcoded catalog).
- [ ] Rented items page + rent dialog.

### Phase 3 — Events & menu catalog

**Backend**

- [ ] `BanquetEvent` entity (or derive from bookings grouped by `eventName` + date).
- [ ] Menu catalog entity OR reuse restaurant `menu` module (`getMenuItems`) for `FoodSelect`.

**Frontend**

- [ ] Events page: calendar/list of upcoming events from bookings + dedicated events.
- [ ] Menu details page: CRUD packages (cuisine, menu name, type, linked items) — hotel-configurable, not hardcoded Italian/Chinese list.

### Phase 4 — Reports & export

- [ ] Banquet daily report API (non-editable fields except timing — per client).
- [ ] Reports page UI + export.
- [ ] Permissions: replace blanket `VIEW_ALL_PAGE` with banquet-specific permissions (seed in backend).

---

## 7. Suggested API contract (for backend sign-off)

### 7.1 Booking create (revised)

```json
{
  "eventName": "string",
  "eventType": "string",
  "eventVenue": "string",
  "eventDate": "YYYY-MM-DD",
  "eventTime": "HH:mm",
  "eventDuration": "string (optional if agreed)",
  "customerTitle": "string",
  "customerName": "string",
  "customerEmailAddress": "email",
  "customerPhoneNumber": "string",
  "cuisineType": "string | optional",
  "menuName": "string | optional",
  "menuType": "string | optional",
  "amenities": [{ "name": "string", "available": "string", "cost": "string", "quantity": "string" }],
  "food": [{ "name": "string", "description": "string", "cost": "string", "quantity": "string" }],
  "total": 0,
  "discount": 0,
  "tax": 0,
  "paymentStatus": "pending | partial | paid",
  "bookingStatus": "confirmed | cancelled"
}
```

### 7.2 Inventory item (new)

```json
{
  "id": 1,
  "type": "Sound System",
  "quantity": 10,
  "remaining": 7,
  "status": "available | not_available"
}
```

### 7.3 List bookings response

Confirm whether API returns **raw array** or `{ data: Booking[] }` — frontend currently expects array at top level.

---

## 8. Acceptance criteria (“highly functional”)

1. Staff can create a booking whose **review and list view** match submitted data (no placeholder names/addresses).
2. Menu type and food options can be **skipped** without blocking submit.
3. Amenities inventory reflects **database** counts; renting reduces `remaining`.
4. Edit/delete booking works with optimistic UI refresh.
5. No dummy rows on production paths.
6. Reports nav resolves; reports show real booking aggregates (Phase 4).
7. Optional: customer search pulls from hotel CRM/guest list API (define source).

---

## 9. Open questions for product / client

1. Should **Events** be separate entities or only a filtered view of bookings?
2. Is **Menu Details** a banquet-specific package catalog or integration with existing restaurant menu?
3. **Reservation table** — banquet module or front-office only?
4. Single hotel vs multi-property for banquet data?
5. Payment capture: record status only, or integrate with accounts module?

---

## 10. Recommended start order (after confirmation)

1. **Sign off Phase 1 contract** (Section 7.1 + `eventDuration` + `cost` naming).
2. Implement Phase 0 + Phase 1 in parallel (one backend dev, one frontend dev).
3. Demo bookings to client → then Phase 2 inventory.
4. Phase 3–4 as separate milestones.

---

## 11. File reference (quick navigation)

| Purpose | Path |
|---------|------|
| Booking form | `src/components/banquest/common/form/booking.tsx` |
| Server actions | `src/app/actions/banquet-booking.ts` |
| Backend controller | `orion-backend/src/banquet/banquet.controller.ts` |
| Booking entity | `orion-backend/src/banquet/entities/booking.entity.ts` |
| Create DTO | `orion-backend/src/banquet/dto/create-banquet-booking.dto.ts` |

---

*Next step: Review Sections 4, 7, and 9 with backend lead + client, then tick Phase 0/1 tasks and assign owners.*
