Module(function M() {
  var uri=M.Def(function uri(loc) {
    var a;
    if(loc instanceof Element) a=loc;
    else {
      a=document.createElement("a");
      a.href=loc;
    }
    if(a.hasOwnProperty("path") ) { return a } else {
    Object.defineProperty(a,"path",{get:a.__lookupGetter__("pathname"),configurable:true})
    Object.defineProperty(a,"pathname",{get:function(){ return this.path+this.hash },configurable:true})
    return a;
    }
  });
  var FileSystemException=M.Def(function FileSystemException(path) {
    //console.debug({FileSystemExcepti on:path })
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
        live.DeviceManager.init(url.path,device);
      });

      // if(typeof name=="string")
      //   this.name=name;
      // if(root instanceof M.Self.Dir) {
      //   this.root=root;
      // } else {
      // }

    });
    C.Def(function retrieve(a, result) {
      var device=this;
      var cursor=this.root;
      var path;
      if(a instanceof Element) {
       path=a.pathname;
      } else if (typeof a=="string") {
       path=a;
      }
      var dirs=path.split("/[/#]{1}/");
      //console.debug({retrieving:path,obj:phantom})
      for(var i=0;i<dirs.length;i++) {
        var dn=dirs[i];
        if(dn in cursor.contents) {
          cursor=cursor.contents[dn];
        } else {
          throw new FileSystemException(path);
        }
      }
      if (cursor instanceof Array) cursor=cursor[0];

      result(cursor);
    });
    C.Def(function init(path,obj) {
      var device=this;

      Import("squishy/system",function(system) {
        path=path=system.uri(path);
        var fileloc=path.href;
        var fileroot=system.uri("/").href;
        var uri=fileloc.slice(fileroot.length);
        var dirs=uri.split('/');


        var cursor=device.root;
        for(var i=0;i<dirs.length-1;i++) {
          var dn=dirs[i];
          if(dn in cursor.contents) {
            cursor=cursor.contents[dn];
          } else {
            cursor=cursor.mkdir(dn,obj);
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
  function DeviceManagerException(message) {console.debug("Device Manager Exception: "+message)}
  M.Class(function C() {

    C.Init(function DeviceManager() {
      this.devices={};

    });
    C.Def(function retrieve(path, result) {
      var all={}
      var a;
      if(path instanceof Element){
         a=path;
                                }
      else if (typeof path=="string") {
       a=uri(path);
      }
      var device=a.hostname;
      var pathname=a.path.split("/").slice(1);
      if(pathname[pathname.length-1]=="") pathname=pathname.slice(0,-1);
      pathname=pathname.join("/");


      var names=Object.keys(this.devices[device]);

      var fs=this;
      var name=pathname.split("/")[0]
      // names.forEach(function(name) {
      //console.debug({pathname:pathname });
      var i=Object.keys(this.devices[device]).length;

      Object.keys(this.devices[device]).forEach(function(id) {
        i--;
        try {
          fs.devices[device][id].retrieve(a,function(value) {
            all[id]=value;
            if(i==0) result(all);
          });
        } catch(e) {
          console.debug({error:e})
          all[id]=null;
          if(i==0) result(all);
        }
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
        result(this);
      }
      return this
    });
    C.Def(function mkdir(name,obj) {

      if(name in this.contents) { return this.contents[name] }
      else {
        var dir=new Dir(name,{});
        if(obj !==undefined) dir.obj=obj;
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
