# Banquet Booking — Product Design Guide (v2)

**Source:** Product team mockups (May 2026)  
**Purpose:** Align engineering with the new **Create New Booking** flow while staying consistent with the existing Banquet module shell.

**Related:** [banquet-module-implementation-plan.md](./banquet-module-implementation-plan.md)

---

## 1. Design principles (match existing Banquet module)

| Token / pattern | Current codebase | New booking UI |
|-----------------|------------------|----------------|
| Page shell | `PageWrapper` + `PageHeader` / `PageHeadertitle` | Same — do not invent a new layout wrapper |
| Primary CTA | `BrandButton` / `bg-orion-blue` | Blue **Continue** / **Confirm Booking** / **Proceed to Payment** |
| Secondary CTA | `Button variant="outline"` | White **Back** with grey border |
| Outline accent | `text-orion-blue border-orion-blue` | Use for **Edit** links, secondary actions (amenities page pattern) |
| Selection accent | `hexbrand` / orange chips in mockups | Category chips + active payment method — map orange to existing brand accent where product confirms |
| Tables | `CustomTable` | Menu & amenities steps use **rich tables** (checkbox, image, qty stepper) — extend or compose new table, not a second table system |
| Dialogs | shadcn `Dialog` | Amenities **admin** page keeps existing dialogs; booking flow is **full page** |
| Toasts | `Toast` + `react-hot-toast` | Unchanged |
| Forms | `InputField`, `SelectField` from `@/components/common/Form` | All new fields must use these wrappers |
| Money | `formatMoney` in `banquet-pricing.ts` | All totals use shared formatter (fix mockup `$` / `₦` inconsistency in implementation) |

**Title copy (product):** Page title is **"Create New Booking"** (not "Create booking"). Subtitle per step comes from stepper sub-labels.

---

## 2. Flow overview

```text
Bookings list ──► Create New Booking (6 steps) ──► Bookings list / detail

Step 1  Event Information
Step 2  Customer Information      (+ optional right rail: Recently Accessed)
Step 3  Menu Details              (2-col: menu table + Event Menu Summary)
Step 4  Amenities Details         (2-col: amenities table + cost summary)
Step 5  Review Details            (cards + Edit per section + cost breakdown)
Step 6  Payment Info              (2-col: payment form + plan + summary)
```

**Navigation labels**

| Step | Stepper title | Sub-label (design) |
|------|---------------|-------------------|
| 1 | Event Information | Create event |
| 2 | Customer Information | Enter customer info |
| 3 | Menu Details | Select food menu |
| 4 | Amenities Details | Choose the amenities for the info |
| 5 | Review Details | Review and approval each info |
| 6 | Payment Info | Select payment method |

**Stepper states**

- **Upcoming:** Orange filled circle + step number  
- **Current:** Green ring (outline) on active step  
- **Completed:** Green checkmark  

> **Note:** Current implementation uses compact `StepperItem` with different visual language. **Replace or add `BanquetBookingStepper`** for this flow only; do not change global `StepperItem` used elsewhere without audit.

---

## 3. Step specifications

### Step 1 — Event Information

**Layout:** Single white card, full width (max ~1100px centered).

**Sections**

1. **Basic details** (3-column grid)  
   - Event Name, Event Type, (spare column in design)  
   - Event Date, Event Time, Event End Time  
   - Estimated Guest Count, Setup Time, Teardown Time  

2. **Event category (optional)**  
   - Chip row: Wedding, Birthday, Corporate, Party, conference, Seamier (+ Others text field)  
   - Single-select chip behavior  

3. **Event description (optional)**  
   - Multiline textarea  

**Footer:** Back (left) · Continue (right, primary blue)

**vs current build:** Only event name, type, venue, date, single time — **no** end time, guest count, setup/teardown, chips, description.

---

### Step 2 — Customer Information

**Layout:** Main card (2/3) + **Recently Accessed** sidebar (1/3).

**Main sections**

1. **Find existing customer** — search: "Search for customer by name"  
2. **Add new customer** — Title, First Name, Last Name, Email, Phone, Company (optional), Customer Type  
3. **Billing address** — Title, First/Last name, Address, State, County, Postal code, City  
4. Checkbox: **Save this customer for future booking**

**Footer:** Back · **Save & Continue** (primary) · **Save & add another** (text/link)

**Sidebar:** List of recent customers (avatar, name, email) + View All

**vs current build:** Single block with `CustomerSearcher` + title/name/email/phone only — **no** billing address, customer type, company, recent list, save-for-later.

---

### Step 3 — Menu Details

**Layout:** 2 columns — **Menu configuration** (left) · **Event menu summary** (right, sticky).

**Left**

- Filters: Restaurant Menu, Menu Category, search, Filters button  
- **Table columns:** Checkbox · Image · Menu item (name + description) · Category badge · Unit price · Qty stepper · Line total  
- Pagination: Previous / Page x of y / Next  
- Special instruction textarea (optional)  

**Right summary card**

- Restaurant menu name, guest count, price per head  
- Selected line items with `qty × price`  
- Subtotal (food), Service charge %, VAT %  
- **Total estimate** (green, bold)

**Footer:** Back · **Save & Continue** (design also shows "N item Selected" center on menu-only variant)

