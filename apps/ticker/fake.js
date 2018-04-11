Module(function M() {
  M.Import("squishy/realtime",function(rt) {
    function PseudoRandomSymbol(n,a) {
      var P=Math.PI;
      var r=Math.round(128+255*Math.sin((n*P/7)+(2*P/3))/2);
      var g=Math.round(128+255*Math.sin((n*P/7)+(4*P/3))/2);
      var b=Math.round(128+255*Math.sin((n*P/7)+(2*P))/2);
      if(a!==undefined) { a = Math.round(a*100)/100 }
      else a=1;
      return "rgba("+r+","+g+","+b+","+a+")";
    }
    var RandomSymbol=M.Def(function RandomSymbol() {
      var max=456976;
      var id="";
      var n=10000;
      for (var i=0;i<3;i++) {
        var chars=Math.round(Math.random()*max/n)*n;
        id+=String.fromCharCode(97 + chars%26);
        chars=chars/26;
      }
    });
    var FakeSocket=M.Class(function C() {
      C.Init(function FakeSocket() {
        this.past_ids=[];
        this.past_values=[];

        this.max_speed=100;
        this.max_initial_value=1000;
      });
      C.Def(function send(value) {
        var keys=value.split(" ");
        if(keys[0]=="start") {
          this.active=true;
          this.start_messaging(keys[1],-50,50,1);
        }
      });
      C.Def(function start_messaging(id, min, max, freq) {

        var mintime=(1.0/freq)*1000;
        var maxtime=50;

        var lt=performance.now();
        var pn = this.past_ids.indexOf(id);
        var msger=this;
        if(pn==-1) {
          this.past_ids.push(id);
          this.past_values.push([Math.round(Math.random()*this.max_initial_value)]);
          pn=0;

          var speed, sign, tpv, value, nt;
          function go() {

            speed=Math.round(Math.random()*max);
            sign=Math.round(Math.random()*10000)>4999?-1:1;
            tpv=msger.past_values[pn];
            value=tpv[tpv.length-1]+speed*sign;
            if (tpv.length > 1000)
              tpv.shift();
            tpv.push(value);

            nt=lt+(mintime);//*1000;

            while(lt<nt) {
              lt=performance.now();
            }
            msger.onmessage({id,value});
            if(msger.active) setTimeout(go,0);
          }
          setTimeout(go,0);
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
        rt.Remote.call(this);
        var remote=this;
        this.socket=new FakeSocket();
        this.socket.onmessage=function(e) {
          remote.onmessage(e);
        }
        this.ready=true;
      });
    });
  });
});
