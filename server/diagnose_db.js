const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Try loading from multiple possible locations
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('--- DB DIAGNOSTIC START ---');
console.log('Current Directory:', __dirname);
console.log('MONGO_URI defined:', !!process.env.MONGO_URI);

if (process.env.MONGO_URI) {
  // Show partial URI for verification (hide password)
  const uri = process.env.MONGO_URI;
  const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
  console.log('MONGO_URI Value:', maskedUri);
} else {
  console.error('CRITICAL: MONGO_URI is missing from .env!');
}

const testConnection = async () => {
  if (!process.env.MONGO_URI) return;

  try {
    console.log('Attempting to connect to MongoDB (5s timeout)...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ SUCCESS: Connected to MongoDB!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ CONNECTION FAILED:');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('HINT: Is your MongoDB server running? Check if the service is active.');
    } else if (error.message.includes('bad auth')) {
      console.log('HINT: Check your username and password in MONGO_URI.');
    }
  }
};

testConnection();
