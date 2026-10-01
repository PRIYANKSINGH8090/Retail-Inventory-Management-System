import { useEffect, useState } from "react";
import api, { errMsg, money, fmtDate } from "../../api";

const PAY_STATUSES = ["Pending", "Paid", "Failed", "Refunded"];

export default function Payments() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const res = await api.get("/orders/admin/all");
      setOrders(res.data.data || []);
    } catch (err) {
      setError(errMsg(err, "Failed to load payments"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changePayment = async (order, paymentStatus) => {
    try {
      setError("");
      await api.patch(`/orders/admin/${order._id}/payment`, { paymentStatus });
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const q = search.trim().toLowerCase();
  const rows = orders.filter(
    (o) =>
      (!status || o.paymentStatus === status) &&
      (!q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q))
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Payments</h1>
          <p>Track customer payment transactions.</p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <section className="admin-panel" style={{ marginTop: 0 }}>
        <div className="admin-toolbar">
          <input
            placeholder="Search order or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {PAY_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="admin-empty">Loading payments...</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">
            <h3>No payments found</h3>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th><th>Customer</th><th>Date</th><th>Method</th><th>Amount</th><th>Payment status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o._id}>
                    <td>{o.orderNumber}</td>
                    <td>{o.customerName}</td>
                    <td>{fmtDate(o.createdAt)}</td>
                    <td>{o.paymentMethod}</td>
                    <td>{money(o.totalAmount)}</td>
                    <td>
                      <select
                        value={o.paymentStatus}
                        onChange={(e) => changePayment(o, e.target.value)}
                        style={{ padding: "6px 8px", borderRadius: 5, border: "1px solid #cbd3d7" }}
                      >
                        {PAY_STATUSES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
