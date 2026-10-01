import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./Customer.css";
import api from "../../api";

export default function CustomerLayout() {
  const navigate = useNavigate();

  const readUser = () => {
    try {
      return JSON.parse(localStorage.getItem("authUser")) || {};
    } catch {
      return {};
    }
  };

  const [user, setUser] = useState(readUser);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const res = await api.get("/cart");
        setCartCount(res.data.data.count);
      } catch {
        /* ignore */
      }
    };
    const refreshUser = () => setUser(readUser());

    loadCount();
    window.addEventListener("cart-updated", loadCount);
    window.addEventListener("user-updated", refreshUser);
    return () => {
      window.removeEventListener("cart-updated", loadCount);
      window.removeEventListener("user-updated", refreshUser);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    navigate("/", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `customer-link ${isActive ? "active" : ""}`;

  return (
    <div className="customer-layout">

      {/* SIDEBAR */}

      <aside className="customer-sidebar">

        <div className="customer-logo">
          Dockside
        </div>

        <nav className="customer-nav">

          <NavLink
            to="/customer/shop"
            className={linkClass}
          >
            Shop
          </NavLink>

          <NavLink
            to="/customer/cart"
            className={linkClass}
          >
            Cart{cartCount > 0 ? ` (${cartCount})` : ""}
          </NavLink>

          <NavLink
            to="/customer/orders"
            className={linkClass}
          >
            My orders
          </NavLink>

          <NavLink
            to="/customer/profile"
            className={linkClass}
          >
            Profile & addresses
          </NavLink>

        </nav>


        {/* USER */}

        <div className="customer-user">

          <div className="customer-user-name">
            {user.fullName || "Customer"}
          </div>

          <div className="customer-user-role">
            Customer
          </div>

          <button className="signout-btn" onClick={logout}>
            Sign out
          </button>

        </div>

      </aside>


      {/* PAGE */}

      <main className="customer-content">

        <Outlet />

      </main>

    </div>
  );
}