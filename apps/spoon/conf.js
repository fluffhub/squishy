Module(function M() {
  M.Def("apps",{});
  M.Import(
    "apps/",
    "squishy/membrane",
    function(apps,membrane) {

      var session_name="poop"


      var a=document.createElement('a')
      a.href=""
      var loc=a.href




      M.Def("session",new membrane.Device(loc));




      //Import("spoon",function(spoon) {
      console.debug("spoon loaded from conf");
      Object.keys(apps).forEach(function (name) {
        if(apps[name].load instanceof Function) {

          apps[name].load(function(app) {
            M.Self.apps[name]=app
          });
        }
      });
    });
});
