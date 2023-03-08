#!/bin/bash

# Node installieren 

cd ..

curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs

# alle Packages installieren 

npm install --all

sudo apt-get install libcap2-bin

sudo setcap cap_net_bind_service=+ep /usr/bin/node