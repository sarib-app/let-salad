# Let'Salad Mobile App - API Documentation

## Overview
This document outlines all APIs needed to replace frontend mock data with actual backend integration.

---

## 1. AUTHENTICATION APIs

### 1.1 Send OTP
**Endpoint:** `POST /api/auth/send-otp`

**Request:**
```json
{
  "phone_number": "+966501234567"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expires_in": 60
}
```

---

### 1.2 Verify OTP
**Endpoint:** `POST /api/auth/verify-otp`

**Request:**
```json
{
  "phone_number": "+966501234567",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "user_123",
    "phone_number": "+966501234567",
    "is_new_user": true,
    "has_completed_profile": false,
    "has_completed_preferences": false
  }
}
```

**Frontend Logic After OTP Verification:**
- If `has_completed_profile === false` → Navigate to CompleteProfile
- If `has_completed_profile === true` && `has_completed_preferences === false` → Navigate to Preferences
- If both completed → Navigate to MainApp (Home)

---

### 1.3 Get User Onboarding Status
**Endpoint:** `GET /api/auth/onboarding-status`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Purpose:** Check user's onboarding completion status (used when app launches to determine navigation)

**Response (Returning User):**
```json
{
  "success": true,
  "status": {
    "has_completed_profile": true,
    "has_completed_preferences": true,
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "preferences": {
      "subscribingFor": "me",
      "goal": "lose",
      "mealType": "low_carb"
    }
  }
}
```

**Response (New User):**
```json
{
  "success": true,
  "status": {
    "has_completed_profile": false,
    "has_completed_preferences": false,
    "profile": null,
    "preferences": null
  }
}
```

---

## 2. USER PROFILE APIs

### 2.1 Save/Update User Profile
**Endpoint:** `POST /api/user/profile`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "sex": "male",
  "weight": "75",
  "height": "180",
  "age": "30"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "sex": "male",
    "weight": "75",
    "height": "180",
    "age": "30",
    "has_completed_profile": true
  }
}
```

**Note:** After successful profile save, backend should set `has_completed_profile = true` for this user.

---

### 2.2 Get User Profile
**Endpoint:** `GET /api/user/profile`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "sex": "male",
    "weight": "75",
    "height": "180",
    "age": "30"
  }
}
```

---

## 3. USER PREFERENCES APIs

### 3.1 Save User Preferences
**Endpoint:** `POST /api/user/preferences`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Request:**
```json
{
  "subscribingFor": "me",
  "gender": "male",
  "hasAllergies": "no",
  "goal": "lose",
  "mealType": "low_carb"
}
```

**Response:**
```json
{
  "success": true,
  "preferences": {
    "subscribingFor": "me",
    "gender": "male",
    "hasAllergies": "no",
    "goal": "lose",
    "mealType": "low_carb",
    "has_completed_preferences": true
  }
}
```

**Note:** After successful preferences save, backend should set `has_completed_preferences = true` for this user.

---

### 3.2 Get User Preferences
**Endpoint:** `GET /api/user/preferences`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Response:**
```json
{
  "success": true,
  "preferences": {
    "subscribingFor": "me",
    "gender": "male",
    "hasAllergies": "no",
    "goal": "lose",
    "mealType": "low_carb"
  }
}
```

---

## 4. MENU APIs

### 4.1 Get Menu Categories
**Endpoint:** `GET /api/menu/categories`

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": "chicken",
      "name": "Chicken",
      "icon": "🍗"
    },
    {
      "id": "sandwich",
      "name": "Sandwiches",
      "icon": "🥪"
    }
  ]
}
```

---

### 4.2 Get Menu Items by Category
**Endpoint:** `GET /api/menu/items?category=chicken`

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "id": "ch1",
      "name": "Grilled Chicken Breast",
      "description": "Tender grilled chicken breast with herbs and spices",
      "image": "https://cdn.letsalad.com/meals/grilled-chicken.jpg",
      "calories": 320,
      "protein": 45,
      "carbs": 8,
      "fat": 12,
      "allergens": ["dairy"],
      "available": true,
      "popular": true
    }
  ]
}
```

---

