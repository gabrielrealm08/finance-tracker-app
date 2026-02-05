import { Router } from "express";
import { Transaction } from "../models/Transaction.js";

const router = Router();

// GET /api/transactions
router.get("/", async (req, res) => {
  const items = await Transaction.find().sort({ date: -1 });
  res.json(items);
});

// POST /api/transactions
router.post("/", async (req, res) => {
  const { type, amount, category, note, date } = req.body;

  if (!type || amount == null || !category || !date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const created = await Transaction.create({
    type,
    amount,
    category,
    note: note || "",
    date
  });

  res.status(201).json(created);
});


// UPDATE transaction
// PATCH /api/transactions/:id
router.patch("/:id", async (req, res) => {
  try {
    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete("/:id", async (req, res) => {
  try {
    const removed = await Transaction.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});





// DELETE /api/transactions/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const deleted = await Transaction.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Not found" });

  res.json({ ok: true });
});


export default router;