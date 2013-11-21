//初始化窗口大小和位置
var Wnd = {
	setRect: function(w, h){
		var sw = screen.availWidth, sh = screen.availHeight, bdy = document.body;
		try {
			resizeTo(w, h);
			resizeTo(w = w + w - bdy.clientWidth, h = h + h - bdy.clientHeight);
			moveTo(Math.max((sw - w) / 2, 0), (sh - h) / 2);
		} catch (ex) {
		}
	}
};

$(function(){
	Wnd.setRect(1024, 768);
});
