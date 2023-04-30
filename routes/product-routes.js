const express = require("express");
const { check } = require("express-validator");

const productControllers = require("../controllers/product-controllers");

const router = express.Router();

router.post("/loads/:carId?/:startDate/:endDate", productControllers.getLoads);

router.post(
  "/destructions/:carId?/:startDate/:endDate",
  productControllers.getDestructions
);

router.post(
  "/returns/:carId?/:startDate/:endDate",
  productControllers.getReturns
);

router.get("/warehouse-status", productControllers.getWareHouseStatus);

router.post(
  "/warehouse-last-month-status",
  productControllers.getWareHouseLastMonthStatus
);

router.post("/add-loads", productControllers.addLoads);
router.post("/add-car-destructions", productControllers.addCarDestructions);

router.post(
  "/add-warehouse-destructions",
  productControllers.addWarehouseDestructions
);

router.post("/add-car-returns", productControllers.addCarReturns);

module.exports = router;
