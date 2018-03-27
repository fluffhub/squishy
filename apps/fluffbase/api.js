Module(function M() {
  M.Import("squishy/cookies","squishy/request",function(DOM,request) {

    var url="https://fluffbase.com/fluffbase.cgi";

    M.Class(function C() {
      C.Def("session_token",null);
      C.Def("request",null);
      C.Def("state",null);

      C.Def(function onupdate(data) {});
      C.Def(function onlogin(data) {});
      C.Def(function onregister(data) {});
      C.Def(function addEventListener(name) {

      });
      C.Init(function FluffbaseApi() {
        this.request=new request.Request("URI","JSON");



      });

      C.Def(function update() {
        this.request.Get(url,{},function(data) {
          this.state=data;
          console.debug(data);
          this.onupdate(data);
        });
      });

      C.Def(function authenticate(form) {



      });

      C.Def(function register(form) {

      });
    });
  });
});
