const fs = require('fs').promises;
const path = require('path');

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
    console.log('Received event body:', event.body);
    const data = JSON.parse(event.body);
    const { category, text, image, caption } = data;

    const updatesPath = path.join(__dirname, '..', '..', 'updates.json');
    let updates;

    // If the request body contains the entire updates object (no category and text), overwrite updates.json
    if (!category && !text && typeof data === 'object') {
      updates = data;
    } else {
      // Validate required fields for single update
      if (!category || !text) {
        console.log('Missing category or text');
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

      try {
        const updatesData = await fs.readFile(updatesPath, 'utf-8');
        updates = JSON.parse(updatesData);
      } catch (fileReadError) {
        console.error('Error reading updates.json:', fileReadError);
        updates = {};
      }

      if (!updates[category]) {
        updates[category] = [];
      }

      updates[category].push({ text, image, caption });
    }

    try {
      await fs.writeFile(updatesPath, JSON.stringify(updates, null, 2), 'utf-8');
    } catch (fileWriteError) {
      console.error('Error writing updates.json:', fileWriteError);
      throw fileWriteError;
    }

    console.log('Update saved successfully');

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
      body: JSON.stringify({ error: err.message || 'Internal Server Error', stack: err.stack }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }
};
