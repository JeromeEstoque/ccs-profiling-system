# CCS Management System - Deployment Checklist

## Phase 1: Database Setup (Supabase) - 15 minutes

### [ ] Create Supabase Project
- Go to https://supabase.com
- Sign up/login
- Click "Start your project"
- Choose organization (create if needed)
- Project name: `ccs-management-system`
- Database password: Generate strong password
- Region: Choose closest to your users
- Click "Create new project"

### [ ] Get Database Credentials
- Go to Settings > Database
- Copy the connection string
- Note these values:
  - Host: `xxxx.supabase.co`
  - Port: `5432`
  - User: `postgres`
  - Password: (your generated password)
  - Database: `postgres`

### [ ] Run Database Schema
- Go to SQL Editor in Supabase dashboard
- Copy and paste contents of `database/supabase_schema.sql`
- Click "Run" to execute
- Verify all tables are created

---

## Phase 2: Backend Deployment (Railway) - 20 minutes

### [ ] Create Railway Project
- Go to https://railway.app
- Sign up/login with GitHub
- Click "New Project" > "Deploy from GitHub repo"
- Select your repository: `Jayvee-binas/ccs-management-system`
- Select branch: `feature/production-deployment`
- Set root directory: `backend`
- Click "Deploy Now"

### [ ] Configure Environment Variables
In Railway dashboard > your project > Variables:
```
NODE_ENV=production
PORT=5000
DB_HOST=your-project.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-supabase-password
DB_NAME=postgres
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-vercel-app.vercel.app
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### [ ] Deploy Backend
- Railway will automatically redeploy with new variables
- Wait for deployment to complete
- Test health check: `https://your-app.railway.app/api/health`
- Copy your Railway URL for next step

---

## Phase 3: Frontend Deployment (Vercel) - 15 minutes

### [ ] Create Vercel Project
- Go to https://vercel.com
- Sign up/login with GitHub
- Click "New Project" > "Import GitHub Repository"
- Select repository: `Jayvee-binas/ccs-management-system`
- Select branch: `feature/production-deployment`
- Set root directory: `frontend`
- Framework preset: `Create React App`

### [ ] Configure Environment Variables
In Vercel dashboard > your project > Settings > Environment Variables:
```
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```

### [ ] Deploy Frontend
- Click "Deploy"
- Wait for build to complete
- Test frontend: `https://your-app.vercel.app`

---

## Phase 4: Final Configuration - 10 minutes

### [ ] Update CORS Settings
- In Railway, update `FRONTEND_URL` to actual Vercel domain
- Redeploy backend

### [ ] Test Complete System
- Test user registration/login
- Test dashboard access
- Test all major features
- Verify file uploads work

---

## URLs You'll Need

### Supabase
- Dashboard: `https://app.supabase.com`
- Project URL: `https://your-project.supabase.co`

### Railway
- Dashboard: `https://railway.app`
- Backend URL: `https://your-app.railway.app`
- Health check: `https://your-app.railway.app/api/health`

### Vercel
- Dashboard: `https://vercel.com/dashboard`
- Frontend URL: `https://your-app.vercel.app`

---

## Troubleshooting

### Common Issues & Solutions

1. **CORS Errors**
   - Ensure `FRONTEND_URL` in Railway matches Vercel domain exactly
   - Include https:// and no trailing slash

2. **Database Connection Failed**
   - Verify Supabase credentials are correct
   - Check Supabase project is active
   - Ensure database schema was applied

3. **Build Failures**
   - Check package.json dependencies
   - Verify build scripts are correct
   - Review deployment logs

4. **404 Errors**
   - Ensure API URLs are correct in environment variables
   - Check backend routes are properly configured

5. **Authentication Issues**
   - Verify JWT_SECRET is set in Railway
   - Check token expiration settings

---

## Cost Summary (Monthly)

### Free Tier Limits
- **Supabase**: 500MB database, 2GB bandwidth
- **Railway**: $5/month after free credits
- **Vercel**: Free for personal projects

### Estimated Production Costs
- **Supabase Pro**: $25/month
- **Railway**: $5-20/month
- **Vercel Pro**: $20/month
- **Total**: $50-65/month

---

## Post-Deployment Checklist

### [ ] Security
- Change default passwords
- Set up SSL (handled automatically)
- Configure backup strategies
- Review environment variables

### [ ] Performance
- Monitor load times
- Set up analytics
- Configure CDN settings
- Optimize database queries

### [ ] Maintenance
- Set up monitoring alerts
- Configure log management
- Plan regular updates
- Document processes

---

## Emergency Contacts

- **Supabase Support**: https://supabase.com/support
- **Railway Support**: https://docs.railway.app/support
- **Vercel Support**: https://vercel.com/support

---

## Success Criteria

- [ ] Backend health check returns 200 OK
- [ ] Frontend loads without errors
- [ ] User authentication works
- [ ] Database operations successful
- [ ] File uploads functional
- [ ] All major features tested

**Estimated Total Time: 1 hour**
