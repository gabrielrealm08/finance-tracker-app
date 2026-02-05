# Finance Tracker (Full Stack)

A personal finance tracker that lets users record income/expenses and see real-time totals.

## Features
- Create & delete transactions (income/expense)
- Stores data in MongoDB Atlas
- Real-time totals: income, expenses, balance
- Clean UI (React + Vite)

## Tech Stack
- Frontend: React (Vite), Axios
- Backend: Node.js, Express
- Database: MongoDB Atlas, Mongoose

## API Endpoints
- GET `/api/transactions` – list transactions
- POST `/api/transactions` – create transaction
- DELETE `/api/transactions/:id` – delete transaction

## Run Locally
### Backend
```bash
cd server
npm install
npm run dev