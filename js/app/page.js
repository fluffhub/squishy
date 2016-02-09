Module(function M() {
  M.Import("app squishy/basic squishy/interactive",function(app, basic, interactive) {
    var Title=app.Title;
    var Page=M.Class(function C() { //the var name here is only for local scope.
      C.Super(basic.Div);
      C.Init(function Page(content) {  //the function name here is what gets assigned to the module
        basic.Div.call(this,"Page");
        this.add(new basic.Span(Title,"Title")); //just an example of passing values across modules
        this.content(content); //assigning innerHTML
      });
    });
  });
});
