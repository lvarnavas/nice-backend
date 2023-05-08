const connection = require("../database/mysql");

const HttpError = require("../models/http-error");

const getLoads = (req, res, next) => {
  const { carId, startDate, endDate } = req.params;
  const carIdParam = carId || null;
  const { flag } = req.body;
  console.log(req.params);
  console.log(flag);

  // Validate carId
  if (carIdParam !== null && isNaN(carIdParam)) {
    const error = new HttpError('Invalid carId provided, please provide a valid number.');
    return next(error);
  }

  // Validate startDate and endDate
  if (!Date.parse(startDate) || !Date.parse(endDate)) {
    const error = new HttpError('Invalid startDate or endDate provided, please provide valid dates.');
    return next(error);
  }

  let loads;
  if (carIdParam !== null) {
    if (flag === "singleCarLoads") {
      loads =
      "SET @sql = NULL; SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(IF(p.id = ', p.id, ', t.quantity, 0)) AS `', p.name, '`')) INTO @sql FROM mydb.products p; SET @sql = CONCAT('SELECT l.date, l.id, ', @sql, ' FROM mydb.loads l JOIN mydb.transfers t ON l.id = t.loads_id JOIN mydb.products p ON t.products_id = p.id WHERE l.car_id = " +
      `${carId}` +
      " AND l.date BETWEEN \\'" +
      `${startDate}` +
      " \\' AND \\'" +
      `${endDate}` +
      "\\' GROUP BY l.date, l.id ORDER BY l.date, l.id'); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt";
    }
  } else {
    if (flag === "totalCarLoads") {
      // [QUERY 2] -> ΦΟΡΤΩΜΑΤΑ ΟΛΩΝ ΤΩΝ ΑΜΑΞΙΩΝ
      loads =
        "SET @sql = NULL; SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(IF(p.id = ', p.id, ', t.quantity, 0)) AS `', p.name, '`')) INTO @sql FROM mydb.products p; SET @sql = CONCAT('SELECT c.pinakida AS `Pinakida`, ', @sql, ' FROM mydb.loads l JOIN mydb.transfers t ON l.id = t.loads_id JOIN mydb.products p ON t.products_id = p.id JOIN mydb.cars c ON l.car_id = c.id WHERE l.date BETWEEN \\'" +
        `${startDate}` +
        "\\' AND \\'" +
        `${endDate}` +
        "\\' GROUP BY c.pinakida'); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt";
    }
  }

  if (!loads) {
    const error = new HttpError('Invalid flag provided, please provide a valid flag.');
    return next(error);
  }

  connection.query(loads, (error, results) => {
    if (error) {
      console.error('Error:', error);
      const httpError = new HttpError("Fetching loads failed, please try again.");
      return next(httpError);
    }
    
    const data = results[4];
    res.json({ loads: data });
  });
  
};


