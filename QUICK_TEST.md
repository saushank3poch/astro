# 🚀 Quick Test - Get Running in 5 Minutes

## One-Command Setup

```bash
cd /home/user/astro
./start-dev.sh
```

This will:
- ✅ Check Node.js is installed
- ✅ Install all dependencies
- ✅ Generate Prisma client
- ✅ Optionally push database schema
- ✅ Optionally seed test data

## Manual Quick Start (If Script Doesn't Work)

### 1. Install Dependencies (1 minute)

```bash
cd /home/user/astro/apps/api
npm install

cd ../web
npm install
```

### 2. Setup Database (1 minute)

**If you have PostgreSQL running locally:**

```bash
# Create database
createdb astro

# Update DATABASE_URL in apps/api/.env
# Change to: postgresql://localhost:5432/astro
```

**If you need PostgreSQL:**

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL
sudo service postgresql start

# Create user and database
sudo -u postgres createuser astro
sudo -u postgres createdb astro
sudo -u postgres psql -c "ALTER USER astro WITH PASSWORD 'astro';"
```

### 3. Initialize Database (1 minute)

```bash
cd /home/user/astro/apps/api

# Generate Prisma Client
npm run db:generate

# Create tables
npm run db:push

# Add test data (optional but recommended)
npm run db:seed
```

### 4. Start Backend API (30 seconds)

```bash
cd /home/user/astro/apps/api
npm run dev
```

You should see:
```
✓ Server running on http://localhost:3001
✓ Database connected
✓ Routes registered
```

### 5. Start Frontend (30 seconds)

**Open a new terminal:**

```bash
cd /home/user/astro/apps/web
npm run dev
```

You should see:
```
▲ Next.js running on http://localhost:3000
```

### 6. Open Browser

Go to: **http://localhost:3000**

You should see the Astro landing page! 🎉

## Quick Test Checklist

### ✅ Homepage Loads
- [ ] Visit http://localhost:3000
- [ ] See cosmic-themed landing page
- [ ] See "Connect Phantom", "Connect MetaMask", "Sign Up" buttons

### ✅ Sign Up Works
- [ ] Click "Sign Up"
- [ ] Enter email: `test@astro.com`
- [ ] Enter password: `test123`
- [ ] Enter name: `Test User`
- [ ] Click "Sign Up"
- [ ] Redirect to dashboard

### ✅ Dashboard Shows
- [ ] See welcome message with your name
- [ ] See credit balance (should be 5 if seeded, or welcome bonus)
- [ ] See quick action buttons
- [ ] See navbar with Predictions, Compatibility, Profile tabs

### ✅ Profile Creation
- [ ] Click "Profile" in navbar
- [ ] Fill in birth info:
  - Date: `1990-01-15`
  - Time: `14:30`
  - Location: `New York, NY`
- [ ] Click Save
- [ ] See Chinese astrology (Zodiac animal, elements)
- [ ] See Western astrology (Sun/Moon/Rising signs)

### ✅ Generate Prediction
- [ ] Click "Predictions" in navbar
- [ ] Click "Macro Prediction"
- [ ] Select year: `2025`
- [ ] Check some asset classes
- [ ] Click "Generate Prediction"
- [ ] See processing animation
- [ ] See results with scores

### ✅ Check Compatibility
- [ ] Click "Compatibility" in navbar
- [ ] See list of compatible assets (if profile complete)
- [ ] Click on an asset
- [ ] See compatibility score gauge
- [ ] See element harmony diagram

## Test Credentials (If Database Seeded)

**User Accounts:**
- Email: `alice@example.com`, Password: `password123`
- Email: `bob@example.com`, Password: `password123`
- Email: `charlie@example.com`, Password: `password123`

All have:
- 10 credits
- Complete birth charts
- Different zodiac signs

## Troubleshooting

### Can't Connect to Database

```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL
sudo service postgresql start

# Test connection
psql -h localhost -U postgres -d astro
```

### Port Already in Use

```bash
# API (port 3001)
lsof -i :3001
kill -9 <PID>

# Web (port 3000)
lsof -i :3000
kill -9 <PID>
```

### Prisma Errors

```bash
cd /home/user/astro/apps/api

# Regenerate client
npm run db:generate

# Reset database (WARNING: deletes all data)
npm run db:push -- --force-reset
```

### Module Not Found Errors

```bash
# Reinstall dependencies
cd /home/user/astro/apps/api
rm -rf node_modules package-lock.json
npm install

cd ../web
rm -rf node_modules package-lock.json
npm install
```

## What to Test Next

Once basic functionality works, test:

1. **Credits System**
   - Check navbar shows credits
   - Make predictions to use credits
   - Credits decrease after each prediction

2. **Crypto Payments** (requires wallet)
   - Connect Phantom or MetaMask
   - Go to /credits/purchase
   - Test purchase flow

3. **Feedback System**
   - Generate a prediction
   - Wait 10 seconds
   - Rate the prediction
   - Check if feedback saved

4. **Admin Dashboard** (set user as admin first)
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'test@astro.com';
   ```
   - Visit /admin
   - Check overview stats
   - View AI costs, performance, errors

## Environment Check

```bash
# Check Node version (should be 18+)
node --version

# Check npm version
npm --version

# Check if ports are available
netstat -tuln | grep 3000
netstat -tuln | grep 3001

# Check if PostgreSQL is running
pg_isready

# Check database exists
psql -l | grep astro
```

## Next Steps

After local testing works:

1. ✅ Test all prediction types (macro, timing, divination)
2. ✅ Test compatibility matching
3. ✅ Test admin dashboard
4. ✅ Test feedback system
5. ✅ Test with different user accounts
6. ✅ Test error scenarios (invalid inputs, network errors)
7. 🚀 Deploy to production

## Getting Help

If stuck:
1. Check `TESTING_GUIDE.md` for detailed instructions
2. Check API logs in terminal
3. Check browser console for frontend errors
4. Check `apps/api/README.md` for API documentation
5. Use Prisma Studio to view database: `npm run db:studio`

---

Happy Testing! 🎉🔮
