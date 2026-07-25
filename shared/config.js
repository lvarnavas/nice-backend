require("dotenv").config();

// Variables that must be present and non-empty for the server to boot.
const REQUIRED = ["DB_HOST", "DB_USER", "DB_NAME", "JWT_SECRET", "PORT"];

// Variables that must be defined but may legitimately be empty
// (a passwordless local MySQL user, for example).
const REQUIRED_ALLOW_EMPTY = ["DB_PASSWORD"];

const missing = [
  ...REQUIRED.filter((name) => !process.env[name]),
  ...REQUIRED_ALLOW_EMPTY.filter((name) => process.env[name] === undefined),
];

if (missing.length > 0) {
  console.error(
    `Missing required environment variables: ${missing.join(", ")}.\n` +
      "Copy .env.example to .env and fill in the values before starting the server."
  );
  process.exit(1);
}

module.exports = {
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
};
