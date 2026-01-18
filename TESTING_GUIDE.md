# 🧪 Testing Guide - New Features

## 1️⃣ Test Rejection Reasons (Leave & Loan)

### Step 1: Admin Rejecting a Leave Request
1. Login as Admin (email: `admin@company.com`, password: `admin123`)
2. Navigate to Admin Dashboard → "📋 Manage Requests"
3. Click "📋 Leave Requests" tab
4. Find a pending leave request
5. Click "✗ Reject" button
6. Modal will appear - enter rejection reason (e.g., "Already too many leaves approved this month")
7. Click "✓ Proceed" - rejection will be saved with reason

### Step 2: Employee Viewing Rejection Reason
1. Logout as Admin
2. Login as Employee (email: `employee@company.com`, password: `employee123`)
3. Navigate to "📋 Leave Management"
4. Find the rejected leave request
5. **NEW:** Click "👁️ View Reason" button
6. Modal will display:
   - Leave type
   - Period (from-to dates)
   - Status: Rejected
   - **Admin's Rejection Reason** (in red box)

### Step 3: Test Loan Rejection (Same Process)
1. As Admin: Go to Admin Requests → Loan Requests tab
2. Reject a loan request with reason
3. As Employee: Go to Loan Management → Find rejected loan → Click "View Reason"

---

## 2️⃣ Test Salary Generation

### Prerequisites:
1. Ensure employee has attendance records (at least 1 day marked as present)
   - Use "AttendanceManagement" to mark attendance
2. Ensure employee has salary structure set
   - Use "Salary Management" → "Set Salary Structure" tab

### Step 1: Set Employee Salary Structure
1. Login as Admin
2. Go to "💰 Salary Management"
3. On "📋 Set Salary Structure" tab:
   - Select employee
   - Enter Base Salary: `50000`
   - Enter allowances:
     - HRA: `5000` (will auto-calculate as 10%)
     - DA: `2500` (will auto-calculate as 5%)
     - Travel: `500`
     - Medical: `500`
   - Enter deductions:
     - PF: `6000`
     - Tax: `2500`
     - Insurance: `500`
4. Click "💾 Save Salary Structure"
5. Success message: "✓ Salary structure saved successfully"

### Step 2: Mark Employee Attendance
1. Go to "🎯 Attendance Management"
2. Select employee
3. Mark attendance for current month:
   - Mark at least 15 days as "Present" (or mark Leave/Half day)
4. Employee should have mixed attendance for realistic calculation

### Step 3: Generate Monthly Salary
1. Go to "💰 Salary Management"
2. Click "📊 Generate Monthly Salary" tab
3. Select the same employee
4. Select current month using date picker
5. Click "✓ Generate Salary" button
6. Confirmation dialog appears → Click "✓ Proceed"
7. System calculates:
   - Attendance percentage (present days / total working days)
   - Adjusted salary based on attendance
   - Auto-calculated HRA & DA from percentages
   - Fixed allowances (travel, medical)
   - Auto-calculated deductions (PF, tax, insurance)
   - **Aggregated loan EMI** if employee has approved loans
8. Success message shows:
   - ✓ Salary generated for [Employee Name]
   - Gross: ₹XXX,XXX
   - Net: ₹YYY,YYY

### Expected Calculation Example:
```
Base Salary: ₹50,000
Attendance: 20 days present (out of 22 working days) = 90.9%
Adjusted Salary: ₹50,000 × 0.909 = ₹45,450

ALLOWANCES:
HRA (10%): ₹4,545
DA (5%): ₹2,272
Travel: ₹500
Medical: ₹500
Subtotal: ₹7,817

Gross Salary: ₹45,450 + ₹7,817 = ₹53,267

DEDUCTIONS:
PF (12%): ₹6,000
Tax (5%): ₹2,500
Insurance: ₹500
Loan EMI: ₹0 (if no loans)
Subtotal: ₹9,000

NET SALARY: ₹53,267 - ₹9,000 = ₹44,267
```

---

## 3️⃣ Test Admin Request Management Page

### Step 1: View All Leave Requests
1. Login as Admin
2. Go to Admin Dashboard → "📋 Manage Requests"
3. Click "📋 Leave Requests" tab
4. Table shows:
   - Employee Name
   - Leave Type (casual/sick/earned)
   - Date Range
   - Status (color-coded: yellow=pending, green=approved, red=rejected)
   - Action buttons (for pending requests only)

### Step 2: Quick Actions
1. **Approve Request:** Click "✓ Approve" button
   - Request status changes to "approved" immediately
   - Table refreshes
   - Snackbar shows "✓ Leave approved"

