const express = require('express');
const path = require('path');

const app = express();

// Serve everything in this project folder as static files
// (index.html, shared/css, shared/js, shared/assets/images, shared/assets/audio, games/...)
app.use(express.static(path.join(__dirname)));

// Render sets PORT automatically — fall back to 3000 for local testing
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`HundredGames running on port ${PORT}`);
});
