const express = require('express')
const http = require("http");
const webSocket = require('../WS-Interface/WS')

class webServer
{
    constructor()
    {
        if(!webServer.instance){
            webServer.instance = this;
        }
        this.app = this.#setupServer()
        this.#setupRouters()

        
        return webServer.instance
    }

    #setupServer()
    {
        try
        {
            // Applikation erstellen 

            const app = express();

            //festlegen auf welchem Port die Applikation funktionieren soll 

            app.listen(3000)

            //Server erstellen

            const webServer = http.createServer(app); 
        
            //WebSocket starten 

            const socket = webSocket(webServer);
            return app
        }catch(error)
        {
            console.log(error + "fehler bei Server Setup")
        }
    
        
    }

    #setupRouters()
    {
        try{
            const viewsRouter = new (require('./router/views'))()
            const restAPI = new (require('./router/restAPI'))()

            this.app.use('/',viewsRouter)
            this.app.use('/api',restAPI)
            this.app.use(express.static('public'))
        }catch(error)
        {
            console.log(error + "Fehler bei Router setup")
        }
        
    }
}

const instance = new webServer()