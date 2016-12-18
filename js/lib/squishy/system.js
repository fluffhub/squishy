Module(function M() {
  var uri=M.Def(function uri(loc) {
    var a=document.createElement("a")
    a.href=loc
    return a;
  });
  M.Class(function C() {
    C.Init(function Device(path,name) {
      var device=this;
      if(typeof name=="string") {
        device.name=name
      }
      C.Def("Dir",M.Self.Dir);
      Import("squishy/live",function(live) {
        var url
        if(typeof path == "string") {
          url=uri(path)
        } else {
          url=uri("/");
        }
        live.devices.init(url.hostname,device);
      });

      // if(typeof name=="string")
      //   this.name=name;
      // if(root instanceof M.Self.Dir) {
      //   this.root=root;
      // } else {
      // }

    });
    C.Def(function retrieve(path, result) {
      var device=this;
      var cursor=this.root;
      var fns=path.split("/")

      for(var i=0;i<dirs.length-1;i++) {
        var dn=dirs[i];
        if(dn in cursor.contents) {
          cursor=cursor.contents[dn];
        }
      }
      result(cursor);
    });
    C.Def(function init(path,obj) {
      var device=this;
      Import("squishy/system",function(system) {

        var fileloc=system.uri(path).href;
        var fileroot=system.uri("/").href;
        var uri=fileloc.slice(fileroot.length);
        var dirs=uri.split('/');


        var cursor=device.root;
        for(var i=0;i<dirs.length-1;i++) {
          var dn=dirs[i];
          if(dn in cursor.contents) {
            cursor=cursor.contents[dn];
          } else {
            cursor=cursor.mkdir(dn,{});
          }
        }
        var fn = dirs[dirs.length-1];
        if (fn in cursor.contents && cursor.contents[fn] instanceof Array) {
          if(obj instanceof Array) {
            cursor.contents[fn]=cursor.contents[fn]+obj;
          } else {
            cursor.contents[fn].push(obj);
          }
        } else {
          if(obj instanceof Array) {
            cursor.contents[fn]=obj;
          } else {
            cursor.contents[fn]=[obj];
          }
        }
        // devices[fileroot].push(fileloc.slice(fileroot.length));

      });
    });
    C.Def("exec",null)
  });
  M.Class(function C() {
    C.Init(function File(name,value) {
      this.name=null
      this.value=null
      if(typeof name=="string") this.name=name;
      if(value!==undefined) this.value=value;
    });
    C.Def(function read() {
      return this.value
    });
    C.Def(function write(value) {
      if(value!==undefined)
        this.value=value;
    });
    C.Def(function rename(name) {
      if(typeof name=="string")  {
        this.name=name
      }
    });

  });
  var DeviceManagerException=function(message) {console.debug("Device Manager Exception: "+message)};
  M.Class(function C() {

    C.Init(function DeviceManager() {
      this.devices={};

    });
    C.Def(function retrieve(path, result) {
      var all={}
      var names= Object.keys(this.devices);

      var fs=this;
      var name=path.split("/")[0]
     // names.forEach(function(name) {
        var i=Object.keys(this.devices[name]).length;

        Object.keys(this.devices[name]).forEach(function(id) {
          i--;
          fs.devices[name].retrieve(path,function(value) {
            all[id]=value;
            if(i==0) result(all);
          });
        });
    //  });

    });
    C.Def(function init(path,device) {
      var manager=this;
      var url=uri(path)
      var devices;
      var name=null
      if(typeof device.name == "string") {
        name=device.name
      } else {
        name="Device"+Object.keys(devices).length
      }
      if(this.devices[url.hostname] instanceof Object)
        devices=this.devices[url.hostname];
      else
        devices=this.devices[url.hostname]={}


        if(devices[name] ===undefined) {
          devices[name]=device;
        } else {
          throw new DeviceManagerException("Device already exists: "+name);
        }
    });
  });
  var Dir=M.Class(function C() {
    C.Init(function Dir(name,contents) {
      if(typeof name=="string") {
        this.name=name
      }
      if(contents!==undefined) {
        this.contents=contents
      } else {
        this.contents={}
      }
      this.parent=null;
    });
    C.Def(function list(result) {
      if(result instanceof Function) {
        result(this.contents);
      }
      return this.contents
    });
    C.Def(function mkdir(name) {
      if(name in this.contents) { return this.contents[name] }
      else {
        var dir=new Dir(name,{});
        this.contents[name]=dir;
        dir.parent=this;
        return dir;
      }
    });
    C.Def(function rename(name) {
      this.parent.contents[name]=this;
      delete this.parent.contents[this.name];
      this.name=name;
    });
    C.Def(function remove() {
      delete this.parent.contents[this.name]
    });
    //C.Def(function load() {

    //})
    C.Def(function lookup(loc) {

    });
  });
});
