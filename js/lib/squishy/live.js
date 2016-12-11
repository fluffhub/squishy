Module(function M () {
  Import("squishy/system",function(system) {
    M.Def("devices",new system.DeviceManager());

    //  console.debug({href:loc.href})

    Import("squishy/DOM", function(DOM){
      M.Def("main",new DOM.Frame());
    });
  });
     var loc = document.createElement("a")
    loc.href="#"
    var home=loc.href;
    M.Def("~",loc.href)
    loc.href="/"
    var root=loc.href;
    M.Def("root",root);

});

