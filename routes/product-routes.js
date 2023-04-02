const express = require("express");

const productControllers = require("../controllers/product-controllers");

const router = express.Router();

router.get("/", productControllers.getAllProducts);
router.get("/:productId", productControllers.getProductById);
router.get(
  "/get-quantity/:productId",
  productControllers.getQuantityByProductId
);

router.post("/add-quantity", productControllers.addQuantity);

router.patch(
  "/update-quantity/:productId",
  productControllers.updateQuantityByProductId
);

module.exports = router;
