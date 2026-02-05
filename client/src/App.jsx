import { useEffect, useMemo, useState } from "react";
import { api } from "./lib/api";
import "./App.css";
import logo from "./assets/TRACKER.png";

function toISODateInputValue(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

export default function App() {
  // list state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // form state
  const [editingId, setEditingId] = useState(null);
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(toISODateInputValue());
  const [note, setNote] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/transactions");
      setItems(res.data);
    } catch {
      setError("Failed to load transactions. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of items) {
      const amt = Number(t.amount) || 0;
      if (t.type === "income") income += amt;
      else expense += amt;
    }
    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [items]);

  function startEdit(t) {
    setEditingId(t._id);
    setType(t.type);
    setAmount(String(t.amount));
    setCategory(t.category);
    setNote(t.note || "");
    setDate(new Date(t.date).toISOString().slice(0, 10));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setType("expense");
    setAmount("");
    setCategory("Food");
    setNote("");
    setDate(toISODateInputValue());
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Amount must be a number greater than 0.");
      return;
    }
    if (!category.trim()) {
      setError("Category is required.");
      return;
    }
    if (!date) {
      setError("Date is required.");
      return;
    }

    const payload = {
      type,
      amount: amt,
      category: category.trim(),
      note: note.trim(),
      date,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        // EDIT
        const res = await api.patch(`/api/transactions/${editingId}`, payload);
        setItems((prev) => prev.map((t) => (t._id === editingId ? res.data : t)));
        setEditingId(null);
      } else {
        // CREATE
        const res = await api.post("/api/transactions", payload);
        setItems((prev) => [res.data, ...prev]);
      }

      // reset form
      setAmount("");
      setCategory("Food");
      setNote("");
      setDate(toISODateInputValue());
    } catch {
      setError("Failed to save transaction.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this transaction?")) return;

    setDeletingId(id);
    setError("");
    try {
      await api.delete(`/api/transactions/${id}`);
      setItems((prev) => prev.filter((t) => t._id !== id));
      if (editingId === id) cancelEdit();
    } catch {
      setError("Failed to delete transaction.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <img className="logo" src={logo} alt="Finance Tracker" />
          <div>
            <h1>Finance Tracker</h1>
            <p className="muted">Track expenses, income, and your balance.</p>
          </div>
        </div>

        <div className="totals">
          <div className="card mini">
            <div className="muted">Income</div>
            <div className="money">{totals.income.toFixed(2)}</div>
          </div>
          <div className="card mini">
            <div className="muted">Expense</div>
            <div className="money">{totals.expense.toFixed(2)}</div>
          </div>
          <div className="card mini">
            <div className="muted">Balance</div>
            <div className="money">{totals.balance.toFixed(2)}</div>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="grid">
          {/* FORM */}
          <form onSubmit={onSubmit} className="panel">
            <div className="panelHeader">
              <h2 className="h2">{editingId ? "Edit transaction" : "Add transaction"}</h2>
              <span className="badge">{type}</span>
            </div>

            {error && <div className="errorBox">{error}</div>}

            <div className="formGrid">
              <label className="label">
                <span className="labelText">Type</span>
                <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>

              <label className="label">
                <span className="labelText">Amount</span>
                <input
                  className="input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 20"
                  inputMode="decimal"
                />
              </label>

              <label className="label">
                <span className="labelText">Category</span>
                <input
                  className="input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Food"
                />
              </label>

              <label className="label">
                <span className="labelText">Date</span>
                <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>

              <label className="label full">
                <span className="labelText">Note (optional)</span>
                <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Pizza" />
              </label>
            </div>

            <div className="btnRow">
              <button className="btn primary" type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editingId ? "Update transaction" : "Add transaction"}
              </button>

              {editingId && (
                <button className="btn" type="button" onClick={cancelEdit} disabled={submitting}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* LIST */}
          <section className="panel">
            <div className="panelHeader">
              <h2 className="h2">Transactions</h2>
              <button className="btn" type="button" onClick={load} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {loading && <div className="muted">Loading…</div>}

            {!loading && items.length === 0 && <div className="muted">No transactions yet. Add one on the left.</div>}

            <ul className="list">
              {items.map((t) => (
                <li key={t._id} className="row">
                  <div className="rowMain">
                    <div className="rowTop">
                      <span className={`pill ${t.type}`}>{t.type}</span>
                      <span className="cat">{t.category}</span>
                      <span className="money strong">{Number(t.amount).toFixed(2)}</span>
                    </div>
                    <div className="rowBottom muted">
                      <span>{new Date(t.date).toLocaleDateString()}</span>
                      {t.note ? <span>— {t.note}</span> : null}
                    </div>
                  </div>

                  <div className="rowActions">
                    <button className="btn small" type="button" onClick={() => startEdit(t)}>
                      Edit
                    </button>
                    <button
                      className="btn small danger"
                      type="button"
                      onClick={() => onDelete(t._id)}
                      disabled={deletingId === t._id}
                    >
                      {deletingId === t._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <footer className="footer muted">
        Built with React + Node.js + MongoDB • CRUD • Responsive UI
      </footer>
    </div>
  );
}