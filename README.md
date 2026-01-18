# 🏢 Employee Salary Management System - MERN Stack

A complete, production-ready **MERN (MongoDB, Express, React, Node.js)** Employee Salary Management System with professional UI, full admin and employee portals.

## ✨ Features

### 🔐 Authentication
- JWT-based login system
- Admin & Employee separate portals
- Password hashing with bcryptjs
- Protected routes

### 👥 Admin Features
**Employee Management**
- Add, edit, delete/deactivate employees
- View all employee details
- Department & role management

**Attendance Tracking**
- Mark daily attendance
- Filter by month and employee
- Color-coded status display

**Salary Management**
- Set base salary & allowances (HRA, DA, Travel, Medical)
- Configure deductions (PF, Tax, Insurance)
- Auto-calculate gross, deductions, net salary

**Leave Management**
- View all leave requests
- Approve/reject leaves
- Track leave status

**Loan Management**
- View loan applications
- Approve/reject with EMI calculator
- Auto-calculate monthly EMI
- Track remaining amount

**Payslip Generation**
- Auto-generate PDF payslips
- Email payslips to employees
- Download payslips
- Maintain payslip history

**Admin Dashboard**
- View key metrics (employees, salary, loans, leaves)
- Salary trend charts
- Attendance statistics

### 👨‍💼 Employee Features
**Dashboard**
- View personal profile
- Check attendance count
- Latest salary details
- Active loans & leaves

**Leave Requests**
- Request leave (sick, casual, earned)
- View all leave requests
- Track approval status

**Loan Requests**
- Apply for loan
- See EMI calculations
- Track loan status

**Payslips**
- Download monthly payslips (PDF)
- View payslip history

## 🛠️ Tech Stack

### Frontend
- **React 18** with Hooks
- **Material-UI (MUI)** for professional components
- **Redux Toolkit** for state management
- **Axios** for API calls
- **Recharts** for charts/graphs
- **React Router v6** for navigation

### Backend
- **Node.js + Express** REST API
- **MongoDB + Mongoose** for database
- **JWT** for authentication
- **Nodemailer** for email (payslips)
- **PDFKit** for PDF generation
- **Bcryptjs** for password hashing

### Database
- **MongoDB** - NoSQL database
- Collections: Employees, Salary, Attendance, Leaves, Loans, Payslips, Departments

## 📁 Project Structure

```
salary_management/
├── backend/
│   ├── models/                (Database schemas)
│   │   ├── Employee.js
│   │   ├── Salary.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   ├── Loan.js
│   │   ├── Payslip.js
│   │   └── Department.js
│   ├── controllers/           (Business logic)
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── attendanceController.js
│   │   ├── salaryController.js
│   │   ├── leaveController.js
│   │   ├── loanController.js
│   │   └── payslipController.js
│   ├── routes/                (API routes)
│   │   ├── auth.js
│   │   ├── employees.js
│   │   ├── attendance.js
│   │   ├── salary.js
│   │   ├── leaves.js
│   │   ├── loans.js
│   │   └── payslips.js
│   ├── middleware/            (Auth, admin checks)
│   │   ├── auth.js
│   │   └── admin.js
│   ├── utils/                 (Helpers)
│   │   ├── mailer.js
│   │   └── pdfGenerator.js
│   ├── server.js              (Main server file)
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── pages/             (React components)
    │   │   ├── Login.js
    │   │   ├── AdminDashboard.js
    │   │   ├── EmployeeDashboard.js
    │   │   ├── EmployeeManagement.js
    │   │   ├── AttendanceManagement.js
    │   │   ├── SalaryManagement.js
    │   │   ├── LeaveManagement.js
    │   │   ├── LoanManagement.js
    │   │   └── PayslipManagement.js
    │   ├── redux/             (State management)
    │   │   ├── authSlice.js
    │   │   └── store.js
    │   ├── api.js             (Axios setup)
    │   ├── App.js             (Main app & routing)
    │   └── index.js           (Entry point)
    ├── public/
    │   └── index.html
    ├── package.json
    └── .env
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v14+)
- **npm** or **yarn**
- **MongoDB** (local or cloud - MongoDB Atlas)

### Backend Setup

```bash
cd backend
npm install

# Create .env file with:
# MONGO_URI=mongodb://localhost:27017/salary_management
# JWT_SECRET=your_secret_key
# PORT=5000
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=your_app_password

npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npm install

# Proxy is already set to http://localhost:5000 in package.json

