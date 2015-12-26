var JSX = 
{
	// Invokes a method inside of the host environment.
	// Returns true/false if the method was actually invoked.
	invoke : function (funcName, args, cb)
	{
		var call = [funcName, '('];

		for(var i=0; i < (args || []).length; i++)
		{
			if (i > 0)
				call.push(', ');

			call.push(JSON.stringify(args[i]) || 'undefined');
		}

		call.push(')');
		call = call.join('');

		if (!('evalScript' in csInterface))
		{
			console.log('csInterface unavailable. ' + call);

			cb = cb || function(res) { console.log('invoking callback via setTimeout'); }
			setTimeout(cb, 0);

			return false;
		}

		csInterface.evalScript(call, function(res)
		{
			console.log(funcName + ' returned with result ' + res); 

			var data = res; // res != undefined ? JSON.parse(res) : undefined;

			if (!cb) 
				return;

			cb(data);
		});

		return true;
	},

	eval : function (contents, cb) {
		if ('evalScript' in csInterface)
			csInterface.evalScript(contents, cb); 
	},

	// Loads a JSX file into the host application.
	loadJsx : function (filename, cb) 
	{
		var currFile = window.location.href;
		var workingDir = currFile.substr(0, currFile.lastIndexOf('/') + 1);
		var path = decodeURI(workingDir + filename).substr('file://'.length);

		JSX.eval("$.evalFile(" + JSON.stringify(path) + ")", cb);
	},

	// Reads the contents of a package file and returns its contents.
	// TODO: move this function to a more natural location.
	readFile : function (filename, cb)
	{
		var currFile = window.location.href;
		var workingDir = currFile.substr(0, currFile.lastIndexOf('/') + 1);
		var path = decodeURI(workingDir + filename).substring("file://".length);

		var res = window.cep.fs.readFile(path);

		if (res.err == 0)
			return res.data;

		throw new Error("Unable to read file " + path);
	},
};

