# API Testing Guide - DATH Backend

This guide provides step-by-step instructions for testing all API endpoints after Phase 1 fixes.

---

## Prerequisites

1. Backend server running: `npm start`
2. `.env` file configured with:
   ```
   JWT_SECRET=your_secret_key_here
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```
3. Database tables created (all tables initialized)
4. Testing tool: Postman, VS Code REST Client, or curl

---

## Quick Start: Testing Flow

### Step 1: Register a Patient
**Endpoint:** `POST /api/auth/register`

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testpatient",
    "email": "patient@test.com",
    "password": "TestPass123!",
    "phone_number": "1234567890",
    "date_of_birth": "1990-01-15",
    "address": "123 Main St",
    "gender": "M",
    "insurance_provider": "Blue Cross",
    "insurance_number": "BC123456"
  }'
```

**Expected Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testpatient",
    "email": "patient@test.com",
    "phone_number": "1234567890",
    "date_of_birth": "1990-01-15",
    "address": "123 Main St",
    "gender": "M",
    "role": "patient"
  }
}
```

**Save the token** - you'll need it for authenticated requests.

---

### Step 2: Test User Profile - GET /api/auth/me

**Endpoint:** `GET /api/auth/me`

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "testpatient",
    "email": "patient@test.com",
    "phone_number": "1234567890",
    "date_of_birth": "1990-01-15",
    "address": "123 Main St",
    "gender": "M",
    "role": "patient",
    "patient": {
      "id": 1,
      "user_id": 1,
      "insurance_provider": "Blue Cross",
      "insurance_number": "BC123456"
    }
  }
}
```

✅ **This confirms:** JWT token works correctly with fixed payload

---

### Step 3: Login Test
**Endpoint:** `POST /api/auth/login`

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testpatient",
    "password": "TestPass123!"
  }'
```

**Expected Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testpatient",
    "email": "patient@test.com",
    "role": "patient"
  }
}
```

---

## Full Testing Scenarios

### Scenario 1: Complete Patient Registration Flow ✅

**What it tests:** Register → Login → Get Profile (all with fixed JWT)

```bash
# 1. Register
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phone_number": "555-1234",
    "date_of_birth": "1990-05-15",
    "address": "456 Oak Ave",
    "gender": "M"
  }' | jq -r '.token')

echo "Token: $TOKEN"

# 2. Login with same credentials
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123!"
  }' | jq .

# 3. Get profile using token
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Success Criteria:**
- ✅ Register returns token with correct JWT payload
- ✅ Login returns matching token
- ✅ /me endpoint returns user + patient profile
- ✅ No 401 "invalid token payload" errors

---

### Scenario 2: Doctor Registration (Manual Database Insert)

Since doctor registration isn't exposed as API, manually insert:

```sql
-- 1. Insert user with role='doctor'
INSERT INTO public.Users (username, email, password, phone_number, role)
VALUES ('dr_smith', 'dr.smith@hospital.com', 'hashed_password', '555-9876', 'doctor');
-- Get the user_id from insert

-- 2. Insert department
INSERT INTO public.Department (name)
VALUES ('Cardiology');
-- Get the department_id

-- 3. Insert doctor record
INSERT INTO public.Doctor (user_id, specialization, license_number, years_of_experience, department_id)
VALUES (2, 'Cardiology', 'LIC123456', 15, 1);
```

Then test:
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer DOCTOR_TOKEN"
```

**Expected:** User profile includes `doctor` object with doctor details

---

### Scenario 3: Doctor Sets Availability

**Endpoint:** `POST /api/doctors/availability` (Not yet implemented - TODO for your friend)

This endpoint should:
- Generate 30-minute slots from availability
- Save to Slot table for multiple dates

**Manual test (when implemented):**
```bash
curl -X POST http://localhost:3000/api/doctors/availability \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "day_of_week": "Monday",
    "start_time": "09:00",
    "end_time": "12:00"
  }'
```

**Expected Behavior:**
- Creates Availability record
- Generates slots: [09:00-09:30, 09:30-10:00, 10:00-10:30, 10:30-11:00, 11:00-11:30, 11:30-12:00]
- Inserts slots for next 30 days

---

### Scenario 4: Patient Books Appointment

**Endpoint:** `GET /api/appointments/my` (Fixed variable bug)

```bash
# Get patient's appointments
curl -X GET http://localhost:3000/api/appointments/my \
  -H "Authorization: Bearer PATIENT_TOKEN"
```

**Expected Response (200):**
```json
[
  {
    "appointment_id": 1,
    "doctor_name": "dr_smith",
    "specialization": "Cardiology",
    "date": "2025-11-25",
    "start_time": "09:00:00",
    "end_time": "09:30:00",
    "duration": 30,
    "reason_for_visit": "Checkup",
    "status": "Pending"
  }
]
```

✅ **This confirms:** Variable bug is fixed (no more undefined reference)

---

### Scenario 5: Department Management

**Test 1: Get All Departments**
```bash
curl -X GET http://localhost:3000/api/departments
```

**Expected (200):**
```json
[
  { "department_id": 1, "name": "Cardiology" },
  { "department_id": 2, "name": "Neurology" }
]
```

**Test 2: Create Department (Admin only)**
```bash
curl -X POST http://localhost:3000/api/departments \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Dermatology"}'
```

**Expected (201):**
```json
{
  "department_id": 3,
  "name": "Dermatology"
}
```

**Test 3: Update Department (Fixed - no description field)**
```bash
curl -X PATCH http://localhost:3000/api/departments/3 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Dermatology"}'
```

**Expected (200):**
```json
{
  "department_id": 3,
  "name": "Updated Dermatology"
}
```

✅ **This confirms:** Description field bug is fixed

---

## Error Test Cases

### Test 1: Invalid JWT Token
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer invalid_token_here"
```

