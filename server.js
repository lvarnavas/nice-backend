const PORT = 5000;
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send(`<h2>Nice</h2>`);
});

app.listen(PORT, () => {
  console.log(`Server started and lsitening on port ${PORT}`);
});
