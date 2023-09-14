import express from 'express';
// import dotenv from 'dotenv';

// Create an Express application
const app = express();

// Define a route for the root URL
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Specify the port to listen on
const port = parseInt(process.env.PORT || '5000', 10);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
