
Module(function M() {

  var Remote=M.Class(function C() {
    C.Def("url","");
    C.Def("socket",null);

    C.Init(function Remote(url) {
      this.url=url;
      if(url)
        this.socket=new WebSocket(url);
      else
        this.socket=new FakeSocket();
      this.queue=[]
      this.subscriptions=[];
      this.ready=false;

    });
    C.Def(function send(value) {
      var remote=this;
      if(this.ready) {
        this.socket.send(value);
      } else {
        this.queue.push(value);
        this.socket.onopen=function onopen(e) {
          this.queue.forEach(function(value2) {
            remote.socket.send(value2);
          });
          this.ready=true;
        }
        this.socket.onmessage=function onmessage(e) {
          this.subscriptions.forEach(function(sub) {
            sub(e);
          });
        }
      }

    });
    C.Def(function subscribe(callback) {
      this.subscriptions.push(callback);
    });
  });
});