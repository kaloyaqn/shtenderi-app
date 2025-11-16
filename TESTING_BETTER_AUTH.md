# Better Auth Migration - Testing Checklist

## ✅ Authentication Flow

### 1. Login
- [ ] Login with existing user credentials
- [ ] Verify session is created (check browser DevTools > Application > Cookies)
- [ ] Verify user is redirected to `/dashboard` after login
- [ ] Check that user data (id, email, name, role) is correct in session

### 2. Session Persistence
- [ ] Refresh the page - session should persist
- [ ] Close and reopen browser tab - session should persist (if cookies are set correctly)
- [ ] Check session expiration (should be ~24 hours)

### 3. Logout
- [ ] Click logout button
- [ ] Verify session is cleared
- [ ] Verify redirect to `/login`
- [ ] Try accessing `/dashboard` directly - should redirect to login

### 4. Protected Routes
- [ ] Access `/dashboard` without login - should redirect to `/login`
- [ ] Access `/dashboard/products` without login - should redirect to `/login`
- [ ] Access `/dashboard/users` without login - should redirect to `/login`
- [ ] All protected API routes should return 401 if not authenticated

## ✅ API Routes Testing

### 5. API Authentication
Test that all API routes properly check authentication:
- [ ] `/api/dashboard` - requires auth
- [ ] `/api/products` - requires auth
- [ ] `/api/users` - requires auth
- [ ] `/api/transfers` - requires auth
- [ ] `/api/deliveries` - requires auth
- [ ] `/api/revisions` - requires auth
- [ ] Any other protected API routes

### 6. User Role Testing
- [ ] Login as ADMIN user - verify admin-only pages are accessible
- [ ] Login as regular USER - verify admin-only pages are blocked/hidden
- [ ] Check that role is correctly passed to API routes

## ✅ Multiple Users

### 7. Different User Accounts
- [ ] Login with user 1, logout, login with user 2
- [ ] Verify sessions don't conflict
- [ ] Verify each user sees their own data

## ✅ Edge Cases

### 8. Invalid Credentials
- [ ] Try login with wrong password - should show error
- [ ] Try login with non-existent email - should show error
- [ ] Try login with empty fields - should show validation error

### 9. Session Expiration
- [ ] Wait for session to expire (or manually expire in DB)
- [ ] Try accessing protected route - should redirect to login
- [ ] Session should refresh automatically on activity (if configured)

### 10. Browser Compatibility
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test on mobile browser

## ✅ Database Verification

### 11. Account Records
- [ ] Verify all users have Account records in database
- [ ] Check that Account records have correct `providerId: "credential"`
- [ ] Verify passwords are stored correctly in Account table

### 12. Session Records
- [ ] Check Session table in database
- [ ] Verify sessions are created on login
- [ ] Verify sessions are deleted on logout

## ✅ Performance

### 13. Load Testing
- [ ] Multiple simultaneous logins
- [ ] Rapid page navigation
- [ ] Multiple API calls in parallel

## Quick Test Commands

```bash
# Check Account records
npx prisma studio
# Then navigate to Account table and verify records exist

# Check Session records
# In Prisma Studio, check Session table

# Test API endpoint directly
curl -X GET http://localhost:3000/api/dashboard \
  -H "Cookie: better-auth.session_token=YOUR_SESSION_TOKEN"
```

## What to Look For

### ✅ Success Indicators:
- Login works without errors
- Session persists across page refreshes
- Protected routes redirect to login when not authenticated
- User role is correctly applied
- All API routes return proper auth errors when not logged in
- Logout clears session and redirects

### ❌ Red Flags:
- 404 errors on auth endpoints
- Session not persisting
- Users can access admin pages without admin role
- API routes accessible without authentication
- Multiple sessions for same user causing conflicts
- Cookies not being set/cleared properly

