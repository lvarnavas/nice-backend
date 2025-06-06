# Nice - Backend

This is the Node.js/Express back-end API server for the **Nice** project. It provides RESTful endpoints for data management and connects to a MySQL database.

---

## Prerequisites

- Node.js (v16+ recommended)
- npm
- MySQL server running locally
- A database created (the name should match the value provided in the `.env` file)

---

## Getting Started

### 1. Clone the repository

### 2. Install dependencies

- npm install

### 3. Set up environment variables

Create a .nodemon.json file in the root of the project and add the following content (Note: Only for development):

{
  "env": {
      "DB_USER": "",
      "DB_PASSWORD": "",
      "DB_NAME": "",
      "DB_HOST": "",
      "PORT": "" 
  }
}

PORT: The port where the API server will run. For example 5001.

DB_HOST: The MySQL host (typically localhost).

DB_USER: Your MySQL username.

DB_PASSWORD: Your MySQL password.

DB_NAME: The name of the MySQL database to connect to.

### 4. Create a database

Create a database with database name "mydb" manually on MySQL to initialize the database.

### 5. Start the server (development) 

Start the server for development with nodemon.

- npm run dev

This uses nodemon to watch for file changes.

The server will start on http://localhost:5001 (or the port specified in .env).

Upon first run, it will attempt to create the database schema and insert initial data if none is present.


## API Endpoints

The API is accessible via: http://localhost:5001/api

Example routes (depending on your implementation):

    GET /api/users

    POST /api/login

    etc.

Notes

    Make sure your MySQL service is running before starting the server.

    If you get an error like Unknown database 'mydb', ensure that:

        The database user has the right permissions to create databases.

        Your .env config is correct.