## 5. SUBSCRIPTION PACKAGES APIs

### 5.1 Get All Subscription Packages
**Endpoint:** `GET /api/subscriptions/packages`

**Response:**
```json
{
  "success": true,
  "packages": [
    {
      "id": "pkg1",
      "package_title": "Chicken Single Meal",
      "duration": 24,
      "price_24": 648,
      "price_10": 270,
      "meals": [
        {
          "meal_type": 1,
          "meal_name": "Chicken",
          "qty": 1
        }
      ],
      "description": "Daily chicken meal for 24 days",
      "popular": false
    }
  ]
}
```

---

## 6. DELIVERY PREFERENCES APIs

### 6.1 Get User Addresses
**Endpoint:** `GET /api/user/addresses`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Response:**
```json
{
  "success": true,
  "addresses": [
    {
      "id": "addr_1",
      "name": "John Doe",
      "street": "King Fahd Road, Al Olaya",
      "city": "Riyadh",
      "phone": "+966 50 123 4567",
      "isDefault": true
    }
  ]
}
```

---

### 6.2 Add New Address
**Endpoint:** `POST /api/user/addresses`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Request:**
```json
{
  "name": "John Doe",
  "street": "King Fahd Road, Al Olaya",
  "city": "Riyadh",
  "phone": "+966 50 123 4567",
  "isDefault": false
}
```

**Response:**
```json
{
  "success": true,
  "address": {
    "id": "addr_2",
    "name": "John Doe",
    "street": "King Fahd Road, Al Olaya",
    "city": "Riyadh",
    "phone": "+966 50 123 4567",
    "isDefault": false
  }
}
```

---

## 7. PAYMENT APIs

### 7.1 Get Payment Methods
**Endpoint:** `GET /api/payments/methods`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Response:**
```json
{
  "success": true,
  "methods": [
    {
      "id": "pm_1",
      "type": "card",
      "cardType": "Visa",
      "last4": "4242",
      "expiry": "12/25",
      "isDefault": true
    }
  ]
}
```

---

### 7.2 Add Payment Method
**Endpoint:** `POST /api/payments/methods`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Request:**
```json
{
  "type": "card",
  "token": "STRIPE_TOKEN_HERE"
}
```

**Response:**
```json
{
  "success": true,
  "method": {
    "id": "pm_2",
    "type": "card",
    "cardType": "Mastercard",
    "last4": "8888",
    "expiry": "08/26",
    "isDefault": false
  }
}
```

---

## 8. ORDER/SUBSCRIPTION APIs

### 8.1 Create Subscription Order
**Endpoint:** `POST /api/orders/create`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Request:**
```json
{
  "package_id": "pkg1",
  "duration": 24,
  "delivery_address_id": "addr_1",
  "payment_method_id": "pm_1",
  "delivery_preferences": {
    "timeSlot": {
      "id": "morning",
      "label": "Morning",
      "time": "7:00 AM - 10:00 AM"
    },
    "deliveryDays": ["sun", "mon", "tue", "wed", "thu"],
    "daysPerWeek": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "LS12345678",
    "status": "active",
    "package_id": "pkg1",
    "package_title": "Chicken Single Meal",
    "duration": 24,
    "price": 648,
    "tax": 97.2,
    "total": 745.2,
    "start_date": "2025-12-29T00:00:00Z",
    "days_remaining": 24,
    "total_pause_days_used": 0,
    "created_at": "2025-12-28T10:30:00Z"
  }
}
```

---

### 8.2 Get Active Subscriptions
**Endpoint:** `GET /api/subscriptions/active`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Response:**
```json
{
  "success": true,
  "subscriptions": [
    {
      "id": "LS12345678",
      "package_title": "Chicken Single Meal",
      "package_id": "pkg1",
      "duration": 24,
      "price": 648,
      "meals": [
        {
          "meal_type": 1,
          "meal_name": "Chicken",
          "qty": 1
        }
      ],
      "delivery_address": {
        "name": "John Doe",
        "street": "King Fahd Road, Al Olaya",
        "city": "Riyadh",
        "phone": "+966 50 123 4567"
      },
      "delivery_preferences": {
        "timeSlot": {
          "id": "morning",
          "label": "Morning",
          "time": "7:00 AM - 10:00 AM"
        },
        "deliveryDays": ["sun", "mon", "tue", "wed", "thu"],
        "daysPerWeek": 5
      },
      "start_date": "2025-12-29T00:00:00Z",
      "days_remaining": 23,
      "status": "active",
      "total_pause_days_used": 0,
      "created_at": "2025-12-28T10:30:00Z"
    }
  ]
}
```

