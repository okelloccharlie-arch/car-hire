import { Routes, Route } from "react-router-dom";

import PublicLayout from "./components/PublicLayout";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/public/Home";
import Cars from "./pages/public/Cars";
import CarDetails from "./pages/public/CarDetails";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import NotFound from "./pages/NotFound";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerBookings from "./pages/customer/CustomerBookings";
import CustomerProfile from "./pages/customer/CustomerProfile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCars from "./pages/admin/AdminCars";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminBookings from "./pages/admin/AdminBookings";

const customerNav = [
  { to: "/dashboard", label: "Overview" },
  { to: "/dashboard/bookings", label: "My bookings" },
  { to: "/dashboard/profile", label: "Profile" },
];

const adminNav = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/cars", label: "Cars" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/bookings", label: "Bookings" },
];

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/cars/:id" element={<CarDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Customer area */}
      <Route element={<ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN"]} />}>
        <Route element={<DashboardLayout items={customerNav} heading="Customer area" />}>
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/dashboard/bookings" element={<CustomerBookings />} />
          <Route path="/dashboard/profile" element={<CustomerProfile />} />
        </Route>
      </Route>

      {/* Admin area */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route element={<DashboardLayout items={adminNav} heading="Admin area" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/cars" element={<AdminCars />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
