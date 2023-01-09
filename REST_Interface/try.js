const express = require('express')
const app = express();

app.get('/home',(req,res)=>{
    res.send('Hello')
})
//look at the body of the post request
app.use(express.urlencoded({extended: false}))

app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/views/index.html')
  });

app.get('/settings',(req,res)=>{
    
    res.sendFile(__dirname + '/views/settings.html') //__dirname ist der Pfad des Projektes
});
  
  app.post('/result',(req,res)=>{
    if(req.body.color === "blue"){
        res.send("True");
    }else{
        res.send("False");
    }

    
  });
  
  app.listen(4000);
  