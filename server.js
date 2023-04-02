const PORT = 5000;
const express = require("express");
const bodyParser = require("body-parser");

const userRoute = require("./routes/user-routes");
const productRoute = require("./routes/product-routes");

const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred" });
});

app.listen(PORT, () => {
  console.log(`Server started and listening on port ${PORT}`);
});
