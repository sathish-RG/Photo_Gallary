const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const outputPath = path.join(__dirname, '../vite-project/public/db_status.txt');

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync(outputPath, msg + '\n');
};

// Clear previous log
if (fs.existsSync(outputPath)) {
  fs.unlinkSync(outputPath);
}

log('--- DB DIAGNOSTIC ---');
log(`Time: ${new Date().toISOString()}`);
log(`MONGO_URI defined: ${!!process.env.MONGO_URI}`);

if (process.env.MONGO_URI) {
  const uri = process.env.MONGO_URI;
  const masked = uri.replace(/:([^:@]+)@/, ':****@');
  log(`MONGO_URI: ${masked}`);
}

const test = async () => {
  if (!process.env.MONGO_URI) {
    log('ERROR: MONGO_URI missing');
    process.exit(1);
  }

  try {
    log('Connecting...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    log('SUCCESS: Connected to MongoDB');
    await mongoose.connection.close();
  } catch (err) {
    log('FAILED: Could not connect');
    log(`Error: ${err.message}`);
  }
};

test();
