Module(function M() {
  M.Import(
    "/app/fluffy/JSeditor",
           "/app/spoon",
    "squishy/basic","squishy/system",
    "squishy/live","squishy/form",
    "spoon/windowing","squishy/interactive",

    //  context actions
    //  list view
    //  tile view
    //  editor
    //  viewer

    function (JSe,spoon,basic,system,live,form,windowing,interactive) {
       console.debug({"js editor loaded":JSe} );
      M.Def(function match(file,name) {
        console.debug({jsmatch:file,name:name});
        if(file instanceof Module || file instanceof Function || file instanceof Object) {

          return true;
        }
        if(typeof name=="string" && name.slice(-3)==".js") {
          return true;
        }

      });

      M.Class(function C() {
        C.Init(function Tile() {
          C.Super(spoon.Tile)
        });
      });

      M.Class(function C() {
        C.Init(function ListItem() {

        })
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

      var CodeEditor=M.Class(function C() {
        C.Super(windowing.AppContainer)
        C.Init(function CodeEditor(loc,items) {
          windowing.AppContainer.call(this);

          this.element.style.width="400px";
          this.element.style.height="300px";

          this.main=new interactive.TabbedPane("CodeSelector");

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
          ta.element.style.display="none";
          this.add(ta);
          this.formvalue=ta;
          var te=this;



          Object.defineProperty(this,"File",{enumerable:false,writable:true,configurable:false})
          this.value=null;
          try {
          live.DeviceManager.retrieve(loc,function(results) {
            Object.keys(results).forEach(function (name) {
              var instance=results[name];
              if(instance instanceof Module) {
                te.Module=instance;
                console.debug({fileinstance:instance});
                //te.Module.read(function() {
                //  te.value=te.File.value;
                //  ta.value(te.value);
                //  te.onload();
                //});
                te.value="Module("+instance.def.toString()+");";
                console.debug(te.value);
                ta.value(te.value);
                te.onload();
              }
            });
          });
        } catch(e) {
          if(e instanceof membrane.MembraneError) {
            console.debug({e:e, "Failed to load":loc})
          }
        }
          this.addClass("CodeEditor");
        });
        C.Def(function onload() {
          this.main=new JSe.JSEditor(this.value,spoon.main);
          this.contents.add(this.main);
        });
      });
      var live_items={};

      var open=M.Def(function open(loc) {
        if(loc instanceof Element) {

        } else {
          loc = system.uri(loc);
        }
        if(loc.path in live_items) {
          spoon.main.tm.Activate(live_items[loc.path]);
          return live_items[loc.path];
        } else {
          var te=new CodeEditor(loc.path);
          live_items[loc.path]=te;
          return te;
        }

      });

      spoon.main.addApp("fluffy",M.Self);

    });
});
