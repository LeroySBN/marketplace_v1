# ALX Specialization Project
## Table of Contents

- [Description](#description)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [Authors](#authors)
- [License](#license)

## Description

This project is a template for building an e-commerce backend system using TypeScript, Express.js, MongoDB, and Redis. It includes basic functionality such as user authentication, vendor management, product management, and more.

## Requirements

Before you begin, ensure you have met the following requirements:

- **Linux**: We recommend using Ubuntu 22.04 for this project.
- **Python**: You need Python3 to run the application. We recommend using version 3.8.10 or later.
- **Node.js**: You need Node.js to run the application. We recommend using version 18.17.1 or later.
- **MySQL**: The project relies on MySQL as its primary database system. Make sure you have MongoDB installed; we recommend using version 8.0.
- **MongoDB**: The project relies on MongoDB as its secondary database system. Make sure you have MongoDB installed; we recommend using version 7.0.1.
- **Redis**: Redis is used for caching and session management. Ensure you have Redis installed, preferably version 6.0.16.

## Getting Started

Follow these steps to get the project up and running on your local machine:

1. Clone the repository:

  ```bash
  git clone https://github.com/leroysb/alx-specialization_project.git
  cd alx-specialization_project
  ```

2. Install project dependencies

  `npm install`

3. Configure environment variables

  Create a **.env** file in the project root and configure the following environment variables as needed:

  ```
  MARKETPLACE_ENV = 'dev'
  MARKETPLACE_API_HOST = 'localhost'
  MARKETPLACE_API_PORT = '5000'
  MONGODB_HOST = 'localhost'
  MONGODB_PORT = '27017'
  MONGODB_DATABASE = 'marketplace_dev_db'
  REDIS_HOST=localhost
  REDIS_PORT=6379
  REDIS_DB=0
  ```

4. Start the server

  `npm start`

## Usage

The project includes various routes and controllers for different features. You can customize and expand upon these features to build your web application. Here are some of the key routes:

* `/status`: Check the status of the server.
* `/vendors`: Create a new vendor account.
* `/vendors/me`: Retrieve information about the currently logged-in vendor.
* `/products`: Get a list of products.

Feel free to explore the [controllers](./marketplace_microservice/api/v1/src/controllers/) and [routes](./marketplace_microservice/api/v1/src/routes/) in the project's code to understand how they work and customize them to fit your application's requirements.

Here is a short [video demo](https://drive.google.com/file/d/1m_CScUXKQFDY9mkbn9ZOmYuem1TdCobj/view?usp=sharing)

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
