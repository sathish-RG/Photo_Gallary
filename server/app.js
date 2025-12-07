const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Route files
const auth = require('./routes/authRoutes');
const media = require('./routes/mediaRoutes');
const folders = require('./routes/folderRoutes');
const giftCards = require('./routes/giftCardRoutes');
const admin = require('./routes/adminRoutes');
const selectionRoutes = require('./routes/selectionRoutes');

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
app.use('/api/media', media);
app.use('/api/folders', folders);
app.use('/api/gift-cards', giftCards);
app.use('/api/templates', require('./routes/templateRoutes'));
app.use('/api/admin', admin);
app.use('/api/selections', selectionRoutes);

module.exports = app;
