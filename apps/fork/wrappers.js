Module(function M() {
  M.Import("system",function(system) {
    Import("fork",function(fork) {
      var fliw=M.Class(function C() {

        C.Init(function FileListItemWrapper(match,wrap,open) {
          if(wrap instanceof Function) { this.wrap=wrap; }
          if(match instanceof Function) { this.match=match; }
          if(open instanceof Function) { this.open=open;  } else this.open=null;
        });
        C.Def(function wrap(item) {
          return item;
        });
        C.Def(function match(item,name) {
          return false;
        });
        ////    C.Def(function open() {
        ///       return null;
        //     });

      })

      var fliws={};
      M.Def("FileListItemWrappers",fliws);
      var afliw=M.Def(function addFileListItemWrapper(name,match,wrap,open) {
        fliws[name]=new fliw(match,wrap,open);
      });
      M.Def(function getWrapper(item) {
        var ws=[];
        var wns=Object.keys(fliws);
        for(var i=0;i<wns.length;i++) {
          if(fliws[wns[i]].match(item)) {
            ws.push(fliws[wns[i]]);
          }

        }
        return ws;
      });
      afliw("Module",function match(item) {
        if (item instanceof window.Module) return true;
        return false;
      },function wrap(item) {
        item.addClass("Module")
      },function open(obj, FL) {
        var filenames=Object.keys(obj);

        filenames.forEach(function(filename) {
          var dirloc="";
          var file = obj[filename];
          if(file instanceof Module) {
            if(typeof file.dir == "string") {
              dirloc=system.uri(file.filename)
            }

          } else {
            var str;
            if(FL.loc.href.slice(-1)=="/") str=FL.loc.href+filename
            else str=FL.loc.href+"#"+filename;
            dirloc=system.uri(str);
          }
          //if(filename in FL.contents) {
          //  FL.contents[filename].addReference(devicename,file);
          //} else {
          // var F;

          FL.addListItem(filename,dirloc,obj);


        });
      });
      Import("squishy/membrane",function(membrane) {
        afliw("membrane",function match(item, name) {
          if(item instanceof membrane.File || item instanceof membrane.Dir) {
            return true;
          }
          return false;
        },function wrap(item) {
          item.addClass("membrane");
        });

      });
      afliw("class",function match(item, name) {
        if(item instanceof Function && item.isClass) {
          return true;
        }
        return false;
      },function wrap(item) {
        item.addClass("Class");
      });
      Import("squishy/interactive","apps/spoon",function(interactive,spoon) {
        afliw("jsexe",function match(item,name) {
          if(item instanceof Object && item.open instanceof Function) {
            return true;
          }
          return false;
        },function wrap(item,obj) {
          item.addClass("jsexe");

          var button=new interactive.MomentaryButton("open","opener",function() {
            var newwindow=item.open();
            spoon.main.addTask(obj,newwindow);

          });
          item.addBefore(button);
        });
      });
      Import("squishy/basic",function(basic) {
        afliw("string",function match(item,name) {
          if (typeof item=="string") {
            return true;
          } return false;

        },function wrap(item,obj) {
          item.addClass("string");
          if(typeof obj=="string") {
            var span=new basic.Span(obj);
            span.addClass("value");
            item.add(span);
          }
        });
      });
      afliw("Fun",function match(item, name) {
        if(item instanceof Function) {
          return true;
        }
        return false;
      },function wrap(item) { item.addClass("function");  });
      afliw("Dir",function match(item, name) {
        if (item instanceof system.Dir) return true;
        return false;
      },function wrap(item) {
        item.addClass("Directory")
      },function open(obj, FL) {
        obj.list(function() {

          var filenames=Object.keys(obj.contents);

          filenames.forEach(function(filename) {
            var file = obj.contents[filename];

            //if(filename in FL.contents) {
            //  FL.contents[filename].addReference(devicename,file);
            //} else {
            // var F;
            var str;
            if(FL.loc.href.slice(-1)=="/") str=FL.loc.href+filename
            else str=FL.loc.href+"/"+filename;
            var dirloc=system.uri(str);

            FL.addListItem(filename,dirloc,obj);

          });
        });
      });
    });
  });
});
