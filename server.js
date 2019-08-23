const express = require('express')
const app = express()
var path = require('path'); 
var mysql      = require('mysql');
var request = require('request');
var jwt = require('jsonwebtoken');

//--------------------------------------------------
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '3325',
  database : 'fintech'
});
 
connection.connect();
 
connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});

connection.query("SELECT * FROM user", function(err, results, field){
    console.log(results);
})
 
//connection.end();
//------------------------------------------------

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended : false}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.render('main')
})

app.get('/signup', function(req, res){
    res.render('signup');
})

app.post('/login', function(req, res){
    var userEmail = req.body.userEmail;
    var userPassword = req.body.password;
    var sql = "SELECT * FROM user WHERE email = ?";
    connection.query(sql, [userEmail, userPassword], function(err, results){
        if(err){
            throw err;
        }
        else {
            if(results.length > 0){
                var tokenKey = "asdfgqwertasdf"
                if(results[0].password == userPassword){
                    jwt.sign(
                        {
                            userName : results[0].name,
                            userId : results[0].id
                        },
                        tokenKey,
                        {
                            expiresIn : '1d',
                            issuer : 'fintech.admin',
                            subject : 'user.login.info'
                        },
                        function(err, token){
                            console.log('로그인 성공', token)
                            res.json(token)
                        }
                    )
                }
            }
        }
    })

})

app.get('/authResult', function(req, res){
    var auth_code = req.query.code
    var getTokenUrl = "https://testapi.open-platform.or.kr/oauth/2.0/token";
    var option = {
        method : "POST",
        url :getTokenUrl,
        headers : {
        },
        form : {
            code : auth_code,
            client_id : "l7xx822f78d0e6a34ee5b676eedd95732070",
            client_secret : "a77ad133e09a4ae9ab497b9d404782f3",
            redirect_uri : "http://localhost:3000/callback",
            grant_type : "authorization_code"
        }
    };
    request(option, function(err, response, body){
        if(err) throw err;
        else {
            console.log(body);
            var accessRequestResult = JSON.parse(body);
            console.log(accessRequestResult);
            res.render('resultChild', {data : accessRequestResult})
        }
    })
})

app.post('/signup', function(req, res){
    var name = req.body.nameinput;
    var email = req.body.emailinput;
    var password =req.body.passwordinput;
    var accessToken = req.body.accessToken;
    var refreshToken = req.body.refreshToken;
    var userseqnum = req.body.userseqnum;

    console.log(accessToken, refreshToken, userseqnum);
    
    var sql = "INSERT INTO `fintech`.`user`(`name`, `email`, `password`,`accessToken`,`refreshToken`,`userseqnum`) "
    + "VALUES (?,?,?,?,?,?)"    
    connection.query(sql, [name, email, password, accessToken, refreshToken, userseqnum], function(err, result){
        console.log(this.sql);
        if(err){
            console.error(err);
            throw err;
        }
        else {
            res.json(1);
        }
    })
})



app.get('/sayHello', function(req, res){
    res.send("say Hello");
})

app.get('/sayHello2', function(req, res){
    res.send("say Hello2");
})

app.listen(3000)