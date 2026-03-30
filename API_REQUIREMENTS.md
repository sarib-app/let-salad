# LetSalad — Backend API Requirements Document

**Base URL:** `https://calo.dwrylight.com/api/v1`
**Auth:** Bearer token in `Authorization` header
**Content-Type:** `application/json`
**Bilingual:** All user-facing text fields need both English and Arabic (`name` + `name_ar`)

---

## TABLE OF CONTENTS

1. [Existing APIs — No Changes Needed](#1-existing-apis--no-changes-needed)
2. [Existing APIs — Need Updates](#2-existing-apis--need-updates)
3. [New APIs Required](#3-new-apis-required)
4. [Data Structures Reference](#4-data-structures-reference)

---

## 1. EXISTING APIs — No Changes Needed

These APIs are working and the frontend uses them as-is:

| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | POST | `/mobile/auth/send-otp` | Send OTP to phone |
| 2 | POST | `/mobile/auth/verify-otp` | Verify OTP, get token |
| 3 | PUT | `/mobile/auth/profile` | Update user profile |
| 4 | POST | `/mobile/auth/logout` | Logout |
| 5 | PUT | `/mobile/auth/password` | Change password |
| 6 | DELETE | `/mobile/auth/account` | Delete account |
| 7 | GET/POST | `/mobile/getPreferences` / `savePreferences` | User food preferences |
| 8 | GET/POST/PUT/DELETE | `/mobile/listAddresses` etc. | Address CRUD |
| 9 | POST | `/mobile/validateAddressCoordinates` | Delivery zone check |
| 10 | GET | `/mobile/menu/categories` | Menu categories |  
| 11 | GET | `/mobile/subscriptions/types` | Subscription types |
| 12 | GET | `/mobile/subscriptions/packages/{typeId}` | Packages for type |
| 13 | POST | `/mobile/subscriptions` | Purchase subscription |
| 14 | POST | `/mobile/subscriptions/{id}/pause` | Pause subscription |
| 15 | POST | `/mobile/subscriptions/{id}/resume` | Resume subscription |
| 16 | GET | `/mobile/mealPlans/available` | Available meals for next 5 days |
| 17 | GET | `/mobile/mealPlans/upcoming` | Upcoming meal plans |
| 18 | POST | `/mobile/subscriptions/{id}/mealPlans` | Save meal plan |
| 19 | DELETE | `/mobile/subscriptions/{id}/mealPlans/{planId}` | Cancel meal plan |

---

## 2. EXISTING APIs — Need Updates

### 2.1 GET `/mobile/auth/me` — Get Current User

**What changed:** Frontend now displays user name on the Dashboard greeting ("Good morning, Ahmed!").

**Current response works, just confirm these fields exist:**

```json
{
  "code": 200,
  "user": {
    "id": 1,
    "name": "Ahmed Ali",
    "name_ar": "أحمد علي",          // NEW — Arabic name (optional, falls back to name)
    "email": "ahmed@example.com",
    "phone": "+966501234567",
    "has_completed_profile": true,
    "has_completed_preferences": true,
    "sex": "male",
    "weight": 75,
    "height": 178,
    "age": 28
  }
}
```

### 2.2 GET `/mobile/subscriptions` — Get User Subscriptions

**What changed:** Frontend now shows subscription cards on Dashboard with meals remaining and days remaining.

**Current response — please confirm/add these fields:**

```json
{
  "code": 200,
  "subscriptions": [
    {
      "id": 5,
      "status": "active",                    // active | paused | expired | cancelled
      "meals_remaining": 18,                  // NEEDED — total meals left
      "days_remaining": 12,                   // NEEDED — calendar days left
      "remaining_days": 12,                   // (alias — currently used by ManageSubscription screen)
      "total_days_paused": 2,
      "start_date": "2026-02-01",
      "end_date": "2026-03-01",
      "paused_until": null,
      "subscription_package": {
        "id": 1,
        "name": "Premium Plan",
        "name_ar": "الخطة المميزة",
        "meals_per_day": 2                    // NEEDED — for calendar view
      },
      "subscription_type": {
        "id": 1,
        "name": "Monthly",
        "name_ar": "شهري",
        "duration_days": 30
      },
      "delivery_address": { ... },
      "delivery_zone": { ... },
      "total_amount": 450,
      "payment_method": "credit_card",
      "payment_status": "paid"
    }
  ]
}
```

**New fields needed:**
- `meals_remaining` (integer) — total meals left in subscription
- `days_remaining` (integer) — calendar days left
- `subscription_package.meals_per_day` (integer) — how many meals per delivery day

### 2.3 GET `/mobile/menu` and GET `/mobile/menu/{id}` — Get Menu / Meal Details

**Status: ✅ ALREADY WORKING** — Backend already returns options per meal.

**GET `/mobile/menu/{id}` response (confirmed working):**
```json
{
  "code": 200,
  "meal": {
    "id": 13,
    "name": "Beef Steak",
    "name_ar": "ستيك لحم بقرى",
    "slug": "beef-steak",
    "category": "beef",
    "description": "Tender sliced beef steak served with white rice...",
    "description_ar": "شرائح ستيك لحم بقري طرية...",
    "image_url": "https://calo.dwrylight.com/images/meals/...",
    "calories": 330,
    "protein": 29,
    "carbs": 7,
    "fat": 13,
    "price": 32,
    "options": [
      {
        "id": 3,
        "name": "Add-ons",
        "name_ar": "إضافات",
        "type": "multiple_choice",
        "is_required": true,
        "values": [
          { "id": 8, "name": "Extra Cheese", "name_ar": "جبنة إضافية", "price_modifier": 5 },
          { "id": 9, "name": "Extra Sauce", "name_ar": "صلصة إضافية", "price_modifier": 2.5 },
          { "id": 10, "name": "Extra Chicken", "name_ar": "دجاج إضافي", "price_modifier": 8 },
          { "id": 11, "name": "Extra Vegetables", "name_ar": "خضار إضافية", "price_modifier": 3 }
        ]
      }
    ]
  }
}
```

**Backend option structure:**
- `type`: `"multiple_choice"` (checkboxes) or `"single_choice"` (radio buttons)
- `is_required`: boolean — user must select before confirming
- `values[]`: available choices with `price_modifier` (SAR added to price)
- Frontend transforms this to UI format via `transformBackendMeal()` in `mockMealData.js`

**Note for GET `/mobile/menu` (list all):** If the list endpoint also returns `options[]` per meal, the frontend will use them directly. Otherwise it fetches per-meal details via `GET /mobile/menu/{id}` when user taps a meal.

### 2.4 POST `/mobile/subscriptions/{id}/mealPlans` — Save Meal Plan

**Status: ✅ ALREADY WORKING** — Backend accepts options in the payload.

**Request payload (confirmed working):**
```json
{
  "delivery_date": "2026-03-02",
  "meals": [
    {
      "meal_id": 13,
      "quantity": 1,
      "options": [
        { "option_group_id": 3, "option_value_id": 8 },
        { "option_group_id": 3, "option_value_id": 9 },
        { "option_group_id": 3, "option_value_id": 10 },
        { "option_group_id": 3, "option_value_id": 11 }
      ]
    }
  ]
}
```

**Response (confirmed working):**
```json
{
  "code": 200,
  "message": "Meal plan saved successfully",
  "meal_plan": {
    "id": 7,
    "subscription_id": 3,
    "subscription": { "id": 3, "subscription_type": "24-Day Plan" },
    "delivery_date": "2026-03-02",
    "day_name": "Monday",
    "status": "pending",
    "selected_at": "2026-02-28 16:50:05",
    "can_modify": true,
    "can_modify_until": "2026-03-01 00:00:00",
    "items": [
      {
        "id": 20,
        "meal_id": 13,
        "meal": {
          "id": 13,
          "name": "Beef Steak",
          "name_ar": "ستيك لحم بقرى",
          "category": "beef",
          "image_url": "https://...",
          "calories": 330,
          "price": 32
        },
        "quantity": 1,
        "unit_price": 50.5,
        "selected_options": [
          {
            "option_group": { "id": 3, "name": "Add-ons", "name_ar": "إضافات" },
            "option_value": { "id": 8, "name": "Extra Cheese", "name_ar": "جبنة إضافية", "price_modifier": 5 },
            "custom_value": null
          }
        ]
      }
    ]
  }
}
```

**Key points:**
- Frontend uses `buildMealPayload()` in `mockMealData.js` to convert UI selections → `options: [{option_group_id, option_value_id}]` format
- For multi-select: each selected value becomes a separate `{option_group_id, option_value_id}` entry
- Response includes `unit_price` which is base price + all price modifiers
- `can_modify` and `can_modify_until` control the edit window

---

## 3. NEW APIs Required

### 3.1 GET `/mobile/subscriptions/{id}/deliveries` — Delivery Tracking

**Status: ✅ ALREADY WORKING** — Backend returns deliveries per subscription.

**Used by:** Deliveries tab (bottom nav) + Dashboard (today's delivery cards)

**Request:**
```
GET /api/v1/mobile/subscriptions/3/deliveries
Authorization: Bearer {token}
```

**Response (confirmed working — with today's delivery):**
```json
{
  "code": 200,
  "today": {
    "id": 7,
    "date": "2026-03-02",
    "day_name": "Monday",
    "day_name_ar": "الاثنين",
    "status": "in_preparation",
    "estimated_time": "11:57 PM",
    "delivered_time": null,
    "subscription_id": 3,
    "subscription_name": "Chicken Single meal",
    "subscription_name_ar": null,
    "meals": [
      { "name": "Beef Steak", "name_ar": "ستيك لحم بقرى" }
    ],
    "meals_selected": true
  },
  "upcoming": [],
  "past": []
}
```

**Response (confirmed working — no today, past deliveries):**
```json
{
  "code": 200,
  "today": null,
  "upcoming": [],
  "past": [
    {
      "id": 1,
      "date": "2026-02-17",
      "day_name": "Tuesday",
      "day_name_ar": "الثلاثاء",
      "status": "delivered",
      "estimated_time": "7:13 PM",
      "delivered_time": "8:14 PM",
      "subscription_id": 2,
      "subscription_name": "Chicken 2 meals",
      "subscription_name_ar": null,
      "meals": [
        { "name": "Flavor Flip", "name_ar": "فليفور فلب" },
        { "name": "Fit Chick", "name_ar": "فت تشيك" }
      ],
      "meals_selected": true
    },
    {
      "id": 2,
      "date": "2026-02-18",
      "day_name": "Wednesday",
      "day_name_ar": "الأربعاء",
      "status": "pending",
      "estimated_time": null,
      "delivered_time": null,
      "subscription_id": 2,
      "subscription_name": "Chicken 2 meals",
      "subscription_name_ar": null,
      "meals": [
        { "name": "Crab Klaw", "name_ar": "كراب كلاو" },
        { "name": "Tikka Chicken", "name_ar": "دجاج تكا" }
      ],
      "meals_selected": true
    }
  ]
}
```

**Status values (from backend):**
| Status | Meaning | Frontend maps to |
|--------|---------|-----------------|
| `in_preparation` | Kitchen is preparing the meals | Shows "Preparing" with 👨‍🍳 |
| `on_the_way` | Driver en route to customer | Shows "On The Way" with 🚚 |
| `delivered` | Successfully delivered | Shows "Delivered" with ✅ |
| `pending` | Planned but not yet being prepared | Shows "Scheduled" with 📅 |

**Notes:**
- `today` can be `null` if no delivery scheduled today
- `subscription_name_ar` can be `null` — frontend falls back to `subscription_name`
- Frontend handles both `"in_preparation"` (backend) and `"preparing"` (mock) statuses
- Both DeliveriesScreen and DashboardScreen try this real API first, fall back to mock data if it fails

---

### 3.2 GET `/mobile/notifications` — User Notifications

**Purpose:** Shows notification history — delivery updates, order confirmations, promotions, meal reminders.

**Used by:** Notifications screen (accessible from Dashboard bell icon)

**Request:**
```
GET /api/v1/mobile/notifications
Authorization: Bearer {token}
```

**Optional query params:**
- `?page=1&per_page=20` — pagination (optional for MVP)

**Response:**
```json
{
  "code": 200,
  "notifications": [
    {
      "id": 1,
      "type": "delivery_update",
      "title": "Delivery On Its Way",
      "title_ar": "التوصيل في الطريق",
      "message": "Your lunch is being delivered. Estimated arrival: 12:30 PM",
      "message_ar": "يتم توصيل غدائك. الوصول المتوقع: 12:30 مساءً",
      "is_read": false,
      "created_at": "2026-02-16T10:30:00Z",
      "data": {
        "delivery_id": 1001
      }
    },
    {
      "id": 2,
      "type": "order_confirmation",
      "title": "Meals Confirmed",
      "title_ar": "تم تأكيد الوجبات",
      "message": "Your meal selections for tomorrow have been confirmed.",
      "message_ar": "تم تأكيد اختياراتك للوجبات لليوم التالي.",
      "is_read": false,
      "created_at": "2026-02-15T16:00:00Z",
      "data": {
        "subscription_id": 5
      }
    },
    {
      "id": 3,
      "type": "promotion",
      "title": "Weekend Special!",
      "title_ar": "عرض نهاية الأسبوع!",
      "message": "Get 20% off your next subscription upgrade.",
      "message_ar": "احصل على خصم 20% على ترقية اشتراكك التالي.",
      "is_read": true,
      "created_at": "2026-02-14T09:00:00Z",
      "data": {
        "promo_code": "WEEKEND20"
      }
    },
    {
      "id": 4,
      "type": "meal_reminder",
      "title": "Select Tomorrow's Meals",
      "title_ar": "اختر وجبات الغد",
      "message": "Don't forget to select your meals before 10 PM tonight.",
      "message_ar": "لا تنسَ اختيار وجباتك قبل الساعة 10 مساءً.",
      "is_read": true,
      "created_at": "2026-02-13T18:00:00Z",
      "data": {}
    }
  ],
  "unread_count": 2
}
```

**Notification types:**
| Type | When to create |
|------|---------------|
| `delivery_update` | When delivery status changes (preparing → on_the_way → delivered) |
| `order_confirmation` | When user's meal selections are confirmed |
| `promotion` | Admin-created promotional notifications |
| `meal_reminder` | Daily reminder to select meals (e.g., 6 PM day before) |

**Notes:**
- `data` object is flexible — can contain `delivery_id`, `subscription_id`, `promo_code`, etc.
- `is_read` — track per-user read status
- `unread_count` — total unread for badge display

---

### 3.3 PUT `/mobile/notifications/read-all` — Mark All Notifications as Read

**Purpose:** User taps "Mark all as read" button.

**Request:**
```
PUT /api/v1/mobile/notifications/read-all
Authorization: Bearer {token}
```

**Response:**
```json
{
  "code": 200,
  "message": "All notifications marked as read"
}
```

---

### 3.4 PUT `/mobile/notifications/{id}/read` — Mark Single Notification as Read

**Purpose:** When user taps on a notification.

**Request:**
```
PUT /api/v1/mobile/notifications/3/read
Authorization: Bearer {token}
```

**Response:**
```json
{
  "code": 200,
  "message": "Notification marked as read"
}
```

---

### 3.5 GET `/mobile/subscriptions/{id}/calendar` — Meal Calendar

**Purpose:** Shows a weekly calendar view of meal assignments per subscription.

**Used by:** Meal Calendar screen (accessed from ManageSubscription)

**Request:**
```
GET /api/v1/mobile/subscriptions/5/calendar?week_start=2026-02-17
Authorization: Bearer {token}
```

**Query params:**
- `week_start` (YYYY-MM-DD) — Monday of the desired week. If omitted, defaults to current week.

**Response:**
```json
{
  "code": 200,
  "subscription_id": 5,
  "week_start": "2026-02-17",
  "days": [
    {
      "date": "2026-02-17",
      "day_name": "Monday",
      "day_name_ar": "الاثنين",
      "is_today": false,
      "is_past": false,
      "is_off_day": false,
      "meals": [
        {
          "id": 9,
          "name": "Grilled Chicken",
          "name_ar": "دجاج مشوي",
          "calories": 450
        },
        {
          "id": 12,
          "name": "Greek Salad",
          "name_ar": "سلطة يونانية",
          "calories": 280
        }
      ]
    },
    {
      "date": "2026-02-18",
      "day_name": "Tuesday",
      "day_name_ar": "الثلاثاء",
      "is_today": false,
      "is_past": false,
      "is_off_day": false,
      "meals": []
    },
    {
      "date": "2026-02-21",
      "day_name": "Friday",
      "day_name_ar": "الجمعة",
      "is_today": false,
      "is_past": false,
      "is_off_day": true,
      "meals": []
    }
  ]
}
```

**Notes:**
- Return all 7 days of the week (Mon–Sun)
- `is_off_day: true` for Friday (or any configured off-day)
- `meals: []` means no meals selected for that day
- `meals` array contains the selected meals for that day (from meal plan)
- Frontend uses this to show a visual weekly grid

---

### 3.6 GET `/mobile/nutrition/weekly` — Nutrition Summary

**Purpose:** Shows weekly calorie and macro tracking based on delivered/selected meals.

**Used by:** Nutrition Dashboard screen (accessed from Profile)

**Request:**
```
GET /api/v1/mobile/nutrition/weekly
Authorization: Bearer {token}
```

**Optional query params:**
- `?week_start=2026-02-10` — specific week (defaults to current week)

**Response:**
```json
{
  "code": 200,
  "daily_summary": [
    {
      "date": "2026-02-10",
      "day_name": "Mon",
      "day_name_ar": "اثنين",
      "calories": 620,
      "protein": 52,
      "carbs": 48,
      "fat": 22,
      "meal_count": 2
    },
    {
      "date": "2026-02-11",
      "day_name": "Tue",
      "day_name_ar": "ثلاثاء",
      "calories": 580,
      "protein": 45,
      "carbs": 55,
      "fat": 18,
      "meal_count": 2
    }
  ],
  "weekly_totals": {
    "total_calories": 3620,
    "avg_calories": 603,
    "total_protein": 302,
    "avg_protein": 50,
    "total_carbs": 280,
    "avg_carbs": 47,
    "total_fat": 128,
    "avg_fat": 21
  }
}
```

**Notes:**
- Aggregate from delivered/selected meals for the week
- Skip off-days (Friday)
- `calories`, `protein`, `carbs`, `fat` come from the meal nutrition data
- If no meals for a day, either omit that day or return zeros
- Include customization calorie adjustments if available (e.g., user chose large size = +150 cal)

---

## 4. Data Structures Reference

### 4.1 Meal Customization (Options/Variations) — Admin Dashboard

**This is what admin creates from the dashboard per meal:**

```
Meal (id: 9, Grilled Chicken)
├── Options (displayed as "OPTIONS" section)
│   ├── Size (single-select, required)
│   │   ├── Regular (+0 cal) [default]
│   │   └── Large (+150 cal)
│   └── Side Dish (single-select, required)
│       ├── Brown Rice (+0 cal) [default]
│       ├── Quinoa (-20 cal)
│       └── Sweet Potato (+5 cal)
├── Variations (displayed as "VARIATIONS" section)
│   ├── Cooking Style (single-select, required)
│   │   ├── Grilled (+0 cal) [default]
│   │   └── Baked (-15 cal)
│   └── Sauce (multi-select, max 2, optional)
│       ├── Garlic Sauce (+45 cal)
│       ├── BBQ Sauce (+50 cal)
│       └── Tahini (+60 cal)
├── Add-ons (multi-select, all optional)
│   ├── Extra Protein (+120 cal)
│   ├── Avocado (+80 cal)
│   └── Cheese (+110 cal)
└── Special Instructions: enabled (free text)
```

**Admin dashboard should allow:**
1. Creating option/variation groups per meal
2. Setting `multi_select` true/false per group
3. Setting `required` true/false per group
4. Setting `max_count` for multi-select groups
5. Adding list items with `name`, `name_ar`, `calories`, `default`
6. Toggling `special_instructions` on/off per meal
7. Creating add-on items with `name`, `name_ar`, `calories`

### 4.2 Delivery Status Flow

```
scheduled → preparing → on_the_way → delivered
                                    ↗
scheduled → skipped (if user skips)
```

### 4.3 Notification Creation Triggers

| Event | Notification Type | Example Message |
|-------|------------------|-----------------|
| Delivery status → `preparing` | `delivery_update` | "Your meals are being prepared!" |
| Delivery status → `on_the_way` | `delivery_update` | "Your lunch is on its way! ETA: 12:30 PM" |
| Delivery status → `delivered` | `delivery_update` | "Your meals have been delivered. Enjoy!" |
| Meal plan confirmed | `order_confirmation` | "Your meals for tomorrow are confirmed" |
| Subscription purchased | `order_confirmation` | "Your subscription is now active!" |
| Daily at 6 PM (if no meals selected for tomorrow) | `meal_reminder` | "Don't forget to select tomorrow's meals" |
| Admin creates promotion | `promotion` | "Get 20% off — use code WEEKEND20" |

---

## Summary of All Changes

### ✅ Already Working APIs (confirmed with real data):
| # | Method | Endpoint | Status |
|---|--------|----------|--------|
| 1 | GET | `/mobile/menu/{id}` | ✅ Returns `options[]` with `values[]` and `price_modifier` |
| 2 | POST | `/mobile/subscriptions/{id}/mealPlans` | ✅ Accepts `options: [{option_group_id, option_value_id}]` |
| 3 | GET | `/mobile/subscriptions/{id}/deliveries` | ✅ Returns `today`, `upcoming[]`, `past[]` with statuses |

### APIs to CREATE (4 new endpoints):
| # | Method | Endpoint | Priority |
|---|--------|----------|----------|
| 1 | GET | `/mobile/notifications` | **HIGH** — Notifications screen |
| 2 | PUT | `/mobile/notifications/read-all` | MEDIUM |
| 3 | PUT | `/mobile/notifications/{id}/read` | MEDIUM |
| 4 | GET | `/mobile/subscriptions/{id}/calendar` | MEDIUM — Calendar screen |
| 5 | GET | `/mobile/nutrition/weekly` | LOW — Nutrition dashboard |

### APIs to UPDATE (1 existing endpoint):
| # | Endpoint | What to add |
|---|----------|-------------|
| 1 | GET `/mobile/subscriptions` | Ensure `meals_remaining`, `days_remaining`, `subscription_package.meals_per_day` fields exist |

### Admin Dashboard — New Features Needed:
1. **Notification Sender** — Create promotional notifications for all users
2. **Delivery Status Updater** — Update delivery status (in_preparation → on_the_way → delivered)
 