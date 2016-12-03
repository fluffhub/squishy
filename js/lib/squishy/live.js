Module(function M () {
  var loc = document.createElement("a")
  loc.href="#"
  var home=loc.href;
  M.Def("~",loc.href)
  loc.href="/"
  var root=loc.href;
  M.Def("root",root);
  Import("squishy/DOM", function(DOM){
    M.Def("main",new DOM.Frame());
  });
  //  console.debug({href:loc.href})




  // Import("squishy/system",function(system) {
  //   devices[root]=new system.Device(root);

  // });
  Import("squishy/system",function(system) {
    var devices=new system.Device({});

    M.Def("devices",devices);

    M.Def(function init(path,obj) {


      var loc2=document.createElement("a");
      loc2.href=path;
      var fileloc=loc2.href;
      loc2.href="/";
      var fileroot=loc2.href;
      var uri=fileloc.slice(fileroot.length);
      var dirs=uri.split('/');
      if(fileroot in devices) {


      } else {
        devices[fileroot]=new system.Device({});
      }
      var device=devices[fileroot];
      var cursor=device;
      for(var i=0;i<dirs.length-1;i++) {
        var dn=dirs[i];

        if(dn in cursor) {
          cursor=cursor[dn].contents;
        } else {
          cursor[dn]=new system.Dir(dn,{});
          cursor=cursor[dn].contents;
        }
      }

      cursor[dirs[dirs.length-1]]=obj;

      // devices[fileroot].push(fileloc.slice(fileroot.length));

    });
  });
});

