import { Fragment, useEffect, useState } from "react";
import api, { errMsg, money, fmtDate } from "../../api";

const EMPTY_SUPPLIER = { name: "", email: "", phone: "", address: "" };

const STATUS_COLOR = {
  Ordered: "#b7791f",
  Received: "#2f855a",
  Cancelled: "#c53030",
};

export default function SuppliersPurchasing() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // add supplier
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [supplierForm, setSupplierForm] = useState(EMPTY_SUPPLIER);

  // new purchase order
  const [showPOForm, setShowPOForm] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [qtyMap, setQtyMap] = useState({}); // productId -> quantity
  const [costMap, setCostMap] = useState({}); // productId -> unit cost (optional)

  const [openId, setOpenId] = useState("");

  const load = async () => {
    try {
      const [s, p, o] = await Promise.all([
        api.get("/purchasing/suppliers"),
        api.get("/product/view"),
        api.get("/purchasing/orders"),
      ]);
      setSuppliers(s.data.data || []);
      setProducts(p.data.data || []);
      setOrders(o.data.data || []);
    } catch (err) {
      setError(errMsg(err, "Failed to load data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const flash = (msg) => {
    setSuccess(msg);
    setError("");
    setTimeout(() => setSuccess(""), 3000);
  };

  const cost = (p) => Number(p.cost?.$numberDecimal ?? p.cost ?? 0);

  /* ---------- supplier ---------- */
  const addSupplier = async () => {
    const f = supplierForm;
    if (!f.name || !f.email || !f.phone || !f.address) {
      setError("Please fill all supplier fields.");
      return;
    }
    try {
      await api.post("/supplier/register", f);
      setSupplierForm(EMPTY_SUPPLIER);
      setShowSupplierForm(false);
      flash("Supplier added");
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  /* ---------- purchase order ---------- */
  const supplier = suppliers.find((s) => s._id === supplierId);
  const supplierProducts = supplier
    ? products.filter((p) => p.supplierEmail === supplier.email)
    : [];

  const chooseSupplier = (id) => {
    setSupplierId(id);
    setQtyMap({});
    setCostMap({});
  };

  const poLines = supplierProducts
    .filter((p) => Number(qtyMap[p._id]) > 0)
    .map((p) => ({
      productId: p._id,
      name: p.name,
      quantity: Number(qtyMap[p._id]),
      unitCost:
        costMap[p._id] !== undefined && costMap[p._id] !== ""
          ? Number(costMap[p._id])
          : cost(p),
    }));

  const poTotal = poLines.reduce((s, l) => s + l.quantity * l.unitCost, 0);

  const createPO = async () => {
    if (!supplierId) return setError("Choose a supplier.");
    if (poLines.length === 0) return setError("Enter a quantity for at least one product.");

    try {
      await api.post("/purchasing/orders", {
        supplierId,
        items: poLines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitCost: l.unitCost,
        })),
      });
      setShowPOForm(false);
      setSupplierId("");
      setQtyMap({});
      setCostMap({});
      flash("Purchase order created");
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const receive = async (o) => {
    if (!window.confirm(`Mark ${o.poNumber} as received? Stock will be added to inventory.`)) return;
    try {
      await api.patch(`/purchasing/orders/${o._id}/receive`);
      flash(`${o.poNumber} received. Inventory updated.`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const cancel = async (o) => {
    if (!window.confirm(`Cancel ${o.poNumber}?`)) return;
    try {
      await api.patch(`/purchasing/orders/${o._id}/cancel`);
      flash(`${o.poNumber} cancelled`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const setS = (key) => (e) => setSupplierForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Suppliers & purchasing</h1>
          <p>Manage suppliers and purchase orders.</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="admin-btn" onClick={() => setShowSupplierForm((v) => !v)}>
            {showSupplierForm ? "Close" : "Add supplier"}
          </button>
          <button className="admin-btn" onClick={() => setShowPOForm((v) => !v)}>
            {showPOForm ? "Close" : "New purchase order"}
          </button>
        </div>
      </div>

      {success && <div className="admin-success">{success}</div>}
      {error && <div className="admin-error">{error}</div>}

      {/* ADD SUPPLIER */}
      {showSupplierForm && (
        <section className="admin-panel" style={{ marginTop: 0 }}>
          <h2>Add supplier</h2>
          <div className="admin-form">
            <div className="admin-form-group"><label>Supplier name</label><input value={supplierForm.name} onChange={setS("name")} /></div>
            <div className="admin-form-group"><label>Email</label><input type="email" value={supplierForm.email} onChange={setS("email")} /></div>
            <div className="admin-form-group"><label>Phone</label><input value={supplierForm.phone} onChange={setS("phone")} /></div>
            <div className="admin-form-group"><label>Address</label><input value={supplierForm.address} onChange={setS("address")} /></div>
            <button className="admin-btn" onClick={addSupplier}>Save supplier</button>
          </div>
        </section>
      )}

      {/* NEW PURCHASE ORDER */}
      {showPOForm && (
        <section className="admin-panel" style={{ marginTop: 0 }}>
          <h2>New purchase order</h2>

          <div className="admin-form-group" style={{ maxWidth: 400 }}>
            <label>Supplier</label>
            <select value={supplierId} onChange={(e) => chooseSupplier(e.target.value)}>
              <option value="">Select supplier</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>

          {supplierId && supplierProducts.length === 0 && (
            <div className="admin-empty">
              <h3>No products for this supplier</h3>
              <p>Add products in Catalogue using this supplier's email first.</p>
            </div>
          )}

          {supplierProducts.length > 0 && (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr><th>Product</th><th>Unit cost (₹)</th><th>Quantity to order</th><th>Line total</th></tr>
                  </thead>
                  <tbody>
                    {supplierProducts.map((p) => {
                      const qty = Number(qtyMap[p._id]) || 0;
                      const unit =
                        costMap[p._id] !== undefined && costMap[p._id] !== ""
                          ? Number(costMap[p._id])
                          : cost(p);
                      return (
                        <tr key={p._id}>
                          <td>{p.name}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              placeholder={String(cost(p))}
                              value={costMap[p._id] ?? ""}
                              onChange={(e) => setCostMap((m) => ({ ...m, [p._id]: e.target.value }))}
                              style={{ width: 110, padding: 8, border: "1px solid #cbd3d7", borderRadius: 5 }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={qtyMap[p._id] ?? ""}
                              onChange={(e) => setQtyMap((m) => ({ ...m, [p._id]: e.target.value }))}
                              style={{ width: 110, padding: 8, border: "1px solid #cbd3d7", borderRadius: 5 }}
                            />
                          </td>
                          <td>{qty > 0 ? money(qty * unit) : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
                <strong style={{ fontSize: 20 }}>Total: {money(poTotal)}</strong>
                <button className="admin-btn" onClick={createPO}>Create purchase order</button>
              </div>
            </>
          )}
        </section>
      )}

      {/* SUPPLIERS */}
      <section className="admin-panel" style={{ marginTop: 0 }}>
        <h2>Suppliers</h2>

        {loading ? (
          <div className="admin-empty">Loading...</div>
        ) : suppliers.length === 0 ? (
          <div className="admin-empty">
            <h3>No suppliers</h3>
            <p>Click "Add supplier" to add your first supplier.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Products</th></tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.phone}</td>
                    <td>{s.address}</td>
                    <td>{products.filter((p) => p.supplierEmail === s.email).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* PURCHASE ORDERS */}
      <section className="admin-panel">
        <h2>Purchase orders</h2>

        {loading ? (
          <div className="admin-empty">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="admin-empty">
            <h3>No purchase orders</h3>
            <p>Create purchase orders when stock needs replenishment.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr><th>PO</th><th>Supplier</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <Fragment key={o._id}>
                    <tr>
                      <td><strong>{o.poNumber}</strong></td>
                      <td>{o.supplierName}</td>
                      <td>{fmtDate(o.createdAt)}</td>
                      <td>{money(o.totalCost)}</td>
                      <td style={{ color: STATUS_COLOR[o.status], fontWeight: 600 }}>{o.status}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button
                          className="admin-btn"
                          style={{ padding: "6px 12px", marginRight: 6 }}
                          onClick={() => setOpenId(openId === o._id ? "" : o._id)}
                        >
                          {openId === o._id ? "Hide" : "View"}
                        </button>
                        {o.status === "Ordered" && (
                          <>
                            <button
                              className="admin-btn"
                              style={{ padding: "6px 12px", marginRight: 6, background: "#2f855a" }}
                              onClick={() => receive(o)}
                            >
                              Receive stock
                            </button>
                            <button
                              className="admin-btn"
                              style={{ padding: "6px 12px", background: "#c53030" }}
                              onClick={() => cancel(o)}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>

                    {openId === o._id && (
                      <tr>
                        <td colSpan={6} style={{ background: "#fafbfb" }}>
                          {o.items.map((i, idx) => (
                            <div key={idx}>
                              {i.quantity} × {i.name} @ {money(i.unitCost)} = {money(i.quantity * i.unitCost)}
                            </div>
                          ))}
                          {o.receivedAt && (
                            <div style={{ marginTop: 8, color: "#59666c" }}>
                              Received on {fmtDate(o.receivedAt)}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
