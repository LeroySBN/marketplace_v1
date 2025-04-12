# E-commerce API project
## Table of Contents

- [Description](#description)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
  - [Using Docker (Recommended)](#using-docker-recommended)
  - [Manual Setup](#manual-setup)
- [Usage](#usage)
- [Testing](#testing)
- [Contributing](#contributing)
- [Authors](#authors)
- [License](#license)

## Description

This project is a template for building an e-commerce backend system using TypeScript, Express.js, MongoDB, and Redis. It includes basic functionality such as user authentication, vendor management, product management, and more.

## Requirements

### Using Docker (Recommended)
- Docker Engine 24.0.0 or later
- Docker Compose v2.20.0 or later

### Manual Setup
- **Linux**: We recommend using Ubuntu 22.04
- **Node.js**: Version 18.17.1 or later
- **MongoDB**: Version 7.0.1 or later
- **Redis**: Version 6.0.16 or later

## Getting Started

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/leroysb/alx-specialization_project.git
cd alx-specialization_project
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Start the application:

For development:
```bash
# Build and start all services in development mode
docker compose -f docker-compose.dev.yml up --build

# Run in detached mode
docker compose -f docker-compose.dev.yml up -d
```

For production:
```bash
# Build and start all services in production mode
docker compose up --build

# Run in detached mode
docker compose up -d
```

The API will be available at `http://localhost:3000`

To stop the services:
```bash
# Development
docker compose -f docker-compose.dev.yml down

# Production
docker compose down
```

To view logs:
```bash
# View all service logs
docker compose logs -f

# View specific service logs (e.g., api)
docker compose logs -f api
```

### Manual Setup

1. Clone the repository:
```bash
git clone https://github.com/leroysb/alx-specialization_project.git
cd alx-specialization_project
```

2. Install project dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the project root with the following:
```env
MARKETPLACE_ENV = 'dev'
MARKETPLACE_API_HOST = 'localhost'
MARKETPLACE_API_PORT = '3000'
MONGODB_HOST = 'localhost'
MONGODB_PORT = '27017'
MONGODB_DATABASE = 'marketplace_dev_db'
REDIS_HOST = localhost
REDIS_PORT = 6379
REDIS_DB = 0
```

4. Start the server:
```bash
npm start
```

## Usage

The API includes various endpoints for different features:

* `GET /status`: Check the status of the server
* `POST /vendors`: Create a new vendor account
* `GET /vendors/me`: Retrieve information about the currently logged-in vendor
* `GET /products`: Get a list of products with filtering and pagination
* `GET /products/:id`: Get a specific product by ID

For detailed API documentation, please refer to our [API Documentation](./docs/api.md).

## Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## Contributing

We welcome contributions to this project. To contribute:

1. Fork the repository on GitHub.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with clear, concise commit messages.
4. Push your changes to your fork.
5. Submit a pull request to the main repository's main branch.

Please follow the project's coding conventions and keep your code clean and well-documented.

## Authors

* [Leroy Nazoi] | [Github](https://github.com/leroysbn) | [LinkedIn](https://linkedin.com/in/lsbn)

## License

This project is licensed under the [MIT License](./LICENSE).
