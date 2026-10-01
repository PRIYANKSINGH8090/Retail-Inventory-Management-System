import { Fragment, useEffect, useState } from "react";
import api, { errMsg, money, fmtDate } from "../../api";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const COLORS = {
  Pending: "#b7791f",
  Processing: "#2b6cb0",
  Shipped: "#6b46c1",
  Delivered: "#2f855a",
  Cancelled: "#c53030",
};

export default function ADorders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openId, setOpenId] = useState("");

  const load = async () => {
    try {
      setError("");
      const res = await api.get("/orders/admin/all", {
        params: { search: search.trim() || undefined, status: status || undefined },
      });
      setOrders(res.data.data || []);
    } catch (err) {
      setError(errMsg(err, "Failed to load orders"));
    } finally {
      setLoading(false);
    }
  };

  // reload when filter changes, and (debounced) while typing
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  const changeStatus = async (order, next) => {
    if (next === order.status) return;

    if (next === "Cancelled" && !window.confirm("Cancel this order? Stock will be returned to inventory.")) {
      return;
    }

    try {
      setError("");
      await api.patch(`/orders/admin/${order._id}/status`, { status: next });
      setSuccess(`${order.orderNumber} is now ${next}`);
      setTimeout(() => setSuccess(""), 2500);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Orders</h1>
          <p>View and manage customer orders.</p>
        </div>
      </div>

      {success && <div className="admin-success">{success}</div>}
      {error && <div className="admin-error">{error}</div>}

      <section className="admin-panel" style={{ marginTop: 0 }}>
        <div className="admin-toolbar">
          <input
            placeholder="Search order no, customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="admin-empty">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="admin-empty">
            <h3>No orders found</h3>
            <p>Customer orders will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {orders.map((o) => {
                  const locked = o.status === "Delivered" || o.status === "Cancelled";

                  return (
                    <Fragment key={o._id}>
                      <tr>
                        <td><strong>{o.orderNumber}</strong></td>
                        <td>
                          {o.customerName}
                          <br />
                          <small style={{ color: "#68757b" }}>{o.customerEmail}</small>
                        </td>
                        <td>{fmtDate(o.createdAt)}</td>
                        <td>{money(o.totalAmount)}</td>
                        <td>
                          {o.paymentMethod}
                          <br />
                          <small style={{ color: "#68757b" }}>{o.paymentStatus}</small>
                        </td>
                        <td>
                          <select
                            value={o.status}
                            disabled={locked}
                            onChange={(e) => changeStatus(o, e.target.value)}
                            style={{
                              padding: "6px 8px",
                              borderRadius: 5,
                              border: `1px solid ${COLORS[o.status]}`,
                              color: COLORS[o.status],
                              fontWeight: 600,
                              background: "white",
                            }}
                          >
                            {STATUSES.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            className="admin-btn"
                            style={{ padding: "6px 12px" }}
                            onClick={() => setOpenId(openId === o._id ? "" : o._id)}
                          >
                            {openId === o._id ? "Hide" : "View"}
                          </button>
                        </td>
                      </tr>

                      {openId === o._id && (
                        <tr>
                          <td colSpan={7} style={{ background: "#fafbfb" }}>
                            {o.items.map((i, idx) => (
                              <div key={idx}>
                                {i.quantity} × {i.name} @ {money(i.price)} = {money(i.price * i.quantity)}
                              </div>
                            ))}
                            <div style={{ marginTop: 10, color: "#59666c" }}>
                              Ship to: {o.shippingAddress?.fullName} ({o.shippingAddress?.phone}),{" "}
                              {o.shippingAddress?.line1}, {o.shippingAddress?.city},{" "}
                              {o.shippingAddress?.state} {o.shippingAddress?.pincode}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
