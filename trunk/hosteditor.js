var Wnd = {
	setRect: function(w, h){
		var sw = screen.availWidth, sh = screen.availHeight, bdy = document.body;
		try {
			resizeTo(w, h);
			resizeTo(w = w + w - bdy.clientWidth, h = h + h - bdy.clientHeight);
			moveTo((sw - w) / 2, (sh - h) / 2);
		} catch (ex) {
		}
		$(window).resize(Wnd.setLayout).resize();
	},
	setLayout: function(){
		Json.size.width = $('body').width();
		$('#main,#case').height((Json.size.height = $('body').height()) - $('#footer').height());
	}
};

var Context = {
	copy: function(target){
		var $t = $(target);
		switch (target.nodeName) {
			case 'DD':
				copy($t.attr('ip') + ' ' + $t.parent().find('dt').attr('domain')) && $.message('复制成功');
				break;
			case 'DT':
				var d = $t.text(), $dl = $t.parent(), ar = [];
				$dl.find('dd').each(function(i, dd){
					ar.push(dd.getAttribute('ip') + ' ' + d);
				});
				copy(ar.join('\n')) && $.message('复制成功');
				break;
			case 'H3':
				var $div = $t.next(), data = Editor.getHostsData($div), ar = [];
				$.each(data, function(dm, json){
					ar.push(json.r[0].i + ' ' + dm);
				});
				copy(ar.join('\n')) && $.message('复制成功');
				break;
			case 'DIV':
				var data = Editor.getHostsData($t), ar = [];
				$.each(data, function(dm, json){
					$.each(json.r, function(_, o){
						ar.push(o.i + ' ' + dm);
					});
				});
				copy(ar.join('\n')) && $.message('复制成功');
				break;
		}
	},
	edit: function(target){
		var $t = $(target);
		$t.html('<input type="text">').find('input').val($t.attr('ip')).accordionHeadEditor({
			attr: 'ip',
			template: '{value}',
			hint: '请输入IP地址',
			change: Editor.save,
			check: function(name){
				var rIp = /^([1-9]\d?|1\d\d|2[0-4]\d|25[0-5])\.([1-9]\d?|1\d\d|2[0-4]\d|25[0-5])\.([1-9]\d?|1\d\d|2[0-4]\d|25[0-5])\.([1-9]\d?|1\d\d|2[0-4]\d|25[0-5])$/;
				if (!rIp.test(name)) {
					return '错误的格式，请输入正确格式的IP地址';
				}
				if ($t.parent().find('dd[ip="' + name + '"]').not($t).size()) {
					return '重复的IP，请输入一个不同的IP地址';
				}
				return true;
			}
		});
	},
	editcasename: function(target){
		var $t = $(target);
		$t.html('<input type="text">').find('input').val($t.attr('casename')).accordionHeadEditor({
			attr: 'casename',
			hint: '请输入环境名称',
			change: Editor.save,
			check: function(name){
				if ($('#case h3[casename="' + name + '"]').not($t).size()) {
					return '重复的环境名，请输入一个不同的名称';
				}
				return true;
			}
		});
	},
	remove: function(target){
	
		var $t = $(target), tip;
		switch (target.nodeName) {
			case 'DD':
				tip = '真的要删除当前IP吗？';
				break;
			case 'DT':
				tip = '真的要删除当前域名吗？';
				$t = $t.parent();
				break;
			case 'H3':
				tip = '真的要删除当前环境吗？';
				$t = $t.add($t.next());
				break;
			default:
				break;
		}
		$.confirm(tip, '', {
			buttons: {
				'删除': function(){
					$t.slideUp(100, function(){
						$t.remove();
						Editor.save();
					});
					$(this).dialog("close");
				}
			}
		});
	},
	addtocase: function(target){
		if (($head = $('#case h3.ui-state-active')).size()) {
			var $head, $div = $head.next(), $dtExist, $t = $(target), ip = $t.attr('ip'), dm = $t.parent().find('dt').attr('domain');
			var o = {};
			o[dm] = {
				r: [{
					s: '',
					i: ip,
					d: dm,
					c: ''
				}]
			};
			if (($dtExist = $div.find('dt[domain="' + dm + '"]')).size()) {
				$.confirm($div.prev().text() + ' 中已经有该域名的配置，要替换该配置吗？', '', {
					buttons: {
						'替换': function(){
							$(this).dialog("close");
							$dtExist.parent().replaceWith($(Editor.genHostsHtml(o)).slideDown());
							Editor.save();
						}
					}
				});
			} else {
				$div.append(Editor.genHostsHtml(o));
				Editor.save();
			}
		} else {
			if ($('#case h3').size()) {
				$.message('请先展开要添加到的环境');
			} else {
				$.confirm('您没有配置任何环境。是否马上添加？', '', {
					buttons: {
						'添加': function(){
							$(this).dialog("close");
							Context.newcase();
						}
					}
				});
			}
		}
		
	},
	newcase: function(target){
		var html = '<h3><input type="text"></h3><div class="case_rules"></div>';
		$(html).appendTo('#case').find('input').accordionHeadEditor({
			attr: 'casename',
			hint: '请输入环境名称',
			change: Editor.save,
			keepValue: false,
			check: function(name){
				if ($('#case h3[casename="' + name + '"]').size()) {
					return '重复的环境名，请输入一个不同的名称';
				}
				return true;
			}
		});
		$("#case").accordion("destroy").accordion({
			collapsible: true,
			autoHeight: false,
			active: 'h3:last',
			icons: false,
			change: Editor.save
		});
	},
	delallcase: function(target){
		if ($("#case h3").size()) {
			$.confirm('真的要删除所有环境吗？', '', {
				buttons: {
					'删除': function(){
						$("#case").accordion("destroy").empty();
						$(this).dialog("close");
					}
				}
			});
		} else {
			$.message('环境像那东流水，离我远去不可留');
		}
	}
};
var Editor = {
	//渲染DOM
	renderDom: function(json){
		Editor.renderHosts(json.hosts);
		Editor.renderCases(json.cases);
	},
	//渲染hosts
	renderHosts: function(json){
		$('#main').html(Editor.genHostsHtml(json));
	},
	//渲染Cases
	renderCases: function(json){
		//json = jsonCasesData;//for debug
		var arHtml = [];
		$.each(json, function(caseName, o){
			arHtml.push(['<h3 casename="', caseName, '" active="', !!o.active, '"><a href="">', caseName, '</a></h3><div class="case_rules">', Editor.genHostsHtml(o.r), '</div>'].join(''));
		});
		$('#case').html(arHtml.join(''));
	},
	//根据host的json结构{dm1:[{},{},{}],dm2:[{},{},{}]}生成html
	genHostsHtml: function(json){
		var arHtml = [], temp = '<dd ip="{i}" sharp="{s}">{i}</dd><div class="useless"></div>';
		$.each(json, function(dm, o){
			arHtml.push(['<dl class="ui-corner-all"', o.p ? (' style="left:' + o.p.left + 'px; top:' + o.p.top + 'px;"') : '', '><dt class="ui-widget" domain="', dm, '">', dm, '</dt>', $.format(temp, o.r || o), '</dl>'].join(''));
		});
		return arHtml.join('');
	},
	//从指定的dom容器中返回json格式的hosts数据
	getHostsData: function($container){
		var $container = $container || $('#main'), isMain = $container.attr('id') == 'main', $dlHosts = $container.find("dl"), json = {};
		$dlHosts.each(function(_, dl){
			var $dt = $('dt', dl), $dds = $('dd', dl), dm = $dt.attr('domain');
			json[dm] = {
				p: isMain ? $(dl).position() : {
					"top": 0,
					"left": 0
				},
				r: []
			};
			$dds.each(function(_, $dd){
				$dd = $($dd);
				json[dm].r.push({
					s: $dd.hasClass('ui-state-active') ? '' : '#',
					i: $dd.attr('ip'),
					d: dm,
					c: ''
				});
			});
		});
		return json;
	},
	getCasesData: function(){
		var $dlCases = $("#case h3"), json = {};
		$dlCases.each(function(_, head){
			var $head = $(head);
			json[$head.attr('casename')] = {
				r: Editor.getHostsData($head.next()),
				active: $head.hasClass('ui-state-active')
			};
		});
		return json;
	},
	getHostsText: function(json){
		var ar = ['\r\n'];
		$.each(json || Editor.getHostsData(), function(dm, c){
			$.each(c.r, function(_, o){
				ar[o.s ? 'push' : 'unshift'](o.s + o.i + ' ' + dm);
			});
		});
		return ar.join('\r\n');
	},
	getFileTextFromDom: function(){
		Json.hosts = Editor.getHostsData();
		Json.cases = Editor.getCasesData();
		return ['#WELL#', JSON.stringify(Json), '\r\n##※温馨提示：亲，第一行内容为HostEditor4.0软件的配置，非懂勿动※##\r\n\r\n', Editor.getHostsText(Json.hosts)].join('');
	},
	save: function(){
		$.message('保存成功');
		return File.writeHost(Editor.getFileTextFromDom());
	},
	initBehavior: function(json){
	
		$("#case").accordion({
			collapsible: true,
			autoHeight: false,
			active: '[active="true"]:first',
			icons: false,
			change: function(evt, ui){
				var isExpand = ui.newContent.size(), $div = isExpand ? ui.newContent : ui.oldContent, data = Editor.getHostsData($div);
				$.each(data, function(dm, json){
					//alert($('#main dt[domain="' + dm + '"]').size());
					$('#main dt[domain="' + dm + '"]').parent().accordion('activate', isExpand ? ('dd[ip="' + json.r[0].i + '"]') : false);
				});
				Editor.save();
			}
		});
		
		var $dlHosts = $("#main dl");
		$dlHosts.accordion({
			collapsible: true,
			autoHeight: false,
			header: 'dd',
			active: '[sharp=""]:first',
			icons: false,
			change: function(evt, ui){
			
				Editor.save();
			}
		});
		
		if (json.firstRun) {
			$('#main').masonry({
				isResizable: false,
				itemSelector: 'dl',
				isAnimated: true
			});
			delete json.firstRun;
		}
		
		$dlHosts.draggable({
			cursor: 'move',
			handle: 'dt',
			opacity: 0.3,
			containment: 'parent',
			grid: [5, 3],
			stop: function(){
				Editor.save();
			}
		});
		
		var $cmenu = $('#div_rule_cmenu');
		
		$("#main dd").contextMenu('div_rule_cmenu', {
			onShowMenu: function(evt, menu){
				$('li:not(.rule)', menu).remove();
				return menu;
			},
			bindings: Context
		});
		
		$("#main dt").contextMenu('div_rule_cmenu', {
			onShowMenu: function(evt, menu){
				$('li:not(.domain)', menu).remove();
				return menu;
			},
			bindings: Context
		});
		
		$("#case").contextMenu('div_rule_cmenu', {
			onShowMenu: function(evt, menu){
				$('li:not(.casecont)', menu).remove();
				return menu;
			},
			bindings: Context
		});
		
		$("#case h3").contextMenu('div_rule_cmenu', {
			onShowMenu: function(evt, menu){
				$('li:not(.casehead)', menu).remove();
				return menu;
			},
			bindings: Context
		});
		
		$("#case div").contextMenu('div_rule_cmenu', {
			onShowMenu: function(evt, menu){
				$('li:not(.casehead)', menu).remove();
				return menu;
			},
			bindings: Context
		});
		
		$("#main").contextMenu('div_rule_cmenu', {
			onShowMenu: function(evt, menu){
				$('li:not(.hostcont)', menu).remove();
				return menu;
			},
			bindings: Context
		});
	}
};

