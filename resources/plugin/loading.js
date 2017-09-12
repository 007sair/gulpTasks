/*
 * Loading
 * 1. loading初始只插入css
 * 2. 多tab时需主动插入html  如果没有  就插入再显示 有就直接显示
 */

function Loading(options) {
	//config
	this.opts = $.extend({}, {
		styleId: '__styleLoading__',
		className: '__loading__',
		icon: 'https://img.miyabaobei.com/d1/p4/2016/11/28/0e/c1/0ec12ebad6c4e9d7bb53467455158410024083338.png',
		size: 20,
		html: '<i></i><span>加载中, 请稍后...</span>'
	}, options);

	/**
	 * loading状态
	 * 0 可用状态
	 * 1 loading中
	 */
	this.status = 0;

	this.className = this.opts.className;

	/**
	 * 定义loading所在位置 默认在body中
	 * 多tab时，切换tab可让loading分别位于每个容器中
	 */
	this.container = $('body');
}

Loading.prototype = {
	constructor: Loading,
	init: function() {
		this.insertCSS();
	},
	/* 插入样式
	 * .__loading__{text-align:center;font-size:12px;color:#666;line-height:44px;visibility:hidden}
	 * .__loading__ i{margin-right:8px;background:url(icon.png) no-repeat;background-size:20px;width:20px;height:20px}
	 * .__loading__ *{display:inline-block;vertical-align:middle;}
	 * .__loading__ input{border:1px solid #f2f2f2;padding:0 40px;height:44px}
	 */
	insertCSS: function() {
		if(document.getElementById(this.opts.styleId)) return false;
		var style = document.createElement('style');
		style.id = this.opts.styleId;
		var styles = [
			'.'+ this.className +'{text-align:center;font-size:12px;color:#666;line-height:'+ parseInt(this.opts.size + 24) +'px;visibility:hidden}',
			'.'+ this.className +' i{margin-right:8px;background:url('+ this.opts.icon +') no-repeat;background-size:'+ this.opts.size +'px;width:'+ this.opts.size +'px;height:'+ this.opts.size +'px}',
			'.'+ this.className +' *{display:inline-block;vertical-align:middle;}',
			'.'+ this.className +' input{border:1px solid #f2f2f2;padding:0 40px;height:'+ parseInt(this.opts.size + 24) +'px}'
		];
		style.innerHTML = styles.join('');
		document.getElementsByTagName('head')[0].appendChild(style);
	},
	insert: function() {
		this.loading = null;
		if (!this.container.find('.' + this.className).length) {
			this.container.append('<div class="'+ this.className +'">'+ this.opts.html +'</span></div>');
		}
		this.loading = this.container.find('.' + this.className);
	},
	show: function() {
		this.insert();
		this.loading.html(this.opts.html).css('visibility', 'visible');
		this.status = 1;
	},
	hide: function() {
		this.loading.css('visibility', 'hidden');
		this.status = 0;
	},
	remove: function() {
		this.loading.remove();
		this.status = 0;
	},
	inform: function(str) {
		this.loading.html(str);
		this.status = 0;
	},
	isLoading: function() {
		if (this.status == 1) {
			return true
		}
		return false;
	}
};

if (typeof module != 'undefined' && module.exports) {
	module.exports = Loading;
}

window.Loading = Loading;