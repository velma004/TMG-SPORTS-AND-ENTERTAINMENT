const fetch = require('node-fetch');

const BIN_ID = '6876d37a2a92ba0befe7afb4'; // Replace with your Bin ID
const API_KEY = process.env.JSONBIN_API_KEY; // Store your API key in environment variable

exports.handler = async function(event, context) {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch updates');
    }

    const data = await response.json();
    const updates = data.record || {};

    return {
      statusCode: 200,
      body: JSON.stringify(updates),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch updates' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    };
  }
};
