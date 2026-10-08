// api/index.js - Vercel Serverless Function Entry Point for AgriPool
const { handleRequest } = require('../server');

module.exports = async (req, res) => {
  return handleRequest(req, res);
};
