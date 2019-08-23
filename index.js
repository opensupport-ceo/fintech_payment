const express = require('express')
const app = express()
var request = require('request');
var mysql = require('mysql');
var cors = require('cors');
var jwt = require('jsonwebtoken');
var auth = require('./lib/auth');
var tokenKey = 'f$i1nt#ec1hT@oke1n!Key'
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '3325',
  database : 'fintech'
});

connection.connect();
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.get('/', function (req, res) {
    res.render('index')
})



app.get('/login', function(req, res){
    res.render('login');
})

app.get('/qr', function(req, res){
    res.render('qr');
})

app.get('/withdraw', function(req, res){
    res.render('withdraw');
})

app.get('/join', function (req, res) {
    res.render('join');
})

app.post('/withdrawQR', auth, function (req, res) {
    var userId = req.decoded.userId;
    var finNum = req.body.qrFin;
    var sql = "SELECT userseqnum, accessToken FROM user WHERE user_id = ?";
    connection.query(sql,[userId], function(err, result){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            console.log(result[0].accessToken);
            var option = {
                method : "POST",
                url :'https://testapi.open-platform.or.kr/transfer/withdraw',
                headers : {
                    'Authorization' : 'Bearer ' + result[0].accessToken,
                    'Content-Type' : 'application/json; charset=UTF-8'
                },
                json : {
                    dps_print_content : '널앤서',
                    fintech_use_num : finNum,
                    tran_amt : 11000,
                    print_content : '널앤서',
                    tran_dtime : '20190523101921'
                }
            };
            request(option, function(err, response, body){
                if(err) throw err;
                else {
                    if(body.rsp_code == "A0000"){
                        res.json(1);
                    }
                    else {
                        res.json(2);
                    }
                }
            })
        }
    })
})

app.post('/withdraw', auth, function (req, res) {
    var userId = req.decoded.userId;
    var finNum = '';
    var sql = "SELECT userseqnum, accessToken FROM user WHERE user_id = ?";
    connection.query(sql,[userId], function(err, result){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            console.log(result[0].accessToken);
            var option = {
                method : "POST",
                url :'https://testapi.open-platform.or.kr/transfer/withdraw',
                headers : {
                    'Authorization' : 'Bearer ' + result[0].accessToken,
                    'Content-Type' : 'application/json; charset=UTF-8'
                },
                json : {
                    dps_print_content : '널앤서',
                    fintech_use_num : '199003328057724253012100',
                    tran_amt : 11000,
                    print_content : '널앤서',
                    tran_dtime : '20190523101921'
                }
            };
            request(option, function(err, response, body){
                if(err) throw err;
                else {
                    var requestResult = body
                    if(requestResult.rsp_code == "A0000"){
                        var sql = "UPDATE user set point = point + ? WHERE user_id = ?"
                        connection.query(sql, [Number(requestResult.tran_amt), userId], function(err, result){
                            if(err){
                                console.error(err);
                                throw err;
                            }
                            else {
                                res.json(1);
                            }
                        })
                    }
                }
            })
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
            redirect_uri : "http://localhost:3000/authResult",
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

app.post('/join', function(req, res){
    console.log(req);
    var name = req.body.name;
    var birthday = new Date();
    var email = req.body.email;
    var password = req.body.password;
    var phone = "0109922";
    var accessToken = req.body.accessToken;
    var refreshToken = req.body.refreshToken;
    var useNum = req.body.useseqnum;

    console.log(name, email, password);
    var sql = 'INSERT INTO `fintech`.`user` (`name`, `birthday`, `user_id`, `user_password`, `phone`, accessToken, refreshToken, userseqnum) VALUES (?,?,?,?,?,?,?,?);'
    connection.query(sql,[name, birthday, email, password, phone, accessToken, refreshToken, useNum], function (error, results) {
      if (error) throw error;  
      else {
          console.log(this.sql);
          res.json(1);
      }
    });
})

app.post('/login', function (req, res) {
    var userEmail = req.body.email;
    var userPassword = req.body.password;
    console.log(userEmail, userPassword);

    var sql = "SELECT * FROM user WHERE user_id = ?";
    connection.query(sql, [userEmail], function (error, results) {
      if (error) throw error;  
      else {
        console.log(results);
        console.log(userPassword, results[0].user_password);
        if(userPassword == results[0].user_password){
            jwt.sign(
                {
                    userName : results[0].name,
                    userId : results[0].user_id
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
        else {
            res.json('등록정보가 없습니다');
        }
      }
    });
})

app.get('/balance', function(req, res){
    res.render('balance');
})

app.post('/transaction_list', auth, function(req,res){
    var userId = req.decoded.userId;
    var finNum = req.body.finNum;
    var sql = "SELECT userseqnum, accessToken FROM user WHERE user_id = ?";
    connection.query(sql,[userId], function(err, result){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            console.log(result[0].accessToken);
            var option = {
                method : "GET",
                url :'https://testapi.open-platform.or.kr/v1.0/account/transaction_list?'+
                'fintech_use_num='+finNum+'&'+
                'inquiry_type=A&'+
                'from_date=20160101&'+
                'to_date=20160101&'+
                'sort_order=D&'+
                'page_index=1&'+
                'tran_dtime=20160101121212&',
                headers : {
                    'Authorization' : 'Bearer ' + result[0].accessToken
                }
            };
            request(option, function(err, response, body){
                if(err) throw err;
                else {
                    console.log(body);
                    res.json(JSON.parse(body));
                }
            })
        }
    })
})


app.post('/balance', auth, function(req,res){
    var userId = req.decoded.userId;
    var finNum = req.body.finNum;
    var sql = "SELECT userseqnum, accessToken FROM user WHERE user_id = ?";
    connection.query(sql,[userId], function(err, result){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            console.log(result[0].accessToken);
            var option = {
                method : "GET",
                url :'https://testapi.open-platform.or.kr/v1.0/account/balance?fintech_use_num='+finNum+'&tran_dtime=20190523101921',
                headers : {
                    'Authorization' : 'Bearer ' + result[0].accessToken
                }
            };
            request(option, function(err, response, body){
                if(err) throw err;
                else {
                    console.log(body);
                    res.json(JSON.parse(body));
                }
            })
        }
    })
})

app.get('/main', function(req, res){
    res.render('main');
})

app.post('/getUser', auth, function(req, res){
    var userId = req.decoded.userId;
    var sql = "SELECT userseqnum, accessToken FROM user WHERE user_id = ?";
    connection.query(sql,[userId], function(err, result){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            var option = {
                method : "GET",
                url :'https://testapi.open-platform.or.kr/user/me?user_seq_no='+ result[0].userseqnum,
                headers : {
                    'Authorization' : 'Bearer ' + result[0].accessToken
                }
            };
            request(option, function(err, response, body){
                if(err) throw err;
                else {
                    res.json(JSON.parse(body));
                }
            })
        }
    })
})

app.get('/tokenTest', auth ,function(req, res){
    console.log(req.decoded);
})

app.get('/ajaxTest',function(req, res){
    console.log('ajax call');
    var result = "hello";
    res.json(result);
})

app.listen(3000)
