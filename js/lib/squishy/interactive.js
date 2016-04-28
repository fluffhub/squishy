Module(function M() { M.Import(
  'squishy/basic squishy/DOM squishy/events',
  function(basic,DOM,events) {
    var LayoutItem=DOM.LayoutItem;
    var Collapsible=M.Class(function C() {
      C.Super(LayoutItem);
      C.Init(function Collapsible(name, title,content,callback) {
        LayoutItem.call(this,'div','collapsible',name); //set id to name
        this.bar=new LayoutItem('h3',null,null);
        this.show=true;
        this.contents=new LayoutItem('div','content');
        this.element.appendChild(this.bar.element);
        this.element.appendChild(this.contents.element);
        if(callback) this.onopen=callback;
        else this.onopen=function() { };
        if(title) this.bar.content(title);
        else this.bar.content(name);
        this.bar.element.onclick=this.handle(this.toggle);
        this.open();
        this.disabled=false;
        if(content)
          this.add(content);
        this.elements['contents']=this.contents;
        this.elements['bar']=this.bar;
      });
      C.Def(function toggle() {
        if(!this.disabled) {
          if(this.opened) this.close();
          else this.open();
        }
      });
      C.Def(function disable() {
        this.disabled=true;
        this.addClass('disabled');
      });
      C.Def(function enable() {
        this.disabled=false;
        this.removeClass('disabled');
      });
      C.Def(function open() {
        this.opened=true;
        this.contents.removeClass("hidden");
        this.onopen();
        this.contents.resize();
      });
      C.Def(function close() {
        this.opened=false;
        this.contents.addClass("hidden");
      });
      C.Def(function content(value) {
        this.contents.content(value);
      });
      C.Def(function add(item) {
        var ni=new LayoutItem('div','list-item');
        ni.add(item,'content');
        this.contents.add(ni);
      });
    });
    var MenuButton=M.Class(function C() {
      C.Super(Collapsible);
      C.Init(function MenuButton(name,title) {
        var name=name||"menu";
        var title=title||"M";
        Collapsible.call(this,name,title);
        this.close();
        this.addClass("MenuButton");
      });

    });
    var Tab=M.Class(function C() {
      C.Super(LayoutItem);
      C.Init(function Tab(name,title,cls) {
        var cls=cls || "";
        LayoutItem.call(this,'div','tab '+cls,name);
        if(title) this.add(new basic.Span(title));
        else this.add(new basic.Span(name));
      });
      C.Def(function disable() {
        this.disabled=true;
        this.addClass('disabled');
      });
      C.Def(function enable() {
        this.disabled=false;
        this.removeClass('disabled');
      });
    });
    var TabSet=M.Class(function C() {

      C.Super(LayoutItem);
      C.Init(function TabSet(name, context) {
        this.tabs={};
        this.callbacks={};
        this.selected=null;
        LayoutItem.call(this,'div','tabset',name);
      });
      C.Def(function addTab(name, title,cls, callback) {
        var tab=new Tab(name,title,cls);
        tab.element.onclick=this.handle(this.change, name);
        callback=callback || function() {  };
        this.callbacks[name]=callback;
        this.tabs[name]=tab;
        this.add(tab,name);
      });
      C.Def(function change(name,ev) {
        if(name in this.tabs) {
          if(!this.tabs[name].disabled) {
            if(name in this.callbacks) {
              this.callbacks[name].call(this);
            }
            this.selected=name;
            for (var tabname in this.tabs) {
              this.tabs[tabname].removeClass('active');
            }
            this.tabs[name].addClass('active');
          }
        }
      });
      C.Def(function removeTab(name) {
        try {
          this.tabs[name].remove();
          delete this.elements[name];
          delete this.tabs[name];
        }
        catch(e) {

        }
      });
    });

    M.Class(function C() {
      C.Super(LayoutItem);
      C.Init(function TabbedPane(args){
        var args=args!==undefined?args:{};
        var target=args.target!==undefined?args.target:null;
        var callback=args.callback!==undefined?args.callback:null;
        LayoutItem.call(this,'div',null,null);
        this.addClass("pane");
        this.header=new LayoutItem('div','header-bar');
        this.tabset=new TabSet('');
        this.header.add(this.tabset);
        if(target) {
          target.add(this.header);
          target.add(this);
        }
        /*      else {
         this.add(this.header);
      }*/
        var target = target || this;

        this.tabs={};
        this.callback=callback?callback:function(){};
        this.callbacks={};
        this.panes={};
        this.activepane=null;
      });

      C.Def(function addTab(name,title,pane,cls,callback) {
        if(pane)
          this.panes[name]=pane;
        else {
          this.panes[name]=new basic.Pane(name,title);
        }
        this.callbacks[name]=callback;
        this.tabset.addTab(name,title,cls, this.handle(this.change,name));
        if(!this.activepane) this.activepane=name;
        if(name!=this.activepane) this.panes[name].hide();
        else try {
          //this.tabset.change(name);
        } catch(e) {}

        this.add(this.panes[name],name);

      });
      C.Def(function remove() {
        this.header.remove();
        LayoutItem.prototype.remove.call(this);
      });
      C.Def(function removeTab(name) {
        this.tabset.removeTab(name);
        this.panes[name].remove();
        delete this.elements[name];
        delete this.panes[name];
      });
      C.Def(function disable(name) {
        this.tabset.tabs[name].disable();
      });
      C.Def(function enable(name) {
        this.tabset.tabs[name].enable();
      });
      C.Def(function change(name) {
        this.panes[this.activepane].hide();
        this.panes[name].show();
        this.panes[name].resize();
        this.activepane=name;

        var callback=this.callbacks[name] || function() { };
        callback();
        this.callback();
        this.resize();
      });
      C.Def(function resize() {
        var h=this.element.parentNode.offsetHeight;

        for (var pane in this.panes) {
          var p=this.panes[pane];
          if(p.element.style.height!="auto"&&this.header in this.elements)
          p.element.style.height=(h-this.header.element.offsetHeight)+'px';
          try {
            p.resize();
          }
          catch(e) {
          }
        }
      });
    });
    M.Class(function C() {
      C.Super(LayoutItem);
      C.Init(function MomentaryButton(title,cls,callback,name) {
        LayoutItem.call(this,'div','button '+cls,name);
        this.content(title);
        if(callback) Object.defineProperty(this,'onclick',{
          enumerable:false,writable:true,
          value:this.handle(callback),
        });
        this.enable();
        this.enableEvents();
        //this.element.onclick=this.handle(this.click);
      });
      C.Mixin(events.hasEvents);

      C.Def(function enable() {
        this.addEvent("clickstart","mousedown touchstart",
                      this.clickstart);
        this.addEvent("clickend","mouseup touchend",
                      this.clickend);
        this.addEvent("cancel","mouseout touchleave",
                      this.cancel);
        this.addClass('enabled');
        this.removeClass('disabled');
      });
      C.Def(function disable() {
        this.disableEvents('clickstart','clickend','cancel','enabled');
        this.removeClass('enabled');
        this.addClass('disabled');
      });
      C.Def(function clickstart(ev) {
        if(ev.which) {
          if(ev.which==1) {
            this.clicking=true;
          }
        }
        else {
          this.clicking=true;
        }
      });
      C.Def(function clickend(ev) {
        if(this.clicking) {
          this.clicking=false;
          this.onclick(ev);
        }
      });
      C.Def(function cancel(ev) {
        this.clicking=false;
      });
      C.Def(function click() {

      });
    });
    M.Class(function C() {
      C.Super(LayoutItem);
      C.Mixin(events.hasEvents);
      C.Init(function ButtonSet(cls) {
        var cls = cls||"";
        LayoutItem.call(this,'div','buttonset '+cls,null);
      });
    });
    M.Class(function C() {
      C.Super(LayoutItem);
      C.Init(function MultiMode() {});

      C.Def(function rdraw(chl,parent) {
        for (var idd in chl) {
          i=chl[idd];
          type='div';
          if(i.type) type=i.type;
          el=$('<'+type+'></'+type+'>');

          if(i.id!='') {
            if(i.id) el.attr('id',i.id);
            else el.attr('id',idd);
          }
          if(i.cls)
            el.attr('class',i.cls);
          if(i.attributes) {
            for (var a in i.attributes) {
              el.attr(a,i.attributes[a]);
            }
          }
          if(i.content) {
            el.html(i.content);
          }
          if(!!!this[idd]){ if(i.dom) this[idd]=el[0]; else this[idd]=el; }
          parent.append(el);
          if(i.children) {
            this.rdraw(i.children,el);
          }
        }
      });
      C.Def(function setMode(mode) {
        var i,cn;
        for (var i in this.components) {
          cn=this.components[i];
          $(this[cn]).hide();
        }
        for(var i in this.modes[mode].shown) {
          cn=this.modes[mode].shown[i];
          $(this[cn]).show();
        }
      });
    });
    M.Class(function C() {
      C.Super(basic.Div);
      C.Init(function Modal(target) {
        basic.Div.call(this,"modalwindow");

        this.shade=new basic.Div("modalshader");
        this.shade.content("&nbsp;");

        this.target=target;

      });
      C.Def(function start() {
        this.target.add(this.shade);
        this.target.add(this);

      });
      C.Def(function end() {
        this.shade.remove();
        this.remove();
      });
    });


  });
});
