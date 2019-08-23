var express = require("express");
var parseString = require('xml2js').parseString;
var request = require('request');
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : '3325',
  database : 'fintech'
});
connection.connect();



app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


var port = process.env.PORT || 5000;
app.use(express.static(__dirname + '/public'));

app.get('/main', function(req, res){
    res.send('HELLO EXPRESS');
})

app.get('/weather', function(req, res){
    request('http://www.president.go.kr/', function (error, response, body) {
        var originalXml = body;
        res.send(body);
    });
})

app.get('/user', function(req, res){
    var sql = 'SELECT * FROM fintech.user';
    connection.query(sql, function (error, results) {
      if (error) throw error;
        res.send('<html><h1>'+results[0].name+'</h1><h2>sub title</h2></html>');
    });
})

app.get('/html', function(req, res){
    res.send('<html><h1>title</h1><h2>sub title</h2></html>');
})

app.get('/ejsTest', function(req, res){
    res.render('main');
})

app.get("/sayHello", function (request, response) {
	var user_name = request.query.user_name;
	response.send("Hello " + user_name + "!");
});

app.get("/sayHello", function (request, response) {
	var user_name = request.query.user_name;
	response.send("Hello " + user_name + "!");
});

app.listen(port);
console.log("Listening on port ", port);
