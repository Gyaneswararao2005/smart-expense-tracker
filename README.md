# Smart Expense & Budget Tracker

A full-stack MERN app (MongoDB, Express, React + Vite, Node) with Tailwind CSS and Recharts.

## Features
- Dashboard: Total Balance, Total Income, Total Expenses (calculated server-side)
- Transactions CRUD: title, amount, type (Income/Expense), category, date
- Filters: type, category, month, plus title search
- Category-wise expense breakdown chart (donut)
- Loading skeletons, empty states, form validation, error banner
- Responsive card layout (mobile + desktop)

## Folder structure
```
smart-expense-tracker/
├── package.json              # root scripts (run both apps together)
├── README.md
├── server/
│   ├── server.js
│   ├── seed.js               # optional sample data
│   ├── .env.example
│   ├── config/db.js
│   ├── models/Transaction.js
│   ├── controllers/transactionController.js
│   ├── routes/transactionRoutes.js
│   └── middleware/errorMiddleware.js
└── client/
    ├── index.html, vite.config.js, tailwind.config.js, postcss.config.js, vercel.json
    ├── .env.example
    └── src/
        ├── main.jsx, App.jsx, index.css
        ├── services/api.js
        ├── utils/{constants,format}.js
        └── components/
            ├── BalanceSummary.jsx
            ├── TransactionForm.jsx
            ├── TransactionList.jsx
            ├── FilterBar.jsx
            └── ExpenseChart.jsx
```

## 1. Setup (local)

Requirements: Node 18+, and MongoDB (local or a free MongoDB Atlas cluster).

```bash
# from the project root
npm run install:all

cp server/.env.example server/.env     # edit MONGO_URI if needed
cp client/.env.example client/.env

# optional: load sample data
npm run seed --prefix server

# start API (http://localhost:5000) and client (http://localhost:5173) together
npm run dev
```

Or run them separately: `npm run dev --prefix server` and `npm run dev --prefix client`.

### Currency
Set `VITE_CURRENCY` (e.g. `INR`, `EUR`, `USD`) and `VITE_LOCALE` (e.g. `en-IN`, `en-US`) in `client/.env`.

## 2. API reference

| Method | Endpoint | Description |
|-------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/transactions` | List. Query: `type`, `category`, `month=YYYY-MM`, `search` |
| GET | `/api/transactions/summary` | Totals + expense breakdown. Query: `month=YYYY-MM` |
| GET | `/api/transactions/:id` | Get one |
| POST | `/api/transactions` | Create |
| PUT | `/api/transactions/:id` | Update |
| DELETE | `/api/transactions/:id` | Delete |

## 3. Testing the endpoints locally (curl)

```bash
API=http://localhost:5000/api

# Health
curl $API/health

# Create
curl -X POST $API/transactions -H "Content-Type: application/json" \
  -d '{"title":"Groceries","amount":120.5,"type":"Expense","category":"Food","date":"2026-11-10"}'

# List (all) and filtered
curl $API/transactions
curl "$API/transactions?type=Expense&category=Food&month=2026-11&search=groc"

# Summary (all-time and for a month)
curl $API/transactions/summary
curl "$API/transactions/summary?month=2026-11"

# Update (replace <ID> with an _id from the list response)
curl -X PUT $API/transactions/<ID> -H "Content-Type: application/json" \
  -d '{"title":"Groceries (updated)","amount":130,"type":"Expense","category":"Food","date":"2026-11-10"}'

# Delete
curl -X DELETE $API/transactions/<ID>
```

Expected error cases (all return `{ "success": false, "message": "..." }`):

```bash
# 400 - validation (negative amount, bad category)
curl -X POST $API/transactions -H "Content-Type: application/json" \
  -d '{"title":"x","amount":-5,"type":"Expense","category":"Nope","date":"2026-11-10"}'

# 400 - invalid id
curl -X DELETE $API/transactions/not-an-id

# 404 - valid id that does not exist
curl -X DELETE $API/transactions/64b7f0f0f0f0f0f0f0f0f0f0

# 400 - bad month
curl "$API/transactions?month=2026-13"
```

UI checklist: add, edit, delete a transaction; switch type/category/month filters; search by title; confirm totals and chart update; resize to mobile width.

## 4. Deployment

### Step A: MongoDB Atlas
1. Create a free cluster at mongodb.com/atlas.
2. Create a database user and copy the connection string, e.g.
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/expense_tracker`
3. Network Access: allow `0.0.0.0/0` (Render uses changing IPs).

### Step B: Backend on Render
1. Push the project to GitHub.
2. Render dashboard: New > Web Service > connect the repo.
3. Settings:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Environment variables:
   - `MONGO_URI` = your Atlas connection string
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = your Vercel URL (add after Step C; no trailing slash, comma-separate multiple)
5. Deploy and check `https://<your-service>.onrender.com/api/health`.

Note: Render's free tier sleeps after inactivity, so the first request can take around 30-60 seconds.

### Step C: Frontend on Vercel
1. Vercel dashboard: Add New > Project > import the repo.
2. Settings:
   - Root Directory: `client`
   - Framework Preset: Vite (build `npm run build`, output `dist`)
3. Environment variables:
   - `VITE_API_URL` = `https://<your-service>.onrender.com/api`
   - `VITE_CURRENCY` / `VITE_LOCALE` (optional)
4. Deploy, then copy the Vercel URL into Render's `CLIENT_URL` and redeploy the backend so CORS allows it.

Vite env variables are baked in at build time, so redeploy the frontend after changing them.

## Troubleshooting
- "Cannot reach the server": check the API is running and `VITE_API_URL` is correct.
- CORS error in production: `CLIENT_URL` must exactly match your Vercel origin (https, no trailing slash).
- MongoDB connection error: check `MONGO_URI` and Atlas network access / credentials.
