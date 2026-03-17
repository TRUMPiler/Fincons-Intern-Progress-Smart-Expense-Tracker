# 💰 Smart Expense Tracker

A modern, intelligent expense tracking application designed to help users manage their finances effectively. Track expenses, set budgets, analyze spending patterns, and receive smart alerts about overspending with AI-powered insights.

---

## 🎯 Features

### 📊 Dashboard & Analytics
- **Financial Health Score** - Comprehensive financial health assessment with breakdown of savings, stability, control, and budget metrics
- **Income vs Expense Overview** - Visual doughnut chart showing income and expense distribution
- **Monthly Spending Trends** - Line chart tracking spending patterns over time
- **Category-wise Spending Analysis** - Bar chart visualizing expenses by category
- **Expense Predictions** - AI-powered predictions for future spending

### 💳 Transaction Management
- **Full CRUD Operations** - Create, read, update, and delete transactions
- **DateTime Support** - Capture precise transaction timestamps with 2-year historical range
- **Transaction Filtering** - Filter transactions by:
  - Year (dynamically populated from actual data)
  - Month
  - Category
- **Transaction Search & Display** - Recent transactions view on dashboard
- **Full Page Transaction View** - Dedicated page for comprehensive transaction history

### 💰 Budget Management
- **Category-wise Budgets** - Set monthly budgets for different spending categories
- **Budget Progress Tracking** - Visual progress bars showing spent vs. budget limit
- **Budget Alerts** - Notifications when approaching budget limits
- **Budget Usage Metrics** - Dashboard cards showing budget status
- **Multi-Category Support** - Manage budgets across all expense categories

### 🚨 Smart Alert System
- **Overspending Alerts** - Automatic alerts when spending exceeds 40% of 3-month average
- **Budget Threshold Notifications** - Alerts when approaching budget limits
- **Email Notifications** - Get alerts delivered via email
- **Alert Management** - Mark alerts as read or get reminded later
- **Alert History** - View all past alerts on dashboard

### 🏷️ Category Management
- **Custom Categories** - Create and manage custom expense categories
- **Category Organization** - Organize transactions by category
- **Category-based Analytics** - Track spending per category

### 🔐 Authentication & Security
- **User Registration** - Create new user accounts securely
- **Login/Logout** - Secure JWT-based authentication
- **Password Encryption** - Bcrypt password hashing
- **Session Management** - Persistent user sessions
- **Protected Routes** - API endpoints secured with JWT middleware

### 🤖 AI Chat Integration
- **AI Chat Assistant** - Get financial advice and insights via AI chat
- **Multi-Provider Support**:
  - Google Generative AI
  - Groq SDK
- **Chat History** - View conversation logs
- **Financial Recommendations** - AI-powered spending suggestions

### 📱 User Experience
- **Responsive Design** - Mobile, tablet, and desktop friendly
- **Dark Mode Support** - Eye-friendly dark theme option
- **Loading States** - Progress indicators during data fetch
- **Real-time Updates** - Instant UI updates on data changes
- **Modal Dialogs** - Confirmation dialogs for critical actions

### 📈 Reporting & Insights
- **Available Months** - Dynamic month dropdown showing months with transactions
- **Available Years** - Dynamic year dropdown for historical data access
- **Monthly Budget Trends** - Track budget performance month-over-month
- **Financial Metrics** - Income, expense, and savings calculations

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js & Express** | Runtime environment and web framework |
| **MongoDB & Mongoose** | NoSQL database and ODM |
| **JWT (JSON Web Tokens)** | Authentication and authorization |
| **Bcrypt/BcryptJS** | Secure password hashing |
| **CORS** | Cross-Origin Resource Sharing |
| **Dotenv** | Environment variable management |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library and component framework |
| **TypeScript** | Static type checking |
| **Redux Toolkit** | State management |
| **React Router** | Client-side routing |
| **Vite** | Build tool and dev server |

### UI & Styling
| Library | Purpose |
|---------|---------|
| **PrimeReact** | Rich UI component library |
| **TailwindCSS** | Utility-first CSS framework |
| **Shadcn/ui** | High-quality reusable components |
| **Lucide React** | Icon library |
| **Chart.js** | Data visualization |
| **Radix UI** | Unstyled, design system components |

### API & Communication
| Library | Purpose |
|---------|---------|
| **Axios** | HTTP client for API calls |
| **Cookie Parser** | Parse HTTP cookies |

### AI & Messaging
| Service | Purpose |
|---------|---------|
| **Google Generative AI** | AI responses via Google's Generative AI |
| **Groq SDK** | AI responses via Groq's API |
| **Resend** | **Powerful email service** for sending transactional alerts and notifications |
| **Mailtrap** | Email service for development & testing |
| **Postmark** | Transactional email delivery (backup) |

### Development Tools
| Tool | Purpose |
|------|---------|
| **Nodemon** | Auto-restart Node.js on file changes |
| **ESLint** | Code linting and quality |
| **TypeScript Compiler** | Type checking and compilation |

