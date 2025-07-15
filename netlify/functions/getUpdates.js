const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    const updatesPath = path.join(__dirname, '..', '..', 'updates.json');
    const data = fs.readFileSync(updatesPath, 'utf-8');
    const updates = JSON.parse(data);

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
      body: JSON.stringify({ error: 'Failed to read updates' }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
};
