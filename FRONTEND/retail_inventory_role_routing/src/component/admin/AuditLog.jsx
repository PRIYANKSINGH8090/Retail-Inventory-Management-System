export default function AuditLog() {
  return (
    <div>
      <div className="page-header">
        <h1>Audit log</h1>
        <p>Track important actions performed in the system.</p>
      </div>

      <section className="panel">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan="4" className="table-empty">
                No audit activity yet.
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
