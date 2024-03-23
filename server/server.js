// Import required modules
const express = require('express');

// Create an Express application
const app = express();

// Define a port number
const PORT = process.env.PORT || 5000;

// Define a route handler for the root URL
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server and listen on the defined port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
