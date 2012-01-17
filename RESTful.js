var mime = require('mime');

//the config object for the RESTful module
var RESTconfig = require('./RESTconfig');

var config = RESTconfig.config;

//return boolean if the url contain an api dir
exports.isRESTcall = function(url){
	for (i in config.api){
		if (url.search(config.api[i].dir) != -1 ){
			return true;
		}
	}
	return false;
}

exports.parseCall = function(response, url, postData){

	var dir = '';
	var callTemplate = '';
	var methodTemplate = '';
	var defaultMethod = '';
	var objectHome = '';
	//determine which api dir is the one to use
	for (i in config.api){
		if (url.search(config.api[i].dir) != -1 ){
			dir = config.api[i].dir;
			callTemplate = config.api[i].callTemplate;
			methodTemplate = config.api[i].methodTemplate;
			defaultMethod = config.api[i].defaultMethod;
			objectHome = config.api[i].objectHome;
		}
	}

	//split up the url
	var callPath = url.split('/');
	//get the file type so we know what to return
	var filetype = callPath[callPath.length-1].split('.')[1];
	//remove the file type from the call so we can call the function
	var uri = url.slice(0,url.length - filetype.length - 1);

	//the object we will create out of the template and uri
	var object = {}

	var fn = '';
	
	//remove the everything before the api path
	var callPath = uri.split(dir)[1];
	callPath = callPath.split('/');
	callPath.shift();

	//remove the first (empty) item from the call array
	var callOrder = callTemplate.split('/?');
	callOrder.shift();

	for(index in callOrder){
		object[callOrder[index]] = callPath[index];
	}
	
	writeHeaderType(response,filetype);
	if (typeof(object.method) == 'undefined'){
		object.method = defaultMethod;
	}
	
	//build the function
	fn = 'call.' + object.object + '.' + object.method + '(';
	typeof(object.id) != 'undefined' ? fn += object.id: fn += '';
	
	//send any post data through if there is any
	if (typeof(postData) != 'undefined' && typeof(object.id) != 'undefined' ) {
		fn += ',' + postData;
	}
	else if (typeof(postData) != 'undefined' && typeof(object.id) == 'undefined' ){
		fn += postData;
	}

	fn += ')';
	var call = require(objectHome + object.object + '.js');
	obj = eval( fn );
	response.write( serializeObject(filetype,obj) );
	response.end();
}

function writeHeaderType(response,type){
	if (typeof(type) == 'undefined'){
		type = 'txt';
	}
			response.writeHead(200, {'Content-Type': mime.lookup(type)});
}

function serializeObject(type,object){
	switch(type.toLowerCase()){
		case 'url':
			break;
		case 'xml':
			break;
		case 'json':
		default:
			return JSON.stringify(object);
	
	}
}