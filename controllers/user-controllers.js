const connection = require("../database/mysql");
const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const getUser = (req, res, next) => {
  const { userId } = req.params;

  const user = "SELECT * FROM mydb.users WHERE id = " + `${userId}` + " ";

  try {
    connection.query(user, (error, results) => {
      if (error) {
        throw error;
      }
      if (!user) {
        const error = new HttpError(
          "Could not find a user for the provided id",
          404
        );
        return next(error);
      }
      const data = results[4];

      res.json({ user: data });
    });
  } catch (err) {
    const error = new HttpError("Fetching user failed, please try again.");
    return next(error);
  }
};

const logIn = (req, res, next) => {
  const { username, password } = req.body;
  console.log(password);

  const sql = "SELECT * FROM users WHERE username = ?";
  connection.query(sql, [username], async (error, results, fields) => {
    if (error) {
      const err = new Error("Logging in failed, please try again.");
      err.status = 500;
      return next(err);
    }

    const existingUser = results[0];
    console.log(existingUser);

    if (!existingUser) {
      const error = new Error("Invalid credentials, could not log you in");
      error.status = 403;
      return next(error);
    }

    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, existingUser.password);
      console.log(isValidPassword);
    } catch (err) {
      const error = new Error(
        "Could not log you in, please check your credentials and try again"
      );
      error.status = 500;
      return next(error);
    }

    if (!isValidPassword) {
      const error = new Error("Invalid credentials, could not log you in");
      error.status = 403;
      return next(error);
    }

    let token;
    try {
      token = jwt.sign(
        { userId: existingUser.id, username: existingUser.username },
        "supersecret",
        { expiresIn: "1h" }
      );
    } catch (err) {
      console.log(err);
      const error = new Error("Logging in failed, please try again.");
      error.status = 500;
      return next(error);
    }

    res.json({
      user: existingUser,
      userId: existingUser.id,
      email: existingUser.username,
      token: token,
    });
  });
};

exports.getUser = getUser;
exports.logIn = logIn;
