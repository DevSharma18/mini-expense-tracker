const express = require("express");
const mongoose = require("mongoose");
const Expense = require("../models/Expense");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      res.status(400).json({ error: messages[0] });
    } else if (err.name === "CastError") {
      res.status(400).json({ error: "Invalid data" });
    } else {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
});

router.get("/", async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const expenses = await Expense.find(filter).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const result = await Expense.aggregate([
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    const summary = result.map((row) => ({
      category: row._id,
      total: row.total,
    }));

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: "Expense not found" });
    }

    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
