const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "root",
  database: "mydb",
  multipleStatements: true,
});

const connection = pool.promise();

connection
  .getConnection()
  .then((connection) => {
    console.log("Connected to MySQL server");

    // Perform database operations using the connection

    connection.release(); // Release the connection back to the pool
  })
  .catch((err) => {
    console.error("Error connecting to MySQL server:", err);
  });

module.exports = connection;
