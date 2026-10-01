import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  useLocation,
} from "react-router-dom";

// CUSTOMER
import Login from "./component/Login";
import Register from "./component/Register";
import CustomerLayout from "./component/customer/CustomerLayout";
import Cart from "./component/customer/Cart";
import Orders from "./component/customer/Orders";
import Profile from "./component/customer/Profile";
import Shop from "./component/customer/Shop";

// ADMIN
import AdminLogin from "./component/admin/AdminLogin";
import AdminLayout from "./component/admin/AdminLayout";
import ADcatalogue from "./component/admin/ADcatalogue";
import ADorders from "./component/admin/ADorders";

import CreateStaff from "./component/admin/CreateStaff";
import Dashboard from "./component/admin/Dashboard";
import Inventory from "./component/admin/Inventory";
import Payments from "./component/admin/Payments";
import Sales from "./component/admin/Sales";
import SuppliersPurchasing from "./component/admin/SuppliersPurchasing";

import StaffLayout from "./component/staff/Layout";

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("authUser"));
  } catch {
    return null;
  }
}

function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const user = getLoggedInUser();

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getHomeRoute(user.role)} replace />;
  }

  return <Outlet />;
}

function getHomeRoute(role) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "staff":
      return "/staff/catalogue";
    case "customer":
    default:
      return "/customer/shop";
  }
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">

      {/* LOGIN / REGISTER */}
      <Route index element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="admin-login" element={<AdminLogin />} />

      {/* CUSTOMER DOMAIN */}
      <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
        <Route path="customer" element={<CustomerLayout />}>
          <Route index element={<Navigate to="shop" replace />} />
          <Route path="shop" element={<Shop />} />
          <Route path="cart" element={<Cart />} />
          <Route path="orders" element={<Orders />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* STAFF DOMAIN */}
      <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
        <Route path="staff" element={<StaffLayout />}>
          <Route index element={<Navigate to="catalogue" replace />} />
          <Route path="catalogue" element={<ADcatalogue />} />
          <Route path="suppliers-purchasing" element={<SuppliersPurchasing />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<ADorders />} />
          <Route path="sales" element={<Sales />} />
          <Route path="payments" element={<Payments />} />
        </Route>
      </Route>

      {/* ADMIN DOMAIN */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="catalogue" element={<ADcatalogue />} />
          <Route path="suppliers-purchasing" element={<SuppliersPurchasing />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<ADorders />} />
          <Route path="sales" element={<Sales />} />
          <Route path="payments" element={<Payments />} />
        
          <Route path="create-accounts" element={<CreateStaff />} />
          <Route path="create-staff" element={<CreateStaff />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);



// import React from "react";
// import ReactDOM from "react-dom/client";
// import "./index.css";

// import {
//   createBrowserRouter,
//   createRoutesFromElements,
//   Navigate,
//   Route,
//   RouterProvider,
// } from "react-router-dom";

// import Login from "./component/Login";
// import Register from "./component/Register";

// import CustomerLayout from "./component/customer/CustomerLayout";
// import Cart from "./component/customer/Cart";
// import Orders from "./component/customer/Orders";
// import Profile from "./component/customer/Profile";
// import Shop from "./component/customer/Shop";

// import AdminLogin from "./component/admin/AdminLogin";
// import AdminLayout from "./component/admin/AdminLayout";
// import ADcatalogue from "./component/admin/ADcatalogue";
// import ADorders from "./component/admin/ADorders";
// import AuditLog from "./component/admin/AuditLog";
// import CreateStaff from "./component/admin/CreateStaff";
// import Dashboard from "./component/admin/Dashboard";
// import Inventory from "./component/admin/Inventory";
// import Payments from "./component/admin/Payments";
// import SuppliersPurchasing from "./component/admin/SuppliersPurchasing";

// import StaffLayout from "./component/staff/Layout";

// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route path="/">
//       <Route index element={<Login />} />
//       <Route path="register" element={<Register />} />
//       <Route path="admin-login" element={<AdminLogin />} />

//       <Route path="customer" element={<CustomerLayout />}>
//         <Route index element={<Navigate to="shop" replace />} />
//         <Route path="shop" element={<Shop />} />
//         <Route path="cart" element={<Cart />} />
//         <Route path="orders" element={<Orders />} />
//         <Route path="profile" element={<Profile />} />
//       </Route>

//       <Route path="staff" element={<StaffLayout />}>
//         <Route index element={<Navigate to="catalogue" replace />} />
//         <Route path="catalogue" element={<ADcatalogue />} />
//         <Route
//           path="suppliers-purchasing"
//           element={<SuppliersPurchasing />}
//         />
//         <Route path="inventory" element={<Inventory />} />
//         <Route path="orders" element={<ADorders />} />
//         <Route path="payments" element={<Payments />} />
//       </Route>

//       <Route path="admin" element={<AdminLayout />}>
//         <Route index element={<Navigate to="dashboard" replace />} />
//         <Route path="dashboard" element={<Dashboard />} />
//         <Route path="catalogue" element={<ADcatalogue />} />
//         <Route
//           path="suppliers-purchasing"
//           element={<SuppliersPurchasing />}
//         />
//         <Route path="inventory" element={<Inventory />} />
//         <Route path="orders" element={<ADorders />} />
//         <Route path="payments" element={<Payments />} />
//         <Route path="audit-log" element={<AuditLog />} />
//         <Route path="create-accounts" element={<CreateStaff />} />
//         <Route path="create-staff" element={<CreateStaff />} />
//       </Route>

//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Route>
//   )
// );

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <RouterProvider router={router} />
//   </React.StrictMode>
// );