npm start
# App opens at http://localhost:3000
```

## 📝 Default Credentials

### Admin Login
- **Email:** `admin@company.com`
- **Password:** `admin123`

### Employee Login
- **Email:** `john@company.com`
- **Password:** `employee123`

## 🎨 UI Features

### Design System
- **Color Palette:** Purple (#667eea) & Secondary (#764ba2)
- **Gradients:** Professional linear gradients
- **Glassmorphism:** Blurred backgrounds with transparency
- **Responsive:** Mobile, tablet, desktop optimized
- **Icons:** Material UI icons throughout
- **Charts:** Recharts for data visualization
- **Animations:** Smooth transitions & hover effects

### Pages Styling
- Professional cards with rounded corners
- Color-coded status chips (green/red/yellow)
- Gradient AppBars
- Responsive tables
- Dialog modals for forms
- Snackbar notifications

## 📊 API Endpoints

### Authentication
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/employee-login` - Employee login
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/admin/employees` - List all employees
- `POST /api/admin/employees` - Create employee
- `PUT /api/admin/employees/:id` - Update employee
- `DELETE /api/admin/employees/:id` - Delete employee

### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/all` - Get all attendance
- `GET /api/attendance/employee/:id` - Get by employee

### Salary
- `POST /api/salary/structure` - Set salary structure
- `GET /api/salary/all` - Get all salaries
- `GET /api/salary/history/:id` - Get employee salary history

### Leaves
- `POST /api/leaves` - Request leave
- `GET /api/leaves/all` - Get all leaves (admin)
- `GET /api/leaves/employee/:id` - Get employee leaves
- `PATCH /api/leaves/:id/approve` - Approve leave
- `PATCH /api/leaves/:id/reject` - Reject leave

### Loans
- `POST /api/loans` - Request loan
- `GET /api/loans/all` - Get all loans (admin)
- `GET /api/loans/employee/:id` - Get employee loans
- `PATCH /api/loans/:id/approve` - Approve loan
- `PATCH /api/loans/:id/reject` - Reject loan

### Payslips
- `POST /api/payslips/generate` - Generate payslip
- `GET /api/payslips/all` - Get all payslips
- `GET /api/payslips/:id/download` - Download PDF
- `POST /api/payslips/:id/send-email` - Send via email

## 🔄 Workflow Examples

### Leave Request Flow
1. Employee logs in → Employee Dashboard
2. Click "Request Leave" → Dialog opens
3. Select leave type, dates, reason → Submit
4. Admin sees pending leave → Approve/Reject
5. Employee sees updated status → Notification

### Loan Request Flow
1. Employee applies for loan → Amount, term, EMI shown
2. Admin reviews → Approve/Reject
3. If approved → Monthly EMI deducted from salary

### Payslip Generation
1. Admin selects employee & month → Generate
2. PDF payslip created automatically
3. Can download or email to employee
4. Employee downloads from dashboard

## 💾 Database Schema

### Employee Collection
```javascript
{
  name, email, password, phone,
  department, position, dateOfBirth,
  baseSalary, status (active/inactive/terminated),
  createdAt, updatedAt
}
```

### Salary Collection
```javascript
{
  employee (ref), month,
  basicSalary, allowances {hra, da, travel, medical},
  deductions {pf, tax, insurance, loanEMI, leaveDeduction},
  gross, totalDeductions, net,
  attendanceDays, leavesTaken
}
```

### Attendance Collection
```javascript
{
  employee (ref), date, status (present/absent/leave/halfday),
  checkInTime, checkOutTime, remarks
}
```

## 📧 Email Configuration

Update `.env` in backend:
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

Note: For Gmail, use App Passwords instead of regular passwords.

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGO_URI in `.env`
- Verify network connection if using MongoDB Atlas

### CORS Error
- Backend proxy in frontend `package.json` is set to `http://localhost:5000`
- Ensure backend server is running

### Email Not Sending
- Enable "Less Secure App Access" for Gmail OR use App Passwords
- Check EMAIL_USER & EMAIL_PASSWORD in `.env`

### Frontend Not Starting
- Delete `node_modules` & `package-lock.json`
- Run `npm install` again
- Check Node.js version (14+)

## 📈 Performance Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Database indexing on employee & date fields
- ✅ Efficient API requests with Axios
- ✅ Redux state management
- ✅ Responsive UI with Material-UI
- ✅ PDF generation on-the-fly

## 🔐 Security Features

- ✅ JWT authentication on all protected routes
- ✅ Admin-only routes with middleware
- ✅ Password hashing before storage
- ✅ Axios interceptors for token management
- ✅ CORS enabled
- ✅ Input validation on frontend & backend

## 🚢 Deployment

### Backend (Heroku/Vercel)
1. Push to Git
2. Connect to Heroku
3. Set environment variables in Heroku dashboard
4. Deploy

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `build` folder
3. Update API URL to production backend

## 📞 Support & Contributing

For issues or improvements, please create an issue or PR.

---

**Built with ❤️ using MERN Stack**

Version: 1.0.0 | Last Updated: November 2025
