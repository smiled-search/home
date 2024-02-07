
/**
 * kit.dom.parseDOM
 * 对 core.dom.builder 返回的列表进行过滤
 * 对传入的list遍历一次，每个成员数组，如果只包含一个dom就直接返回该dom；如果包含多个dom则不处理，直接返回数组
 * @id STK.kit.dom.parseDOM
 * @author WK | wukan@staff.sina.com.cn
 * @example
    var buffer = STK.core.dom.builder($.E("example"));
    buffer.list = STK.kit.dom.parseDOM(buffer.list);
 */
STK.register('kit.dom.parseDOM', function($){
    return function(list){
        for(var a in list){
            if(list[a] && (list[a].length == 1)){
                list[a] = list[a][0];
            }
        }
        return list;
    };
});;

STK.register('kit.extra.language', function($){
    window.$LANG || (window.$LANG = {});
    return function(temp, data){
        var str = $.core.util.language(temp, $LANG);
        str = str.replace(/\\}/ig, '}');
        if(data){
            str =  $.templet(str, data);
        }
        return str;
    };
    
});;

/**
 * author Robin Young | yonglin@staff.sina.com.cn
 * 
 */

STK.register('kit.extra.reuse', function($){
    return function(createFn,spec){
        var conf, that, cache;
        conf = $.parseParam({}, spec);
        cache = [];
        var create = function(){
            var ret = createFn();
            cache.push({
                'store' : ret,
                'used' : true
            });
            return ret;
        };
        var setUsed = function(obj){
            $.foreach(cache,function(item, index){
                if(obj === item['store']){
                    item['used'] = true;
                    return false;
                }
            });
        };
        var setUnused = function(obj){
            $.foreach(cache,function(item, index){
                if(obj === item['store']){
                    item['used'] = false;
                    return false;
                }
            });
        };
        var getOne = function(){
            for(var i = 0, len = cache.length; i < len; i += 1){
                if(cache[i]['used'] === false){
                    cache[i]['used'] = true;
                    return cache[i]['store'];
                }
            };
            return create();
        };
        that = {};
        that.setUsed = setUsed;
        that.setUnused = setUnused;
        that.getOne = getOne;
        that.getLength = function(){
            return cache.length;
        };
        return that;
    };
});;

/**
 * 层
 * @id STK.module.layer
 * @param {String} template html
 * @example 
 * 
 * var a = STK.module.layer('<div node-type="outer"><div node-type="title"></div><div node-type="inner"></div></div>');
 * document.body.appendChild(a.getDom("outer"));
 * a.show();
 * a.getDom("title");
 * @author Robin Young | yonglin@staff.sina.com.cn
 *      Finrila | wangzheng4@staff.sina.com.cn
 */

STK.register('module.layer', function($){
    var getSize = function(box){
        var ret = {};
        if (box.style.display == 'none') {
            box.style.visibility = 'hidden';
            box.style.display = '';
            ret.w = box.offsetWidth;
            ret.h = box.offsetHeight;
            box.style.display = 'none';
            box.style.visibility = 'visible';
        }
        else {
            ret.w = box.offsetWidth;
            ret.h = box.offsetHeight;
        }
        return ret;
    };
    var getPosition = function(el, key){
        key = key || 'topleft';
        var posi = null;
        if (el.style.display == 'none') {
            el.style.visibility = 'hidden';
            el.style.display = '';
            posi = $.core.dom.position(el);
            el.style.display = 'none';
            el.style.visibility = 'visible';
        }
        else {
            posi = $.core.dom.position(el);
        }
        
        if (key !== 'topleft') {
            var size = getSize(el);
            if (key === 'topright') {
                posi['l'] = posi['l'] + size['w'];
            }
            else 
                if (key === 'bottomleft') {
                    posi['t'] = posi['t'] + size['h'];
                }
                else 
                    if (key === 'bottomright') {
                        posi['l'] = posi['l'] + size['w'];
                        posi['t'] = posi['t'] + size['h'];
                    }
        }
        return posi;
    };
    
    return function(template){
        var dom = $.core.dom.builder(template);
        var outer = dom.list['outer'][0]
            ,inner = dom.list['inner'][0];
        var uniqueID = $.core.dom.uniqueID(outer);
        var that = {};
        //事件 显示 隐藏
        var custKey = $.core.evt.custEvent.define(that, "show");
        $.core.evt.custEvent.define(custKey, "hide");
        
        var sizeCache = null;
        /**
         * 显示
         * @method show
         * @return {Object} this
         */
        that.show = function(){
            outer.style.display = '';
            $.core.evt.custEvent.fire(custKey, "show");
            return that;
        };
        /**
         * 隐藏
         * @method hide
         * @return {Object} this
         */
        that.hide = function(){
            outer.style.display = 'none';
            //modify by zhaobo 201105111623 转发私信层Ctrl+Enter提交后到此处会有报错。原因未知。添加timeout，问题解决。
            //window.setTimeout(function(){$.core.evt.custEvent.fire(custKey, "hide");}, 0);
            $.custEvent.fire(custKey, "hide");
            return that;
        };
        /**
         * 层位置获取
         * @method getPosition
         * @param {String} key
         *      topleft: 左上 topright: 右上 bottomleft: 左下 bottomright: 右下
         * @return {Object} 
         * {
         *  l: ,//左位置
         *  t: //上位置
         * }
         */
        that.getPosition = function(key){
            return getPosition(outer, key);
        };
        /**
         * 层大小获取
         * @method getSize
         * @param {Boolean} isFlash 是否重新获取大小
         * @return {Object} 
         * {
         *  w: ,//宽度
         *  h: //高度
         * }
         */
        that.getSize = function(isFlash){
            if(isFlash || !sizeCache){
                sizeCache = getSize.apply(that, [outer]);
            }
            return sizeCache;
        };
        /**
         * 设置html
         * @method html
         * @param {String} html html字符串
         * @return {Object} this
         */
        that.html = function(html){
            if (html !== undefined) {
                inner.innerHTML = html;
            }
            return inner.innerHTML;
        };
        /**
         * 设置文本
         * @method html
         * @param {String} str 字符串
         * @return {Object} this
         */
        that.text = function(str){
            if (text !== undefined) {
                inner.innerHTML = $.core.str.encodeHTML(str);
            }
            return $.core.str.decodeHTML(inner.innerHTML);
        };
        /**
         * 添加子节点
         * @method appendChild
         * @param {Node} node 子节点
         * @return {Object} this
         */
        that.appendChild = function(node){
            inner.appendChild(node);
            return that;
        };
        /**
         * 返回node的iniqueID
         * @method getIniqueID
         * @return {String} uniqueID 
         */
        that.getUniqueID = function(){
            return uniqueID;
        };
        /**
         * 返回outer
         * @method getOuter
         * @return {Node} outer
         */
        that.getOuter = function(){
            return outer;
        };
        /**
         * 返回inner
         * @method getInner
         * @return {Node} inner
         */
        that.getInner = function(){
            return inner;
        };
        /**
         * 返回outer node的父节点
         * @method getParentNode
         * @return {Node} outer的父节点 
         */
        that.getParentNode = function(){
            return outer.parentNode;
        };
        /**
         * 返回节点node-type列表对象
         * @method getDomList
         * @return {Object} 列表对象
         */
        that.getDomList = function(){
            return dom.list;
        };
        /**
         * 返回某个node-type对应的节点列表
         * @method getDomList
         * @return {Object} 列表对象
         */
        that.getDomListByKey = function(key){
            return dom.list[key];
        };
        /**
         * 返回使用node-type="xxx"定义的节点
         * @method getDom
         * @param {String} key 节点node-type值
         * @param {number} index 节点数组的下标 默认为0
         * @return {Node} 对应的节点
         */
        that.getDom = function(key, index){
            if(!dom.list[key]){
                return false;
            }
            return dom.list[key][index || 0];
        };
        /**
         * 返回cascaded节点
         * @method getCascadeDom
         * @param {String} key 节点node-type值
         * @param {number} index 节点数组的下标 默认为0
         * @return {Node} 对应的cascaded节点
         */
        that.getCascadeDom = function(key,index){
            if(!dom.list[key]){
                return false;
            }
            return $.core.dom.cascadeNode(dom.list[key][index || 0]);
        };
        return that;
    };
});
;

