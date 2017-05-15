Module(function M() {
  M.Import(
    "spoon","basic","system","live","form",
    //  context actions
    //  list view
    //  tile view
    //  editor
    //  viewer
    function (spoon,basic,system,live,form) {
      M.Def(function match(file,name) {
        if (file instanceof system.File) {// || typeof file=="string" ) {
          return true;

        }

      });
      var TextEditor=M.Class(function C() {
        C.Super(basic.Div)
        C.Init(function TextEditor(loc,items) {
          basic.Div.call(this);
          var title=new basic.Span(loc);
          this.add(title);
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
                te.File.load(function() {
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
      M.Def(function open(loc) {
                                    if(loc in live_items) {

                                    } else {
                                      var te=new TextEditor(loc)
                                    live_items.push(te);
                                    return te;
                                    }

      });


    });
});
