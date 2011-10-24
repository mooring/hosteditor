var Editor = {
	main: $('#main'),
	env: $('#env'),
	foot: $('#foot'),
	
	getGroupElement: function(json){
		return Editor.main.find('dl[domain="' + json.d + '"]');
	},
	getItemElement: function(json){
		return (json.jquery ? json : Editor.getGroupElement(json)).find('dd[ip="' + json.i + '"]');
	},
	//渲染DOM
	renderDom: function(json){
		Editor.renderHosts(json.hosts, json.firstRun);
		delete json.firstRun;
		Editor.renderEnvs(json.envs);
	},
	//渲染hosts
	renderHosts: function(json, firstRun){
		var isEmpty, $dls, $dl, temp = '<dd class="ui-corner-all" ip="{i}" sharp="{s}">{i}</dd>';
		if (!(isEmpty = !Editor.main.find('dl').size())) {
			$.each(json, function(dm, o){
				if (($dl = Editor.getGroupElement(o.r[0])).size()) {
					//去重
					o.r = $.grep(o.r, function(obj){
						var $dd = $dl.find('dd[ip="' + obj.i + '"]'), isExist = !!$dd.size();
						isExist && Host[obj.s ? 'disable' : 'enabled']($dd);
						return !isExist;
					});
					if (o.r.length) {
						$dl.find('dt').after($.format(temp, o.r));
					}
					delete json[dm];
				}
			});
		}
		
		$dls = $(Editor.genHostsHtml(json)).each(function(){
			Host.enabled($('dd[sharp=""]:first', this));
		}).appendTo(Editor.main);
		
		$dls.size() &&
		$dls.masonry({
			reverse: !firstRun && !isEmpty
		});
		
		Editor.rulesDraggable($dls);
		return $dls;
	},
	//渲染Envs
	renderEnvs: function(json){
		var html = $.map(json, function(o, envName){
			return ['<h3 class="ellipsis" envname="', envName, '" active="', !!o.active, '">', envName, '</h3><div class="env_rules">', Editor.genHostsHtml(o.r), '</div>'].join('');
		}).join('');
		return $(html).appendTo(Editor.env);
	},
	//根据host的json结构{dm1:[{},{},{}],dm2:[{},{},{}]}生成html
	genHostsHtml: function(json){
		var temp = '<dd class="ui-corner-all" ip="{i}" sharp="{s}">{i}</dd>';
		return $.map(json, function(o, dm){
			return ['<dl class="ui-corner-all" domain="', dm, '"', o.p ? (' style="left:' + o.p.left + 'px; top:' + o.p.top + 'px;"') : '', '><dt class="ellipsis" domain="', dm, '">', dm, '</dt>', $.format(temp, o.r || o), '</dl>'].join('');
		}).join('');
	},
	//从指定的dom容器中返回json格式的hosts数据
	getHostsData: function($container){
		var $container = $container || Editor.main, isMain = $container.attr('id') == 'main', $dlHosts = $container.find("dl"), json = {};
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
		return File.writeHost(Editor.getFileTextFromDom()), $.message('保存成功');
	},
	rulesDraggable: function($elem){
		($elem || Editor.main.find("dl")).draggable({
			cursor: 'move',
			handle: 'dt',
			opacity: 0.75,
			containment: 'parent',
			stack: 'dl',
			stop: function(){
				//Editor.save();
			}
		});
		
		($elem || Editor.main).find("dd").draggable({
			helper: 'clone',
			appendTo: 'body',
			scroll: false,
			opacity: 0.75,
			revert: 'invalid',
			revertDuration: 200,
			stop: function(){
				//Editor.save();
			}
		});
		
		($elem || Editor.main.find("dl")).droppable({
			accept: 'dd',
			greedy: true,
			tolerance: 'pointer',
			hoverClass: 'drophover',
			drop: function(evt, ui){
				var tar = evt.target, $tar = $(tar), dm = $tar.attr('domain'), ip = ui.draggable.attr('ip'), txt;
				if ($tar.find('dd[ip="' + ip + '"]').size()) {
					if ($.contains(tar, ui.draggable[0])) {
						copy(txt = ip + ' ' + dm);
						$.message('已复制：' + txt);
					} else {
						$.message('域名' + dm + '下已经有ip为' + ip + '的配置了');
					}
				} else {
					Host.disable(ui.draggable.clone().hide()).appendTo(evt.target).slideDown();
					Editor.rulesDraggable($tar);
					$.message('复制域名成功');
				}
			}
		});
	},
	envsDraggable: function($elem){
	
	},
	initFootBar: function(){
		Editor.foot.find('*[id]').click(function(evt, fn){
			(fn = Cmd[$(this).attr('id')]) && fn.apply(this, [evt]);
		});
		
		Editor.foot.find('*[expand]').click(function(evt){
			var $el = $(this).hide(), expandType = $el.attr('expand'), $tars = $el.siblings('.' + expandType), $bdy = $('body');
			$el.parent().click();
			var turnBack = function(evt){
				$tars.hide(), $el.fadeIn();
				$tars.add($bdy).unbind('click', turnBack);
			};
			$tars.fadeIn().add($bdy).one('click', turnBack);
			return false;
		});
	},
	initBehavior: function(json){
		$('div.watermark').fadeIn();
		
		Editor.main.find('dd').live('click', function(evt){
			var $dd = $(this);
			Host[Host.isEnabled($dd) ? 'disable' : 'enabled']($dd);
		});
		
		Editor.main.editable({
			attr: 'ip',
			create: function($dd){
				$.message('请输入IP地址');
			},
			check: function(val, $dd, backup){
				var rIp = /^(0|[1-9]\d?|1\d\d|2[0-4]\d|25[0-5])\.(0|[1-9]\d?|1\d\d|2[0-4]\d|25[0-5])\.(0|[1-9]\d?|1\d\d|2[0-4]\d|25[0-5])\.(0|[1-9]\d?|1\d\d|2[0-4]\d|25[0-5])$/;
				if (!rIp.test(val)) { return '错误的格式，请输入正确格式的IP地址'; }
				if ($dd.parent().find('dd[ip="' + val + '"]').not($dd).size()) { return '重复的IP，请输入一个不同的IP地址'; }
				return true;
			},
			complete: function(val, $dd, backup){
				if (val != backup) {
					//Editor.save();
					$.message('保存成功');
				}
			}
		});
		
		Editor.main.droppable({
			accept: 'dd',
			greedy: true,
			tolerance: 'pointer',
			drop: function(evt, ui){
				var $tar = ui.draggable, $dl = $tar.parent(), dm = $dl.attr('domain'), ip = $tar.attr('ip');
				$.confirm('确定要删除 “' + ip + ' ' + dm + '” 吗？', {
					onOk: function(){
						$tar.slideUp(200, function(){
							$tar.remove();
							$.message('删除成功');
							//Editor.save();
						});
					}
				});
			}
		});
		
		
		Editor.env.editable({
			selector: 'h3',
			attr: 'envname',
			create: function($h){
				$.message('请输入环境名称');
			},
			check: function(val, $h, backup){
				if (!val) { return '亲，环境都得有个名的'; }
				if (Editor.env.find('h3[envname="' + val + '"]').not($h).size()) { return '亲，环境名重复了，换一个吧'; }
				return true;
			},
			complete: function(val, $h, backup){
				if (val != backup) {
					//Editor.save();
					$.message('保存成功');
				}
			}
		});
		
		Editor.env.droppable({
			accept: 'dd',
			greedy: true,
			tolerance: 'pointer',
			drop: function(evt, ui){
				var $tar = ui.draggable, $dl = $tar.parent(), dm = $dl.attr('domain'), ip = $tar.attr('ip');
				//创建一个新的环境，并把当前规则添加到新环境中
				var json = {};
				json[dm] = {
					s: '',
					i: ip,
					d: dm,
					c: ''
				};
				var $curr = Editor.renderEnvs({
					'请输入环境名称': {
						active: true,
						r: json
					}
				});
				
				$curr.filter('h3').trigger('contextmenu');
				
				Editor.env.accordion({
					active: $curr.filter('h3')
				});
			}
		});
		
		Editor.env.accordion({
			active: '[active="true"]'
		});
		
		Editor.initFootBar();
		
		return;
	}
};

