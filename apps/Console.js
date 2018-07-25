Module(function M() {
  //console.debug(Import);
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
        S.addStyle(".Console .acc form ", "position:absolute;bottom:0;height:1.5em;width:100%;display:flex;margin:0;")
        S.addStyle(".Console .acc textarea",{width: "100%",clear: "both",border:"none", "background":"none"});
        S.addStyle(".Console .acc .trans",{display: "block",width:"100%",position: "relative",'box-sizing': "border-box"});
        S.addStyle(".Console .acc form input[type=\"submit\"]", "flex:0 0 3.5em;border:none; display:block;width:3em;bottom:0px;line-height:1.5em;font-family:monospace serif;");
        S.addStyle(".Console .acc form input:first-child",{flex:"1 1 auto", "line-height":"1.5em", "text-indent":"0.5em", border:"none","font-family":"monospace, serif"});
       
        S.addStyle(".Console .acc .tty .trans","padding:0 0.5em; display:inline-block;float:left;clear:both;");
        S.addStyle(".Console .acc .tty", "display:inline-block;padding:0.5em 0;padding-bottom:1.5em;position:absolute;font-family:monospace serif;")
        S.addStyle(".Console .tty .trans p", "padding:0;margin:0;font-family:monospace;")
        S.addStyle(".Console .tty .input", "font-family:monospace;")
        S.addStyle(".Console .tty .input:before", "content:\"> \";")
        S.addStyle(".Console","position: absolute;");
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

        C.Def(function enableScroll(config) {
          if(this.parent) {

          } else {
            throw new TypeError("Need a parent to scroll inside.");
          }
          Object.defineProperty(this,"scrolldelta",{ value:{x:0, y:0} })
          
          Object.defineProperty(this,"scrollorigin",{ value:{x:0, y:0} })

          Object.defineProperty(this,"scrollcursor",{value:{x:0,y:0}, enumerable:true });
          
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
              } else {
                origin.x=e.clientX;
                origin.y=e.clientY;
              }
              scroller.enableEvents('scrollstop')
              this.addClass("scrolling");
            }
          }, this.parent);
          this.addEvent("scroll", "mouseover touchmove", function(e) {
            if(scroller.scrolling) {
              //test bounds
              var P={};
              if(e.touches) {
                P.x=e.touches[0].clientX;
                P.y=e.touches[0].clientY;
              } else {
                P.x=e.clientX;
                P.y=e.clientY;
              }

              var delta = scroller.scrolldelta;
              console.debug({parent:scroller.parent.height(), me:scroller.height()});
              var cursor = scroller.scrollcursor;
              var origin=scroller.scrollorigin;
              var mw=scroller.width();
              var pw=scroller.parent.width();
              var mh=scroller.height();
              var ph=scroller.parent.height();
              var mx=scroller.scrollcursor.x;
              var my=scroller.scrollcursor.y;
              if(mh > ph && my > ph - mh && my <= 0) {
                //can scroll in Y - callback with change in pos for mousemove

                delta.y=origin.y-P.y;
              }

              if(mw > pw && mx <= 0 && mx > pw - mw) {
                //can scroll in X - callback with change in pos for mousemove
                delta.x=origin.x-P.x;

              }
              console.debug({delta,cursor})
              origin.x=cursor.x=cursor.x+delta.x;
              origin.y=cursor.y=cursor.y+delta.y;
              
              scroller.onscroll.call(scroller, e);
              scroller.drawTransform();
            }
          }, this.parent);
          this.addEvent("scrollstop", "mouseup touchend touchcancel", function(e) {
            this.removeClass("scrolling");
            this.disableEvents("scrollstop");
            scroller.scrolling=false;
          },document);
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
            console.debug(commander.output.scrollcursor);

          }
          Import("squishy/live","squishy/form",function(live,form) {
            var  selector=new form.Selector();
            var manager=live.DeviceManager;
            var devnames=Object.keys(manager.devices);
            for(var i=0;i<devnames.length;i++) {
              var devname=devnames[i];
            }
            var input=new form.TextInput("input","",function() { 

            });

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
            commander.contents.add(myform);
          });
        });

        C.Def(function addTransaction(input) {
          var commander=this;
          var trans=new basic.Div("trans");
          var inp=new basic.Div("input");
          inp.content(input);
          trans.add(inp);
          trans.addClass("loading");
          commander.output.add(trans);
          return function(output) {
            trans.removeClass("loading");
            if(output.trim()!="") {
              var out=new basic.Div("output");
              var outwords=output.split("\n");
              for(var i=0;i<outwords.length;i++) {
                out.add(new basic.P(outwords[i]));
              }
              trans.add(out);
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
