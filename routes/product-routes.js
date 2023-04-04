const express = require("express");
const { check } = require("express-validator");

const productControllers = require("../controllers/product-controllers");

const router = express.Router();

router.get("/", productControllers.getAllProducts);

router.get(
  "/all/:startDate/:endDate/:carId",
  productControllers.getAllLoadsByCarId
);

module.exports = router;
