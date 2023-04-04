const HttpError = require("../models/http-error");

const DUMMY_USERS = [
  {
    id: "1",
    username: "Thanos",
    email: "thanosvarnavas@gmail.com",
    password: "password",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const logIn = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError(
      "Could not identify user, credentials seem to be wrong.",
      401
    );
  }

  res.json({ message: "Logged in" });
};

exports.getUsers = getUsers;
exports.logIn = logIn;
