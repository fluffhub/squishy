/*

    Squishy Scaffold App


*/


/*

This is the importer for CKEDITOR.
Note that CKEDITOR is not loading with dependencies,
so there is a possible race condition bug
if something tries to use tinymce before it's done loading.


*/
/*
  the callback function here will never fire because ckeditor does not implement squishy (strict) modules.
  a future squishy release will allow loading requirejs modules which will be compatible,
  but less introspective than squishy modules.  The general solution to this is to only have
   CKEDITOR called on events fired after pageload.
   */
Import("/learnapp/js/lib/ckeditor/ckeditor.js",function(e) { });


/*
Module declaration.  Use this around the relevant portion of definition code for the module.
Now, M is the module definition.  So subsequent "descriptors" in the callback function refer to it.
*/
Module(function M() {

  /*
Multiple import statement.
The following import statement will not fire its callback until
all of the named dependencies are loaded and completed;
then the callback is given arguments representing the imported modules
in order.
*/
  M.Import(
    "squishy/DOM "+
    "squishy/basic "+
    "squishy/interactive "+
    "squishy/form "+
    "/js/lib/squishy_ext/Request "+  /* Set the absolute path here to match your system */
    "squishy/layout",
    function(DOM, basic, interactive,form,Request,layout) {

      //shorthand refer to Request.Request as Req
      var Req=Request.Request;


      var Title="Moby Dick";
      /* in this example, these values will be added to the "app" importable module: */
      /* this way you only have to declare these once for the app */
      M.Def("Title",Title);


      //init a new wrapper for the global window (Frame default)
      var Window=new DOM.Frame();

      //TabbedPane is a good general purpose app layout.
      var Main=new interactive.TabbedPane();
      M.Def("Main",Main); //now submodules can refer to the main window tabs as app.Main
      M.Def("Window",Window);

      Main.header.addClass("mainmenu");


      //this is mainly for debugging:  global-scope variables should not be used in production
      MainWindow=Main;


      //Typical process:  make some new Panes to be added to Main
      Main.Page=new basic.Pane("page","Page");
      Main.Home=new basic.Pane("home","Home");

      new Req("URI","JSON").Get("/sample.json",{},function(samplepage) {
        var UserInfo=new basic.Div("UserInfo");
        UserInfo.add(new basic.Span(samplepage.user.username,"username"));
        Main.Home.contents.add(UserInfo);
        Main.addTab("user","Home",Main.Home,"home");

        //Separate non-blocking import statement here because Page imports this file.
        Import("app/page",function(page) {
          Main.Page.contents.add(new page.Page(samplepage.page.text))
          Main.addTab("page1","Page",Main.Page);
        });
      });


      Main.resize=function resize() {
        /*
      overloading the default behavior of the tabbedpane resize
      */
        var w=this.element.parentNode.offsetWidth;
        if(w<640) { //collapse processes for a narrow window
        }
      }

      Window.add(Main);
      Window.add(Main.header);
    });
});
