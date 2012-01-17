var config = {
	api:[{
		objectHome:"/home/andy/webserver/api/",
		dir:"/api",
		callTemplate:"/?object/?method/?id",
		methodTemplate:"?object.?method(?id,args)",
		defaultMethod:"list"
	}]
};
exports.config = config;