const getDestructions = (req, res, next) => {
  const { carId, startDate, endDate } = req.params;
  const carIdParam = carId || null;
  const { flag } = req.body;

  // Validate carId
  if (carIdParam !== null && isNaN(carIdParam)) {
    const error = new HttpError('Invalid carId provided, please provide a valid number.');
    return next(error);
  }

  // Validate startDate and endDate
  if (!Date.parse(startDate) || !Date.parse(endDate)) {
    const error = new HttpError('Invalid startDate or endDate provided, please provide valid dates.');
    return next(error);
  }

  let destructions;
  if (carIdParam === null) {
    if (flag === "totalCarDestructions") {
      // [QUERY 3] -> ΚΑΤΑΣΤΡΟΦΕΣ ΟΛΩΝ ΤΩΝ ΑΜΑΞΙΩΝ
      destructions =
        "SET @sql_products = NULL; SELECT GROUP_CONCAT(DISTINCT CONCAT('COALESCE(SUM(CASE WHEN cdt.products_id = ', p.id, ' THEN cdt.quantity ELSE 0 END), 0) AS ', p.name, '')) INTO @sql_products FROM mydb.products AS p; SET @sql = CONCAT('SELECT c.pinakida AS car_name, ', @sql_products, ' FROM (SELECT 0) AS dummy LEFT JOIN mydb.car_destructions AS cd ON 1=1 LEFT JOIN mydb.car_destruction_transaction AS cdt ON cd.id = cdt.car_destructions_id LEFT JOIN mydb.cars AS c ON cd.cars_id = c.id LEFT JOIN mydb.products AS p ON cdt.products_id = p.id WHERE cd.date BETWEEN \\'" +
        `${startDate}` +
        "\\' AND \\'" +
        `${endDate}` +
        "\\'  GROUP BY cd.cars_id, c.pinakida'); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;";
    } else if (flag === "dailyCarDestructions") {
      // [QUERY 6] -> ΚΑΤΑΣΤΡΟΦΕΣ ΗΜΕΡΑΣ ΑΜΑΞΙΩΝ
      destructions =
        "SET @sql_products = NULL;SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(CASE WHEN cdt.products_id = ',p.id,' THEN cdt.quantity ELSE 0 END) AS `',p.name,'`')) INTO @sql_products FROM mydb.car_destruction_transaction AS cdt JOIN mydb.products AS p ON cdt.products_id = p.id;SET @sql = CONCAT('SELECT DATE(cd.date) AS date, ', @sql_products, ' FROM mydb.car_destructions AS cd JOIN mydb.car_destruction_transaction AS cdt ON cd.id = cdt.car_destructions_id JOIN mydb.products AS p ON cdt.products_id = p.id WHERE cd.date BETWEEN \\'" +
        `${startDate}` +
        "\\' AND \\'" +
        `${endDate}` +
        "\\' GROUP BY DATE(cd.date)');PREPARE stmt FROM @sql;EXECUTE stmt;DEALLOCATE PREPARE stmt;";
    } else if (flag === "warehouseDestructions") {
      // [QUERY 5] -> ΚΑΤΑΣΤΡΟΦΕΣ ΑΠΟΘΗΚΗΣ
      destructions =
        "SET @sql_products = NULL; SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(CASE WHEN wdt.products_id = ', p.id, ' THEN wdt.quantity ELSE 0 END) AS `', p.name, '`')) INTO @sql_products FROM mydb.warehouse_destruction_transaction AS wdt JOIN mydb.products AS p ON wdt.products_id = p.id; SET @sql = CONCAT('SELECT wd.id AS `ID`, wd.date AS `Date`, ', @sql_products, ' FROM mydb.warehouse_destructions AS wd JOIN mydb.warehouse_destruction_transaction AS wdt ON wd.id = wdt.warehouse_destructions_id JOIN mydb.products AS p ON wdt.products_id = p.id WHERE wd.date BETWEEN \\'" +
        `${startDate}` +
        "\\' AND \\'" +
        `${endDate}` +
        "\\' GROUP BY wd.id, wd.date'); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt";
    }
  } else {
    if (flag === "singleCarDestructions") {
      // [QUERY 4] -> ΚΑΤΑΣΤΡΟΦΕΣ ΕΝΟΣ ΣΥΓΚΕΚΡΙΜΕΝΟΥ ΑΜΑΞΙΟΥ
      destructions =
        "SET @sql = NULL; SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(IF(p.id = ', p.id, ', cdt.quantity, 0)) AS `', p.name, '`')) INTO @sql FROM mydb.products p; SET @sql = CONCAT('SELECT cd.date, cd.id, ', @sql, ' FROM mydb.car_destructions cd JOIN mydb.car_destruction_transaction cdt ON cd.id = cdt.car_destructions_id JOIN mydb.products p ON cdt.products_id = p.id WHERE cd.cars_id = " +
        `${carIdParam}` +
        " AND cd.date BETWEEN \\'" +
        `${startDate}` +
        "\\' AND \\'" +
        `${endDate}` +
        "\\' GROUP BY cd.date, cd.id ORDER BY cd.date, cd.id'); PREPARE stmt FROM @sql; EXECUTE stmt";
    }
  }

  connection.query(destructions, (error, results) => {
    if (error) {
      console.error('Error:', error);
      const httpError = new HttpError("Fetching destructions failed, please try again.");
      return next(httpError);
    }
    
    const data = results[4];
    res.json({ destructions: data });
  });
};

