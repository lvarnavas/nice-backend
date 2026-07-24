const config = require("./shared/config");
const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const userRoute = require("./routes/user-routes");
const productRoute = require("./routes/product-routes");

const checkAuth = require("./middleware/check-auth");

const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join("public")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );

  // Answer preflight here. Now that requests carry an Authorization header the
  // browser preflights them, and those checks must not fall through to the
  // routes below.
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use("/api/users", userRoute);
app.use("/api/products", checkAuth, productRoute);

app.use((req, res, next) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

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

app.listen(config.port, () => {
  console.log(`Server started and listening on port ${config.port}`);
});
