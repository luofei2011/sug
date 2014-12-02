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
        this.op.targetDom[0].parentNode.style.zoom = 1;
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
        var str = '.util-sug{position:absolute;border:1px solid #ccc;box-shadow:1px 1px 3px #ededed;-moz-box-shadow:1px 1px 3px #ededed;-webkit-box-shadow:1px 1px 3px #ededed;}.util-sug-sort{background:#fafafa;line-height:27px;height:27px}.util-sug ul{padding:0;margin:0}.util-sug-hover{background:#f0f0f0}.util-sug li{font:14px Arial;line-height:22px;padding:0 8px;position:relative;cursor:default;list-style:none;zoom:1}';
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
        // this tpl template is for sort
        var tpl = '<li class="util-sug-sort">#{0}</li>';
        var list = null;
        var _type;
        var html = "";

        if (this.hisKey) {
            list = this.filter(this.op.dataList.list);
            type = Object.prototype.toString.call(list);

            if (type === "[object Object]") {
                if ($.isEmptyObject(list)) {
                    this.op.sugDom.hide();
                    return;
                }
                for (var o in list) {
                    html += this.format(tpl, o);
                    html += this.__render(list[o]);
                }
            } else if (type === "[object Array]") {
                if (!list.length) {
                    this.op.sugDom.hide();
                    return;
                }
                html += this.__render(list);
            }
            this.op.sugDom.find('ul').eq(0).empty().append(html);
            this.showSug();
        } else {
            // TODO for top-Q
            this.op.sugDom.hide();
        }
    };

    this.__render = function(list) {
        var tpl = '<li class="util-sug-item" data-key="#{0}"#{1}>#{0}</li>';
        var attr = ' data-#{0}=#{1}';
        var html = '';
        var data_str = [];

        for (var i = 0, len = list.length; i < len; i++) {
            if (this.op.dataType === 'object') {
                for (var _o in list[i]) {
                    if (list[i].hasOwnProperty(_o) && _o !== this.op.useField) {
                        data_str.push(this.format(attr, _o, list[i][_o]));
                    }
                }
                html += this.format(tpl, list[i][this.op.useField], data_str.join(''));
            } else {
                html += this.format(tpl, list[i]);
            }
        }

        return html;
    };

    // filter matches data 
    // data filter should be done here! Instead of __filter
    this.filter = function(data) {
        var result = {};
        var _type = Object.prototype.toString.call(data);

        // the data with sort message
        if (_type === "[object Object]") {
            for (var o in data) {
                if (data.hasOwnProperty(o)) {
                    result[o] = this.__filter(data[o]);
                    if (!result[o].length) {
                        try {
                            delete result[o];
                        } catch(e) {}
                    }
                }
            }
        // common data
        } else if (_type === "[object Array]") {
            result = this.__filter(data);
            // smarty filter
            if (result.length == 1 && this.op.smartyFilter) {
                if (this.op.dataType === 'object' && result[0][this.op.useField] === this.hisKey) {
                    result.length = 0;
                } else if (result[0] === this.hisKey) {
                    result.length = 0;
                }
            }

        }

        return result;
    };

    // private function
    this.__filter = function(data) {
        var prefix = this.hisKey;
        var patten = new RegExp('^' + prefix);
        var __to = Object.prototype.toString;
        var match = [];
        var tmp;

        for (var i = 0, len = data.length; i < len; i++) {
            tmp = data[i];
            if (__to.call(tmp) === "[object Object]") {
                tmp = tmp.hasOwnProperty(this.op.useField) ? tmp[this.op.useField] : "";
                this.op.dataType = 'object';
            }

            if (patten.test(tmp)) {
                // important!!! there should be push data[i]
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

        this.op.sugDom.on('mouseenter', '.util-sug-item', function() {
            var $this = $(this);
            _this.op.sugDom.find('li').removeClass('util-sug-hover') && $this.addClass('util-sug-hover');
        }).on('mouseleave', '.util-sug-item', function() {
            var $this = $(this);
            $this.removeClass('util-sug-hover');
        // do what when li has been clicked
        }).on('click', '.util-sug-item', function() {
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
            var $li = _this.op.sugDom.find('.util-sug-item');
            var cur = _this.op.sugDom.find('li.util-sug-hover');
            var active = null;
            // up
            if (e.keyCode == 38) {
                var prev = cur.prevAll('.util-sug-item').eq(0);
                active = cur.length ? (prev.length ? prev : [].pop.call($li)) : [].pop.call($li);
            // down
            } else if (e.keyCode == 40) {
                var next = cur.nextAll('.util-sug-item').eq(0);
                active = cur.length ? (next.length ? next : $li.get(0)) : $li.get(0);
            }

            if (active) {
                active = $(active);
                // TODO choose which to use!!!
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
        dataList: null,
        targetDom: null,
        // empty candidate result when there has an only sug
        smartyFilter: true,
        // the type of bind data
        dataType: 'string', // 'object'
        // which field to use when dataType is 'object'
        // and other fields where store in data-{{xx}}
        useField: 'name'
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

// TODO LIST
// 1. too long
