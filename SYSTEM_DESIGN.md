# BusBook: Frictionless Booking Platform for Single-Brand Bus Operators

## System Design Document

---

## 1. Executive Summary

A direct-to-consumer booking platform for a single bus brand operator, designed to:
- Eliminate aggregator dependency (save 10-20% commission per ticket)
- Own the customer relationship and data
- Deliver a frictionless, 3-tap booking experience
- Create loyalty lock-in that makes aggregator comparison irrelevant
- Control the brand narrative end-to-end

---

## 2. Market Context & Design Principles

### Industry Insights (from research)

| Metric | Value |
|--------|-------|
| India intercity bus market | ~$21.8B (2026) |
| Online penetration | 66-68%, rising to 73-75% by FY27 |
| Average occupancy | 79% per trip |
| Aggregator commission | 10-20% per ticket |
| Mobile booking share | ~88% of frequent riders have booking apps |
| Non-metro demand | 67% of bookings |

### Key Pain Points We Solve

| Pain Point (from aggregators) | Our Solution |
|-------------------------------|--------------|
| Rigid linear flow — lose selections when going back | Persistent state across all steps |
| Operator quality variance | Single brand = consistent quality |
| Refund delays (7-10 days) | Instant wallet refunds |
| No post-booking flexibility | Reschedule date/time/bus/seat in-app |
| Cluttered UI with 6000+ operators | Clean, focused single-brand experience |
| Customer belongs to aggregator | Direct relationship, loyalty program |

### Design Principles

1. **3-Tap Booking**: Search → Select Seat → Pay. Minimize steps ruthlessly.
2. **Mobile-First**: 88% of users book on phones. Desktop is secondary.
3. **Trust by Default**: Zero cancellation fees, on-time guarantees, price transparency.
4. **Repeat > Acquire**: Loyalty mechanics that reward direct booking.
5. **Offline-Aware**: Works on 3G/spotty connections common in Tier-2/3 towns.
6. **Accessibility**: Support for Hindi + regional languages, large touch targets.

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ Mobile   │  │ Web App  │  │ Agent    │  │ WhatsApp    │ │
│  │ App (RN) │  │ (Next.js)│  │ Portal   │  │ Bot         │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘ │
└───────┼──────────────┼──────────────┼───────────────┼────────┘
        │              │              │               │
        └──────────────┴──────┬───────┴───────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   API Gateway      │
                    │   (Rate Limiting,  │
                    │    Auth, Routing)  │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼───────┐  ┌──────────▼────────┐  ┌────────▼────────┐
│  Booking      │  │  Inventory        │  │  User           │
│  Service      │  │  Service          │  │  Service        │
│               │  │                   │  │                 │
│ - Search      │  │ - Seat mgmt      │  │ - Auth          │
│ - Reserve     │  │ - Schedule mgmt  │  │ - Profile       │
│ - Confirm     │  │ - Route mgmt     │  │ - Loyalty       │
│ - Cancel      │  │ - Dynamic pricing│  │ - Wallet        │
│ - Reschedule  │  │ - Fleet status   │  │ - Preferences   │
└───────┬───────┘  └──────────┬────────┘  └────────┬────────┘
        │                     │                     │
        │           ┌────────▼────────┐             │
        │           │  Pricing        │             │
        │           │  Engine         │             │
        │           │                 │             │
        │           │ - Dynamic fares │             │
        │           │ - Surge pricing │             │
        │           │ - Offers engine │             │
        │           └─────────────────┘             │
        │                                           │
┌───────▼───────┐  ┌─────────────────┐  ┌──────────▼────────┐
│  Payment      │  │  Notification   │  │  Tracking         │
│  Service      │  │  Service        │  │  Service          │
│               │  │                 │  │                   │
│ - UPI/Cards   │  │ - SMS           │  │ - Live GPS        │
│ - Wallet      │  │ - Push          │  │ - ETA calc        │
│ - Refunds     │  │ - WhatsApp      │  │ - Delay alerts    │
│ - Settlements │  │ - Email         │  │ - Geofencing      │
└───────────────┘  └─────────────────┘  └───────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Data Layer       │
                    │                   │
                    │ PostgreSQL (core) │
                    │ Redis (sessions,  │
                    │   seat locks,     │
                    │   caching)        │
                    │ ClickHouse        │
                    │   (analytics)     │
                    └───────────────────┘
