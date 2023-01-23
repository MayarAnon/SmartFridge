let startTimeRef = document.getElementById('startTime');
let endTimeRef = document.getElementById('endTime');
var Data = [
    { x: new Date('2023-01-21T18:30:10'), y: 12 },
    { x: new Date('2023-01-21T19:30:00'), y: 12 },
    { x: new Date('2023-01-21T22:30:00'), y: 42 },
    { x: new Date('2023-01-22T01:00:00'), y: 2 },
    { x: new Date('2023-01-22T02:00:00'), y: 11 },
    { x: new Date('2023-01-23T03:00:00'), y: 44 },
    { x: new Date('2023-01-23T04:00:00'), y: -5 },
    { x: new Date('2023-01-25T22:30:01'), y: -5 },
    { x: new Date('2023-01-25T22:30:02'), y: 12 },
    { x: new Date('2023-01-25T22:30:03'), y: 12 },
    { x: new Date('2023-01-25T22:30:04'), y: 42 },
    { x: new Date('2023-01-27T01:00:00'), y: 2 },
    { x: new Date('2023-01-27T02:00:00'), y: 11 },
    { x: new Date('2023-01-27T03:00:00'), y: 44 },
    { x: new Date('2023-01-28T04:00:00'), y: -5 },
    { x: new Date('2023-01-29T03:00:00'), y: 44 },
    { x: new Date('2023-01-29T04:00:00'), y: -5 },
    { x: new Date('2023-01-29T18:30:00'), y: 12 },
    { x: new Date('2023-01-29T19:30:00'), y: 12 },
    { x: new Date('2023-01-29T22:30:00'), y: 42 },
    { x: new Date('2023-01-30T01:00:00'), y: 2 },
    { x: new Date('2023-01-30T02:00:00'), y: 11 },
    { x: new Date('2023-01-30T03:00:00'), y: 44 },
    { x: new Date('2023-01-30T04:00:00'), y: -5 },
    { x: new Date('2023-01-31T03:00:00'), y: 44 },
    { x: new Date('2023-01-31T04:00:00'), y: -5 }
]

//setup Block
const data = {
    datasets: [{
        label: 'Kühlschrankstemperatur',
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: false,
        data: Data
    }]
};

// config Block
const config = {
    type: 'line',
    data,
    options: {
        responsive: true,
        scales: {
            x: {
                type: 'time',
                time: {
                    //unit:'hour',
                    displayFormats: {
                        hour: 'dd.MM \n hh:mm',
                        minute: 'dd.MM \n hh:mm',
                        second: 'dd.MM \n hh:mm:ss'
                    }
                },
                ticks: {
                    stepSize: 1,
                    autoSkip: true,
                    maxTicksLimit: 3,
                    maxTicksLimit: 24,
                },
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: "Erfassungszeit"
                }
            },
            y: {
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: "Temperatur"
                },
                ticks: {
                    // Include a dollar sign in the ticks
                    callback: function (value, index, ticks) {
                        return value + '°C';
                    }
                }
            }
        }
    }

}

//init // render Block
const myChart = new Chart(
    document.getElementById('myChart'),
    config
);

//die Funktion ändert die skallierung der Zeitachse wenn der Benutzer day/hour/minute/second wählt
function changeUnit(period) {
    try {
        //stepSize muss geändert werden, wenn starttime and endtime zu weit von einander sind, dass die Daten nicht dargestellt werden mit einem Stepsize von 1
        if (period == 'second' && new Date(endTimeRef.value).getTime() - new Date(startTimeRef.value).getTime() < 60000) {
            config.options.scales.x.ticks.stepSize = 60;
        } else {
            config.options.scales.x.ticks.stepSize = 1;
        }
        // myChart.update();
        config.options.scales.x.time.unit = period;
        myChart.update();
    }
    catch (error) {
        alert("Die gewählte Zeiteinheit ist nicht geeignet für den gewählten Zeitraum",error)
    }
}

// const ws = new WebSocket('ws://localhost:3001');
// ws.addEventListener("open", () =>{
//     console.log("We are connected!!");
//     ws.send("Chart connected!!");
// });
// const maxRef = document.getElementById('maximum');
// const minRef = document.getElementById('minimum');
// const avgRef = document.getElementById('avg');

// ws.onmessage = function (messageEvent) {
//     const data = JSON.parse(messageEvent.data);
//     console.log(`Neue Nachricht empfangen`, data.message,data.topic);
//     if (data.topic ==='LatestTemp'){
//         const tempInside= JSON.parse(data.message).value;
//         Data.push({x: Date.now(),y:tempInside})
//         myChart.update();
//     }
//     if (data.topic ==='Metrics'){
//         const str= JSON.parse(data.message);
//         maxRef.value=Object.values(str)[0];
//         minRef.value=Object.values(str)[1];
//         avgRef.value=Object.values(str)[2];
//     }
// }
//die folgende funktion wandelt ein javascipt date in einem String mit folgendem pattern:'YYYY-MM-DDThh:mm:ss'

function setValue(date) {
    var isoString = date.toISOString()
    return isoString.substring(0, (isoString.indexOf("T") | 0) + 9 | 0);
}

startTimeRef.value = setValue(Data[0].x);
endTimeRef.value = setValue(Data.pop().x);

//Die funktion filtert die Daten nach dem festgelegtem Zeitraum
function filterData() {
    //ausführen erst wenn beide Dates eingestellt wurden
    try {
        //gespeicherte Daten in 2 Array teilen 
        const xValues = Data.map(item => item.x);
        const yValues = Data.map(item => item.y);

        const startTime = new Date(startTimeRef.value)
        const endTime = new Date(endTimeRef.value)
        // alle Daten die zwischen Starttime und endtime liegen sollen in filteredDates gespeichert
        let filteredDates = xValues.filter(date => date >= startTime && date <= endTime);
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
    }
    catch (err) {
        console.log(err);
    }
}


