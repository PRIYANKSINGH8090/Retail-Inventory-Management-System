import { useEffect, useState } from "react";
import api, { errMsg, money } from "../../api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [inv, sales, orders] = await Promise.all([
          api.get("/inventory/view"),
          api.get("/orders/admin/sales", { params: { days: 30 } }),
          api.get("/orders/admin/all"),
        ]);

        const items = inv.data.data || [];
        const allOrders = orders.data.data || [];

        setStats({
          products: items.length,
          lowStock: items.filter((i) => i.quantity < i.minimumQuantity).length,
          outOfStock: items.filter((i) => i.quantity === 0).length,
          pending: allOrders.filter((o) => o.status === "Pending").length,
          pendingPayments: allOrders.filter(
            (o) => o.paymentStatus === "Pending" && o.status !== "Cancelled"
          ).length,
          revenue: sales.data.data.revenue,
        });
      } catch (err) {
        setError(errMsg(err, "Failed to load dashboard"));
      }
    };
    load();
  }, []);

  const v = (x) => (stats ? x : "—");

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of warehouse operations.</p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-cards">
        <div className="admin-card"><span>Products</span><strong>{v(stats?.products)}</strong></div>
        <div className="admin-card"><span>Low stock items</span><strong>{v(stats?.lowStock)}</strong></div>
        <div className="admin-card"><span>Pending orders</span><strong>{v(stats?.pending)}</strong></div>
        <div className="admin-card"><span>Pending payments</span><strong>{v(stats?.pendingPayments)}</strong></div>
      </div>

      <section className="admin-panel">
        <h2>Last 30 days</h2>
        <p>
          Revenue: <strong>{stats ? money(stats.revenue) : "—"}</strong> · Out of stock products:{" "}
          <strong>{v(stats?.outOfStock)}</strong>
        </p>
      </section>
    </div>
  );
}
