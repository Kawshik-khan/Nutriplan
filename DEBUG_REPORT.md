# Nutriplan Project - Debugging Report

**Generated:** April 17, 2026  
**Project Location:** `D:\Softwear Project\Unvisersity_project\nutriplan`

---

## 📋 Executive Summary

**Nutriplan** is a full-stack diet tracking application with a multi-app architecture consisting of:
- **Root Launcher:** Next.js 16 app serving as a hub
- **Landing Page:** Vite-based React 18 app for marketing/auth (port 5173)
- **Dashboard:** Vite-based React 18 app for user features (port 5174)
- **Backend:** Express.js API with SQLite database (port 4000)

---

## 🐛 Critical Issues Found

### 1. **SECURITY: Weak JWT_SECRET** ⚠️ CRITICAL
**Location:** `backend/.env`

```env
JWT_SECRET="replace-with-a-long-random-secret"
```

**Problem:** The JWT secret is using a placeholder value, making token forgery trivial.

**Fix:**
```bash
# Generate a secure random secret (run in PowerShell)
$secret = -join ((48..57) + (65..90) + (97..122) + (33..47) | Get-Random -Count 64 | % {[char]$_})
Write-Host "JWT_SECRET=`"$secret`""
```

Then update `backend/.env` with the generated secret.

---

### 2. **MISSING: OPENAI_API_KEY** ⚠️ HIGH
**Location:** `backend/.env`

**Problem:** AI features (meal recommendations, nutrition insights, shopping lists) will fail because `OPENAI_API_KEY` is not defined.

**Error you'll see:**
```
AI Meal Recommendation Error: Error: Missing OpenAI API key
```

**Fix:**
```env
# Add to backend/.env
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

**Note:** If you don't have an OpenAI API key, the app has fallback functions that will still work, but without AI-generated content.

---

### 3. **VERSION MISMATCH: React Versions** ⚠️ MEDIUM
**Problem:** The root app uses React 19, while the dashboard and landing apps use React 18.3.1.

| App | React Version |
|-----|---------------|
| Root (Next.js) | 19.2.4 |
| Dashboard | 18.3.1 |
| Landing Page | 18.3.1 |

**Potential Impact:**
- Hydration mismatches if sharing components
- Different behavior in development
- Type conflicts if sharing types

**Fix Options:**
1. **Recommended:** Downgrade root app to React 18 for consistency
   ```bash
   cd "D:\Softwear Project\Unvisersity_project\nutriplan"
   npm install react@18.3.1 react-dom@18.3.1
   ```

2. Or upgrade dashboard/landing to React 19 (may break dependencies)

---

### 4. **DATABASE: SQLite File Location** ⚠️ LOW
**Location:** `backend/.env`

```env
DATABASE_URL="file:./dev.db"
```

**Problem:** The database file location is relative. Ensure the `backend/` directory is writable.

**Fix:** Use absolute path for production:
```env
DATABASE_URL="file:C:/Users/Kawshik Khan/dev.db"
```

---

## 🔧 Setup Instructions (To Get Running)

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager

### Step 1: Install Dependencies

```powershell
# Root app
cd "D:\Softwear Project\Unvisersity_project\nutriplan"
npm install

# Backend
cd "D:\Softwear Project\Unvisersity_project\nutriplan\backend"
npm install

# Dashboard
cd "D:\Softwear Project\Unvisersity_project\nutriplan\Nutriplan-main"
npm install

# Landing Page
cd "D:\Softwear Project\Unvisersity_project\nutriplan\Nutriplanlandingpage-main"
npm install
```

### Step 2: Configure Environment Variables

Create `backend/.env` with:
```env
PORT=4000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-64-character-random-secret-here-generate-this-properly"
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
OPENAI_API_KEY=""  # Optional - leave empty if you don't have one
```

### Step 3: Initialize Database

```powershell
cd "D:\Softwear Project\Unvisersity_project\nutriplan\backend"
npx prisma generate
npx prisma migrate dev --name init
```

### Step 4: Start All Services

Open 4 separate terminal windows:

**Terminal 1 - Backend:**
```powershell
cd "D:\Softwear Project\Unvisersity_project\nutriplan"
npm run dev:backend
```

**Terminal 2 - Landing Page:**
```powershell
cd "D:\Softwear Project\Unvisersity_project\nutriplan"
npm run dev:landing
```

**Terminal 3 - Dashboard:**
```powershell
cd "D:\Softwear Project\Unvisersity_project\nutriplan"
npm run dev:dashboard
```

**Terminal 4 - Root App (Optional):**
```powershell
cd "D:\Softwear Project\Unvisersity_project\nutriplan"
npm run dev
```

---

## 📁 Project Structure

```
nutriplan/
├── app/                          # Next.js root app (launcher)
│   ├── page.tsx                  # Hub page with links to all services
│   └── layout.tsx
├── backend/                      # Express.js API
│   ├── src/
│   │   ├── server.js             # Main server (516 lines)
│   │   ├── config.js             # Environment config
│   │   ├── db.js                 # Prisma client
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT auth middleware
│   │   ├── services/
│   │   │   └── ai-service.js     # OpenAI integration
│   │   └── utils/
│   │       ├── jwt.js            # JWT utilities
│   │       └── password.js       # bcrypt password hashing
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   └── .env                      # Environment variables
├── Nutriplan-main/                 # Dashboard Vite app
│   ├── src/
│   │   ├── app/App.tsx           # Main dashboard app
│   │   └── test/setup.ts         # Test configuration
│   └── vite.config.ts
├── Nutriplanlandingpage-main/      # Landing page Vite app
│   └── src/app/App.tsx           # Landing/auth app
├── package.json                  # Root dependencies
└── next.config.ts                # Next.js config
```

