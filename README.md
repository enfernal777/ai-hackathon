# AI Training Effectiveness Tracker

A full-stack application for measuring the effectiveness of GenAI training programs through AI-powered assessments and skill tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Supabase account with PostgreSQL database
- `.env` file configured (see below)
- (Optional) Python for AWS token refresh

### Setup

1. **Install dependencies**
   ```bash
   npm install
   npm run install:all
   ```

2. **Configure environment**
   
   Add to your `.env` file:
   ```env
   # Supabase
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   
   # Backend
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

3. **Seed admin user**
   
   Run database schema SQL in Supabase SQL Editor (see `database_schema.md`)

4. **Start the application** 🎉
   ```bash
   npm run dev
   ```
   
   **This enhanced startup script will:**
   - ✅ Check and refresh AWS tokens (if `refToken.py` exists)
   - ✅ Test database connectivity
   - ✅ Start both backend and frontend servers
   - ✅ Automatically open browser to http://localhost:5173
   
   Everything starts automatically with one command!

5. **Or run servers individually**
   ```bash
   npm run dev:backend  # Backend only
   npm run dev:frontend # Frontend only
   ```

## 🔐 Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

⚠️ Change the admin password after first login!

## ✅ Current Features

- ✅ Employee registration and login
- ✅ Admin login (no registration)
- ✅ JWT-based authentication
- ✅ Role-based dashboards
- ✅ Profile management
- ✅ Statistics tracking (ranking, win rate, streak)

## 🚧 Upcoming Features

- AI-generated quiz system
- Goal setting and tracking
- Admin analytics dashboard
- Skill heatmaps
- Trend analysis

## 📁 Project Structure

```
ai-hackathon/
├── backend/          # Express + TypeScript API
├── frontend/         # React + TypeScript + Vite
├── database/         # SQL scripts
├── package.json      # Root scripts
└── .env             # Environment configuration
```

## 🛠️ Available Scripts

- `npm run dev` - **Enhanced startup**: Check AWS tokens, test DB, start servers, open browser
- `npm run dev:backend` - Start only backend server
- `npm run dev:frontend` - Start only frontend server
- `npm run install:all` - Install all dependencies (root, backend, frontend)
- `npm run build` - Build both projects for production
- `npm run test:db` - Test database connectivity
- `npm run test:aws` - Test AWS Bedrock connectivity

## 📚 Documentation

- [SETUP.md](SETUP.md) - Detailed setup instructions
- [QUICKSTART.md](QUICKSTART.md) - Testing guide
- [FEATURES.md](FEATURES.md) - Feature specifications
- [database_schema.md](database_schema.md) - Database schema

## 🎨 Tech Stack

- **Backend:** Node.js, Express, TypeScript, bcrypt, JWT
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT with bcrypt password hashing

## 📝 License

MIT
