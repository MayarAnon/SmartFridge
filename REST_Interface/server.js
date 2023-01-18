// Bibliotheken einbinden

const express = require('express') 

// Applikation erstellen 

const app = express();

//festlegen auf welchem Port die Applikation funktionieren soll 

app.listen(3000) 

//Unterteilung und Einbindung in Routes für erhöhte übersichtlichkeit (Routes == Miniapplikationen für Übersichtlichkeit)

const homeRouter = require('./routes/home');
const cameraRouter = require('./routes/camera');
const monitoringRouter = require('./routes/monitoring');
const settingsRouter = require('./routes/settings');
const RestAPI = require('./routes/restAPI');

app.use('/home',homeRouter );
app.use('/camera',cameraRouter);
app.use('/monitoring',monitoringRouter);
app.use('/settings', settingsRouter);
app.use('/api',RestAPI);