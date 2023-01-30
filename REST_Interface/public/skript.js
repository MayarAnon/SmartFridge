const dateRef = document.getElementById("datum");
const timeRef = document.getElementById("uhrzeit");
const maxRef = document.getElementById("maximum");
const minRef = document.getElementById("minimum");
const avgRef = document.getElementById("avg");
const tempInsideRef = document.getElementById("tempinside");
const doorStateRef = document.getElementById("doorstate");

let startTimeRef = document.getElementById("startTime");
let endTimeRef = document.getElementById("endTime");
const refreshBtnRef = document.getElementById("refreshchart");

const tempLimitRef = document.getElementById("tempschwellwert");
const currentTempLimitRef = document.getElementById("akteullertempschwellwert");

const timeLimitRef = document.getElementById("maxzeit");
const currentTimeLimitRef = document.getElementById("akteullemaxzeit");

const lastDeletetRef = document.getElementById("lastdelete");
const deleteHistoryRef = document.getElementById("deletehistory");

const emailadresseRef = document.getElementById("emailadresse");
const setEmailAdresseRef = document.getElementById("setemailadresse");

const tableRef = document.getElementById("messwertetabelle");

const serverUrl = "http://localhost:3000";
const websocketUrl = "ws://localhost:3001";
//Die funktion prüft ob der Wert eines HTML Tags eine ganze Zahl oder eine Kommazahl mit einer nachkommastelle ist
function isNumeric(elem, helperMsg) {
  var numericExpression = /^[0-9]+(\.[0-9]{1})?$/;
  if (elem.value.match(numericExpression)) {
    return true;
  } else {
    alert(helperMsg);
    elem.focus();
    return false;
  }
}
//Die funktion prüft ob der Wert eines HTML Tags eine gültige Emailformat hat
function isEmail(elem, helperMsg) {
  var emailExpression = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (elem.value.match(emailExpression)) {
    return true;
  } else {
    alert(helperMsg);
    elem.focus();
    return false;
  }
}
//Das Objekt stellt die Zeit in der richtigen Format und in der richtigen Zeitzone
let DateFormatter = {
  //Die funktion gibt die Zeit in folgender Format zurück: YYYY-MM-DDThh:mm:ss
  //Die Zeit kann als String oder als Date objekt übergeben werden
  getFormattedDate(dateToConvert) {
    if (!(dateToConvert instanceof Date)) {
      dateToConvert = new Date(dateToConvert);
    }
    dateToConvert.setTime(dateToConvert.getTime() + 60 * 60 * 1000);
    let isoDate = dateToConvert.toISOString().slice(0, 19);
    return isoDate;
  },
  //die Funktion wandelt ein javascript date objekt in einem String mit der Format YYYY-MM-DD hh:mm:ss
  dateTime(dateToConvert) {
    dateToConvert = this.getFormattedDate(dateToConvert);
    const date = dateToConvert.substring(0, dateToConvert.indexOf("T") | 0);
    const time = dateToConvert.substring(
      (dateToConvert.indexOf("T") + 1) | 0,
      (dateToConvert.indexOf("T") + 9) | 0
    );
    return date + " " + time;
  },
};

