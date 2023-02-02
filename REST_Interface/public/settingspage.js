import {
  WSClient,
  transmit,
  isEmail,
  isNumeric,
  DateFormatter,
} from "/toolbox.js";
const tempLimitRef = document.getElementById("tempMax");
const currentTempLimitRef = document.getElementById("currentTempThreshold");

const timeLimitRef = document.getElementById("timeMax");
const currentTimeLimitRef = document.getElementById("currentTimeThreshold");

const lastDeletetRef = document.getElementById("lastDelete");
const deleteHistoryRef = document.getElementById("deleteDatabase");

const emailadresseRef = document.getElementById("currentEmailAdress");
const setEmailAdresseRef = document.getElementById("emailAdress");

const downloadBtnRef = document.getElementById("downloadAlerts");

const dateRef = document.getElementById("systemDate");
const timeRef = document.getElementById("systemTime");

//Die Klasse erbt von WSClient und stellt ein WS client dar, mit renderMessages werden die relavanten Nachrichten verarbeitet
class WS extends WSClient {
  constructor() {
    super();
    // super.renderMessages(this.ws)
    this.renderMessages();
  }
  renderMessages() {
    const client = this;

    client.ws.onmessage = function (messageEvent) {
      const data = JSON.parse(messageEvent.data);
      if (data.topic == "SystemTime") {
        client.setSystemTime(data.message);
      }
      //LocalStorage im Browser löschen und neu aufsetzen
      if (data.topic == "localStorage") {
        localStorage.clear();
        for (var i = 0; i < buttons.length; i++) {
          if (buttons[i].id == "10sButtonMemory") {
            buttons[i].style.backgroundColor = "Lightblue";
          } else {
            buttons[i].style.backgroundColor = "transparent";
          }
          localStorage.setItem(buttons[i].id, buttons[i].style.backgroundColor);
        }
      } else {
      }
    };
  }
}
const socket = new WS();

if (document.body.addEventListener) {
  document.body.addEventListener("click", handleBtn);
} else {
  document.body.attachEvent("onclick", handleBtn);
}
var buttonColors = {};
const buttons = document.getElementsByName("MemoryButton");
//Die Funktion passt die Farben aller Knöpfe an, wenn einen Knopf für den SpeicherintervallAuswahl betätigt wurde
//die Farben werden dann im LocalStorage gespeichert
//Src: https://stackoverflow.com/a/23835260

function handleBtn(element) {
  element = element || window.event;
  var target = element.target || element.srcElement;

  if (target.tagName === "BUTTON" && target.name.match("MemoryButton")) {
    var id = target.id;
    setTimeInterval(target.value);
    buttonColors[id] = "Lightblue";
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i] == target) {
        buttons[i].style.backgroundColor = buttonColors[id];
      } else {
        buttonColors[buttons[i].id] = "transparent";
        buttons[i].style.backgroundColor = buttonColors[buttons[i].id];
      }
      localStorage.setItem(buttons[i].id, buttons[i].style.backgroundColor);
    }
  }
}
//wenn die Seite neugeladen wird, werden die Farben der knöpfe angepasst
window.addEventListener("load", function () {
  for (var i = 0; i < buttons.length; i++) {
    var id = buttons[i].id;
    buttons[i].style.backgroundColor =
      localStorage.getItem(id) || "transparent";
  }
});
// Die Felder aktuelle emailadresse/letzte löschung/eingestellter Schwellwert/ eingestellte maximale Öffnungszeit
// mit den Werten aus "http://localhost:3000/api/initialValues" initializieren
axios
  .get("http://localhost:3000/api/initialValues")
  .then((response) => {
    emailadresseRef.innerHTML = response.data.mailAdressRecipient;
    lastDeletetRef.innerHTML = response.data.lastDeleteHistory;
    currentTempLimitRef.innerHTML = response.data.tempLimitValue;
    currentTimeLimitRef.innerHTML = response.data.timeLimitValue;
  })
  .catch((error) => {
    console.error(error);
  });

//die Funktion ist für die Verarbeitung von der Benutzereingabe "Temperaturschwellwert"
const setTempLimitValue = () => {
  if (
    isNumeric(
      tempLimitRef,
      "Bitte nur Kommazahlen mit maximal einer Nachkommastelle eingeben!!"
    )
  ) {
    transmit("api/tempLimitValue", tempLimitRef.value.toString());
    currentTempLimitRef.innerHTML = tempLimitRef.value;
  }
};

//die Funktion ist für die Verarbeitung von der Benutzereingabe "maximale öffnungszeit"
const setTimeLimitValue = () => {
  if (isNumeric(timeLimitRef, "bitte Zeit in Minuten eingeben!!")) {
    const limit = timeLimitRef.value * 60;
    transmit("api/timeLimitValue", limit);
    currentTimeLimitRef.innerHTML = limit;
  }
};
// die funktion sendet das Speicherintervall mit der Funktion transmit(post request)
const setTimeInterval = (intervalInSec) => {
  transmit("api/timeInterval", intervalInSec);
};

//die Funktion ist für die Verarbeitung von der Benutzereingabe "Löschen"
const deleteHistory = () => {
  lastDeletetRef.innerHTML = dateRef.innerHTML + " " + timeRef.innerHTML;
  transmit("api/deleteHistory", "true");
};

//die Funktion ist für die Verarbeitung von der Benutzereingabe "Emailadresse"
const setEmailAdresse = () => {
  if (
    isEmail(setEmailAdresseRef, "bitte eine gültige Emailadresse eingeben!!")
  ) {
    transmit("api/mailAdressRecipient", setEmailAdresseRef.value);
    emailadresseRef.innerHTML = setEmailAdresseRef.value;
  }
};
//die funktion ruft einen Link um die LogDatei runterzuladen
const downloadLogFile = () => {
  window.open(
    "http://localhost:3000/api/downloadLog",
    "_self",
    "resizable=yes"
  );
};

downloadBtnRef.addEventListener("click", downloadLogFile);
setEmailAdresseRef.addEventListener("change", setEmailAdresse);
tempLimitRef.addEventListener("change", setTempLimitValue);
timeLimitRef.addEventListener("change", setTimeLimitValue);
deleteHistoryRef.addEventListener("click", deleteHistory);