const getReturns = (req, res, next) => {
  const { carId, startDate, endDate } = req.params;
  const carIdParam = carId || null;
  const { flag } = req.body;

  // Validate carId
  if (carIdParam !== null && isNaN(carIdParam)) {
    const error = new HttpError('Invalid carId provided, please provide a valid number.');
    return next(error);
  }

  // Validate startDate and endDate
  if (!Date.parse(startDate) || !Date.parse(endDate)) {
    const error = new HttpError('Invalid startDate or endDate provided, please provide valid dates.');
    return next(error);
  }
  let returns;
  if (carIdParam !== null) {
    if (flag === "singleCarReturns") {
      // [QUERY 7] -> ΕΠΙΣΤΡΟΦΕΣ ΕΝΟΣ ΣΥΓΚΕΚΡΙΜΕΝΟΥ ΑΜΑΞΙΟΥ
      returns =
        "SET @sql = NULL; SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(IF(p.id = ', p.id, ', rt.quantity, 0)) AS `', p.name, '`')) INTO @sql FROM mydb.products p; SET @sql = CONCAT('SELECT r.date, r.id, ', @sql, ' FROM mydb.returns r JOIN mydb.returns_transaction rt ON r.id = rt.returns_id JOIN mydb.products p ON rt.products_id = p.id WHERE r.car_id = " +
        `${carId}` +
        " AND r.date BETWEEN \\'" +
        `${startDate}` +
        " \\' AND \\'" +
        `${endDate}` +
        "\\' GROUP BY r.date, r.id ORDER BY r.date, r.id'); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt";
    }
  } else {
    if (flag === "totalCarReturns") {
      // [QUERY 8] -> ΕΠΙΣΤΡΟΦΕΣ ΟΛΩΝ ΤΩΝ ΑΜΑΞΙΩΝ
      returns =
        "SET @sql = NULL;SELECT GROUP_CONCAT(DISTINCT CONCAT('SUM(IF(p.id = ', p.id, ', rt.quantity, 0)) AS `', p.name, '`')) INTO @sql FROM mydb.products p;SET @sql = CONCAT('SELECT c.pinakida, ', @sql, ' FROM mydb.returns r JOIN mydb.returns_transaction rt ON r.id = rt.returns_id JOIN mydb.products p ON rt.products_id = p.id JOIN mydb.cars c ON r.car_id = c.id WHERE r.date BETWEEN \\'" +
        `${startDate}` +
        "\\' AND \\'" +
        `${endDate}` +
        "\\' GROUP BY r.car_id, c.pinakida ORDER BY r.car_id');PREPARE stmt FROM @sql;EXECUTE stmt;DEALLOCATE PREPARE stmt";
    }
  }

  connection.query(returns, (error, results) => {
    if (error) {
      console.error('Error:', error);
      const httpError = new HttpError("Fetching returns failed, please try again.");
      return next(httpError);
    }
    
    const data = results[4];
    res.json({ returns: data });
  });
};

