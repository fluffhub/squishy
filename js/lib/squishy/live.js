Module(function M () {
  Import("squishy/system",function(system) {
    M.Def("devices",new system.DeviceManager());
    var loc = document.createElement("a")
    loc.href="#"
    var home=loc.href;
    M.Def("~",loc.href)
    loc.href="/"
    var root=loc.href;
    M.Def("root",root);

    //  console.debug({href:loc.href})

    Import("squishy/DOM", function(DOM){
      M.Def("main",new DOM.Frame());
    });
  });
});

