#!/usr/bin/env node

// Check if email and password are provided as command line arguments
if (process.argv.length !== 4) {
  console.error('Usage: ./auth_gen.js <email> <password>');
  process.exit(1);
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

// Function to convert email and password to Base64
function toBase64(email, password) {
  const credentials = `${email}:${password}`;
  const base64Credentials = Buffer.from(credentials).toString('base64');
  return base64Credentials;
}

// Convert email and password to Base64
const base64AuthString = toBase64(email, password);

console.log('Base64 Authentication String:', base64AuthString);
