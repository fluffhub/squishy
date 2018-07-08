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
          this.titlebar.Mixin(events.HasEvents);
          this.size={width:400,height:300};
          this.drawTransform();

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

          //window controls

          //draggable
          var acw=this;
          this.enabledrag(function ondrag(i,v) {

            //// acw.element.style.top=v.position.y+"px";
            // acw.element.style.left=v.position.x+"px";/
          ///  i.parent.position.x=i.parent.position.x+i.delta.x
          //  i.parent.position.y=i.parent.position.y+i.delta.y
            i.drawTransform();
          //  i.parent.drawTransform();
            //console.debug({x:v.position.x,y:v.position.y});
          });
          //resizable
          ///console.debug(this);
          this.enableresize(undefined,function onresize(item) {
            extend(acw.titlebar.size,acw.size);
          });

        });
      });
    });
});
