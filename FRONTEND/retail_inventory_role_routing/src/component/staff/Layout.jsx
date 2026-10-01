import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../admin/admin.css";

export default function StaffLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminLoggedIn");
    navigate("/", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    isActive ? "admin-nav-link active" : "admin-nav-link";

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">Dockside</div>

        <nav className="admin-nav">
          <NavLink to="/staff/catalogue" className={linkClass}>
            Catalogue
          </NavLink>

          <NavLink to="/staff/suppliers-purchasing" className={linkClass}>
            Suppliers & purchasing
          </NavLink>

          <NavLink to="/staff/inventory" className={linkClass}>
            Inventory
          </NavLink>

          <NavLink to="/staff/orders" className={linkClass}>
            Orders
          </NavLink>

          <NavLink to="/staff/sales" className={linkClass}>
            Sales
          </NavLink>

          <NavLink to="/staff/payments" className={linkClass}>
            Payments
          </NavLink>
        </nav>

        <div className="admin-sidebar-bottom">
          <button className="admin-logout" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
