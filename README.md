# Finance Tracker

A comprehensive personal finance tracking application built with Next.js, MongoDB, and shadcn/ui. Track your income and expenses, visualize spending patterns, and manage your finances with ease.

## Features

- 🔐 **Secure Authentication** - User registration and login with NextAuth.js
- 💰 **Transaction Management** - Log income and expenses with detailed information
- 📊 **Visual Analytics** - Interactive charts and graphs to understand spending patterns
- 🏷️ **Category Management** - Create and manage custom spending categories
- 🔍 **Advanced Filtering** - Filter transactions by date, category, and type
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI** - Beautiful interface built with shadcn/ui and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Icons**: Lucide React

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v18 or later)
- npm or yarn
- MongoDB (local installation or cloud instance)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd finance-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory and add the following variables:
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/finance-tracker
   # For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/finance-tracker

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-super-secret-key-here

   # Environment
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   If using local MongoDB:
   ```bash
   mongod
   ```
   
   Or make sure your MongoDB Atlas cluster is running and accessible.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### Getting Started

1. **Sign Up**: Create a new account or sign in if you already have one
2. **Default Categories**: Upon registration, default categories are automatically created
3. **Add Transactions**: Start logging your income and expenses
4. **View Dashboard**: Analyze your financial data with interactive charts

### Adding Transactions

1. Click the "Add Transaction" button on the dashboard
2. Select the transaction type (Income or Expense)
3. Enter the amount, description, and select a category
4. Choose the date for the transaction
5. Click "Add Transaction" to save

### Managing Categories

1. Navigate to the Categories page
2. Click "Add Category" to create new categories
3. Choose a name and color for your category
4. Your custom categories will be available when adding transactions

### Filtering Transactions

1. Use the filter panel on the dashboard
2. Filter by transaction type, category, or date range
3. View filtered results in the transactions table

## Default Categories

The application comes with pre-configured categories:

- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Travel
- Salary
- Investment

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_URL` | Base URL of your application | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js encryption | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## Security Considerations

- Passwords are hashed using bcryptjs
- MongoDB queries use Mongoose for protection against injection
- Authentication is handled by NextAuth.js
- Environment variables store sensitive information
- API routes are protected with session verification