```

### 3.2 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Mobile App | React Native | Cross-platform, fast iteration |
| Web App | Next.js 15 (App Router) | SSR for SEO, fast initial load |
| API Gateway | Kong / custom Node.js | Rate limiting, auth, routing |
| Backend Services | Node.js (Fastify) | Fast, lightweight, JS ecosystem |
| Database | PostgreSQL 16 | ACID for bookings, JSONB flexibility |
| Cache / Locks | Redis 7 | Seat reservation locks, session cache |
| Search | PostgreSQL (with indexes) | Simple routes — no need for Elasticsearch |
| Analytics | ClickHouse | Columnar store for booking analytics |
| Payments | Razorpay / Juspay | UPI, cards, wallets, net banking |
| SMS/WhatsApp | Gupshup / MSG91 | Transactional messaging |
| Push Notifications | Firebase Cloud Messaging | Mobile push |
| GPS Tracking | MQTT + custom ingestion | Real-time bus location from AIS-140 devices |
| CDN | CloudFront | Static assets, images |
| Infra | AWS (ECS Fargate) | Managed containers, auto-scaling |
| CI/CD | GitHub Actions | Standard pipeline |

---

## 4. Core User Flows

### 4.1 The 3-Tap Booking Flow (Primary)

This is the **hero flow** — optimized for repeat users who know their route.

```
┌─────────────────────────────────────────────────────────┐
│  TAP 1: SEARCH                                          │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌──────────┐   │
│  │ From        │    │ To          │    │ Date     │   │
│  │ [Bengaluru] │ ⟷  │ [Chennai]   │    │ [Today ▾]│   │
│  └─────────────┘    └─────────────┘    └──────────┘   │
│                                                         │
│  Quick picks (recent + popular):                        │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────┐ │
│  │ BLR → CHN    │ │ BLR → HYD   │ │ BLR → MUM     │ │
│  │ Today 9pm ★  │ │ Tomorrow    │ │ Fri, Mar 27   │ │
│  └──────────────┘ └──────────────┘ └────────────────┘ │
│                                                         │
│  [ Search Buses ]                                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  TAP 2: SELECT BUS + SEAT (Combined)                    │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  9:00 PM → 5:30 AM  │  8h 30m  │  ₹899  │ 23 left│ │
│  │  AC Sleeper  │  ★ 4.5 (2.1k)   │  On-time: 94%  │ │
│  │  ┌─────────────────────────────┐                  │ │
│  │  │    SEAT MAP (inline)        │                  │ │
│  │  │  [L1][ ][L3][ ]  Lower     │                  │ │
│  │  │  [L5][L6][ ][ ]            │                  │ │
│  │  │  ─────────────              │                  │ │
│  │  │  [U1][ ][U3][ ]  Upper     │                  │ │
│  │  │  [ ][ ][ ][ ]              │                  │ │
│  │  └─────────────────────────────┘                  │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  10:30 PM → 6:15 AM │  7h 45m  │ ₹1,199 │ 8 left│ │
│  │  AC Sleeper (Premium) │ ★ 4.8 (890) │ On-time: 97%│ │
│  │  [ Tap to select seats ]                          │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Boarding: [Auto-detected nearest] ▾                    │
│  Dropping: [Auto-detected nearest] ▾                    │
│                                                         │
│  [ Continue → ₹899 ]                                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  TAP 3: PAY                                             │
│                                                         │
│  Passenger: Rahul K. (saved) ✓                          │
│  Seat L3 · AC Sleeper · 9:00 PM                         │
│  Boarding: Silk Board Signal (2.1 km away)              │
│                                                         │
│  ┌─────────────────────────────────────────────┐       │
│  │  ₹899   Base fare                           │       │
│  │  -₹45   Loyalty discount (5%)               │       │
│  │  ₹0     Cancellation: FREE until 6 hrs before│       │
│  │  ────────────────────────────────            │       │
│  │  ₹854   Total                                │       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
│  [G Pay ●] [PhonePe] [UPI] [Card] [Wallet: ₹200]      │
│                                                         │
│  [ Pay ₹854 ]                                           │
│                                                         │
│  🔒 Free cancellation · Instant refund · On-time guarantee│
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  CONFIRMATION (auto-screen, no tap needed)              │
│                                                         │
│  ✓ Booked! Ticket #BK-28391                             │
│                                                         │
│  QR Code: [████████]                                    │
│                                                         │
│  9:00 PM, Thu Mar 26 · Seat L3                          │
│  Silk Board → Koyambedu                                 │
│                                                         │
│  [ Track Bus ]  [ Add to Calendar ]  [ Share Trip ]     │
│                                                         │
│  +45 loyalty points earned! (Total: 1,230 pts)          │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Key UX Innovations

