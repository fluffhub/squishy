Module(function M() {
  M.Import("system",function(system) {
    Import("fork",function(fork) {
      var fliw=M.Class(function C() {

        C.Init(function FileListItemWrapper(match,wrap,open) {
          if(wrap instanceof Function) { this.wrap=wrap; }
          if(match instanceof Function) { this.match=match; }
          if(open instanceof Function) { this.open=open; }
        });
        C.Def(function wrap(item) {
          return item;
        });
        C.Def(function match(item,item) {
          return false;
        });
        C.Def(function open() {

        });

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

      });
      afliw("Dir",function match(item) {
        if (item instanceof system.Dir) return true;
        return false;
      },function wrap(item) {
        item.addClass("Dir")
      },function open(obj, FL) {
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

          var F=new fork.FileListItem(filename,dirloc,function() {
            console.debug({Module:file});
            FL.click.call(FL,dirloc);
          });
          FL.contents.add(F);

        });
      });
    });
  });