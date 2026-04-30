# 🍽️ CaterEase — Multi-Vendor Catering Platform

A full-stack catering marketplace where customers book catering services, providers manage menus and orders, and admins oversee the platform.

**Developer:** Surjeet Karan

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS 3 |
| State | Zustand, TanStack Query v5 |
| Routing | React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT + bcryptjs |
| Logging | Winston |
| Validation | express-validator |

---

## 📁 Project Structure

```
CaterEase/
├── backend/                  # Express API server
│   ├── app.js                # Entry point
│   ├── seed.js               # Database seeder with rich sample data
│   ├── test.js               # API test suite
│   ├── .env                  # Environment variables
│   ├── config/
│   │   ├── database.js       # MongoDB connection
│   │   └── logger.js         # Winston logger
│   ├── app/
│   │   ├── Models/           # User, Provider, Menu, Order
│   │   ├── Controllers/      # Auth, Provider, Menu, Order
│   │   ├── Services/         # AuthService, OrderService
│   │   ├── Middlewares/      # auth.js, errorHandler.js
│   │   └── Helpers/          # response.js
│   ├── routes/               # auth, customer, provider, admin
│   └── logs/                 # combined.log, error.log
│
├── frontend/                 # React + Vite app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── auth/         # Login, Register
│   │   │   ├── customer/     # Dashboard, Providers, Menus, Orders
│   │   │   ├── caterer/      # Dashboard, ManageMenus, Orders
│   │   │   └── owner/        # Dashboard, Users, Orders
│   │   ├── components/
│   │   │   ├── layout/       # Navbar, Sidebar, AppLayout
│   │   │   └── common/       # ProtectedRoute, Spinner, ErrorMessage
│   │   ├── hooks/            # useAuth, useOrders, useMenus
│   │   ├── services/api.js   # Axios + JWT interceptors
│   │   └── store/            # Zustand auth store
│   └── public/
│
├── credentials.txt           # All seed account logins
├── details.txt               # Non-technical user guide
└── guide.txt                 # Developer project tracker
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v20+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/intsurjeetkaran-droid/CaterEase.git
cd CaterEase

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/catering_platform
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- 1 Admin account
- 10 Provider accounts (all approved, each with 5-6 menu items)
- 10 Customer accounts
- 10 Sample orders with realistic data

### 4. Run the App

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🔐 Test Accounts

See **credentials.txt** for all login details.

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@caterease.com | Admin@1234 |
| Provider | ravi@caterease.com | Provider@1 |
| Customer | amit@example.com | Customer@1 |

---

## 🔐 Roles & Access

| Feature | Customer | Provider | Admin |
|---------|----------|----------|-------|
| Browse Providers | ✅ | ❌ | ✅ |
| View Menus | ✅ | ❌ | ✅ |
| Create Order | ✅ | ❌ | ❌ |
| View Own Orders | ✅ | Assigned | All |
| Update Order Status | ❌ | ✅ | ✅ |
| Manage Menus | ❌ | ✅ | ✅ |
| Configure Payment Details | ❌ | ✅ | ❌ |
| Make Payments (Online/Cash) | ✅ | ❌ | ❌ |
| Confirm Cash Payments | ❌ | ✅ | ❌ |
| Approve Providers | ❌ | ❌ | ✅ |

---

## 🔌 API Reference

### Auth
```
POST   /api/register
POST   /api/login
GET    /api/me
```

### Customer
```
GET    /api/customer/providers
GET    /api/customer/menus/:providerId
POST   /api/customer/orders
GET    /api/customer/my-orders
POST   /api/customer/orders/:id/payment
PUT    /api/customer/orders/:orderId/payment/:paymentId/status
```

### Provider
```
POST   /api/provider/profile
GET    /api/provider/profile
PUT    /api/provider/payment-details
GET    /api/provider/menus
POST   /api/provider/menus
PUT    /api/provider/menus/:id
DELETE /api/provider/menus/:id
GET    /api/provider/orders
PUT    /api/provider/orders/:id/status
PUT    /api/provider/orders/:orderId/payment/:paymentId/status
```

### Admin
```
GET    /api/admin/users
GET    /api/admin/providers
PUT    /api/admin/providers/:id/approve
GET    /api/admin/orders
```

---

## 📦 Order & Payment Management

### Order Fields
- **Event Date** - When the catering service is needed
- **Event Location** - Full address/venue for the event
- **Customer Phone** - Contact number for coordination
- **Guest Count** - Number of people to serve (optional)
- **Special Notes** - Any special requirements or instructions
- **Menu Items** - Selected dishes with quantities
- **Payments** - Track payments with multiple methods

### Payment System

#### Payment Methods
1. **Online Payment** - Customer pays via UPI/QR code
   - Caterer configures UPI ID and QR code in Payment Settings
   - Customer sees payment details and can copy UPI ID
   - Customer submits payment with optional transaction ID
   - Payment status: pending → paid (customer confirms)

2. **Cash in Hand** - Customer pays caterer directly
   - Customer selects cash payment option
   - Payment status: pending → paid (caterer confirms receipt)
   - Caterer can mark as received or failed

#### Payment Features
- **Partial Payments** - Pay in installments
- **Payment Tracking** - See paid, pending, and remaining amounts
- **Payment History** - Complete transaction log per order
- **Flexible Confirmation** - Both parties can update payment status
- **Secure Details** - Payment info only visible to order participants

### Order Status Flow

```
pending → accepted → in_progress → completed
                  ↘              ↘
                   cancelled      cancelled
