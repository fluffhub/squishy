Module(function M() {
  M.Def("apps",{});
  M.Import(
    "apps/",
    "squishy/membrane",
    function(apps,membrane) {
      Object.keys(apps).forEach(function (name) {
        if(apps[name].load instanceof Function) {
          apps[name].load(function(app) {
            M.Self.apps[name]=app
          });
        } else {
          M.Self.apps[name]=apps[name]
        }
      });
    });
});
