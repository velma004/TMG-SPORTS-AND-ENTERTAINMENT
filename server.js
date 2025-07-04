const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;


app.use(bodyParser.json());

const updatesFile = path.join(__dirname, 'updates.json');

// Helper function to read updates
function readUpdates() {
  if (!fs.existsSync(updatesFile)) {
    return { sports: [], entertainment: [] };
  }
  const data = fs.readFileSync(updatesFile);
  return JSON.parse(data);
}

// Helper function to write updates
function writeUpdates(updates) {
  try {
    fs.writeFileSync(updatesFile, JSON.stringify(updates, null, 2));
  } catch (err) {
    console.error("Error writing updates file:", err);
    throw err;
  }
}

// API to get updates
app.get('/api/updates', (req, res) => {
  const updates = readUpdates();
  res.json(updates);
});

// API to post an update
app.post('/api/updates', (req, res) => {
  try {
    console.log("POST /api/updates request body:", JSON.stringify(req.body, null, 2));
    const { category, text, image, caption } = req.body;
    if (!category || !text) {
      console.error("Validation error: Missing category or text");
      return res.status(400).json({ error: 'Category and text are required' });
    }
    const updates = readUpdates();
    if (!updates[category]) {
      updates[category] = [];
    }
    updates[category].push({ text, image, caption });
    try {
      writeUpdates(updates);
    } catch (writeErr) {
      console.error("Error writing updates file inside POST handler:", writeErr.stack || writeErr);
      return res.status(500).json({ error: "Failed to save update" });
    }
    res.json({ message: 'Update added successfully' });
  } catch (err) {
    console.error("Error handling POST /api/updates:", err.stack || err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use(express.static(path.join(__dirname)));

// Serve admin.html for admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve tandao.html for public site
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'tandao.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
