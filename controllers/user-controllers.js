const HttpError = require("../models/http-error");
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

const logIn = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser =
      "SELECT * FROM mydb.users WHERE email = '" + `${email}` + "' ";
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again.", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in",
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in",
      403
    );
    return next(error);
  }

  res.json({
    user: existingUser,
    userId: existingUser.id,
    email: existingUser.email,
  });
};

exports.getUser = getUser;
exports.logIn = logIn;
