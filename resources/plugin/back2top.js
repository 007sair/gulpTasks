//toggle back2top

if (!$('.back2top').length) {
    $('<div class="fix-icons"><a href="javascript:;" class="back2top"></a></div>').appendTo(document.body);
}

$.fn.back2top = function () {
    var $this = $(this);
    var WINDOW_HEIGHT = $(window).height();
    $(window).scroll(function () {
        var st = $(this).scrollTop();
        if (st > WINDOW_HEIGHT / 2) {
            $this.css('visibility', 'visible');
        } else {
            $this.css('visibility', 'hidden');
        }
    });

    $this.on('click', function() {
        move(0, 0);
        return false;
    })
};

var rafID = null,
    target = 0,	//需要移动到的目标位置
    dis;

function move() {
    rafID = requestAnimationFrame(move);
    var st = $(window).scrollTop();
    if (dis <= 0 || st == 0) {
        cancelAnimationFrame(rafID);
    } else {
        dis = (st - target) / 6;
    }
    window.scrollTo(0, st - dis);
}

$('.back2top').back2top();