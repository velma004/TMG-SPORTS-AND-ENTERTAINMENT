let updates = {
  sports: [],
  entertainment: []
};

exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify(updates),
    headers: {
      'Content-Type': 'application/json'
    }
  };
};