const getWareHouseStatus = (req, res, next) => {
  // Get the current date
  // Fri Apr 28 2023 23:36:40 GMT+0200 (Central European Summer Time)
  const today = new Date();

  // Get the first day of the current month
  // Sat Apr 01 2023 00:00:00 GMT+0200 (Central European Summer Time)
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  // '2023-03-31'
  const formattedFirstDayOfMonth = firstDayOfMonth.toISOString().slice(0, 10);

  // Get the last day of the current month
  // Sun Apr 30 2023 00:00:00 GMT+0200 (Central European Summer Time)
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  // '2023-04-29'
  const formattedLastDayOfMonth = lastDayOfMonth.toISOString().slice(0, 10);

  // Get the first day of the previous month
  // Wed Mar 01 2023 00:00:00 GMT+0100 (Central European Standard Time)
  const firstDayOfPrevMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1
  );
  //'2023-02-28'
  const formattedFirstDayOfPrevMonth = firstDayOfPrevMonth
    .toISOString()
    .slice(0, 10);

  const warehouseStatus =
    "SELECT p.id AS product_id, p.name AS product_name, COALESCE(SUM(loads_in_ntalika), 0) + COALESCE(SUM(apografi_proionton), 0) + COALESCE(SUM(returns), 0) - COALESCE(SUM(loads_out_ntalika), 0) - COALESCE(SUM(warehouse_destructions), 0) - COALESCE(SUM(car_destructions), 0) AS current_quantity FROM mydb.products p LEFT JOIN (SELECT products_id, SUM(quantity) AS loads_in_ntalika FROM mydb.loads l JOIN mydb.transfers t ON l.id = t.loads_id JOIN mydb.cars c ON l.car_id = c.id WHERE l.date BETWEEN '" +
    `${formattedFirstDayOfMonth}` +
    "' AND '" +
    `${formattedLastDayOfMonth}` +
    "' AND c.isNtalika = 1 GROUP BY products_id) AS lin ON p.id = lin.products_id LEFT JOIN (SELECT products_id, SUM(quantity) AS apografi_proionton FROM mydb.apografi_proionton ap JOIN mydb.apografi_proionton_transaction apt ON ap.apografi_id = apt.apografi_apografi_id WHERE ap.month = '" +
    `${formattedFirstDayOfPrevMonth}` +
    "' GROUP BY products_id) AS apg ON p.id = apg.products_id LEFT JOIN (SELECT products_id, SUM(quantity) AS returns FROM mydb.returns r JOIN mydb.returns_transaction rt ON r.id = rt.returns_id WHERE r.date BETWEEN '" +
    `${formattedFirstDayOfMonth}` +
    "' AND '" +
    `${formattedLastDayOfMonth}` +
    "' GROUP BY products_id) AS ret ON p.id = ret.products_id LEFT JOIN (SELECT products_id, SUM(quantity) AS loads_out_ntalika FROM mydb.loads l JOIN mydb.transfers t ON l.id = t.loads_id JOIN mydb.cars c ON l.car_id = c.id WHERE l.date BETWEEN '" +
    `${formattedFirstDayOfMonth}` +
    "' AND '" +
    `${formattedLastDayOfMonth}` +
    "' AND c.isNtalika = 0 GROUP BY products_id) AS lout ON p.id = lout.products_id LEFT JOIN (SELECT products_id, SUM(quantity) AS warehouse_destructions FROM mydb.warehouse_destructions wd JOIN mydb.warehouse_destruction_transaction wdt ON wd.id = wdt.warehouse_destructions_id WHERE wd.date BETWEEN '" +
    `${formattedFirstDayOfMonth}` +
    "' AND '" +
    `${formattedLastDayOfMonth}` +
    "' GROUP BY products_id) AS wde ON p.id = wde.products_id LEFT JOIN (SELECT products_id, SUM(quantity) AS car_destructions FROM mydb.car_destructions cd JOIN mydb.car_destruction_transaction cdt ON cd.id = cdt.car_destructions_id WHERE cd.date BETWEEN '" +
    `${formattedFirstDayOfMonth}` +
    "' AND '" +
    `${formattedLastDayOfMonth}` +
    "' GROUP BY products_id) AS cde ON p.id = cde.products_id GROUP BY p.id, p.name";

    connection.query(warehouseStatus, (error, results) => {
      if (error) {
        console.error('Error:', error);
        const httpError = new HttpError("Fetching warehouse status failed, please try again.");
        return next(httpError);
      }
  
      res.json({ warehouseStatus: results });
    });
};

const getCarList = (req, res, next) => {
  const carslist = "SELECT * FROM mydb.cars;";

  connection.query(carslist, (error, results) => {
    if (error) {
      console.error('Error:', error);
      const httpError = new HttpError("Fetching cars list status failed, please try again.");
      return next(httpError);
    }

    res.json({ carslist: results });
  });
};


const getProducts = (req, res, next) => {
  // Get the current date
  // Fri Apr 28 2023 23:36:40 GMT+0200 (Central European Summer Time)

  const productsList = "SELECT * FROM mydb.products;";

  connection.query(productsList, (error, results) => {
    if (error) {
      console.error('Error:', error);
      const httpError = new HttpError("Fetching products list status failed, please try again.");
      return next(httpError);
    }

    res.json({ productsList: results });
  });
};