undefined
undefined
/**
 * 对话框
 * 事件show,hide,resize,change
 * @id STK.module.dialog
 * @param {String} html 对话框节点字符串 必须的node-type:outer inner title close
 * @param {Object} option
 * {
 *      top:undefined //与页面body的上距离
 *      ,left:undefined //与页面body的左距离
 *      ,width:auto //对话框内宽
 *      ,height:auto //对话框内高
 *      ,align:{type:'c', offset:[0,0]} //类似于 fix中的 type 和offset参数  不传时不支持固定
 *      ,dragable:true //true/false 是否支持移动功能
 * }
 * 
 * @return {Object} 
 * @author Robin Young | yonglin@staff.sina.com.cn
 * @example 
 * 
 * @import STK.core.dom.builder
 * @import STK.core.dom.setStyle
 * @import STK.core.dom.removeNode
 * @import STK.core.evt.custEvent
 * @import STK.core.util.fix
 */

undefined

STK.register('module.dialog', function($){
//  var setPosition = function(){
//      box.style.top = spec.t + 'px';
//      box.style.left = spec.l + 'px';
//      return that;
//  };
    
    return function(template, spec){
        if(!template){
            throw 'module.dialog need template as first parameter';
        }
        var conf,layer,that,box,title,content,close,titleContent,supportEsc,beforeHideFn,diaHide,sup;
        supportEsc = true;
        var escClose = function(){
            if(supportEsc !== false){
                layer.hide();
            }
        };
        var init = function(){
            conf = $.parseParam({
                't' : null,
                'l' : null,
                'width' : null,
                'height' : null
            },spec);
            layer = $.module.layer(template,conf);
            box = layer.getOuter();
            title = layer.getDom('title');
            titleContent = layer.getDom('title_content');
            content = layer.getDom('inner');
            close = layer.getDom('close');
            $.addEvent(close,'click',function(){
                diaHide();
            });
            
            $.custEvent.add(layer, 'show', function(){
                $.hotKey.add(document.documentElement, ['esc'], escClose, {'type' : 'keyup', 'disableInInput' : true});
            });
            $.custEvent.add(layer, 'hide', function(){
                window.FrameClient && FrameClient.diaAutoHide && FrameClient.diaAutoHide();
                $.hotKey.remove(document.documentElement, ['esc'], escClose, {'type' : 'keyup'});
                supportEsc = true;
            });
            
        };
        init();
        sup = $.objSup(layer, ['show', 'hide']);
        diaHide =  function(isForce) {
            if(typeof beforeHideFn === 'function' && !isForce){
                if(beforeHideFn() === false){
                    return false;
                }
            }
            sup.hide();
            if($.contains(document.body, layer.getOuter())) {
                document.body.removeChild(layer.getOuter());
            }
            return that;
        };


        that = layer;

        that.show = function() {
            if(!$.contains(document.body, layer.getOuter())) {
                document.body.appendChild(layer.getOuter());
            }
            sup.show();
            return that;
        };
        that.hide = diaHide;
        
        that.setPosition = function(pos){
            box.style.top = pos['t'] + 'px';
            box.style.left = pos['l'] + 'px';
            return that;
        };
        that.setLayerXY = function(pNode, iframeWidth){
            var pNodePosition = $.core.dom.position(pNode);
            if(!iframeWidth){
                iframeWidth = 760;
            }
            var pNodeWidth = pNode.offsetWidth;           //参照节点的宽
            var pNodeHeight = pNode.offsetHeight;
            var dia = layer.getSize(true)
            var tipPositionLeft = pNodePosition.l + (pNodeWidth - dia.w) / 2;             //tip初始位置
            var tipPositionTop = pNodePosition.t - dia.h;
            //如果tip跳出了iframe框，则向左移动 //为啥这么判断啊？kongbo
            if(window.FrameClient && tipPositionLeft + dia.w > iframeWidth){
                tipPositionLeft = iframeWidth - dia.w;
            }
            else if(tipPositionLeft<0){
                tipPositionLeft = 0;
            }
            box.style.top = tipPositionTop + 'px';
            box.style.left = tipPositionLeft + 'px';
            return that;
        };
        that.setMiddle = function(){
            var win = $.core.util.winSize();
            var dia = layer.getSize(true);
            var _top;
            box.style.left = (win.width - dia.w)/2 + 'px';
            //iframe top计算
            if(window.FrameClient && FrameClient.getLayoutInfo){
                FrameClient.getLayoutInfo(function(_pos){
                    if(typeof _pos == 'string'){_pos = $.strToJson(_pos);}
                    _top = (_pos.parent.scroll.top - _pos.iframe.position.top) + (_pos.parent.size.height - dia.h)/2;
                    var limit = win.height - dia.h;
                    if(limit < _top){
                        _top = limit;
                    }
                    box.style.top = ((parseInt(_top) > 30)?_top:30) + 'px';
                    window.FrameClient && FrameClient.diaAutoHeight && FrameClient.diaAutoHeight(box);
                });
                return that;
            }
            _top = $.core.util.scrollPos()['top'] + (win.height - dia.h)/2;
            box.style.top = ((parseInt(_top) > 30)?_top:30) + 'px';
            return that;
        };
        that.setTitle = function(txt){
            titleContent.innerHTML = txt;
            return that;
        };
        that.setContent = function(cont){
            if(typeof cont === 'string'){
                content.innerHTML = cont;
            }else{
                content.appendChild(cont);
            }
            return that;
        };
        that.clearContent = function(){
            while(content.children.length){
                $.removeNode(content.children[0]);
            }
            return that;
        };
        that.setAlign = function(){
            
        };
        that.setBeforeHideFn = function(fn){
            beforeHideFn = fn;
        };
        that.clearBeforeHideFn = function(){
            beforeHideFn = null;
        }
        that.unsupportEsc = function(){
            supportEsc = false;
        };
        that.supportEsc = function(){
            supportEsc = true;
        };
        return that;
        
    };
});
;

/**
 * 遮罩工具
 * @id STK.core.util.mask
 * @author Finrila|wangzheng4@staff.sina.com.cn
 * @example 
 * STK.core.util.mask.show()
 * STK.core.util.mask.showUnderNode(node)
 * STK.core.util.mask.hide()
 */

/**
 * node位置固定
 * @id  STK.kit.dom.fix
 * @param {Node} node 要进行位置固定的节点
 * @param {String} type 'c|lt|lb|rt|rb'//类型 c:中心,lt:左上,lb:左下,rt:右上,rb:右下
 * @param {Array} offset 
 * [//相对位置的边距 中心时相对左上
 *  0,//和边框的横向距离 type == 'c'时无效
 *  0//和边框的纵向距离 type == 'c'时无效
 * ]
 * @return {Object} fix
 * 
 * @author Finrila|wangzheng4@staff.sina.com.cn
 * @example 
 * var a = STK.kit.dom.fix(STK.E("test"), "lb");
 * a.destroy();
 * 
 * @import STK.core.obj.parseParam
 * @import STK.core.dom.isNode
 * @import STK.core.util.browser
 * @import STK.core.util.winSize
 * @import STK.core.util.scrollPos
 * @import STK.core.arr.isArray
 * @import STK.core.evt.addEvent
 * @import STK.core.evt.removeEvent
 * @import STK.core.evt.custEvent
 * //3.51
 */

