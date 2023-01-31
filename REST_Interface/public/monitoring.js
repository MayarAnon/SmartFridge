import { WSClient, tempData, DateFormatter } from "/toolbox.js";

let startTimeRef = document.getElementById("startTime");
let endTimeRef = document.getElementById("endTime");
const refreshBtnRef = document.getElementById("refreshchart");

const tableRef = document.getElementById("myTable");

const tempInsideRef = document.getElementById("tempInside");

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
//Die funktion erstellt ein WS Client und  verarbeitet die eingehende Nachrichten
class WS extends WSClient {
  constructor() {
    super();
    this.renderMessage()
    super.renderMessages(this.ws)
  }
  renderMessage() {
    const client = this
    
    client.ws.onmessage = function (messageEvent) {
      const data = JSON.parse(messageEvent.data);
        if (data.topic== "LatestTemp") {
          const tempInside = JSON.parse(data.message).value;
          insertIntoTable(tempInside);
          tempData.push({
            x: DateFormatter.getFormattedDate(new Date()),
            y: tempInside,
          });
          myChart.update();
        }
      }
  }
}
const socket = new WS();
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

axios
  .get("http://localhost:3000/api/temphistory")
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

endTimeRef.addEventListener("change", filterData);
startTimeRef.addEventListener("change", filterData);
refreshBtnRef.addEventListener("click", refreshChart);
