const connection = require("../database/mysql");

const HttpError = require("../models/http-error");

const getLoads = (req, res, next) => {
  const { carId, startDate, endDate } = req.params;

  // ΦΟΡΤΩΜΑΤΑ ΕΝΟΣ ΣΥΓΚΕΚΡΙΜΕΝΟΥ ΑΜΑΞΙΟΥ - query 1
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

      res.json({ loads: data });
    });
  } catch (err) {
    const error = new HttpError("Fetching loads failed, please try again.");
    return next(error);
  }
};

const getDestructions = (req, res, next) => {
  const { carId, startDate, endDate } = req.params;
  const carIdParam = carId || null;
  const { flag } = req.body;

  let sql;
  if (carIdParam !== null) {
    // Queries that requires carId
    if (flag === "") {
      // ΚΑΤΑΣΤΡΟΦΕΣ ΑΜΑΞΙΩΝ - query 2
      sql =
        "SET @sql = NULL; SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(IF(p.id = ', p.id, ', cdt.quantity, 0)) AS `', p.name, '`')) INTO @sql FROM mydb.products p; SET @sql = CONCAT('SELECT cd.date, cd.id, ', @sql, ' FROM mydb.car_destructions cd JOIN mydb.car_destruction_transaction cdt ON cd.id = cdt.car_destructions_id JOIN mydb.products p ON cdt.products_id = p.id WHERE cd.cars_id = " +
        `${carIdParam}` +
        " AND cd.date BETWEEN \\'" +
        `${startDate}` +
        " \\' AND \\'" +
        `${endDate}` +
        "\\' GROUP BY cd.date, cd.id ORDER BY cd.date, cd.id'); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt";
    } else if (flag === "") {
      // ΚΑΤΑΣΤΡΟΦΕΣ ΕΝΟΣ ΣΥΓΚΕΚΡΙΜΕΝΟΥ ΑΜΑΞΙΟΥ - query 4
      sql =
        "SET @sql = NULL; SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(IF(p.id = ', p.id, ', cdt.quantity, 0)) AS `', p.name, '`')) INTO @sql FROM mydb.products p; SET @sql = CONCAT('SELECT cd.date, cd.id, ', @sql, ' FROM mydb.car_destructions cd JOIN mydb.car_destruction_transaction cdt ON cd.id = cdt.car_destructions_id JOIN mydb.products p ON cdt.products_id = p.id WHERE cd.cars_id = " +
        `${carIdParam}` +
        " AND cd.date BETWEEN \\'" +
        `${startDate}` +
        "\\' AND \\'" +
        `${endDate}` +
        "\\' GROUP BY cd.date, cd.id ORDER BY cd.date, cd.id'); PREPARE stmt FROM @sql; EXECUTE stmt";
    }
  } else {
    if (flag === "") {
      // ΚΑΤΑΣΤΡΟΦΕΣ ΟΛΩΝ ΤΩΝ ΑΜΑΞΙΩΝ - query 6
      sql =
        "SET @sql = NULL; SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(IF(p.id = ', p.id, ', rt.quantity, 0)) AS `', p.name, '`')) INTO @sql FROM mydb.products p; SET @sql = CONCAT('SELECT c.pinakida, ', @sql, ' FROM mydb.returns r JOIN mydb.returns_transaction rt ON r.id = rt.returns_id JOIN mydb.products p ON rt.products_id = p.id JOIN mydb.cars c ON r.car_id = c.id WHERE r.date BETWEEN \\'" +
        `${startDate}` +
        "\\' AND \\'" +
        `${endDate}` +
        "\\' GROUP BY r.car_id, c.pinakida ORDER BY r.car_id'); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt";
    } else if (flag === "") {
      // ΚΑΤΑΣΤΡΟΦΕΣ ΑΠΟΘΗΚΗΣ - query 7
      sql =
        "SET @sql_products = NULL; SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(CASE WHEN wdt.products_id = ', p.id, ' THEN wdt.quantity ELSE 0 END) AS `', p.name, '`')) INTO @sql_products FROM mydb.warehouse_destruction_transaction AS wdt JOIN mydb.products AS p ON wdt.products_id = p.id; SET @sql = CONCAT('SELECT wd.date AS Date, ', @sql_products, ' FROM mydb.warehouse_destructions AS wd JOIN mydb.warehouse_destruction_transaction AS wdt ON wd.id = wdt.warehouse_destructions_id JOIN mydb.products AS p ON wdt.products_id = p.id WHERE wd.date BETWEEN \\'" +
        `${startDate}` +
        "\\' AND \\'" +
        `${endDate}` +
        "\\' GROUP BY wd.id, wd.date');PREPARE stmt FROM @sql;EXECUTE stmt;DEALLOCATE PREPARE stmt";
    } else if (flag === "") {
      // ΚΑΤΑΣΤΡΟΦΕΣ ΗΜΕΡΑΣ ΑΜΑΞΙΩΝ - query 8
      sql =
        "SET @sql_products = NULL;SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(CASE WHEN cdt.products_id = ',p.id,' THEN cdt.quantity ELSE 0 END) AS `',p.name,'`')) INTO @sql_products FROM mydb.car_destruction_transaction AS cdt JOIN mydb.products AS p ON cdt.products_id = p.id;SET @sql = CONCAT('SELECT DATE(cd.date) AS date, ', @sql_products, ' FROM mydb.car_destructions AS cd JOIN mydb.car_destruction_transaction AS cdt ON cd.id = cdt.car_destructions_id JOIN mydb.products AS p ON cdt.products_id = p.id WHERE cd.date BETWEEN \\'" +
        `${startDate}` +
        "\\' AND \\'" +
        `${endDate}` +
        "\\' GROUP BY DATE(cd.date)');PREPARE stmt FROM @sql;EXECUTE stmt;DEALLOCATE PREPARE stmt;";
    }
  }

  try {
    connection.query(sql, (error, results) => {
      if (error) {
        throw error;
      }
      const data = results[4];

      res.json({ destructions: data });
    });
  } catch (err) {
    const error = new HttpError(
      "Fetching destructions failed, please try again."
    );
    return next(error);
  }
};

