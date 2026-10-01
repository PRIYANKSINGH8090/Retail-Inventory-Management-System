import { useEffect, useState } from "react";
import api, { errMsg, money, notifyCartChanged } from "../../api";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [cartQty, setCartQty] = useState({}); // productId -> qty in cart
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");
  const [selected, setSelected] = useState(null);

  const loadCart = async () => {
    try {
      const res = await api.get("/cart");
      const map = {};
      res.data.data.items.forEach((i) => (map[i.productId] = i.quantity));
      setCartQty(map);
    } catch {
      /* cart is optional for browsing */
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/shop/products");
      setProducts(res.data.data || []);
    } catch (err) {
      setError(errMsg(err, "Failed to load products"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2500);
  };

  const addToCart = async (product) => {
    try {
      setBusyId(product.productId);
      setError("");
      const res = await api.post("/cart/add", {
        productId: product.productId,
        quantity: 1,
      });
      const map = {};
      res.data.data.items.forEach((i) => (map[i.productId] = i.quantity));
      setCartQty(map);
      notifyCartChanged();
      showNotice(`${product.name} added to cart`);
    } catch (err) {
      setError(errMsg(err, "Could not add to cart"));
    } finally {
      setBusyId("");
    }
  };

  const categories = [...new Set(products.map((p) => p.categoryId))];

  const filtered = products.filter((p) => {
    const okSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const okCat = category === "" || p.categoryId === category;
    return okSearch && okCat;
  });

  return (
    <div>
      <div className="page-header">
        <h1>Shop</h1>

        <div className="shop-actions">
          <input
            className="search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {notice && (
        <div className="empty-box" style={{ marginBottom: 16, color: "#55d58b" }}>
          {notice}
        </div>
      )}
      {error && (
        <div className="empty-box" style={{ marginBottom: 16, color: "#ff6347" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="empty-box">Loading products...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-box">No products found.</div>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => {
            const out = p.quantity <= 0;
            const low = !out && p.quantity < p.minimumQuantity;
            const inCart = cartQty[p.productId] || 0;
            const maxed = inCart >= p.quantity;

            return (
              <div className="product-card" key={p.productId}>
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{
                      width: "100%",
                      height: 150,
                      objectFit: "contain",
                      background: "#0f2028",
                      borderRadius: 4,
                      marginBottom: 12,
                    }}
                  />
                )}

                <div className="product-category">{p.categoryId}</div>
                <h2>{p.name}</h2>
                <div className="product-price">{money(p.price)}</div>

                <div className="product-bottom">
                  <span className={`stock ${out ? "out" : low ? "low" : "in"}`}>
                    {out ? "Out of stock" : low ? `Only ${p.quantity} left` : "In stock"}
                  </span>

                  <button className="details-btn" onClick={() => setSelected(p)}>
                    Details
                  </button>

                  <button
                    className="add-cart-btn"
                    style={{ marginLeft: "auto" }}
                    disabled={out || maxed || busyId === p.productId}
                    onClick={() => addToCart(p)}
                  >
                    {out ? "Unavailable" : maxed ? "Max in cart" : "Add to cart"}
                  </button>
                </div>

                {inCart > 0 && (
                  <div className="product-details" style={{ marginTop: 10, marginBottom: 0 }}>
                    {inCart} in your cart
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILS MODAL */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 50,
          }}
        >
          <div
            className="checkout-panel"
            style={{ maxWidth: 460, width: "100%", margin: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{selected.name}</h2>
            <p className="product-details">
              {selected.productDesc || "No description available."}
            </p>
            <p className="product-details">
              Category: {selected.categoryId}
              <br />
              Price: {money(selected.price)}
              <br />
              Available: {selected.quantity}
              <br />
              Mfg: {new Date(selected.mfg).toLocaleDateString("en-IN")}
              {selected.exp && (
                <>
                  {" "}· Exp: {new Date(selected.exp).toLocaleDateString("en-IN")}
                </>
              )}
            </p>
            <button className="add-cart-btn" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
