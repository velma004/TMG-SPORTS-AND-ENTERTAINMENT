const fetch = require('node-fetch');

const BIN_ID = '6876d37a2a92ba0befe7afb4'; // Replace with your Bin ID
const API_KEY = process.env.JSONBIN_API_KEY; // Store your API key in environment variable

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { category, text, image, caption } = data;

    if (!category || !text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Category and text are required' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      };
    }

    // Fetch current updates from JSONBin
    const getResponse = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!getResponse.ok) {
      throw new Error('Failed to fetch current updates');
    }

    const getData = await getResponse.json();
    let updates = getData.record || {};

    if (!updates[category]) {
      updates[category] = [];
    }

    updates[category].push({ text, image, caption });

    // Save updated updates back to JSONBin
    const putResponse = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'X-Master-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!putResponse.ok) {
      throw new Error('Failed to save update');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Update saved successfully' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  } catch (err) {
    console.error('Error in postUpdates:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Internal Server Error' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }
};
