# JWT Authentication Implementation Plan

## Backend Changes

### 1. Install Dependencies
- bcryptjs (password hashing)
- jsonwebtoken (JWT generation/verification)
- cookie-parser (httpOnly cookies)
- uuid (UUID generation for users)

### 2. Database Schema (schema.sql)
- Add `users` table with:
  - id (UUID, primary key)
  - name (VARCHAR, not null)
  - email (VARCHAR, unique, not null)
  - password_hash (TEXT, not null)
  - role (ENUM: 'student', 'recruiter', 'officer')
  - created_at (TIMESTAMP)

### 3. Create Middleware (server/middleware/)
- authMiddleware.js: Verify JWT from cookie, attach user to req
- roleMiddleware.js: requireRole(...roles) functions

### 4. Create Auth Routes (server/routes/)
- auth.js: POST /auth/signup, POST /auth/login, POST /auth/logout, GET /auth/me

### 5. Update Existing Routes
- Protect routes based on user role
- students.js: requireRole('student') or allow all authenticated users
- recruiter('recruiter.js: requireRole')
- analytics.js: requireRole('officer')

### 6. Update server/index.js
- Add cookie-parser middleware
- Mount auth routes
- Configure CORS for cookies

## Frontend Changes

### 1. Install Dependencies
- js-cookie (handle httpOnly cookies on client)
- @tanstack/react-query (optional, for state management)

### 2. Create Auth Context (client/src/context/)
- AuthContext.jsx: Provide user, login, logout, isAuthenticated

### 3. Create Login/Signup Pages (client/src/pages/auth/)
- LoginPage.jsx
- SignupPage.jsx

### 4. Update API Client (client/src/api/index.js)
- Add request interceptor for JWT
- Handle auth errors (401 → redirect to login)

### 5. Update App.jsx
- Add routes for /login, /signup
- Protect routes based on role
- Redirect to appropriate dashboard after login

## Security Considerations
- Use httpOnly, secure cookies for JWT
- Set cookie domain and path
- Implement token refresh mechanism (future)
- Hash passwords with bcrypt (10 rounds)