//;alert("E:\weibo-mobile/chess2/js/core/obj/parseParam.js does not exsist!");;

//;alert("E:\weibo-mobile/chess2/js/core/dom/isNode.js does not exsist!");;

//;alert("E:\weibo-mobile/chess2/js/core/util/browser.js does not exsist!");;

//;alert("E:\weibo-mobile/chess2/js/core/util/winSize.js does not exsist!");;

//;alert("E:\weibo-mobile/chess2/js/core/util/scrollPos.js does not exsist!");;

//;alert("E:\weibo-mobile/chess2/js/core/arr/isArray.js does not exsist!");;

//;alert("E:\weibo-mobile/chess2/js/core/evt/addEvent.js does not exsist!");;

//;alert("E:\weibo-mobile/chess2/js/core/evt/removeEvent.js does not exsist!");;

//;alert("E:\weibo-mobile/chess2/js/core/evt/custEvent.js does not exsist!");;

/**
 * 样式缓存及合并
 * @id STK.kit.dom.cssText
 * @param {String} oldCss 旧的cssText
 * @author Finrila|wangzheng4@staff.sina.com.cn
 * @example 
 * var a = STK.kit.dom.cssText(STK.E("test").style.cssText);
 * a.push("width", "3px").push("height", "4px");
 * STK.E("test").style.cssText = a.getCss();
 */

STK.register("kit.dom.cssText", function($) {
    
    var _getNewCss = function(oldCss, addCss) {
        // 去没必要的空白
        var _newCss = (oldCss + ";" + addCss)
            .replace(/(\s*(;)\s*)|(\s*(:)\s*)/g, "$2$4"), _m;
        //循环去除前后重复的前的那个 如 width:9px;height:0px;width:8px; -> height:0px;width:8px;
        while(_newCss && (_m = _newCss.match(/(^|;)([\w\-]+:)([^;]*);(.*;)?\2/i))) {
            _newCss = _newCss.replace(_m[1]+_m[2]+_m[3], "");
        }
        return _newCss;
    };
    
    return function(oldCss) {
        oldCss = oldCss || "";
        var _styleList = [],
            that = {
                /**
                 * 向样式缓存列表里添加样式
                 * @method push
                 * @param {String} property 属性名
                 * @param {String} value 属性值
                 * @return {Object} this
                 */
                push: function(property, value) {
                    _styleList.push(property + ":" + value);
                    return that;
                }
                /**
                 * 从样式缓存列表删除样式
                 * @method remove
                 * @param {String} property 属性名
                 * @return {Object} this
                 */
                ,remove: function(property) {
                    for(var i = 0; i < _styleList.length; i++) {
                        if(_styleList[i].indexOf(property+":") == 0) {
                            _styleList.splice(i, 1);
                        }
                    }
                    return that;
                }
                /**
                 * 返回样式缓存列表
                 * @method getStyleList
                 * @return {Array} styleList
                 */
                ,getStyleList: function() {
                    return _styleList.slice();
                }
                /**
                 * 得到·
                 * @method getCss
                 * @param {String} property 属性名
                 * @param {String} value 属性值
                 * @return {Object} this
                 */
                ,getCss: function() {
                    return _getNewCss(oldCss, _styleList.join(";"));
                }
            };
        return that;
    };
});;


STK.register("kit.dom.fix", function($) {
    //dom 扩展数据
    var _canFix = !($.core.util.browser.IE6 || (document.compatMode !== "CSS1Compat" && STK.IE)),
        _typeReg = /^(c)|(lt)|(lb)|(rt)|(rb)$/;
    
    function _visible(node) {
        return $.core.dom.getStyle(node, "display") != "none";
    }
    
    function _createOffset(offset) {
        offset = $.core.arr.isArray(offset) ? offset : [0, 0];
        for(var i = 0; i < 2; i++) {
            if(typeof offset[i] != "number") offset[i] = 0;
        }
        return offset;
    }
    
    //处理div位置
    function _draw(node, type, offset) {
        if(!_visible(node)) return;
        var _position = "fixed", _top, _left, _right, _bottom
            ,_width = node.offsetWidth,_height = node.offsetHeight
            , _winSize = $.core.util.winSize(), _limitTop = 0, _limitLeft = 0
            ,_cssText = $.kit.dom.cssText(node.style.cssText);
        if (!_canFix) {
            _position = 'absolute';
            var _scrlPos = $.core.util.scrollPos();
            _limitTop = _top = _scrlPos.top;
            _limitLeft = _left = _scrlPos.left;
            switch(type) {
                case 'lt'://左上
                    _top += offset[1];
                    _left += offset[0];
                break;
                case 'lb'://左下
                    _top += _winSize.height - _height - offset[1];
                    _left += offset[0];
                break;
                case 'rt'://右上
                    _top += offset[1];
                    _left += _winSize.width - _width - offset[0];
                break;
                case 'rb'://右下
                    _top += _winSize.height - _height - offset[1];
                    _left += _winSize.width - _width - offset[0];
                break;
                case 'c'://中心
                default:
                    _top += (_winSize.height - _height) / 2 + offset[1];
                    _left += (_winSize.width - _width) / 2 + offset[0];
            }
            _right = _bottom = "";
        } else {
            _top = _bottom = offset[1];
            _left = _right = offset[0];
            switch(type) {
                case 'lt'://左上
                    _bottom = _right = "";
                break;
                case 'lb'://左下
                    _top = _right = "";
                break;
                case 'rt'://右上
                    _left = _bottom = "";
                break;
                case 'rb'://右下
                    _top = _left = "";
                break;
                case 'c'://中心
                default:
                    _top = (_winSize.height - _height) / 2 + offset[1];
                    _left = (_winSize.width - _width) / 2 + offset[0];
                    _bottom = _right = "";
            }
        }
        if(type == 'c') {
            if(_top < _limitTop) _top = _limitTop;
            if(_left < _limitLeft) _left = _limitLeft;
        }
        _cssText.push("position", _position)
               .push("top", _top+"px")
               .push("left", _left+"px")
               .push("right", _right+"px")
               .push("bottom", _bottom+"px");
        node.style.cssText = _cssText.getCss();
    }

    return function(node, type, offset) {
        var _type, _offset, _fixed = true, _ceKey;
        if($.core.dom.isNode(node) && _typeReg.test(type)) {
            var that = {
                /**
                 * 得到节点
                 * @method getNode
                 * @return {Node}
                 */
                getNode: function() {
                    return node;
                },
                /**
                 * 检测位置固定的可用性
                 * @method isFixed
                 * @return {Boolean}
                 */
                isFixed: function() {
                    return _fixed;
                },
                
                /**
                 * 设置位置固定的可用性
                 * @method setFixed
                 * @param {Boolean} fixed 位置固定的可用性
                 * @return {Object} this
                 */
                setFixed: function(fixed) {
                    (_fixed = !!fixed) && _draw(node, _type, _offset);
                    return this;
                },
                /**
                 * 设置对齐方式 
                 * @method setAlign
                 * @param {String} type
                 * @param {Array} offset 
                 * [
                 *  0,//和边框的横向距离 type == 'c'时无效
                 *  0//和边框的纵向距离 type == 'c'时无效
                 * ]
                 * @return  {Object} this
                 */
                setAlign: function(type, offset) {
                    if(_typeReg.test(type)) {
                        _type = type;
                        _offset = _createOffset(offset);
                        _fixed && _draw(node, _type, _offset);
                    }
                    return this;
                },
                /**
                 * 销毁
                 * @method destroy
                 * @return {void}
                 */
                destroy: function() {
                    if (!_canFix) {
                        _canFix && $.core.evt.removeEvent(window, "scroll", _evtFun);
                    }
                    $.core.evt.removeEvent(window, "resize", _evtFun);
                    $.core.evt.custEvent.undefine(_ceKey);
                }
            };
            _ceKey = $.core.evt.custEvent.define(that, "beforeFix");
            that.setAlign(type, offset);
            function _evtFun(event) {
                event = event || window.event;
                /**
                 * 系统事件导致的重绘前事件
                 * @event beforeFix
                 * @param {String} type 事件类型  scroll/resize
                 */
                $.core.evt.custEvent.fire(_ceKey, "beforeFix", event.type);
                if(_fixed && (!_canFix || _type == "c")) {
                    _draw(node, _type, _offset);
                }
            };
            if (!_canFix) {
                $.core.evt.addEvent(window, "scroll", _evtFun);
            }
            $.core.evt.addEvent(window, "resize", _evtFun);
            return that;
        }
    };
});
;


