Module(function M() {
  M.Def("apps",{});
  M.Import(
    "apps/",
    "squishy/membrane",
    function(apps,membrane) {

      var session_name="poop"







      //Import("spoon",function(spoon) {
      console.debug("spoon loaded from conf");
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
