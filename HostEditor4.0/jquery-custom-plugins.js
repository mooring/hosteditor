
/*
 * SimpleModal 1.4.1 - jQuery Plugin
 * http://www.ericmmartin.com/projects/simplemodal/
 * Copyright (c) 2010 Eric Martin (http://twitter.com/ericmmartin)
 * Dual licensed under the MIT and GPL licenses
 * Revision: $Id: jquery.simplemodal.js 261 2010-11-05 21:16:20Z emartin24 $
 */
(function(d){
	var k = d.browser.msie && parseInt(d.browser.version) === 6 && typeof window.XMLHttpRequest !== "object", m = d.browser.msie && parseInt(d.browser.version) === 7, l = null, f = [];
	d.modal = function(a, b){
		return d.modal.impl.init(a, b)
	};
	d.modal.close = function(){
		d.modal.impl.close()
	};
	d.modal.focus = function(a){
		d.modal.impl.focus(a)
	};
	d.modal.setContainerDimensions = function(){
		d.modal.impl.setContainerDimensions()
	};
	d.modal.setPosition = function(){
		d.modal.impl.setPosition()
	};
	d.modal.update = function(a, b){
		d.modal.impl.update(a, b)
	};
	d.fn.modal = function(a){
		return d.modal.impl.init(this, a)
	};
	d.modal.defaults = {
		appendTo: "body",
		focus: true,
		opacity: 50,
		overlayId: "simplemodal-overlay",
		overlayCss: {
			backgroundColor: '#000000'
		},
		containerId: "simplemodal-container",
		containerCss: {},
		dataId: "simplemodal-data",
		dataCss: {},
		minHeight: null,
		minWidth: null,
		maxHeight: null,
		maxWidth: null,
		autoResize: false,
		autoPosition: true,
		zIndex: 1E3,
		close: true,
		closeHTML: '<a class="modalCloseImg" title="Close">X</a>',
		closeClass: "simplemodal-close",
		escClose: true,
		overlayClose: false,
		position: null,
		persist: false,
		modal: true,
		onOpen: null,
		onShow: null,
		onClose: null
	};
	d.modal.impl = {
		d: {},
		init: function(a, b){
			var c = this;
			if (c.d.data) return false;
			l = d.browser.msie && !d.boxModel;
			c.o = d.extend({}, d.modal.defaults, b);
			c.zIndex = c.o.zIndex;
			c.occb = false;
			if (typeof a === "object") {
				a = a instanceof jQuery ? a : d(a);
				c.d.placeholder = false;
				if (a.parent().parent().size() > 0) {
					a.before(d("<span></span>").attr("id", "simplemodal-placeholder").css({
						display: "none"
					}));
					c.d.placeholder = true;
					c.display = a.css("display");
					if (!c.o.persist) c.d.orig = a.clone(true)
				}
			} else if (typeof a === "string" || typeof a === "number") a = d("<div></div>").html(a);
			else {
				alert("SimpleModal Error: Unsupported data type: " + typeof a);
				return c
			}
			c.create(a);
			c.open();
			d.isFunction(c.o.onShow) && c.o.onShow.apply(c, [c.d]);
			return c
		},
		create: function(a){
			var b = this;
			f = b.getDimensions();
			if (b.o.modal && k) b.d.iframe = d('<iframe src="javascript:false;"></iframe>').css(d.extend(b.o.iframeCss, {
				display: "none",
				opacity: 0,
				position: "fixed",
				height: f[0],
				width: f[1],
				zIndex: b.o.zIndex,
				top: 0,
				left: 0
			})).appendTo(b.o.appendTo);
			b.d.overlay = d("<div></div>").attr("id", b.o.overlayId).addClass("simplemodal-overlay").css(d.extend(b.o.overlayCss, {
				display: "none",
				opacity: b.o.opacity / 100,
				height: b.o.modal ? f[0] : 0,
				width: b.o.modal ? f[1] : 0,
				position: "fixed",
				left: 0,
				top: 0,
				zIndex: b.o.zIndex + 1
			})).appendTo(b.o.appendTo);
			b.d.container = d("<div></div>").attr("id", b.o.containerId).addClass("simplemodal-container").css(d.extend(b.o.containerCss, {
				display: "none",
				position: "fixed",
				zIndex: b.o.zIndex + 2
			})).append(b.o.close && b.o.closeHTML ? d(b.o.closeHTML).addClass(b.o.closeClass) : "").appendTo(b.o.appendTo);
			b.d.wrap = d("<div></div>").attr("tabIndex", -1).addClass("simplemodal-wrap").css({
				height: "100%",
				outline: 0,
				width: "100%"
			}).appendTo(b.d.container);
			b.d.data = a.attr("id", a.attr("id") || b.o.dataId).addClass("simplemodal-data").css(d.extend(b.o.dataCss, {
				display: "none"
			})).appendTo("body");
			b.setContainerDimensions();
			b.d.data.appendTo(b.d.wrap);
			if (k || l) b.fixIE()
		},
		bindEvents: function(){
			var a = this;
			d("." + a.o.closeClass).bind("click.simplemodal", function(b){
				b.preventDefault();
				a.close()
			});
			a.o.modal && a.o.close && a.o.overlayClose &&
			a.d.overlay.bind("click.simplemodal", function(b){
				b.preventDefault();
				a.close()
			});
			d(document).bind("keydown.simplemodal", function(b){
				if (a.o.modal && b.keyCode === 9) a.watchTab(b);
				else if (a.o.close && a.o.escClose && b.keyCode === 27) {
					b.preventDefault();
					a.close()
				}
			});
			d(window).bind("resize.simplemodal", function(){
				f = a.getDimensions();
				a.o.autoResize ? a.setContainerDimensions() : a.o.autoPosition && a.setPosition();
				if (k || l) a.fixIE();
				else if (a.o.modal) {
					a.d.iframe &&
					a.d.iframe.css({
						height: f[0],
						width: f[1]
					});
					a.d.overlay.css({
						height: f[0],
						width: f[1]
					})
				}
			})
		},
		unbindEvents: function(){
			d("." + this.o.closeClass).unbind("click.simplemodal");
			d(document).unbind("keydown.simplemodal");
			d(window).unbind("resize.simplemodal");
			this.d.overlay.unbind("click.simplemodal")
		},
		fixIE: function(){
			var a = this, b = a.o.position;
			d.each([a.d.iframe || null, !a.o.modal ? null : a.d.overlay, a.d.container], function(c, h){
				if (h) {
					var g = h[0].style;
					g.position = "absolute";
					if (c < 2) {
						g.removeExpression("height");
						g.removeExpression("width");
						g.setExpression("height", 'document.body.scrollHeight > document.body.clientHeight ? document.body.scrollHeight : document.body.clientHeight + "px"');
						g.setExpression("width", 'document.body.scrollWidth > document.body.clientWidth ? document.body.scrollWidth : document.body.clientWidth + "px"')
					} else {
						var e;
						if (b && b.constructor === Array) {
							c = b[0] ? typeof b[0] === "number" ? b[0].toString() : b[0].replace(/px/, "") : h.css("top").replace(/px/, "");
							c = c.indexOf("%") === -1 ? c + ' + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"' : parseInt(c.replace(/%/, "")) + ' * ((document.documentElement.clientHeight || document.body.clientHeight) / 100) + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"';
							if (b[1]) {
								e = typeof b[1] === "number" ? b[1].toString() : b[1].replace(/px/, "");
								e = e.indexOf("%") === -1 ? e + ' + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"' : parseInt(e.replace(/%/, "")) + ' * ((document.documentElement.clientWidth || document.body.clientWidth) / 100) + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"'
							}
						} else {
							c = '(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (t = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"';
							e = '(document.documentElement.clientWidth || document.body.clientWidth) / 2 - (this.offsetWidth / 2) + (t = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft) + "px"'
						}
						g.removeExpression("top");
						g.removeExpression("left");
						g.setExpression("top", c);
						g.setExpression("left", e)
					}
				}
			})
		},
		focus: function(a){
			var b = this;
			a = a && d.inArray(a, ["first", "last"]) !== -1 ? a : "first";
			var c = d(":input:enabled:visible:" + a, b.d.wrap);
			setTimeout(function(){
				c.length > 0 ? c.focus() : b.d.wrap.focus()
			}, 10)
		},
		getDimensions: function(){
			var a = d(window);
			return [d.browser.opera && d.browser.version > "9.5" && d.fn.jquery < "1.3" || d.browser.opera && d.browser.version < "9.5" && d.fn.jquery > "1.2.6" ? a[0].innerHeight : a.height(), a.width()]
		},
		getVal: function(a, b){
			return a ? typeof a === "number" ? a : a === "auto" ? 0 : a.indexOf("%") > 0 ? parseInt(a.replace(/%/, "")) / 100 * (b === "h" ? f[0] : f[1]) : parseInt(a.replace(/px/, "")) : null
		},
		update: function(a, b){
			var c = this;
			if (!c.d.data) return false;
			c.d.origHeight = c.getVal(a, "h");
			c.d.origWidth = c.getVal(b, "w");
			c.d.data.hide();
			a && c.d.container.css("height", a);
			b && c.d.container.css("width", b);
			c.setContainerDimensions();
			c.d.data.show();
			c.o.focus && c.focus();
			c.unbindEvents();
			c.bindEvents()
		},
		setContainerDimensions: function(){
			var a = this, b = k || m, c = a.d.origHeight ? a.d.origHeight : d.browser.opera ? a.d.container.height() : a.getVal(b ? a.d.container[0].currentStyle.height : a.d.container.css("height"), "h");
			b = a.d.origWidth ? a.d.origWidth : d.browser.opera ? a.d.container.width() : a.getVal(b ? a.d.container[0].currentStyle.width : a.d.container.css("width"), "w");
			var h = a.d.data.outerHeight(true), g = a.d.data.outerWidth(true);
			a.d.origHeight = a.d.origHeight || c;
			a.d.origWidth = a.d.origWidth || b;
			var e = a.o.maxHeight ? a.getVal(a.o.maxHeight, "h") : null, i = a.o.maxWidth ? a.getVal(a.o.maxWidth, "w") : null;
			e = e && e < f[0] ? e : f[0];
			i = i &&
			i <
			f[1] ? i : f[1];
			var j = a.o.minHeight ? a.getVal(a.o.minHeight, "h") : "auto";
			c = c ? a.o.autoResize && c > e ? e : c < j ? j : c : h ? h > e ? e : a.o.minHeight && j !== "auto" && h < j ? j : h : j;
			e = a.o.minWidth ? a.getVal(a.o.minWidth, "w") : "auto";
			b = b ? a.o.autoResize && b > i ? i : b < e ? e : b : g ? g > i ? i : a.o.minWidth && e !== "auto" && g < e ? e : g : e;
			a.d.container.css({
				height: c,
				width: b
			});
			a.d.wrap.css({
				overflow: h > c || g > b ? "auto" : "visible"
			});
			a.o.autoPosition && a.setPosition()
		},
		setPosition: function(){
			var a = this, b, c;
			b = f[0] / 2 - a.d.container.outerHeight(true) / 2;
			c = f[1] / 2 -
			a.d.container.outerWidth(true) /
			2;
			if (a.o.position && Object.prototype.toString.call(a.o.position) === "[object Array]") {
				b = a.o.position[0] || b;
				c = a.o.position[1] || c
			} else {
				b = b;
				c = c
			}
			a.d.container.css({
				left: c,
				top: b
			})
		},
		watchTab: function(a){
			var b = this;
			if (d(a.target).parents(".simplemodal-container").length > 0) {
				b.inputs = d(":input:enabled:visible:first, :input:enabled:visible:last", b.d.data[0]);
				if (!a.shiftKey && a.target === b.inputs[b.inputs.length - 1] || a.shiftKey && a.target === b.inputs[0] || b.inputs.length === 0) {
					a.preventDefault();
					b.focus(a.shiftKey ? "last" : "first")
				}
			} else {
				a.preventDefault();
				b.focus()
			}
		},
		open: function(){
			var a = this;
			a.d.iframe && a.d.iframe.show();
			if (d.isFunction(a.o.onOpen)) a.o.onOpen.apply(a, [a.d]);
			else {
				a.d.overlay.show();
				a.d.container.show();
				a.d.data.show()
			}
			a.o.focus && a.focus();
			a.bindEvents()
		},
		close: function(){
			var a = this;
			if (!a.d.data) return false;
			a.unbindEvents();
			if (d.isFunction(a.o.onClose) && !a.occb) {
				a.occb = true;
				a.o.onClose.apply(a, [a.d])
			} else {
				if (a.d.placeholder) {
					var b = d("#simplemodal-placeholder");
					if (a.o.persist) b.replaceWith(a.d.data.removeClass("simplemodal-data").css("display", a.display));
					else {
						a.d.data.hide().remove();
						b.replaceWith(a.d.orig)
					}
				} else a.d.data.hide().remove();
				a.d.container.hide().remove();
				a.d.overlay.hide();
				a.d.iframe && a.d.iframe.hide().remove();
				setTimeout(function(){
					a.d.overlay.remove();
					a.d = {}
				}, 10)
			}
		}
	}
})(jQuery);

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
	$.fn.masonry = function(opt){
		opt = $.extend({
			isAnimated: true,
			distance: 5,
			reverse: 0
		}, opt);
		var $cont = this.first().parent(), width = $cont.innerWidth(), height = $cont.innerHeight(), colWidth = this.eq(0).outerWidth() + opt.distance;
		var cols = Math.floor(width / colWidth), arColsHeight = $.map(new Array(cols), function(){
			return 0;
		});
		
		return this.each(function(i, elem){
			var $elem = $(elem), h = $elem.outerHeight(), minColHeight = Math.min.apply(null, arColsHeight), idx = jQuery.inArray(minColHeight, arColsHeight);
			$elem.css(opt.reverse ? {
				top: height - (minColHeight + h + opt.distance),
				left: width - (colWidth * (idx + 1) + opt.distance)
			} : {
				top: opt.distance + minColHeight,
				left: colWidth * idx + opt.distance
			});
			arColsHeight[idx] += h + opt.distance;
		});
	};
})();

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