STK.register("module.mask", function($) {
    var maskNode,
        nodeRegList = [],
        domFix,
        maskInBody = false,
        maskNodeKey = "STK-Mask-Key";
    
    var setStyle = $.core.dom.setStyle,
        getStyle = $.core.dom.getStyle,
        custEvent = $.core.evt.custEvent;
    
    //初始化遮罩容器
    function initMask() {
        maskNode = $.C("div");
        var _html = '<div node-type="outer">'
        if ($.core.util.browser.IE6) {
            //'<iframe style="position:absolute;z-index:-1;width:100%;height:100%;filter:mask();"></iframe>'+
            _html += '<div style="position:absolute;width:100%;height:100%;"></div>';
        }
        _html += '</div>';
        maskNode = $.builder(_html).list["outer"][0];
        document.body.appendChild(maskNode);
        maskInBody = true;
        domFix = $.kit.dom.fix(maskNode, "lt");
        var _beforeFixFn = function () {
            var _winSize = $.core.util.winSize();
            maskNode.style.cssText = $.kit.dom.cssText(maskNode.style.cssText)
                    .push("width", _winSize.width + "px")
                    .push("height", _winSize.height + "px").getCss();
        };
        custEvent.add(domFix, "beforeFix", _beforeFixFn);
        _beforeFixFn();
    }
    
    function getNodeMaskReg(node) {
        var keyValue;
        if(!(keyValue = node.getAttribute(maskNodeKey))) {
            node.setAttribute(maskNodeKey, keyValue = $.getUniqueKey());
        }
        return '>'+node.tagName.toLowerCase() + '['+maskNodeKey+'="'+keyValue+'"]';
    }
    
    var that = {
        
        getNode: function() {
            return maskNode;
        },
        /**
         * 显示遮罩
         * @method show
         * @static
         * @param {Object} option 
         * {
         *   opacity: 0.5,
         *   background: "#000000"
         * }
         */
        show: function(option, cb) {
            if (maskInBody) {
                option = $.core.obj.parseParam({
                    opacity: 0,
                    background: "#000000"
                }, option);
                maskNode.style.background = option.background;
                setStyle(maskNode, "opacity", option.opacity);
                maskNode.style['opacity'] = option.opacity;
                maskNode.style.display = "";
                domFix.setAlign("lt");
                cb && cb();
            } else {
                $.Ready(function() {
                    initMask();
                    that.show(option, cb);
                });
            }
            return that;
        },
        /**
         * 隐藏遮罩
         * @method hide
         * @static
         * @param {Node} node 
         */
        hide: function() {
            maskNode.style.display = "none";
            nowIndex = undefined;
            nodeRegList = [];
            return that;
        },
        /**
         * 将node显示于遮罩之上
         * @method showUnderNode
         * @static
         * @param {Node} node 
         * @param {Object} option 
         * {
         *   opacity: 0.5,
         *   background: "#000000"
         * }
         */
        showUnderNode: function(node, option) {
            if ($.isNode(node)) {
                that.show(option, function() {
                    setStyle(maskNode, 'zIndex', getStyle(node, 'zIndex'));
                    var keyValue = getNodeMaskReg(node);
                    var keyIndex = $.core.arr.indexOf(nodeRegList, keyValue);
                    if(keyIndex != -1) {
                        nodeRegList.splice(keyIndex, 1);
                    }
                    nodeRegList.push(keyValue);
                    $.core.dom.insertElement(node, maskNode, "beforebegin");
                });
            }
            return that;
        },
        back: function() {
            if(nodeRegList.length < 1) return that;
            var node,
                nodeReg;
            nodeRegList.pop();
            if(nodeRegList.length < 1) {
                that.hide();
            } else if((nodeReg = nodeRegList[nodeRegList.length - 1]) && (node = $.sizzle(nodeReg, document.body)[0])) {
                setStyle(maskNode, 'zIndex', getStyle(node, 'zIndex'));
                $.core.dom.insertElement(node, maskNode, "beforebegin");
            } else {
                that.back();
            }
            return that;
        },
        /**
         * 销毁
         * @method destroy
         */
        destroy: function() {
            custEvent.remove(domFix);
            maskNode.style.display = "none";
            lastNode = undefined;
            _cache = {};
        }
    };
    return that;
});
;

STK.register('kit.dom.drag',function($){
    
    return function(actDom,spec){
        var conf,that,beDragged,dragState,dragObj,perch,perchIn,perchAction;
        
        var init = function(){
            initParams();
            bindEvent();
        };
        
        var initParams = function(){
            conf = $.parseParam({
                'moveDom' : actDom,
                'perchStyle' : 'border:solid #999999 2px;',
                'dragtype' : 'perch',
                'actObj' : {},
                'pagePadding' : 5
            }, spec);
            beDragged = conf.moveDom;
            that = {};
            dragState = {};
            dragObj = $.drag(actDom, {
                'actObj' : conf.actObj
            });
            if(conf['dragtype'] === 'perch'){
                perch = $.C('div');
                perchIn = false;
                perchAction = false;
                beDragged = perch;
            }
            actDom.style.cursor = 'move';
        };
        
        var bindEvent = function(){
            $.custEvent.add(conf.actObj, 'dragStart', dragStart);
            $.custEvent.add(conf.actObj, 'dragEnd', dragEnd);
            $.custEvent.add(conf.actObj, 'draging', draging);
        };
        
        
        
        var dragStart = function(evt, op){
            document.body.style.cursor = 'move';
            var p = $.core.util.pageSize()['page'];
            dragState = $.core.dom.position(conf.moveDom);
            dragState.pageX     = op.pageX;
            dragState.pageY     = op.pageY;
            dragState.height    = conf.moveDom.offsetHeight;
            dragState.width     = conf.moveDom.offsetWidth;
            dragState.pageHeight= p['height'];
            dragState.pageWidth = p['width'];
            if(conf['dragtype'] === 'perch'){
                var style = [];
                style.push(conf['perchStyle']);
                style.push('position:absolute');
                style.push('z-index:' + (conf.moveDom.style.zIndex + 10));
                style.push('width:' + conf.moveDom.offsetWidth + 'px');
                style.push('height:' + conf.moveDom.offsetHeight + 'px');
                style.push('left:' + dragState['l'] + 'px');
                style.push('top:' + dragState['t'] + 'px');
                perch.style.cssText = style.join(';');
                perchAction = true;
                setTimeout(function(){
                    if(perchAction){
                        document.body.appendChild(perch);
                        perchIn = true;
                    }
                },100);
            }
            if (actDom.setCapture !== undefined) {
                actDom.setCapture();
            }
        };
        
        var dragEnd = function(evt, op){
            document.body.style.cursor = 'auto';
            if (actDom.setCapture !== undefined) {
                actDom.releaseCapture();
            }
            if(conf['dragtype'] === 'perch'){
                perchAction = false;
                conf.moveDom.style.top = perch.style.top;
                conf.moveDom.style.left = perch.style.left;
                if(perchIn){
                    document.body.removeChild(perch);
                    perchIn = false;
                }
            }
        };
        
        var draging = function(evt, op){
            var y = dragState.t + (op.pageY - dragState.pageY);
            var x = dragState.l + (op.pageX - dragState.pageX);
            var yandh = y + dragState['height'];
            var xandw = x + dragState['width'];
            var pageh = dragState['pageHeight'] - conf['pagePadding'];
            var pagew = dragState['pageWidth'] - conf['pagePadding'];
            if(yandh < pageh && y > 0){
                beDragged.style.top = y + 'px';
            }else{
                if(y < 0){
                    beDragged.style.top = '0px';
                }
                if(yandh >= pageh){
                    beDragged.style.top = pageh - dragState['height'] + 'px';
                }
            }
            if(xandw < pagew && x > 0){
                beDragged.style.left = x + 'px';
            }else{
                if(x < 0){
                    beDragged.style.left = '0px';
                }
                if(xandw >= pagew){
                    beDragged.style.left = pagew - dragState['width'] + 'px';
                }
            }
        };
        
        init();
        that.destroy = function(){
            document.body.style.cursor = 'auto';
            if (typeof beDragged.setCapture === 'function') {
                beDragged.releaseCapture();
            }
            if(conf['dragtype'] === 'perch'){
                perchAction = false;
                if(perchIn){
                    document.body.removeChild(perch);
                    perchIn = false;
                }
            }
            $.custEvent.remove(conf.actObj, 'dragStart', dragStart);
            $.custEvent.remove(conf.actObj, 'dragEnd', dragEnd);
            $.custEvent.remove(conf.actObj, 'draging', draging);
            if(dragObj.destroy){
                dragObj.destroy();
            }
            conf = null;
            beDragged = null;
            dragState = null;
            dragObj = null;
            perch = null;
            perchIn = null;
            perchAction = null;
        };
        that.getActObj = function(){
            return conf.actObj;
        };
        return that;
    };
});;


