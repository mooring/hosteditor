/*
 * ContextMenu - jQuery plugin for right-click context menus
 *
 * Author: Chris Domigan
 * Contributors: Dan G. Switzer, II
 * Parts of this plugin are inspired by Joern Zaefferer's Tooltip plugin
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Version: r2
 * Date: 16 July 2007
 *
 * For documentation visit http://www.trendskitchens.co.nz/jquery/contextmenu/
 *
 Usage

 $(elements).contextMenu(String menu_id [, Object settings]); 

You define your menu structure in your HTML markup. For each menu, place an unordered list in a div with class "contextMenu" and the id you will refer to it by (see the examples). The div can be placed anywhere as it will automatically be hidden by the plugin. 
You can have as many menus defined on a page as you like. Each <li> element will act as an option on the menu. Give each <li> a unique id so that actions can be bound to it. 
Note: ContextMenu does not currently support nested menus. This feature may be in an upcoming release.

Parameters

menu_id
	The id of the menu as defined in your markup. You can bind one or more elements to a menu. Eg $("table td").contextMenu("myMenu") will bind the menu with id "myMenu" to all table cells. 
	Note: This behaviour has changed from r1 where you needed a "#" before the id

settings
	ContextMenu takes an optional settings object that lets you style your menu and bind 
	click handlers to each option. ContextMenu supports the following properties in the settings object: 

bindings 
	An object containing "id":function pairs. The supplied function is the action to be 
	performed when the associated item is clicked. The element that triggered the current 
	menu is passed to this handler as the first parameter. 
	Note: This behaviour has changed from r1 where you needed a "#" before the id
menuStyle 
	An object containing styleName:value pairs for styling the containing <ul> menu. 
itemStyle 
	An object containing styleName:value pairs for styling the <li> elements. 
itemHoverStyle 
	An object containing styleName:value pairs for styling the hover behaviour of <li> elements. 
shadow 
	Boolean: display a basic drop shadow on the menu. 
	Defaults to true
eventPosX 
	Allows you to define which click event is used to determine where to place the menu. 
	There are possibly times (particularly in IE6) where you will need to set this to "clientX". 
	Defaults to: 'pageX'
eventPosY 
	Allows you to define which click event is used to determine where to place the menu. There 
	are possibly times (particularly in IE6) where you will need to set this to "clientY". 
	Defaults to: 'pageY'
onContextMenu(event) 
	A custom event function which runs before the context menu is displayed. If the function 
	returns false the menu is not displayed. This allows you to attach the context menu to a 
	large block element (or the entire document) and then filter on right click whether or not 
	the context menu should be shown. 
onShowMenu(event, menu) 
	A custom event function which runs before the menu is displayed. It is passed a reference 
	to the menu element and allows you to manipulate the output before the menu is shown. This 
	allows you to hide/show options or anything else you can think of before showing the context 
	menu to the user. This function must return the menu. 
*/
(function($){

	var menu, shadow, trigger, content, hash, currentTarget;
	var defaults = {
		menuStyle: {
			listStyle: 'none',
			padding: '1px',
			margin: '0px',
			backgroundColor: '#fff',
			border: '1px solid #999',
			width: '100px'
		},
		itemStyle: {
			margin: '0px',
			color: '#000',
			display: 'block',
			cursor: 'default',
			padding: '3px',
			border: '1px solid #fff',
			backgroundColor: 'transparent'
		},
		itemHoverStyle: {
			border: '1px solid #0a246a',
			backgroundColor: '#b6bdd2'
		},
		eventPosX: 'pageX',
		eventPosY: 'pageY',
		shadow: true,
		onContextMenu: null,
		onShowMenu: null
	};
	
	$.fn.contextMenu = function(id, options){
		if (!menu) { // Create singleton menu
			menu = $('<div id="jqContextMenu"></div>').hide().css({
				position: 'absolute',
				zIndex: '500'
			}).appendTo('body').bind('click', function(e){
				e.stopPropagation();
			});
		}
		if (!shadow) {
			shadow = $('<div></div>').css({
				backgroundColor: '#000',
				position: 'absolute',
				opacity: 0.2,
				zIndex: 499
			}).appendTo('body').hide();
		}
		hash = hash || [];
		hash.push({
			id: id,
			menuStyle: $.extend({}, defaults.menuStyle, options.menuStyle || {}),
			itemStyle: $.extend({}, defaults.itemStyle, options.itemStyle || {}),
			itemHoverStyle: $.extend({}, defaults.itemHoverStyle, options.itemHoverStyle || {}),
			bindings: options.bindings || {},
			shadow: options.shadow || options.shadow === false ? options.shadow : defaults.shadow,
			onContextMenu: options.onContextMenu || defaults.onContextMenu,
			onShowMenu: options.onShowMenu || defaults.onShowMenu,
			eventPosX: options.eventPosX || defaults.eventPosX,
			eventPosY: options.eventPosY || defaults.eventPosY
		});
		
		var index = hash.length - 1;
		$(this).bind('contextmenu', function(e){
			// Check if onContextMenu() defined
			var bShowContext = (!!hash[index].onContextMenu) ? hash[index].onContextMenu(e) : true;
			if (bShowContext) 
				display(index, this, e, options);
			return false;
		});
		return this;
	};
	
	function display(index, trigger, e, options){
		var cur = hash[index];
		content = $('#' + cur.id).find('ul:first').clone(true);
		content.css(cur.menuStyle).find('li').css(cur.itemStyle).hover(function(){
			$(this).css(cur.itemHoverStyle);
		}, function(){
			$(this).css(cur.itemStyle);
		}).find('img').css({
			verticalAlign: 'middle',
			paddingRight: '2px'
		});
		
		// Send the content to the menu
		menu.html(content);
		
		// if there's an onShowMenu, run it now -- must run after content has been added
		// if you try to alter the content variable before the menu.html(), IE6 has issues
		// updating the content
		if (!!cur.onShowMenu) 
			menu = cur.onShowMenu(e, menu);
		
		$.each(cur.bindings, function(id, func){
			$('#' + id, menu).bind('click', function(e){
				hide();
				func(trigger, currentTarget);
			});
		});
		
		menu.css({
			'left': e[cur.eventPosX],
			'top': e[cur.eventPosY]
		}).show();
		if (cur.shadow) 
			shadow.css({
				width: menu.width(),
				height: menu.height(),
				left: e.pageX + 2,
				top: e.pageY + 2
			}).show();
		$(document).one('click', hide);
	}
	
	function hide(){
		menu.hide();
		shadow.hide();
	}
	
	// Apply defaults
	$.contextMenu = {
		defaults: function(userDefaults){
			$.each(userDefaults, function(i, val){
				if (typeof val == 'object' && defaults[i]) {
					$.extend(defaults[i], val);
				} else 
					defaults[i] = val;
			});
		}
	};
	
})(jQuery);

$(function(){
	$('div.contextMenu').hide();
});