---

## 📁 Project Structure

```
Fincons_Training_Smart_Expense_Tracker/
├── Backend/
│   ├── ai/                          # AI interaction modules
│   │   └── AiInteraction.js
│   ├── authentication/              # Authentication utilities
│   │   └── JWTauthentication.js
│   ├── config/                      # Configuration files
│   │   └── config.js
│   ├── controllers/                 # Route handlers
│   │   ├── AlertController.js
│   │   ├── AuthController.js
│   │   ├── BudgetController.js
│   │   ├── CategoryController.js
│   │   ├── ChartController.js
│   │   ├── ChatController.js
│   │   ├── TransactionController.js
│   │   └── UserController.js
│   ├── middleware/                  # Express middleware
│   │   ├── Authentication.js
│   │   └── ErrorHandling.js
│   ├── models/                      # MongoDB Mongoose schemas
│   │   ├── Alert.js
│   │   ├── Budget.js
│   │   ├── Category.js
│   │   ├── chats.js
│   │   ├── Logs.js
│   │   ├── Transaction.js
│   │   └── user.js
│   ├── Routes/                      # API route definitions
│   │   ├── AlertRoute.js
│   │   ├── AuthRoute.js
│   │   ├── BudgetRoute.js
│   │   ├── CategoryRoute.js
│   │   ├── ChartRoute.js
│   │   ├── ChatRoute.js
│   │   ├── CronJobRoute.js
│   │   ├── TransactionRoute.js
│   │   └── UserRoute.js
│   ├── services/                    # Business logic layer
│   │   ├── AlertService.js
│   │   ├── AuthService.js
│   │   ├── BudgetService.js
│   │   ├── CategoryService.js
│   │   ├── ChartsService.js
│   │   ├── ChatService.js
│   │   ├── cronjob.js
│   │   ├── LogService.js
│   │   ├── OverSpending.js
│   │   ├── TransactionService.js
│   │   └── UserService.js
│   ├── utils/                       # Utility functions
│   │   └── Response.js
│   ├── mailer/                      # Email service
│   │   └── Transport.js
│   ├── index.js                     # Application entry point
│   ├── package.json
│   └── SeederJunction.js            # Database seeding
├── Frontend/
│   └── Smart Expense Tracker/
│       ├── src/
│       │   ├── assets/              # Static assets (images, logos)
│       │   ├── components/          # Reusable React components
│       │   │   ├── Budget.tsx
│       │   │   ├── BudgetMeters.tsx
│       │   │   ├── CategorySpending.tsx
│       │   │   ├── Chats.tsx
│       │   │   ├── IncomeExpense.tsx
│       │   │   ├── sideBar.tsx
│       │   │   ├── SummaryCard.tsx
│       │   │   ├── TransactionOnlyPage.tsx
│       │   │   ├── Transactions.tsx
│       │   │   ├── types.ts
│       │   │   └── ui/              # Shadcn UI components
│       │   ├── hooks/               # Custom React hooks
│       │   │   └── use-mobile.ts
│       │   ├── lib/                 # Utility libraries
│       │   │   ├── authService.ts
│       │   │   ├── axiosInstance.ts
│       │   │   └── utils.ts
│       │   ├── pages/               # Page components
│       │   │   ├── Chat.tsx
│       │   │   ├── Dashboard.tsx
│       │   │   ├── Home.tsx
│       │   │   ├── Login.tsx
│       │   │   ├── NotFound.tsx
│       │   │   ├── Registration.tsx
│       │   │   ├── verified.tsx
│       │   │   └── verify.tsx
│       │   ├── services/            # API service calls
│       │   │   └── Dashboard.ts
│       │   ├── store/               # Redux store
│       │   │   ├── hooks.ts
│       │   │   ├── index.ts
│       │   │   └── slices/
│       │   │       ├── aiChatSlice.ts
│       │   │       └── chartsSlice.ts
│       │   ├── App.tsx              # Root App component
│       │   ├── main.tsx             # React entry point
│       │   ├── index.css
│       │   └── App.css
│       ├── public/                  # Static files
│       ├── vite.config.ts           # Vite configuration
│       ├── tsconfig.json            # TypeScript configuration
│       ├── tailwind.config.js       # Tailwind CSS configuration
│       ├── eslint.config.js         # ESLint configuration
│       ├── package.json
│       └── README.md
└── README.md                        # This file
```

---

## 🌐 Live Deployment

### Production URLs
- **Frontend:** https://moneymint.tech - Hosted on **Vercel** with automatic deployments
- **Backend API:** https://api.moneymint.tech - Hosted on **Render** with continuous uptime monitoring

