const mongoose = require('mongoose');

// Define mongodb connection url
const mongoURL = "mongodb://localhost:27017/hotels";

// Set up mongodb connection (removed deprecated options)
mongoose.connect(mongoURL);

// Establish the connection
const db = mongoose.connection;

// Connection successful
db.on('connected', () => {
   console.log("MongoDb is connected...");
});

// Connection error (fixed event name from 'connected' to 'error')
db.on('error', (error) => {
   console.log("MongoDb connection error: " + error);
});

// Connection disconnected (fixed event name from 'Disconnected' to 'disconnected')
db.on('disconnected', () => {
   console.log("MongoDb is disconnected...");
});

// Export the database connection
module.exports = db;