const getReturns = (req, res, next) => {
  const { carId, startDate, endDate } = req.params;
  const carIdParam = carId || null;
  const { flag } = req.body;

  let sql;
  if (carIdParam !== null) {
    if (flag === "") {
      // ΕΠΙΣΤΡΟΦΕΣ ΕΝΟΣ ΣΥΓΚΕΚΡΙΜΕΝΟΥ ΑΜΑΞΙΟΥ - query 3
      sql =
        "SET @sql = NULL; SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(IF(p.id = ', p.id, ', rt.quantity, 0)) AS `', p.name, '`')) INTO @sql FROM mydb.products p; SET @sql = CONCAT('SELECT r.date, r.id, ', @sql, ' FROM mydb.returns r JOIN mydb.returns_transaction rt ON r.id = rt.returns_id JOIN mydb.products p ON rt.products_id = p.id WHERE r.car_id = " +
        `${carId}` +
        " AND r.date BETWEEN \\'" +
        `${startDate}` +
        " \\' AND \\'" +
        `${endDate}` +
        "\\' GROUP BY r.date, r.id ORDER BY r.date, r.id'); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt";
    }
  } else {
    if (flag === "") {
      // ΕΠΙΣΤΡΟΦΕΣ ΟΛΩΝ ΤΩΝ ΑΜΑΞΙΩΝ - query 5
      sql =
        "SET @sql = NULL;SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(IF(p.id = ', p.id, ', rt.quantity, 0)) AS `', p.name, '`')) INTO @sql FROM mydb.products p;SET @sql = CONCAT('SELECT c.pinakida, ', @sql, ' FROM mydb.returns r JOIN mydb.returns_transaction rt ON r.id = rt.returns_id JOIN mydb.products p ON rt.products_id = p.id JOIN mydb.cars c ON r.car_id = c.id WHERE r.date BETWEEN \\'" +
        `${startDate}` +
        "\\' AND \\'" +
        `${endDate}` +
        "\\' GROUP BY r.car_id, c.pinakida ORDER BY r.car_id');PREPARE stmt FROM @sql;EXECUTE stmt;DEALLOCATE PREPARE stmt";
    }
  }

  try {
    connection.query(sql, (error, results) => {
      if (error) {
        throw error;
      }
      const data = results[4];

      res.json({ returns: data });
    });
  } catch (err) {
    const error = new HttpError("Fetching returns failed, please try again.");
    return next(error);
  }
};

exports.getLoads = getLoads;
exports.getDestructions = getDestructions;
exports.getReturns = getReturns;
