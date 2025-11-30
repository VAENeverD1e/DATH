# API Client Module

Central HTTP client for making authenticated requests to the backend API.

## Features

- ✅ Token-aware authentication (reads JWT from storage)
- ✅ Centralized error handling
- ✅ Support for GET, POST, PATCH, DELETE methods
- ✅ localStorage/sessionStorage management for auth state
- ✅ Configurable base URL via `REACT_APP_API_BASE_URL`

## Usage

### Basic HTTP Calls

```javascript
import { apiGet, apiPost, apiPatch, apiDelete } from './api/client';

// GET request
const doctors = await apiGet('/api/doctors');

// POST request
const result = await apiPost('/api/auth/login', { email, password });

// Authenticated requests (includes Authorization header)
const profile = await apiGet('/api/patient/me', { auth: true });
const updated = await apiPatch('/api/patient/me', { phone_number }, { auth: true });

// DELETE request
await apiDelete('/api/doctors/availability/123', { auth: true });
```

### Auth Management

```javascript
import { getAuth, setAuth, clearAuth } from './api/client';

// Get current auth state
const { token, user } = getAuth();
if (token && user) {
  console.log(`Logged in as ${user.username} (${user.role})`);
}

// Save auth after login (with "Remember me")
setAuth({ token: 'jwt-token', user: { id: 1, role: 'patient' } }, true);

// Clear auth on logout
clearAuth();
```

## Storage Strategy

- **localStorage**: Used when "Remember me" is checked (persistent across browser sessions)
- **sessionStorage**: Used otherwise (cleared when browser closes)
- **Fallback**: If localStorage has no value, checks sessionStorage

## Configuration

Set the base URL via environment variable in `.env`:

```
REACT_APP_API_BASE_URL=http://localhost:4000
```

Default is `http://localhost:4000` if not set.

## Error Handling

All methods throw `Error` on failure with backend error message:

```javascript
try {
  await apiPost('/api/auth/login', { email, password });
} catch (error) {
  console.error(error.message); // Prints backend error or "Request failed"
}
```

## Methods

### `getAuth()`
- **Returns**: `{ token: string | null, user: object | null }`
- Retrieves stored auth from localStorage or sessionStorage

### `setAuth(auth, rememberMe)`
- **Parameters**:
  - `auth`: `{ token: string, user: object }`
  - `rememberMe`: boolean (default: false)
- Saves auth to localStorage (if `rememberMe=true`) or sessionStorage

### `clearAuth()`
- Clears auth from both storages

### `apiGet(path, options)`
- **Parameters**:
  - `path`: string (e.g., '/api/doctors')
  - `options.auth`: boolean (include Authorization header)
- **Returns**: Promise<object>

### `apiPost(path, body, options)`
- **Parameters**:
  - `path`: string
  - `body`: object (request body)
  - `options.auth`: boolean
- **Returns**: Promise<object>

### `apiPatch(path, body, options)`
- **Parameters**:
  - `path`: string
  - `body`: object (request body)
  - `options.auth`: boolean
- **Returns**: Promise<object>

### `apiDelete(path, options)`
- **Parameters**:
  - `path`: string
  - `options.auth`: boolean
- **Returns**: Promise<object>
