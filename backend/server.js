require("dotenv").config();
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