**Expected (401):**
```json
{ "error": "Unauthorized: invalid or expired token" }
```

---

### Test 2: Missing Bearer Token
```bash
curl -X GET http://localhost:3000/api/auth/me
```

**Expected (401):**
```json
{ "error": "Unauthorized: missing bearer token" }
```

---

### Test 3: Duplicate Username Registration
```bash
# Register first user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "duplicate", "password": "Pass123!"}'

# Try to register same username again
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "duplicate", "password": "Pass123!"}'
```

**Expected (409):**
```json
{ "error": "Username already exists" }
```

---

### Test 4: Invalid Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "WrongPassword"}'
```

**Expected (401):**
```json
{ "error": "Invalid credentials" }
```

---

## Using VS Code REST Client

Create file: `backend/test.http`

```http
### Variables
@baseUrl = http://localhost:3000
@token = 

### Register Patient
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
  "username": "testpatient",
  "email": "patient@test.com",
  "password": "TestPass123!",
  "phone_number": "1234567890",
  "date_of_birth": "1990-01-15",
  "address": "123 Main St",
  "gender": "M",
  "insurance_provider": "Blue Cross",
  "insurance_number": "BC123456"
}

### Login
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "username": "testpatient",
  "password": "TestPass123!"
}

### Get My Profile
GET {{baseUrl}}/api/auth/me
Authorization: Bearer {{token}}

### Get Departments
GET {{baseUrl}}/api/departments

### Create Department (Admin)
POST {{baseUrl}}/api/departments
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Psychiatry"
}

### Update Department
PATCH {{baseUrl}}/api/departments/1
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Updated Department"
}

### Get My Appointments
GET {{baseUrl}}/api/appointments/my
Authorization: Bearer {{token}}

### Delete Department
DELETE {{baseUrl}}/api/departments/1
Authorization: Bearer {{token}}
```

**How to use:**
1. Install VS Code extension: "REST Client"
2. Click "Send Request" above each request
3. Responses appear in right panel
4. Copy token from register response into `@token` variable

---

## Using Postman

1. **Create Collection:** "DATH API Tests"

2. **Add Folder:** "Auth"
   - POST /register
   - POST /login
   - GET /me

3. **Add Folder:** "Departments"
   - GET /departments
   - POST /departments
   - PATCH /departments/:id
   - DELETE /departments/:id

4. **Add Folder:** "Appointments"
   - GET /appointments/my
   - GET /appointments/doctor
   - POST /appointments
   - PATCH /appointments/:id/status

5. **Setup Environment Variable:**
   ```
   baseUrl = http://localhost:3000
   token = (will be auto-populated)
   ```

6. **Add Pre-request Script to Register:**
   ```javascript
   // Runs before request - set variables here
   ```

7. **Add Tests Tab to Register:**
   ```javascript
   if (pm.response.code === 201) {
     var jsonData = pm.response.json();
     pm.environment.set("token", jsonData.token);
     console.log("Token saved: " + jsonData.token);
   }
   ```

---

## Checklist for Phase 1 Verification

- [ ] **JWT Fix:** Register → Login → /me works without "invalid token payload" errors
- [ ] **Appointments Bug Fix:** GET /appointments/my returns data without "Cannot read property of undefined" error
- [ ] **Table Names Fix:** Doctor profile loads in /me endpoint
- [ ] **Description Field Fix:** PATCH /departments works without errors
- [ ] **Transaction Fix:** Patient record properly created or registration fails cleanly

---

## Debugging Tips

### Issue: "Invalid token payload"
**Cause:** JWT payload mismatch
**Solution:** Verify `auth.routes.js` uses `userId` (not `id`) in jwt.sign()
```bash
grep "jwt.sign" backend/API/auth/auth.routes.js
```

### Issue: "Cannot read property of undefined"
**Cause:** Variable bug in appointments route
**Solution:** Verify line 103 uses `req.user.id` (not `req.user`)
```bash
grep -n "user_id = req.user" backend/API/service/appointments.routes.js
```

### Issue: "Relation does not exist"
**Cause:** Wrong table name
**Solution:** Verify auth.routes.js uses `Doctor` and `Administrator` (not plural)
```bash
grep -n "\.from(" backend/API/auth/auth.routes.js | grep -E "Doctors|Administrators"
```

### Issue: Database errors
**Cause:** Tables not created or schema mismatch
**Solution:** Run database schema initialization, verify tables exist:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

---

## Environment Variables (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_key_change_this_in_production

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here

# Database (optional, if using direct connection)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dath
DB_USER=postgres
DB_PASSWORD=password
```

---

## Next Steps

After Phase 1 verification:
1. Proceed to Phase 2 (Security & Data Integrity)
2. Add input validation
3. Implement slot ownership verification
4. Add appointment cancellation logic

---

## Support

For issues:
1. Check error message in response
2. Verify all `.env` variables are set
3. Check database schema matches expectations
4. Review server logs: `npm start` terminal output
5. Verify JWT_SECRET is consistent across requests