(function($){
	function Accordion(cont, opt){
		this.options = opt;
		this.$cont = $(cont);
		this.$headers = this.$cont.find(this.options.headerSelector);
		this.$contents = this.$headers.next();
		this.init();
	}
	Accordion.prototype = {
		init: function(){
			this.$contents.hide();
			this.$cont.addClass('ui-accordion');
			this.$headers.addClass('ui-accordion-header ui-corner-all');
			this.$contents.addClass('ui-accordion-content ui-corner-bottom');
			
			if (this.options.active) {
				this.enable(this.options.active);
			}
			var me = this;
			this.$headers.die().live('click', function(evt){
				me.toggle($(this));
			});
		},
		toggle: function(selector){
			var $header = selector.jquery ? selector : this.$headers.filter(selector).first(), selected = $header.hasClass(this.options.selectedClass);
			this[selected ? 'disable' : 'enable']($header);
			return selected;
		},
		enable: function(selector){
			var $header = selector.jquery ? selector : this.$headers.filter(selector).first();
			if ($header.size() && !$header.hasClass(this.options.selectedClass)) {
				if (this.latest) {
					this.latest.filter($header).size() || this.disable(this.latest);
				}
				$header.removeClass('ui-corner-all').addClass(this.options.selectedClass + ' ui-corner-top');
				$header.next().slideDown(200);
				this.latest = $header;
			}
		},
		disable: function(selector){
			var me = this, $header = selector.jquery ? selector : this.$headers.filter(selector).first();
			if ($header.size() && $header.hasClass(this.options.selectedClass)) {
				this.latest = null;
				$header.next().slideUp(200, function(){
					$header.removeClass(me.options.selectedClass + ' ui-corner-top').addClass('ui-corner-all');
				});
			}
		},
		collapseLast: function(){
			this.latest && this.disable(this.latest);
		},
		distroy: function(){
			this.$headers.die().removeClass(this.options.selectedClass + ' ui-corner-top').addClass('ui-corner-all');
		}
	};
	
	$.fn.accordion = function(opt){
		if (typeof(opt) == 'string') {
			var inst = $(this).data('accordion');
			if (inst instanceof Accordion) {
				inst[opt]($.makeArray(arguments).slice(1));
			}
		} else {
			opt = $.extend({
				headerSelector: 'h3',
				active: null,
				selectedClass: 'ui-accordion-selected'
			}, opt);
			
			return this.each(function(_, cont){
				var ins = $(this).data('accordion');
				ins && ins.distroy();
				$(this).data('accordion', new Accordion(cont, opt));
			});
		}
	};
})(jQuery);