const getQuantities = (req, res, next) => {
  const { id, flag } = req.body;
  
  // Validate id
  if (isNaN(id)) {
    const error = new HttpError('Invalid id provided, please provide a valid number.');
    return next(error);
  }

  let sqlquery = "";
  if (flag === "load") {
    sqlquery = `
      SELECT p.id as products_id, COALESCE(t.quantity, 0) as quantity
      FROM mydb.products p
      LEFT JOIN mydb.transfers t ON p.id = t.products_id AND t.loads_id = ${id};
    `;
  } else if (flag === "return") {
    sqlquery = `
      SELECT p.id as products_id, COALESCE(rt.quantity, 0) as quantity
      FROM mydb.products p
      LEFT JOIN mydb.returns_transaction rt ON p.id = rt.products_id AND rt.returns_id = ${id};
    `;
  } else if (flag === "cardestruction") {
    sqlquery = `
      SELECT p.id as products_id, COALESCE(cdt.quantity, 0) as quantity
      FROM mydb.products p
      LEFT JOIN mydb.car_destruction_transaction cdt ON p.id = cdt.products_id AND cdt.car_destructions_id = ${id};
    `;
  } else if (flag === "warehousedestruction") {
    sqlquery = `
      SELECT p.id as products_id, COALESCE(wdt.quantity, 0) as quantity
      FROM mydb.products p
      LEFT JOIN mydb.warehouse_destruction_transaction wdt ON p.id = wdt.products_id AND wdt.warehouse_destructions_id = ${id};
    `;
  } else {
    const error = new HttpError("Invalid flag provided, please provide a valid flag.");
    return next(error);
  }

  connection.query(sqlquery, (error, results) => {
    if (error) {
      console.error('Error:', error);
      const httpError = new HttpError("Fetching failed, please try again.");
      return next(httpError);
    }
    
    res.json({ quantities: results });
  });
};


const getWareHouseLastMonthStatus = (req, res, next) => {
  const { year, month } = req.body;

  // Validate year and month
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    const error = new HttpError('Invalid year or month provided, please provide valid values.');
    return next(error);
  }

  const warehouseLastMonthStatus =
    "SELECT p.name AS 'Product Name', apt.quantity AS 'Quantity' FROM mydb.apografi_proionton ap JOIN mydb.apografi_proionton_transaction apt ON ap.apografi_id = apt.apografi_apografi_id JOIN mydb.products p ON apt.products_id = p.id WHERE YEAR(ap.month) = " +
    `${year}` +
    " AND MONTH(ap.month) = " +
    `${month}` +
    "";

    connection.query(warehouseLastMonthStatus, (error, results) => {
      if (error) {
        console.error('Error:', error);
        const httpError = new HttpError("Fetching warehouse last month status failed, please try again.");
        return next(httpError);
      }
  
      res.json({ warehouseLastMonthStatus: results });
    });

  const warehouseLastMonthDestructionsStatus =
    "SELECT p.name AS 'Product Name', SUM(akt.quantity) AS 'Quantity' FROM mydb.apografi_katastrofon_transaction AS akt JOIN mydb.apografi_katastrofon AS ak ON akt.apografi_katastrofon_apografi_katastrofon_id = ak.apografi_katastrofon_id JOIN mydb.products AS p ON akt.products_id = p.id WHERE MONTH(ak.month) = " +
    `${month}` +
    " AND YEAR(ak.month) = " +
    `${year}` +
    " GROUP BY p.id, p.name";

    connection.query(warehouseLastMonthDestructionsStatus, (error, results) => {
      if (error) {
        console.error('Error:', error);
        const httpError = new HttpError("Fetching warehouse last month destructions status failed, please try again.");
        return next(httpError);
      }
  
      res.json({ warehouseLastMonthDestructionsStatus: results });
    });
  };
  
  

const addLoads = (req, res, next) => {
  const { carId, date, products } = req.body;

  // First query to insert the new load
  connection.query(
    "INSERT INTO mydb.loads (car_id, date) VALUES (?, ?)",
    [carId, date],
    (error, results) => {
      if (error) {
        console.error("Error inserting the load:", error);
        const newError = new HttpError(
          "Error inserting the load, please try again."
        );
        return next(newError);
      }

      // Get the last inserted load ID
      const lastInsertedLoadId = results.insertId;

      // Construct the second query to insert the transfers
      let transfersQuery =
        "INSERT INTO mydb.transfers (loads_id, products_id, quantity) VALUES";

      for (const product of products) {
        const productId = parseInt(product.productId);
        const quantity = parseInt(product.quantity);
        const values = `${lastInsertedLoadId}, ${productId}, ${quantity}`;
        const secondPart = " (" + `${values}` + " ),";
        transfersQuery += secondPart;
      }

      // Remove the last comma and add a semicolon
      transfersQuery = transfersQuery.slice(0, -1) + ";";

      // Execute the second query to insert the transfers
      connection.query(transfersQuery, (error, results) => {
        if (error) {
          console.error("Error inserting the transfers:", error);
          const newError = new HttpError(
            "Error inserting the transfers, please try again."
          );
          return next(newError);
        }

        res.json({ OK: "OK" });
      });
    }
  );
};

