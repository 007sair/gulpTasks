/**
 * 团长免单页
 */

var rem = require('Lib/rem750.js');
var doT = require('Lib/doT.js');
var dropload = require('Lib/dropload.js'); //下拉

var utils = require('Mod/utils.js');
var ScrollLoad = require('Mod/scrollLoad.js');
var ScrollNotice = require('Mod/scrollNotice.js');

console.log('邀新团');

/**
 * 测试环境数据单一 所以增加dev变量用来对数据做一些处理
 */
var dev = true;

//页面数据
var oPage = {
	isEnd: false,
	page: 1
};


/**
 * 向上滚动
 */
var scrollnotice = new ScrollNotice($('.J_scrollUp'), {
	isFix: false,
	speed: 3000
});

var nurl = 'images/data/index_scroll_text.json';
var sn_id = 0;
function getScrollNoticeData(cb) {
	$.ajax({
		url: nurl, // url: pre + '/instant/groupon/index_scroll_text/' + _this.id,
		data: {
			id: sn_id
		},
		type: 'get',
		dataType: 'json',
		success: function (res) {
			cb && cb(res);
			sn_id = res.data.length ? res.data[0].id : 0; //拿到一个id，用于下次请求
		}
	});
}

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
				me.over()
			}
		})
	};
});


/**
 * 上滑加载数据
 */
var xhr = null;
var scrollload = new ScrollLoad({
	autoLoad: true,
	render: function (cb) {
		var me = this;
		if (oPage.isEnd) {
			me.loader.inform('- 到底啦 -');
			cb && cb();
			return false;
		}
		if (xhr) {
			xhr.abort()
		}
		$.ajax({
			// url: pre + '/instant/groupon/common_list/' + oPage.page + '/0/',
			url: 'images/data/common_list.json',
			type: 'get',
			data: {
				page: oPage.page
			},
			dataType: 'json',
			success: function (data) {
				if (oPage.page == 2) {
					data.flag = 0;
				}
				if (data.flag == 1) {
					renderList(data.data_list);
					me.loader.hide();
					oPage.page++;
				}
				if (data.flag == 0) {
					me.loader.inform('- 到底啦 -');
					me.isStopLoad = true;
					oPage.isEnd = true;
				}

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

//只加载第一次
scrollload.afterRender = function() {
	this.isStopLoad = true;
	this.loader.remove();
};


/**
 * 渲染数据
 */
var isDropdown = false;
function renderList(arr, tab_index) {
	if (dev) {
		utils.shuffle(arr);
	};

	arr.forEach(function (item, index) {
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
}

// 下拉加载
$('.itemlist').dropload({
	scrollArea: window,
	domUp: {
		domClass: 'dropload-up',
		domRefresh: '<div class="dropload __loading__ dropload-refresh">- 每日十点上新 包邮包税 -</div>',
		domUpdate: '<div class="dropload __loading__ dropload-update">- 松开即可加载数据 -</div>',
		domLoad: '<div class="dropload ' + scrollload.loader.opts.className + ' dropload-load">' + scrollload.loader.opts.html + '</div>'
	},
	loadUpFn: function (me) {
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

