const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Route files
const auth = require('./routes/authRoutes');
const photos = require('./routes/photoRoutes');
const folders = require('./routes/folderRoutes');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Mount routers
app.use('/api/auth', auth);
app.use('/api/photos', photos);
app.use('/api/folders', folders);

module.exports = app;
