#!/bin/bash

#um zu schauen ob die Kamera erkannt wird
sudo apt-get install usbutils -y

#Rechte in relevanten Ordnern ändern

sudo mkdir /var/log/motion

sudo chmod 777 -R /var/log/motion

#Motion installieren 

sudo apt-get install motion -y

#Motion Config mit vorgeschriebener Config ersetzen 

sudo rm /etc/motion/motion.conf

sudo cp  motion.conf /etc/motion/

# Motion Service neustarten

sudo service motion restart



