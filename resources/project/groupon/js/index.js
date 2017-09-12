/*
 * TODO:
 * 1 数据本地化 √
 * 2 修改loading在tab内的逻辑 √
 * 3 tab切换导致页面高度问题，触发了页面滚动加载数据 √
 * 4 tab悬浮后，切换tab数据不足时，页面会跳的问题 √
 * 5 一次加载数据过少，页面高度不足，反复加载功能 √
 * 6 切换tab后页面位置问题，使用 TSL 优化版 ×
 */

//lib
var rem = require('Lib/rem750.js');
var doT = require('Lib/doT.js'); //模板引擎
var Swipe = require('Lib/swipe.js'); //焦点图
var IScroll = require('Lib/iscroll.js');
var dropload = require('Lib/dropload.js'); //下拉
var FastClick = require('Lib/fastclick.js'); //重置点击事件 防止穿透

//mods
var utils = require('Mod/utils.js');
require('Mod/sticky.js'); //解决移动端fixed平滑吸顶
var ScrollLoad = require('Mod/scrollLoad.js'); //滑到底部加载数据
var Notice = require('Mod/notice.js'); //xx件商品更新
var ScrollNotice = require('Mod/scrollNotice.js');
var back2top = require('Mod/back2top.js');



/**
 * 测试环境数据单一 所以增加dev变量用来对数据做一些处理
 */
var dev = true;

FastClick.attach(document.body);

var isShowNotice = false; //页面加载第一次显示xxx更新  
var isDropdown = false; //是否为下拉

//页面数据
var oPage = {
	tab_index: 0, //红色tab的当前索引值
	tabs: [] //红色tab组
};

/**
 * 初始化oPage
 */
function initPageData() {
	$('.g-scrollbar').find('li').each(function (index, el) {
		oPage.tabs.push({
			page: 1, //页数
			isRender: false, //是否渲染 是：不加载ajax
			cate_id: $(this).attr('_cate_id'), //分类id
			isEnd: false, //是否到底
			index: index //索引值
		});
		if (index == 0) {
			oPage.tabs[0].isHome = true;
			oPage.tabs[0].sec_tab_index = 0;
			oPage.tabs[0].isRender = true;
		};
	});
}
initPageData();

var sticky = $('.J_topbar_sticky').sticky({
	top: '-1px'
});

/**
 * 向上滚动
 */
var scrollnotice = new ScrollNotice($('#uper'), {
	speed: 4000,
	top: $('.g-search').length ? '3.2rem' : '2rem',
	distance: $('.g-search').length ? $('.g-search').height() : 0
});


/**
 * 初始化dom中的一些元素，后面会用到
 */
function initDOM() {
	$('.g-container').each(function (index) {
		if (index !== 0) {
			$(this).append('<div class="J_sectabcont">');
		} else {
			$(this).find('.itemlist').addClass('J_sectabcont');
		}
	})
}
initDOM();


/**
 * 给当前渲染数据的tab cont加class 备用
 */
function addDroploadClass(index) {
	index = index || 0;
	var sClass = 'J_dropload';
	$('.J_sectabcont').removeClass(sClass).eq(index).addClass(sClass);
}
addDroploadClass();

/**
 * 向上滚动切换效果
 */
var nurl = 'images/data/index_scroll_text.json';
var sn_id = 0;
function getScrollNoticeData(cb) {
	$.ajax({
		// url: pre + '/instant/groupon/index_scroll_text/' + _this.id,
		url: nurl,
		data: {
			id: sn_id
		},
		type: 'get',
		dataType: 'json',
		success: function (res) {
			cb && cb(res);
			//拿到一个id，用于下次请求
			sn_id = res.data.length ? res.data[0].id : 0;
		}
	});
};
getScrollNoticeData(function (res) {
	scrollnotice.init(res.data);
	scrollnotice.end = function () { //数据加载完后需再请求一次 
		// console.log(sn_id);
		var me = this;
		// nurl = 'images/data/index_scroll_text2.json';
		getScrollNoticeData(function (res) {
			if (res.data.length) {
				me.data = res.data;
				me.add(1);
			} else {
				me.end();
			}
		})
	};
});


//swiper
(function () {
	var $swiper = $('#grouponIndex'),
		$pointer = $swiper.find('.swipe-pointer'),
		len = $swiper.find('.swipe-item').length,
		span = '';
	for (var i = 0; i < len; i++) {
		span += i ? '<span></span>' : '<span class="cur"></span>';
	}
	$pointer.html(span);
	var elem = document.getElementById('grouponIndex');
	var swiper = new Swipe(elem, {
		handleLoop: true,
		auto: 4000,
		callback: function (index, ele) {
			$pointer.find('span').eq(index).addClass('cur').siblings().removeClass('cur');
		}
	});
	window.swiper = swiper;
})();


