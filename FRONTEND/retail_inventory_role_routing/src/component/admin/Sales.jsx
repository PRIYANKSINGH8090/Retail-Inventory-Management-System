import { useEffect, useState } from "react";
import api, { errMsg, money, fmtDate } from "../../api";

export default function Sales() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const res = await api.get("/orders/admin/sales", { params: { days } });
        setData(res.data.data);
      } catch (err) {
        setError(errMsg(err, "Failed to load sales"));
      }
    };
    load();
  }, [days]);

  const maxDaily = data ? Math.max(1, ...data.daily.map((d) => d.revenue)) : 1;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Sales</h1>
          <p>Revenue and order performance (cancelled orders excluded).</p>
        </div>

        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          style={{ padding: 10, borderRadius: 5, border: "1px solid #cbd3d7" }}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last 12 months</option>
        </select>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {!data && !error && <div className="admin-empty">Loading sales...</div>}

      {data && (
        <>
          <div className="admin-cards">
            <div className="admin-card"><span>Revenue</span><strong>{money(data.revenue)}</strong></div>
            <div className="admin-card"><span>Orders</span><strong>{data.orders}</strong></div>
            <div className="admin-card"><span>Units sold</span><strong>{data.units}</strong></div>
            <div className="admin-card"><span>Avg. order value</span><strong>{money(data.averageOrderValue)}</strong></div>
          </div>

          <section className="admin-panel">
            <h2>Orders by status</h2>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {Object.entries(data.statusCounts).map(([s, c]) => (
                <div key={s}>
                  <div style={{ color: "#68757b", fontSize: 13 }}>{s}</div>
                  <strong style={{ fontSize: 22 }}>{c}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-panel">
            <h2>Daily revenue</h2>
            {data.daily.length === 0 ? (
              <div className="admin-empty">No sales in this period.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr><th>Date</th><th>Orders</th><th>Revenue</th><th style={{ width: "40%" }}></th></tr>
                  </thead>
                  <tbody>
                    {[...data.daily].reverse().map((d) => (
                      <tr key={d.date}>
                        <td>{fmtDate(d.date)}</td>
                        <td>{d.orders}</td>
                        <td>{money(d.revenue)}</td>
                        <td>
                          <div
                            style={{
                              height: 10,
                              width: `${(d.revenue / maxDaily) * 100}%`,
                              background: "#167e9b",
                              borderRadius: 5,
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="admin-panel">
            <h2>Top products</h2>
            {data.topProducts.length === 0 ? (
              <div className="admin-empty">No sales in this period.</div>
            ) : (
              <table className="admin-table">
                <thead><tr><th>Product</th><th>Units</th><th>Revenue</th></tr></thead>
                <tbody>
                  {data.topProducts.map((p) => (
                    <tr key={p.productId}>
                      <td>{p.name}</td><td>{p.units}</td><td>{money(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="admin-panel">
            <h2>Recent sales</h2>
            {data.recent.length === 0 ? (
              <div className="admin-empty">No sales in this period.</div>
            ) : (
              <table className="admin-table">
                <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th></tr></thead>
                <tbody>
                  {data.recent.map((o) => (
                    <tr key={o._id}>
                      <td>{o.orderNumber}</td>
                      <td>{o.customerName}</td>
                      <td>{fmtDate(o.createdAt)}</td>
                      <td>{o.status}</td>
                      <td>{money(o.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}