/**
 * author Robin Young | yonglin@staff.sina.com.cn
 */

STK.register('ui.dialog',function($){
    var TEMP = '' +
    '<div class="W_layer" node-type="outer" style="display:none;position:absolute;z-index:10001">' +
        '<div class="bg">' +
            '<table border="0" cellspacing="0" cellpadding="0">' +
                    '<tr><td>' +
                        '<div class="content">' +
                            '<div class="title" node-type="title"><span node-type="title_content"></span></div>' +
                            '<a href="javascript:void(0);" class="W_close" title="#L{关闭}" node-type="close"></a>' +
                            '<div node-type="inner"></div>' +
                        '</div>' +
                    '</td></tr>' +
            '</table>' +
        '</div>' +
    '</div>';
    
    var lang = $.kit.extra.language;
    
    var cache = null;
    
    var createDialog = function(){
        var dia = $.module.dialog(lang(TEMP));
        $.custEvent.add(dia, 'show', function(){
            $.module.mask.showUnderNode(dia.getOuter());
        });
        $.custEvent.add(dia, 'hide', function(){
            $.module.mask.back();
            dia.setMiddle();
        });
        $.kit.dom.drag(dia.getDom('title'),{
            'actObj' : dia,
            'moveDom' : dia.getOuter()
        });
        dia.destroy = function(){
            clearDialog(dia);
            try{
                dia.hide(true);
            }catch(exp){
            
            }
        };
        return dia;
    };
    
    var clearDialog = function(dia){
        dia.setTitle('').clearContent();
        cache.setUnused(dia);
    };
    
    return function(spec){
        var conf = $.parseParam({
            'isHold' : false
        },spec);
        var isHold = conf['isHold'];
        conf = $.core.obj.cut(conf,['isHold']);
        if(!cache){
            cache = $.kit.extra.reuse(createDialog);
        }
        var that = cache.getOne();
        if(!isHold){
            $.custEvent.add(that, 'hide', function(){
                $.custEvent.remove(that,'hide',arguments.callee);
                clearDialog(that);
            });
        }
        return that;
    };
});;


/**
 * author Robin Young | yonglin@staff.sina.com.cn
 */

STK.register('ui.alert',function($){
    
    var TEMP = '' +
    '<div node-type="outer" class="layer_point">' +
        '<dl class="point clearfix">' +
            '<dt><span class="" node-type="icon"></span></dt>' +
            '<dd node-type="inner">'+
                '<p class="W_texta" node-type="textLarge"></p>'+
                '<p class="W_textb" node-type="textSmall"></p>'+
            '</dd>' +
        '</dl>' +
        '<div class="text_tips" node-type="textTip" style="display:none">' +
        '</div>' +
        '<div class="btn">'+
            '<a href="javascript:void(0)" class="W_btn_b" node-type="OK"></a>'+
        '</div>' +
    '</div>';
    
    var ICON = {
        'success' : 'icon_succM',
        'error' : 'icon_errorM',
        'warn' : 'icon_warnM',
        'delete' : 'icon_delM',
        'question' : 'icon_questionM'
    };
    
    var lang = $.kit.extra.language;
    
    var cache = null;
    
    var rend = function(alt, args){
        alt.getDom('icon').className = args['icon'];
        alt.getDom('textLarge').innerHTML = args['textLarge'];
        alt.getDom('textSmall').innerHTML = args['textSmall'];
        alt.getDom('textTip').innerHTML = args['textTip'];
        args['textTip'] && (alt.getDom('textTip').style.display = '');
        alt.getDom('OK').innerHTML = '<span>' + args['OKText'] + '</span>';
    };
    
    return function(info, spec){
        var conf, that, alt, dia, tm;
        conf = $.parseParam({
            'title' : lang('#L{提示}'),
            'icon' : 'warn',
            'textLarge' : info,
            'textSmall' : '',
            'textTip' : '',
            'OK' : $.funcEmpty,
            'OKText' : lang('#L{确定}'),
            'timeout' : 0
        }, spec);
        console.log(conf['OK'].toString());
        conf['icon'] = ICON[conf['icon']];
        that = {};
        
        if(!cache){
            cache = $.kit.extra.reuse(function(){
                var alt = $.module.layer(lang(TEMP));
                return alt;
            });
        }
        alt = cache.getOne();
        dia = $.ui.dialog();
        dia.setContent(alt.getOuter());
        dia.setTitle(conf['title']);
        
        rend(alt, conf);
        
        $.addEvent(alt.getDom('OK'), 'click', dia.hide);
        $.custEvent.add(dia, 'hide', function(){
            $.custEvent.remove(dia,'hide',arguments.callee);
            $.removeEvent(alt.getDom('OK'),'click',dia.hide);
            cache.setUnused(alt);
            clearTimeout(tm);
            conf['OK']();
        });
        
        if(conf['timeout']){
            tm = setTimeout(dia.hide,conf['timeout']);
        }
        
        dia.show().setMiddle();
        that.alt = alt;
        that.dia = dia;

        return that;
    };
});;

/**
 * 创建活动
 * @ 
 * @param {Object} 
 * @return {Object} 实例
 * @author kongbo | kongbo@staff.sina.com.cn
 * @example

    get : 获取ai的下一步走法, 
    backNext: 返回下一步走法.
 * 
 */
/**
 * 进一步封装core.util.listener, 增加白名单策略, 避免在项目中, 广播混乱
* @author FlashSoft | fangchao@staff.sina.com.cn
* @changelog WK | wukan@ move to common folder
* @changelog Finrila | wangzheng4@ add data_cache_get 
 */
