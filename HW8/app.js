'use strict';

var express = require('express');
var app = express();
var request = require('request');
var parseString = require('xml2js').parseString;
var url = require("url");
var http = require('http');


app.get('/', function(req, res) {
    var params = url.parse(req.url,true).query;
    var type = params.type;
    var symbol = params.symbol;
    res.header("Access-Control-Allow-Origin", "http://www-scf.usc.edu");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var urlTemp="";
    var api_key = "N1O8UV6W4I5PKWNS";
    if(type == "Price"){
        urlTemp ="https://www.alphavantage.co/query?symbol="+symbol+"&outputsize=full&apikey="+api_key;
        urlTemp += "&function=TIME_SERIES_DAILY";
    } else if(type == "STOCH"){
        urlTemp ="https://www.alphavantage.co/query?function=STOCH&symbol="+symbol+"&series_type=close&apikey="+api_key;
        urlTemp += "&interval=daily&slowkmatype=1&slowdmatype=1&time_period=10";
    }else if(type == "BBANDS"){
        urlTemp = "https://www.alphavantage.co/query?function=BBANDS&symbol="+symbol+"&series_type=close&apikey="+api_key;
        urlTemp += "&interval=daily&time_period=5&nbdevup=3&nbdevdn=3&time_period=5";
    }else {
        urlTemp = "https://www.alphavantage.co/query?function="+type+"&symbol="+symbol+"&series_type=close&apikey="+api_key;
        urlTemp += "&interval=daily&time_period=10";    
    }

    request(urlTemp, function(error, response, body) {
        if(response.statusCode==404 || response.statusCode==503){
            res.send("Error");
        } else{
        res.send(body);
    }
    });
    
});

app.get('/lookup/:symbol', function (req, res) {
	res.header("Access-Control-Allow-Origin", "http://www-scf.usc.edu");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var queryText = "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input=";
    var urlTemp = queryText + req.params.symbol;
    http.get(urlTemp, (resp) =>{
		let data = '';
		resp.on('data', (chunk) => {
			data += chunk;
		});

		resp.on('end',() => {
			var parsed = JSON.parse(data);			
			res.send(parsed);
		})
	})
});

app.get('/news/:symbol', function(req, res){
    res.header("Access-Control-Allow-Origin", "http://www-scf.usc.edu");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var symbol = req.params.symbol;
    var news_url = "https://seekingalpha.com/api/sa/combined/";
    news_url += symbol;
    request(news_url, function(error, response, body) {
        if(response.statusCode==404 || response.statusCode==503){
            res.send("Error");
        } else {
        parseString(body, function (err, result) {
            res.send(result);
        });
    }
    });
});


app.get('/highstockip/:symbol', function(req, res){
    res.header("Access-Control-Allow-Origin", "http://www-scf.usc.edu");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var symbol = req.params.symbol;
    var historicalDataURL = "http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters=%7b%22Normalized%22:false,%22NumberOfDays%22:1095,%22DataPeriod%22:%22Day%22,%22Elements%22:%5b%7b%22Symbol%22:%22"+symbol+"%22,%22Type%22:%22price%22,%22Params%22:%5b%22ohlc%22%5d%7d%5d%7d";
    request(historicalDataURL, function(error, response, body) {
         if(response.statusCode==404 || response.statusCode==503){
            res.send("Error");
        } else {
            res.send(body);
        }
    });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, function() {
  console.log('http://localhost:8081/');
});