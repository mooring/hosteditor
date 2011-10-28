importPackage(Packages.java.io);

function parseParam(args){
	var oParam = {}, r = /^-(\w+)=(.*)$/;
	for (var m, i = 0, l = args.length; i < l; i++) {
		if (m = r.exec(args[i])) {
			oParam[m[1]] = m[2];
		}
	}
	return oParam;
}

function forEach(array, fun){
	for (var i = 0, len = array.length; i < len; i++) {
		if (false === fun.call(array, array[i], i, array)) { return array; }
	}
	return array;
}

function writeFile(path, content, encoding){
	var io = Packages.java.io, f = new io.PrintWriter(new io.OutputStreamWriter(new io.FileOutputStream(new io.File(path), false), encoding));
	f.write(content);
	f.flush();
	f.close();
}

function main(args){
	var params = parseParam(args);
	try {
		load(params.c);
	} catch (ex) {
		return;
	}
	var encoding = Config.encoding || 'utf-8', oRes = {};
	
	var html = readFile(Config.base, encoding).replace(/>\s*</g, '><').replace(/\{([\d\w\.]+)\}/g, function(_, key){
		return Config[key];
	});
	
	print('readFile : "' + Config.base + '" success.');
	
	forEach(Config.sources, function(path){
		var fileName = path.split('/').pop();
		oRes[fileName] = readFile(path.replace(/\.(js|css)$/, '.$1min'), encoding);
		print('readFile : "' + path + '" success.');
	});
	
	html = html.replace(/<link.*?href="([^"]+)".*?\/\s*>/g, function(_, key){
		return '<style type="text/css">' + (oRes[key] || '') + '</style>'
	}).replace(/<script.*?src="([^"]+)".*?\/script>/g, function(_, key){
		return '<script>' + (oRes[key] || '') + '</script>';
	});
	print('Merge success.');
	
	writeFile(Config.destPath.replace(/\{([\d\w\.]+)\}/g, function(_, key){
		return Config[key];
	}), html, encoding);
	
	print('Save success.');
	print('Build project : "' + Config.name + ' ' + Config.version + '" success.');
}

main(arguments);