const addCarDestructions = (req, res, next) => {
  const { carId, date, products } = req.body;

  connection.query(
    "INSERT INTO mydb.car_destructions (cars_id, date) VALUES (?, ?)",
    [carId, date],
    (error, results) => {
      if (error) {
        console.error("Error inserting the destruction:", error);
        const newError = new HttpError(
          "Error inserting the destruction, please try again."
        );
        return next(newError);
      }
      const lastInsertedDestructionId = results.insertId;

      // Construct the second query to insert the car_destruction_transaction
      let transfersQuery =
        "INSERT INTO mydb.car_destruction_transaction (car_destructions_id, products_id, quantity) VALUES";

      for (const key in products) {
        const productId = products[key].productId;
        const quantity = products[key].quantity;
        const values = `${lastInsertedDestructionId}, ${productId}, ${quantity}`;
        const secondPart = " (" + `${values}` + " ),";
        transfersQuery += secondPart;
      }

      // Remove the last comma and add a semicolon
      transfersQuery = transfersQuery.slice(0, -1) + ";";

      // Execute the second query to insert the transfers
      connection.query(transfersQuery, (error, results) => {
        if (error) {
          console.error("Error inserting the transfers:", error);
          const newError = new HttpError(
            "Error inserting the transfers, please try again."
          );
          return next(newError);
        }

        res.json({ OK: "OK" });
      });
    }
  );
};

const addWarehouseDestructions = (req, res, next) => {
  const { date, products } = req.body;

  // First query to insert the new load
  connection.query(
    "INSERT INTO mydb.warehouse_destructions (date) VALUES (?)",
    [date],
    (error, results) => {
      if (error) {
        console.error("Error inserting the warehouse destruction:", error);
        const newError = new HttpError(
          "Error inserting the warehouse destruction, please try again."
        );
        return next(newError);
      }
      // Get the last inserted load ID
      const lastInsertedWDestructionId = results.insertId;

      // Construct the second query to insert the car_destruction_transaction
      let transfersQuery =
        "INSERT INTO mydb.warehouse_destruction_transaction (warehouse_destructions_id, products_id, quantity) VALUES";

      for (const product of products) {
        const { productId, quantity } = product;
        const values = `${lastInsertedWDestructionId}, ${productId}, ${quantity}`;
        const secondPart = " (" + `${values}` + " ),";
        transfersQuery += secondPart;
      }

      // Remove the last comma and add a semicolon
      transfersQuery = transfersQuery.slice(0, -1) + ";";

      // Execute the second query to insert the transfers
      connection.query(transfersQuery, (error, results) => {
        if (error) {
          console.error("Error inserting the transaction:", error);
          const newError = new HttpError(
            "Error inserting the transaction, please try again."
          );
          return next(newError);
        }
        res.json({ OK: "OK" });
      });
    }
  );
};

const addCarReturns = (req, res, next) => {
  const { carId, date, products } = req.body;

  // First query to insert the new load
  connection.query(
    "INSERT INTO mydb.returns (car_id, date) VALUES (?, ?)",
    [carId, date],
    (error, results) => {
      if (error) {
        console.error("Error inserting the return:", error);
        const newError = new HttpError(
          "Error inserting the return, please try again."
        );
        return next(newError);
      }
      // Get the last inserted load ID
      const lastInsertedReturnID = results.insertId;

      // Construct the second query to insert the car_destruction_transaction
      let transfersQuery =
        "INSERT INTO mydb.returns_transaction (returns_id, products_id, quantity) VALUES";

      for (const product of products) {
        const productId = parseInt(product.productId);
        const quantity = parseInt(product.quantity);
        const values = `${lastInsertedReturnID}, ${productId}, ${quantity}`;
        const secondPart = " (" + `${values}` + " ),";
        transfersQuery += secondPart;
      }

      // Remove the last comma and add a semicolon
      transfersQuery = transfersQuery.slice(0, -1) + ";";

      // Execute the second query to insert the transfers
      connection.query(transfersQuery, (error, results) => {
        if (error) {
          console.error("Error inserting the transfers:", error);
          const newError = new HttpError(
            "Error inserting the transfers, please try again."
          );
          return next(newError);
        }
        res.json({ OK: "OK" });
      });
    }
  );
};