(function(){
	var shell = new ActiveXObject("WScript.Shell"), fso = new ActiveXObject("Scripting.FileSystemObject");
	var sysroot = shell.RegRead('HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\SystemRoot');
	var hostpath = sysroot + "\\system32\\drivers\\etc\\hosts";
	var rRules = /^(#)*\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})((?:\s+[^#\s]+)+)(?:\s*#(.*))?$/;
	
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
			return /^#WELL#(.*)/.test(text) && RegExp.$1;
		},
		getJsonFromText: function(text){
			var ar = $.trim(text).split(/(\s*\n)+\s*/), m, o = {};
			$.each(ar, function(i, t){
				if (m = rRules.exec($.trim(t))) {
					$.each($.trim(m[3]).split(/\s/), function(j, d){
						var ip = m[2];
						$.grep(o[d] = o[d] ||
						{
							p: {
								"top": 0,
								"left": 0
							},
							r: []
						}, function(n, i){
							return n.i == ip;
						}).length ||
						o[d].r.push({
							s: m[1] || '',
							i: ip,
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
					firstRun: true,
					size: {
						width: 900,
						height: 680
					},
					cases: {},
					hosts: File.getJsonFromText(text)
				};
			}
			return Json;
		}
	};
	window.Json = null;
})();

function init(){
	var ds = +new Date;
	if (!File.isHostsThere()) {
		return alert('程序找不到hosts文件');
	}
	
	var text = $.trim(File.readHost()), $bdy = $('body');
	Json = File.readConfig(text);
	
	//调整窗口大小、位置，调整布局
	Wnd.setRect(Json.size.width, Json.size.height);
	
	//see(json);
	
	//$bdy.hide();
	Editor.renderDom(Json);
	//$bdy.show();
	Editor.initBehavior(Json);
	
	//see(Editor.serializeHosts())
	//see(Editor.getFileTextFromDom())
	
	//Editor.save();
	//$.message('spend: ' + (new Date() - ds));
	
	return;
	
	$("#main").bind('selectstart', function(){
		return false;
	});
	
}

//$(init);

init();
