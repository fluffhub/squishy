Module(function M() {
  M.Index("api","forms");

  M.Import("fluffbase/api","fluffbase/forms","squishy/basic",function(api,forms,basic) {
    M.Class(function C() {
      C.Super(basic.Div);
      C.Def("api",null);
      C.Init(function Fluffbase() {
        basic.Div.call(this,"fluffbase");
        this.api=new api.FluffbaseApi();
        this.api.onupdate=this.updateWidget;

        this.api.update();
      });


    });

  });
});
