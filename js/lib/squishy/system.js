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
  C.Init(function Dir(name,contents) {
    if(typeof name=="string") {
      this.name=name
    }
    if(contents!==undefined) {
      this.contents=contents
    }
    this.parent=null;
  });
  C.Def(function list() {
    return this.contents
  });
  C.Def(function mkdir(name) {
    if(name in this.contents) {}
    else {
      var dir=new M.Self.Dir(name,{});
      this.contents[name]=dir;
      dir.parent=this;

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