**vs current build:** Optional cuisine/menu type dropdowns + emoji `FoodSelect` cards — **not** restaurant menu integration, table, or sidebar math.

---

### Step 4 — Amenities Details

**Layout:** Same 2-column pattern as menu.

**Left**

- Category pills: All Category, Decoration, Furniture, Service, Others, Audio & virtual  
- Search, Filters, **Add custom amenities**  
- **Table:** Checkbox · Thumbnail · Amenity name · Category badge · Unit price · Qty · Total  
- Pagination  
- Special instruction textarea  

**Right:** Selected items + Subtotal + Service charge + VAT + **Total estimate**

**vs current build:** Checkbox list from **inventory API** (`AmenitiesSearch`) — correct data source, **wrong UI pattern**. Inventory catalog + categories must feed this table, not a separate dummy list.

---

### Step 5 — Review Details

**Layout:** Full width stack of cards.

- Global **Edit Bookings** (top right)  
- **Event information** card — grid fields + customer notes textarea · per-card Edit  
- **Customer / event contact** card · Edit  
- **Menu summary** | **Amenities and rentals** — side-by-side cards with line items + subtotals · Edit each  
- **Additional information** — booking source, on-site coordination, created by, date created  
- **Cost breakdown** — combined food + amenities + service + VAT + total  
- Banner: "Please review all details and edit"  
- Footer: Back · **Proceed to Payment**

**vs current build:** Single `ReviewDetails` list — no split cards, no metadata, no combined breakdown.

---

### Step 6 — Payment Info

**Layout:** 2 columns.

**Left card — Payment details**

- Payment amount (readonly): Total payable, Amount paid, Payment date  
- Apply discount % (optional): %, amount, reason  
- Payment method: Bank transfer | Cash | Others (stacked buttons)  
- Bank/account details + instruction callout  

**Right card**

- **Payment plan** radios: Full payment · Part payment · Pay later  
- Cost summary (food, amenities, subtotal, charges, total)

**Footer:** Back · **Confirm Booking**

**vs current build:** Simple payment status dropdown + quotation cards — **no** discount %, bank transfer UI, payment plans.

---

## 4. Bookings list (empty state)

**Design**

- Illustration + "You currently don't have any bookings please create one"  
- Primary: **Create Bookings**  

**vs current build:** Table always shown (empty rows) + **Create booking** in table toolbar — add empty state component when `bookings.length === 0`.

---

## 5. Data model implications (backend)

Fields in design **not** on current `BanquetBooking` entity / DTO:

| Area | New fields (indicative) |
|------|-------------------------|
| Event | `eventEndTime`, `estimatedGuestCount`, `setupTime`, `teardownTime`, `eventCategory`, `eventDescription`, remove or keep `eventVenue` (design shows "Venue" on review) |
| Customer | `firstName`, `lastName`, `company`, `customerType`, billing address fields, `saveCustomer` flag, link to `GuestProfile` / customer id |
| Menu | Restaurant menu id, menu items as line items (not free-text cuisine), service charge %, VAT %, per-head pricing |
| Amenities | Category, image url, link to `banquet_inventory_item`, custom line flag |
| Booking meta | `bookingSource`, `eventCoordination`, `createdBy`, special instructions (menu + amenities) |
| Payment | `paymentPlan`, `paymentMethod`, `amountPaid`, `paymentDate`, `discountPercent`, `discountReason`, bank account id |

**Recommendation:** Do not extend the flat `CreateBanquetBookingDto` further without a migration plan. Prefer **nested DTO** + new tables (`banquet_booking_menu_item`, etc.) in a dedicated API v2.

---

## 6. Reuse map (what to keep)

| Asset | Action |
|-------|--------|
| `/banquet/bookings/new` route | Keep — re-skin wrapper only |
| `banquet-inventory` API | Keep — powers step 4 table rows |
| `banquet-pricing.ts` | Extend for service charge + VAT % |
| `build-booking-payload.ts` | Replace when API v2 exists |
| `BookingMultiStepForm` | **Refactor or fork** → `BanquetCreateBookingWizard` |
| `AmenitiesSearch`, `FoodSelect`, `CustomerSearcher` | Replace UI; keep hooks/data fetch logic where possible |
| Amenities **admin** page UI | **Do not change** unless product says so |

---

## 7. Implementation phases (after design sign-off)

1. **Shell + stepper** — New stepper component, page title, card layout, footer buttons  
2. **Step 1–2** — Event + customer fields (API stubs ok with local state)  
3. **Step 4** — Amenities table wired to inventory API (highest parity with design + existing work)  
4. **Step 3** — Menu table wired to restaurant menu API (dependency: menu module)  
5. **Step 5–6** — Review + payment + pricing sidebar  
6. **List empty state** + API v2 migration  

---

## 8. Open questions for product

1. Currency: Naira vs USD in tables — single hotel currency?  
2. Is **event venue** still required (present in review, missing in step 1 mock)?  
3. **Menu optional** — can step 3 be skipped like today's "No menu"?  
4. **Add custom amenities** — allowed when inventory exists? Decrements stock?  
5. **Save & add another** on step 2 — creates booking or only saves customer?  
6. Orange chips vs `orion-blue` — confirm brand token for banquet-only accents  

---

*Engineering should treat this document as the source of truth for UI structure; mockup placeholder math and copy typos are not authoritative.*