---

### 8.3 Get Subscription Details
**Endpoint:** `GET /api/subscriptions/:subscriptionId`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Response:**
```json
{
  "success": true,
  "subscription": {
    "id": "LS12345678",
    "package_title": "Chicken Single Meal",
    "package_id": "pkg1",
    "duration": 24,
    "price": 648,
    "meals": [
      {
        "meal_type": 1,
        "meal_name": "Chicken",
        "qty": 1
      }
    ],
    "delivery_address": {
      "name": "John Doe",
      "street": "King Fahd Road, Al Olaya",
      "city": "Riyadh",
      "phone": "+966 50 123 4567"
    },
    "delivery_preferences": {
      "timeSlot": {
        "id": "morning",
        "label": "Morning",
        "time": "7:00 AM - 10:00 AM"
      },
      "deliveryDays": ["sun", "mon", "tue", "wed", "thu"],
      "daysPerWeek": 5
    },
    "payment_method": {
      "type": "card",
      "last4": "4242"
    },
    "start_date": "2025-12-29T00:00:00Z",
    "days_remaining": 23,
    "status": "active",
    "total_pause_days_used": 0,
    "pause_start": null,
    "pause_end": null,
    "pause_days": 0,
    "created_at": "2025-12-28T10:30:00Z"
  }
}
```

---

## 9. SUBSCRIPTION MANAGEMENT APIs

### 9.1 Pause Subscription
**Endpoint:** `POST /api/subscriptions/:subscriptionId/pause`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Request:**
```json
{
  "pause_days": 3
}
```

**Backend Validations Required:**
- For 24-day subscriptions: Max 5 total pause days (can be used 1+1+3 or 5 consecutive)
- For 10-day subscriptions: Max 3 total pause days
- Check `total_pause_days_used` + `pause_days` <= max allowed
- Reject if limit exceeded

**Response:**
```json
{
  "success": true,
  "subscription": {
    "id": "LS12345678",
    "status": "paused",
    "pause_days": 3,
    "pause_start": "2025-12-29T00:00:00Z",
    "pause_end": "2026-01-01T00:00:00Z",
    "total_pause_days_used": 3,
    "remaining_pause_days": 2
  }
}
```

---

### 9.2 Resume Subscription
**Endpoint:** `POST /api/subscriptions/:subscriptionId/resume`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Response:**
```json
{
  "success": true,
  "subscription": {
    "id": "LS12345678",
    "status": "active",
    "pause_days": 0,
    "pause_start": null,
    "pause_end": null
  }
}
```

---

## 10. MEAL SELECTION APIs

### 10.1 Get Tomorrow's Meal Selection Window
**Endpoint:** `GET /api/meals/selection-window`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Backend Logic:**
- Return if current time is before 8:00 PM (20:00) today
- Calculate time until cutoff

**Response:**
```json
{
  "success": true,
  "can_select": true,
  "cutoff_time": "2025-12-28T20:00:00Z",
  "hours_until_cutoff": 5,
  "minutes_until_cutoff": 30,
  "tomorrow_date": "2025-12-29"
}
```

---

### 10.2 Get Meal Selection for Date
**Endpoint:** `GET /api/meals/selection/:subscriptionId/:date`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Example:** `GET /api/meals/selection/LS12345678/2025-12-29`

**Response:**
```json
{
  "success": true,
  "date": "2025-12-29",
  "selection": {
    "meals": [
      {
        "id": "ch1",
        "name": "Grilled Chicken Breast",
        "category": "Chicken",
        "calories": 320
      }
    ],
    "selected_at": "2025-12-28T15:30:00Z",
    "can_update": true
  }
}
```

