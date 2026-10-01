import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./admin.css";

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    navigate("/", { replace: true });
  };

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">

        <div className="admin-logo">
          Dockside
        </div>

        <nav className="admin-nav">

          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/catalogue"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            Catalogue
          </NavLink>

          <NavLink
            to="/admin/suppliers-purchasing"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            Suppliers & purchasing
          </NavLink>

          <NavLink
            to="/admin/inventory"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            Inventory
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            Orders
          </NavLink>

          <NavLink
            to="/admin/sales"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            Sales
          </NavLink>

          <NavLink
            to="/admin/payments"
            className={({ isActive }) =>
              isActive ? "admin-nav-link active" : "admin-nav-link"
            }
          >
            Payments
          </NavLink>

        

        </nav>

        <div className="admin-sidebar-bottom">

       <NavLink
  to="/admin/create-accounts"
  className={({ isActive }) =>
    isActive ? "admin-nav-link active" : "admin-nav-link"
  }
>
  Create Staff / Supplier
</NavLink>
       



          <button
            className="admin-logout"
            onClick={logout}
          >
            Sign out
          </button>

        </div>

      </aside>


      {/* ADMIN PAGE */}
      <main className="admin-content">
        <Outlet />
      </main>

    </div>
  );
}