#!/bin/bash

#ein Verzeichnis höher wechseln

cd /home/smartfridge/REST_Interface

#Services und Server starten
node server.js &
node ../Configmanager/configmanager.js & 
node ../Alertservice/Alert-Service.js & 
node ../GPIO-Service/GPIO-Service.js & 
node ../Email-Service/Email-Service.js
