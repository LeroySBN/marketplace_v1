- prepares a MySQL server for the auth service

CREATE DATABASE IF NOT EXISTS auth_dev_db;
CREATE USER IF NOT EXISTS 'auth_dev'@`localhost` IDENTIFIED BY 'auth_dev_pwd';
GRANT SELECT ON performance_schema.* TO 'auth_dev'@'localhost';
GRANT ALL PRIVILEGES ON hbnb_dev_db.* TO 'auth_dev'@'localhost';
FLUSH PRIVILEGES;

DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    password VARCHAR(255) NOT NULL
);
