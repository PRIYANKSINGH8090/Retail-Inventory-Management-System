import { useEffect, useState } from "react";
import api, { errMsg } from "../../api";

const EMPTY = { label: "Home", fullName: "", phone: "", line1: "", city: "", state: "", pincode: "" };

export default function Profile() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data.data);
      setFullName(res.data.data.fullName);
    } catch (err) {
      setError(errMsg(err, "Failed to load profile"));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const flash = (msg) => {
    setSuccess(msg);
    setError("");
    setTimeout(() => setSuccess(""), 2500);
  };

  const saveName = async () => {
    try {
      const res = await api.patch("/users/me", { fullName });
      setUser(res.data.data);
      const stored = JSON.parse(localStorage.getItem("authUser") || "{}");
      localStorage.setItem("authUser", JSON.stringify({ ...stored, fullName: res.data.data.fullName }));
      window.dispatchEvent(new Event("user-updated"));
      flash("Profile updated");
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const addAddress = async () => {
    try {
      const res = await api.post("/users/addresses", form);
      setUser((u) => ({ ...u, addresses: res.data.data }));
      setForm(EMPTY);
      flash("Address added");
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const removeAddress = async (id) => {
    try {
      const res = await api.delete(`/users/addresses/${id}`);
      setUser((u) => ({ ...u, addresses: res.data.data }));
      flash("Address deleted");
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const makeDefault = async (id) => {
    try {
      const res = await api.patch(`/users/addresses/${id}/default`);
      setUser((u) => ({ ...u, addresses: res.data.data }));
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (!user) {
    return (
      <div>
        <div className="page-header"><h1>Profile &amp; addresses</h1></div>
        <div className="empty-box">{error || "Loading..."}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header"><h1>Profile &amp; addresses</h1></div>

      {success && <div className="empty-box" style={{ color: "#55d58b", marginBottom: 16 }}>{success}</div>}
      {error && <div className="empty-box" style={{ color: "#ff6347", marginBottom: 16 }}>{error}</div>}

      <section className="profile-panel">
        <h2>Profile</h2>
        <div className="profile-grid">
          <div>
            <label>Full name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label>Email</label>
            <input value={user.email} disabled />
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <button className="add-cart-btn" onClick={saveName}>Save</button>
        </div>
      </section>

      <section className="profile-panel">
        <h2>Saved addresses</h2>

        <div className="address-list">
          {user.addresses.length === 0 && <p className="product-details">No addresses yet.</p>}

          {user.addresses.map((a) => (
            <div className="address-card" key={a._id}>
              <div>
                <strong>{a.label}</strong> — {a.fullName} ({a.phone})
                <p>{a.line1}, {a.city}, {a.state} {a.pincode}</p>
              </div>
              <div className="address-actions">
                {a.isDefault ? (
                  <span className="default-badge">Default</span>
                ) : (
                  <button className="details-btn" onClick={() => makeDefault(a._id)}>Make default</button>
                )}
                <button className="delete-btn" onClick={() => removeAddress(a._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        <h2>Add new address</h2>
        <div className="profile-grid">
          <div><label>Label (Home / Office)</label><input value={form.label} onChange={set("label")} /></div>
          <div><label>Full name</label><input value={form.fullName} onChange={set("fullName")} /></div>
          <div><label>Phone</label><input value={form.phone} onChange={set("phone")} /></div>
          <div><label>Address line</label><input value={form.line1} onChange={set("line1")} /></div>
          <div><label>City</label><input value={form.city} onChange={set("city")} /></div>
          <div><label>State</label><input value={form.state} onChange={set("state")} /></div>
          <div><label>Pincode</label><input value={form.pincode} onChange={set("pincode")} /></div>
        </div>
        <div style={{ marginTop: 18 }}>
          <button className="add-cart-btn" onClick={addAddress}>Add address</button>
        </div>
      </section>
    </div>
  );
}