var Cmd = {
	openFile: function(evt){
		File.openFile();
	},
	openIE: function(evt){
		File.openIE();
	},
	openFolder: function(evt){
		File.openFolder();
	},
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
					var txt = $cont.find('textarea').val(), json = Host.getJsonFromText(txt);
					Editor.renderHosts(json);
				}
			}, {
				html: '关闭',
				attr: {
					'class': 'simplemodal-close'
				}
			}]
		});
	},
	about: function(){
		$.alert('<div class="about"><p>版本：4.0</p><p>作者：梅雪香(meixx)</p><p>日期：2011-11-11</p><p>网址：<a href="http://www.mjser.com/">官方网站</a></p><p>募捐：支付宝：wy_hd@163.com</p><p>　　　财付通：4948750</p></div>', {
			title: '关于HostEditor'
		});
	}
};

function init(){
	if (!File.isHostsThere()) { return $.alert('不好意思, 程序找不到hosts文件'); }
	
	var text = $.trim(File.readHost());
	
	Json = Host.readConfig(text);
	
	//调整窗口大小、位置，调整布局
	Wnd.setRect(Json.size.width, Json.size.height);
	
	Editor.renderDom(Json);
	Editor.initBehavior(Json);
	
}

$(init);

/*

 * 添加为环境

 * 添加一个新环境（拖动一条规则到env）

 * 删除一个环境

 * 添加规则到一个环境

 * 从一个环境删除一条规则

 * 复制一个环境

 * 打开一个环境时同步展示右边的规则

 * 选择一个规则时同步展示左边的环境

 * 删除一个规则时，检查是否该规则在环境中

 * 规则锁定功能，不受环境切换的影响

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

 */

