Module(function M() {
  M.Import(
    "apps/spoon","squishy/realtime","squishy/basic",
    "squishy/svg","squishy/form","spoon/windowing",
    "squishy/interactive",
    function(spoon,rt,basic,
              svg,form,windowing,
              interactive) {
      M.Index("fake");
      Import("ticker/fake",function(fake) {

        var MiniChart=M.Class(function C() {
          C.Super(svg.SVG);
          C.Init(function MiniChart(w, h) {
            svg.SVG.call(this,100,100)

            this.width=w;
            this.height=h;
            this.element.style.width=w+"px";
            this.element.style.height=h+"px";

            this.scalewidth=100;
            this.scaleheight=100;
            this.min=-.000001;
            this.max=.000001;
            this.timescale=0.001;
            this.path=new svg.Path("");
            this.path.element.style.stroke="1px solid black";

            this.def=new svg.PathDefinition("M0,0z");
            this.add(this.Chart.path);
            this.path.define(this.Chart.def);
            this.st=performance.now();
            this.lt=this.st;
            this.lp=0;
          });
          C.Def(function resetSize() {
            this.attrs({height:2+this.max-this.min});

          });
          C.Def(function addPoint(value) {

            var tn = performance.now();
            var dt=tn-this.st;

            this.def.addPoint("L",[dt*this.timescale,value]);
            if(this.max==null||value>this.max) {
              this.max=value;
              this.resetSize();
            }
            if(this.min==null||value<this.min) {
              this.min=value;
              this.resetSize();
            }

            this.lt=tn;
            this.path.define(this.def);
          });
        });
        var Ticker=M.Class(function C() {
          C.Super(basic.Div);
          C.Init(function Ticker(symbol, socket) {
            basic.Div.call(this,"ticker");
            var ticker=this;
            this.id=symbol;

            this.Symbol=new basic.Span(symbol, "sym");
            this.Value=new basic.Div("vals");
            this.Chart=new MiniChart(this.width,this.height);
            this.add(this.Symbol);
            this.add(this.Value);
            this.add(this.Chart);
            this.cursor=0;
            this.value=0;
            this.max=10;
            this.min=-10;
            socket.subscribe(function onupdate(v) {
              if(v.id===symbol) {
                ticker.Value.addClass("updated");
                var cls="new";
                if(v.value>ticker.value) cls="new up";
                else cls="new down";
                var newValue=new basic.Span(v.value, cls);
                if(ticker.Value.oldValue) ticker.Value.oldValue.remove();
                this.Value.add(newValue);
                newValue.removeClass("new");
                newValue.removeClass("up");
                newValue.removeClass("down");
                ticker.Value.removeClass("updated");
                ticker.Value.oldValue=newValue;
                if(v.value>ticker.max) ticker.max=v.value;
                if(v.value<ticker.min) ticker.min=v.value;
                ticker.Chart.addPoint(v.value)
              }
            });
          });

          var TickerMaker=M.Class(function C() {
            C.Super(windowing.AppContainer);
            C.Init(function() {
              windowing.AppContainer.call(this,"tickermaker");
              var tm=this;
              this.tickers=[];
              this.tickersocket=new fake.Remote();
              this.entry=new form.TextInput();
              this.submit=new interactive.MomentaryButton("y",function() {
                tm.addTicker(tm.entry.value());
              });
              this.form=new basic.Div("tickerentry");
              this.form.add(this.entry);
              this.form.add(this.submit);
              this.add(this.form);

            });
            C.Def(function addTicker(symbol) {
              this.tickersocket.send("start "+symbol);
              var t=new Ticker(symbol,this.tickersocket);
              this.tickers.push(t);
              this.addBefore(t);
            });
          });

          M.Def(function open() {
            return new TickerMaker();
          });

        });
      });
    });
});
