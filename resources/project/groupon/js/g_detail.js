/**
 * rem脚本js
 * ----------------
 * 根据 /src/css/_config.scss 中的变量 $output 的值引入对应js
 *   $output: 640    ->   ./lib/rem640.js
 *   $output: 750    ->   ./lib/rem750.js
 */

//lib
var rem = require('Lib/rem750.js');
var doT = require('Lib/doT.js');
var Swipe = require('Lib/swipe.js');
var Countdown = require('Lib/newTimer.js');
var IScroll = require('Lib/iscroll.js');
var FastClick = require('Lib/fastclick.js');
var back2top = require('Mod/back2top.js');

//mods
var sticky = require('Mod/sticky.js');
var ScrollLoad = require('Mod/scrollLoad.js');

FastClick.attach(document.body);

var dev = true;

//页面数据
var oPage = {
	tab_index: 0, //tab的当前索引值
	tabs: [], //tab组
	sec_tab_index: 0 //二级tab
};

$('.J_fix_top').sticky({
	top: '-1px',
	zIndex: 200
});

$('.g-scrollbar-detail').sticky({
	top: '-1px',
	zIndex: 220
});


/**
 * 初始化dom中的一些元素，后面会用到
 * 正式环境第一屏用php渲染了，所以不需要initDOM
 */
function initDOM() {
	$('.g-secondlist').each(function(index) {
		$(this).append('<div class="J_sectabcont clearfix">');
	})
}
initDOM();


//swiper
(function() {
	var $swiper = $('#grouponItems'),
		$pointer = $swiper.find('.swipe-pointer'),
		len = $swiper.find('.swipe-item').length,
		span = '';

	for (var i = 0; i < len; i++) {
		span += i ? '<span></span>' : '<span class="cur"></span>';
	}
	$pointer.html(span);
	var elem = document.getElementById('grouponItems');
	var swiper = Swipe(elem, {
		handleLoop: true,
		callback: function(index, ele) {
			$pointer.find('span').eq(index).addClass('cur').siblings().removeClass('cur');
		}
	});
})();

new Countdown(document.getElementById('timer'), {
	time: {
		// end: document.getElementById('end_time').value, //活动结束时间
		end: +new Date() + 1000000000
	},
	render: function(date) {
		var html = '<span>--</span><em>:</em><span>--</span><em>:</em><span>--</span>';
		if (this.interval) {
			html = '<span class="appw t0">' + date.days + '</span>' + '天' +
				'<span class="appw t1">' + this.leadingZeros(date.hours) + '</span>' + "<em>:</em>" +
				'<span class="appw t2">' + this.leadingZeros(date.min) + '</span>' + "<em>:</em>" +
				'<span class="appw t3">' + this.leadingZeros(date.sec) + '</span>';
		};
		this.el.innerHTML = '还剩' + html + '结束';
	}
});

//scroll bar
window.myScroll = new IScroll('#scrollbar', {
	fixedScrollBar: true,
	bindToWrapper: false,
	eventPassthrough: true,
	scrollX: true,
	scrollY: false,
	preventDefault: false,
	click: true
});


/**
 * 初始化oPage
 */
function initPageData() {
	$('.g-scrollbar-detail').find('li').each(function(index, el) {
		oPage.tabs.push({
			page: 1,
			isRender: false,
			cate_id: $(this).attr('_cate_id'),
			isEnd: false,
			index: index
		});
	});
}
initPageData();

/**
 * 滚动加载数据
 * render: function(){}  //满足滚动条件后渲染
 */
var xhr = null;
var scrollload = new ScrollLoad({
	render: function(cb) { //获取到当前tab后请求ajax  然后加载数据
		var me = this;
		var curTab = getCurTab();
		if (curTab.isEnd) {
			me.loader.inform('- 到底啦 -');
			cb && cb();
			return false;
		}
		if (xhr) {
			xhr.abort()
		}
		xhr = $.ajax({
			// url: pre + '/instant/groupon/common_list/' + curTab.page + '/' + curTab.cate_id + '/',
			url: 'images/data/common_list.json',
			type: 'get',
			data: {
				page: curTab.page,
				cate_id: curTab.cate_id
			},
			dataType: 'json',
			success: function(data) {
				if (data.flag == 1) {
					renderSecondList(data.data_list, curTab.index);
					curTab.page++;
					me.loader.hide();
				}
				if (data.flag == 0) {
					me.loader.inform('- 到底啦 -');
					curTab.isEnd = true;
				}

				curTab.isRender = true;
				cb && cb();
			},
			error: function() {
				console.log('ajax error');
				me.reload();
				cb && cb();
			}
		});
	}
});

