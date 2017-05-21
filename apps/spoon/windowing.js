Module(function M() {
  M.Import(
    "squishy/basic",
    "squishy/interactive",
    "squishy/transform",
    "spoon/conf",
    function(basic,interactive,transform,conf) {
      var AppConfig=M.Class(function C() {
        C.Super(interactive.MomentaryButton);
        C.Init(function AppConfig() {
          interactive.MomentaryButton.call(this,"o");

        });
      });
      var AppContainer=M.Class(function C() {
        C.Super(basic.Div);
        C.Mixin(transform.Resizable);
        //C.Mixin(transform.Draggable);
        C.Init(function AppContainer() {

          basic.Div.call(this,"acw");


          //titlebar
          this.titlebar=new basic.Div("acb")
          this.add(this.titlebar);
          this.titlebar.Mixin(transform.Draggable);


          //content
          this.contents=new basic.Div("acc");
          this.add(this.contents);


          //window controls

          //draggable
          var acw=this;
          this.titlebar.enabledrag(function ondrag(i,v) {

            acw.element.style.top=v.position.y+"px";
            acw.element.style.left=v.position.x+"px";
            console.debug({x:v.position.x,y:v.position.y});
          });
          //resizable
          this.enableresize();

        });
      });
    });
});
