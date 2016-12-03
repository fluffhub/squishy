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


  var devices={};

  M.Def("devices",devices);

  // Import("squishy/system",function(system) {
  //   devices[root]=new system.Device(root);

  // });
  M.Def(function init(path,obj) {


    Import("squishy/system",function(system) {
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
      var cursor=devices[fileroot].root;
      for(var i=0;i<dirs.length-1;i++) {
        var dn=dirs[i];

        if(dn in cursor.contents) {
          cursor=cursor.contents[dn];
        } else {
          cursor=cursor.mkdir(dn,{});

        }
      }

      cursor.contents[dirs[dirs.length-1]]=obj;

      // devices[fileroot].push(fileloc.slice(fileroot.length));

    });



  });
});