**a) Persistent State Machine (solves RedBus's rigid flow problem)**
```
States: SEARCH → RESULTS → SEAT_SELECT → BOARDING → REVIEW → PAYMENT → CONFIRMED

- User can navigate backward without losing selections
- Seat reservation held for 10 minutes via Redis lock
- State persisted in localStorage + server-side session
- If user drops off mid-flow, re-entry resumes from last state
```

**b) Smart Defaults (reduce decisions)**
- Boarding point auto-detected from GPS (nearest stop)
- Passenger details pre-filled from profile
- Payment method = last used method
- Date defaults to "today" if searching after 5 PM, else "tomorrow"

**c) One-Tap Rebooking**
```
Home screen for logged-in users:

┌─────────────────────────────────────────┐
│  Your Routes                             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ BLR → CHN                       │   │
│  │ Last: Mar 15 · Usually: Fri 9PM │   │
│  │ [ Book Again → ₹899 ]           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ BLR → HYD                       │   │
│  │ Last: Feb 28 · Usually: Sat 10PM│   │
│  │ [ Book Again → ₹749 ]           │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**d) Inline Seat Map (no separate screen)**
- Seat map expands inline within the bus card
- No page navigation = no state loss
- Seat selection and bus selection are one combined step

---

## 5. Data Model

### 5.1 Core Entities

```sql
-- Routes operated by this brand
CREATE TABLE routes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_city     TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    origin_stop_ids  UUID[] NOT NULL,    -- boarding points
    dest_stop_ids    UUID[] NOT NULL,    -- dropping points
    distance_km     INT,
    estimated_duration INTERVAL,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Physical stops/boarding points
CREATE TABLE stops (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city        TEXT NOT NULL,
    name        TEXT NOT NULL,            -- "Silk Board Signal"
    address     TEXT,
    landmark    TEXT,
    lat         DECIMAL(10, 7),
    lng         DECIMAL(10, 7),
    is_active   BOOLEAN DEFAULT true
);

-- Buses in the fleet
CREATE TABLE buses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_no TEXT UNIQUE NOT NULL,
    bus_type        TEXT NOT NULL,         -- 'ac_sleeper', 'ac_seater', 'non_ac', 'premium'
    total_seats     INT NOT NULL,
    seat_layout     JSONB NOT NULL,        -- layout definition (rows, columns, types)
    amenities       TEXT[] DEFAULT '{}',   -- ['wifi', 'charging', 'washroom', 'blanket']
    gps_device_id   TEXT,                  -- AIS-140 device reference
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Scheduled trips
CREATE TABLE trips (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id        UUID NOT NULL REFERENCES routes(id),
    bus_id          UUID NOT NULL REFERENCES buses(id),
    departure_time  TIMESTAMPTZ NOT NULL,
    arrival_time    TIMESTAMPTZ NOT NULL,
    base_price      INT NOT NULL,          -- in paise (₹899 = 89900)
    dynamic_price   INT,                   -- current price after yield optimization
    status          TEXT DEFAULT 'scheduled', -- scheduled, boarding, in_transit, completed, cancelled
    boarding_stops  JSONB NOT NULL,         -- [{stop_id, time, sequence}]
    dropping_stops  JSONB NOT NULL,
    available_seats INT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT valid_times CHECK (arrival_time > departure_time)
);

CREATE INDEX idx_trips_route_departure ON trips(route_id, departure_time);
CREATE INDEX idx_trips_status ON trips(status) WHERE status = 'scheduled';

-- Seat inventory per trip
CREATE TABLE trip_seats (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id     UUID NOT NULL REFERENCES trips(id),
    seat_number TEXT NOT NULL,             -- "L1", "U3", "S12"
    seat_type   TEXT NOT NULL,             -- 'sleeper_lower', 'sleeper_upper', 'seater_window', 'seater_aisle'
    price       INT NOT NULL,              -- in paise, may vary by seat type
    status      TEXT DEFAULT 'available',  -- available, locked, booked, blocked
    gender_pref TEXT DEFAULT 'any',        -- 'any', 'female_preferred'
    locked_until TIMESTAMPTZ,             -- temporary lock during booking
    booking_id  UUID,

    UNIQUE(trip_id, seat_number)
);

