(function(){	$.fn.masonry = function(opt){		opt = $.extend({			callback: $.noop,			isAnimated: true,			distance: 5,			reverse: 0		}, opt);		var $cont = this.first().parent(), width = $cont.innerWidth(), height = $cont.innerHeight(), colWidth = this.eq(0).outerWidth() + opt.distance;		var cols = Math.floor(width / colWidth), arColsHeight = $.map(new Array(cols), function(){			return 0;		});		return this.each(function(i, elem){			var $elem = $(elem), h = $elem.outerHeight(), minColHeight = Math.min.apply(null, arColsHeight), idx = jQuery.inArray(minColHeight, arColsHeight);			$elem[opt.isAnimated ? 'animate' : 'css'](opt.reverse ? {				top: height - (minColHeight + h + opt.distance),				left: width - (colWidth * (idx + 1) + opt.distance)			} : {				top: opt.distance + minColHeight,				left: colWidth * idx + opt.distance			}, opt.callback);			arColsHeight[idx] += h + opt.distance;		});	};})();(function(){	var rRoute, rFormat;	$.route = function(obj, path){		obj = obj || {};		var m;		(rRoute || (rRoute = /([\d\w_]+)/g)).lastIndex = 0;		while ((m = rRoute.exec(path)) !== null) {			obj = obj[m[0]];			if (obj == undefined) {				break			}		}		return obj	};	$.format = function(){		var args = $.makeArray(arguments), str = String(args.shift() || ""), ar = [], first = args[0];		args = $.isPlainObject(first) ? args : $.isArray(first) ? first : [args];		$.each(args, function(i, o){			ar.push(str.replace(rFormat || (rFormat = /\{([\d\w\.]+)\}/g), function(m, n, v){				v = n === 'INDEX' ? i : n.indexOf(".") < 0 ? o[n] : $.route(o, n);				return v === undefined ? m : ($.isFunction(v) ? v(n) : v)			}));		});		return ar.join('');	};})();(function(){	var timer, gm = function(){		return gm.d || (gm.d = $('#div_message'));	};	$.message = function(text, time){		clearTimeout(timer);		gm().html(text).toggleClass('message-toggle').stop(1, 0).fadeTo('fast', 1, function(){			timer = setTimeout(function(){				gm().fadeOut('fast');			}, time || 2000);		});	};})();(function(){	var $motherIpt = $('<input type="text" class="editable ui-corner-all"/>'), stopPropagation = function(evt){		evt.stopPropagation();	}, backup;	$.fn.editable = function(opt){		opt = $.extend({			selector: 'dd',			attr: '',			eventtype: 'contextmenu',			check: function(){				return true;			},			create: $.noop,			complete: $.noop		}, opt);		this.find(opt.selector).live(opt.eventtype, function(evt){			if($('input.editable', this).size()){return;}			var $el = $(this), oldVal = backup = $el.text(), $ipt = $motherIpt.clone().val(oldVal);			$el.empty().append($ipt);			$ipt.select();			$ipt.blur(function(evt){				var val = this.value, chkRslt = opt.check.call(this, val, $el, backup);				if (chkRslt == true) {					$el.empty().text(val);					opt.attr && $el.attr(opt.attr, val);					opt.complete.call(this, val, $el, backup);				} else {					$.message(chkRslt);					$ipt.select();				}			}).click(stopPropagation).keydown(stopPropagation).keypress(function(evt){				evt.keyCode == 13 && this.blur();				return false;			});			opt.create.call(this, $el);			return false;		});		return this;	};})();(function($){	$.fn.dialog = function(opt){		opt = $.extend(true, {}, opt);		var dialogHtml = [opt.title ? ('<h3 class="dialog-title drag-handle">' + opt.title + '</h3>') : '', '<div class="dialog-content"></div>', opt.buttons && opt.buttons.length ? '<div class="dialog-buttons"></div>' : ''].join('');		var $container = $('<div class="dialog ui-corner-all"></div>').html(dialogHtml), $content = $container.find('div.dialog-content'), $bar = $container.find('div.dialog-buttons');		if (opt.buttons && opt.buttons.length) {			$.each(opt.buttons, function(i, o){				var $btn = $('<button></button>').appendTo($bar);				o.css && $btn.css(o.css);				o.attr && $btn.attr(o.attr);				o.html && $btn.html(o.html);				$btn.click(function(evt){					$.isFunction(o.click) && o.click.call(this, evt, $container);					o.close && $.modal.close();				});			});		}		$content.append(this);		$container.modal({			onShow: function(dialog){				dialog.container.draggable({					handle: '.drag-handle'				});				$.isFunction(opt.onShow) && opt.onShow.call(this, dialog);			},			onOpen: function(dialog){				dialog.overlay.fadeIn(100, function(){					dialog.data.show();					dialog.container.slideDown(200, function(){						var ipt = dialog.data.find(':input:first');						if (ipt.size()) {							ipt.focus();						} else {							dialog.data.find('button:first').focus();						}					});				});				$.isFunction(opt.onOpen) && opt.onOpen.call(this, dialog);			},			onClose: function(dialog){				$.isFunction(opt.onClose) && opt.onClose.call(this, dialog);				dialog.container.slideUp(200, function(){					dialog.overlay.fadeOut(100, function(){						$.modal.close();					});				});			}		});		return this;	};	$.alert = function(html, opt){		opt = $.extend(true, {			title: 'HostEditor温馨提醒',			buttons: [{				close: true,				html: '知道了',				click: opt.callback			}]		}, opt);		$('<p class="dialog-message"></p>').html(html).dialog(opt);	};	$.confirm = function(html, opt){		opt = $.extend(true, {}, opt);		$('<p class="dialog-message"></p>').html(html).dialog({			title: 'HostEditor温馨提醒',			buttons: [{				close: true,				html: '确定',				click: opt.onOk			}, {				html: '取消',				attr: {					'class': 'simplemodal-close'				},				click: opt.onCancel			}]		});	};})(jQuery);(function(W){	var shell = new ActiveXObject("WScript.Shell"), ts, txt;	var fso = new ActiveXObject("Scripting.FileSystemObject");	var sysroot = shell.RegRead('HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\SystemRoot');	var hostpath = sysroot + "\\system32\\drivers\\etc\\hosts";	W.Json = null;	W.File = {		read: function(path, create){			try {				ts = fso.OpenTextFile(path, 1, create), txt = ts.AtEndOfStream ? '' : ts.ReadAll(), ts.close();				return txt;			} catch (e) {				$.alert("读取文件" + path + "失败!请检查是否有足够的权限。");			}		},		write: function(path, content, create){			try {				ts = fso.OpenTextFile(path, 2, create), ts.write(content), ts.close();			} catch (e) {				$.alert("保存文件" + path + "失败!请检查是否有足够的权限，并且文件不是只读的。");			}		},		readHost: function(){			return File.read(hostpath);		},		writeHost: function(content){			File.write(hostpath, content);		},		backup: function(){			try {				fso.CopyFile(hostpath, hostpath.replace(/[^\\]*$/, "") + "hosts.bak." + (+new Date) + '.txt');			} catch (e) {				$.alert("备份hosts文件失败，请检查是否有足够的权限");			}		},		isHostsThere: function(){			return fso.FileExists(hostpath);		},		isWell: function(text){			return /^#WELL#(.*)/.test(text) && RegExp.$1;		},		openIE: function(){			shell.run('iexplore -new about:blank');		},		openFile: function(){			shell.run('notepad "' + hostpath + '"');		},		openFolder: function(){			window.open(hostpath.replace(/[^\\]+$/, ''), 'HostEditor');		}	};})(window);