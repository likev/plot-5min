"use strict";

const fs = require('fs');
const http = require('http');
const zlib = require('zlib');
const url = require('url');
const querystring = require('querystring');


let writeAlertJsonInfo = function(req, res){
	
	res.write('alertJson = '+ JSON.stringify(alertJson)+ ';' );
	res.write('alertApp.onready();');
	res.write('</script></body></html>');
	res.end();
}

let homepage = function(req, res){
	res.writeHead(200, {'Content-Type':'text/html'});

	res.end('hello');
}

let newItem = function(req, res, config){
	res.writeHead(200, {'Content-Type':'application/json'});
	
	config.response = res;
	
	//get6.getdata(config);
	
}

let getData = function(req, res, postItems){
	
	/*
	res.writeHead(200, {
		'Content-Type':'application/json',
		
		});
    
    //...
	let data = '{}';
	
	fs.readFile('./20180519105000-records.json', 'utf8',(err, content) => {
	  
	  if (!err) data = content;

	  //console.log(data);
	  res.end(data); //JSON.stringify(data)
	});
	*/
	
	const raw = fs.createReadStream('20180519105000-records.json');
    
	res.writeHead(200, {
		'Content-Encoding': 'gzip',
		'Content-Type':'application/json; charset=utf-8'
	});
    
	raw.pipe(zlib.createGzip()).pipe(res);
    
	
}

let startHttpServer = function(){
	http.createServer(function(req, res) {
		const host = req.headers.host;
		const hostname = url.parse('http://'+host).hostname;

		let pathname = url.parse(req.url).pathname;
		console.log({host,hostname,pathname});
        
        var postData = '';     
        var postItems = {};
        
        req.on('data', function(chunk){    
            postData += chunk;
        });
 
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Max-Age', '86400');
        
		if( pathname === '/' ){
			homepage(req, res);
		}else if( pathname.slice(0,5) === '/data' ){
			    
			
		  	req.on('end', function(){    
				postItems = querystring.parse(postData);
				console.log(postItems);
				getData(req, res, postItems);
			});	  
		  
		}
		
	}).listen(8090,()=>{
	   console.log('listen on port 8090...');
	 });
}

//--------test begin---------------------
/*
startHttpServer();
*/
//---------test end----------------------

exports.start = function(){
	startHttpServer();
}