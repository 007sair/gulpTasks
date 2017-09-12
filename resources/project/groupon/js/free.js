/**
 * 团长免单页
 */

var rem = require('Lib/rem750.js');
var doT = require('Lib/doT.js');
var dropload = require('Lib/dropload.js'); //下拉
require('Lib/requestAnimationFrame.js');

var utils = require('Mod/utils.js');
var ScrollLoad = require('Mod/scrollLoad.js');
require('Mod/sticky.js'); //解决移动端fixed平滑吸顶

console.log('团长免单');

/**
 * 测试环境数据单一 所以增加dev变量用来对数据做一些处理
 */
var dev = true;

//页面数据
var oPage = {
	isEnd: false,
	page: 1
};

var sticky = $('.g-md-top').sticky({
	top: '-1px'
});


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
				if (data.flag == 1) {
					renderList(data.data_list);
					me.loader.hide();
					oPage.page++;
				}
				if (data.flag == 0) {
					me.loader.inform('- 到底啦 -');
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


/**
 * 渲染团长免单数据
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

//下拉加载
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

//横向滚动
function horizScrollAjax() {
	var $scrollHoriz = $('#J_scroll_horiz');
	var $ul = $scrollHoriz.find('ul');
	var speed = 1.8;
	var dis = 0;
	var iUlWidth = $ul.width();
	var offset = $scrollHoriz.width() * 2;
	var isLoop = false; //是否循环无缝滚动 默认不循环
	var isAjaxing = false; //是否在请求ajax中

	//ajax 获取数据
	function loadAjax(callback) {
		if (!isAjaxing) {
			isAjaxing = true;
			$.ajax({
				url: 'images/data/index_scroll_text.json',
				type: 'get',
				dataType: 'json',
				success: function (data) {
					callback && callback(data.data);
					isAjaxing = false;
				},
				error: function(msg) {
					console.log(msg);
				}
			});
		};
	}

	function renderLi(arr) {
		var html = '';
		var user = 'xxx';
		arr.forEach(function (item) {
			html += '<li>' + user + item.title + '</li>';
		});
		$scrollHoriz.find('ul').append(html);
		iUlWidth = $ul.width(); //重新获取ul宽度
	}

	function cloneLi() {
		$ul.append($ul.find('li').clone());
		isLoop = true;
		iUlWidth = $ul.width(); //重新获取ul宽度
	}

	function move2left() {
		dis = dis + speed;
		if(!isLoop) {
			if (dis > iUlWidth - offset) { //当ul走到离总宽还有offset距离时加载数据
				loadAjax(function(arr) {
					if (arr.length) { //ajax有数据
						renderLi(arr);
					} else { //无数据，循环无缝滚动
						cloneLi();
					}
				})
			}
		} else {
			if (dis >= iUlWidth / 2) {
				dis = speed
			}
		}
		$ul.css('transform', 'translate3d(-'+ dis +'px, 0, 0)');
	}

	function animate() {
		requestAnimationFrame(animate);
		move2left();
	}

	// animate();
	loadAjax(function (arr) {
		if (arr.length) { //ajax有数据
			renderLi(arr);
			animate();
			if (isLoop) {
				cloneLi();
			}
		}
	})
};

horizScrollAjax();

