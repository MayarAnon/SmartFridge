//smartfridge von HaRoMa
//Stellt einen mqtt Client welcher sich mit dem Broker verbindet

const mqtt = require("async-mqtt");
const config = new (require("../Configmanager/config"))();

//Klasse für die erstellung einer MQTT Verbindung gibt eine MQTT-Client zurück mit allen funktionen von async Mqtt
//Vorteile: nur eine Instance pro Service, Eine Verbindung, Automatisches Reconnecten, automatische Sicherheit
//Parameter: den Namen des Services
//return: mqttClient Verbindung als Promise
class MqttClient {
  constructor(serviceName) {
    //Optionen der Verbindung deklarieren

    this.brokerHostUrl = config.get("mqttClient:brokerHostUrl");

    this.options = {
      clean: true, // Sorgt für den Empfang von Nachrichten QoS 1 und 2 wenn Offline
      reconnectPeriod: 1000, // falls Verbindung abbricht / Verbindungsversuch fehlschlägt => Zeit zwischen Versuchen in ms
      resubscribe: true,
      clientId: serviceName,
      username: config.get("mqttClient:username"), //Parameter des Konstruktors
      password: config.get("mqttClient:password"),
    };

    return this.#connection();
  }

  //Baut eine Verbindung zum MQTT Broker auf Bib sorgt intern für den Erhalt der Verbindung
  //Parameter: keine
  //return: mqttClient als Promise
  async #connection() {
    try {
      this.client = await mqtt.connectAsync(this.brokerHostUrl, this.options);
    } catch (error) {
      console.log(error);
    }
    return this.client;
  }

  //Trennt die Verbindung bei Zerstörung des Objekts

  destructor() {
    this.client.end();
  }
}

module.exports = MqttClient;