CREATE INDEX idx_trip_seats_available ON trip_seats(trip_id, status) WHERE status = 'available';

-- Users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           TEXT UNIQUE NOT NULL,
    email           TEXT,
    name            TEXT,
    gender          TEXT,
    age             INT,
    preferred_payment JSONB,              -- {method: 'upi', upi_id: 'rahul@gpay'}
    wallet_balance  INT DEFAULT 0,        -- in paise
    loyalty_points  INT DEFAULT 0,
    loyalty_tier    TEXT DEFAULT 'bronze', -- bronze, silver, gold, platinum
    preferences     JSONB DEFAULT '{}',   -- {seat_pref: 'lower_window', notifications: true}
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Bookings
CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code    TEXT UNIQUE NOT NULL,  -- human-readable "BK-28391"
    user_id         UUID NOT NULL REFERENCES users(id),
    trip_id         UUID NOT NULL REFERENCES trips(id),
    seat_ids        UUID[] NOT NULL,
    boarding_stop_id UUID NOT NULL REFERENCES stops(id),
    dropping_stop_id UUID NOT NULL REFERENCES stops(id),
    passenger_details JSONB NOT NULL,     -- [{name, age, gender, seat_number}]
    base_amount     INT NOT NULL,
    discount_amount INT DEFAULT 0,
    loyalty_discount INT DEFAULT 0,
    total_amount    INT NOT NULL,          -- in paise
    payment_method  TEXT,
    payment_id      TEXT,                  -- external payment gateway reference
    status          TEXT DEFAULT 'pending', -- pending, confirmed, rescheduled, cancelled, completed, no_show
    cancellation_reason TEXT,
    refund_amount   INT,
    refund_status   TEXT,                  -- pending, processed, credited
    loyalty_earned  INT DEFAULT 0,
    booked_at       TIMESTAMPTZ DEFAULT now(),
    cancelled_at    TIMESTAMPTZ,

    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bookings_user ON bookings(user_id, booked_at DESC);
CREATE INDEX idx_bookings_trip ON bookings(trip_id);
CREATE INDEX idx_bookings_code ON bookings(booking_code);

-- Loyalty transactions
CREATE TABLE loyalty_transactions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    booking_id  UUID REFERENCES bookings(id),
    points      INT NOT NULL,             -- positive = earned, negative = redeemed
    type        TEXT NOT NULL,             -- 'booking_earn', 'referral', 'redemption', 'expiry', 'bonus'
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Wallet transactions
CREATE TABLE wallet_transactions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    booking_id  UUID REFERENCES bookings(id),
    amount      INT NOT NULL,             -- positive = credit, negative = debit
    type        TEXT NOT NULL,             -- 'refund', 'cashback', 'topup', 'payment', 'referral_bonus'
    description TEXT,
    balance_after INT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Offers / Promo codes
CREATE TABLE offers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            TEXT UNIQUE,
    title           TEXT NOT NULL,
    description     TEXT,
    discount_type   TEXT NOT NULL,         -- 'percentage', 'flat'
    discount_value  INT NOT NULL,
    max_discount    INT,                   -- cap for percentage discounts
    min_amount      INT,                   -- minimum booking amount
    valid_from      TIMESTAMPTZ NOT NULL,
    valid_until     TIMESTAMPTZ NOT NULL,
    usage_limit     INT,                   -- total uses allowed
    per_user_limit  INT DEFAULT 1,
    route_ids       UUID[],               -- null = all routes
    bus_types       TEXT[],               -- null = all types
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Ratings & Reviews
CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id  UUID UNIQUE NOT NULL REFERENCES bookings(id),
    user_id     UUID NOT NULL REFERENCES users(id),
    trip_id     UUID NOT NULL REFERENCES trips(id),
    rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    tags        TEXT[] DEFAULT '{}',       -- ['clean', 'on_time', 'comfortable', 'rude_staff']
    comment     TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);
```

### 5.2 Redis Data Structures

```
# Seat lock during booking (10-min TTL)
seat_lock:{trip_id}:{seat_number} → {user_id, locked_at}   TTL: 600s

