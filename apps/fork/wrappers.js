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
        C.Def(function match(name,item) {
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
      for(var i=0;i<fliws.length;i++) {
        if(fliws[i].match(item)) {
          ws.push(fliws[i]);
        }

      }
      return ws;
    });
    afliw("Module",function(item) {
      if (item instanceof Module) return true;
      return false;
    },function(item) {
      item.addClass("Module")
    });
    afliw("Dir",function(item) {
      if (item instanceof system.Dir) return true;
      return false;
    },function(item) {
      item.addClass("Dir")
    });
  });
});