---

### 10.3 Update Tomorrow's Meal Selection
**Endpoint:** `POST /api/meals/selection/:subscriptionId`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Request:**
```json
{
  "date": "2025-12-29",
  "meals": [
    {
      "id": "ch1",
      "name": "Grilled Chicken Breast",
      "category": "Chicken"
    }
  ]
}
```

**Backend Validations:**
- Check current time < 8:00 PM today
- Only allow date = tomorrow
- Validate meal quantities match subscription package
- Reject if window closed or wrong date

**Response:**
```json
{
  "success": true,
  "selection": {
    "date": "2025-12-29",
    "meals": [
      {
        "id": "ch1",
        "name": "Grilled Chicken Breast",
        "category": "Chicken"
      }
    ],
    "selected_at": "2025-12-28T16:45:00Z"
  }
}
```

---

### 10.4 Get Meal History
**Endpoint:** `GET /api/meals/history/:subscriptionId`

**Headers:** `Authorization: Bearer JWT_TOKEN`

**Query Parameters:**
- `limit`: Number of days (default: 7)

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "date": "2025-12-28",
      "dateStr": "Dec 28",
      "dayName": "Saturday",
      "status": "delivered",
      "deliveryTime": "10:30 AM",
      "meals": [
        {
          "name": "Grilled Chicken Breast",
          "category": "Chicken"
        }
      ]
    },
    {
      "date": "2025-12-29",
      "dateStr": "Dec 29",
      "dayName": "Sunday",
      "status": "in_preparation",
      "estimatedTime": "9:00 AM",
      "meals": [
        {
          "name": "Lemon Herb Chicken",
          "category": "Chicken"
        }
      ]
    }
  ]
}
```

**Status Values:**
- `scheduled`: Meal scheduled for future delivery
- `in_preparation`: Kitchen preparing the meal
- `out_for_delivery`: Driver on the way
- `delivered`: Successfully delivered

---

## IMPLEMENTATION NOTES

### Frontend Files to Update:

1. **Replace Mock Data Functions:**
   - `data/mockMenuData.js` → Replace `fetchMenuItems`, `fetchCategories` with API calls
   - `data/mockSubscriptionData.js` → Replace `fetchSubscriptionPackages` with API call

2. **Replace AsyncStorage with API Calls:**
   - `utils/storage.js` → Create new `utils/api.js` with API client
   - Update all screens to use API instead of AsyncStorage

3. **Add API Client:**
   Create `utils/api.js`:
   ```javascript
   import axios from 'axios';

   const API_BASE_URL = 'https://api.letsalad.com';

   const api = axios.create({
     baseURL: API_BASE_URL,
     headers: {
       'Content-Type': 'application/json',
     },
   });

   // Add JWT token to requests
   api.interceptors.request.use(async (config) => {
     const token = await AsyncStorage.getItem('@auth_token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });

   export default api;
   ```

4. **Authentication State:**
   - Create AuthContext to manage JWT token
   - Store token in AsyncStorage after login
   - Auto-attach token to all API requests

5. **Error Handling:**
   - Add global error handler for API failures
   - Show user-friendly error messages
   - Handle token expiration (redirect to login)

---

## PRIORITY ORDER FOR BACKEND DEVELOPMENT

1. **Phase 1 - Core Auth & User:**
   - Authentication APIs (1.1, 1.2, 1.3) - **CRITICAL: Include onboarding status**
   - User Profile APIs (2.1, 2.2)
   - User Preferences APIs (3.1, 3.2)

2. **Phase 2 - Menu & Subscriptions:**
   - Menu APIs (4.1, 4.2)
   - Subscription Packages API (5.1)
   - Order Creation API (8.1)

3. **Phase 3 - Delivery & Payment:**
   - Addresses APIs (6.1, 6.2)
   - Payment APIs (7.1, 7.2)
   - Get Subscriptions API (8.2, 8.3)

4. **Phase 4 - Subscription Management:**
   - Pause/Resume APIs (9.1, 9.2)
   - Meal Selection APIs (10.1, 10.2, 10.3)
   - Meal History API (10.4)

---

**End of Documentation**
