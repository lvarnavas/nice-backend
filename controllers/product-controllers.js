const uuid = require("uuid");
const connection = require("../database/mysql");

const HttpError = require("../models/http-error");

const getAllProducts = (req, res, next) => {
  res.json({ products: PRODUCTS });
};

const getAllLoadsByCarId = (req, res, next) => {
  const carId = req.params.carId;
  const startDate = req.params.startDate;
  const endDate = req.params.endDate;

  const sql =
    "SET @sql = NULL; SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(IF(p.id = ', p.id, ', t.quantity, 0)) AS `', p.name, '`')) INTO @sql FROM mydb.products p; SET @sql = CONCAT('SELECT l.date, l.id, ', @sql, ' FROM mydb.loads l JOIN mydb.transfers t ON l.id = t.loads_id JOIN mydb.products p ON t.products_id = p.id WHERE l.car_id = " +
    `${carId}` +
    " AND l.date BETWEEN \\'" +
    `${startDate}` +
    " \\' AND \\'" +
    `${endDate}` +
    "\\' GROUP BY l.date, l.id ORDER BY l.date, l.id'); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt";

  try {
    connection.query(sql, (error, results) => {
      if (error) {
        throw error;
      }
      const data = results[4];
      // Returns all loads by car id
      res.json({ loadsByCarId: data });
    });
  } catch (err) {
    const error = new HttpError(
      "Fetching all loads by car id failed, please try again."
    );
    return next(error);
  }
};

exports.getAllProducts = getAllProducts;
exports.getAllLoadsByCarId = getAllLoadsByCarId;
