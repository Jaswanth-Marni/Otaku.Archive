const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Route Middlewares
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));
}

module.exports = app;
