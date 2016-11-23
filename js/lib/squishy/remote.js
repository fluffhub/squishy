Module(function M() {
  M.Import("squishy/system","squishy/request",function(system,req) {
var Request=req.Request;
    M.Class(function C() {
      C.Init(function Device(name,root) {
        system.Device.call(this,name);
        this.request=new Request("URI","TEXT");
        this.request.request.timeout=60000;
        if(typeof name=="string") {
          this.name=name;
        }
        this.session=session;
        if(struct instanceof system.Dir) {
          this.root=struct;
        }
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
        //  C.Def(function load(path,item) {
        var browser=this;

        browser.absolutefiles[path]=item;
        this.request.Get(item.filename,{},function(raw) {
          browser.windows[path]=new codebrowser.CodeBrowser(raw,browser);
          browser.windows[path].addBefore(new basic.Span(path));
          browser.parent.add(browser.windows[path]);

        });
        // });
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
});
