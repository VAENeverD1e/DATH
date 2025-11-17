# 🛠️ API PlayGround Guide

Welcome to the **API PlayGround**! This is an interactive testing tool for your Supabase backend. You can test all CRUD operations without writing code.

## 🚀 Quick Start

1. Navigate to `/api-playground` in your application
2. Click **"Test Connection"** to verify Supabase is connected
3. Use the tabs to switch between different modules (Users, Doctors, Appointments, Time Slots)
4. Test API endpoints and see real-time responses

---

## 📊 Available Modules

### 1. **Users Module**
Test user-related operations:
- **Fetch All Users** - Retrieve all users from the database
- **Create User** - Add a new user with email, name, and password

**Form Fields:**
- `Email` - User email address
- `Name` - User full name
- `Password` - User password

**Example Data:**
```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "password": "secure123"
}
```

---

### 2. **Doctors Module**
Test doctor profile operations:
- **Fetch All Doctors** - Retrieve all doctors
- **Create Doctor** - Add a new doctor profile

**Form Fields:**
- `Name` - Doctor full name
- `Specialization` - Medical specialty (e.g., "Cardiology")
- `License Number` - Medical license
- `Consultation Fee` - Fee amount (numeric)

**Example Data:**
```json
{
  "name": "Dr. Sarah Smith",
  "specialization": "Cardiology",
  "licenseNumber": "LIC123456",
  "consultationFee": 150.00
}
```

---

### 3. **Appointments Module**
Test appointment booking operations:
- **Fetch All Appointments** - Retrieve all appointments
- **Create Appointment** - Book a new appointment

**Form Fields:**
- `Patient ID` - ID of the patient
- `Doctor ID` - ID of the doctor
- `Appointment Date` - Date of appointment (YYYY-MM-DD)
- `Time Start` - Start time (HH:MM)
- `Time End` - End time (HH:MM)
- `Reason` - Reason for visit

**Example Data:**
```json
{
  "patientId": "1",
  "doctorId": "1",
  "appointmentDate": "2025-02-20",
  "timeStart": "14:00",
  "timeEnd": "14:30",
  "reason": "Regular checkup",
  "status": "pending"
}
```

---

### 4. **Time Slots Module**
Test doctor availability:
- **Fetch All Time Slots** - Retrieve available time slots

---

## 🔗 How to Connect Your Supabase Project

### Step 1: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and log in
2. Select your project
3. Click **Settings** → **API**
4. Copy:
   - **Project URL** (e.g., `https://yourproject.supabase.co`)
   - **Anon Public Key** (the long JWT token)

### Step 2: Create `.env` File

In your project root, create a `.env` file (it should already exist):

```env
REACT_APP_SUPABASE_URL=https://yourproject.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_public_key_here
```

### Step 3: Restart Development Server

```bash
npm start
```

---

## 📋 Supabase Table Structure Reference

Your Supabase should have these tables. If they don't exist, create them:

### `users` Table
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  avatar_url TEXT
);
```

### `doctors` Table
```sql
CREATE TABLE doctors (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  consultation_fee DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

### `appointments` Table
```sql
CREATE TABLE appointments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  patient_id BIGINT REFERENCES users(id),
  doctor_id BIGINT REFERENCES doctors(id),
  appointment_date DATE NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);
```

### `time_slots` Table
```sql
CREATE TABLE time_slots (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  doctor_id BIGINT REFERENCES doctors(id),
  day_of_week TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 🎯 Common Testing Scenarios

### Scenario 1: Create a User and Doctor, Then Book an Appointment

1. **Users Tab** → Enter email, name, password → Click "✨ Create User"
2. **Doctors Tab** → Enter doctor info → Click "✨ Create Doctor"
3. **Appointments Tab** → Use the IDs from previous steps → Click "✨ Create Appointment"

### Scenario 2: View All Data

1. Switch between tabs and click "📋 Fetch All..." buttons to see your data
2. Response appears in the right panel as formatted JSON

### Scenario 3: Debug Connection Issues

1. Click "Test Connection" at the top
2. If you see ✅, Supabase is connected
3. If you see ❌, check:
   - Your `.env` file has correct credentials
   - Supabase project is active
   - Network connection is working

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection failed" | Check SUPABASE_URL and SUPABASE_ANON_KEY in .env |
| "Table not found" | Create the missing table in Supabase dashboard |
| "Permission denied" | Check your Row Level Security (RLS) policies in Supabase |
| "CORS error" | Ensure Supabase URL is added to allowed origins |

---

## 🔐 Security Notes

⚠️ **This is a development tool only!**

- The Anon Public Key is meant for development
- Never commit `.env` file with real credentials to GitHub
- In production, use proper authentication and authorization
- Enable Row Level Security (RLS) policies on your tables

---

## 📚 Next Steps

After testing with APIPlayGround:

1. Create proper authentication flows
2. Build UI components for each module
3. Add role-based access control
4. Implement form validation
5. Deploy to production

---

## 💡 Tips

- Use the browser's **DevTools Console** (F12) to see detailed error messages
- Check **Supabase Logs** in the dashboard for backend errors
- Start with simple queries (fetch all) before creating data
- Test with sample data to understand the API before building UI

---

**Happy testing! 🎉**