# Trip search cache (5-min TTL)
search:{origin}:{dest}:{date} → [trip results JSON]         TTL: 300s

# User session
session:{session_id} → {user_id, booking_state, ...}        TTL: 3600s

# Live bus location (updated every 30s from GPS)
bus_location:{bus_id} → {lat, lng, speed, heading, ts}      TTL: 120s

# Rate limiting
rate:{ip}:{endpoint} → count                                 TTL: 60s
```

---

## 6. API Design

### 6.1 Core Endpoints

```
# Search & Discovery
GET    /api/v1/trips/search?from=BLR&to=CHN&date=2026-03-26
GET    /api/v1/trips/:tripId
GET    /api/v1/trips/:tripId/seats
GET    /api/v1/routes/popular

# Booking
POST   /api/v1/bookings                    # Create booking (lock seats)
PUT    /api/v1/bookings/:id/confirm        # Confirm after payment
PUT    /api/v1/bookings/:id/cancel         # Cancel booking
PUT    /api/v1/bookings/:id/reschedule     # Reschedule to new trip
GET    /api/v1/bookings/:id                # Get booking details
GET    /api/v1/bookings/my                 # User's bookings

# Payments
POST   /api/v1/payments/initiate           # Start payment flow
POST   /api/v1/payments/webhook            # Payment gateway callback
GET    /api/v1/payments/:id/status         # Check payment status

# User
POST   /api/v1/auth/otp/send              # Send OTP
POST   /api/v1/auth/otp/verify            # Verify OTP → JWT
GET    /api/v1/users/me                    # Profile
PUT    /api/v1/users/me                    # Update profile
GET    /api/v1/users/me/wallet             # Wallet balance & history
GET    /api/v1/users/me/loyalty            # Points & tier

# Tracking
GET    /api/v1/tracking/:tripId            # Live bus location (SSE stream)

# Reviews
POST   /api/v1/reviews                     # Submit review (post-trip)
GET    /api/v1/trips/:tripId/reviews       # Trip reviews

# Offers
GET    /api/v1/offers/applicable?tripId=&amount=   # Get applicable offers
POST   /api/v1/offers/validate             # Validate promo code
```

### 6.2 Search Response (optimized for mobile)

```json
{
  "trips": [
    {
      "id": "trip_abc123",
      "departure": "2026-03-26T21:00:00+05:30",
      "arrival": "2026-03-27T05:30:00+05:30",
      "duration_mins": 510,
      "bus": {
        "type": "ac_sleeper",
        "type_label": "AC Sleeper",
        "amenities": ["wifi", "charging", "blanket", "water"],
        "registration": "KA-01-XX-1234"
      },
      "pricing": {
        "starts_at": 89900,
        "max_price": 119900,
        "currency": "INR",
        "loyalty_discount_pct": 5
      },
      "availability": {
        "total": 36,
        "available": 23,
        "female_preferred_available": 4
      },
      "rating": {
        "average": 4.5,
        "count": 2100
      },
      "on_time_pct": 94,
      "boarding_stops": [
        {"id": "stop_1", "name": "Silk Board Signal", "time": "21:00", "distance_km": 2.1},
        {"id": "stop_2", "name": "Madiwala", "time": "21:15", "distance_km": 4.5}
      ],
      "dropping_stops": [
        {"id": "stop_3", "name": "Koyambedu", "time": "05:15"},
        {"id": "stop_4", "name": "Chennai Central", "time": "05:30"}
      ]
    }
  ],
  "meta": {
    "route": "BLR → CHN",
    "date": "2026-03-26",
    "total_trips": 8,
    "cheapest": 74900,
    "fastest_duration_mins": 420
  }
}
```

---

## 7. Key Features

### 7.1 Seat Reservation & Locking

```
Booking Flow (with concurrency safety):

1. User selects seat(s)
   → POST /bookings {trip_id, seat_numbers: ["L3"]}

2. Server attempts Redis SETNX lock:
   SETNX seat_lock:{trip_id}:L3 {user_id, ts}
   EXPIRE seat_lock:{trip_id}:L3 600

   If lock fails → seat taken, return 409 Conflict
   If lock succeeds → return booking in "pending" status

3. User completes payment (within 10 mins)
   → PUT /bookings/:id/confirm {payment_id}