(function(){
	var timer, $div = $('#div_message');
	$div.click(function(){
		clearTimeout(timer);
	});
	$.message = function(text, time){
		clearTimeout(timer);
		$div.html(text).toggleClass('message-toggle').stop(1, 0).fadeIn('fast', function(){
			timer = setTimeout(function(){
				$div.fadeOut('fast');
			}, time || 2000);
		});
	};
})();

(function(){
	var stopPropagation = function(evt){
		evt.stopPropagation();
	};
	var $motherIpt = $('<input type="text" class="editable"/>'), backup;
	
	$.fn.editable = function(opt){
		opt = $.extend({
			selector: 'dd',
			attr: '',
			eventtype: 'contextmenu',
			check: function(){
				return true;
			},
			create: $.noop,
			complete: $.noop
		}, opt);
		this.find(opt.selector).live(opt.eventtype, function(evt){
			var $el = $(this), oldVal = backup = $el.text(), $ipt = $motherIpt.clone().val(oldVal);
			$el.empty().append($ipt);
			$ipt.select();
			$ipt.blur(function(evt){
				var val = this.value, chkRslt = opt.check.call(this, val, $el, backup);
				if (chkRslt == true) {
					$el.empty().text(val);
					opt.attr && $el.attr(opt.attr, val);
					opt.complete.call(this, val, $el, backup);
				} else {
					$.message(chkRslt);
					$ipt.select();
				}
			}).click(stopPropagation).keydown(stopPropagation).keypress(function(evt){
				if (evt.keyCode == 13) {
					this.blur();
				}
				stopPropagation(evt);
			});
			opt.create.call(this, $el);
			return false;
		});
		
		return this;
	};
})();

