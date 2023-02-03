import { WSClient } from "/toolbox.js";
//Die Klasse erbt von WS Client und verarbeitet die eingehende Nachrichten die für die kameraseite relevant sind
class WS extends WSClient {
  constructor() {
    super();
    this.#renderMessages();
  }
  #renderMessages() {
    const client = this;
    try {
      client.ws.onmessage = function (messageEvent) {
        const data = JSON.parse(messageEvent.data);
        if (data.topic == "SystemTime") {
          client.setSystemTime(data.message);
        }
      };
    } catch (err) {
      console.log(err);
    }
  }
}
const socket = new WS();

// Die funktion ermittelt den url für den cameraStream
function getHostAddress() {
  return (
    window.location.protocol +
    "//" +
    window.location.hostname +
    ":8081/0/stream"
  );
}
document.getElementById("cameraStream").src = getHostAddress();