STK.register('common.listener', function($){
    var listenerList = {};
    var that = {};
    /**
     * 创建广播白名单
     * @param {String} sChannel
     * @param {Array} aEventList
     */
    that.define = function(sChannel, aEventList){
        if (listenerList[sChannel] != null) {
            throw 'common.listener.define: 频道已被占用';
        }
        listenerList[sChannel] = aEventList;
        
        var ret = {};
        ret.register = function(sEventType, fCallBack){
            if (listenerList[sChannel] == null) {
                throw 'common.listener.define: 频道未定义';
            }
            $.listener.register(sChannel, sEventType, fCallBack);
        };
        ret.fire = function(sEventType,oData){
            if (listenerList[sChannel] == null) {
                throw 'commonlistener.define: 频道未定义';
            }
            $.listener.fire(sChannel, sEventType, oData);
        };
        ret.remove = function(sEventType, fCallBack){
            $.listener.remove(sChannel, sEventType, fCallBack);
        };
        
        /**
         * 使用者可以在任意时刻获取到listener缓存的(某频道+事件)最后一次触发(fire)的数据；如果没有fire过为undefined;
         * @method cache 
         * @param {String} sEventType
         */
        ret.cache = function(sEventType){
            return $.listener.cache(sChannel, sEventType);
        };
        return ret;
    };
    
    // that.register = function(sChannel, sEventType, fCallBack){
    //      if (listenerList[sChannel] == null) {
    //          throw 'common.listener.define: 频道未定义';
    //          
    //      }
    //      $.core.util.listener.register(sChannel, sEventType, fCallBack);
    //  };
    //  that.fire = function(sChannel, sEventType, oData){
    //      if (listenerList[sChannel] == null) {
    //          throw 'commonlistener.define: 频道未定义';
    //      }
    //      $.core.util.listener.fire(sChannel, sEventType, oData);
    //  };
    //  that.conn = function(){
    //  
    //  };
    return that;
});
;

STK.register('chess.link', function(STK){
    var space=['getNext','backNext'];
    return STK.common.listener.define("chess.link",space);
});;


