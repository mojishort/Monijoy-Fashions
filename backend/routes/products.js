const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// @route   GET /api/products
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// @route   POST /api/products
router.post("/", async (req, res) => {
  try {
    console.log("➡️ Incoming product:", req.body); // ✅ log to check

    const newProduct = new Product(req.body);
    const saved = await newProduct.save();

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route   DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(204).end(); // No content
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; // ✅ export router LAST