2. **Reject Request:** Click "✗ Reject" button
   - Modal opens for rejection reason
   - Enter mandatory reason
   - Click "✓ Proceed"
   - Request status changes to "rejected"
   - Snackbar shows "✓ Leave rejected"

### Step 3: View Loan Requests
1. Click "💳 Loan Requests" tab
2. Same features as leave requests
3. Table shows:
   - Employee Name
   - Amount (in blue)
   - Monthly EMI
   - Term (in months)
   - Status
   - Action buttons

### Step 4: Test Tab Switching
1. Switch between "Leave Requests" and "Loan Requests" tabs
2. Data updates automatically
3. UI remains responsive

---

## 4️⃣ Test Rejection Reason Validation

### Admin Side:
1. Try to reject without entering reason
2. Modal will show input field
3. If empty reason field → Submit button won't accept
4. Must enter reason before rejection

### Employee Side:
1. Rejected requests without reason show no "View Reason" button
2. Rejected requests with reason show "View Reason" button
3. Clicking button shows the reason in modal

---

## 5️⃣ Integration Testing

### Test Complete Workflow:
1. **Setup Phase:**
   - Create/login as employee
   - Mark attendance for month
   - Get admin to set salary structure

2. **Request Phase:**
   - Employee requests leave
   - Employee requests loan

3. **Admin Phase:**
   - Admin reviews requests
   - Admin rejects one leave with reason
   - Admin approves loan

4. **Employee Feedback Phase:**
   - Employee views approved loan
   - Employee views leave rejection with reason
   - Employee sees explanation in modal

5. **Salary Generation Phase:**
   - Admin generates salary for month
   - System shows detailed calculation
   - Net salary reflects attendance and deductions

---

## 🔍 Verification Checklist

### Frontend Features:
- [ ] SalaryManagement.js has two tabs
- [ ] LeaveManagement.js shows "View Reason" button for rejected leaves
- [ ] LoanManagement.js shows "View Reason" button for rejected loans
- [ ] AdminRequests.js displays tabbed interface with leave/loan tables
- [ ] All modals have proper styling and animations
- [ ] Snackbar notifications appear for all actions

### Backend Features:
- [ ] POST /salary/generate endpoint works
- [ ] Leave rejection saves rejectionReason field
- [ ] Loan rejection saves rejectionReason field
- [ ] Salary generation calculates attendance-based salary
- [ ] Salary includes automatic allowances/deductions

### Database:
- [ ] Leave.rejectionReason field exists
- [ ] Loan.rejectionReason field exists
- [ ] Salary records contain all calculation details
- [ ] Rejection reasons are persistent in database

---

## 🐛 Troubleshooting

### Issue: "Salary not generating"
**Solution:**
1. Check if employee has attendance records for the month
2. Check if salary structure is set for the employee
3. Verify month format is YYYY-MM (e.g., 2024-11)
4. Check backend logs for error details

### Issue: "Rejection reason not showing"
**Solution:**
1. Verify rejection was saved in database
2. Check if user role is "employee" (not admin)
3. Reload page to refresh data
4. Clear browser cache if needed

### Issue: "Modal not opening"
**Solution:**
1. Check browser console for JavaScript errors
2. Verify Material-UI Dialog component is imported
3. Check if selectedLeave/selectedLoan state is properly set
4. Verify Material-UI version is v5+

### Issue: "Frontend compiling with errors"
**Solution:**
1. Run `npm install` in frontend folder
2. Check for missing imports
3. Verify all file paths are correct
4. Clear node_modules and reinstall if needed

---

## 📊 Test Data Scenarios

### Scenario 1: Typical Workflow
- 1 employee, 20 days present, approved loan
- Expected: Salary calculated with attendance adjustment and loan EMI deduction

### Scenario 2: Full Leaves
- 1 employee, 5 days present (25 days leave)
- Expected: Low salary due to attendance percentage

### Scenario 3: Multiple Requests
- 3 leave requests (pending, approved, rejected)
- 2 loan requests (pending, approved)
- Expected: Admin can manage all in unified interface

### Scenario 4: Multiple Deductions
- Employee with multiple active loans
- Expected: All loan EMIs aggregated in salary deduction

---

## ✅ Final Verification

After running through all tests:
1. ✅ All rejection reasons are visible to employees
2. ✅ Salary generates automatically based on attendance
3. ✅ Admin can manage all requests from one page
4. ✅ No console errors in browser
5. ✅ No backend errors in terminal
6. ✅ Database is updated with all records
7. ✅ UI is responsive on mobile/tablet/desktop
8. ✅ Snackbar notifications work correctly
9. ✅ Modal dialogs are beautiful and functional
10. ✅ Gradient styling applied everywhere

---

**Testing completed on:** [Date]
**Tester Name:** [Your Name]
**Status:** ✅ All Features Working
