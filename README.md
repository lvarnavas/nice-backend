# Nice — Backend

REST API for **Nice**, an ice warehouse management system. It tracks product
stock, vehicle loads, returns and destructions, and generates PDF reports for a
single day or a date range.

This is the server component. The React client lives in
[nice-frontend](https://github.com/lvarnavas/nice-frontend).

---

## Tech stack

| Concern        | Choice                   |
| -------------- | ------------------------ |
| Runtime        | Node.js 22               |
| Web framework  | Express 4                |
| Database       | MySQL (via `mysql2`)     |
| Authentication | JSON Web Tokens + bcrypt |
| PDF generation | PDFKit                   |

---

## Prerequisites

- Node.js 22 or later (`.nvmrc` is provided — run `nvm use`)
- npm 10 or later
- A running MySQL server

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/lvarnavas/nice-backend.git
cd nice-backend
npm install
```

### 2. Configure environment variables

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

| Variable      | Required | Description                                           |
| ------------- | -------- | ----------------------------------------------------- |
| `PORT`        | yes      | Port the API listens on (e.g. `5001`)                  |
| `DB_HOST`     | yes      | MySQL host, typically `localhost`                      |
| `DB_USER`     | yes      | MySQL username                                         |
| `DB_PASSWORD` | yes      | MySQL password (may be empty for a passwordless user)  |
| `DB_NAME`     | yes      | Database name, e.g. `mydb`                             |
| `JWT_SECRET`  | yes      | Secret used to sign authentication tokens              |

Generate a strong `JWT_SECRET` with:

```bash
openssl rand -hex 32
```

Use a **different secret in every environment** and never commit it. The server
refuses to start if any required variable is missing.

> During development you may instead supply these through a local
> `nodemon.json`. That file is git-ignored for the same reason `.env` is.

### 3. Create the database

The schema and seed data are created automatically on first run, but the
database itself must exist:

```sql
CREATE DATABASE mydb;
```

The configured MySQL user needs permission to create tables in it.

### 4. Run the server

```bash
npm run dev    # development, with nodemon file watching
npm start      # production
```

The API is then available at `http://localhost:5001/api`.

On first start the server creates the schema and, if the `users` table is empty,
inserts the initial seed data.

---

## API overview

All routes are mounted under `/api`. Tokens issued at login expire after one hour.

### Authentication

| Method | Endpoint           | Description                     |
| ------ | ------------------ | ------------------------------- |
| `POST` | `/users/login`     | Authenticate and receive a JWT  |

### Stock and reference data

| Method | Endpoint                                | Description                          |
| ------ | --------------------------------------- | ------------------------------------ |
| `GET`  | `/products/warehouse-status`            | Current warehouse stock              |
| `GET`  | `/products/total-products-destructions-status` | Aggregated destruction totals |
| `POST` | `/products/warehouse-last-month-status` | Stock as of the previous month       |
| `GET`  | `/products/get-car-list`                | Vehicles available for entries       |
| `GET`  | `/products/get-products`                | Product catalogue                    |

### Daily entries

| Method   | Endpoint                                          | Description                        |
| -------- | ------------------------------------------------- | ---------------------------------- |
| `POST`   | `/products/loads/:carId?/:startDate/:endDate`     | Loads for a vehicle or all vehicles |
| `POST`   | `/products/returns/:carId?/:startDate/:endDate`   | Returns for the given range        |
| `POST`   | `/products/destructions/:carId?/:startDate/:endDate` | Destructions for the given range |
| `POST`   | `/products/add-loads`                             | Record vehicle loads               |
| `POST`   | `/products/add-returns`                           | Record vehicle returns             |
| `POST`   | `/products/add-car-destructions`                  | Record vehicle destructions        |
| `POST`   | `/products/add-warehouse-destructions`            | Record warehouse destructions      |
| `POST`   | `/products/check-entry`                           | Check whether an entry exists      |
| `POST`   | `/products/get-quantities`                        | Quantities for an existing entry   |
| `PATCH`  | `/products/edit-entry`                            | Amend an existing entry            |
| `DELETE` | `/products/delete-item/:itemId`                   | Remove a single entry item         |
| `POST`   | `/products/calibrate-warehouse`                   | Reconcile warehouse quantities     |

### Reports

| Method | Endpoint                                              | Description                     |
| ------ | ----------------------------------------------------- | ------------------------------- |
| `POST` | `/products/generate-report`                           | Generate a single-day PDF report |
| `GET`  | `/products/generate-date-range-report/:startDate/:endDate` | Generate a range PDF report |
| `GET`  | `/products/reports-list`                              | List previously generated reports |
| `GET`  | `/products/report/:fileName`                          | Download a generated report      |

---

## Project structure

```
controllers/   Request handlers (products, users)
database/      Connection pool, schema creation, seed data
models/        Shared error model
routes/        Express route definitions
shared/        Configuration and helpers
assets/        Static assets used in generated PDFs
server.js      Application entry point
```

---

## Troubleshooting

**`Missing required environment variables: ...`** — copy `.env.example` to `.env`
and fill in every listed key.

**`Unknown database 'mydb'`** — create the database manually and confirm the
MySQL user has permission to create tables in it.

---

## Contributing

Branching model, commit conventions and the pull request process are documented
in [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

Released under the [MIT License](LICENSE).