STK.register("chess.init", function($) {
    return function(node) {
        var that = {};
        var _this = {
            DOM: {},
            objs: {
                //window.onresize时需要重绘的函数
                resizeArr: {
                    //onresize上一次触发的时间
                    preTime:0,
                    funList:[]
                },
                chessNext:'blue',

                //电脑默认是蓝方
                aiType:'blue'
            },
            DOMFun: {
                resize: function(){
                    var nowTime=new Date().getTime();
                    if((nowTime-_this.objs.resizeArr.preTime)<50) return false;    //两次间隔小于50ms不重复触发响应
                    _this.objs.resizeArr.preTime=nowTime;
                    STK.core.arr.foreach(_this.objs.resizeArr.funList, function(fun, i){
                        typeof fun == 'function'&& fun();
                    })
                },
                moveDot: function(event){
                    var thisSon=event.target;
                    if($.core.dom.hasClassName(thisSon,"dot")){
                        //点击dot，检测是否有棋子被选中
                        if(!_this.objs.thisSon) return false;
                        _this.DOMFun.toMove(thisSon);
                    }else{
                        //点击棋子，选中棋子.
                        thisSon=thisSon.parentNode;
                        if((_this.objs.thisSon&&(_this.objs.thisSon==thisSon))) return false;
                        //移动背景图片
                        if($.core.dom.hasClassName(thisSon,"chess")){
                            if(_this.objs.aiIs&&thisSon.getAttribute('node-type')==_this.objs.aiType&&_this.objs.chessNext==_this.objs.aiType) return false;

                            if(_this.objs.chessNext==thisSon.getAttribute('node-type')){
                                _this.DOMFun.moveBg(thisSon);
                                _this.objs.thisSon=thisSon;
                            }else if(_this.objs.thisSon&&_this.objs.chessNext==_this.objs.thisSon.getAttribute('node-type')){
                                var code=_this.DOMFun.toMove(thisSon);
                                if(code.code!='eat'){
                                    _this.objs.thisSon=thisSon;
                                }
                            }
                        }
                    }
                },

                moveBg: function(thisSon){
                    var pos={
                            t:thisSon.offsetTop,
                            l:thisSon.offsetLeft
                        },
                        bgImg=_this.DOM.dotBg,
                        size=$.core.dom.getSize(thisSon);
                    if(pos.t==pos.l&&pos.l==0){
                        var dot=document.querySelectorAll(".dot");
                        for(var i=0;i<90;i++){
                            if(dot[i].style.top==thisSon.style.top&&dot[i].style.left==thisSon.style.left){
                                thisSon=dot[i];
                                break;
                            }
                        }
                        pos={
                            t:thisSon.offsetTop,
                            l:thisSon.offsetLeft
                        }
                        size=$.core.dom.getSize(thisSon);
                    }
                    bgImg.style.display="block";
                    bgImg.style.top=(pos.t-size.height*0.1)+"px";
                    bgImg.style.left=(pos.l-size.width*0.1)+"px";
                    bgImg.width=size.width*1.2;
                    bgImg.height=size.height*1.2;
                },

                toMove: function(node){
                    if(_this.objs.thisSon.getAttribute('node-type') != _this.objs.chessNext) return false;
                    var code=_this.DOMFun.testMove(node);
                    if(!code) return false;
                    if(code.code=='eat'||code.code=='move'){
                        _this.DOMFun.goMove(node,code);
                        return code;
                    }else{
                        return false;
                    }
                },

                goMove: function(node,code){
                    var dotPos,top,left,sTime=0;
                    if(node.top === undefined){
                        dotPos=_this.DOMFun.getPos(node);
                        top=(dotPos.top?dotPos.top:'')+'2%';
                        left=(dotPos.left?dotPos.left:'')+'2%';
                    }else{
                        top=(node.top?node.top:'')+'2%';
                        left=(node.left?node.left:'')+'2%';
                        node=_this.objs.thisSon;
                        sTime=500;
                    }

                    _this.objs.thisSon.style.top=top;
                    _this.objs.thisSon.style.left=left;

                    _this.objs.chessNext=_this.objs.chessNext=='blue'?(function(){
                        STK.core.dom.addClassName(_this.DOM.tip,'red');
                        return 'red';
                    })():(function(){
                        STK.core.dom.removeClassName(_this.DOM.tip,'red');
                        return 'blue';
                    })();
                    setTimeout(function(){
                        _this.DOMFun.moveBg(node);
                    },sTime);
                    if(code.code=='eat'){
                        if(code.i){
                            $.core.dom.removeNode(_this.objs.chess[code.i].node);
                            _this.objs.chess.splice(code.i,1);
                        }else if(code.node){
                            $.core.dom.removeNode(node);
                            for(var i=0;i<_this.objs.chess.length;i++){
                                if(_this.objs.chess[i].node==node){
                                    _this.objs.chess.splice(i,1);
                                }
                            };
                        };
                    };
                    _this.DOMFun.testWin();
                },

                moveOver: function(){
                    if(_this.objs.aiIs&&_this.objs.chessNext=='blue'){
                        _this.DOMFun.goAi();
                    }
                },

                testWin: function(){
                    var boss=STK.core.dom.sizzle(".boss"),
                        blueBoss=_this.DOMFun.getPos(boss[0]),
                        redBoss=_this.DOMFun.getPos(boss[1]),
                        moveState='',
                        testPos={},
                        color='',
                        thisColor=_this.objs.thisSon.getAttribute("node-type");
                    if(boss.length<2){
                        color=boss[0].getAttribute('node-type');
                        $.ui.alert(color+'win',{
                            'OK':function(){
                                window.location.reload();
                            }
                        });
                        return color;
                    }else{
                        if(blueBoss.left==redBoss.left){
                            for(var i=0,len=_this.objs.chess.length;i<len;i++){
                                testPos=_this.DOMFun.getPos(_this.objs.chess[i].node);
                                if((testPos.left==blueBoss.left)&&(testPos.top<redBoss.top)&&(testPos.top>blueBoss.top)){
                                    _this.DOMFun.moveOver();
                                    return false;
                                }
                            }
                            $.ui.alert((thisColor=='red'?'blue':'red')+"win",{
                                'OK':function(){
                                    window.location.reload();
                                }
                            });
                            return false;
                        }
                    }
                    _this.DOMFun.moveOver();
                },

                testMove: function(node){
                    var thisSon=_this.objs.thisSon;
                    if(!thisSon) return false;
                    var formPos=_this.DOMFun.getPos(thisSon),
                        form=formPos,
                        retStat=[],
                        moveState='',
                        type=thisSon.getAttribute("data-type"),
                        dotPos=_this.DOMFun.getPos(node),
                        to=dotPos,
                        ftT=Math.abs(form.top-to.top),
                        ftL=Math.abs(form.left-to.left)
                        isChess=$.core.dom.hasClassName(node,'chess');
                    if(type=='ranker'){
                        if((ftL==1&&ftT==0)||(ftL==0&&ftT==1)){
                            if(thisSon.getAttribute('node-type')=='blue'){
                                if(to.top<form.top) return 'none';
                                if(form.top<=4&&(to.left==form.left)){
                                    return isChess?{code:'eat',node:node}:{code:'move',i:null};
                                }else{
                                    if(form.top>4){
                                    return isChess?{code:'eat',node:node}:{code:'move',i:null};
                                    }
                                    return 'none';
                                }
                            }else{
                                if(to.top>form.top) return 'none';
                                if(form.top>4&&(to.left==form.left)){
                                    return isChess?{code:'eat',node:node}:{code:'move',i:null};
                                }else{
                                    if(form.top<=4){
                                        return isChess?{code:'eat',node:node}:{code:'move',i:null};
                                    }
                                    return 'none';
                                }
                            }
                        }
                        return 'none'
                    }

                    if(type=='general'){
                        if((ftT==1&&ftL==0)||(ftT==0&&ftL==1)){
                            if(form.top<=2){
                                if(to.top<=2&&to.left>=3&&to.left<=5){
                                    return isChess?{code:'eat',node:node}:{code:'move',i:null};
                                }else{
                                    return 'none';
                                }
                            }else{
                                if(to.top>=7&&to.left>=3&&to.left<=5){
                                    return isChess?{code:'eat',node:node}:{code:'move',i:null};
                                }else{
                                    return 'none';
                                }
                            }
                        }else{
                            return 'none';
                        }
                    }

                    for(var i=0,len=_this.objs.chess.length,_len=len;i<len;i++){
                        if(_this.objs.chess[i].node!=thisSon){
                            moveState=_this.DOMFun.moveType(_this.DOMFun.getPos(_this.objs.chess[i].node),dotPos,formPos,type);
                            
                            if(type!='gun'){
                                switch(moveState){
                                    case 'in':
                                        return {code:'in',i:i};
                                    case 'eat':
                                        if(i>=(len-1)) return {code:'eat',i:i};
                                        retStat={code:'eat',i:i}; break;
                                    case 'none':
                                        return {code:'none',i:i};
                                    case 'not':
                                        if(i>=(_len-1)){
                                            if(retStat.code=='eat') return {code:'eat',i:retStat.i};
                                            return {code:'move',i:null};
                                        }
                                }
                            }else{
                                //如果是炮，需要计算in的个数。
                                if(moveState=='eat'||moveState=='in'){
                                    retStat.push({code:moveState,i:i});
                                }

                                if(i>=(len-1)){
                                    if(!retStat) return {code:'none',i:i};
                                    if(retStat.length==0){
                                        return {code:'move',i:i};
                                    }else if(retStat.length==2){
                                        if(retStat[0]!=retStat[1]){
                                            return {code:'eat',i:retStat[0].code=='eat'?retStat[0].i:retStat[1].i};
                                        }else{
                                            return {code:'in',i:i};
                                        }
                                    }else{
                                        return {code:'in',i:i};
                                    }
                                }
                            }
                        }else{
                            if(i==len-1){
                                if(type!='gun'){
                                switch(moveState){
                                    case 'in':
                                        return {code:'in',i:i};
                                    case 'eat':
                                        retStat='eat';
                                    case 'none':
                                        return {code:'none',i:i};
                                    case 'not':
                                        if(i>=(_len-1)){
                                            if(retStat.code=='eat') return {code:'eat',i:retStat.i};
                                            return {code:'move',i:i};
                                        }
                                }
                            }else{
                                //如果是炮，需要计算in的个数。
                                if(moveState=='eat'||moveState=='in'){
                                    retStat.push({code:moveState,i:i});
                                }

                                if(i>=(len-1)){
                                    if(!retStat) return {code:'none',i:i};
                                    if(retStat.length==0){
                                        return {code:'move',i:i};
                                    }else if(retStat.length==2){
                                        if(retStat[0]!=retStat[1]){
                                            return {code:'eat',i:retStat[0].code=='eat'?retStat[0].i:retStat[1].i};
                                        }else{
                                            return {code:'in',i:i};
                                        }
                                    }else{
                                        return {code:'in',i:i};
                                    }
                                }
                            }
                            }
                        }
                    }
                },

                moveType: function(test,to,form,type){
                    /*
                    return :{
                        'in':'被测试棋子卡位',
                        'eat':'被测试棋子是被点击的棋子，可以被吃',
                        'not':'被测试棋子没有卡位',
                        'none':'不满足棋子移动的基本规则'
                    }
                    */

                    var chess=_this.objs.chess,
                        code=null,
                        ftT=Math.abs(form.top-to.top),
                        ftL=Math.abs(form.left-to.left),
                        _top=form.top-test.top,
                        _left=form.left-test.left,
                        abs_top=Math.abs(_top),
                        abs_left=Math.abs(_left);
                    switch(type){
                        case 'car':
                            if(test.left==to.left&&test.top==to.top){
                                return 'eat';
                            }
                            if(form.top!=to.top&&form.left!=to.left){
                                return 'none';
                            }else{
                                if(form.top==to.top){
                                    if(test.top==form.top&&test.left>Math.min(to.left,form.left)&&test.left<Math.max(to.left,form.left)){
                                        return 'in';
                                    }else{
                                        return 'not';
                                    }
                                }else if(form.left==to.left){
                                    if(test.top==to.top&&test.left==to.left){
                                        return 'eat';
                                    }else{
                                        if(test.left==form.left&&test.top>Math.min(to.top,form.top)&&test.top<Math.max(to.top,form.top)){
                                            return 'in';
                                        }else{
                                            return 'not';
                                        }
                                    }
                                }else{
                                    return 'none';
                                }
                            };
                        case 'horse':
                            if(test.left==to.left&&test.top==to.top){
                                return 'eat';
                            }
                            if((ftT==2&&ftL==1)||(ftT==1&&ftL==2)){
                                if(ftT==2){
                                    if((_top==1)&&(_left==0)){
                                        if(test.top-to.top==1) return 'in';
                                        return 'not';
                                    }else if((_top==-1)&&(_left==0)){
                                        if(to.top-test.top==1) return 'in';
                                        return 'not';
                                    }else{
                                        return 'not';
                                    }
                                }else{
                                    if((_left==1)&&(_top==0)){
                                        if(test.left-to.left==1) return 'in';
                                        return 'not';
                                    }else if((_left==-1)&&(_top==0)){
                                        if(to.left-test.left==1) return 'in';
                                        return 'not';
                                    }else{
                                        return 'not';
                                    }
                                }
                            }else{
                                return 'none';
                            }
                        case 'elephant':
                            if(test.left==to.left&&test.top==to.top){
                                return 'eat';
                            }
                            if(ftT==2&&ftL==2){
                                if(abs_top==1&&abs_left==1&&(Math.abs(test.top-to.top)==1)&&(Math.abs(test.left-to.left))==1){
                                    return 'in';
                                }else{
                                    if(form.top<=4&&to.top<=4){
                                        return 'not';
                                    }else{
                                        if(form.top>=5&&to.top>=5){
                                            return 'not';
                                        }else{
                                            return 'none';
                                        }
                                    }
                                }
                            }else{
                                return 'none'
                            }
                        case 'noble':
                            if(test.left==to.left&&test.top==to.top){
                                return 'eat';
                            }
                            if(ftT==1&&ftL==1){
                                if(form.top<=2){
                                    if(to.top<=2&&to.left>=3&&to.left<=5){
                                        return 'not';
                                    }else{
                                        return 'none';
                                    }
                                }else{
                                    if(to.top>=7&&to.left>=3&&to.left<=5){
                                        return 'not';
                                    }else{
                                        return 'none';
                                    }
                                }
                            }else{
                                return 'none';
                            }
                        case 'gun':
                            if(test.left==to.left&&test.top==to.top){
                                return 'eat';
                            }
                            if((ftT==0)||(ftL==0)){
                                if(ftT==0){
                                    if(test.top==form.top&&test.left>Math.min(form.left,to.left)&&test.left<Math.max(form.left,to.left)){
                                        return 'in';
                                    }else{
                                        return 'not';
                                    }
                                }else{
                                    if(test.left==form.left&&test.top>Math.min(form.top,to.top)&&test.top<Math.max(form.top,to.top)){
                                        return 'in';
                                    }else{
                                        return 'not';
                                    }
                                }
                            }else{
                                return 'none';
                            }
                    }
                },

                getPos: function(node){
                    if(!node) return false;
                    var cssText=node.style.cssText,
                        t=STK.core.str.trim(/top:.*?%;/i.exec(cssText)[0].slice(4,-1)),
                        l=STK.core.str.trim(/left:.*?%;/i.exec(cssText)[0].slice(5,-1));
                    return {
                        top:t.length<=2?0:t.slice(0,1)-0,
                        left:l.length<=2?0:l.slice(0,1)-0
                    }
                },

                getChessStat: function(){
                    var chessStat={
                        chessBoard:[
                            [0,0,0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0,0,0],
                            [0,0,0,0,0,0,0,0,0]
                        ]}, pos, node;

                    for(var i=0,len=_this.objs.chess.length;i<len;i++){
                        node=_this.objs.chess[i].node;
                        pos=_this.DOMFun.getPos(node);
                        chessStat.chessBoard[pos.top][pos.left]={
                            chess:node.getAttribute("data-type"),
                            is:node.getAttribute("node-type")
                        }
                    }

                    return chessStat;
                },

                aiGoNext: function(opts){
                    var pos,fromIndex=0, toIndex=null,_code={};
                    for(var i=0,len=_this.objs.chess.length;i<len;i++){
                        if(_this.objs.chess[i].node.getAttribute("node-type")==opts.node.is){
                            pos=_this.DOMFun.getPos(_this.objs.chess[i].node);
                            if(pos.top==opts.from.top&&pos.left==opts.from.left){
                                fromIndex=i;
                            }
                        }else{
                            pos=_this.DOMFun.getPos(_this.objs.chess[i].node);
                            if(pos.top==opts.to.top&&pos.left==opts.to.left){
                                toIndex=i;
                            }
                        }
                    }

                    if(toIndex!==null){
                        _code.code='eat';
                        _code.i=toIndex ;
                        _code.node=_this.objs.chess[toIndex];
                    }

                    _this.objs.thisSon=_this.objs.chess[fromIndex].node;
                    _this.DOMFun.goMove({top:opts.to.top,left:opts.to.left},_code);
                },

                cAi: function(){
                    document.querySelector("#start").style.display="none";
                    _this.objs.aiIs=false;
                },

                uAi: function(){
                    document.querySelector(".first").style.display="none";
                    document.querySelector(".second").style.display="block";
                },

                start: function(event){
                    var thisSon=event.target;
                    document.querySelector("#start").style.display="none";
                    if(STK.core.dom.hasClassName(thisSon, "cFirst")){
                        _this.objs.aiType='blue';
                        _this.objs.aiIs=true;
                        _this.DOMFun.goAi();
                    }else{
                        if(STK.core.dom.hasClassName(thisSon, "pFirst")){
                            _this.objs.aiIs=true;
                            _this.objs.chessNext='red';
                            _this.objs.aiType='blue';
                            STK.core.dom.addClassName(_this.DOM.tip,'red');
                        }
                    }
                },

                goAi: function(){
                    STK.chess.link.fire("getNext" , {
                        chessStat:_this.DOMFun.getChessStat()
                    });
                }
            }
        };
        var argsCheck = function() {
            if (!$.core.dom.isNode(node)) {
                throw "视频图层需要传入外层节点对象";
            }
        };
        var parseDOM = function() {
            _this.DOM = $.kit.dom.parseDOM($.builder(node).list);
        };
        var initPlugins = function() {

            //可点击区域重绘。
            _this.objs.resizeArr.funList.push(function(){

                //重新设定页面字体大小.
                _this.objs.wrap=STK.core.dom.getSize(STK.core.dom.sizzle("#wrap")[0]);
                STK.core.dom.setStyle(document.documentElement,"font-size",Math.min(_this.objs.wrap.height,_this.objs.wrap.width)/32+"px");

                //重新设置bg的位置
                _this.objs.resizeArr.funList.push(function(){
                    var thisSon=_this.objs.thisSon;
                    if(!thisSon) return false;
                    var pos={
                            t:thisSon.offsetTop,
                            l:thisSon.offsetLeft
                        },
                        bgImg=_this.DOM.dotBg,
                        size=$.core.dom.getSize(thisSon);
                    bgImg.style.top=(pos.t-size.width*0.1)+"px";
                    bgImg.style.left=(pos.l-size.height*0.1)+"px";
                    bgImg.width=size.width*1.2;
                    bgImg.height=size.height*1.2;
                })

            });

            _this.DOMFun.resize();

            //转化棋子对象转化到chess中
            _this.objs.chess=[];
            for(var i in _this.DOM){
                if(STK.core.arr.isArray(_this.DOM[i])){
                    STK.core.arr.foreach(_this.DOM[i],function(node,key){
                        if(!STK.core.dom.hasClassName(node,"chess")) return false;
                        _this.objs.chess.push({
                            node:node
                        });
                    });
                }else{
                    if(STK.core.dom.hasClassName(_this.DOM[i], "chess")){
                        _this.objs.chess.push({
                            node:_this.DOM[i]
                        });
                    }
                }
            }
        };
        var bindDOM = function() {
            var addEvent=STK.core.evt.addEvent;
            window.onresize=_this.DOMFun.resize;
            addEvent(node, "click", _this.DOMFun.moveDot);

            addEvent(document.querySelector(".cAi"), 'click', _this.DOMFun.cAi);

            addEvent(document.querySelector(".uAi"), 'click', _this.DOMFun.uAi);

            addEvent(document.querySelector(".second"), 'click', _this.DOMFun.start);
        };
        var bindCustEvt = function() {
            _this.objs.on = $.core.evt.delegatedEvent(node);
        };
        var bindListener = function() {
            STK.chess.link.register("backNext" ,_this.DOMFun.aiGoNext);
        };
        var destroy = function() {
            if (_this) {
                $.foreach(_this.objs, function(o) {
                    if (o.destroy) {
                        o.destroy();
                    }
                });
                _this = null;
            }
        };
        var init = function() {
            argsCheck();
            parseDOM();
            initPlugins();
            bindDOM();
            bindCustEvt();
            bindListener();
        };
        init();
        that.destroy = destroy;
        return that;
    };
});