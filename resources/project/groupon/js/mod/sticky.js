/**
 * position sticky
 */

var utils = require('./utils.js');

function Sticky($elem, options) {
	this.$elem = $elem;
	this.opts = $.extend(true, {
		top: 0, //当前元素fix的位置
		zIndex: 1000
	}, options);

	this.flag = 0; //just run once
	this.offsetTop = 0; //元素距顶部的绝对距离
	this.isFixed = false; //是否处于定位状态

	this.init();
}

Sticky.prototype = {
	init: function () {
		if (!$ || !this.$elem.length) {
			return false;
		};
		var me = this;

		me.offsetTop = me.$elem.offset().top;

		if (this.isSupport()) {
			me.$elem.addClass('sticky').css({
				'top': me.opts.top,
				'z-index': me.opts.zIndex
			}).data('z-index', me.opts.zIndex);
		}

		window.addEventListener('scroll', function () {
			var st = $(this).scrollTop();
			if (st == 0) {
				me.unfixed();
			} else {
				if (st > me.offsetTop - parseInt(me.opts.top)) {
					me.fixed();
					me.isFixed = true;
				} else {
					//非定位的那段距离里滑动时获取最新的top值
					//防止top值在滑动过程中被修改  优化，需要节流函数
					var temp_top = me.$elem.offset().top;
					if (temp_top !== me.offsetTop) {
						me.offsetTop = temp_top;
					};
					me.unfixed();
					me.isFixed = false;
				}
			}
		});
	},
	fixed: function () {
		var me = this;
		if (me.flag || me.isSupport()) return;
		me.placeShow();
		me.$elem.css({
			'position': 'fixed',
			'width': '100%',
			'left': 0,
			'top': me.opts.top,
			'z-index': me.opts.zIndex
		});
		me.flag = 1;
	},
	unfixed: function () {
		var me = this;
		if (!me.flag || me.isSupport()) return;
		me.placeHide();
		me.$elem.removeAttr('style');
		me.flag = 0;
	},
	isSupport: function () {
		var prefixTestList = ['', '-webkit-'];
		var stickyText = '';
		for (var i = 0; i < prefixTestList.length; i++) {
			stickyText += 'position:' + prefixTestList[i] + 'sticky;';
		}
		// 创建一个dom来检查
		var div = document.createElement('div');
		var body = document.body;
		div.style.cssText = 'display:none;' + stickyText;
		body.appendChild(div);
		var isSupport = /sticky/i.test(window.getComputedStyle(div).position);
		body.removeChild(div);
		div = null;
		return isSupport;
	},
	placeShow: function () {
		if (!this.$place) {
			this.$place = $('<div style="height:' + this.$elem.height() + 'px;">');
			this.$elem.after(this.$place);
		} else {
			this.$place.css('display', 'block');
		}
	},
	placeHide: function () {
		this.$place.css('display', 'none');
	}
};

$.fn.sticky = function (config) {
	return new Sticky(this, config)
};

if (typeof module != 'undefined' && module.exports) {
	module.exports = Sticky;
}
