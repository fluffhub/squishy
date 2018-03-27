Module(function M() {
  M.Import(
    "spoon","basic","system","live","form","spoon/windowing",
    //  context actions
    //  list view
    //  tile view
    //  editor
    //  viewer
    function (spoon,basic,system,live,form,windowing) {
      M.Def(function match(file,name) {
        if (file instanceof system.File) {// || typeof file=="string" ) {
          return true;

        }

      });
      var TextEditor=M.Class(function C() {
        C.Super(windowing.AppContainer)
        C.Init(function TextEditor(loc,items) {
          windowing.AppContainer.call(this);
          //basic.Div.call(this);
          if (loc instanceof Element) {
          } else {
            loc=system.uri(loc)
          }
          var title=this.titlebar;
          //new basic.Span(loc);
          //title.addClass("title");
          //this.add(title);
          title.content(loc);
          var ta=new form.TextBox();
          this.add(ta);
          var te=this;
          Object.defineProperty(this,"File",{enumerable:false,writable:true,configurable:false})
          this.value=null;

          live.DeviceManager.retrieve(loc,function(results) {
            Object.keys(results).forEach(function (name) {
              var instance=results[name];
              if(instance instanceof system.File) {
                te.File=instance;
                console.debug({fileinstance:instance});
                te.File.read(function() {
                  te.value=te.File.value;
                  ta.value(te.value);
                  te.onload();
                });
              }
            });
          });
          this.addClass("TextEditor");
        });
        C.Def(function onload() {

        });
      });

      M.Class(function C() {
        C.Super(spoon.Tile);
        C.Init(function Tile() {

        });
      });
      var live_items=M.Def("live",[])
      M.Class(function C() {
        C.Init(function ListItem() {

        });
      });

      M.Class(function C() {
        C.Init(function Icon() {

        });
      });
      M.Class(function C() {
        C.Init(function Editor() {

        });
      });

      M.Class(function C() {
        C.Init(function Viewer() {

        });
      });
      var opener=M.Def(function open(loc) {
        if(loc in live_items) {

        } else {
          var te=new TextEditor(loc)
          live_items.push(te);
          return te;
        }

      });
      spoon.main.addApp("text",opener);


    });
});
