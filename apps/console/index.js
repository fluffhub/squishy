Module(function M() {
  M.Import(
    "squishy/DOM",
    "squishy/request",
    "squishy/form",
    "squishy/membrane",
    "squishy/system",
    "squishy/live",
    "squishy/basic",
    "squishy/styles",
    "spoon",
    "spoon/windowing",
    "squishy/events",
    "squishy/transform",
    function(DOM,Req,form,membrane,system,live,basic,styles,spoon,windowing,events,transform) {
      M.Style(function S() {
        var S=this; 
        var theme=S.Theme({
          font:"monospace",
          wrap:false,
          font_size__px:13,
        })
        S.Init(function () {
          S.Prefix(".Console .acc",function() {
            S.addStyle()
            S.Prefix(" form", function() {
              S.addStyle("::before",{
                font_family:theme.font, font_size__px:theme.font_size*1.2, 
                line_height__px:theme.font_size*1.4, 
                font_weight:"bold", text_indent__px:theme.font_size*0.4,
                content__string:">"
              });
              S.addStyle("", { height__px:theme.font_size*1.2,width__p:100,
                display:"flex",margin:0
              });
              S.addStyle(" input[type=\"submit\"]", { display:"none" });
              S.addStyle(" input:first-child",{
                background:"none",outline:"none", border:"none",
                font_weight:"bold",flex:"1 1 auto", line_height__px:theme.font_size*1.6, 
                text_indent__px:theme.font_size*0.5, font_family:theme.font
              });
            });
            S.Prefix(" .tty ", function() {
              S.addStyle("", {
                font_size:theme.font_size__px,
                display:"inline-block",padding:"0.5em 0",
                position:"absolute",font_family:theme.font,
                white_space:theme.wrap?"normal":"nowrap"
              });
              S.addStyle(".trans",{
                display: "block",width__p:100,position: "relative",
                box_sizing: "border-box"
              });
              S.addStyle(".trans",{ padding:"0 0.5em", display:"inline-block"});
              S.addStyle(".trans p", {white_space:"pre",padding:0,margin:0,
                font_family:theme.font})
              S.addStyle(".input", {font_family:theme.font});
              S.addStyle(".input::before", {content__string:">"});
            });
          });
        S.addStyle(".ScrollContainer", {transition_property:"top left bottom right", 
        transition_duration:"0.1s",
        transition_timing_function:"ease-out"
      });
        
      });
    });

      
      var ScrollContainer = M.Class(function C() {
        C.Super(basic.Div);
        C.Mixin(events.hasEvents);
        C.Init(function ScrollContainer() {
          basic.Div.call(this, "ScrollContainer");
          
        });

        C.Def(function drawTransform() {
            this.element.style.top=this.scrollcursor.y+"px";
            this.element.style.left=this.scrollcursor.x+"px";    
        });

        C.Def(function scrollTo(pos) {
          var scroller=this;
          if(typeof pos==="object") {
            var x=pos.x;
            var y=pos.y;
            if(typeof y==="number") {
              scroller.scrollcursor.y=y;
            }
            if(typeof x==="number") {
              scroller.scrollcursor.x=x;
            }
          } 
          if(typeof pos==="string") {
            ({
              "bottom":function to_bottom() {
                scroller.scrollcursor.y=scroller.parent.height()-scroller.height();
              },
              "top":function to_top() {
                scroller.scrollcursor.y=0;
              },
              "left":function to_left() {
                scroller.scrollcursor.x=0;
              },
              "right":function to_right() {
                scroller.scrollcursor.x=scroller.parent.width()-scroller.width();
              }
            })[pos]();
          }
          
          this.drawTransform();
        });
        C.Def(function enableScroll(config) {
          if(this.parent) {

          } else {
            throw new TypeError("Need a parent to scroll inside.");
          }
          Object.defineProperty(this,"scrolldelta",{ value:{x:0, y:0} })
          Object.defineProperty(this,"scrollorigin",{ value:{x:0, y:0} })
          this.scrollcursor={x:0,y:0};
          
           var config = config || {};
          var anchor = config.anchor || null;
          var handle = config.handle || null;
          var ondrag = config.ondrag || this.ondrag;
          this.scroll_sense = config.sense || -1;

          var mousebuttons = config.mousebuttons || [1];
          var touchfingers = config.touchfingers || [1, 2, 3];
          
          //make middle-click drag function
          var scroller=this;
          this.scrolling=false;
          this.addEvent("scrollstart", "mousedown touchstart", function(e) {
            var startscroll;
            if(e.touches) {
              if(touchfingers.indexOf(e.touches.length)>=0) {
                startscroll=true;
              }
            } 
            if(e.button) {
              if(mousebuttons.indexOf(e.button)>=0) {
                startscroll=true;
              }
            }
            if(startscroll) {
              var origin=scroller.scrollorigin;
              scroller.scrolling=true;
              var P={};
              if(e.touches) {
                origin.x=e.touches[0].clientX;
                origin.y=e.touches[0].clientY;
              } else if (typeof e.clientX ==="number") {
                origin.x=e.clientX;
                origin.y=e.clientY;
              } else {
                origin.x=0;
                origin.y=0;
              }
              scroller.enableEvents('scroll', 'scrollstop')
              this.addClass("scrolling");
            }
          }, this.parent);
          this.addEvent("scroll", "mousemove touchmove", function(e) {
            if(scroller.scrolling) {
              //test bounds 
              var delta = scroller.scrolldelta;
              var cursor = scroller.scrollcursor;
              var origin=scroller.scrollorigin;
              var mw=scroller.width();
              var pw=scroller.parent.width();
              var mh=scroller.height();
              var ph=scroller.parent.height();
              var mx=cursor.x;
              var my=cursor.y;
              var cx, cy;
              if(e.touches) {
                cx=e.touches[0].clientX;
                cy=e.touches[0].clientY;
              } else if(typeof e.clientX ==="number") {
                cx=e.clientX;
                cy=e.clientY;
              } else {
                cx=origin.x;
                cy=origin.y;
              }
              delta.x=origin.x-cx;
              delta.y=origin.y-cy;
              origin.x=cx;
              origin.y=cy;
              
              var scrolled=false;
              if(mh > ph) {
                if(my < ph - mh) cursor.y = ph-mh;
                else if(my > 0) cursor.y=0;
                else cursor.y=cursor.y-delta.y;
                //can scroll in Y - callback with change in pos for mousemove   
                scrolled=true;
              }
              if(mw > pw ) {
                //can scroll in X - callback with change in pos for mousemove
                if(mx < pw - mw) cursor.x = pw-mw;
                else if(mx > 0) cursor.x=0;
                else cursor.x=cursor.x-delta.x;
                scrolled=true; 
              }
              if(scrolled) {
                scroller.onscroll.call(scroller, e);
                scroller.drawTransform();
              }
            }
          }, document.body);
          this.addEvent("scrollstop", "mouseup touchend touchcancel mouseleave", function(e) {
            this.removeClass("scrolling");
            this.disableEvents("scroll", "scrollstop");
            scroller.scrolling=false;
          },document.body);
          if(handle) {
            if(handle.enableDrag instanceof Function) {

            } else {
              handle.Mixin(transform.Draggable)
            }
            if(this.scrollbar)
              this.scrollbar.add(handle);
          }
          this.enableEvents("scrollstart","scroll","scrollstop")
        });
      });
      var Commander=M.Class(function C() {
        C.Def("url","/squishy/src")
        C.Def("id","pool")
        C.Super(windowing.AppContainer);
        C.Init(function Commander(id) {
          try {
            Object.defineProperty(this, "session", { value:new membrane.Device(system.uri("").hostname) });
          } catch (e) {
            Object.defineProperty(this,"session", { value:live.DeviceManager.devices[system.uri("").hostname].membrane});
          }
          windowing.AppContainer.call(this);
          this.titlebar.content("Membrane Console");
          this.request=new Req.Request("URI","TEXT");
          this.request.request.timeout=60000;
          var commander=this;

          this.addClass("Console");
          if(id!==undefined) {
            this.id=id;
          } else {
            this.id="pool";
          }
          commander.output=new ScrollContainer();
          commander.output.addClass("tty");
          commander.contents.add(commander.output);
          commander.output.enableScroll();
          commander.output.onscroll=function(e) {
      
          }
          var scroller=commander.output;
          var cursor=commander.output.scrollcursor;
          parent_onresize = commander.onresize;
          commander.onresize=function(handle) {
            parent_onresize.call(this, handle);
            scroller.scrollTo("bottom");
          }
          Import("squishy/live","squishy/form",function(live,form) {
            var  selector=new form.Selector();
            var manager=live.DeviceManager;
            var devnames=Object.keys(manager.devices);
            for(var i=0;i<devnames.length;i++) {
              var devname=devnames[i];
            }
            var input=new form.TextInput(null,"",function() { 

            });
            input.addClass("console_input");

            var submit=new form.Submit();

            var myform=new form.Form(undefined,function(e) {
              e.preventDefault();
              var command=input.value();
              input.element.focus();
              input.element.select();
              var update=commander.addTransaction(command);
              commander.send(command,function(result) {
                update(result);
                commander.contents.element.scrollTop=commander.contents.element.scrollHeight;
              });
            });
            myform.element.action="#";

            myform.Madd(input,submit);
            commander.form=myform;
            commander.output.add(myform);
            
          commander.output.scrollTo("bottom");
          });
        });

        C.Def(function addTransaction(input) {
          var commander=this;
          var trans=new basic.Div("trans");
          var inp=new basic.Div("input");
          inp.content(input);
          trans.add(inp);
          trans.addClass("loading");
          commander.output.insert(trans,commander.form);
          return function(output) {
            trans.removeClass("loading");
            if(output.trim()!="") {
              var out=new basic.Div("output");
              var outwords=output.split("\n");
              for(var i=0;i<outwords.length;i++) {
                out.add(new basic.P(outwords[i]));
              }
              trans.add(out);
              commander.output.scrollTo("bottom");
            }
          }
        });

        C.Def(function send(command,receive) {
          this.session.exec(command,receive);
        });
      });

      var open=M.Def(function open() {
        return new Commander();
      });
      spoon.main.addApp("console",M.Self);
    });
});