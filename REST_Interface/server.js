const express = require('express')

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
        // Applikation erstellen 

        const app = express();

        //festlegen auf welchem Port die Applikation funktionieren soll 

        app.listen(3000)
        return app
    }

    #setupRouters()
    {
        const viewsRouter = new (require('./router/views'))()
        const restAPI = new (require('./router/restAPI'))()

        this.app.use('/',viewsRouter)
        this.app.use('/api',restAPI)
        
    }
}

const instance = new webServer()