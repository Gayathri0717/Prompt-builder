const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const promptRoutes = require('./routes/promptRoutes');
const superviseRoutes = require('./routes/supervise.js');

const cors = require('cors');

dotenv.config();
connectDB();

console.log("🟢 OLLAMA_URL =", process.env.OLLAMA_URL);


const app = express();
app.use(express.json());
app.use(cors());


// Routes
app.use('/api/users', userRoutes);
app.use('/api/prompts', promptRoutes);
// Add your new supervision route
app.use("/api/supervise", superviseRoutes);
// Error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
