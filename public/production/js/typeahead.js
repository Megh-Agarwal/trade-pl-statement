!function(t,e){"use strict";"undefined"!=typeof module&&module.exports?module.exports=e(require("jquery")):"function"==typeof define&&define.amd?define(["jquery"],e):e(t.jQuery)}(this,function(r){"use strict";function o(t,e){this.$element=r(t),this.options=r.extend({},r.fn.typeahead.defaults,e),this.matcher=this.options.matcher||this.matcher,this.sorter=this.options.sorter||this.sorter,this.select=this.options.select||this.select,this.autoSelect="boolean"!=typeof this.options.autoSelect||this.options.autoSelect,this.highlighter=this.options.highlighter||this.highlighter,this.render=this.options.render||this.render,this.updater=this.options.updater||this.updater,this.displayText=this.options.displayText||this.displayText,this.source=this.options.source,this.delay=this.options.delay,this.$menu=r(this.options.menu),this.$appendTo=this.options.appendTo?r(this.options.appendTo):null,this.fitToElement="boolean"==typeof this.options.fitToElement&&this.options.fitToElement,this.shown=!1,this.listen(),this.showHintOnFocus=("boolean"==typeof this.options.showHintOnFocus||"all"===this.options.showHintOnFocus)&&this.options.showHintOnFocus,this.afterSelect=this.options.afterSelect,this.addItem=!1,this.value=this.$element.val()||this.$element.text()}o.prototype={constructor:o,select:function(){var t=this.$menu.find(".active").data("value");return this.$element.data("active",t),(this.autoSelect||t)&&(t=(t=this.updater(t))||"",this.$element.val(this.displayText(t)||t).text(this.displayText(t)||t).change(),this.afterSelect(t)),this.hide()},updater:function(t){return t},setSource:function(t){this.source=t},show:function(){var t,e=r.extend({},this.$element.position(),{height:this.$element[0].offsetHeight}),s="function"==typeof this.options.scrollHeight?this.options.scrollHeight.call():this.options.scrollHeight;this.shown?t=this.$menu:this.$appendTo?(t=this.$menu.appendTo(this.$appendTo),this.hasSameParent=this.$appendTo.is(this.$element.parent())):(t=this.$menu.insertAfter(this.$element),this.hasSameParent=!0),this.hasSameParent||(t.css("position","fixed"),i=this.$element.offset(),e.top=i.top,e.left=i.left);var i=r(t).parent().hasClass("dropup")?"auto":e.top+e.height+s,s=r(t).hasClass("dropdown-menu-right")?"auto":e.left;return t.css({top:i,left:s}).show(),!0===this.options.fitToElement&&t.css("width",this.$element.outerWidth()+"px"),this.shown=!0,this},hide:function(){return this.$menu.hide(),this.shown=!1,this},lookup:function(t){if(this.query=null!=t?t:this.$element.val()||this.$element.text()||"",this.query.length<this.options.minLength&&!this.options.showHintOnFocus)return this.shown?this.hide():this;t=r.proxy(function(){r.isFunction(this.source)?this.source(this.query,r.proxy(this.process,this)):this.source&&this.process(this.source)},this);clearTimeout(this.lookupWorker),this.lookupWorker=setTimeout(t,this.delay)},process:function(t){var e=this;return t=r.grep(t,function(t){return e.matcher(t)}),(t=this.sorter(t)).length||this.options.addItem?(0<t.length?this.$element.data("active",t[0]):this.$element.data("active",null),this.options.addItem&&t.push(this.options.addItem),("all"==this.options.items?this.render(t):this.render(t.slice(0,this.options.items))).show()):this.shown?this.hide():this},matcher:function(t){return~this.displayText(t).toLowerCase().indexOf(this.query.toLowerCase())},sorter:function(t){for(var e,s=[],i=[],o=[];e=t.shift();){var n=this.displayText(e);(n.toLowerCase().indexOf(this.query.toLowerCase())?~n.indexOf(this.query)?i:o:s).push(e)}return s.concat(i,o)},highlighter:function(t){var e,s,i,o=r("<div></div>"),n=this.query,h=t.toLowerCase().indexOf(n.toLowerCase()),a=n.length;if(0===a)return o.text(t).html();for(;-1<h;)e=t.substr(0,h),i=t.substr(h,a),s=t.substr(h+a),i=r("<strong></strong>").text(i),o.append(document.createTextNode(e)).append(i),h=(t=s).toLowerCase().indexOf(n.toLowerCase());return o.append(document.createTextNode(t)).html()},render:function(s){var i=this,o=this,n=!1,h=[],a=i.options.separator;return r.each(s,function(t,e){0<t&&e[a]!==s[t-1][a]&&h.push({__type:"divider"}),!e[a]||0!==t&&e[a]===s[t-1][a]||h.push({__type:"category",name:e[a]}),h.push(e)}),s=r(h).map(function(t,e){if("category"==(e.__type||!1))return r(i.options.headerHtml).text(e.name)[0];if("divider"==(e.__type||!1))return r(i.options.headerDivider)[0];var s=o.displayText(e);return(t=r(i.options.item).data("value",e)).find("a").html(i.highlighter(s,e)),s==o.$element.val()&&(t.addClass("active"),o.$element.data("active",e),n=!0),t[0]}),this.autoSelect&&!n&&(s.filter(":not(.dropdown-header)").first().addClass("active"),this.$element.data("active",s.first().data("value"))),this.$menu.html(s),this},displayText:function(t){return void 0!==t&&void 0!==t.name&&t.name||t},next:function(t){var e=this.$menu.find(".active").removeClass("active").next();(e=e.length?e:r(this.$menu.find("li")[0])).addClass("active")},prev:function(t){var e=this.$menu.find(".active").removeClass("active").prev();(e=e.length?e:this.$menu.find("li").last()).addClass("active")},listen:function(){this.$element.on("focus",r.proxy(this.focus,this)).on("blur",r.proxy(this.blur,this)).on("keypress",r.proxy(this.keypress,this)).on("input",r.proxy(this.input,this)).on("keyup",r.proxy(this.keyup,this)),this.eventSupported("keydown")&&this.$element.on("keydown",r.proxy(this.keydown,this)),this.$menu.on("click",r.proxy(this.click,this)).on("mouseenter","li",r.proxy(this.mouseenter,this)).on("mouseleave","li",r.proxy(this.mouseleave,this)).on("mousedown",r.proxy(this.mousedown,this))},destroy:function(){this.$element.data("typeahead",null),this.$element.data("active",null),this.$element.off("focus").off("blur").off("keypress").off("input").off("keyup"),this.eventSupported("keydown")&&this.$element.off("keydown"),this.$menu.remove(),this.destroyed=!0},eventSupported:function(t){var e=t in this.$element;return e||(this.$element.setAttribute(t,"return;"),e="function"==typeof this.$element[t]),e},move:function(t){if(this.shown)switch(t.keyCode){case 9:case 13:case 27:t.preventDefault();break;case 38:if(t.shiftKey)return;t.preventDefault(),this.prev();break;case 40:if(t.shiftKey)return;t.preventDefault(),this.next()}},keydown:function(t){this.suppressKeyPressRepeat=~r.inArray(t.keyCode,[40,38,9,13,27]),this.shown||40!=t.keyCode?this.move(t):this.lookup()},keypress:function(t){this.suppressKeyPressRepeat||this.move(t)},input:function(t){var e=this.$element.val()||this.$element.text();this.value!==e&&(this.value=e,this.lookup())},keyup:function(t){if(!this.destroyed)switch(t.keyCode){case 40:case 38:case 16:case 17:case 18:break;case 9:case 13:if(!this.shown)return;this.select();break;case 27:if(!this.shown)return;this.hide()}},focus:function(t){this.focused||(this.focused=!0,this.options.showHintOnFocus&&!0!==this.skipShowHintOnFocus&&("all"===this.options.showHintOnFocus?this.lookup(""):this.lookup())),this.skipShowHintOnFocus&&(this.skipShowHintOnFocus=!1)},blur:function(t){this.mousedover||this.mouseddown||!this.shown?this.mouseddown&&(this.skipShowHintOnFocus=!0,this.$element.focus(),this.mouseddown=!1):(this.hide(),this.focused=!1)},click:function(t){t.preventDefault(),this.skipShowHintOnFocus=!0,this.select(),this.$element.focus(),this.hide()},mouseenter:function(t){this.mousedover=!0,this.$menu.find(".active").removeClass("active"),r(t.currentTarget).addClass("active")},mouseleave:function(t){this.mousedover=!1,!this.focused&&this.shown&&this.hide()},mousedown:function(t){this.mouseddown=!0,this.$menu.one("mouseup",function(t){this.mouseddown=!1}.bind(this))}};var t=r.fn.typeahead;r.fn.typeahead=function(s){var i=arguments;return"string"==typeof s&&"getActive"==s?this.data("active"):this.each(function(){var t=r(this),e=t.data("typeahead");e||t.data("typeahead",e=new o(this,"object"==typeof s&&s)),"string"==typeof s&&e[s]&&(1<i.length?e[s].apply(e,Array.prototype.slice.call(i,1)):e[s]())})},r.fn.typeahead.defaults={source:[],items:8,menu:'<ul class="typeahead dropdown-menu" role="listbox"></ul>',item:'<li><a class="dropdown-item" href="#" role="option"></a></li>',minLength:1,scrollHeight:0,autoSelect:!0,afterSelect:r.noop,addItem:!1,delay:0,separator:"category",headerHtml:'<li class="dropdown-header"></li>',headerDivider:'<li class="divider" role="separator"></li>'},r.fn.typeahead.Constructor=o,r.fn.typeahead.noConflict=function(){return r.fn.typeahead=t,this},r(document).on("focus.typeahead.data-api",'[data-provide="typeahead"]',function(t){var e=r(this);e.data("typeahead")||e.typeahead(e.data())})});