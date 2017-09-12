/**
 * 上滑加载更多数据
 * ----------------------
 * 
 */


	//loading
	var Loading = require('./loading.js');

	var WINDOW_HEIGHT = $(window).height();

	var defaults = {
		autoLoad: false, 			//第一次自动加载，默认不加载
		render: function() {}, 		//上滑到条件满足时执行
		afterRender: function() {}
	};

	function ScrollLoad(options) {
		this.opt = $.extend({}, defaults, options);

		this.render = this.opt.render;
		this.afterRender = this.opt.afterRender;
		this.loader = new Loading(this.opt.loading);
		this.timer = null;
		this.isStopLoad = false; //是否禁止滚动事件

		this.init();
	}

	ScrollLoad.prototype = {
		constructor: ScrollLoad,
		init: function() {
			this.loader.init();  //初始化loading，插入loading需要的样式
			this.bindEvent();

			this.opt.autoLoad && this.load();
		},
		/**
		 * 获取当前容器，把loading插入到这个容器下
		 * 多选项卡切换时，需要外部调用并传入当前容器(当前容器为jq对象),再执行load函数
		 * 非多选项卡切换时，可以不调用，loading默认被加到body容器下
		 */
		getContainer: function($container) { //$container jq对象
			this.loader.container = $container || $(document.body);
		},
		/**
		 * 显示loading，调用外部render函数
		 */
		load: function(cb) {
			var me = this;
			this.loader.show();
			clearTimeout(this.timer);
			this.timer = setTimeout(function() {
				me.render(function() {
					cb && cb(); //render后的回调 一般在ajax的success中调用
					me.afterRender();
				})
			}, 500);
		},
		/**
		 * 绑定事件
		 */
		bindEvent: function() {
			var me = this;
			window.addEventListener('scroll', function () {
				if (me.loader.isLoading() || me.isStopLoad) return false;
				var docHeight = $(document).height();
				var scrollTop = $(window).scrollTop();
				if (scrollTop >= docHeight - WINDOW_HEIGHT) { //满足到底部的条件
					me.load();
				}
			});
		},
		/**
		 * 阻止一次scroll时间，然后立即解除阻止
		 * window.scrollTo也会触发scroll事件，避免冲突，需要先阻止scroll
		 * 解决当前tab页面过长，切换到短页面时数据加载问题（触发了scroll事件）
		 */
		stopEventOnce: function() {
			var me = this;
			me.isStopLoad = true;
			setTimeout(function() {
				me.isStopLoad = false;
			}, 100)
		},
		/**
		 * 数据加载失败时出现重新加载按钮
		 */
		reload: function() {
			var me = this;
			var _loader = this.loader;
			_loader.inform('<input value="重新加载" class="reloadBtn" type="button">');
			_loader.container.find('.' + _loader.className).on('click', '.reloadBtn', function() {
				_loader.inform(_loader.opts.html);
				me.load();
			});
		}
	};

	if (typeof module != 'undefined' && module.exports) {
		module.exports = ScrollLoad;
	}