---

## 🗄️ Database Schema

The SQLite database includes the following models:

### User
- `id`, `fullName`, `email`, `passwordHash`
- `age`, `heightCm`, `weightKg`
- `goal`, `preferences` (JSON string), `allergies` (JSON string)
- Timestamps: `createdAt`, `updatedAt`

### Meal
- `id`, `userId` (FK), `mealType`, `title`, `image`
- Nutrition: `proteinG`, `carbsG`, `fatG`, `calories`
- `tags` (JSON string), `eatenAt`

### NutritionStat
- Daily nutrition tracking per user
- Fields: `caloriesGoal/Taken`, `proteinGoalG/TakenG`, `carbsGoalG/TakenG`, `fatsGoalG/TakenG`
- Unique constraint on `[userId, date]`

### WaterLog
- `id`, `userId` (FK), `amountMl`, `loggedAt`

### WeightLog
- `id`, `userId` (FK), `weightKg`, `loggedAt`

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user (auth required) |
| PATCH | `/api/users/me` | Update profile (auth + CSRF required) |

### Meals & Nutrition
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meals/today` | Get today's meals |
| POST | `/api/water/log` | Log water intake (auth + CSRF) |
| GET | `/api/dashboard/overview` | Get dashboard data |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/recommendations` | AI meal recommendations |
| GET | `/api/ai/insights` | AI nutrition insights |
| POST | `/api/ai/shopping-list` | AI shopping list |

### Utilities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/csrf-token` | Get CSRF token |

---

## ⚠️ Known Issues & Limitations

1. **CSRF Implementation:** Custom CSRF implementation stores secrets in cookies. This is acceptable but should be reviewed for production.

2. **Error Handling:** Some routes have minimal error handling. Consider adding more detailed error responses.

3. **No Input Sanitization:** User inputs are validated with Zod but not sanitized for XSS. The app uses React which provides some XSS protection, but be careful with rendered content.

4. **No Rate Limiting:** The API has no rate limiting. Consider adding `express-rate-limit` for production.

5. **File Uploads:** Meal images are stored as URLs, not uploaded files. No file upload functionality exists.

6. **Testing:** Only one test file exists (`login.test.tsx`). Test coverage is minimal.

7. **No README:** The project lacks a root README.md file.

---

## 🧪 Testing

### Run Tests
```powershell
cd "D:\Softwear Project\Unvisersity_project\nutriplan\Nutriplan-main"
npm test
```

### Test Coverage
```powershell
cd "D:\Softwear Project\Unvisersity_project\nutriplan\Nutriplan-main"
npm run coverage
```

---

## 🚀 Next Steps

Based on this debugging analysis, here are the recommended next steps in priority order:

### Immediate (Do First)
1. ✅ **Fix JWT_SECRET** - Generate and set a secure random JWT secret in `backend/.env`
2. ✅ **Add OPENAI_API_KEY** - If you have one, add it; otherwise AI features will use fallbacks
3. ✅ **Install Dependencies** - Run `npm install` in all 4 directories
4. ✅ **Initialize Database** - Run Prisma generate and migrate

### Short Term (This Week)
5. **Fix React Version Mismatch** - Align all apps to use React 18 for consistency
6. **Add Root README.md** - Create proper documentation
7. **Test All Services** - Verify all 4 services start and communicate correctly
8. **Fix Case Sensitivity Issues** - Some npm scripts reference `nutriplan-main` but folder is `Nutriplan-main`

### Medium Term (Next Sprint)
9. **Add Rate Limiting** - Implement `express-rate-limit` on backend
10. **Increase Test Coverage** - Add tests for critical paths
11. **Add API Documentation** - Document all endpoints with examples
12. **Environment Validation** - Add better validation for required env vars

### Long Term (Future)
13. **Production Deployment** - Set up proper environment for production
14. **Database Migration** - Consider PostgreSQL for production instead of SQLite
15. **Monitoring** - Add logging and error tracking (Sentry, etc.)
16. **CI/CD Pipeline** - Set up automated testing and deployment

---

## 📊 Dependencies Summary

| Package | Version | Location | Purpose |
|---------|---------|----------|---------|
| Next.js | 16.2.3 | Root | React framework |
| React | 19.2.4 / 18.3.1 | All | UI library |
| Express | 4.21.2 | Backend | API server |
| Prisma | 6.7.0 | Backend | Database ORM |
| Vite | 6.3.5 | Dashboard/Landing | Build tool |
| Tailwind CSS | 4.x | All | Styling |
| OpenAI SDK | Latest | Backend | AI integration |

---

## 💡 Development Tips

1. **Use Concurrently:** Consider installing `concurrently` to start all services with one command:
   ```json
   "scripts": {
     "dev:all": "concurrently \"npm run dev:backend\" \"npm run dev:landing\" \"npm run dev:dashboard\""
   }
   ```

2. **VS Code Workspaces:** Create a `.code-workspace` file to manage all three apps in one window.

3. **Database Studio:** Use `npx prisma studio` to visually browse/edit database records.

4. **Hot Reload:** All apps support hot reload - changes will reflect immediately during development.

---

**Report Generated By:** OpenCode Agent  
**For Questions:** Review this document or check individual app documentation.