4. Server:
   - Verify payment with gateway
   - UPDATE trip_seats SET status='booked', booking_id=:id
   - DELETE Redis lock
   - Decrement trips.available_seats
   - Credit loyalty points
   - Send confirmation SMS/push/WhatsApp

5. If 10 min expires without payment:
   - Cron job releases lock
   - UPDATE trip_seats SET status='available'
   - Notify user: "Your seat reservation expired"
```

### 7.2 Dynamic Pricing Engine

```
Inputs:
  - Base price (set by operator per route)
  - Occupancy % (higher occupancy → higher price)
  - Days to departure (last-minute premium)
  - Day of week (weekend/holiday surcharge)
  - Historical demand for this route/time
  - Competitor pricing (optional, via scraping)

Price Bands:
  0-40% occupancy  → base_price × 0.90 (early bird)
  40-65% occupancy  → base_price × 1.00
  65-80% occupancy  → base_price × 1.15
  80-90% occupancy  → base_price × 1.30
  90%+ occupancy    → base_price × 1.50

Constraints:
  - Never exceed 2× base_price
  - Never go below 0.85× base_price
  - Price changes max once per hour
  - Locked price for 10 mins after user views trip
```

### 7.3 Loyalty Program ("RideClub")

```
Tiers:
  Bronze  → 0-999 pts    (default)
  Silver  → 1,000-4,999  (3% discount, priority seat selection)
  Gold    → 5,000-14,999 (5% discount, free rescheduling, lounge access)
  Platinum→ 15,000+      (8% discount, free cancellation, priority boarding)

Earning:
  - ₹1 spent = 1 point
  - Referral bonus = 200 points
  - Review bonus = 25 points
  - Birthday bonus = 100 points

Redemption:
  - 100 points = ₹10 discount
  - Max 20% of ticket value redeemable per booking

Expiry:
  - Points expire 12 months after earning
  - Tier status reviewed quarterly
```

### 7.4 Cancellation & Refunds

```
Free Cancellation Policy:
  12+ hrs before departure → 100% refund (instant to wallet, 3-5 days to source)
  6-12 hrs before          → 75% refund
  2-6 hrs before           → 50% refund
  <2 hrs before            → No refund (but loyalty points returned)

Refund Channels:
  1. Wallet (instant) — default, incentivized with 5% extra
  2. Original payment method (3-5 business days)

Operator Cancellation:
  If operator cancels → 100% refund + 150% as wallet credit
  If delay > 2 hours  → 25% cashback as wallet credit
```

### 7.5 Live Tracking

```
Architecture:
  AIS-140 GPS device on bus
    → Pushes location every 30s via MQTT
    → Ingestion service writes to Redis (bus_location:{bus_id})
    → Client connects via SSE (Server-Sent Events)
    → GET /api/v1/tracking/:tripId (SSE stream)

Client receives:
  {
    "lat": 12.9716,
    "lng": 77.5946,
    "speed_kmph": 72,
    "heading": 145,
    "eta_mins": 35,
    "next_stop": "Krishnagiri",
    "delay_mins": 0,
    "timestamp": "2026-03-26T23:45:00+05:30"
  }

Features:
  - Share live location link (no app needed for recipient)
  - Geofence alerts: "Bus is 5 km away from your boarding point"
  - Delay prediction using historical route data
```

### 7.6 WhatsApp Integration

```
Supported Commands (via WhatsApp Business API):

  "book" → Starts booking flow with quick replies
  "my trips" → Shows upcoming bookings
  "track BK-28391" → Sends live location link
  "cancel BK-28391" → Initiates cancellation with refund options

Notifications sent via WhatsApp:
  - Booking confirmation with QR
  - Bus departure reminder (1 hr before)
  - Bus approaching boarding point (5 km away)
  - Trip completed + review prompt
  - Refund credited
  - Loyalty tier upgrade
