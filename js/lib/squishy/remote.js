Module(function M() {
  Import("squishy/system",function(system) {
    M.Class(function C() {
      C.Super(system.Device);
      C.Init(function Device(path,name) {
        system.Device.call(this,path,name);
        this.root=new system.Dir("/",{});

      });

    });
    M.Class(function C() {
      C.Init(function File(loc) {


      });
    });
  });
});
