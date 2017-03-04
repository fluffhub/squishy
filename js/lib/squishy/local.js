Module(function M() {
  M.Import("squishy/localstorage",function(local) {
    var Local=local.LocalDB(function L() {
      L.Name("Local");
      L.Model(function Mdl() {
        Mdl.Init(function Dir(val) {
        });
        Mdl.Template({
          loc:"/",
          contents:{},
        });
      });
    });
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
      C.Def(function list(success) {
        success.call(this)
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
});
