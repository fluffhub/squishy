Module(function M() {
  Import("squishy/system",function(system) {
    M.Class(function C() {
      C.Super(system.Device);
      C.Init(function Device(path,name) {
        system.Device.call(this,path,name);
        this.root=new system.Dir("/",{});

      });
      C.Def(function retrieve(path,result) {
        system.Device.retrieve.call(this,path,function(obj) {
          if (obj.obj instanceof Module) {
            result(obj.obj);
          }
           else result(obj);
        });
      });
    });
    M.Class(function C() {
      C.Init(function File(loc) {


      });
    });

  });
});