const addProduct = (req, res, next) => {
  const { productName } = req.body;

  connection.query(
    "INSERT INTO mydb.products (name) VALUES (?)",
    [productName],
    (error, results) => {
      if (error) {
        console.error("Error inserting the product:", error);
        const newError = new HttpError(
          "Error inserting the product, please try again."
        );
        return next(newError);
      }
      // Get the last inserted load ID
      res.json({ OK: "OK" });
    }
  );
};

const checkEntryExist = (req, res, next) => {
  const { transactionid } = req.body;
  const { flag } = req.body;

  const checkQuery =
    flag === "editload"
      ? `SELECT EXISTS(SELECT 1 FROM mydb.loads WHERE id = ${transactionid}) as entry_exists;`
      : flag === "editreturn"
      ? `SELECT EXISTS(SELECT 1 FROM mydb.returns WHERE id = ${transactionid}) as entry_exists;`
      : flag === "editcardestruction"
      ? `SELECT EXISTS(SELECT 1 FROM mydb.car_destructions WHERE id = ${transactionid}) as entry_exists;`
      : flag === "editwarehousedestruction"
      ? `SELECT EXISTS(SELECT 1 FROM mydb.warehouse_destructions WHERE id = ${transactionid}) as entry_exists;`
      : "";

  let exists;
  if (checkQuery !== "") {
    connection.query(checkQuery, (error, results) => {
      if (error) {
        console.error("Error editing the entry:", error);
        const newError = new HttpError("This id does not exists.");
        return next(newError);
      }
      res.json({ "exists": results[0].entry_exists });
    });
  } else {
    const newError = new HttpError("Something went wrong.");
    return next(newError);
  }
};

const editEntry = async (req, res, next) => {
  const { transactionid, products } = req.body;
  const { flag } = req.body;
  let query = "";

  const checkQuery =
    // Make sure the flag values are case insensitive
    flag.toLowerCase() === "editload"
      ? `SELECT EXISTS(SELECT 1 FROM mydb.loads WHERE id = ${transactionid}) as entry_exists;`
      : flag.toLowerCase() === "editreturn"
      ? `SELECT EXISTS(SELECT 1 FROM mydb.returns WHERE id = ${transactionid}) as entry_exists;`
      : flag.toLowerCase() === "editcardestruction"
      ? `SELECT EXISTS(SELECT 1 FROM mydb.car_destructions WHERE id = ${transactionid}) as entry_exists;`
      : flag.toLowerCase() === "editwarehousedestruction"
      ? `SELECT EXISTS(SELECT 1 FROM mydb.warehouse_destructions WHERE id = ${transactionid}) as entry_exists;`
      : "";

  const checkIfExists = (query) => {
    return new Promise((resolve, reject) => {
      if (query !== "") {
        connection.query(query, (error, results) => {
          if (error) {
            console.error("Error editing the entry:", error);
            const newError = new HttpError("This id does not exist.");
            reject(newError);
          } else {
            resolve(results[0].entry_exists);
          }
        });
      } else {
        const newError = new HttpError("Something went wrong.");
        reject(newError);
      }
    });
  };

try {
  const exists = await checkIfExists(checkQuery);

  if (flag.toLowerCase() === "editload" && exists) {
    let firstPart = `
      BEGIN;
      DELETE FROM mydb.transfers WHERE loads_id = ${transactionid};
      INSERT INTO mydb.transfers (loads_id, products_id, quantity) VALUES
    `;
    products.forEach((product) => {
      const values = `${transactionid}, ${product.productId}, ${product.quantity}`;
      const secondPart = `(${values}),`;
      firstPart += secondPart;
    });
    query = firstPart.slice(0, -1) + "; COMMIT;";
  } else if (flag.toLowerCase() === "editreturn" && exists) {
    let firstPart = `
      BEGIN;
      DELETE FROM mydb.returns_transaction WHERE returns_id = ${transactionid};
      INSERT INTO mydb.returns_transaction (returns_id, products_id, quantity) VALUES
    `;
    products.forEach((product) => {
      const values = `${transactionid}, ${product.productId}, ${product.quantity}`;
      const secondPart = `(${values}),`;
      firstPart += secondPart;
    });
    query = firstPart.slice(0, -1) + "; COMMIT;";
  } else if (flag.toLowerCase() === "editcardestruction" && exists) {
    let firstPart = `
      BEGIN;
      DELETE FROM mydb.car_destruction_transaction WHERE car_destructions_id = ${transactionid};
      INSERT INTO mydb.car_destruction_transaction (car_destructions_id, products_id, quantity) VALUES
    `;
    products.forEach((product) => {
      const values = `${transactionid}, ${product.productId}, ${product.quantity}`;
      const secondPart = `(${values}),`;
      firstPart += secondPart;
    });
    query = firstPart.slice(0, -1) + "; COMMIT;";
  } else if (flag.toLowerCase() === "editwarehousedestruction" && exists) {
    let firstPart = `
      BEGIN;
      DELETE FROM mydb.warehouse_destruction_transaction WHERE warehouse_destructions_id = ${transactionid};
      INSERT INTO mydb.warehouse_destruction_transaction (warehouse_destructions_id, products_id, quantity) VALUES
    `;
    products.forEach((product) => {
      const values = `${transactionid}, ${product.productId}, ${product.quantity}`;
      const secondPart = `(${values}),`;
      firstPart += secondPart;
    });
    query = firstPart.slice(0, -1) + "; COMMIT;";
  }

  if (query && exists) {
    connection.query(query, (error, results) => {
      if (error) {
        console.error("Error editing the entry:", error);
        const newError = new HttpError(
          "Error editing the entry, please try again."
        );
        return next(newError);
      }
      res.json({ OK: "OK" });
    });
  } else {
    const newError = new HttpError(
      "Invalid flag provided, please provide a valid flag."
    );
    return next(newError);
  }
} catch (error) {
  return next(error);
}

};


