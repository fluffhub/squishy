Module(function M() {
  M.Import(
    "squishy/basic",
    "squishy/interactive",
    "squishy/transform",
    "spoon/conf",
    "squishy/events",
    "spoon",
    function(basic,interactive,transform,conf,events,spoon) {
      var AppConfig=M.Class(function C() {
        C.Super(interactive.MomentaryButton);
        C.Init(function AppConfig() {
          interactive.MomentaryButton.call(this,"o");

        });
      });

      M.Style(function S() {
        var S=this;
        var theme = S.Theme({
          corner_handle_size__px:30,
          side_handle_size__px:10,
          handle_offset__px:5,
          frame_bg_color__color:[0.5,0.5,0.5,0.5],
          frame_fg_color__color:[0.8,0.8,0.8,0.5],
          bar_height__px:25,
          bar_font_size__px:12.5,
        });
        var pos = ["top","right","bottom","left"];
        var dim = ["height","width"]
        var dirs = ["n","e","s","w","nw","ne","se","sw"]
        var configs=[
          [[0], [0]],
          [[1], [1]],
          [[2], [0]],
          [[3], [1]],
          [[0,2],[0,1]],
          [[0,1],[0,1]],
          [[1,2],[0,1]],
          [[2,3],[0,1]]
        ];
        S.Init(function() {
          for (var i=0;i<dirs.length;i++) {
            var config = configs[i];
            var dir=dirs[i];
            var size = theme.side_handle_size;
            var c0=config[0];
            var c1=config[1];
            if(c0.length==2) size=theme.corner_handle_size;
            var style={};
            for(var x=0;x<c0.length;x++) {
              style[pos[c0[x]]]="-"+theme.handle_offset;
            }
            for(var y=0;y<c1.length;y++) {
              style[dim[c1[y]]]=size;
            }
            S.addStyle(".acw .ui-resizable-"+dir, style)
          }

          S.addStyle(".align_button", { position:"absolute",top:0,bottom:0,margin:"auto",height:"20px",width:"20px",left:0,right:0,"background-color":"blue",})
          S.addStyle(".acw", { position: "absolute", display: "inline-block", "background-color": "rgb(239, 239, 239)"  });
          S.addStyle(".acw", { transition: "opacity 0.2s ease-out, box-shadow 0.1s ease-out","border-radius":"1px", opacity: 0, "z-index":0 });
          S.addStyle(".acw.visible", {  opacity: 1, "z-index": 1000,"box-shadow":"0px 0px 3px 0px rgba(0,0,0,0.7)" });
          S.addStyle(".acw.active", {  transition:"opacity 0.1s, box-shadow 0.2s ease-in", "box-shadow":"1px 1px 6px 1px rgba(0,0,0,0.5)","z-index":1000000});
          S.addStyle(".acc", { overflow:"hidden",left: 0, right: 0, top:theme.bar_height, bottom: 0, position: "absolute"        });
          S.addStyle(".acb", { height:theme.bar_height,"text-indent__px":theme.bar_height__px/2,"line-height":theme.bar_height });
        });
              

      });

      var AppContainer=M.Class(function C() {
        C.Super(transform.HTMLPositionBox);
        C.Mixin(transform.Resizable);
        C.Mixin(transform.Draggable);
        C.Mixin(events.HasEvents);
        //C.Mixin(transform.Draggable);
        C.Init(function AppContainer(parent) {
          transform.HTMLPositionBox.call(this);
          //this.Mixin(transform.Resizable);
          //this.Mixin(events.HasEvents);
          this.parent=parent;

          this.addClass("acw");

          //titlebar
          this.titlebar=new basic.Div("acb")
          this.add(this.titlebar);
          this.titlebar.Mixin(events.hasEvents);
          this.position={x:0,y:0};
          this.size={width:400,height:300};
          

          //content
          this.contents=new basic.Div("acc");
          this.add(this.contents);
          var acw=this;

          this.titlebar.addEvent("context","contextmenu",function() {

          });
          this.titlebar.enableEvents("context");
          this.drawTransform();
          //window controls

          //draggable
          var acw=this;
          this.enabledrag(function ondrag(i,v) {

            //// acw.element.style.top=v.position.y+"px";
            // acw.element.style.left=v.position.x+"px";/
          ///  i.parent.position.x=i.parent.position.x+i.delta.x
          //  i.parent.position.y=i.parent.position.y+i.delta.y
            acw.drawTransform();
          //  i.parent.drawTransform();
            //console.debug({x:v.position.x,y:v.position.y});
          },this.titlebar.element);
          //resizable
          ///console.debug(this);
          this.enableresize("n,e,s,w,nw,ne,se,sw",function onresize(item) {
           
          });

          this.onresizestart=function onresizestart(handle) {
            var dir=handle.dir;
            if(dir=="n" || dir=="s") {
              acw.find_edges(true, handle);
            } 
            if(dir=="e" || dir=="w") {
              acw.find_edges(false, handle);
            }

          };

          this.onresizestop=function onresizestop(handle) {
            acw.hide_edges();
          };

        });
        C.Def(function hide_edges() {
          var task_names = Object.keys(this.parent.tasks)
          var parent=this.parent;
          task_names.forEach(function(task_name) {
            var task=parent.tasks[task_name];
            Object.keys(task.handles).forEach(function(handlename) {
              var handle=task.handles[handlename];
              if(handle.align_button) handle.align_button.hide();

            });
          });
        });
        C.Def(function find_edges(horizontal) {
          var task_names = Object.keys(this.parent.tasks)
          var dirs=["e","w"];
          if(horizontal) dirs=["n","s"];
          task_names.forEach(function(task_name) {
            var task=this.parent.tasks[task_name];
            var handles = [task.handles[dirs[0]],task.handles[dirs[1]]];
            handles.forEach(function(handle) {
              if(handle.align_button) { 
                handle.align_button.onclick=function() {

                }
              } else {
                var classname;
                if(horizontal) classname="horizontal "
                else classname="vertical "
                var align_button=new interactive.MomentaryButton(" ", classname+"align_button", function(e) {
                  console.debug({"alignment":handle});
                });
                Object.defineProperty(handle,"align_button", {value:align_button})
                handle.add(align_button);
              }
              handle.align_button.show();
            });
          
          });
        });
      });
    });
});