(function($){
	$.fn.dialog = function(opt){
		opt = $.extend(true, {}, opt);
		var dialogHtml = [opt.title ? ('<h3 class="dialog-title drag-handle">' + opt.title + '</h3>') : '', '<div class="dialog-content"></div>', opt.buttons && opt.buttons.length ? '<div class="dialog-buttons"></div>' : ''].join('');
		var $container = $('<div class="dialog ui-corner-all"></div>').html(dialogHtml), $content = $container.find('div.dialog-content'), $bar = $container.find('div.dialog-buttons');
		if (opt.buttons && opt.buttons.length) {
			$.each(opt.buttons, function(i, o){
				var $btn = $('<button></button>').appendTo($bar);
				o.css && $btn.css(o.css);
				o.attr && $btn.attr(o.attr);
				o.html && $btn.html(o.html);
				$btn.click(function(evt){
					$.isFunction(o.click) && o.click.call(this, evt, $container);
					o.close && $.modal.close();
				});
			});
		}
		$content.append(this);
		$container.modal({
			onShow: function(dialog){
				dialog.container.draggable({
					handle: '.drag-handle'
				});
				$.isFunction(opt.onShow) && opt.onShow.call(this, dialog);
			},
			onOpen: function(dialog){
				dialog.overlay.fadeIn(100, function(){
					dialog.data.show();
					dialog.container.slideDown(200, function(){
						var ipt = dialog.data.find(':input:first');
						if (ipt.size()) {
							ipt.focus();
						} else {
							dialog.data.find('button:first').focus();
						}
					});
				});
				$.isFunction(opt.onOpen) && opt.onOpen.call(this, dialog);
			},
			onClose: function(dialog){
				$.isFunction(opt.onClose) && opt.onClose.call(this, dialog);
				dialog.container.slideUp(200, function(){
					dialog.overlay.fadeOut(100, function(){
						$.modal.close();
					});
				});
				
			}
		});
		return this;
	};
	$.alert = function(html, opt){
		opt = $.extend(true, {
			title: 'HostEditor温馨提醒',
			buttons: [{
				close: true,
				html: '知道了',
				click: opt.callback
			}]
		}, opt);
		$('<p class="dialog-message"></p>').html(html).dialog(opt);
	};
	$.confirm = function(html, opt){
		opt = $.extend(true, {}, opt);
		$('<p class="dialog-message"></p>').html(html).dialog({
			title: 'HostEditor温馨提醒',
			buttons: [{
				close: true,
				html: '确定',
				click: opt.onOk
			}, {
				html: '取消',
				attr: {
					'class': 'simplemodal-close'
				},
				click: opt.onCancel
			}]
		});
	};
})(jQuery);


