const fs = require('fs');
require('dotenv').config();

    



// class AlertLog{
//     constructor(){
//     }
//     formatter(content) {
//         //let alert = { 
//         //    Time: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), //https://stackoverflow.com/a/13219636
//         //    Type: content
//         //};
//         //let data = JSON.stringify(alert, null, 2);            //JSON Format hat keinen Mehrwert
//         const timestamp = new Date().toISOString().replace(/T/, '     ').replace(/\..+/, '');
//         return `${timestamp}      ${content}\n`;
//     }
//     deleteLog(client){
//         client.on('message', async function(topic,message){
//             if(topic == "deleteHistory" && message=="true"){
//                 //flags:'a' für append; flags:'w' für write
//                 //fs.WriteStream öffnet einen Filehandler und wird am ende geschlossen
//                 //fs.appendFile öffnet jedes mal einen neuen Filehandler->  EMFILE error
//                 //man kann den Stream mit stream.end() beenden, hier nicht nötig weil,
//                 //default option ist AutoClose:true
//                 var stream = fs.createWriteStream(process.env.LOG_PATH, {flags:'w'});           
//                 stream.write("",  function(err) {
//                     if (err) {
//                         console.error(err);
//                     }
//                 });
//             }
//         })
//     }
//     writeLog(content){
        
//         var stream = fs.createWriteStream(process.env.LOG_PATH, {flags:'a'});           
//         stream.write(this.formatter(content),  function(err) {
//             if (err) {
//                 console.error(err);
//             }
//         });
//     }
// }

// module.exports = AlertLog;


class AlertLog {
  constructor() {}

  formatter(content) {
    const timestamp = new Date().toISOString().replace(/T/, '     ').replace(/\..+/, '');
    return `${timestamp}      ${content}\n`;
  }

  deleteLog(client) {
    client.on('message', (topic, message) => {
      if (topic === 'deleteHistory' && message.toString() === 'true') {
        fs.writeFile(process.env.LOG_PATH, '', (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
    });
  }


  writeLog(content) {
    fs.appendFile(process.env.LOG_PATH, this.formatter(content), (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
}

module.exports = AlertLog;
