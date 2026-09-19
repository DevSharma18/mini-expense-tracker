const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    minlength: [2, "Title must be at least 2 chars"]
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    validate: {
      validator: (value) => value > 0,
      message: "Amount must be greater than 0",
    },
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: {
      values: ["food", "travel", "bills", "shopping", "other"],
      message: "Category must be one of: food, travel, bills, shopping, other",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Expense", expenseSchema);
