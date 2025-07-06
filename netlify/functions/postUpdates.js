let updates = {
  sports: [],
  entertainment: []
};

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: {
        'Content-Type': 'application/json'
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
          'Content-Type': 'application/json'
        }
      };
    }

    if (!updates[category]) {
      updates[category] = [];
    }

    updates[category].push({ text, image, caption });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Update added successfully' }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
};
