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
		if (false === fun.call(array, array[i], i, array)) {
			return array;
		}
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
	
	var encoding = Config.encoding || 'utf-8';
	
	forEach(Config.projects, function(proj){
		var arCode = [];
		proj.needClosure && arCode.push('(function(window){');
		forEach(proj.sources, function(path){
			arCode.push(readFile(path, encoding));
		});
		proj.needClosure && arCode.push('})(window);');
		writeFile(proj.destPath, arCode.join('\r\n'), encoding);
		print('Build project : "' + proj.name + '" success.');
	});
}

main(arguments);
