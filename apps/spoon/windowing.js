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
      var theme = M.Def("Theme", {});
      M.Style(function S() {
       
        var pos = ["top","right","bottom","left"];
        var dim = ["height","width"]
        var dirs = ["n","e","s","w","nw","ne","se","sw"]
        var config=[
        [[0], [0]],
        [[1], [1]],
        [[2], [0]],
        [[3], [1]],
        [[0,2],[0,1]],
        [[0,1],[0,1]],
        [[1,2],[0,1]],
        [[2,3],[0,1]]
        ];
        theme.corner_handle_size=30;
        theme.side_handle_size=10;
        theme.offset=5;
        for (var i=0;i<dirs.length;i++) {
          var handleconfig = config[i];
          var dir=dirs[i];
          var size = theme.side_handle_size;
          if(dir[0].length==2) size=theme.corner_handle_size;
          var style={};
          for(var x=0;x<dir[0].length;x++) {
            style[pos[dir[0][x]]]="-"+theme.handle_offset+"px";
          }
          for(var y=0;y<dir[1].length;y++) {
            style[dim[dir[1][y]]]=size+"px";
          }
          S.addRule(".acw .ui-resizable-"+dir, style)

        }
              

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
            spoon.main.contextmenu.add(new interactive.MomentaryButton("X","ui_button",function() {
              spoon.main.close(acw);
              spoon.main.clearContext();

            }));

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

        });
      });
    });
});
