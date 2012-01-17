var sys = require("sys"),
	http = require("http"),
	url = require("url"),
	path = require("path"),
	fs = require("fs"),
	mime = require('mime'),
	rest = require('./RESTful');

var config = {
	defaultDirectory:'/home/andy/webserver'
};

var serverInstance = http.createServer(function (request, response) {

	request.setEncoding("utf8");
	//handle post data
	var postData;

	request.addListener('data',function(postDataChunk){
		postData = postDataChunk;
	})


	//set up api subdirs to do special things
	if ( rest.isRESTcall(request.url) ){
		try{
			rest.parseCall(response, request.url, postData);
		}
		catch(e){
			//change to be a raw data response
			console.log(e);
		}
	}
	// otherwise we will be serving up a webpage
	else{
		serveFile(request.url,response);
	}

}).listen(1337, "127.0.0.1");
console.log('Server running at http://127.0.0.1:1337/');

function writeHeaderType(response,type){
	if (typeof(type) == 'undefined'){
		type = 'txt';
	}
			response.writeHead(200, {'Content-Type': mime.lookup(type)});
}

function serveFile(fileURL,response){
	var uri = url.parse(fileURL).pathname;
		var filename = path.join(config.defaultDirectory, uri);
		path.exists(filename, function(exists) {
			if(!exists) {
				serveFile('error.htm',response);
				/*response.writeHead(404, {"Content-Type": "text/plain"});
				response.write("404 Not Found\n" + filename);
				response.end();*/
				return;
			}

			fs.readFile(filename, "binary", function(err, file) {
				if(err) {
					response.writeHead(500, {"Content-Type": "text/plain"});
					response.write(err + "\n");
					response.end();
					return;
				}

				response.writeHead(200);
				response.write(file, "binary");
				response.end();
			});
		});
}
//test api object