```

---

## 🛡️ Security Features

- Passwords hashed with **bcryptjs** (12 salt rounds)
- Routes protected with **JWT Bearer tokens**
- Role-based access control on every route
- Input validation with **express-validator** on all endpoints
- MongoDB ObjectId validation on all `:id` params
- Global error handler with sanitized responses
- No passwords returned in any API response

---

## 📋 Validation Rules

- Event date must be **in the future**
- Event location is **required** for all orders
- Customer phone is **required** for all orders
- Menu items must **belong to the selected provider**
- Payment amount must be **> 0** and **≤ remaining balance**
- Cannot pay on a **cancelled** order
- Cannot overpay beyond the **total amount**
- Status transitions are **strictly enforced**
- Providers must be **approved** before adding menus

---

## 📝 Logging

All activity is logged to `backend/logs/`:

| File | Contents |
|------|----------|
| `combined.log` | All logs (info + errors) |
| `error.log` | Errors only |

Logged events: user registration, login, order creation, status updates, payments, errors.

---

## 📜 Available Scripts

### Backend
```bash
npm run dev      # Start with nodemon (auto-restart)
npm start        # Start in production
npm run seed     # Seed database with test data
npm test         # Run API test suite
```

### Frontend
```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## ✨ Key Features

### For Customers
- Browse approved catering providers
- View detailed menus with descriptions and pricing
- Build custom orders with multiple items
- Specify event location, date, and guest count
- Add special instructions for caterers
- Track order status in real-time
- **Choose payment method** - Online (UPI/QR) or Cash in Hand
- **View caterer's payment details** - UPI ID, QR code, bank info
- **Make partial or full payments** with transaction tracking
- **Copy UPI ID** with one click for easy payment
- View complete order history with payment breakdown

### For Caterers (Providers)
- Create business profile with contact details
- **Configure payment details** - UPI ID, QR code, bank name
- Manage menu items with categories and descriptions
- Receive orders with complete customer information
- View customer phone number and event location
- See guest count and special requirements
- Update order status through workflow
- **Confirm cash payments** received from customers
- **Track payment status** - paid, pending, remaining
- Dashboard with key metrics and earnings
- View payment history per order

### For Admins
- Approve or reject provider applications
- Monitor all users and their roles
- View all orders across the platform
- Track total revenue and platform metrics
- Manage system-wide operations

---

## 🎨 Frontend Features

- **Modern UI** - Clean, responsive design with Tailwind CSS
- **Dark Mode** - Full dark theme support with toggle
- **Real-time Updates** - TanStack Query for data synchronization
- **Role-based Navigation** - Dynamic menus based on user role
- **Protected Routes** - Automatic redirection based on authentication
- **Toast Notifications** - User-friendly feedback for all actions
- **Payment Modal** - Interactive payment interface with QR code display
- **Copy to Clipboard** - Quick UPI ID copying
- **Loading States** - Smooth loading indicators
- **Error Handling** - Graceful error messages with retry options
- **Mobile Responsive** - Works seamlessly on all devices
- **Password Toggle** - Show/hide password in auth forms

---

## 🚀 Deployment

### Backend (Render/Railway/Heroku)
- Deploy to your preferred platform
- Set environment variables:
  - `MONGODB_URI` - MongoDB Atlas connection string
  - `JWT_SECRET` - Strong secret key
  - `NODE_ENV=production`
  - `PORT=5000`
- Connect to MongoDB Atlas
- Run seed script if needed

### Frontend (Vercel/Netlify/Render)
- Deploy static site
- Build command: `npm run build`
- Output directory: `dist`
- The `_redirects` file handles SPA routing (no 404 on refresh)
- CORS is configured for production URLs:
  - Frontend: https://caterease-frontend-blyo.onrender.com
  - Backend: https://caterease-d13p.onrender.com

---

## 👨‍💻 Developer

**Surjeet Karan**

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## 📞 Support

For support, email or open an issue in the repository.

---

**Built with ❤️ by Surjeet Karan**