(function(W){
	var shell = new ActiveXObject("WScript.Shell"), ts, txt;
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var sysroot = shell.RegRead('HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\SystemRoot');
	var hostpath = sysroot + "\\system32\\drivers\\etc\\hosts";
	
	W.Json = null;
	W.File = {
		read: function(path, create){
			try {
				ts = fso.OpenTextFile(path, 1, create), txt = ts.AtEndOfStream ? '' : ts.ReadAll(), ts.close();
				return txt;
			} catch (e) {
				$.alert("读取文件\n" + path + "\n失败!请检查是否有足够的权限。");
			}
		},
		write: function(path, content, create){
			try {
				ts = fso.OpenTextFile(path, 2, create), ts.write(content), ts.close();
			} catch (e) {
				$.alert("保存文件\n" + path + "\n失败!请检查是否有足够的权限，并且文件不是只读的。");
			}
		},
		readHost: function(){
			return File.read(hostpath);
		},
		writeHost: function(content){
			File.write(hostpath, content);
		},
		isHostsThere: function(){
			return fso.FileExists(hostpath);
		},
		isWell: function(text){
			return /^#WELL#(.*)/.test(text) && RegExp.$1;
		},
		openIE: function(){
			shell.run('iexplore -new about:blank');
		},
		openFile: function(){
			shell.run('notepad "' + hostpath + '"');
		},
		openFolder: function(){
			if (File.isHostsThere()) {
				window.open(hostpath.replace(/[^\\]+$/, ''), 'HostEditor');
			} else {
				$.alert('本程序无法找到您的HOSTS文件，也无法打开HOSTS文件所在文件夹。');
			}
		}
	};
})(window);

