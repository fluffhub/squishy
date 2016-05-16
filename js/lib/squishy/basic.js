
Module(function M() {
/*

Module basic contains several of the basic HTML tags.  div, span, img  As well as some static UI components like pane.
it does NOT use complex event handling, only basic single event callbacks.

*/

M.Import('squishy/DOM', function (DOM) {
    var LayoutItem=DOM.LayoutItem;
		M.Class(function C() {
      C.Super(LayoutItem);
			C.Init(function Span(content,cls,id) {
				LayoutItem.call(this,'span',cls,id);
				this.content(content);
			});

		});
		M.Class(function C() {
      C.Super(LayoutItem);
			C.Init(function Bold(value,cls) {
				LayoutItem.call(this,'b',cls,null);
				this.content(value);
			});

		})
		M.Class(function C() {
      C.Super(LayoutItem);
			C.Init(function Div(cls, id, target) {
				LayoutItem.call(this,'div',cls,null);
			});

    });
		var Link=M.Class(function C() {
			C.Super(LayoutItem);
			C.Init(function Link() {
        with(Link.kwargs({url:"",content:null,id:null,cls:null}) ) {
          var content=content || url;
          if(content=='') content='&nbsp;';

          LayoutItem.call(this,'a',id,cls,{href:url});
          this.url=url;
          this.content(content);
        }
			});
		});
  M.Class(function C() {

    C.Super(DOM.Tag);
    C.Init(function Anchor(name) {
     DOM.Tag.call(this,"a");
      this.attrs({name:name});

    });
  });

		M.Class(function C() {
			C.Super(Link);
			C.Init(function FakeLink(url,content,callback) {
				Link.call(this,url,content);
				var that=this;
        if(callback) this.click=callback;
        else this.click=function() {};
				this.element.onclick=function(e) {
						e.preventDefault();
						window.history.pushState({},"", that.element.href);
						that.click(e);
				};
			})
		});
		M.Class(function C() {
      C.Super(LayoutItem);
			C.Init(function Pane(name,title,cls) {
        var cls=cls || "";
				LayoutItem.call(this,'div','pane '+cls,name);
				this.title=new LayoutItem('div','title-bar');
				this.title.content(title);
				this.add(this.title);
				this.contents=new LayoutItem('div','content');
				this.add(this.contents);
			});

			C.Def(function content(value) {
				this.contents.content(value);
			});
			C.Def(function resize() {
			  var h = this.element.offsetHeight;
			  var t = this.title.element.offsetHeight;
			});
		});
		M.Class(function C() {
		C.Super(LayoutItem);
		C.Init(function Img(src,cls,name,callback) {
			LayoutItem.call(this,'img',cls,name,{'src':src});
			var callback = callback || function() {};
			var that=this;
			Object.defineProperty(this,'src',{
				set:function(value) { this.element.src=value; },
				get:function() { return this.element.src; }
			});
			this.element.onload=function() {
				that.resize();
				callback(arguments);
			};
		});
	});
	});
});
