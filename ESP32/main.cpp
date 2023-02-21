//samrtfridge von HaRoMa
//IoT anbindung durch ESP32 welcher LED nach Türstatus schaltet und Temperaturwerte ließt und unter tempOutside schickt
#include <Arduino.h>
#include <PubSubClient.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
#include <WiFi.h>


//DHT sesor einrichten 

DHT dht(4,DHT11);

// Wlan und MQTT Client einrichten/Objekte davon anlegen 

const char *ssid = "WLAN-P8UQS9";
const char *password = "5463872899872204";
const char *mqtt_server = "smartfridge.local"; //25531de9ef514270b301b8b4cc260c07.s2.eu.hivemq.cloud
//const char* mqttUser = "den.roth.21";
//const char* mqttPassword = "8_sXskxLH7rrKlj";
const int mqtt_port = 8883;
WiFiClient espClient;
PubSubClient client(espClient);

//Verbindungsaufbau WLan, MQTT, verarbeitung von relevanten Nachrichten und senden von Temperaturmesswerten
//Parameter: keine 
class TempSensor{
    public:

      //Konstruktor baut Wlan verbindung auf und stellt eine Verbindung mit MQTT Broker her
      //Parameter: keine
      //return: kein 
      TempSensor(){
        //Mit Wlan verbinden
        
        WiFi.begin(ssid, password);
        while (WiFi.status() != WL_CONNECTED)
        {
          delay(1000);
          Serial.println("Connecting to WiFi...");
        }
        Serial.println("Connected to WiFi");

        //Mit MQTT Broker verbinden 

        client.setServer(mqtt_server, mqtt_port);

        while (!client.connect("ESP"))
        {
          Serial.println("Failed to connect to MQTT broker. Trying again...");
          delay(1000);
        }
        Serial.println("Connected to MQTT broker");

        //Relevante Topics abonnieren 

        client.subscribe("doorState");
      }

      String temperature(){
        return String(dht.readTemperature())+".0";
      }

      //Sendet Temperaturmesswerte unter dem Topic tempOutside
      //Parameter: keine
      //return: kein
      void sendData(){
        String tempValue = temperature();

        //Konvertierung in chararray

        char temp[3];
        for (int i = 0; i < tempValue.length() - 3; i++)
        {
          temp[i] = tempValue[i];
        }
        client.publish("tempOutside",temp);
      }

      //Wird aufgerufen wenn neue Nachrichten unter subscribten topics gepublished werden steuert dann aufbauend darauf eine LED
      //Parameter: topic(MQTT),Message(MQTT),lenght: länge der Nachricht 
      //return: kein
      void processMessages(char * topic, uint8_t * payload, unsigned int length){
        String strTopic = String(topic);
        String strPayload = "";
        //Konvertierung von char Array zu String

        for (int i = 0; i < length; i++)
        {
          strPayload += (char)payload[i];
        }
        
        //Handling relevanter Topics
        if (strTopic == "doorState")
        {
          if (strPayload == "open")
          {
            digitalWrite(2, HIGH); // Turn on the LED
          }
          if (strPayload == "closed")
          {
            digitalWrite(2, LOW); // Turn off the LED
          }
        }
        else
        {
          digitalWrite(2, LOW); // Turn off the LED
        }
      }
};

//erstellen einer Instanz der Klasse
TempSensor sensorOutside;

//Wird aufgerufen wenn neue Nachrichten unter subscribten Topics gesedet wurden und gibt diese dann an die Verarbeitung weiter
//Parameter: topic(MQTT),Message(MQTT),lenght: länge der Nachricht 
void onMessage(char * topic, uint8_t * payload, unsigned int length) {
  sensorOutside.processMessages(topic,payload,length);
}

//Arduino setup und loop funktionen 

void setup() {
  Serial.begin(9600);
  dht.begin(); //Starten Temperaturwerte zu lesen 
  pinMode(2, OUTPUT); // Setzt PIN 2 welches die Onbord LED ist als Output
}


void loop() {
  //
  client.setCallback(onMessage);
  sensorOutside.sendData();
  delay(1000);
  client.loop();
  
}
