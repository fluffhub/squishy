Module(function M() {
  M.Import("squishy/realtime",function(rt) {

    var FakeSocket=M.Class(function C() {
      C.Init(function FakeSocket() {
        this.past_ids=[];
        this.past_values=[];
        this.max_speed=100;
        this.max_initial_value=1000;
      });
      C.Def(function send(value) {
        if(value=="start") {
          this.active=true;
          this.start_messaging();
        }
      });
      C.Def(function start_messaging() {
        var max=456976;
        var n=1000;
        var lt=performance.now();
        while(this.active) {
          var id="";
          var value;
          for (var i=0;i<3;i++) {
            var chars=Math.round(Math.random()*max/n)*n;
            id+=String.fromCharCode(97 + chars%26);
            chars=chars/26;
          }
          var pn = this.past_ids.indexOf(id);
          if(pn>-1) {
            var speed=Math.round(Math.random()*this.max_speed);
            var sign=Math.round(Math.random()*10000)>5000?-1:1;
            var tpv=this.past_values[pn];

            value=tpv[tpv.length-1]+speed*sign;
            tpv.push(value);
            if (tpv.length > 10000) tpv.shift()

          } else {
            this.past_ids.push(id);
            value=Math.round(Math.random()*this.max_initial_value);
            this.past_values.push([value]);
            pn=0;
          }

          this.onmessage(JSON.stringify({id:id, value:value}));

        }
      });
      C.Def(function stop_messaging() {
        this.active=false;
      });
      C.Def(function onmessage() {

      });

    });
    M.Class(function C() {
      C.Super(rt.Remote);
      C.Init(function Remote() {
        rt.Remote.call(this)
        this.socket=new FakeSocket();
      });
    });
  });
});
