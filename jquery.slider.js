/**
 * @Name:		滑动组件
 * @Revison:	0.1
 * @Date:		21/10/2016
 * @Author:		zzl
 * @Use:		可实现下拉刷新页面
 * 				左滑和右滑翻页
 * 				支持移动端和pc端
 * @Description：其中的翻页点击效果要在主页面定义好
 * 				否则插件会找不到相应的事件而使翻页无效
 * 				开发者可以根据需求和设计更改样式达到不一样的显示效果
 * */

(function($) {
    $.fn.slider = function(options) {
        var opts = $.extend({
            toNext: "", //下一页对象
            toPreve: "", //下一页对象
            hminLen: 60, //下拉最小距离请求刷新
            nextLen: 150, //左滑最小距离跳转下一页
            prevLen: 150, //右滑最小距离跳转上一页
            pdStr1: "下拉刷新", //下拉时显示的信息
            loadStr: "加载中", //加载时的提示信息
            pdStr2: "释放更新", //图标变换时的提示信息
            errorTip: "刷新失败，请稍后再试！", //请求失败提示信息
            hideTime: 400, //加载框隐藏的时间（单位ms）
            url: "", //请求地址
            param: "", //请求传递参数
            tab: "",
            done: function(data) {} //回调函数
        }, options || {});

        var $_this = this,
            $pullDown,
            $load,
            startX, //鼠标点击时的位置
            startY,
            nowX, //鼠标现在的位置
            nowY,
            moveLen, //水平移动距离
            hmoveLen, //垂直移动距离
            befHmoveLen = 0, //之前移动的距离，和现在移动的距离进行比较，判断是上滑还是下拉
            touch;

        $toNext = opts.toNext,
            $toPreve = opts.toPreve,
            hminLen = opts.hminLen,
            nextLen = opts.nextLen,
            prevLen = opts.prevLen;

        //在 this Dom 外包裹一层div
        $_this.wrap("<div id='slider'/>");
        $_this.before("<div class='pull_down' id='pullDown'><i></i><span>" + opts.pdStr1 + "</span></div>");
        $_this.before("<div class='load' id='load'><span>" + opts.loadStr + "</span></div>");

        $pullDown = $("#pullDown");
        $load = $("#load");

        var pullmtop = $pullDown.css("margin-top");
        pullmtop = parseInt(pullmtop.substring(0, pullmtop.length - 2));

        this.each(function() {
            $_this.bind("mousedown touchstart", function(event) { //鼠标点击事件或触屏事件
                event.preventDefault();

                startX = event.type == "touchstart" ? event.originalEvent.changedTouches[0].pageX : event.pageX;
                startY = event.type == "touchstart" ? event.originalEvent.changedTouches[0].pageY : event.pageY;
            }).bind("mousemove", function(event) { //鼠标移动事件或滑屏事件
                event.preventDefault();

                if (event.type == "touchmove") {
                    touch = event.originalEvent.changedTouches[0];
                }

                nowY = typeof event.pageY != "undefined" ? event.pageY : touch.pageY;
                hmoveLen = nowY - startY;

                if (befHmoveLen != hmoveLen) {
                    //向上滑时触发
                    if (befHmoveLen > hmoveLen) {
                        $pullDown.find("span").text(opts.pdStr1);
                        $pullDown.find("i").removeClass("rotation");
                    }

                    befHmoveLen = hmoveLen;
                }

                //向下滑时触发
                if (hmoveLen > 0 && hmoveLen < hminLen) {
                    $pullDown.show().css("margin-top", pullmtop + nowY - startY);
                } else if (hmoveLen >= hminLen) {
                    $pullDown.find("span").text(opts.pdStr2);
                    $pullDown.find("i").addClass("rotation");
                }
            }).bind("mouseup", function(event) { //鼠标放开事件或离屏事件
                event.preventDefault();

                if (event.type == "touchend") {
                    touch = event.originalEvent.changedTouches[0];
                }

                if (typeof event.pageX != "undefined") {
                    nowX = event.pageX;
                } else {
                    nowX = touch.pageX;
                }

                moveLen = startX - nowX;

                //下一页
                if (moveLen > nextLen) {
                    $toNext.trigger("click");
                }

                //上一页
                if (moveLen < -prevLen) {
                    $toPreve.trigger("click");
                }

                if (hmoveLen >= hminLen) {
                    $load.show().css("margin-top", -15);

                    //请求后台接口获取数据
                    getRefresh();
                }

                //页面向上弹入
                $pullDown.css("margin-top", pullmtop).find("span").text(opts.pdStr);
                $pullDown.hide().find("i").removeClass("rotation");
                $(document).scrollTop(0);
            });

            //请求后台接口获取数据
            function getRefresh() {
                if (opts.param.tab == "courseTab") {
                    opts.param.date = new Date(parseInt($("#dateWeek li.current").attr("date"))).getDay();
                }

                $.ajax({
                    url: opts.url,
                    data: opts.param,
					type: "json",
                    success: function(resdata, textStatus, jqXHRult) {
                        //调用回调函数
                        opts.done(resdata);

                        //隐藏加载框
                        $load.stop().animate({
                            "margin-top": pullmtop
                        }, opts.hideTime).hide();
                    },
                    error: function(resdata, textStatus, jqXHRult) {
                        $load.find("span").text(opts.errorTip);

                        //隐藏加载框
                        $load.stop().animate({
                            "margin-top": pullmtop
                        }, opts.hideTime).hide();
                    }
                });
            }
        });

        return this;
    };
})(jQuery)