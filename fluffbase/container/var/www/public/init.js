Module(function M() {
  M.Index(
    "page",
    "user"
  );
  M.Import(
    "squishy",
    "squishy/DOM",
    "squishy/basic",
    "squishy/interactive",
    "squishy/form",
    "squishy/layout",
    "squishy/request",
    "squishy/membrane",
    "squishy/system",
    function(squishy,DOM, basic, interactive,form,layout,Request,membrane,system) {
      var title=M.Def("title","Squishy");
      M.Def("update",function() {
      });
      var Window=new DOM.Frame();
      var Title=M.Def("Title", new DOM.Tag({type:"title","content":title}));
      Window.head.add(Title);

      var URLVars=Window.getUrlVars();
      var page="js/app/index.js";
      if(URLVars.page!==undefined) {
        page=URLVars.page;
      }
      var Header=new DOM.Tag({type:"h1","content":title});
      var Content=new basic.Div("Content");
      Window.add(Content);

      var Location=new basic.Link({cls:"location",url:window.location.pathname});
      Location.content("Location: "+window.location.pathname);


      var Req=Request.Request;


      Import("/app/spoon/","squishy/system","squishy/live",function(spoon,system,live) {

        var SquishyLogo=null;

        window.live=live;
      
        Import("/app/fluffbase",function(fluffbase) {

        });
      });
    });
});
