const express = require('express');

const app = express();

const soap = require('soap');
const url = 'https://apisoap805.herokuapp.com/?wsdl';

var http = require('http').Server(app);


app.use(express.static(__dirname + '/public'));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });


app.get('/', function(req, res){
  res.sendfile(__dirname + "/index.html");
});

  
app.use('/api-soap', (req, res) => {
  soap.createClient(url, function(err, client) {
    if (err) console.error(err);
    else {
      client.list_voitures( function(err, response) {
        if (err) console.error(err);
        else {
          res.send(response);
        }
      });
    }
  });
})



module.exports = app;