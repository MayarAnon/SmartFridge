#!/bin/bash

#system auf den aktuellen Stand bringen

sudo apt-get update -y

#sicherstellen, dass bash Dateien unix Datein sind
dos2unix Motion.sh
dos2unix node.sh
dos2unix Mosquitto.sh
dos2unix mariaDB.sh
dos2unix start.sh
#datei aufrufen

#system in den Autostart bringen 

#service Datei in den richtigen Ordner bringen 

sudo cp smartfridge.service /etc/systemd/system/smartfridge.service

#Autostart neustarten 

systemctl daemon-reload
systemctl enable smartfridge.service

#Dinste Herunterladen und installieren 

bash Motion.sh
bash node.sh
bash Mosquitto.sh
bash mariaDB.sh