```

---

## 8. Operator Admin Dashboard

### 8.1 Features

```
┌─────────────────────────────────────────────────────┐
│  OPERATOR DASHBOARD                                  │
│                                                     │
│  ┌─────────┬──────────┬──────────┬────────────┐    │
│  │ Today's │ Revenue  │ Occupancy│ On-Time    │    │
│  │ Trips   │ ₹4.2L    │ 82%      │ 91%        │    │
│  │ 12      │ +8% ▲    │ +3% ▲    │ -2% ▼      │    │
│  └─────────┴──────────┴──────────┴────────────┘    │
│                                                     │
│  Modules:                                           │
│  ├── Schedule Management (create/edit trips)        │
│  ├── Seat Management (block/unblock/quota)          │
│  ├── Pricing Controls (base price, surge rules)     │
│  ├── Fleet Status (bus health, GPS status)          │
│  ├── Boarding Chart (per-trip passenger manifest)   │
│  ├── Revenue Analytics (by route, time, bus type)   │
│  ├── Customer Feedback (ratings, complaints)        │
│  ├── Offer Management (create/edit promos)          │
│  ├── Crew Management (driver/conductor assignment)  │
│  └── Settlement Reports (daily/weekly payouts)      │
└─────────────────────────────────────────────────────┘
```

### 8.2 Crew App (Driver/Conductor)

```
Features:
  - View boarding chart for assigned trip
  - Scan QR to verify passenger tickets
  - Mark passengers as boarded / no-show
  - Report incidents (breakdown, delay, medical)
  - Trip start/end logging
  - SOS button
```

---

## 9. Non-Functional Requirements

| Requirement | Target |
|------------|--------|
| Search API latency | < 200ms (p95) |
| Seat lock acquisition | < 50ms |
| Payment confirmation | < 3s end-to-end |
| Uptime | 99.9% (8.7 hrs downtime/year) |
| Concurrent bookings | 500/min during peak |
| Mobile app cold start | < 2s on 4G |
| Web LCP (Largest Contentful Paint) | < 2.5s |
| Offline support | Search results cached, booking queued |
| GPS update frequency | Every 30 seconds |
| Data retention | Bookings: 7 years, Logs: 90 days |

---

## 10. Security

- **Auth**: Phone OTP + JWT (access: 15min, refresh: 30 days)
- **Payment**: PCI-DSS compliant gateway (Razorpay/Juspay), no card data stored
- **API**: Rate limiting (100 req/min per user), CORS, HTTPS only
- **Data**: PII encrypted at rest (AES-256), field-level encryption for phone/email
- **Seat locks**: Redis SETNX for atomic locking, no double-booking possible
- **Admin**: Role-based access (owner, manager, crew), MFA for admin portal

---

## 11. Phased Rollout

### Phase 1: MVP (8-10 weeks)
- Search, seat selection, booking flow
- UPI/card payment via Razorpay
- SMS ticket confirmation
- Basic operator dashboard (schedules, booking chart)
- Mobile web (responsive Next.js)

### Phase 2: Engagement (4-6 weeks)
- User accounts with OTP auth
- Booking history, rebooking
- Wallet (refunds to wallet)
- Loyalty points (basic earn/redeem)
- WhatsApp booking confirmation
- Push notifications

### Phase 3: Experience (4-6 weeks)
- React Native mobile app
- Live GPS tracking
- Dynamic pricing engine
- Ratings & reviews
- Offer/promo engine
- Crew app (QR scanning, boarding chart)

### Phase 4: Growth (ongoing)
- WhatsApp booking bot
- Referral program
- Corporate bookings portal
- Agent portal (offline travel agents)
- Advanced analytics (ClickHouse dashboards)
- Multi-language support (Hindi, Kannada, Tamil, Telugu)
- Lounge booking integration

---

## 12. Competitive Moats vs Aggregators

| Dimension | Aggregator (RedBus) | BusBook (Direct) |
|-----------|-------------------|------------------|
| Commission | 10-20% per ticket | 0% |
| Customer data | Belongs to aggregator | Full ownership |
| Brand control | One of 6000+ operators | Complete control |
| Loyalty | Generic platform loyalty | Brand-specific RideClub |
| Post-booking | Basic ticket display | Track, reschedule, rate |
| Cancellation | 7-10 day refunds | Instant wallet refunds |
| Pricing | Aggregator sets service fees | Full pricing control |
| Direct incentive | None | 5-8% loyalty discount |
| WhatsApp | No | Full booking + tracking |

**Why customers switch to direct**: Cheaper (no aggregator markup + loyalty discount), better post-booking experience (tracking, rescheduling, instant refunds), and the loyalty program creates switching costs.

**Why operators win**: Save 10-20% commission, own customer data for remarketing, control pricing and brand narrative, and build direct customer relationships.
