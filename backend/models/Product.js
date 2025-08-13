// backend/models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  category: String,
  description: String,
  quantity: Number,
  barcode: String,
  image: String, // Optional
});

module.exports = mongoose.model("Product", ProductSchema);
