$.cookie = function(name, value, options){
	if (typeof value != 'undefined') {
		options = options ||
		{
			path: '/',
			domain: 'qq.com'
		};
		if (value === null) {
			value = '';
			options.expires = -1;
		}
		var expires = '';
		if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
			var date;
			if (typeof options.expires == 'number') {
				date = new Date();
				date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
			} else {
				date = options.expires;
			}
			expires = '; expires=' + date.toUTCString();
		}
		var path = options.path ? '; path=' + (options.path) : '';
		var domain = options.domain ? '; domain=' + (options.domain) : '';
		var secure = options.secure ? '; secure' : '';
		document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
	} else {
		var cookieValue = '';
		if (document.cookie && document.cookie != '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = jQuery.trim(cookies[i]);
				if (cookie.substring(0, name.length + 1) == (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
};

$.fn.rotateClass = function(obj, times){
	if (!obj) return this;
	if (times == undefined) times = 99999999;
	var me = this, time = 0, o = null, ar = [], strAllClass = [];
	$.each(obj, function(k, v){
		ar.push({
			className: k,
			time: v,
			next: null
		});
		strAllClass.push(k);
	});
	times *= ar.length;
	strAllClass = strAllClass.join(' ');
	for (var i = 0; i < ar.length - 1; i++) 
		ar[i].next = ar[i + 1];
	o = ar[i].next = ar[0];
	
	function switchToNextClass(){
		me.removeClass(strAllClass)
		if (++time > times) return;
		me.addClass(o.className);
		setTimeout(switchToNextClass, o.time);
		o = o.next;
	}
	switchToNextClass();
	return me;
};
$.fn.center = function(){
	return this.each(function(){
		var leftPos = ($(window).width() - $(this).outerWidth()) / 2 + $(window).scrollLeft(), topPos = ($(window).height() - $(this).outerHeight()) / 2 + $(window).scrollTop();
		leftPos = (leftPos < 0) ? 0 : leftPos;
		topPos = (topPos < 0) ? 0 : topPos;
		$(this).css({
			left: leftPos + 'px',
			top: topPos + 'px'
		});
	});
};

$.fn.caret = function(begin, end){
	if (this.length == 0) return;
	if (typeof begin == 'number') {
		end = (typeof end == 'number') ? end : begin;
		return this.each(function(){
			if (this.setSelectionRange) {
				this.focus();
				this.setSelectionRange(begin, end);
			} else if (this.createTextRange) {
				var range = this.createTextRange();
				range.collapse(true);
				range.moveEnd('character', end);
				range.moveStart('character', begin);
				range.select();
			}
		});
	} else {
		if (this[0].setSelectionRange) {
			begin = this[0].selectionStart;
			end = this[0].selectionEnd;
		} else if (document.selection && document.selection.createRange) {
			var range = document.selection.createRange();
			begin = 0 - range.duplicate().moveStart('character', -100000);
			end = begin + range.text.length;
		}
		return {
			begin: begin,
			end: end
		};
	}
};
$.fn.filterInt = function(options){
	var config = {
		isZeroBegin: false,
		maxlen: Number.MAX_VALUE,
		onchange: function(){
		}
	};
	$.extend(config, options);
	return this.each(function(){
		var input = $(this);
		input.attr({
			maxLength: config.maxlen
		}).css({
			imeMode: 'disabled'
		});
		var r = /[１２３４５６７８９０]/g;
		function chkVal(){
			input.val(input.val().replace(r, function(a){
				return a.charCodeAt(0) - 65296;
			}).replace(!config.isZeroBegin ? /^0+|\D/g : /\D/g, "").substring(0, config.maxlen));
		}
		function focusHandler(e){
			chkVal();
			setTimeout(function(){
				input.caret(input.val().length);
			}, 0);
		}
		function keyDownHandler(e){
			var k = e.keyCode;
			if (!(e.ctrlKey || e.altKey) && e.shiftKey && (k > 47 && k < 58)) { return false; }
			var pos = $(this).caret();
			if (!config.isZeroBegin && pos.begin == 0 && (k == 48 || k == 96)) return false;
		}
		function keyPressHandler(e){
			var k = e.charCode || e.keyCode || e.which;
			var ipt = $(this);
			var pos = ipt.caret();
			if (!(e.ctrlKey || e.altKey || e.shiftKey) && !((k > 47 && k < 58) || (k < 32 || (k > 32 && k < 41) || k == 45 || k == 46))) return false;
			setTimeout(function(){
				config.onchange.call(ipt[0]);
			}, 0);
			return true;
		}
		function blurHandler(e){
			chkVal();
			setTimeout(function(){
				config.onchange.call(input[0]);
			}, 0);
		}
		input.one("unfilterInt", function(){
			input.unbind("focus", focusHandler).unbind("blur", blurHandler).unbind("keydown", keyDownHandler).unbind("keypress", keyPressHandler);
			if ($.browser.msie) this.onpaste = null;
			else if ($.browser.mozilla) {
				this.removeEventListener('input', chkVal, false);
				this.removeEventListener('dragdrop', chkVal, false);
			}
		});
		input.bind("focus", focusHandler).bind("blur", blurHandler).bind("keydown", keyDownHandler).bind("keypress", keyPressHandler);
		if ($.browser.msie) this.onpaste = function(){
			setTimeout(chkVal, 0);
		};
		else if ($.browser.mozilla) {
			this.addEventListener('input', chkVal, false);
			this.addEventListener('dragdrop', chkVal, false);
		}
		chkVal();
	});
};
$.fn.drag = function(elToDrag, fnChk){
	return this.each(function(){
		elToDrag = elToDrag || this;
		var target = $(this);
		target.mousedown(function(e){
			if (!fnChk(e)) return;
			var dx = e.clientX - elToDrag.offsetLeft, dy = e.clientY - elToDrag.offsetTop;
			if ($.browser.msie) {
				elToDrag.setCapture();
				elToDrag.attachEvent('onlosecapture', upHandler);
			}
			function moveHandler(e){
				function max(a, b){
					return Math.max(a, b);
				}
				target.css("cursor", 'move');
				$(elToDrag).css({
					'left': max(e.clientX - dx, 0),
					'top': max(e.clientY - dy, 0)
				});
				return false;
			}
			function upHandler(e){
				$(this).unbind("mousemove").unbind("mouseup");
				if ($.browser.msie) {
					elToDrag.detachEvent('onlosecapture', upHandler);
					elToDrag.releaseCapture();
				}
				target.css("cursor", 'default');
				return false;
			}
			$($.browser.msie ? elToDrag : document).mousemove(moveHandler).mouseup(upHandler);
		})
	})
};


$.fn.options = function(data, fnFilter, value, text){
	if (!data) return this.get(0).options;
	if (!$.isFunction(fnFilter)) {
		text = value;
		value = fnFilter;
		fnFilter = function(){
			return true;
		};
	}
	if (data instanceof Array && data[0] && typeof(data[0]) === 'object') {
		value = value || 'value';
		text = text || 'text';
		return this.each(function(x, dlt){
			$.each(data, function(i, n){
				if (fnFilter(i, n)) {
					var nAttr = $.extend({}, n);
					delete nAttr[value];
					delete nAttr[text];
					add(dlt, {
						value: n[value],
						text: n[text]
					}, nAttr);
				}
			});
		});
	} else if (data instanceof Array || $.isPlainObject(data[0]) || $.isPlainObject(data)) { return this.each(function(x, dlt){
		$.each(data, function(i, n){
			if (fnFilter(i, n)) {
				add(dlt, {
					value: i,
					text: n
				});
			}
		});
	}); }
	function add(dlt, obj, nAttr){
		var opt = document.createElement("option");
		dlt.options.add(opt);
		opt.value = obj.value;
		opt.text = obj.text;
		$(opt).attr(nAttr);
	}
	return this;
};
$.fn.cascadeDate = function(opts){
	var defopt = {
		minyear: 1908,
		maxyear: 2050,
		defaults: null,
		isHave: true,
		havetext: '请选择'
	};
	if (typeof(opts) == 'boolean') opts = {
		isHave: opts
	};
	else if (typeof(opts) == 'string') opts = {
		havetext: opts
	};
	else if (opts instanceof Date) opts = {
		defaults: [opts.getFullYear(), opts.getMonth() + 1, opts.getDate()].join(',').split(',')
	};
	$.extend(defopt, opts);
	if (!defopt.defaults) {
		var now = new Date();
		var curYear = now.getFullYear();
		if (defopt.maxyear < curYear) defopt.maxyear = curYear;
		defopt.defaults = [now.getFullYear().toString(), (now.getMonth() + 1).toString(), now.getDate().toString()];
	}
	var dlts = this.slice(0, 3), dltYear = dlts.eq(0), dltMonth = dlts.eq(1), dltDate = dlts.eq(2);
	dlts.each(function(i, n){
		this.options.length = 0;
	});
	if (defopt.isHave) dlts.options({
		"": defopt.havetext
	});
	var oYear = {}, oMonth = {};
	for (var i = defopt.maxyear; i >= defopt.minyear; i--) 
		oYear[i] = i;
	for (var i = 1; i <= 12; i++) 
		oMonth[i] = i;
	dltYear.options(oYear);
	dltMonth.options(oMonth);
	var daysPerMonth = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	function dltYearMonthChg(){
		var month = dltMonth.val(), date = dltDate.val(), lastDays = dltDate[0].options.length;
		var days = month != '2' ? daysPerMonth[month - 1] : (new Date(dltYear.val() + '/1/1').isLeapYear() ? 29 : 28);
		days += !!defopt.isHave - 0;
		if (lastDays == days) return;
		if (lastDays > days) {
			dltDate[0].options.length = days;
			dltDate.val(date - 0 >= days ? days.toString() : date);
			return;
		}
		for (var i = lastDays + 1, obj = {}; i <= days; i++) 
			obj[i] = i;
		dltDate.options(obj).val(date);
	}
	dltYear.add(dltMonth).change(dltYearMonthChg);
	if (defopt.defaults && defopt.defaults.length) {
		$.each(defopt.defaults, function(i, n){
			dlts.eq(i).val(n).change();
		});
	} else if (!defopt.isHave) {
		dltMonth.eq(0).change();
	}
	return this;
};
$.fn.floatWith = function(obj, idx){
	idx = typeof(idx) != 'number' || !idx ? 0 : (idx % 8);
	var elem = $(obj), offset = elem.offset(), _top = offset.top, _left = offset.left, width = elem.outerWidth(), height = elem.outerHeight();
	var floatWidth = this.outerWidth(), floatHeight = this.outerHeight(), cssPos = {};
	var arTopDelta = [height, height, 0, -floatHeight, -floatHeight, -floatHeight, 0, height];
	var arLeftDelta = [0, width, width, width, 0, -floatWidth, -floatWidth, -floatWidth];
	this.eq(0).css({
		'position': 'absolute',
		top: _top + arTopDelta[idx],
		left: _left + arLeftDelta[idx]
	}).hide().show(200);
	return this;
};
