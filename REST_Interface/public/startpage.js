import { WSClient, tempData, DateFormatter } from "/toolbox.js";
//Die Klasse erbt von WS Client und verarbeitet die eingehende Nachrichten die für die Startseite relevant sind
class WS extends WSClient {
  constructor() {
    super();

    // super.renderMessages(this.ws)
    this.renderMessages();
  }
  renderMessages() {
    const client = this;
    try {
      client.ws.onmessage = function (messageEvent) {
        const data = JSON.parse(messageEvent.data);
        switch (data.topic) {
          case "SystemTime": {
            client.setSystemTime(data.message);
            break;
          }
          case "Metrics": {
            const str = JSON.parse(data.message);
            client.maxRef.innerHTML = Object.values(str)[0] + " °C";
            client.minRef.innerHTML = Object.values(str)[1] + " °C";
            client.avgRef.innerHTML = Object.values(str)[2] + " °C";
            break;
          }
          case "DoorState": {
            client.doorStateRef.innerHTML = data.message;
            break;
          }
          case "LatestTemp": {
            const tempInside = JSON.parse(data.message).value;
            client.tempInsideRef.innerHTML = tempInside + " °C";
            tempData.push({
              x: DateFormatter.getFormattedDate(new Date()),
              y: tempInside,
            });
            // endTimeRef.value = DateFormatter.getFormattedDate(Data.pop().x);
            break;
          }
          default: {
            break;
          }
        }
      };
    } catch (err) {
      console.log(err);
    }
  }
}
const socket = new WS();
