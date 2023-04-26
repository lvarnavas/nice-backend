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

  const sql2 =
    "SET @sql = NULL; SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(IF(p.id = ', p.id, ', cdt.quantity, 0)) AS `', p.name, '`')) INTO @sql FROM mydb.products p; SET @sql = CONCAT('SELECT cd.date, cd.id, ', @sql, ' FROM mydb.car_destructions cd JOIN mydb.car_destruction_transaction cdt ON cd.id = cdt.car_destructions_id JOIN mydb.products p ON cdt.products_id = p.id WHERE cd.cars_id = " +
    `${carId}` +
    " AND cd.date BETWEEN \\'" +
    `${startDate}` +
    " \\' AND \\'" +
    `${endDate}` +
    "\\' GROUP BY cd.date, cd.id ORDER BY cd.date, cd.id'); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt";

  const sql3 =
    "SET @sql = NULL; SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(IF(p.id = ', p.id, ', rt.quantity, 0)) AS `', p.name, '`')) INTO @sql FROM mydb.products p; SET @sql = CONCAT('SELECT r.date, r.id, ', @sql, ' FROM mydb.returns r JOIN mydb.returns_transaction rt ON r.id = rt.returns_id JOIN mydb.products p ON rt.products_id = p.id WHERE r.car_id = " +
    `${carId}` +
    " AND r.date BETWEEN \\'" +
    `${startDate}` +
    " \\' AND \\'" +
    `${endDate}` +
    "\\' GROUP BY r.date, r.id ORDER BY r.date, r.id'); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt";

  const sql4 =
    "SET @sql = NULL; SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(IF(p.id = ', p.id, ', cdt.quantity, 0)) AS `', p.name, '`')) INTO @sql FROM mydb.products p; SET @sql = CONCAT('SELECT cd.date, cd.id, ', @sql, ' FROM mydb.car_destructions cd JOIN mydb.car_destruction_transaction cdt ON cd.id = cdt.car_destructions_id JOIN mydb.products p ON cdt.products_id = p.id WHERE cd.cars_id = " +
    `${carId}` +
    " AND cd.date BETWEEN \\'" +
    `${startDate}` +
    "\\' AND \\'" +
    `${endDate}` +
    "\\' GROUP BY cd.date, cd.id ORDER BY cd.date, cd.id'); PREPARE stmt FROM @sql; EXECUTE stmt";

  const sql5 =
    "SET @sql = NULL;SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(IF(p.id = ', p.id, ', rt.quantity, 0)) AS `', p.name, '`')) INTO @sql FROM mydb.products p;SET @sql = CONCAT('SELECT c.pinakida, ', @sql, ' FROM mydb.returns r JOIN mydb.returns_transaction rt ON r.id = rt.returns_id JOIN mydb.products p ON rt.products_id = p.id JOIN mydb.cars c ON r.car_id = c.id WHERE r.date BETWEEN \\'" +
    `${startDate}` +
    "\\' AND \\'" +
    `${endDate}` +
    "\\' GROUP BY r.car_id, c.pinakida ORDER BY r.car_id');PREPARE stmt FROM @sql;EXECUTE stmt;DEALLOCATE PREPARE stmt";

  try {
    connection.query(sql5, (error, results) => {
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