//scroll bar
window.myScroll = new IScroll('#scrollbar', {
	fixedScrollBar: true,
	bindToWrapper: false,
	eventPassthrough: true,
	scrollX: true,
	scrollY: false,
	preventDefault: false
});


/**
 * 滚动加载数据
 * render: function(){}  //满足滚动条件后渲染
 */
var xhr = null;
var scrollload = new ScrollLoad({
	render: function (cb) {
		var me = this;
		var curTab = getCurTab(); //获取当前点击tab对象
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
			success: function (data) {
				if (!curTab.isHome && !curTab.isRender) {
					renderType(data.cate_list, curTab.index);
				}
				if (data.flag == 1) {
					if (curTab.isHome) {
						renderHomeList(data.data_list, curTab.index);
					} else {
						renderSecondList(data.data_list, curTab.index);
					}
					curTab.page++;
					me.loader.inform('- 上滑继续加载 -');
				}

				if (data.flag == 0) {
					me.loader.inform('- 到底啦 -');
					curTab.isEnd = true;
				}

				curTab.isRender = true;
				cb && cb();
			},
			error: function () {
				console.log('ajax error');
				me.reload();
				cb && cb();
			}
		});
	}
});

$('.J_wrapper').css('min-height', $(window).height() + 2); //+2是为了在切换tab时让sticky.isFixed = true

scrollload.getContainer(getCurBox());
scrollload.load();


/**
 * 渲染拼团首页商品列表
 */
function renderHomeList(arr, tab_index) {
	if (dev) {
		utils.shuffle(arr);
	};

	arr.forEach(function (item, index) {
		if (dev) {
			item.name = $('.secondbar').find('li').eq(tab_index).text() + index;
		}
		item.sale_price = utils.fomatFloat(item.sale_price);
		item.groupon_price = utils.fomatFloat(item.groupon_price);
		item.link = utils.sku2link(item.sku);
	});

	var $elembox = $('.itemlist').find('ul');
	var interText = doT.template($("#gItems").text());

	if (isDropdown) { // 如果是下拉刷新就清空当前数据
		$elembox.html(interText(arr));
		isDropdown = false; //渲染后需要重置回apped  否则上滑加载有bug
	} else {
		$elembox.append(interText(arr));
	}

	//数据第一次渲染完成后显示 xxx件商品更新
	if (!isShowNotice) {
		setTimeout(function () {
			$('.notice').noticer();
			isShowNotice = true;
		}, 500);
	}
}


/**
 * 渲染非首页的二级分类
 */
function renderType(arr, tab_index) {
	if (arr && arr.length) { //不是所有页面都有二级分类
		if (dev) {
			utils.shuffle(arr);
		};
		var interText = doT.template($("#gChannel").text());
		var $elembox = $('.g-container').eq(tab_index).find('.J_sectabcont');

		if (isDropdown) { // 如果是下拉刷新就清空当前数据
			$elembox.html(interText(arr));
			isDropdown = false; //渲染后需要重置回apped  否则上滑加载有bug
		} else {
			$elembox.append(interText(arr));
		}
	};
}


/**
 * 渲染非首页的商品列表
 */
function renderSecondList(arr, tab_index) {
	if (dev) {
		utils.shuffle(arr);
		arr.forEach(function (item, index) {
			item.name = $('.g-scrollbar').find('li').eq(tab_index).text() + index
		})
	};

	var interText = doT.template($("#gSecItemList").text());
	var $elembox = $('.g-container').eq(tab_index).find('.J_sectabcont');

	if (!$elembox.find('.g-secondlist').length) {
		$elembox.append('<div class="g-secondlist">');
	}

	if (isDropdown) { // 如果是下拉刷新就清空当前数据
		$elembox.find('.g-secondlist').html(interText(arr));
		isDropdown = false; //渲染后需要重置回apped  否则上滑加载有bug
	} else {
		$elembox.find('.g-secondlist').append(interText(arr));
	}

}


/**
 * 根据tab切换中的index返回当前tab
 */
function getCurTab() { //此函数一定要在切换tab并给oPage的index赋值后执行
	var curTab = null;
	// 5.5废弃
	// if (oPage.tab_index == 0) { //首页
	// 	curTab = oPage.tabs[0].sec_tabs[oPage.tabs[0].sec_tab_index];
	// } else { //非首页
	// 	curTab = oPage.tabs[oPage.tab_index];
	// }
	curTab = oPage.tabs[oPage.tab_index];
	return curTab;
}


