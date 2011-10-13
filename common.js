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

$.fn.center = function(){
	return this.each(function(){
		var de = document.documentElement, w = window, leftPos = (($.browser.opera ? de.clientWidth : $(w).width()) - $(this).outerWidth()) / 2 + $(w).scrollLeft(), topPos = (($.browser.opera ? de.clientHeight : $(w).height()) - $(this).outerHeight()) / 2 + $(w).scrollTop();
		leftPos = (leftPos < 0) ? 0 : leftPos;
		topPos = (topPos < 0) ? 0 : topPos;
		$(this).css({
			left: leftPos + 'px',
			top: topPos + 'px'
		});
	});
};

(function(){
	var divMsg = $('#div_message');
	$.message = function(text, time){
		divMsg.removeClass().addClass('ui-state-highlight ui-corner-all').center();
		divMsg.fadeIn().delay(time || 1500).fadeOut().find('strong').html(text);
	};
	$.error = function(text, time){
		divMsg.removeClass().addClass('ui-state-error ui-corner-all').center();
		divMsg.fadeIn().delay(time || 1500).fadeOut().find('strong').html(text);
	};
})();

function copy(text){
	return window.clipboardData.setData("Text", text);
}




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

function see(value, replacer, space){
	return alert(JSON.stringify(value, replacer, space));
}

var jsonCasesData = {
	'正式环境': [{
		s: '',
		i: '172.25.32.72',
		d: 'imgcache.qq.com',
		c: ''
	}, {
		s: '',
		i: '172.25.32.72',
		d: 'qzs.qq.com',
		c: ''
	}, {
		s: '',
		i: '172.25.32.72',
		d: 'qzstyle.qq.com',
		c: ''
	}],
	'开发环境': [{
		s: '',
		i: '172.25.32.72',
		d: 'imgcache.qq.com',
		c: ''
	}, {
		s: '',
		i: '172.25.32.72',
		d: 'qzs.qq.com',
		c: ''
	}, {
		s: '',
		i: '172.25.32.72',
		d: 'qzstyle.qq.com',
		c: ''
	}],
	'预发布环境': [{
		s: '',
		i: '172.25.32.99',
		d: 'imgcache.qq.com',
		c: ''
	}, {
		s: '',
		i: '172.25.32.99',
		d: 'qzs.qq.com',
		c: ''
	}, {
		s: '',
		i: '172.25.32.99',
		d: 'qzstyle.qq.com',
		c: ''
	}]
};

