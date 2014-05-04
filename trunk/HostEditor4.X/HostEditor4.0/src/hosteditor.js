/**
 * 添加为环境	Y
 * 添加一个新环境（拖动一条规则到env）	Y
 * 删除一个环境	Y
 * 添加规则到一个环境		Y
 * 从一个环境删除一条规则		Y
 * 复制一个环境		Y
 * 打开一个环境时同步展示右边的规则
 * 选择一个规则时同步展示左边的环境
 * 删除一个规则时，检查是否该规则在环境中
 *
 * 新手帮助(win7)
 * 获得win7系统权限功能
 * 快捷键功能
 * 快速查找功能
 * 分享功能
 * 备份和恢复功能
 * 设置常用url功能
 * 清除浏览器缓存功能
 * 反馈功能
 * 检查更新
 * VPN功能
 * 统计功能
 */
(function() {
	var rRoute, rFormat;
	$.route = function(obj, path) {
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
	$.format = function() {
		var args = $.makeArray(arguments),
			str = String(args.shift() || ""),
			ar = [],
			first = args[0];
		args = $.isPlainObject(first) ? args : $.isArray(first) ? first : [args];
		$.each(args, function(i, o) {
			ar.push(str.replace(rFormat || (rFormat = /\{([\d\w\.]+)\}/g), function(m, n, v) {
				v = n === 'INDEX' ? i : n.indexOf(".") < 0 ? o[n] : $.route(o, n);
				return v === undefined ? m : ($.isFunction(v) ? v(n) : v)
			}));
		});
		return ar.join('');
	};
})();
var Wnd = {
	setRect: function(w, h, hAlign, vAlign) {
		var sw = screen.availWidth,
			sh = screen.availHeight,
			bdy = document.body;
		try {
			resizeTo(w = w || sw, h = h || sh);
			w != sw && h != sh && resizeTo(w = w + w - bdy.offsetWidth, h = h + h - bdy.offsetHeight);
			hAlign = hAlign || 'center';
			vAlign = vAlign || 'middle';
			var l = hAlign == 'left' ? '0' : hAlign == 'right' ? (sw - w) : (sw - w) / 2;
			var t = vAlign == 'top' ? '0' : vAlign == 'bottom' ? (sh - h) : (sh - h) / 2;
			moveTo(l, t);
		} catch (ex) {}
	}
};
$.search = function(array, fn) {
	for (var i = 0, len = array.length; i < len; i++) {
		if (true === fn(array[i])) {
			return i;
		}
	}
	return -1;
};

$.widget('mxx.contextmenu', $.ui.menu, {

});

$.widget('mxx.hosteditor', {
	options: {},
	version: '4.0',
	lineDelimiter: '\r\n',
	_create: function() {

		this.initWindow();
		this.getPath();
		if (!this.loadHosts() || !this.loadCfgFile()) {
			return;
		}
		if (!this.isWellFormated(this.hosts) || this.modifiedByUser()) {
			this.rules = this.parseRules(this.hosts)
			this.saveHostsFile(this.rules);
			this.saveCfgFile(this.rules);
		}
		this.initDom();
		this.switchToGuiMode();

	},
	initWindow: function() {
		Wnd.setRect(800, 600);
	},
	getPath: function() {
		this.shell = new ActiveXObject("WScript.Shell");
		this.fso = new ActiveXObject("Scripting.FileSystemObject");
		var envs = this.shell.Environment('Process');
		this.hostsPath = envs('systemroot') + '\\system32\\drivers\\etc\\hosts';
		this.cfgFolderPath = this.shell.SpecialFolders('MyDocuments') + '\\hosteditor\\';
		this.cfgFilePath = this.cfgFolderPath + 'hosteditor.json';
		if (!this.fso.FolderExists(this.cfgFolderPath)) {
			this.fso.CreateFolder(this.cfgFolderPath);
		}
	},
	loadHosts: function() {
		return this.hosts = this.readHostsFile();
	},
	loadCfgFile: function() {
		return this.oCfg = $.parseJSON(this.readCfgFile() || '{"lastUpdate": 0,"lastModify": 0,"rules": {}}');
	},
	readFile: function(path, create) {
		try {
			var ts = this.fso.OpenTextFile(path, 1, create);
			var txt = ts.AtEndOfStream ? '' : ts.ReadAll();
			ts.close();
			return txt;
		} catch (e) {
			alert("读取文件" + path + "失败!请检查是否有足够的权限。");
		}
	},
	writeFile: function(path, content, create) {
		try {
			var ts = this.fso.OpenTextFile(path, 2, create);
			ts.write(content);
			ts.close();
		} catch (e) {
			alert("保存文件" + path + "失败!请检查是否有足够的权限，并且文件不是只读的。");
		}
	},
	readHostsFile: function() {
		return this.readFile(this.hostsPath, true);
	},
	readCfgFile: function() {
		return this.readFile(this.cfgFilePath, true);
	},
	writeHostsFile: function(content) {
		return this.writeFile(this.hostsPath, $.isArray(content) ? content.join(this.lineDelimiter) : content, true);
	},
	writeCfgFile: function(content) {
		return this.writeFile(this.cfgFilePath, $.type(content) == 'string' ? content : JSON.stringify(content), true);
	},
	isWellFormated: function(text) {
		return text.slice(0, 6) == ('#WF' + this.version);
	},
	modifiedByUser: function() {
		return +this.fso.GetFile(this.hostsPath).DateLastModified > this.oCfg.lastModify;
	},
	saveCfgFile: function(rules) {
		this.oCfg = {
			lastUpdate: 0,
			lastModify: +this.fso.GetFile(this.hostsPath).DateLastModified,
			rules: rules
		};
		this.writeCfgFile(this.oCfg);
	},
	saveHostsFile: function(rules) {
		var $this = this,
			arText = [
				['#WF', this.version, ' 为保证Hosteitor的正常运行，请不要删除此行'].join(''), ''
			];
		$.each(rules, function(_, ar) {
			$.each(ar, function(_, o) {
				arText.push($this.toRule(o));
			});
		});
		this.hosts = arText.slice(2).join(this.lineDelimiter);
		this.writeHostsFile(arText);
	},
	parseRules: function(text) {
		var $this = this,
			rules = [];
		$.each(text.split('\n'), function(_, rule, ar) {
			if (ar = $this.parseRule(rule)) {
				$.each(ar, function(_, o, newArr, idx) {
					idx = $.search(rules, function(t) {
						return t.domain == o.domain;
					});
					if (!rules.length || idx < 0) {
						newArr = [];
						idx = rules.push(newArr);
					} else {
						newArr = rules[idx];
					}
					if (!newArr.length || $.search(newArr, function(t) {
						return t.ip == o.ip;
					}) < 0) {
						newArr.push(o);
					}
				});
			}
		});
		return rules;
	},
	rrule: /^(#+)?(\s*\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})+\s+([^\s#]+)(?:\s*#+(.*?)#*)?$/,
	parseRule: function(rule) {
		if (this.rrule.test($.trim(rule))) {
			var sharp = RegExp.$1 ? '#' : '',
				domain = RegExp.$3.toLowerCase(),
				cmnt = $.trim(RegExp.$4);
			return $.map($.trim(RegExp.$2).split(/\s+/), function(ip) {
				return {
					sharp: sharp,
					ip: ip,
					domain: domain,
					cmnt: cmnt
				};
			});
		}
	},
	toRule: function(o) {
		return $.trim([o.sharp ? '#' : '', o.ip, o.domain, o.cmnt ? '#' + o.cmnt : ''].join(' '));
	},
	initDom: function() {
		var $this = this;
		this.$gui = $('#div_gui');
		this.$txt = $('#div_txt');
		this.$overlay = $('#div_overlay');
		this.$menu = $('#div_menu');
		this.$gui.disableSelection();
		this.$gui.on('click', ':checkbox', function(evt) {
			var $chk = $(this),
				$domain, $chks;
			if ($chk.is(':checked')) {
				$domain = $chk.parents('fieldset')
				$chks = $domain.find(':checkbox:checked').not($chk).prop('checked', false);
			}
			$this.applyChange();
		});
		this.$gui.sortable({
			delay: 300,
			placeholder: "ui-state-highlight",
			update: function(evt, ui) {
				$this.applyChange(true);
			}
		});
		this.$gui.on('contextmenu', function(evt) {

		});
		$this.$ipMenu = $('#ul_ip_menu');
		$this.$ipMenu.menu();
		this.$gui.on('contextmenu', 'div.ipitem', function(evt) {
			evt.preventDefault();
			$this.$ipMenu.position({
				my: 'left top',
				of: evt
			});
		});
	},
	applyChange: function(onlyCfg) {
		var rules = this.$gui.find('fieldset').map(function(_, fieldset) {
			return [$(':checkbox', fieldset).map(function(_, chk) {
				var $chk = $(chk);
				return {
					sharp: $chk.is(':checked') ? '' : '#',
					domain: $chk.attr('domain'),
					ip: $chk.attr('ip'),
					cmnt: $chk.attr('cmnt')
				};
			}).get()];
		}).get();
		onlyCfg || this.saveHostsFile(rules);
		this.saveCfgFile(rules);
	},
	switchToGuiMode: function() {
		this.addRulesToGui(this.oCfg.rules);
	},
	addRulesToGui: function(arRules) {
		var $this = this;
		$.each(arRules, function(_, ar) {
			$.each(ar, function(_, oRule) {
				$this.addRuleToGui(oRule);
			});
		});
	},
	addRuleToGui: function(oRule) {
		var sharp = oRule.sharp,
			domain = oRule.domain,
			ip = oRule.ip,
			cmnt = oRule.cmnt;
		var $cont, $item;
		if (!($cont = this.findDomainElem(domain)).size()) {
			$cont = this.addDomainElem(domain);
		}
		if (!this.isDomainContainIp($cont, ip)) {
			this.addIpElem($cont, oRule);
		}

	},
	findDomainElem: function(domain) {
		return this.$gui.find('fieldset[domain="' + domain + '"]');
	},
	addDomainElem: function(domain) {
		return $(['<fieldset class="domaingroups" domain="', '"><legend>', '</legend></fieldset>'].join(domain)).appendTo(this.$gui);
	},
	isDomainContainIp: function($domain, ip) {
		return !!$domain.find('div[ip="' + ip + '"]').size();
	},
	tmplIp: '<div class="ipitem" title="{cmnt}"><label><input type="checkbox" domain="{domain}" ip="{ip}" cmnt="{cmnt}"><span>{ip}</span></label></div>',
	addIpElem: function($domain, oRule) {
		var $ip = $($.format(this.tmplIp, oRule)).appendTo($domain);
		if (!oRule.sharp) {
			$ip.find('input').trigger('click');
		}
	},
	switchToTxtMode: function() {
		this.oCfg.rules
	}
});

$(function() {
	window.onerror = function() {
		alert(Array.prototype.slice.call(arguments).join('\n'));
	};
	$(window).hosteditor();
});