# 🚀 QUICK START GUIDE

## Step 1: Install MongoDB (if not already installed)

**Windows:**
```powershell
# Download from https://www.mongodb.com/try/download/community
# Run installer and follow setup
# MongoDB will start automatically as a service
```

**Verify MongoDB is running:**
```powershell
mongo --version
# or
mongosh --version
```

## Step 2: Backend Setup (PowerShell)

```powershell
cd "P:\sem 4\backend"
npm install
npm run dev
```

Expected output:
```
MongoDB connected
Server running on http://localhost:5000
```

## Step 3: Frontend Setup (New PowerShell Terminal)

```powershell
cd "P:\sem 4\frontend"
npm install
npm start
```

Expected output:
```
Compiled successfully!
Local: http://localhost:3000
```

## Step 4: Login

Browser will open at `http://localhost:3000`

### Admin Login
- Email: `admin@company.com`
- Password: `admin123`

### Employee Login
- Email: `john@company.com`
- Password: `employee123`

## 📌 Verify Everything Works

### From Admin Dashboard
- [ ] Dashboard loads with stats (employees, salary, loans, leaves)
- [ ] Click "Manage Employees" - Can view/add/edit/delete
- [ ] Click "Attendance" - Can mark attendance
- [ ] Click "Salary" - Can set salary structure
- [ ] Click "Leaves" - Can approve/reject
- [ ] Click "Loans" - Can approve/reject
- [ ] Click "Payslips" - Can generate & download PDFs

### From Employee Dashboard
- [ ] Dashboard shows profile info
- [ ] Can request leave
- [ ] Can apply for loan (see EMI calc)
- [ ] Can view payslips

## 🎯 Key Features to Test

### 1. Mark Attendance (Admin)
- Go to Attendance Management
- Select employee & date
- Choose status (Present/Absent/Leave/Half Day)
- Click "Mark Attendance"
- Verify record appears in table

### 2. Set Salary (Admin)
- Go to Salary Management
- Select employee
- Enter allowances & deductions
- See gross/net calculate in real-time
- Click "Save"

### 3. Request Leave (Employee)
- Click "Request Leave"
- Select dates & reason
- Submit
- See status as "Pending"

### 4. Approve Leave (Admin)
- Go to Leaves
- Click "Approve" on pending leave
- See status change to "Approved"

### 5. Request Loan (Employee)
- Click "Apply Loan"
- Enter amount & term
- See EMI calculate automatically
- Submit
- See status as "Pending"

### 6. Generate Payslip (Admin)
- Go to Payslips
- Click "Generate Payslip"
- Select employee & month
- Click "Generate"
- Click "Download" to get PDF
- Can click "Send Email" to email employee

## 🔧 Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/salary_management
JWT_SECRET=your_super_secret_jwt_key_change_in_production
PORT=5000
NODE_ENV=development

# Email (optional - for payslip emails)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Admin Credentials
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=admin123
```

### Frontend
- No .env needed (uses http://localhost:5000 proxy)

## 💾 Sample Data

### Admin
- Email: `admin@company.com`
- Password: `admin123`

### Employee
- Email: `john@company.com`
- Password: `employee123`

You can create more employees from Admin Dashboard.

## 🐛 If Something Doesn't Work

### Port 5000 Already in Use
```powershell
# Find process on port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Port 3000 Already in Use
```powershell
# Find process on port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### MongoDB Connection Failed
```powershell
# Start MongoDB service
Start-Service MongoDB

# Or start manually
"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe"
```

### Dependencies Error
```powershell
# Clear and reinstall
cd backend
rm -r node_modules
rm package-lock.json
npm install

cd ../frontend
rm -r node_modules
rm package-lock.json
npm install
```

## 📱 Testing on Mobile

Frontend is fully responsive. Test using:
1. Chrome DevTools (F12) → Toggle Device Toolbar (Ctrl+Shift+M)
2. Or access from mobile: `http://<your-ip>:3000`

## 🎉 Success Indicators

- ✅ Backend running without errors
- ✅ Frontend loads at localhost:3000
- ✅ Login works with demo credentials
- ✅ Dashboard loads with stats
- ✅ Can mark attendance
- ✅ Can see salary calculations
- ✅ Can request/approve leaves
- ✅ Can request/approve loans
- ✅ Can generate payslips

## 📞 Next Steps

1. **Customize:** Update colors, fonts, branding in `frontend/src/index.js`
2. **Add More Data:** Use Admin dashboard to create employees
3. **Email Setup:** Configure EMAIL_USER & EMAIL_PASSWORD for payslip emails
4. **Deploy:** Use Heroku/Vercel for production

---

**Enjoy your complete MERN Employee Salary Management System! 🎉**
