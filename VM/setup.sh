#!/bin/bash

#system auf den aktuellen Stand bringen

sudo apt-get update -y

#datei aufrufen

bash Motion.sh
bash node.sh
bash Mosquitto.sh
bash mariaDB.sh

