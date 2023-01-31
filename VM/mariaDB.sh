#!/bin/bash

# install mariadb-server

sudo apt install default-mysql-server -y



sudo mariadb --user=root --password=password1234

sudo mysql <<MariaDB_SCRIPT

CREATE USER IF NOT EXISTS 'HaRoMa'@'localhost' IDENTIFIED BY 'password1234';

CREATE DATABASE IF NOT EXISTS smartfridge;

GRANT ALL PRIVILEGES ON smartfridge . * TO 'HaRoMa'@'localhost';
FLUSH PRIVILEGES;

USE smartfridge;


CREATE TABLE IF NOT EXISTS messergebnisse (
    ID int NOT NULL AUTO_INCREMENT,
     Messwert decimal(3,1) NOT NULL,
     InDtTm datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
     PRIMARY KEY (ID)
   ) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

EXIT;
MariaDB_SCRIPT 
