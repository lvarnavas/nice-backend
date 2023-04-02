const express = require("express");

const userControllers = require("../controllers/user-controllers");
const router = express.Router();

router.get("/:userId", userControllers.getUserbyId);

module.exports = router;
