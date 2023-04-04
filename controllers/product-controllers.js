const uuid = require("uuid");

const HttpError = require("../models/http-error");

const DUMMY_PRODUCT = [
  {
    id: "1",
    name: "CUBE",
  },
  {
    id: "2",
    name: "CUBE 2",
  },
  {
    id: "3",
    name: "CUBE 3",
  },
];

const DUMMY_QUANTITY = [
  {
    quantity: 50,
    productId: "2",
  },
  {
    quantity: 342,
    productId: "1",
  },
];

const DUMMY_CARS = [
  {
    carId: "2",
  },
];

const getAllProducts = (req, res, next) => {
  res.json({ product: DUMMY_PRODUCT });
};

const getProductById = (req, res, next) => {
  const productId = req.params.productId;
  const product = DUMMY_PRODUCT.find((p) => p.id === productId);

  if (!product) {
    return next(new HttpError("Could not find a product for this id", 404));
  }

  res.status(200).json({ product });
};

const getQuantityByProductId = (req, res, next) => {
  const productId = req.params.productId;
  const quantity = DUMMY_QUANTITY.find((q) => q.productId === productId);
  res.status(200).json({ quantity });
};

const addQuantity = (req, res, next) => {
  const { quantity } = req.body;

  const addedQuantity = {
    quantity,
    productId: uuid(),
  };

  DUMMY_QUANTITY.push(addedQuantity);

  res.status(201).json({ quantity: addedQuantity });
};

const updateQuantityByProductId = (req, res, next) => {
  const { quantity } = req.body;
  const productId = req.params.productId;

  const updatedQuantity = {
    ...DUMMY_QUANTITY.find((q) => q.productId === productId),
  };
  const quantityIndex = DUMMY_QUANTITY.findIndex(
    (q) => q.productId === productId
  );
  updatedQuantity.quantity = quantity;

  DUMMY_QUANTITY[quantityIndex] = updatedQuantity;

  res.status(200).json({ quantity: updatedQuantity });
};

exports.getAllProducts = getAllProducts;
exports.getProductById = getProductById;
exports.getQuantityByProductId = getQuantityByProductId;
exports.addQuantity = addQuantity;
exports.updateQuantityByProductId = updateQuantityByProductId;
