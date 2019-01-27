var express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    faq = require(__dirname + '/routes/faq-page'),
    csa = require(__dirname + '/routes/csa-page'),
    mongoose = require('mongoose');
// Load the Platform.sh configuration
var config= require("platformsh").config();

var app = express(),
	port = config != undefined ? config.port : 3000;

app.configure(function() {
	// App setup
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(logger('dev'));
	app.use(express.static(__dirname + '/static'));
	// DB setup
	mongoose.connect('mongodb://localhost:27017/questionAndAnswerDB', {
  		useMongoClient: true
	});
});

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//TODO: To open sessions

// Web App
app.get('/', function(req, res){
	res.send('It looks like you are trying to access CSA over HTTP on the port ' + port);
});
app.get('/csa/:agentName/agendamento', csa.agendamento);
app.get('/csa/:agentName/servico', csa.servico);

// API
app.post('/answers', faq.find);
app.get('/faq', faq.getAll);
app.get('/faq/:id', faq.getOne);
app.put('/faq', faq.updateAll);
app.put('/faq/:id', faq.updateOne);
app.post('/faq', faq.addNew);
app.delete('/faq/:id', faq.deleteOne);

//TODO: To create the Language Recognition & Language Interpreter Unit

app.listen(port);

// Console will print the message
console.log('Server running at http://localhost:' + port + '/');
