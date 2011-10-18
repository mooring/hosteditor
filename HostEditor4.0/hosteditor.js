var Editor = {
	main: $('#main'),
	env: $('#env'),
	foot: $('#foot'),
	
	//渲染DOM
	renderDom: function(json){
		Editor.renderHosts(json.hosts);
		Editor.renderEnvs(json.envs);
	},
	//渲染hosts
	renderHosts: function(json){
		var $dls = $(Editor.genHostsHtml(json));
		$dls.each(function(){
			Host.enabled($('dd[sharp=""]:first', this));
		});
		$dls.appendTo('#main');
		Editor.draggable();
		
		
	},
	//渲染Envs
	renderEnvs: function(json){
		$('#env').append($.map(json, function(o, envName){
			return ['<h3 envname="', envName, '" active="', !!o.active, '"><a href="">', envName, '</a></h3><div class="env_rules">', Editor.genHostsHtml(o.r), '</div>'].join('');
		}).join(''));
	},
	//根据host的json结构{dm1:[{},{},{}],dm2:[{},{},{}]}生成html
	genHostsHtml: function(json){
		var temp = '<dd class="ui-corner-all" ip="{i}" sharp="{s}">{i}</dd>';
		return $.map(json, function(o, dm){
			return ['<dl class="ui-corner-all" domain="', dm, '"', o.p ? (' style="left:' + o.p.left + 'px; top:' + o.p.top + 'px;"') : '', '><dt class="ui-widget" domain="', dm, '">', dm, '</dt>', $.format(temp, o.r || o), '</dl>'].join('');
		}).join('');
	},
	//从指定的dom容器中返回json格式的hosts数据
	getHostsData: function($container){
		var $container = $container || $('#main'), isMain = $container.attr('id') == 'main', $dlHosts = $container.find("dl"), json = {};
		$dlHosts.each(function(_, dl){
			var $dl = $(dl), $dds = $dl.find('dd'), dm = $dl.attr('domain');
			json[dm] = {
				p: isMain ? $dl.position() : {
					"top": 0,
					"left": 0
				},
				r: []
			};
			$dds.each(function(_, dd){
				var $dd = $(dd);
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
	getEnvsData: function(){
		var $dlEnvs = $("#env h3"), json = {};
		$dlEnvs.each(function(_, head){
			var $head = $(head);
			json[$head.attr('envname')] = {
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
		Json.envs = Editor.getEnvsData();
		return ['#WELL#', JSON.stringify(Json), '\r\n##※温馨提示：亲，第一行内容为HostEditor4.0软件的配置，非懂勿动※##\r\n\r\n', Editor.getHostsText(Json.hosts)].join('');
	},
	save: function(){
		$.message('保存成功');
		return File.writeHost(Editor.getFileTextFromDom());
	},
	draggable: function($elem){
		($elem || $("#main dl")).draggable({
			cursor: 'move',
			handle: 'dt',
			opacity: 0.5,
			containment: 'parent',
			//grid: [5, 5],
			stop: function(){
				//Editor.save();
			}
		});
	},
	initBehavior: function(json){
		json.firstRun && $('#main').masonry() && delete json.firstRun;
		
		$('#main').find('dd').live('click', function(evt){
			var $dd = $(this);
			Host[Host.isEnabled($dd) ? 'disabled' : 'enabled']($dd);
		});
		
		Editor.initFootBar();
		
		//$('button').click();
		
		return;
		//see($("#main dl").first().outerWidth());
		$('#main dl:first').clone().appendTo('#main').css({
			top: 200,
			left: 200
		});
		Editor.draggable();
		
	},
	initFootBar: function(){
		$('#foot *[command]').click(function(evt){
			Cmd[$(this).attr('command')].apply(this, [evt]);
			evt.preventDefault();
		});
		var Cmd = {
			openAddWin: function(evt){
				$('<textarea class="add-hosts-area"></textarea>').dialog({
					title: '请输入：',
					onShow: function(dialog){
						Host.paste(dialog.data.find('textarea'));
					},
					buttons: [{
						html: '添加为方案',
						click: function(evt, $cont){
						
						}
					}, {
						html: '添加',
						close: true,
						click: function(evt, $cont){
							var txt = $cont.find('textarea').val(), json = Host.getJsonFromText(txt), num = 0;
							$.each(json, function(dm, o){
								var $dl;
								if (($dl = $('#main dl[domain="' + dm + '"]')).size()) {
									//去重
									o.r = $.grep(o.r, function(obj){
										return !$dl.find('dd[ip="' + obj.i + '"]').size();
									});
									var temp = '<dd class="ui-corner-all" ip="{i}" sharp="{s}">{i}</dd>';
									$dl.find('dt').after($.format(temp, o.r));
								} else {
									var tmpObj = {};
									tmpObj[dm] = o;
									delete o.p;
									$dl = $(Editor.genHostsHtml(tmpObj)).appendTo('#main').css({
										right: 5 + 133 * num++,
										bottom: 5
									});
								}
							});
							
							Editor.draggable();
						}
					}, {
						html: '关闭',
						attr: {
							'class': 'simplemodal-close'
						}
					}]
				});
			}
		}
	}
};

var Host = {
	selected: 'selected',
	isEnabled: function($dd){
		return $dd.hasClass(Host.selected);
	},
	enabled: function(json){
		var $dd = json && json.size ? $(json) : Host.getItemElement(json);
		if ($dd.size() && !Host.isEnabled($dd)) {
			$dd.parent().find('dd').removeClass(Host.selected);
			$dd.addClass(Host.selected);
		}
	},
	disabled: function(json){
		var $dd = json && json.size ? json : Host.getItemElement(json);
		if ($dd.size() && Host.isEnabled($dd)) {
			$dd.removeClass(Host.selected);
		}
	},
	getGroupElement: function(json){
		return $('#main dl[domain="' + json.d + '"]');
	},
	getItemElement: function(json){
		return Host.getGroupElement(json).find('dd[ip="' + json.i + '"]');
	},
	paste: function($tar){
		var txt = window.clipboardData.getData("text") || '';
		txt = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(txt) ? txt : '';
		return txt && $tar && $tar.val(txt);
	},
	rRules: /^(#)*\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})((?:\s+[^#\s]+)+)(?:\s*#(.*))?$/,
	getJsonFromText: function(text){
		var ar = $.trim(text).split(/(\s*\n)+\s*/), m, o = {};
		$.each(ar, function(i, t){
			if (m = Host.rRules.exec($.trim(t))) {
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

function init(){
	if (!File.isHostsThere()) {
		return $.alert('不好意思, 程序找不到hosts文件');
	}
	
	var text = $.trim(File.readHost());
	
	Json = Host.readConfig(text);
	
	//调整窗口大小、位置，调整布局
	Wnd.setRect(Json.size.width, Json.size.height);
	
	Editor.renderDom(Json);
	Editor.initBehavior(Json);
	
}

$(init);
