const express = require('express');

const app = express();

const soap = require('soap');
const url = 'http://localhost:8080/?wsdl';

var http = require('http').Server(app);
var io = require('socket.io')(http);


var listVoitures;
var idVoiture;
var stuffVoiture;


app.use(express.static(__dirname + '/public'));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

  
app.use('/api-soap', (req, res) => {
  soap.createClient(url, function(err, client) {
    if (err) console.error(err);
    else {
      client.list_voitures( function(err, response) {
        if (err) console.error(err);
        else {
          listVoitures = response;
          console.log(listVoitures);
        }
      });
    }
  });
  console.log('test');

  /*soap.createClientAsync(url).then((client) => {
    return client.list_voitures();
  }).then((result) => {
    console.log(result);
  });

  var client = await soap.createClientAsync(url);
  var result = await client.MyFunctionAsync(args);
  console.log(await result);*/

})

app.get('/', function(req, res){
    res.sendfile(__dirname + "/index.html");
  });


module.exports = app;