var Wnd = {
	timer: 0,
	setRect: function(w, h){
		var sw = screen.availWidth, sh = screen.availHeight, bdy = document.body;
		try {
			resizeTo(w, h);
			resizeTo(w = w + w - bdy.clientWidth, h = h + h - bdy.clientHeight);
			moveTo((sw - w) / 2, (sh - h) / 2);
		} catch (ex) {
		}
		$(window).resize(Wnd.setLayout);
		Wnd.setLayout();
	},
	setLayout: function(evt){
		var $bdy = $(document.body);
		Json.size.width = $bdy.width();
		Json.size.height = $bdy.height()
		Editor.main.add(Editor.env).height(Json.size.height - Editor.foot.outerHeight());
		if (evt) {
			Wnd.timer && clearTimeout(Wnd.timer);
			Wnd.timer = setTimeout(function(){
				//Editor.save();
			}, 200);
		}
	}
};

var Host = {
	selected: 'selected',
	isEnabled: function($dd){
		return $dd.hasClass(Host.selected);
	},
	enabled: function(json){
		var $dd = json && json.jquery ? $(json) : Editor.getItemElement(json);
		if ($dd.size() && !Host.isEnabled($dd)) {
			$dd.parent().find('dd').removeClass(Host.selected);
			$dd.addClass(Host.selected);
		}
		return $dd;
	},
	disable: function(json){
		var $dd = json && json.jquery ? json : Editor.getItemElement(json);
		if ($dd.size() && Host.isEnabled($dd)) {
			$dd.removeClass(Host.selected);
		}
		return $dd;
	},
	paste: function($tar){
		var txt = window.clipboardData.getData("text") || '';
		txt = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(txt) ? txt : '';
		return txt && $tar && $tar.val(txt);
	},
	rRules: /^(#)*\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})((?:\s+[^#\s]+)+)(?:\s*#(.*))?$/,
	getJsonFromText: function(text){
		var ar = $.trim(text).split(/(\s*\n)+\s*/), m, o = {}, rWhite = /\s/, dupIP = function(n, i){
			return n.i == ip;
		};
		$.each(ar, function(i, t){
			if (m = Host.rRules.exec($.trim(t))) {
				$.each($.trim(m[3]).split(rWhite), function(j, d){
					var ip = m[2];
					o[d] = o[d] ||
					{
						p: {
							"top": 0,
							"left": 0
						},
						r: []
					};
					$.grep(o[d], dupIP).length ||
					o[d].r.push({
						s: m[1] || '',
						i: ip,
						d: d,
						c: m[4]
					});
				});
			}
		});
		delete o['rhino.acme.com'];
		delete o['x.acme.com'];
		return o;
	},
	readConfig: function(text){
		var json;
		if (json = File.isWell(text)) {
			eval('json=' + json);
		} else {
			json = {
				firstRun: true,
				size: {
					width: 900,
					height: 680
				},
				envs: {},
				hosts: Host.getJsonFromText(text)
			};
		}
		return json;
	}
};

function copy(text){
	return window.clipboardData.setData("Text", text);
}

function see(value, replacer, space){
	return alert(JSON.stringify(value, replacer, 2));
}