//Die Funktion sendet POST Requests an dem RESTAPI.  URL und die Nachricht werden als parameter übergeben
function transmit(adress, container, value) {
  let object = { container, value };
  fetch(adress, {
    method: "POST",
    body: JSON.stringify(object),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
//die Funktion ändert die skallierung der Zeitachse wenn der Benutzer day/hour/minute/second wählt
function changeUnit(period) {
  try {
    //stepSize muss geändert werden, wenn starttime and endtime zu weit von einander sind, dass die Daten nicht dargestellt werden mit einem Stepsize von 1
    if (
      period == "second" &&
      new Date(endTimeRef.value).getTime() -
        new Date(startTimeRef.value).getTime() <
        60000
    ) {
      config.options.scales.x.ticks.stepSize = 60;
    } else {
      config.options.scales.x.ticks.stepSize = 1;
    }
    // myChart.update();
    config.options.scales.x.time.unit = period;
    myChart.update();
  } catch (error) {
    alert(
      "Die gewählte Zeiteinheit ist nicht geeignet für den gewählten Zeitraum",
      error
    );
  }
}

var sysDate;
var sysTime;
//Die funktion formattiert und speichert die Systemzeit/datum in den Variable sysDate und sysTime
const setSystemTime = (SystemTime) => {
  //DatumUndZeitRef.value = SystemTime;
  sysDate = DateFormatter.dateTime(SystemTime).slice(0, 10);
  sysTime = DateFormatter.dateTime(SystemTime).slice(10, 19);
  dateRef.innerHTML = sysDate;
  timeRef.innerHTML = sysTime;
};
let tempData = [
  // { x: DateFormatter.getFormattedDate(new Date()), y: 12 },
  // { x: DateFormatter.getFormattedDate("2023-01-21T19:30:00"), y: 12 },
  // { x: DateFormatter.getFormattedDate("2023-01-21T22:30:00"), y: 42 },
  // { x: "2023-01-22T01:00:00", y: 2 },
  // { x: DateFormatter.getFormattedDate("2023-01-22T02:00:00"), y: 11 },
  // { x: DateFormatter.getFormattedDate("2023-01-23T03:00:00"), y: 44 },
];

//setup Block
const data = {
  datasets: [
    {
      label: "Kühlschrankstemperatur",
      backgroundColor: "rgba(255, 99, 132, 0.8)",
      borderColor: "rgba(255, 99, 132, 1)",
      fill: false,
      data: tempData,
    },
  ],
};

// config Block
const config = {
  type: "line",
  data,
  options: {
    responsive: true,
    scales: {
      x: {
        type: "time",
        time: {
          //unit:'hour',
          displayFormats: {
            hour: "dd.MM \n hh:mm",
            minute: "dd.MM \n hh:mm",
            second: "dd.MM \n hh:mm:ss",
          },
        },
        ticks: {
          stepSize: 1,
          autoSkip: true,
          minTicksLimit: 3,
          maxTicksLimit: 24,
        },
        display: true,
        scaleLabel: {
          display: true,
          labelString: "Erfassungszeit",
        },
      },
      y: {
        display: true,
        scaleLabel: {
          display: true,
          labelString: "Temperatur",
        },
        ticks: {
          // Include a dollar sign in the ticks
          callback: function (value) {
            return value + "°C";
          },
        },
      },
    },
  },
};

//init // render Block
const myChart = new Chart(document.getElementById("myChart"), config);

//Die funktion erstellt ein WS Client und  verarbeitet die eingehende Nachrichten
const initWebsocket = (() => {
  try {
    const ws = new WebSocket(`${websocketUrl}`);
    ws.onopen = function () {
      console.log(`Erfolgreich mit WebSocket verbunden`);
    };
    ws.onmessage = function (messageEvent) {
      const data = JSON.parse(messageEvent.data);
      switch (data.topic) {
        case "SystemTime": {
          setSystemTime(data.message);
          break;
        }
        case "Metrics": {
          const str = JSON.parse(data.message);
          maxRef.value = Object.values(str)[0] + " °C";
          minRef.value = Object.values(str)[1] + " °C";
          avgRef.value = Object.values(str)[2] + " °C";
          break;
        }
        case "DoorState": {
          doorStateRef.value = data.message;
          break;
        }
        case "LatestTemp": {
          const tempInside = JSON.parse(data.message).value;
          tempInsideRef.value = tempInside + " °C";
          insertIntoTable(tempInside);
          tempData.push({
            x: DateFormatter.getFormattedDate(new Date()),
            y: tempInside,
          });
          myChart.update();
          // endTimeRef.value = DateFormatter.getFormattedDate(Data.pop().x);
          break;
        }
        default: {
          console.log(
            `error in initwebsocket topic: ${data.topic} message: ${data.message}`
          );
        }
      }
    };

    ws.onerror = function (err) {
      alert(
        `Der Websocketserver kann nicht erreicht werden. \n sehe console für mehr information`
      );
      console.log(`err: ${err}`);
    };
    window.addEventListener("unload", function () {
      if (ws.readyState == WebSocket.OPEN) ws.close();
    });
  } catch (err) {
    console.log(err);
  }
})();

//das erste Datetime-local auf dem ersten Punkt im Diagramm stellen
const settimeoption = (() => {
  function runThis() {
    if (tempData[0]) {
      startTimeRef.value = tempData[0].x;
      return;
    } else {
      setTimeout(() => {
        runThis();
      }, 2000);
    }
  }
  runThis();
})();

//die Funktion ist für die Verarbeitung von der Benutzereingabe "Temperaturschwellwert"
const setTempLimitValue = () => {
  if (
    isNumeric(
      tempLimitRef,
      "Bitte nur Kommazahlen mit maximal einer Nachkommastelle eingeben!!"
    )
  ) {
    transmit("api/tempLimitValue", tempLimitRef.value.toString());
    currentTempLimitRef.value = tempLimitRef.value + " °C";
  }
};

//die Funktion ist für die Verarbeitung von der Benutzereingabe "maximale öffnungszeit"
const setTimeLimitValue = () => {
  if (isNumeric(timeLimitRef, "bitte Zeit in minuten eingeben!!")) {
    transmit("api/timeLimitValue", timeLimitRef.value);
    currentTimeLimitRef.value = timeLimitRef.value + "min";
  }
};
const setTimeInterval = (intervalInSec) => {
    transmit("api/timeIntervall", intervalInSec);
};

//die Funktion ist für die Verarbeitung von der Benutzereingabe "Löschen"
const deleteHistory = () => {
  lastDeletetRef.value = sysDate + " " + sysTime;
  transmit("api/deleteHistory", "true");
};

//die Funktion ist für die Verarbeitung von der Benutzereingabe "Emailadresse"
const setEmailAdresse = () => {
  if (
    isEmail(setEmailAdresseRef, "bitte eine gültige Emailadresse eingeben!!")
  ) {
    transmit("api/mailAdressRecipient", emailadresseRef.value);
    emailadresseRef.value = setEmailAdresseRef.value;
  }
};

axios
  .get("http://localhost:3001/api/temphistory")
  .then((response) => {
    const transformedData = response.data.map((item) => {
      tempData.push({
        y: item.Messwert,
        x: DateFormatter.dateTime(item.InDtTm),
      });
    });
    filltable();
    myChart.update();
  })
  .catch((error) => {
    console.error(error);
  });
//die Funktion füllt die HTML Tabelle mit daten aus
const filltable = () => {
  for (let i = 0; i < 10; i++) {
    let newRow = tableRef.insertRow(tableRef.length);
    let cell1 = newRow.insertCell(0);
    let cell2 = newRow.insertCell(1);
    cell1.innerHTML = tempData[i].x;
    cell2.innerHTML = tempData[i].y;
  }
};

const insertIntoTable = (temp) => {
  if (tempData) {
    tableRef.deleteRow(1);
    let newRow = tableRef.insertRow(tableRef.length);
    let cell1 = newRow.insertCell(0);
    let cell2 = newRow.insertCell(1);
    cell1.innerHTML = DateFormatter.dateTime(new Date());
    cell2.innerHTML = temp;
  }
  return;
};

//Die funktion filtert die Daten nach dem festgelegtem Zeitraum
function filterData() {
  //ausführen erst wenn beide Dates eingestellt wurden
  try {
    refreshBtnRef.style.backgroundColor = "red";
    refreshBtnRef.style.visibility = "visible";
    //gespeicherte Daten in 2 Array teilen
    const xValues = tempData.map((item) => new Date(item.x));
    const yValues = tempData.map((item) => item.y);
    const startTime = new Date(startTimeRef.value);
    const endTime = new Date(endTimeRef.value);
    // alle Daten die zwischen Starttime und endtime liegen sollen in filteredDates gespeichert
    let filteredDates = xValues.filter(
      (date) => date >= startTime && date <= endTime
    );
    //let filteredIndex = filteredDates.map(filteredDate => xValues.findIndex(date => date.getTime() === filteredDate.getTime()));
    //Index von dem Punkt ab dem der gewünschte Zeitraum begint
    let firstItemIndex = xValues.indexOf(filteredDates[0]);
    //eine liste mit den Punkten erstellen
    let points = filteredDates.map((x, i) => {
      return { x: x, y: yValues[firstItemIndex + i] };
    });
    data.datasets[0].data = points;
    config.options.scales.x.time.unit = null;
    myChart.update();
    return;
  } catch (err) {
    console.log(err);
  }
}

//funktion um Chart zu aktuellisieren nach der Verwendung von einem Filter
function refreshChart() {
  //refreshBtnRef.style.backgroundColor = "green";
  refreshBtnRef.style.visibility = "hidden";
  startTimeRef.value = DateFormatter.getFormattedDate(tempData[0].x);
  endTimeRef.value = null;
  data.datasets[0].data = tempData;
  myChart.update();
}

refreshBtnRef.style.visibility = "hidden";
