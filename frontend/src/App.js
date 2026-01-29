import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import { useSelector } from 'react-redux';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminRequests from './pages/AdminRequests';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AttendanceManagement from './pages/AttendanceManagement';
import SalaryManagement from './pages/SalaryManagement';
import LeaveManagement from './pages/LeaveManagement';
import LoanManagement from './pages/LoanManagement';
import PayslipManagement from './pages/PayslipManagement';
import EmployeeManagement from './pages/EmployeeManagement';
import AdminSettings from './pages/AdminSettings';
import SuperiorDashboard from './pages/SuperiorDashboard';
import SuperiorAttendance from './pages/SuperiorAttendance';
import SuperiorLeaves from './pages/SuperiorLeaves';
import SuperiorLoans from './pages/SuperiorLoans';
import SuperiorPayroll from './pages/SuperiorPayroll';

// Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/login" />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/requests" element={<ProtectedRoute requiredRole="admin"><AdminRequests /></ProtectedRoute>} />
      <Route path="/admin/employees" element={<ProtectedRoute requiredRole="admin"><EmployeeManagement /></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute requiredRole="admin"><AttendanceManagement /></ProtectedRoute>} />
      <Route path="/admin/salary" element={<ProtectedRoute requiredRole="admin"><SalaryManagement /></ProtectedRoute>} />
      <Route path="/admin/leaves" element={<ProtectedRoute requiredRole="admin"><LeaveManagement /></ProtectedRoute>} />
      <Route path="/admin/loans" element={<ProtectedRoute requiredRole="admin"><LoanManagement /></ProtectedRoute>} />
      <Route path="/admin/payslips" element={<ProtectedRoute requiredRole="admin"><PayslipManagement /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />

      {/* Employee Routes */}
      <Route path="/employee/dashboard" element={<ProtectedRoute requiredRole="employee"><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/leaves" element={<ProtectedRoute requiredRole="employee"><LeaveManagement /></ProtectedRoute>} />
      <Route path="/employee/loans" element={<ProtectedRoute requiredRole="employee"><LoanManagement /></ProtectedRoute>} />
      <Route path="/employee/payslips" element={<ProtectedRoute requiredRole="employee"><PayslipManagement /></ProtectedRoute>} />

      {/* Superior Routes */}
      <Route path="/superior/dashboard" element={<ProtectedRoute requiredRole="superior"><SuperiorDashboard /></ProtectedRoute>} />
      <Route path="/superior/attendance" element={<ProtectedRoute requiredRole="superior"><SuperiorAttendance /></ProtectedRoute>} />
      <Route path="/superior/leaves" element={<ProtectedRoute requiredRole="superior"><SuperiorLeaves /></ProtectedRoute>} />
      <Route path="/superior/loans" element={<ProtectedRoute requiredRole="superior"><SuperiorLoans /></ProtectedRoute>} />
      <Route path="/superior/payroll" element={<ProtectedRoute requiredRole="superior"><SuperiorPayroll /></ProtectedRoute>} />

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppRoutes />
      </Router>
    </Provider>
  );
}

export default App;
