 # Backend–Frontend Integration Plan

 ## Overview

 This document describes how to connect the existing backend APIs (auth, admin, doctors, patients, services) with the React frontend pages so the app works end‑to‑end.

 The goals are:
 - Use real authentication via `/api/auth/*`.
 - Store and send JWTs for protected routes.
 - Replace dummy frontend data with real data from the backend.
 - Map each page to the appropriate backend endpoints.

 All backend endpoints referenced below are relative to `http://localhost:4000`.

 ---

 ## 1. Shared API Client & Auth Handling

 ### 1.1 API Client

 Create a shared client, e.g. `src/api/client.js`:

 - Base URL:

   ```js
   const API_BASE_URL = 'http://localhost:4000';
   ```

 - Helpers:
   - `apiGet(path, { auth }?)` – `GET API_BASE_URL + path`.
   - `apiPost(path, body, { auth }?)` – `POST API_BASE_URL + path`.
   - When `auth === true`, read JWT from storage and send:

     ```http
     Authorization: Bearer <token>
     ```

 - Centralize error handling:
   - If `!res.ok`, throw using `json.error || json.message || res.statusText`.

 ### 1.2 Auth Storage

 Backend login/register responses look like:

 ```json
 { "token": "<JWT>", "user": { ... } }
 ```

 Store:

 - `authToken`: the JWT.
 - `user`: the user profile (includes `role`).

 Storage strategy:

 - If “Remember me” is checked → `localStorage`.
 - Otherwise → `sessionStorage`.

 Optional helpers:

 - `getAuth()`, `setAuth({ token, user })`, `clearAuth()`.

 ### 1.3 Route Protection (Optional Layer)

 Later, add:

 - `AuthContext` (or similar) to keep `user` and `token` in React state.
 - `RequireAuth` wrapper to protect routes by role:

   - Patient:
     - `/user-dashboard`
     - `/appointment-dashboard`
     - Booking actions in `/service`
   - Doctor:
     - `/doctor-dashboard`
   - Admin:
     - `/admin`
     - Any admin management pages

 ---

 ## 2. Auth Pages

 ### 2.1 Register Page → `POST /api/auth/register`

 **File:** `frontend/src/pages/Register.js`

 Current state: frontend-only simulation with validation.

 **Backend route:**

 - `POST /api/auth/register`
   - Body fields:
     - Required: `username`, `password`.
     - Optional: `email`, `phone_number`, `date_of_birth`, `address`, `gender`, `insurance_provider`, `insurance_number`.
   - Creates:
     - A row in `Users` (role = `patient`).
     - A row in `Patients` linked by `user_id`.
   - Returns: `{ token, user }`.

 **Integration plan:**

 - Keep existing validation for:
   - Name fields
   - Email format
   - Password strength / confirmation
 - Add a backend `username`:
   - Option A: Add username field to the form.
   - Option B: Derive from first and last name.
 - On submit:
   - Build payload matching backend expectations.
   - Call `apiPost('/api/auth/register', payload)`.
 - On success:
   - Save `{ token, user }` using auth helpers.
   - Redirect new patients to `/user-dashboard` or `/home`.

 ---

 ### 2.2 Login Page → `POST /api/auth/login`

 **File:** `frontend/src/pages/Login.js`

 Current state: uses `DUMMY_USERS` + lockout logic.

 **Backend route:**

 - `POST /api/auth/login`
   - Accepts either:
     - `username` + `password`, or
     - `email` + `password`.
   - Returns: `{ token, user }` (includes `role`).

 **Integration plan:**

 - Replace `fakeLogin` with real call:
   - Use `{ email, password }` from form.
 - On submit:
   - If validation passes, call `apiPost('/api/auth/login', { email, password })`.
 - On success:
   - Store `token` + `user`.
   - Redirect based on `user.role`:
     - `admin` → `/admin`
     - `doctor` → `/doctor-dashboard`
     - Otherwise (patient) → `/user-dashboard` or `/home`
 - Keep existing:
   - Lockout logic (just wrap the real API call)
   - Error messages for invalid credentials / network errors

 ---

 ### 2.3 Admin Login → `POST /api/auth/login` + Role Check

 **File:** `frontend/src/pages/AdminLogin.js`

 Current state: checks against hardcoded `DUMMY_ADMINS`.

 **Integration plan:**

 - Use backend login:

   ```js
   apiPost('/api/auth/login', { username, password });
   ```

 - On success:
   - If `user.role === 'admin'`:
     - Save `token` + `user`.
     - Navigate to `/admin`.
   - If `role` is not admin:
     - Show “You do not have admin privileges.”
 - On 401/500 errors:
   - Show “Invalid admin username or password” or generic error.

 ---

 ## 3. Patient Flows

 ### 3.1 Patient Profile → `/api/patient/me` (GET/PATCH)

 **Primary UI:** `frontend/src/pages/UserDashboard.js`

 **Backend routes:**

 - `GET /api/patient/me` (auth required)

   - Uses JWT to get `user_id`, then joins `Patients` and `Users`.
   - Returns:
     - `insurance_provider`, `insurance_number`
     - From `Users`:
       - `username`, `email`
       - `phone_number`, `date_of_birth`
       - `address`, `gender`

 - `PATCH /api/patient/me` (auth required)

   - Body fields:
     - `email`, `phone_number`, `date_of_birth`, `address`, `gender`
     - `insurance_provider`, `insurance_number`

 **Integration plan:**

 - On mount (patient role):

   - Call:

     ```js
     apiGet('/api/patient/me', { auth: true });
     ```

   - Fill UserDashboard form fields from response.

 - On save:

   - Gather edited values.
   - Call:

     ```js
     apiPost('/api/patient/me', body, { auth: true }); // or PATCH helper
     ```

   - Update local state and show confirmation.

 - Access control:

   - Only allow `role === 'patient'` to reach this page (via route guard).

 ---

 ### 3.2 Patient Appointments → `/api/appointments/my`

 **UI:** `frontend/src/pages/AppointmentDashboard.js` + `AppointmentInfoCard.js`

 **Backend route:**

 - `GET /api/appointments/my` (auth required)
   - Uses JWT → `user_id` → `patient_id`
   - Returns each appointment with:
     - `appointment_id`
     - `doctor_name`, `specialization`
     - `date`, `start_time`, `end_time`
     - `duration`, `reason_for_visit`, `status`

 **Integration plan:**

 - On mount:

   ```js
   apiGet('/api/appointments/my', { auth: true });
   ```

 - Render:
   - Map each appointment to an `AppointmentInfoCard`.
   - Display:
     - Doctor name & specialization
     - Date/time
     - Status
     - Reason for visit

 - Cancel (future):
   - Once a cancel endpoint exists (e.g. `PATCH /api/appointments/:id/status` for patients):
     - Wire the “Cancel” button to call it.
     - Update local state or refetch.

 ---

 ## 4. Booking Flow (Service Page)

 **UI:** `frontend/src/pages/Service.js`

 Current state: uses `dummyDoctors` and local filtering.

 Target: end‑to‑end booking:

 1. Load real doctors.
 2. Load available slots for chosen doctor/date.
 3. Book appointment with backend.

 ### 4.1 Search Doctors → `/api/doctors`

 **Backend route:**

 - `GET /api/doctors?department_id=...` (optional)
   - Returns:
     - `doctor_id`
     - `username`, `email`
     - `specialization`, `license_number`, `years_of_experience`
     - `department`, `department_id`

 **Integration plan:**

 - On mount:
   - Replace `dummyDoctors` with real data from `GET /api/doctors`.
 - Use:
   - `specialization` and department for filtering.

 ---

 ### 4.2 Available Time Slots → `/api/slots/available`

 **Backend route:**

 - `GET /api/slots/available?doctor_id=...&date=YYYY-MM-DD`
   - Computes weekday from `date`.
   - Fetches `Availability` rows for that doctor and day.
   - For each availability:
     - If `Slot` rows exist for that date:
       - Filter `status = 'available'`.
     - Else:
       - Generate theoretical 30‑minute slots from availability window.
   - Returns an array of:

     ```json
     { "slot_id": <id or null>, "time": "HH:MM - HH:MM" }
     ```

 **Integration plan:**

 - When user chooses doctor and date:
   - Call `apiGet('/api/slots/available?doctor_id=...&date=...')`.
   - Present returned times as selectable options.
 - For booking:
   - Prefer entries with non‑null `slot_id`.
   - Decide what to do with `slot_id: null`:
     - Disallow booking those, or
     - First create a `Slot` in backend, then book.

 ---

 ### 4.3 Book Appointment → `POST /api/appointments`

 **Backend route:**

 - `POST /api/appointments` (auth required)
   - Body:
     - `doctor_id` (required)
     - `slot_id` (required, existing Slot)
     - `reason_for_visit`
     - `duration` (optional, default 30)
   - Uses JWT to resolve `patient_id`.
   - Validates:
     - Slot exists and `status === 'available'`
     - No conflicting appointment for patient
   - Creates `Appointment` and sets Slot `status = 'booked'`

 **Integration plan:**

 - Require patient login.
 - On confirm:
   - Send:

     ```js
     apiPost('/api/appointments', {
       doctor_id,
       slot_id,
       reason_for_visit,
       duration
     }, { auth: true });
     ```

   - Show booking notification.
   - Optionally redirect to `/appointment-dashboard`.

 ---

 ## 5. Doctor Flow

 **UI:** `frontend/src/pages/DoctorDashboard.js`

 The page already has:

 - Availability schedule UI
 - Appointments table with status dropdown
 - Simple patient records (notes)

 Replace dummy arrays with live data.

 ### 5.1 Availability Management → `/api/doctors/availability`

 **Backend routes:**

 - `GET /api/doctors/availability` (doctor only)
   - Uses JWT → `Doctor.doctor_id`.
   - Returns `Availability` rows for that doctor.

 - `POST /api/doctors/availability` (doctor only)
   - Body: `day_of_week`, `start_time`, `end_time`.
   - Inserts availability.
   - Generates corresponding `Slot` entries for upcoming weeks.

 - `PATCH /api/doctors/availability/:id` (doctor only)
 - `DELETE /api/doctors/availability/:id` (doctor only)

 **Integration plan:**

 - On mount (doctor role):
   - Call `GET /api/doctors/availability`.
   - Populate schedule table from response.
 - On “+ Add Interval”:
   - Send `POST /api/doctors/availability` with UI values.
   - Refresh list.
 - On “Remove”:
   - Call `DELETE /api/doctors/availability/:id`.
   - Remove from state.

 ---

 ### 5.2 Doctor Appointments → `/api/appointments/doctor`

 **Backend route:**

 - `GET /api/appointments/doctor?date=YYYY-MM-DD` (doctor only)
   - Uses JWT → `doctor_id`.
   - Joins `Appointment`, `Slot`, `Patients`, `Users`.
   - Returns:
     - `appointment_id`
     - `patient_name`, `phone_number`, `insurance_number`
     - `date`, `start_time`, `end_time`
     - `duration`, `reason_for_visit`, `status`

 **Integration plan:**

 - On mount:
   - Default `date` to today.
   - Call `GET /api/appointments/doctor?date=<today>`.
 - Optionally:
   - Add date picker and refetch when changed.

 ---

 ### 5.3 Update Appointment Status → `/api/appointments/:id/status`

 **Backend route:**

 - `PATCH /api/appointments/:id/status` (doctor only)
   - Body: `{ status }`
   - Valid values: `Pending`, `Confirmed`, `Completed`, `Cancelled`
   - Ensures this appointment belongs to the doctor

 **Integration plan:**

 - Hook status `<select>` change handler to:
   - Call `PATCH /api/appointments/${id}/status` with new status.
   - Update local appointment state on success.

 ---

 ### 5.4 Medical Reports → `/api/reports`

 **Backend routes:**

 - `POST /api/reports` (doctor only)
   - Body: `appointment_id`, `diagnosis`, `treatment_plan`
   - Checks:
     - Appointment exists
     - Appointment belongs to this doctor
   - Creates `Medical_Report` and sets appointment status to `Completed`.

 - `GET /api/reports/:appointmentId` (doctor or patient)
   - Returns:
     - `report_id`, `appointment_id`
     - `diagnosis`, `treatment_plan`
   - Access allowed if:
     - Current user is the doctor on that appointment, or
     - The patient on that appointment

 **Integration plan (optional extension):**

 - In `DoctorDashboard`:
   - Add “Create Report” button for eligible appointments:
     - Opens modal, posts to `/api/reports`.
   - Add “View Report” to fetch report data and display it.
 - In patient appointment page:
   - Add “View Medical Report” link calling `GET /api/reports/:appointmentId`.

 ---

 ## 6. Admin Flow

 **UIs:**

 - `frontend/src/pages/AdminLogin.js`
 - `frontend/src/pages/AdminDashboard.js`

 ### 6.1 Manage Doctors → `/api/admin/doctors`

 **Backend routes:**

 - `GET /api/admin/doctors` (admin only)
   - Joins `Doctor`, `Users`, `Department`.
 - `POST /api/admin/doctors` (admin only)
   - Body:
     - `username`, `email`, `password`
     - `phone_number`, `date_of_birth`, `address`, `gender`
     - `department_id`, `specialization`, `license_number`, `years_of_experience`
   - Creates new `Users` row (role = `doctor`) + `Doctor` row.
 - `PATCH /api/admin/doctors/:id` (admin only)
 - `DELETE /api/admin/doctors/:id` (admin only)

 **Integration plan:**

 - In `AdminDashboard`:
   - On mount: `GET /api/admin/doctors`, populate “Doctors in Hospital” table.
   - “+ Add Doctor” modal:
     - Collect all required fields.
     - Call `POST /api/admin/doctors`.
     - Append returned doctor to table.
   - “Remove” button:
     - Call `DELETE /api/admin/doctors/:id`.
     - Remove row on success.

 ---

 ### 6.2 Departments Management → `/api/departments`

 **Backend routes:**

 - `GET /api/departments`
 - `POST /api/departments` (admin only)
 - `PATCH /api/departments/:id` (admin only)
 - `DELETE /api/departments/:id` (admin only)

 **Integration plan:**

 - Either:
   - New page `AdminDepartments` for department CRUD, or
   - A section in `AdminDashboard`:
     - List departments from `GET /api/departments`.
     - Form to create new via `POST`.
     - Edit/delete controls using `PATCH` and `DELETE`.

 ---

 ## 7. Recommended Implementation Order

 Suggested sequence for implementation:

 1. **API Client & Auth Helpers**
    - Implement `src/api/client.js` with token-aware `GET`/`POST`.
    - Add simple auth helpers to access `token` + `user`.

 2. **Auth Integration**
    - Wire `Register.js` to `POST /api/auth/register`.
    - Wire `Login.js` and `AdminLogin.js` to `POST /api/auth/login` with role-based redirects.

 3. **Patient Dashboard**
    - Replace dummy state in `UserDashboard.js` with `GET/PATCH /api/patient/me`.

 4. **Booking Flow**
    - In `Service.js`:
      - Fetch doctors via `/api/doctors`.
      - Fetch available slots via `/api/slots/available`.
      - Book via `POST /api/appointments`.

 5. **Patient Appointment Dashboard**
    - Connect `AppointmentDashboard` to `GET /api/appointments/my`.
    - Add cancel support once backend endpoint is defined.

 6. **Doctor Dashboard**
    - Availability → `/api/doctors/availability`.
    - Appointments list → `/api/appointments/doctor`.
    - Status changes → `/api/appointments/:id/status`.
    - (Optional) Integrate medical reports.

 7. **Admin Dashboard**
    - Doctors management → `/api/admin/doctors`.
    - (Optional) Departments management → `/api/departments`.

 8. **Route Guards & Polishing**
    - Add auth context and protected routes by role.
    - Improve error handling, loading indicators, and UX polish across pages.

