Module(function M() {
  M.Class(function C() {
    C.Init(function Device(name,root) {
      if(typeof name=="string")
        this.name=name;
      if(root instanceof M.Self.Dir) {
        this.root=root;
      } else {
        this.root=new M.Self.Dir()
      }
    });
    C.Def(function lookup(loc) {

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

  M.Class(function C() {

    C.Init(function DeviceManager() {
      this.devices={};

    });
    C.Def(function init(path,obj) {
      var devices=this.devices;
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
  });
  M.Class(function C() {
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
    C.Def(function list() {
      return this.contents
    });
    C.Def(function mkdir(name) {
      if(name in this.contents) { return this.contents[name] }
      else {
        var dir=new M.Self.Dir(name,{});
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
