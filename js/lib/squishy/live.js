Module(function M () {


  Import("squishy/system",function(system) {

    var loc = system.uri("");
    M.Def("~",loc);
    var root=system.uri("/");
    var devices=M.Def("DeviceManager",new system.DeviceManager());
    M.Def("root",root);
    //  console.debug({href:loc.href})


  });

  M.Def(function init(path,obj) {
    /* this is the dedicated init function for live objects.
    it will always pick the "live" filesystem of a device at a given hostname to add it to. */

    Import("squishy/system","squishy/remote",function(system,remote) {
      var url=system.uri(path);



      var manager=M.Self.DeviceManager;
      var live;
      //The common device ot all browser instances is the host of these files...
      if(url.hostname in manager.devices) {
        if(manager.devices[url.hostname].live !==undefined ) {
          live=manager.devices[url.hostname].live
        } else {
          live= new remote.Device(url.hostname,"live");

        }

      } else {
        live=new remote.Device(url.hostname,"live");
      }
      live.init(url.pathname,obj);
      //M.Self.devices.init(path.hostname,live);
    });
    //M.Self.devices[path.hostname].live.init(path.pathname,obj);
  });
  /// M.Def(function init(path, obj) {
  //   Import("squishy/live") ;
  // });



  Import("squishy/DOM", function(DOM){
    M.Def("main",new DOM.Frame());
  });
});