//min-height  解决点击tab会跳的问题
$('.J_detail_cont').css('min-height', $(window).height());

scrollload.getContainer(getCurBox());
scrollload.load();


/**
 * 渲染非首页的商品列表
 */
function renderSecondList(arr, tab_index) {
	if (dev) {
		utils.shuffle(arr);
	};
	arr.forEach(function(item, index) {
		if (dev) {
			item.name = $('.g-scrollbar-detail').find('li').eq(tab_index).text() + index;
		}
		item.sale_price = utils.fomatFloat(item.sale_price);
		item.groupon_price = utils.fomatFloat(item.groupon_price);
		item.link = utils.sku2link(item.sku);
	});
	var interText = doT.template($("#gSecItemList").text());
	if (!$('.g-secondlist').find('.J_sectabcont').length) {
		$('.g-secondlist').prepend('<div class="J_sectabcont clearfix">');
	};
	$('.g-secondlist').eq(tab_index).find('.J_sectabcont').append(interText(arr));

	oPage.tabs[tab_index].isRender = true;
}


/**
 * 根据tab切换中的index设置当前的tab
 */
function getCurTab() { //此函数一定要在切换tab并给oPage的index赋值后执行
	return oPage.tabs[oPage.tab_index];
}

/**
 * 多tab时 切换tab找到loading外层对应的容器
 */
function getCurBox() {
	return $('.g-secondlist').eq(oPage.tab_index)
}


var animateTab = {
	$elem_tab: $('.J_detail_tab'),
	init: function() {
		this.$elem_ul = this.$elem_tab.find('ul');
		this.$elem_li = this.$elem_ul.find('li');
		this.li_width = this.$elem_li.width();
		this.i_width = Math.ceil(this.li_width * 0.2);
		this.$elem_i = $('<i></i>').css('width', this.i_width).appendTo(this.$elem_ul);
		this.move();
	},
	move: function(index) {
		index = index || 0;
		var offset = index * this.li_width;
		this.$elem_i.animate({
			'left': this.li_width / 2 + offset - this.i_width / 2
		}, 200, 'ease-in-out', function() {});
	}
};
animateTab.init()


/**
 * Events
 */
$('#scrollbar').on('click', 'li', function() {
	var index = $(this).index();
	oPage.tab_index = index;

	$(this).addClass('active').find('i').removeClass('_gray_');
	$(this).siblings('li').removeClass('active').find('i').addClass('_gray_');
	$('.g-secondlist').eq(index).css('display', 'block').siblings('.g-secondlist').css('display', 'none');
	

	setTimeout(function() {
		window.myScroll.scrollToElement("li:nth-child(" + (index + 1) + ")", 200, true);
	}, 200);

	var curTab = getCurTab();
	scrollload.getContainer(getCurBox());

	if (!curTab.isRender) { //切换tab后第一次加载数据
		scrollload.load(function() {
			if (sticky.isFixed) { //如果当前tab在定位状态，则将页面跳至tab定位的最上方 增加体验
				scrollload.stopEventOnce();
				window.scrollTo(0, sticky.offsetTop);
			}
		});
	} else {
		//防止来回切换tab导致数据加载问题
		scrollload.stopEventOnce();
	}
});


$('.J_detail_tab').on('click', 'li', function() {
	var index = $(this).index();
	oPage.sec_tab_index = index;

	scrollload.isStopLoad = index ? true : false;

	$(this).addClass('cur').siblings('li').removeClass('cur');
	$('.J_detail_cont').css('display', 'none').eq(index).css('display', 'block');

	animateTab.move(index)
});