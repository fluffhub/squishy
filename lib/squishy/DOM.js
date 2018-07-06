Module(function M() {
  if(document) {
    M.Def("TagList",function TagList() {
      Object.defineProperty(this,"forEach",{
        value:Array.prototype.forEach
      })
    })
    var NameSpace=M.Class(function C() {
      C.Init(function NameSpace() {
        with(NameSpace.kwargs({name:"Unnamed", tags:{}, convert:function(o) { return o; },nsuri:""})) {
          /*
            convert should take a DOM node and return a Squishy style element wrapper,
            with an attribute "element" pointing to the DOM node
        */
          Object.defineProperty(this,"tags",{value:tags});
          Object.defineProperty(this,"convert",{value:convert});
          this.name=name;
          this.nsuri=nsuri;
        }
      });
    });

    var XHTMLNS="http://www.w3.org/1999/xhtml"
    var namespaces=M.Def("namespaces",{});
    namespaces[XHTMLNS]=new NameSpace({
      name:"XHTML",
      convert:function convert(element) {
        return new Tag(element);
      },

      tags:{

      }
    });

    var Tag=M.Class(function C() {
      C.Init(function Tag() { with(Tag.kwargs({"type":"div","cls":null,"id":null,attrs:null,content:""})) {
        /* @args type, cls, id, attrs */
        var element;
        if(arguments[0] instanceof Element) {
          /* this is a wrapper for an existing DOM element
        */
          var element=arguments[0];

        } else {
          var element=document.createElement(type);
        }
        element.object=this;

        if(cls) element.setAttribute('class',cls);
        if(content) element.textContent=content;
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
        /*if (Proxy instanceof Function) {
          return new Proxy(this, {
            get: function(t,k) {
              if (element.hasAttribute('data-j-'+k)) {
                var value = JSON.parse(element.getAttribute('data-j-'+k));
                t[k]=value
              }
              return Reflect.get(...arguments)
            },
            set: function(t,k,v) {
              console.debug({asf:JSON.stringify(v)})
              try {
                element.setAttribute('data-j-'+k,JSON.stringify(v))
              } catch(e) {
                // pass
                console.debug({e})
              }
              return Reflect.set(...arguments)
            }
          });
        }*/
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
          try {
            this.element.appendChild(element.element);
            Object.defineProperty(element,"parent", {value:this,configurable:true});
          }
          catch(e) {
            try {
              this.element.appendChild(element);
            } catch(e2) {
              try{
                this.element.appendChild(element[0]);
              }
              catch(e3) {

                this.element.textContent=this.element.textContent+element;
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
        el.parentNode.insertBefore(this.element,el);
      });
      C.Def(function placeAfter(target) {
        var el=target;
        if(target.element) el=target.element;
        el.parentNode.insertBefore(this.element,el.nextSibling);
      })
      C.Def(function content(value) {
        if(value)
          this.element.textContent=value;
        else
          return this.element.textContent;
      });

      C.Def(function setClass(cls) {
        this.element.setAttribute('class',cls);
      });
      C.Def(function addClass(cls) {
        var clss;
        //  if(this.element.className&&this.element.className!='')  clss = this.element.className;
        clss=this.element.getAttribute('class');
        if(clss&&clss.split) clss=clss.split(/[^\w_-]+/);
        else clss=[];

        var i=clss.indexOf(cls);

        if(i==-1) {
          clss[clss.length]=cls;
        }
        this.element.setAttribute('class',clss.join(' '));
      });
      C.Def(function removeClass(cls) {
        var clss = this.element.getAttribute('class').split(/\W+/);//Name.split(' ');
        var i=clss.indexOf(cls);
        if(i>-1) {
          delete clss[i];
        }
        this.element.setAttribute("class",clss.join(' '));
      });
      C.Def(function hasClass(cls) {
        if(this.element.className)
          var clss = this.element.getAttribute('class').split(/\W+/);//className.split(' ');
        return cls in clss;
      });
      C.Def(function toggleClass(cls) {
        var clss = this.element.getAttribute('class').split(/\W+/);
        //var clss = this.element.className.split(' ');
        var i=clss.indexOf(cls);
        if(i>-1) {
          delete clss[i];
        }
        else clss.push(cls);
        this.element.setAttribute("class",clss.join(' '));
      });
      C.Def(function remove(item) {
        var ret;
        if(item) {
          try {
            ret=this.element.removeChild(item.element);
            var el;
            var ids=Object.keys(this.elements);
            for(var i=0;i<this.elements.length;i++) {
              el=this.elements[i];
              if(el===item) {
                this.elements.splice(i-1,1);
                break;
              }
            }
          } catch(e) {
            ret=false;
          }
        } else {
          if(this.element.parentNode) {
            try {
              ret=this.element.parentNode.Tag.remove(this);
            }
            catch(e) {
              ret=this.element.parentNode.removeChild(this.element);
            }
          }
          return  ret;
        }
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
      C.Def(function _setattr(k,v) {
        if (v instanceof Tag) {
          var uid;
          if (v.element.hasAttribute("data-id")) {
            uid = v.element.getAttribute("data-id");
          } else{
            //generate uuid, assign to v element
            var done=false;
            while(!done) {
              uid=btoa(Math.round(Math.random()*1e+18).toString().padEnd(18));
              if(document.querySelector("[data-id=\""+uid+"\"")) {

              } else {
                v.element.setAttribute("data-id",uid);
                done=true;
              }
            }
          }
          t.element.setAttribute("data-e-"+k,uid)
        } else if (v instanceof Function) {
          t.element.setAttribute("data-f-"+k,v.toString());
        } else {
          try {
            t.element.setAttribute("data-j-"+k,JSON.stringify(v));
          } catch(e) {
            console.debug({"Failed to parse":v})
          }
        }
      })
      C.Set(function setter(t,k,v) {
        var item=this;

        var result = Reflect.set(t,k,v)
        var value=Watch(v,function(obj) {
          t._setattr(k,obj)
        });
 
        
        return result
      });
      C.Def(function query(str) {
        var elements= Array.prototype.slice.call(this.element.querySelectorAll(str));
        var new_elements=new M.Self.TagList()
        Object.defineProperty(new_elements, "length",{enumerable:false,editable:true})
        var el;
        //for(var i=0;i<elements.length;i++) {
        elements.forEach(function(element,i) {
          new_elements.length++;
          new_elements[i]=undefined;

          //var element=elements[i];
          if(element.hasOwnProperty("Tag")) {
            new_elements[i]=element.Tag;
          } else {
            function populate(o) {
              element.Tag=o;
              o.element=element;
              new_elements[i]=o;
              el.query("*")
            }
            //make a new wrapping element and add it!
            var classname=element.getAttribute("data-class");
            if(classname&&classname!="") {
              //load by import the classname.
              //classname should be inthe format importname#classname
              var cln=classname.split("#");
              var ii=i;
              Import(cln[0],function(imported) {
                var cls=imported[cln[1]]
                if(cls) {
                  el=new cls(element);
                  populate(el);
                }
              });

            } else {
              //var cons=M.Self.Tag;

              if(M.Self.namespaces[element.namespaceURI]) {
                el=M.Self.namespaces[element.namespaceURI].convert(element);
                populate(el);
              }
              else {
                console.debug(element.namespaceURI);
                el=new M.Self.XTag(element.namespaceURI,element.tagName);
                populate(el);
              }


            }

          }
        });
        return new_elements;
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
    var XTag=M.Class(function C(){
      C.Super(Tag);
      C.Init(function XTag(NS,type,attrs) {
        this.xmlns=NS;
        Object.defineProperty(this,'element',{value:document.createElementNS(NS,type),writable:true});
        this.element.object=this;
        Object.defineProperty(this,'elements',{value:[],writable:true});


        this.elements=[];
        this.element.Tag=this;
        if(attrs)
          for (var attr in attrs)
            this.element.setAttributeNS(null,attr,attrs[attr]);
      });

      C.Def(function content(value) {
        var doc = new DOMParser().parseFromString(value,'application/xml');
        this.clear();
        this.element.appendChild(document.importNode(doc.documentElement, true));

      });
      C.Mixin({
        NSattr:function(name,value) {
          if(name) {
            if(value) this.element.setAttributeNS(null,name,value);
            else return this.element.getAttributeNS(null,name);
          }
        },
        NSattrs:function(attrs) {
          for (var attr in attrs) {
            this.element.setAttributeNS(null,attr,attrs[attr]);
          }
        }
      });
    });
    var Frame=M.Class(function C() {
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
        Object.defineProperty(this,"parent",{value:new Tag(this.document.documentElement),configurable:true});

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
    Object.defineProperty(M.Self,"root",{get:function() {
      if(document&&document.body&&document.body.Tag) {
        return document.body.Tag
      } else {
        return new Frame();
      }
    }})





  } else {
    throw new Error("No DOM document available: from DOM.js");
  }

});


