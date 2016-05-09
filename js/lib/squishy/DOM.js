Module(function M() { if(document) {
  var Tag=M.Class(function C() {
    C.Init(function Tag() { with(Tag.kwargs({"type":"div","cls":null,"id":null,attrs:null,content:""})) {
      /* @args type, cls, id, attrs */
      var element;
      if(type instanceof Element) {
        /* this is a wrapper for an existing DOM element
        */
        var element=type;

      } else {
        var element=document.createElement(type);
      }
      element.object=this;
      this.elements={};
      if(cls) element.setAttribute('class',cls);
      if(content) element.innerHTML=content;
      if(id) element.setAttribute('id',id);
      if(attrs) {
        for (var attr in attrs) {
          element.setAttribute(attr,attrs[attr]);
        }
      }
      element.Tag=this;
      Object.defineProperties(this,{
        'element':{enumerable:false,value:element,writable:true},
        'events':{enumerable:false,writable:true, value:{} },
        'elements':{enumerable:false,value:[],writable:true,},
        'init':{ enumerable:false,value:function() {},writable:true}
      });
      try { this.init(); } catch(e) { }

    }});

    C.Def(function attr(name,value) {
      if(name) {
        if(value) {
          this.element.setAttribute(name,value);
        }
        else {
          return this.element.getAttribute(name);
        }
      }
    });
    C.Def(function clone() {
      return this.element.cloneNode(true);
    });
    C.Def(function offset() {
      var o={x:0,y:0};
      (function _offset(node) {
        if(node.tagName!='BODY') {
          o.x+=node.offsetLeft;
          o.y+=node.offsetTop;
          _offset(node.parentNode);
        }
      })(this.element);
      return o;
    });

    C.Def(function attrs(attrs) {
      for (var attr in attrs) {
        this.element.setAttribute(attr,attrs[attr]);
      }
    });
    C.Def(function handle(fun) {
      var that=this,args=[];
      if(arguments.length>1) {
        args=Array.prototype.slice.call(arguments,1);
      }
      return function() {
        var nargs=arguments;
        if(args.length>0)
          nargs=Array.prototype.concat.call(args, nargs );
        fun.apply(that,nargs);
      };
    });
    C.Def(function Madd() {
      for (var i=0;i<arguments.length;i++) {
        this.add(arguments[i]);
      }
    });
    C.Def(function add(element,name) {
      if(element) {
        try{
          this.element.appendChild(element.element);
          element.parent=this;
        }
        catch(e) {
          try {
            this.element.appendChild(element);
          } catch(e2) {
            try{
              this.element.appendChild(element[0]);
            }
            catch(e3) {

              this.element.innerHTML=this.element.innerHTML+element;
            }
          }
        }
        if(name) this.elements[name]=element;
        else this.elements[Object.keys(this.elements).length]=element;
        if(typeof(element)!="string")
        Object.defineProperty(element,'container',{value:this,configurable:true});;
      }
    });
    C.Def(function addBefore(element,name) {
      this.element.insertBefore(element.element,this.element.firstChild);
      if(name) this.elements[name]=element;
      else this.elements.unshift(element);
    });
    C.Def(function insert(element,location) {
      this.element.insertBefore(element.element,location.element);
      for(var i=0;i<this.elements.length;i++) {
        if(location===this.elements[i]) {
         this.elements.splice(i-1,0,element);
          break;
        }
      }
    });
    C.Def(function place(target) {
      var el=target;
      if(target.element) el=target.element;
      el.appendChild(this.element);
    });
    C.Def(function className() {
      return this.element.className;
    });
    C.Def(function placeBefore(target) {
      var el=target;
      if(target.element) el=target.element;
      el.insertBefore(this.element,el.firstChild);
    });
    C.Def(function content(value) {
      if(value)
        this.element.innerHTML=value;
      else
        return this.element.innerHTML;
    });

    C.Def(function setClass(cls) {
      this.element.setAttribute('class',cls);
    });
    C.Def(function addClass(cls) {
      var clss;
      //  if(this.element.className&&this.element.className!='')  clss = this.element.className;
      clss=this.element.getAttribute('class');
      if(clss&&clss.split) clss=clss.split(/\W+/);
      else      clss=[];

      var i=clss.indexOf(cls);

      if(i==-1) {
        clss[clss.length]=cls;
      }
      this.element.setAttribute('class',clss.join(' '));
    });
    C.Def(function removeClass(cls) {
      var clss = this.element.getAttribute('class').split(' ');//Name.split(' ');
      var i=clss.indexOf(cls);
      if(i>-1) {
        delete clss[i];
      }
      this.element.setAttribute("class",clss.join(' '));
    });
    C.Def(function hasClass(cls) {
      if(this.element.className)
        var clss = this.element.getAttribute('class').split(' ');//className.split(' ');
      return cls in clss;
    });
    C.Def(function toggleClass(cls) {
      var clss = this.element.getAttribute('class').split(' ');
      //var clss = this.element.className.split(' ');
      var i=clss.indexOf(cls);
      if(i>-1) {
        delete clss[i];
      }
      else clss.push(cls);
      this.element.setAttribute("class",clss.join(' '));
    });
    C.Def(function remove() {
      try {
        return this.element.parentNode.removeChild(this.element);
      }
      catch(e) {}
    });
    C.Def(function clear() {
      for (var i in this.elements) {
        try {
          this.elements[i].remove();
        }
        catch(e) {}
      }
      this.elements=[];
    });
    C.Def(function query(str) {
      return this.element.querySelectorAll(str);
    });

  });
  var LayoutItem=M.Class(function C() {
    C.Super(Tag);
    C.Init(function LayoutItem() {
      Tag.apply(this,arguments);
    });
    C.Def(function toggle() {
      if(this.element.style.display!='none') {
        this.hide();
      }
      else {
        this.show();
      }
    });

    C.Def(function show() {
      if(this.defaultstyle)
        this.element.style.display=this.defaultstyle;
      else
        this.element.style.display="";
      //TODO: Make this in HasEvents show fn
      if(this.events&&this.enableEvents)
        this.enableEvents();
      //for (var i in this.elements) {
      //	this.elements[i].show();
      //}
      this.hidden=false;
    });
    C.Def(function hide() {
      if(!this.defaultstyle && this.defaultstyle!=="")
        this.defaultdisplay=this.element.style.display;
      this.element.style.display='none';
      //TODO: Make this in HasEvents hide fn
      if(this.events&&this.disableEvents)
        this.disableEvents();
      //for (var i in this.elements) {
      //this.elements[i].hide();
      //}
      this.hidden=true;
    });

    C.Def(function resize() {
      for (var i in this.elements) {
        try {
          this.elements[i].resize();
        }
        catch(e) {}
      }
    });
    C.Def(function width(value) {
      if(value) {
        this.element.style.width=value+'px';
      }
      else {
        return this.element.offsetWidth;
      }
    });
    C.Def(function height(value) {
      if(value) {
        this.element.style.height=value+'px';
      }
      else {
        return this.element.offsetHeight;
      }
    });
    C.Def(function Position(q) {

    });
  });

  M.Class(function C() {
    C.Super(LayoutItem);
    C.Init(function Frame() { with(Frame.kwargs({win:window,doc:document,callback:function(){}})) {
      /* @args win,doc,callback */

      Object.defineProperties(this,{
        window:{value:null,writable:true,enumerable:false},
        document:{value:null,writable:true,enumerable:false},
        element:{value:null,writable:true,enumerable:false},
        elements:{value:null,writable:true,enumerable:false},
      });
      this.window=win || window;
      this.document=doc || document;
      var bodies=this.document.getElementsByTagName('body');
      var that=this;
      this.element=bodies[0];
      this.element.Tag=this;
      var header=this.document.getElementsByTagName('head');
      this.parent=new Tag(this.document.documentElement);

      if(header.length>0) {
        this.head=new Tag(header[0]);
      }
      else {
        this.head=new Tag("head");
        this.parent.add(this.head);
      }


      this.elements={};
      this.window.onresize=function() {
        that.resize();
      };
      this.resize();
    }});
    C.Def(function getUrlVars() {
      var vars = {};
      var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
      });
      return vars;
    });

  });
} else {
  throw new Exception("No DOM document available: from DOM.js");
}});
