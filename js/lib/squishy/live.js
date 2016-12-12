Module(function M () {


  Import("squishy/system",function(system) {

    var loc = system.uri("");
    M.Def("~",loc);
    var root=system.uri("/");
    var devices=M.Def("devices",new system.DeviceManager());

    //  console.debug({href:loc.href})


  });

  M.Def(function init(path,obj) {
    /* this is the dedicated init function for live objects.
    it will always pick the "live" filesystem of a device at a given hostname to add it to. */

    Import("squishy/system","squishy/remote",function(system,remote) {
      var url=system.uri(path);



      var devices=M.Self.devices;
      var live;
      //The common device ot all browser instances is the host of these files...
      if(url.hostname in devices) {
        if(devices[url.hostname].live !==undefined ) {
          live=devices[url.hostname].live
        } else {
          live= new remote.Device(url.hostname,"live");

        }

      } else {
        live=new remote.Device(url.hostname,"live");
      }
      live.init(path.pathname,obj);
      //M.Self.devices.init(path.hostname,live);
    });
    //M.Self.devices[path.hostname].live.init(path.pathname,obj);
  });
  /// M.Def(function init(path, obj) {
  //   Import("squishy/live") ;
  // });


  M.Def("root",root);
  Import("squishy/DOM", function(DOM){
    M.Def("main",new DOM.Frame());
  });
});

