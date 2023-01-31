#!/bin/bash

# alle Services starten

node ../Configmanager/configmanager.js & 
node ../REST_Interface/server.js & 
node ../Alertservice/Alert-Service.js & 
node ../GPIO-Service/GPIO-Service.js & 
node ../Email-Service/Email-Service.js
