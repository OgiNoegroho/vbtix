# 🔧 Debug Deployment Steps

## Current Issue
Your `/api/test-db` endpoint is returning HTML instead of JSON, which suggests either:
1. The API route is not accessible (middleware blocking)
2. Environment variables are missing in Vercel
3. The route is not properly deployed

## Fixes Applied

### 1. ✅ Fixed Middleware Routing
- Added `/api/test-db` and `/api/health` to public routes in `src/middleware.ts`
- These endpoints no longer require authentication

### 2. ✅ Enhanced Error Handling
- Improved the `/api/test-db` route with better logging and error messages
- Added a new `/api/health` endpoint for basic API testing

### 3. ✅ Added Debug Tools
- Created an API health check component
- Enhanced the debug page with step-by-step testing

## Next Steps for You

### Step 1: Deploy the Changes
1. Commit and push these changes to your repository
2. Wait for Vercel to automatically redeploy
3. Or manually trigger a redeploy in Vercel dashboard

### Step 2: Test the Health Endpoint First
1. Go to: `https://vbticket.vercel.app/api/health`
2. You should see a JSON response like:
```json
{
  "success": true,
  "message": "API is healthy",
  "environment": {
    "NODE_ENV": "production",
    "DATABASE_URL_EXISTS": true,
    "NEXTAUTH_SECRET_EXISTS": true,
    "VERCEL": true,
    "VERCEL_ENV": "production"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123
}
```

### Step 3: Check Environment Variables
If the health endpoint shows `DATABASE_URL_EXISTS: false`, you need to:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Ensure these are set:
   ```
   DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   DIRECT_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
   NEXTAUTH_SECRET=your-secret-here
   NEXTAUTH_URL=https://vbticket.vercel.app
   ```
3. **Redeploy** after setting environment variables

### Step 4: Test Database Connection
1. Go to: `https://vbtix.vercel.app/debug`
2. Click "Test API Health" first - should succeed
3. Click "Test Database Connection" - should now work

### Step 5: Check Vercel Function Logs
If still having issues:
1. Go to **Vercel Dashboard** → Your Project → **Functions**
2. Click on the failing function
3. Check the logs for detailed error messages

## Common Issues & Solutions

### Issue: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
**Cause**: API route is returning HTML error page instead of JSON
**Solution**: 
- Check if route is properly deployed
- Verify environment variables are set
- Check Vercel function logs

### Issue: Environment variables not found
**Cause**: Variables not set in Vercel or not redeployed after setting
**Solution**:
- Set variables in Vercel dashboard
- Redeploy the application
- Check variable names match exactly

### Issue: Database connection timeout
**Cause**: Incorrect Supabase URLs or Supabase project paused
**Solution**:
- Verify Supabase URLs from dashboard
- Check if Supabase project is active
- Use connection pooling URL for DATABASE_URL

## Testing URLs

After deployment, test these URLs directly:

1. **Health Check**: `https://vbtix.vercel.app/api/health`
2. **Database Test**: `https://vbtix.vercel.app/api/test-db`
3. **Debug Page**: `https://vbtix.vercel.app/debug`

## Expected Results

### Healthy API Response:
```json
{
  "success": true,
  "message": "API is healthy",
  "environment": { ... }
}
```

### Successful Database Response:
```json
{
  "success": true,
  "userCount": 0,
  "environment": { ... },
  "message": "Database connection successful"
}
```

If you're still getting HTML responses after these fixes, the issue is likely with environment variables or Vercel deployment configuration.
