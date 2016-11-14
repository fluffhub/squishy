Module(function M() {
  M.Import("squishy/localmodel",function(local) {

    M.Class(function C() {
      C.Init(function Device(name,root) {

        if(typeof name=="string")
          this.name=name;
        if(root instanceof Dir) {
          this.root=root;
        } else {
          this.root=new Dir()
        }
      });
      C.Def(function lookup(loc) {

      });
      C.Def("exec",null)
    });
    C.Init(function File(name,value) {
      this.name=null
      this.value=null
      if(typeof name=="string") {
        this.name=name
      }
      if(value!==undefined) {
        this.value=value;
      }


    });
    C.Def(function read() {
      return this.value
    });
    C.Def(function write(value) {
      if(value!==undefined)
        this.value=value;
    });
    C.Def(function rename(name) {
      if(typeof name=="string") {
        this.name=name
      }
    });

  });
  M.Class(function C() {
    C.Init(function Dir(name,contents) {
      if(typeof name=="string") {
        this.name=name
      }
      if(contents!==undefined) {
        this.contents=contents
      }
    });
    C.Def(function list() {
      return this.contents
    });
    C.Def(function mkdir() {

    });
    C.Def(function rename() {

    });
    C.Def(function remove() {

    });
    //C.Def(function load() {

    //})
    C.Def(function lookup(loc) {

    });
  });
});
