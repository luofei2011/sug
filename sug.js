/**
 * @author luofei
 * @date 2014-12-01
 * @description {{通用sug组件}}
 */

var bds = bds || {};bds.util = bds.util || {};
bds.util.sug = function(options) {
    this.op = this.extend({}, this.dft, options);
    this.init = function() {
        this.createSugDom();
        this._initStyle();
        this._initPos();
        this.bindEv();
    };

    this.onQChange = this.op.onQChange || function() {};

    // current active index for up[down] key
    this.curIdx = null;

    this.timer = null;

    // this var used to record the value of input
    this.hisKey = null;

    // init the position of sug element
    this._initPos = function() {
        // trick for this situation: parent's position attr is static
        if (this.op.targetDom.get(0).parentNode && this.op.targetDom.get(0).parentNode.style.position === 'static') {
            this.op.targetDom.get(0).parentNode.style.position = 'relative';
        }
        var tHeight = this.op.targetDom.get(0).offsetHeight;
        var tWidth = this.op.targetDom.get(0).offsetWidth;
        var offTop = this.op.targetDom.get(0).offsetTop;
        var offLeft = this.op.targetDom.get(0).offsetLeft;

        // 1px for border-top
        this.op.sugDom.get(0).style.top = tHeight + offTop - 1 + 'px';
        this.op.sugDom.get(0).style.left = offLeft + 'px';
        // 2px is border
        this.op.sugDom.get(0).style.width = tWidth - 2 + 'px';
    };

    this._initStyle = function() {
        var str = '.util-sug{position:absolute;border:1px solid #ccc;box-shadow:1px 1px 3px #ededed;-moz-box-shadow:1px 1px 3px #ededed;-webkit-box-shadow:1px 1px 3px #ededed;}.util-sug ul{padding:0;margin:0}.util-sug-hover{background:#f0f0f0}.util-sug li{font:14px Arial;line-height:22px;padding:0 8px;position:relative;cursor:default;list-style:none;}';
        this.createStyle(str);
    };

    this.createSugDom = function() {
        var div = document.createElement('div');
        div.style.display = 'none';
        div.className = 'util-sug';
        div.innerHTML = '<ul></ul>';
        this.op.sugDom = $(div);
        this.op.targetDom.get(0).parentNode && this.op.targetDom.get(0).parentNode.appendChild(div);
    };

    this.showSug = function() {
        this.op.sugDom.show();
    };

    this.hideSug = function() {
        this.op.sugDom.hide();
        window.clearInterval(this.timer);
    };

    // render the sug list with {{data}}
    this.render = function() {
        var tpl = '<li data-key="#{0}">#{0}</li>';
        var html = '';
        var list = null;

        if (this.hisKey) {
            list = this.filter(data.list);

            if (!list.length) {
                this.op.sugDom.hide();
            } else {
                this.showSug();
            }

            for (var i = 0, len = list.length; i < len; i++) {
                //html += '<li data-key="'+list[i]+'">'+list[i]+'</li>';
                html += this.format(tpl, list[i]);
            }
            this.op.sugDom.find('ul').eq(0).empty().append(html);
        } else {
            // TODO for top-Q
            this.op.sugDom.hide();
        }
    };

    this.filter = function(data) {
        //var prefix = this.op.targetDom.val();
        var prefix = this.hisKey;
        var patten = new RegExp('^' + prefix);
        var match = [];

        for (var i = 0, len = data.length; i < len; i++) {
            if (patten.test(data[i])) {
                match.push(data[i]);
            }
        }

        return match;
    };

    this.bindEv = function() {
        var _this = this;
        this.op.targetDom.on('focus.sug', function() {
            _this.timer = setInterval(function() {
                var v = _this.op.targetDom.val();
                v = $.trim(v);
                // FIX for focus the input when sugDom is hide
                if (_this.hisKey != v || _this.op.sugDom.css('display') === 'none') {
                    _this.hisKey = v;
                    _this.render();
                }
            }, 20);
        });

        this.op.targetDom.on('click.sug', function() {
            return false;
        });

        // custom event for trigger select
        this.op.targetDom.on('content_change.sug', function(e, data) {
            this.value = data;
            _this.onQChange && _this.onQChange();
        });

        this.op.sugDom.on('mouseenter', 'li', function() {
            var $this = $(this);
            _this.op.sugDom.find('li').removeClass('util-sug-hover') && $this.addClass('util-sug-hover');
            _this.curIdx = $this;
        }).on('mouseleave', 'li', function() {
            var $this = $(this);
            $this.removeClass('util-sug-hover');
        // do what when li has been clicked
        }).on('click', 'li', function() {
            _this.op.targetDom.trigger('content_change', $(this).attr('data-key'));
        });

        $(document).on('click.util-sug', function() {
            _this.hideSug();
        });

        $(window).on('blur', function() {
            _this.hideSug();
        });

        this.op.targetDom.on('keyup', function(e) {
            e = window.event || e;
            var $li = _this.op.sugDom.find('li');
            var cur = _this.op.sugDom.find('li.util-sug-hover');
            var active = null;
            // up
            if (e.keyCode == 38) {
                active = cur.length ? (cur.prev().length ? cur.prev() : [].pop.call($li)) : [].pop.call($li);
            // down
            } else if (e.keyCode == 40) {
                active = cur.length ? (cur.next().length ? cur.next() : $li.get(0)) : $li.get(0);
            }

            if (active) {
                active = $(active);
                active && active.trigger('mouseenter') && _this.op.targetDom.trigger('content_change.sug', active.attr('data-key'));
            }

            //_this.render();
        });
    };

    this.init();
};

bds.util.sug.prototype = {
    // can't use default in ie67
    dft: {
        targetDom: null
    },

    // TODO {{DEEP CLONE}}
    extend: function() {
        var isDeep = false;
        var tObj = arguments[0];
        var sIdx = 1;
        var extObj = null;
        if (!arguments.length) return false;
        if (typeof arguments[0] === 'boolean') {
            isDeep = arguments[0];
            tObj = arguments[1];
            sIdx = 2;
        }
        extObj = [].slice.call(arguments, sIdx);

        for (var i = 0, len = extObj.length; i < len; i++) {
            for (var item in extObj[i]) {
                if (extObj[i].hasOwnProperty(item)) {
                    tObj[item] = extObj[i][item];
                }
            }
        }

        return tObj;
    },

    createStyle: function(str) {
        var style = document.createElement('style');
        // this is important for ie678
        style.setAttribute('type', 'text/css');
        if (style.styleSheet) {
            style.styleSheet.cssText = str;
        } else {
            var cssText = document.createTextNode(str);
            style.appendChild(cssText);
        }
        document.body.appendChild(style);
    },

    format: function(tpl) {
        var args = [].slice.call(arguments, 1);
        return tpl.replace(/#\{(\d+)\}/g, function() {
            return args[arguments[1]] || "";
        });
    }
}
