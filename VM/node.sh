#!/bin/bash

# Node installieren 

cd ..

curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs

cd ..

npm install all