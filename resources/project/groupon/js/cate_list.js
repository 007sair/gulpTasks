/**
 * 分类列表页
 */

//lib
var rem = require('Lib/rem750.js');
var doT = require('Lib/doT.js'); //模板引擎
var dropload = require('Lib/dropload.js'); //下拉
var lazyload = require('Lib/lazyload.js');

//mods
var utils = require('Mod/utils.js');
var ScrollLoad = require('Mod/scrollLoad.js'); //滑到底部加载数据

/**
 * 测试环境数据单一 所以增加dev变量用来对数据做一些处理
 */
var dev = true;

var oPage = {
	page: 1,
	// cate_id: document.getElementById('cate_id').value,
	cate_id: '25', //-1:销量TOP榜   4:超值推荐   5:进口好货团   6:大牌明星团
	isEnd: false,
	droploadTitle: '- 每日十点上新 包邮包税 -', //下拉刷新title
	top_count: 0 //销量top榜左上打标123
};

/**
 * 滚动加载数据
 * render: function(){}  //满足滚动条件后渲染
 */
var xhr = null;
var scrollload = new ScrollLoad({
	render: function(cb) {
		var me = this;
		if (oPage.isEnd) {
			me.loader.inform('- 到底啦 -');
			cb && cb();
			return false;
		}
		if (xhr) {
			xhr.abort()
		}
		xhr = $.ajax({
			// url: pre + '/instant/groupon/common_list/' + oPage.page + '/' + oPage.cate_id + '/',
			url: 'images/data/common_list.json',
			data: {
				cate_id: oPage.cate_id,
				page: oPage.page
			},
			type: 'get',
			dataType: 'json',
			success: function(data) {
				if (data.flag == 1) {
					renderCateList(data.data_list);
					oPage.page++;
					me.loader.inform('- 上滑继续加载 -');
				}
				if (data.flag == 0) {
					me.loader.inform('- 到底啦 -');
					oPage.isEnd = true;
				}

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

scrollload.load();

function setData(arr) {
	if (dev) {
		utils.shuffle(arr);
	}
	var new_arr = [];
	arr.forEach(function(item) {
		if (oPage.cate_id == -1) {
			oPage.top_count++;
			item.count = oPage.top_count;
		};
		item.sale_price = utils.fomatFloat(item.sale_price);
		item.groupon_price = utils.fomatFloat(item.groupon_price);
		item.link = utils.sku2link(item.sku);
		new_arr.push(item);
	});
	return new_arr;
}

function setTitle() {
		var $title = $('header').find('h1');
	var sName = '';
	switch(oPage.cate_id) {
		case '-1': //销量TOP榜
			sName = 'list-xlb';
			$title.text('热销榜');
			oPage.droploadTitle = '- 24小时实时销量排行 -';
			break;
		case '4': //超值推荐
			sName = 'list-cztj';
			$title.text('9.9元团');
			break;
		case '5': //进口团
			sName = 'list-jkt';
			$title.text('进口团');
			break;
		case '6': //明星团
			sName = 'list-mxt';
			$title.text('明星团');
			break;
		case '10':
			$title.text('每日上新');
			break;
		case '25':
			$title.text('拼美食');
			break;
		default:
			$title.text('分类页');
	}

	$('.list-wrapper').find('ul').addClass(sName);
}
setTitle();


/**
 * 渲染非首页的商品列表
 */
var isDropdown = false;
function renderCateList(arr) {
	setData(arr);
	var interText = '';

	var $wrapper = $('.list-wrapper').find('ul');
	interText = doT.template($("#tpl-mxt").text());

	if (oPage.cate_id == -1) { //销量TOP榜
		interText = doT.template($("#tpl-xlb").text());
	}
	if (oPage.cate_id == 4) { //超值推荐
		interText = doT.template($("#tpl-cztj").text());
	}
	if (oPage.cate_id == 5) { //进口团
		interText = doT.template($("#tpl-jkt").text());
	}
	if (oPage.cate_id == 6) { //明星团
		interText = doT.template($("#tpl-mxt").text());
	}

	if (isDropdown) { // 如果是下拉刷新就清空当前数据
		$wrapper.html(interText(arr));
		isDropdown = false; //渲染后需要重置回apped  否则上滑加载有bug
	} else {
		$wrapper.append(interText(arr));
	}
	
	lazyload.init();
}


//toggle back2top
var WINDOW_HEIGHT = $(window).height();
$(window).scroll(function() {
	var st = $(this).scrollTop();
	if (st > WINDOW_HEIGHT) {
		$('.back2top').css('display', 'block');
	} else {
		$('.back2top').css('display', 'none');
	}
});



//下拉加载
if (!utils.isApp()) {
	$('.list-wrapper').dropload({
		scrollArea: window,
		domUp: {
			domClass: 'dropload-up',
			domRefresh: '<div class="dropload __loading__ dropload-refresh">' + oPage.droploadTitle + '</div>',
			domUpdate: '<div class="dropload __loading__ dropload-update">' + oPage.droploadTitle + '</div>',
			domLoad: '<div class="dropload ' + scrollload.loader.opts.className + ' dropload-load">' + scrollload.loader.opts.html + '</div>'
		},
		loadUpFn: function (me) {
			oPage.top_count = 0;
			oPage.page = 1;
			oPage.isEnd = false;
			setTimeout(function () {
				isDropdown = true;
				scrollload.render(function () {
					// 每次数据加载完，必须重置
					me.resetload();
					// 解锁loadDownFn里锁定的情况
					me.unlock();
					me.noData(false);
				});
			}, 800)
		}
	});
}