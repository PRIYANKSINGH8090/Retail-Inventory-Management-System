import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api, { errMsg, money, fmtDate } from "../../api";

const FLOW = ["Pending", "Processing", "Shipped", "Delivered"];
const LABEL = { Pending: "Placed" };

export default function Orders() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.placed ? "Order placed successfully!" : "");

  const load = async () => {
    try {
      const res = await api.get("/orders/my");
      setOrders(res.data.data || []);
    } catch (err) {
      setError(errMsg(err, "Failed to load orders"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async (order) => {
    if (!window.confirm(`Cancel order ${order.orderNumber}?`)) return;
    try {
      setError("");
      await api.patch(`/orders/my/${order._id}/cancel`);
      setSuccess("Order cancelled.");
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div>
      <div className="page-header"><h1>My orders</h1></div>

      {success && <div className="empty-box" style={{ color: "#55d58b", marginBottom: 16 }}>{success}</div>}
      {error && <div className="empty-box" style={{ color: "#ff6347", marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="empty-box">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="empty-box">No orders yet.</div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const current = FLOW.indexOf(order.status);
            const cancelled = order.status === "Cancelled";

            return (
              <section className="order-card" key={order._id}>
                <div className="order-header">
                  <h3>{order.orderNumber}</h3>
                  <span>{fmtDate(order.createdAt)}</span>
                </div>

                <div className="order-status">
                  {cancelled ? (
                    <span className="order-step" style={{ color: "#ff6347", borderColor: "#b72d19" }}>
                      Cancelled
                    </span>
                  ) : (
                    FLOW.map((s, i) => (
                      <span key={s} className={i <= current ? "order-step done" : "order-step"}>
                        {LABEL[s] || s}
                      </span>
                    ))
                  )}
                </div>

                <div className="order-items">
                  {order.items.map((item, i) => (
                    <div key={i}>
                      {item.quantity} × {item.name} — {money(item.price * item.quantity)}
                    </div>
                  ))}
                </div>

                <div className="product-details" style={{ marginTop: 12, marginBottom: 0 }}>
                  Deliver to: {order.shippingAddress?.fullName}, {order.shippingAddress?.line1},{" "}
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                </div>

                <div className="order-footer">
                  <strong>{money(order.totalAmount)}</strong>

                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {order.paymentMethod}
                    <span className="payment-badge">{order.paymentStatus}</span>
                    {order.status === "Pending" && (
                      <button className="delete-btn" onClick={() => cancel(order)}>
                        Cancel order
                      </button>
                    )}
                  </span>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