/**
 * 多tab时 切换tab找到loading外层对应的容器 然后决定loading所在位置
 */
function getCurBox() {
	var $box = $('body');
	if (oPage.tab_index == 0) {
		$box = $('.itemlist')
	} else {
		$box = $('.g-container').eq(oPage.tab_index)
	}
	return $box
}


/**
 * Events
 */
//一级tab切换
$('#scrollbar').on('click', 'li', function () {
	if ($(this).hasClass('active')) return false;

	var index = $(this).index();
	oPage.tab_index = index;

	$(this).addClass('active').siblings('li').removeClass('active');
	$('.g-container').eq(index).css('display', 'block').siblings('.g-container').css('display', 'none');

	if (index == 0) { //解决切换tab导致焦点图无高度的bug
		swiper.setup()
	} else {
		swiper.stop()
	}

	setTimeout(function () {
		window.myScroll.scrollToElement("li:nth-child(" + (index + 1) + ")", 200, true);
	}, 200);

	var curTab = getCurTab();
	scrollload.getContainer(getCurBox());

	if (!curTab.isRender) { //首次渲染
		scrollload.load(function () {
			//回调，如果当前tab在悬浮状态，则将页面跳至tab悬浮的初始位置 增强用户体验
			if (sticky.isFixed) {
				scrollload.stopEventOnce();
				window.scrollTo(0, sticky.offsetTop + 1);
			}
		});
	} else {
		//防止来回切换tab导致数据加载过多
		scrollload.stopEventOnce();
	}

	// addDroploadClass(index);
});


// 下拉加载
$('.J_dropload').dropload({
	scrollArea: window,
	domUp: {
		domClass: 'dropload-up',
		domRefresh: '<div class="dropload __loading__ dropload-refresh">- 每日十点上新 包邮包税 -</div>',
		domUpdate: '<div class="dropload __loading__ dropload-update">- 松开即可加载数据 -</div>',
		domLoad: '<div class="dropload ' + scrollload.loader.opts.className + ' dropload-load">' + scrollload.loader.opts.html + '</div>'
	},
	loadUpFn: function (me) {
		var curTab = getCurTab();
		curTab.page = 1;
		curTab.isEnd = false;
		setTimeout(function () {
			isDropdown = true;
			scrollload.render(function () {
				console.log('reset');
				// 每次数据加载完，必须重置
				me.resetload();
				// 解锁loadDownFn里锁定的情况
				me.unlock();
				me.noData(false);
			});
		}, 800)
	}
});


//一些搜索相关的操作
$('.J_search_input').on('input propertychange', function () {
	if (!$(this).val()) {
		$('.J_search_result').hide();
		$('.J_search_history').show();
	} else { //有值
		$('.J_search_result').show();
		$('.J_search_history').hide();
	}
}).on('focus', function () {
	$('.J_wrapper').css('display', 'none');
	$('.J_search_box, .J_search_blur').show();
	$('.J_search_icon').hide();
	$('.J_search_label').hide();
	$('.J_search_input').attr('placeholder', $('.J_search_hotstr').text());
	scrollload.isStopLoad = true;
}).on('blur', function () {
	$('.J_search_label').show();
	$('.J_search_input').attr('placeholder', '');
	scrollload.isStopLoad = false;
});

$('.J_search_blur').on('click', function () {
	$('.J_wrapper').css('display', 'block');
	$('.J_search_box, .J_search_blur').hide();
	$('.J_search_icon').show();
	scrollload.isStopLoad = false;
});

$('.J_search_wrap').on('click', function() {
	$('.J_search_input').trigger('focus');
});


var date = new Date();
var cookie_name = '_freecoupon_' + (date.getMonth() + 1) + date.getDate() + '_';
function setCouponFreeDialog() {
	//团长免费券
	var isShowCouponFreeDialog = 1;
	var $tips_md = $('.J_tips_md');

	if (isShowCouponFreeDialog) {
		var interText = doT.template($("#popCouponFree").text());
		var $freeCP = $(interText()).appendTo(document.body);
		$freeCP.on('click', '.J_free_cp_close', function () {
			$freeCP.remove();
			$tips_md.fadeIn();
		});
		$('.g-entry').on('click', 'a', function (e) {
			if ($(e.target).hasClass('J_tips_md')) {
				$tips_md.fadeOut();
				date.setTime(date.getTime() + 1 * 24 * 3600 * 1000);
				if (!utils.getcookie(cookie_name)) {
					utils.setcookie(cookie_name, 1, date.toGMTString());
				}
				return false;
			}
		})
	}
}
// setCouponFreeDialog();
