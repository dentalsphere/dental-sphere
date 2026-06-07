// netlify/functions/api.js
// Netlify serverless function entry point that wraps the Express app using serverless-http
const serverless = require('serverless-http');
// Require the Express app from the project root
const app = require('../../server');

exports.handler = serverless(app);