const deleteItem = (req, res, next) => {
  console.log(req.params);

  const itemId = req.params.itemId;

  console.log(req.params.itemId);

  // const { transactionid, date, products } = req.body;
  const { flag } = req.body;
  let query = "";
  console.log(flag);
  if (flag === "deleteLoadItem") {
    query = `
      BEGIN;
      DELETE FROM mydb.transfers
      WHERE loads_id = ${itemId};
      DELETE FROM mydb.loads
      WHERE id = ${itemId};
      COMMIT;
    `;
  } else if (flag === "deleteReturnItem") {
    query = `
      BEGIN;
      DELETE FROM mydb.returns_transaction
      WHERE returns_id = ${itemId};
      DELETE FROM mydb.returns
      WHERE id = ${itemId};
      COMMIT;
    `;
  } else if (flag === "deleteCarDestructionItem") {
    query = `
      BEGIN;
      DELETE FROM mydb.car_destruction_transaction
      WHERE car_destructions_id = ${itemId};
      DELETE FROM mydb.car_destructions
      WHERE id = ${itemId};
      COMMIT;
    `;
  } else if (flag === "deleteWarehouseDestructionItem") {
    query = `
    BEGIN;
    DELETE FROM mydb.warehouse_destruction_transaction
    WHERE warehouse_destructions_id = ${itemId};
    DELETE FROM mydb.warehouse_destructions
    WHERE id = ${itemId};
    COMMIT;
    `;
  }

  if (query) {
    connection.query(query, (error, results) => {
      if (error) {
        console.error("Error deleting the entry:", error);
        const newError = new HttpError(
          "Error deleting the entry, please try again."
        );
        return next(newError);
      }
      res.json({ OK: "OK" });
    });
  } else {
    const newError = new HttpError(
      "Invalid flag provided, please provide a valid flag."
    );
    return next(newError);
  }
};

const deleteWarehouse = (req, res, next) => {
  const { warehousedestructionid, date, products } = req.body;
  query = "";
};

exports.getLoads = getLoads;
exports.getDestructions = getDestructions;
exports.getReturns = getReturns;
exports.getWareHouseStatus = getWareHouseStatus;
exports.getWareHouseLastMonthStatus = getWareHouseLastMonthStatus;
exports.addLoads = addLoads;
exports.addCarDestructions = addCarDestructions;
exports.addWarehouseDestructions = addWarehouseDestructions;
exports.addCarReturns = addCarReturns;
exports.getCarList = getCarList;
exports.getProducts = getProducts;
exports.addProduct = addProduct;
exports.editEntry = editEntry;
exports.deleteItem = deleteItem;
exports.deleteWarehouse = deleteWarehouse;
exports.getQuantities = getQuantities;
exports.checkEntryExist = checkEntryExist;
