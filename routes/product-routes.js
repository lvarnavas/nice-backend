const express = require("express");
const { check } = require("express-validator");

const productControllers = require("../controllers/product-controllers");

const router = express.Router();

router.get(
  "/:carId/:startDate/:endDate",
  productControllers.getAllLoadsByCarId
);

module.exports = router;
