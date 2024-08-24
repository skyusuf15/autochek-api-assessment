# Autochek API (Assessment)

## Overview

This is a NestJS application that includes functionalities for managing vehicles, loan applications, and user authentication. It provides RESTful APIs for vehicle data ingestion, loan application processing, and user authentication. The application also integrates vehicle valuation via an external API.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup](#setup)
3. [Running the Application](#running-the-application)
4. [Seeding the Database](#seeding-the-database)
5. [Swagger Documentation](#swagger-documentation)
6. [Login Credentials](#login-credentials)
7. [Testing](#testing)
8. [License](#license)

## Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)
- PostgreSQL (or another SQL database if preferred)
- An account with [RapidAPI](https://rapidapi.com/) for VIN lookup

## Setup

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/skyusuf15/autochek-api-assessment.git
    cd autochek-api-assessment
    ```

2. **Install Dependencies:**

    ```bash
    npm install
    ```

3. **Create a `.env` File:**

    Copy the `.env.example` file to `.env` and fill in the required environment variables:

    ```bash
    cp .env.example .env
    ```

    Example `.env` configuration:

    ```env
    APP_NAME=autochek-api
    NODE_ENV=development
    PORT=3000
    X_RAPIDAPI_KEY=xxxxxxxxxxxxxxxxx
    X_RAPIDAPI_HOST=vin-lookup-by-api-ninjas.p.rapidapi.com
    JWT_SECRET=xxxxxxxxxxxxxxxxx
    ```


## Running the Application

To start the application in development mode:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

To build the application for production:

```bash
# production mode
$ npm run start:prod
```

## Seeding the Database

The app automatically run seeds once the application is started but to seed the database manually, run:

```bash
npm run seed
```

Ensure your database is properly configured before running the seeder.

## Swagger Documentation

The application uses Swagger for API documentation. Once the application is running, you can access the Swagger UI at:

[http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)


## Login Credentials

**Endpoint:** `POST /api/v1/auth/login`

### Admin Login

**Request Body:**

```json
{
  "username": "admin",
  "password": "password"
}
```

### Dealer/Seller Login

**Request Body:**

```json
{
  "username": "dealer",
  "password": "password"
}
```

### Customer Login

**Request Body:**

```json
{
  "username": "customer",
  "password": "password"
}
```


## Testing

To run the unit tests:

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

