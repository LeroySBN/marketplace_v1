# ALX Specialization Project

This is a TypeScript-based API project that serves as a foundation for building a web application. This README provides an overview of the project, its requirements, and instructions for running and contributing to it.

## Table of Contents

- [Description](#description)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [Authors](#authors)
- [License](#license)

## Description

This project is a template for building web applications using TypeScript, Express.js, MongoDB, and Redis. It includes basic functionality such as user authentication, vendor management, product management, and more. Developers can use this project as a starting point to build custom web applications tailored to their needs.

## Requirements

Before you begin, ensure you have met the following requirements:

- **Node.js**: You need Node.js to run the application. We recommend using version 18.17.1 or later.
- **MongoDB**: The project relies on MongoDB as its database system. Make sure you have MongoDB installed; we recommend using version 7.0.1.
- **Redis**: Redis is used for caching and session management. Ensure you have Redis installed, preferably version 6.0.16.

## Getting Started

Follow these steps to get the project up and running on your local machine:

1. Clone the repository:

  ```bash
  git clone <repository-url>
  cd alx-specialization_project
  ```

2. Install project dependencies

  `npm install`

3. Configure environment variables

  Create a **.env** file in the project root and configure the following environment variables as needed:

  ```
  HOST='0.0.0.0'
  PORT=8000
  MONGODB_HOST=localhost
  MONGODB_PORT=27017
  MONGODB_DATABASE=procurement_ms
  REDIS_HOST=localhost
  REDIS_PORT=6379
  REDIS_DB=0
  ```

4. Start the server

  `npm start`

## Usage

The project includes various [routes](./api/src/routes/index.ts) and [controllers](./api/src/controllers/) for different features. You can customize and expand upon these features to build your web application. Here are some of the key routes:

* `/status`: Check the status of the server.
* `/vendors`: Create a new vendor account.
* `/vendors/me`: Retrieve information about the currently logged-in vendor.
* `/products`: Get a list of products.
* `/users`: Create a new user account.
* `/users/me`: Retrieve information about the currently logged-in user.

Feel free to explore the controllers and routes in the project's code to understand how they work and customize them to fit your application's requirements.

## Contributing

We welcome contributions to this project. To contribute:

1. Fork the repository on GitHub.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with clear, concise commit messages.
4. Push your changes to your fork.
5. Submit a pull request to the main repository's main branch.

Please follow the project's coding conventions and keep your code clean and well-documented.

## Authors

[Leroy Buliro](https://github.com/leroybuliro)

## License

This project is licensed under the [MIT License](./LICENSE).
