(function(){
	var rRoute, rFormat;
	$.route = function(obj, path){
		obj = obj || {};
		var m;
		(rRoute || (rRoute = /([\d\w_]+)/g)).lastIndex = 0;
		while ((m = rRoute.exec(path)) !== null) {
			obj = obj[m[0]];
			if (obj == undefined) {
				break
			}
		}
		return obj
	};
	$.format = function(){
		var args = $.makeArray(arguments), str = String(args.shift() || ""), ar = [], first = args[0];
		args = $.isPlainObject(first) ? args : $.isArray(first) ? first : [args];
		$.each(args, function(i, o){
			ar.push(str.replace(rFormat || (rFormat = /\{([\d\w\.]+)\}/g), function(m, n, v){
				v = n === 'INDEX' ? i : n.indexOf(".") < 0 ? o[n] : $.route(o, n);
				return v === undefined ? m : ($.isFunction(v) ? v(n) : v)
			}));
		});
		return ar.join('');
	};
	
	var rlenw;
	$.lenW = function(str){
		return str.replace(rlenw || (rlenw = /[^\x00-\xff]/g), "**").length;
	};
	
	$.leftPad = function(str, size, ch){
		return size <= str.length ? str : (new Array(size - str.length + 1).join(ch || ' ') + str);
	};
	
	var f = [/&/g, /"/g, /</g, />/g, /'/g, /\x20/g, /\n/g, /\t/g];
	var t = ["&quot;", "&lt;", "&gt;", "&#146;", "&nbsp;", "", "&nbsp;&nbsp;&nbsp;&nbsp;"];
	$.htmlEncode = function(html){
		return html.replace(f[0], t[0]).replace(f[1], t[1]).replace(f[2], t[2]).replace(f[3], t[3]).replace(f[4], t[4]).replace(f[5], t[5]).replace(f[6], t[6]).replace(f[7], t[7])
	};
})();


/**
 * 设置软件窗口大小和位置
 */
var Wnd = {
	setRect: function(w, h){
		var sw = screen.availWidth, sh = screen.availHeight, bdy = document.body;
		try {
			resizeTo(w, h);
			resizeTo(w = w + w - bdy.clientWidth, h = h + h - bdy.clientHeight);
			moveTo((sw - w) / 2, (sh - h) / 2);
		} catch (ex) {
		}
	},
	setLayout: function(){
		Json.size.width = $('body').width();
		$('#main,#case').height((Json.size.height = $('body').height()) - $('#footer').height());
	}
};
var Editor = {
	renderDom: function(json){
		
	}
};
(function(){
	var shell = new ActiveXObject("WScript.Shell"), fso = new ActiveXObject("Scripting.FileSystemObject");
	var sysroot = shell.RegRead('HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\SystemRoot');
	var hostpath = sysroot + "\\system32\\drivers\\etc\\hosts";
	
	window.File = {
		read: function(path, create){
			var ts = fso.OpenTextFile(path, 1, create), txt = ts.AtEndOfStream ? '' : ts.ReadAll();
			ts.close();
			return txt;
		},
		write: function(path, content, create){
			try {
				var ts = fso.OpenTextFile(path, 2, create);
				ts.write(content), ts.close();
				return true;
			} catch (e) {
				return alert("保存文件\n" + path + "\n失败!请检查是否有足够的权限，并且文件不是只读的。");
			}
		},
		getHostPath: function(){
			return hostpath;
		},
		readHost: function(){
			return File.read(hostpath);
		},
		writeHost: function(content){
			return File.write(hostpath, content);
		},
		isHostsThere: function(){
			return fso.FileExists(hostpath);
		},
		isWell: function(text){
			return /^#WELL#(.*)/.test(text) && RexExp.$1;
		},
		getJsonFromText: function(text){
			var ar = $.trim(text).split(/(\s*\n)+\s*/), m, o = {};
			$.each(ar, function(i, t){
				if (m = /^(#)*\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})((?:\s+[^#\s]+)+)(?:\s*#(.*))?$/.exec($.trim(t))) {
					$.each($.trim(m[3]).split(/\s/), function(j, d){
						o[d] || (o[d] = []);
						o[d].push({
							s: m[1],
							i: m[2],
							d: d,
							c: m[4]
						});
					});
				}
			});
			return o;
		},
		readConfig: function(text){
			var Json;
			if (Json = File.isWell(text)) {
				eval('Json=' + Json);
			} else {
				Json = {
					size: {
						width: 800,
						height: 600
					},
					cases: [],
					hosts: File.getJsonFromText(text)
				};
			}
			return Json;
		}
	};
	window.Json = null;
})();

function see(value, replacer, space){
	return alert(JSON.stringify(value, replacer, space));
}

$(function(){
	if (!File.isHostsThere()) {
		return alert('程序找不到hosts文件');
	}
	
	var text = $.trim(File.readHost());
	Json = File.readConfig(text);
	//see(json);
	Editor.renderDom(Json);
	
	
	//调整窗口大小、位置，调整布局
	$(window).resize(Wnd.setLayout);
	Wnd.setRect(Json.size.width, Json.size.height);
	
	$("#case").accordion({
		collapsible: true,
		autoHeight: false,
		navigation: true
	});
	
	$("#main dl").draggable({
		cursor: 'move',
		handle: 'dt',
		opacity: 0.3
	});
	
	return;
	$("#main").tabs().bind('selectstart', function(){
		return false;
	});
	
	//加载配置文件
	var xmlString, boolValue;
	if (!fso.FileExists(window.cfgpath = mydocroot + '\\' + cfgName)) {
		xmlString = xmlHead + cvtHostsToXml(hostpath.getFileText());
		cfgpath.setFileText(xmlString);
		boolValue = xmlDoc.loadXML(xmlString);
	} else {
		boolValue = xmlDoc.load(cfgpath);
	}
	
	/*
	 var json = rulesToJson(hostpath.getFileText())
	 var myJSONText = JSON.stringify(json);
	 prompt('', myJSONText);
	 */
	if (!boolValue) {
		throw new Error('- -! Sorry，加载配置文件失败鸟？');
	}
	
	$("#main").tabs();
	
	$("#main dl").selectable({
		cancel: 'dt',
		tolerance: 'fit'
	}).draggable({
		helper: 'clone',
		cursor: 'move',
		distance: 0,
		handle: 'dt',
		opacity: 0.35
	});
	
});







/**
 * host规则的单条增加，批量增加，方案增加，修改，删除，复制，克隆
 * host规则的备份，方案备份，用户使用数据备份
 *
 * 怎样的体验？
 */
function Rule(sharp, ip, domain, comment){
	this.sharp = sharp;
	this.ip = ip;
	this.domain = domain;
	this.comment = comment;
}

function rulesToJson(text){
	var r = /(#?)\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(\s+([a-z0-9\-\.]+))+/ig, ar = [], m, p, o = {};
	while (m = r.exec(text)) {
		m[3].trim().split(/\s+/).forEach(function(dm, i){
			o[dm] || (o[dm] = []);
			o[dm].push(new Rule(m[1], m[2], dm, ''));
		});
	}
	return o;
}

/**
 * 把hosts文件转为xml格式
 * 1. 兼容合并的规则（一个ip对应多个域名）
 * 2. 检测错误的规则（为同一个域名配置了多个ip）
 */
function cvtHostsToXml(text){
	var m, r = /(#?)[\f\t\v\x20]*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})[\f\t\v\x20]+(\S+)[\f\t\v\x20]*(#(.*))?/g;
	while (m = r.exec(text)) {
	
	}
	return '<root></root>';
}

$.attempt = function(){
	for (var i = 0, l = arguments.length; i < l; i++) {
		try {
			return arguments[i]();
		} catch (e) {
		}
	}
	return null;
};
