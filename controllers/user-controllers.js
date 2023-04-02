const HttpError = require("../models/http-error");

const DUMMY_USERS = [
  {
    id: "1",
    username: "Thanos",
    email: "thanosvarnavas@gmail.com",
    password: "password",
  },
];

const getUserbyId = (req, res, next) => {
  const userId = req.params.userId;
  const user = DUMMY_USERS.find((u) => {
    return u.id === userId;
  });

  if (!user) {
    return next(new HttpError("Could not find a user for this id", 404));
  }

  res.json({ user });
};

exports.getUserbyId = getUserbyId;
