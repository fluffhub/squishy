Module(function M () {
  var loc = document.createElement("a")
  loc.href="#"
  M.Def("~",loc.href)
  loc.href="/"
  var root=loc.href;
  M.Def("root",root);
  Import("squishy/DOM", function(DOM){
    M.Def("main",new DOM.Frame());
  });
  //  console.debug({href:loc.href})
  var devices={};

  M.Def("devices",devices);



  Import("squishy/system",function(system) {
    devices[root]=new system.Device(root);

  });

  M.Def(function init(path) {
    var loc2=document.createElement("a");
    loc2.href=path;
    var fileloc=loc2.href;
    loc2.href="/";
    var fileroot=loc2.href;

    if(fileroot in devices) {
      devices[fileroot].push(fileloc.slice(fileroot.length));
    } else {
     devices[fileroot]=[path];
    }

  });
});
