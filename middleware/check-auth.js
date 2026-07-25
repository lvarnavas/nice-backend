const jwt = require("jsonwebtoken");

const config = require("./../shared/config");

/**
 * Rejects any request that does not carry a valid bearer token.
 *
 * Responds directly rather than delegating to the error handler so the status
 * code is guaranteed to reach the client as 401.
 */
const checkAuth = (req, res, next) => {
  // Preflight requests never carry the Authorization header, so they must pass
  // through untouched or the browser blocks the request that follows.
  if (req.method === "OPTIONS") {
    return next();
  }

  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Απαιτείται σύνδεση." });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({ message: "Απαιτείται σύνδεση." });
  }

  try {
    const decodedToken = jwt.verify(token, config.jwtSecret);
    req.userData = {
      userId: decodedToken.userId,
      username: decodedToken.username,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Η σύνδεση έληξε." });
  }
};

module.exports = checkAuth;
