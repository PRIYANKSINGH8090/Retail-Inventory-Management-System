import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errMsg, money, notifyCartChanged } from "../../api";

export default function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [payment, setPayment] = useState("UPI");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [cartRes, meRes] = await Promise.all([
        api.get("/cart"),
        api.get("/users/me"),
      ]);
      setCart(cartRes.data.data);

      const list = meRes.data.data.addresses || [];
      setAddresses(list);
      const def = list.find((a) => a.isDefault) || list[0];
      setAddressId((cur) => cur || def?._id || "");
    } catch (err) {
      setError(errMsg(err, "Failed to load cart"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const apply = (res) => {
    setCart(res.data.data);
    notifyCartChanged();
  };

  const changeQty = async (item, qty) => {
    try {
      setError("");
      apply(await api.patch(`/cart/item/${item.productId}`, { quantity: qty }));
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const remove = async (item) => {
    try {
      setError("");
      apply(await api.delete(`/cart/item/${item.productId}`));
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const placeOrder = async () => {
    if (!addressId) {
      setError("Please add and select a delivery address.");
      return;
    }

    try {
      setPlacing(true);
      setError("");
      await api.post("/orders", { addressId, paymentMethod: payment });
      notifyCartChanged();
      navigate("/customer/orders", { state: { placed: true } });
    } catch (err) {
      setError(errMsg(err, "Could not place order"));
      load(); // refresh stock numbers
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>Cart</h1></div>
        <div className="empty-box">Loading cart...</div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div>
        <div className="page-header"><h1>Cart</h1></div>
        {error && <div className="empty-box" style={{ color: "#ff6347", marginBottom: 16 }}>{error}</div>}
        <div className="empty-box">
          Your cart is empty. <Link to="/customer/shop" style={{ color: "#8dbbd3" }}>Go to shop</Link>
        </div>
      </div>
    );
  }

  const hasProblem = cart.items.some((i) => i.stock <= 0 || i.quantity > i.stock);

  return (
    <div>
      <div className="page-header"><h1>Cart</h1></div>

      {error && (
        <div className="empty-box" style={{ color: "#ff6347", marginBottom: 16 }}>{error}</div>
      )}

      <div className="cart-container">
        {cart.items.map((item) => (
          <div className="cart-item" key={item.productId}>
            <div className="cart-item-info">
              <h3>{item.name}</h3>
              <p>
                {money(item.price)}
                {item.stock <= 0 && <span style={{ color: "#ff4b26" }}> · Out of stock</span>}
                {item.stock > 0 && item.quantity > item.stock && (
                  <span style={{ color: "#ffbd00" }}> · Only {item.stock} left</span>
                )}
              </p>
              <button className="delete-btn" style={{ padding: 0, marginTop: 6 }} onClick={() => remove(item)}>
                Remove
              </button>
            </div>

            <div className="quantity">
              <button onClick={() => changeQty(item, item.quantity - 1)}>−</button>
              <span>{item.quantity}</span>
              <button
                disabled={item.quantity >= item.stock}
                onClick={() => changeQty(item, item.quantity + 1)}
              >
                +
              </button>
            </div>

            <div className="cart-subtotal">{money(item.subtotal)}</div>
          </div>
        ))}
      </div>

      <section className="checkout-panel">
        <h2>Checkout</h2>

        <div className="checkout-grid">
          <div>
            <label>Deliver to</label>
            {addresses.length === 0 ? (
              <div className="product-details">
                No saved address.{" "}
                <Link to="/customer/profile" style={{ color: "#8dbbd3" }}>Add one in Profile</Link>
              </div>
            ) : (
              <select value={addressId} onChange={(e) => setAddressId(e.target.value)}>
                {addresses.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.label} — {a.line1}, {a.city} {a.pincode}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label>Payment</label>
            <select value={payment} onChange={(e) => setPayment(e.target.value)}>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="COD">Cash on delivery</option>
            </select>
          </div>
        </div>

        <div className="checkout-bottom">
          <strong>{money(cart.total)}</strong>
          <button
            className="add-cart-btn"
            disabled={placing || hasProblem || addresses.length === 0}
            onClick={placeOrder}
          >
            {placing ? "Placing..." : "Place order"}
          </button>
        </div>

        {hasProblem && (
          <p className="product-details" style={{ marginTop: 12, color: "#ffbd00" }}>
            Some items are out of stock or above available quantity. Adjust them to continue.
          </p>
        )}
      </section>
    </div>
  );
}
