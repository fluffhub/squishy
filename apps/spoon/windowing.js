Module(function M() {
  M.Import(
    "squishy/basic",
    "squishy/interactive",
    "squishy/transform",
    "spoon/conf",
    "squishy/events",
    function(basic,interactive,transform,conf,events) {
      var AppConfig=M.Class(function C() {
        C.Super(interactive.MomentaryButton);
        C.Init(function AppConfig() {
          interactive.MomentaryButton.call(this,"o");

        });
      });
      var AppContainer=M.Class(function C() {
        C.Super(transform.HTMLMatrixBox);
        //C.Mixin(transform.Resizable);
        //   C.Mixin(events.HasEvents);
        //C.Mixin(transform.Draggable);
        C.Init(function AppContainer(parent) {
          this.parent=parent;
          transform.HTMLMatrixBox.call(this);
          this.addClass("acw");


          //titlebar
          this.titlebar=new basic.Div("acb")
          this.add(this.titlebar);
          this.titlebar.Mixin(transform.Draggable);
          this.Mixin(transform.Resizable);
          this.Mixin(events.HasEvents);
          //content
          this.contents=new basic.Div("acc");
          this.add(this.contents);
          var acw=this;


          //window controls

          //draggable
          var acw=this;
          this.titlebar.enabledrag(function ondrag(i,v) {

            acw.element.style.top=v.position.y+"px";
            acw.element.style.left=v.position.x+"px";
            //console.debug({x:v.position.x,y:v.position.y});
          });
          //resizable
          ///console.debug(this);
          this.enableresize()

        });
      });
    });
});
