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
var Editor = {
	renderDom: function(json){
		Editor.renderHosts(json.hosts);
		Editor.renderCases(json.cases);
	},
	renderHosts: function(json){
		var arHtml = [], temp = '<dd ip="{i}" sharp="{s}">{i}</dd><div class="useless"></div>';
		$.each(json, function(k, ar){
			arHtml.push(['<dl class="ui-corner-all"><dt class="ui-widget" domain="', k, '">', k, '</dt>', $.format(temp, ar), '</dl>'].join(''));
		});
		$('#main').html(arHtml.join(''));
	},
	getHostsData: function(){
		var $dlHosts = $("#main dl"), json = {};
		$dlHosts.each(function(_, dl){
			var $dt = $('dt', dl), $dds = $('dd', dl), dm = $dt.attr('domain');
			json[dm] = [];
			$dds.each(function(_, $dd){
				$dd = $($dd);
				json[dm].push({
					s: $dd.hasClass('ui-state-active') ? '' : '#',
					i: $dd.attr('ip'),
					d: dm,
					c: ''
				})
			});
		});
		return json;
	},
	renderCases: function(json){
		json = jsonCasesData;//for debug
		var arHtml = [], temp = '<dl><dt>{d}</dt><dd>{i}</dd></dl>';
		$.each(json, function(k, ar){
			arHtml.push(['<h3><a href="">', k, '</a></h3><div class="case_rules">', $.format(temp, ar), '</div>'].join(''));
		});
		$('#case').html(arHtml.join(''));
	},
	getCasesData: function(){
		var $dlHosts = $("#main dl"), json = {};
		$dlHosts.each(function(_, dl){
			var $dt = $('dt', dl), $dds = $('dd', dl), dm = $dt.attr('domain');
			json[dm] = [];
			$dds.each(function(_, $dd){
				$dd = $($dd);
				json[dm].push({
					s: $dd.hasClass('ui-state-active') ? '' : '#',
					i: $dd.attr('ip'),
					d: dm,
					c: ''
				})
			});
		});
		return json;
	},
	initHandler: function(json){
		$("#case").accordion({
			collapsible: true,
			autoHeight: false,
			active: false,
			icons: false
		});
		
		var $dlHosts = $("#main dl");
		$dlHosts.accordion({
			collapsible: true,
			autoHeight: false,
			animated: false,
			header: 'dd',
			active: '[sharp=""]:first',
			icons: false,
			change: function(evt, ui){
				//$.message(ui.newHeader.attr('class'));
			}
		});
		
		if (json.firstRun) {
			//自动排列
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
			grid: [5, 3]
		});
		/*
		 $dlHosts.find('dd').draggable({
		 cursor: 'move',
		 handle: 'dt',
		 opacity: 0.6,
		 containment: 'body',
		 grid: [5, 3],
		 delay: 100,
		 helper: 'clone',
		 scope: 'body',
		 zIndex: 999
		 });
		 */
		$("#main dd,#main dt").contextMenu('div_rule_cmenu', {
			bindings: {
				copy: function(target){
					var $t = $(target);
					if (target.nodeName == 'DD') {
						copy($t.attr('ip') + ' ' + $t.parent().find('dt').attr('domain')) && $.message('复制成功!');
					} else {
						var d = $t.text(), $dl = $t.parent(), ar = [];
						$dl.find('dd').each(function(i, dd){
							ar.push(dd.innerHTML + ' ' + d);
						});
						copy(ar.join('\n')) && $.message('复制成功!');
					}
				},
				edit: function(target){
					var $t = $(target);
					$t.html('<input type="text">').find('input').val($t.attr('ip')).blur(function(){
						//如果是合法的ip地址，并且没有和已有的重复
						$t.html(this.value).attr('ip', this.value);
					}).select().click(function(evt){
						evt.stopPropagation();
					}).keydown(function(evt){
						evt.stopPropagation();
					}).keypress(function(evt){
						if (evt.keyCode == 13) {
							this.blur();
						}
					});
				},
				remove: function(target){
					var $t = $(target);
					if (target.nodeName == 'DD') {
						$t.fadeOut(function(){
							$t.remove();
						});
					} else {
						var $dl = $t.parent();
						$dl.fadeOut(function(){
							$dl.remove();
						});
					}
				}
			}
		});
		
		
		$("#case").contextMenu('div_rule_cmenu', {
			bindings: {
				newcase: function(target){
					var $elems = $('<h3><input type="text" value="请输入环境名称"></h3><div class="case_rules"></div>').appendTo('#case');
					var $h3 = $elems.filter('h3');
					$h3.find('input').blur(function(){
						$h3.html('<a href="">' + $.htmlEncode(this.value) + '</a>');
						
						$("#case").accordion("destroy").accordion({
							collapsible: true,
							autoHeight: false,
							active: 'h3:last',
							icons: false,
							create: function(){
								$("#case div.case_rules").droppable({
									drop: function(){
										alert('dropped');
									}
								});
								
							}
						});
						
					}).select().click(function(evt){
						evt.stopPropagation();
					}).keydown(function(evt){
						evt.stopPropagation();
					}).keypress(function(evt){
						if (evt.keyCode == 13) {
							this.blur();
						}
					});
					
				},
				rmallcase: function(target){
					$("#case").accordion("destroy").empty();
				}
			}
		});
		
		$("#case h3").contextMenu('div_rule_cmenu', {
			bindings: {
				copy: function(target){
				
				},
				remove: function(target){
					var $t = $(target);
					$t.add(target.nodeName == 'DIV' ? $t.prev() : $t.next()).remove();
				}
			}
		});
		$("#case div").contextMenu('div_rule_cmenu', {
			bindings: {
				copy: function(target){
				
				},
				remove: function(target){
				}
			}
		});
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
						var ip = m[2];
						o[d] || (o[d] = []);
						$.grep(o[d], function(n, i){
							return n.i == ip;
						}).length ||
						o[d].push({
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
					cases: [],
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
	
	$bdy.hide();
	Editor.renderDom(Json);
	$bdy.show();
	Editor.initHandler(Json);
	
	
	//see(Editor.serializeHosts())
	
	$.message('spend: ' + (new Date() - ds));
	return;
	
	$("#main").bind('selectstart', function(){
		return false;
	});
	
}

//$(init);

init();
