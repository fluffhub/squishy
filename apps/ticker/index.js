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

            this.def=new svg.PathDefinition("M0,0 ");
            this.add(this.path);
            this.path.define(this.def);
            this.st=performance.now();
            this.lt=this.st;
            this.lp=0;
          });
          C.Def(function resetSize() {
            this.NSattrs({viewBox:"0 "+this.min+" "+this.maxtime+" "+(this.max-this.min),preserveAspectRatio:"none"});

          });
          C.Def(function addPoint(value) {

            var tn = performance.now();
            var dt=tn-this.st;
            this.maxtime=dt*this.timescale;
            if(this.def.points.length>100) {
              this.def.points.splice(1,1);
              this.def.commands.splice(1,1);
              this.st=tn;
            }
            this.def.addPoint("L",[[this.maxtime,value]]);
            if(this.max==null||value>this.max) {
              this.max=value;
              //       this.resetSize();
            }
            if(this.min==null||value<this.min) {
              this.min=value;
              //   this.resetSize();
            }

            this.resetSize();


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
            this.oldValue=new basic.Span("");
            this.Value.add(this.oldValue);
            this.Chart=new MiniChart(this.width,this.height);
            this.Info=new basic.Div("info");
            this.Info.add(this.Symbol);
            this.Info.add(this.Value);
            this.add(this.Info);
            this.add(this.Chart);
            this.cursor=0;
            this.value=0;
            this.max=.0001;
            this.min=-.0001;
            socket.subscribe(function onupdate(v) {
              if(v.id===symbol) {
                ticker.Value.addClass("updated");
                var cls="new";
                if(v.value>ticker.value) cls="new up";
                else cls="new down";
                var newValue=ticker.oldValue;
                ticker.value=v.value;
                newValue.setClass(cls);
                newValue.content(v.value);
                //var newValue=new basic.Span(v.value, cls);
                //if(ticker.Value.oldValue) ticker.Value.oldValue.remove();
                //delete ticker.Value.oldValue;
                //ticker.Value.add(newValue);
                //ticker.Value.oldValue=newValue;
                if(v.value>ticker.max) ticker.max=v.value;
                if(v.value<ticker.min) ticker.min=v.value;
                ticker.Chart.addPoint(v.value)
                setTimeout(function() {
                  newValue.removeClass("new");
                  newValue.removeClass("up");
                  newValue.removeClass("down");
                  ticker.Value.removeClass("updated");
                }, 0);

              }
            });
          });

          var TickerMaker=M.Class(function C() {
            C.Super(windowing.AppContainer);
            C.Init(function() {
              windowing.AppContainer.call(this,"tickermaker");
              this.titlebar.content("tickers");
              var tm=this;
              this.tickers=[];
              this.tickersocket=new fake.Remote();
              this.entry=new form.TextInput();
              this.submit=new interactive.MomentaryButton("+","addticker",function() {
                tm.addTicker(tm.entry.value());
              });
              this.form=new basic.Div("tickerentry");
              this.form.add(new basic.Span("Add ticker: "));
              this.form.add(this.entry);
              this.form.add(this.submit);
              this.tickerlist=new basic.Div("tickerlist");
              this.contents.add(this.form);
              this.contents.add(this.tickerlist);
            });
            C.Def(function addTicker(symbol) {
              this.tickersocket.send("start "+symbol);
              var t=new Ticker(symbol,this.tickersocket);
              this.tickers.push(t);
              this.tickerlist.addBefore(t);
            });
          });

          M.Def(function open() {
            return new TickerMaker();
          });

        });
      });
    });
  document.styleSheets[0].addRule(
    ".button.addticker.enabled", ""+
    "width: 1em;"+
    "height: 1.3em;"+
    "line-height: 1.3em;"+
    "display: inline-block;"+
    "text-align: center;"
  )
  document.styleSheets[0].addRule(".ticker",
                                  "padding:0.1em 0.5em;");
  document.styleSheets[0].addRule(".ticker svg",
                                  "stroke-width:5px;stroke:orange;height:2.5em;width:100px;");
  document.styleSheets[0].addRule(".tickerentry",
                                  "padding:0.5em;");
  document.styleSheets[0].addRule(".ticker .sym",
                                  "line-height:1.25em;font-family:monospace;font-size:1.25em;");
  document.styleSheets[0].addRule(".ticker .sym",
                                  "line-height:1.25em;font-family:monospace;");
  document.styleSheets[0].addRule(".vals span.new",
                                  "transition:unset;");
  document.styleSheets[0].addRule(".ticker .info",
                                  "display:inline-block;");
  document.styleSheets[0].addRule(".vals",
                                  "position:relative;overflow:hidden;font-family:monospace;width:4em;height:1.25em;font-size:1em;");
  document.styleSheets[0].addRule(".vals span",
                                  "transform:translateZ(0);transition:top 0.2s linear, color 1s linear 0.5s;top:0;color:black;position:absolute;");
  document.styleSheets[0].addRule(".vals span.down",
                                  "top:-1.25em;color:red;");
  document.styleSheets[0].addRule(".vals span.up",
                                  "top:1.25em;color:green;");
});
