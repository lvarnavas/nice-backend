const express = require("express");
const { check } = require("express-validator");

const productControllers = require("../controllers/product-controllers");

const router = express.Router();

router.get("/loads/:carId?/:startDate/:endDate", productControllers.getLoads);

router.post(
  "/destructions/:carId?/:startDate/:endDate",
  productControllers.getDestructions
);

router.post(
  "/returns/:carId?/:startDate/:endDate",
  productControllers.getReturns
);

router.post("/warehouse-status", productControllers.getWareHouseStatus);

module.exports = router;
