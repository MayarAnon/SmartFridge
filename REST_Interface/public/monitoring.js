import { WSClient, tempData, DateFormatter } from "/toolbox.js";

let startTimeRef = document.getElementById("startTime");
let endTimeRef = document.getElementById("endTime");
const refreshBtnRef = document.getElementById("refreshchart");

const tableRef = document.getElementById("myTable");

//setup Block for chart
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

// config Block for chart
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
            millisecond: "dd.MM \n hh:mm:ss",
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
            return value.toFixed(2) + "°C";
          },
        },
      },
    },
  },
};

//init // render Block for chart
const myChart = new Chart(
  document.getElementById("myChart").getContext("2d"),
  config
);

//die funktion schreibt in der letzten Zeile der Tabelle und löscht die erste zeile der Tabelle wenn 10 zeilen schon in der Tabelle sind
//als Parameter wird der Temperaturwert übergeben
const insertIntoTable = (temp) => {
  let numberOftableRows = 10;
  if (tableRef.getElementsByTagName("tr").length > numberOftableRows) {
    tableRef.deleteRow(1);
  }
  let newRow = tableRef.insertRow(tableRef.length);
  let cell1 = newRow.insertCell(0);
  let cell2 = newRow.insertCell(1);
  cell1.innerHTML = DateFormatter.dateTime(new Date());
  cell2.innerHTML = temp + " °C";
  return;
};
//Die Klasse stellt ein WS Client und  verarbeitet die eingehende Nachrichten die für die Monitoring Seite relevant sind
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
            insertIntoTable(tempInside);
            myChart.update();
            break;
          }
          case "tempOutside": {
            const tempOutside = JSON.parse(data.message).value;
            client.tempOutsideRef.innerHTML = tempOutside + " °C";
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

//Die funktion stellt das erste Datetime-local-Element auf dem ersten Punkt aus tempData

const settimeoption = (() => {
  function runThis() {
    if (tempData[0]) {
      startTimeRef.value = DateFormatter.getFormattedDate(tempData[0].x);
      return;
    } else {
      setTimeout(() => {
        runThis();
      }, 2000);
    }
  }
  runThis();
})();
//mit der Funktion werden die Daten die der Webserver bereitstellt geholt und in tempData gespeichert
//mit Daten wird die Tabelle und das Diagramm ausgefüllt
const getTempHistory = () => {
  axios
    .get("http://" + window.location.hostname + ":3000" + "/api/temphistory")
    .then((response) => {
      const transformedData = response.data.map((item) => {
        tempData.push({
          y: item.Messwert,
          x: DateFormatter.getFormattedDate(item.InDtTm),
        });
      });
      filltable();
    })
    .catch((error) => {
      console.error(error);
    });
};
getTempHistory();

//die Funktion füllt die HTML Tabelle mit daten aus
const filltable = () => {
  let numberOftableRows = 10;
  try {
    if (tempData.length < numberOftableRows) {
      numberOftableRows = tempData.length;
    } else {
    }
    for (let i = 0; i < numberOftableRows; i++) {
      let newRow = tableRef.insertRow(tableRef.length);
      let cell1 = newRow.insertCell(0);
      let cell2 = newRow.insertCell(1);
      cell1.innerHTML = DateFormatter.dateTime(
        tempData.slice(Math.max(tempData.length - numberOftableRows, 0))[i].x
      );
      cell2.innerHTML =
        tempData.slice(Math.max(tempData.length - numberOftableRows, 0))[i].y +
        " °C";
    }
    myChart.update();
  } catch (err) {
    console.log(err);
  }
};

//Die funktion filtert die Daten nach einem vom Benutzer über startTimeRef und endTimeRef festgelegtem Zeitraum
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

endTimeRef.addEventListener("change", filterData);
startTimeRef.addEventListener("change", filterData);
refreshBtnRef.addEventListener("click", refreshChart);
