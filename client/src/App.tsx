import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import PublicLayout from "./components/PublicLayout";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import SplashScreen from "./components/SplashScreen";

import Home from "./pages/public/Home";
import Cars from "./pages/public/Cars";
import CarDetails from "./pages/public/CarDetails";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import ForgotPassword from "./pages/public/ForgotPassword";
import ResetPassword from "./pages/public/ResetPassword";
import Packages from "./pages/public/Packages";
import Services from "./pages/public/Services";
import FAQ from "./pages/public/FAQ";
import Blog from "./pages/public/Blog";
import NotFound from "./pages/NotFound";

import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerBookings from "./pages/customer/CustomerBookings";
import CustomerProfile from "./pages/customer/CustomerProfile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCars from "./pages/admin/AdminCars";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminReports from "./pages/admin/AdminReports";
import AdminReviews from "./pages/admin/AdminReviews";
import { NavItem } from "./components/DashboardLayout";
import { LayoutDashboard, CalendarCheck, UserCircle, Car, Users, Wallet, BarChart3, Star } from "lucide-react";

const customerNav: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: <LayoutDashboard /> },
  { to: "/dashboard/bookings", label: "My bookings", icon: <CalendarCheck /> },
  { to: "/dashboard/profile", label: "Profile", icon: <UserCircle /> },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: <LayoutDashboard /> },
  { to: "/admin/cars", label: "Vehicle directory", icon: <Car /> },
  { to: "/admin/customers", label: "Owners directory", icon: <Users /> },
  { to: "/admin/bookings", label: "Bookings", icon: <CalendarCheck />, badgeKey: "pendingBookings" },
  { to: "/admin/payments", label: "Payments", icon: <Wallet /> },
  { to: "/admin/reports", label: "Reports", icon: <BarChart3 /> },
  { to: "/admin/reviews", label: "Reviews", icon: <Star /> },
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/services" element={<Services />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/blog" element={<Blog />} />
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
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}