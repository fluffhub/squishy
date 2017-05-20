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
        C.Mixin(transform.resizable);
        C.Mixin(transform.draggable);
        C.Init(function AppContainer() {

          basic.Div.call(this,"acw");


          //titlebar
          this.titlebar=new basic.Div("acb")
          this.add(this.titlebar);


          //content
          this.contents=new basic.Div("acc");
          this.add(this.contents);


          //window controls

          //draggable
          var acw=this;
          this.enabledrag(function ondrag(i,v) {
            console.debug({i:i,v:v})
            acw.style.top=v.y;
            acw.style.left=v.x;
          });
          //resizable


        });
      });
    });
});