Visit [https://moneymint.tech](https://moneymint.tech) to access the live application!

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd Backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the Backend directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_API_KEY=your_google_genai_api_key
   GROQ_API_KEY=your_groq_api_key
   EMAIL_SERVICE_KEY=your_email_service_key
   ```

4. **Start the Server**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd Frontend/"Smart Expense Tracker"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Application runs on `http://localhost:5173`

5. **Build for Production**
   ```bash
   npm run build
   ```

---

## 📊 API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Transactions
- `GET /api/transcation/:userId` - Get transactions for month/year
- `GET /api/transcation/all/:userId` - Get all transactions with optional year filter
- `POST /api/transcation` - Create new transaction
- `PUT /api/transcation/:id` - Update transaction
- `DELETE /api/transcation/:id` - Delete transaction

### Budgets
- `GET /api/budget/:userId` - Get user budgets
- `POST /api/budget` - Create budget
- `PUT /api/budget/:id` - Update budget
- `DELETE /api/budget/:id` - Delete budget

### Categories
- `GET /api/category/:userId` - Get user categories
- `POST /api/category` - Create category
- `PUT /api/category/:id` - Update category
- `DELETE /api/category/:id` - Delete category

### Charts & Analytics
- `GET /api/charts/:userId` - Get income/expense totals
- `GET /api/charts/months/:userId` - Get available months
- `GET /api/charts/years/:userId` - Get available years
- `GET /api/charts/cspending/:userId` - Get category spending
- `GET /api/charts/monthlytrend/:userId` - Get monthly trends
- `GET /api/charts/predict/:userId` - Get expense predictions

### Alerts
- `GET /api/alert/:userId` - Get user alerts
- `PUT /api/alert/:id` - Mark alert as read

### Chat
- `POST /api/chat` - Send message to AI chat

---

## 🎨 Key Design Decisions

1. **Redux for State Management** - Centralized state management for complex data flows
2. **Service Layer Pattern** - Separation of concerns between controllers and business logic
3. **Middleware Authentication** - JWT verification on protected routes
4. **Component-based Architecture** - Reusable React components for maintainability
5. **TypeScript** - Type safety across the frontend application
6. **MongoDB Aggregation Pipelines** - Efficient data analysis and calculations
7. **Loading States** - Progress indicators while async operations complete

---

## 📝 Data Models

### User
- Email, Password (hashed), Profile information
- Created/Updated timestamps

### Transaction
- Amount, Category, Description
- Type (Income/Expense), DateTime
- User reference, Soft delete flag

### Budget
- Category, Monthly limit
- Month/Year specific
- User reference

### Alert
- Type, Message, Severity
- Read status
- User reference, Category

### Category
- Name, Icon, Color
- User reference

---

## 🔄 Workflow Examples

### Creating a Transaction
1. User navigates to Transactions page
2. Fills in amount, category, description, and date
3. Date must be within 2 years (current date to 2 years ago)
4. Frontend validates datetime range
5. Transaction sent to backend API
6. System checks for overspending conditions
7. Transaction stored in database
8. Alert generated if spending exceeds threshold
9. Dashboard updated with new data

### Budget Tracking
1. User sets monthly budget for each category
2. As transactions are added, spent amount calculated
3. Progress bar shows visual representation
4. When spent reaches 80% of budget → alert
5. Dashboard displays budget meter cards

### Financial Health Calculation
- **Savings Rate** - Income minus Expenses
- **Stability** - Transaction consistency
- **Control** - Budget adherence percentage
- **Budget Efficiency** - Actual spending vs budgeted amounts
- Score: 0-100, with color-coded labels (Poor/Average/Good/Excellent)

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---

## 📄 License

This project is licensed under ISC License - see the backend package.json for details.

---

## � Deployment & Hosting

### Backend Deployment (Render)
- **Platform:** Render
- **URL:** https://api.moneymint.tech
- **Features:**
  - Automatic deployments from Git
  - Free SSL/TLS certificates
  - Always-on uptime
  - Built-in monitoring and logging

### Frontend Deployment (Vercel)
- **Platform:** Vercel
- **URL:** https://moneymint.tech
- **Features:**
  - Zero-config deployments
  - Global CDN for fast content delivery
  - Automatic HTTPS
  - Edge functions support
  - Environment-specific deployments

### Email Service (Resend)
- **Service:** Resend
- **Purpose:** Powerful transactional email delivery for:
  - Overspending alerts
  - Budget notifications
  - User verification emails
  - Monthly financial summaries
- **Benefits:**
  - High deliverability rates
  - Built-in email validation
  - Detailed analytics
  - Template support
  - Real-time webhooks

---

## �👨‍💻 Author

**Naisal Doshi**

Created as a Fincons Training Project

---

## 📞 Support

For issues, questions, or suggestions, please create an issue in the repository.

---

## 🎯 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Advanced data export (PDF, CSV)
- [ ] Recurring transactions automation
- [ ] Multi-currency support
- [ ] Collaborative budgeting (shared accounts)
- [ ] Advanced AI recommendations
- [ ] Investment tracking
- [ ] Tax report generation

