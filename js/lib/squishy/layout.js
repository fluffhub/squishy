Module(function M() {
  /*
M.Import('squishy/basic',function (basic) {
M.Import('squishy/DOM',function (DOM) {
M.Import('squishy/styles',function (style) {
*/
  M.Import('squishy/basic squishy/DOM squishy/styles',
           function(basic,DOM,style) {
M.Class(function C() {
  C.Super(DOM.LayoutItem);
  C.Init(function GridLayout(target) {
    this.element=target;

    this.dims={rows:{},cols:{}};

    this.addClass('GridLayout');
  });
  C.Mixin({
    rows:[],
    cols:[],
    items:[],
    stretch:function(dim) {
      var st='',st2='';
      var br=[]
      var trh=0;

      if(dim=='rows') { st='offsetHeight'; st2='height';}
      if(dim=='cols') { st='offsetWidth'; st2='width'; }
      var th=this.element[st];
      for (var rn in this[dim]) {
        var row=this[dim][rn];
        var rh=null;
        if(this.dims[dim][rn]) {
          rh=this.dims[dim][rn];
          trh+=rh;
        }
        else {
          br[br.length]=row;
        }
        for(var i in row) {
          var item=row[i];
          if(rh) {
            var css={};
            css[st2]=rh+'px';
            style.Style(item, css);

          }
        }
      }
      if(br.length>0) {
        var eh=(th-trh)/br.length;
        for (rn in br) {
          row=br[rn];
          for (var i in row) {
            var item=row[i];
            var css={};
            css[st2]=eh+'px';
            style.Style(item,css);
          }
        }
      }
    },
    space:function(dim) {
      var st,st2=''
      if(dim=='rows') {
        st='top';
        st2='height';
      }
      if(dim=='cols') {
        st='left';
        st2='width';
      }
      var trh=0;
      for (var rn in this[dim]) {
        var row=this[dim][rn];
        var css={}
        css[st]=trh+'px';

        for (i in row) {
          style.Style(row[i],css);
        }
        trh+=row[0][st2]();
      }

    },
    resize:function() {
      this.stretch('rows');
      this.stretch('cols');
      this.space('rows');
      this.space('cols');
      for(var i in this.items) {
        try {
          this.items[i].resize();
        }
        catch(e) {

        }
      }
    },
    addItems:function(items,dim,dir) {
      var rn=this[dir].length;
      for (var i in items) {
        var item=items[i];
        if(item in this.items) {
          this.items[this.items.length]=item;
        }

      }
      this[dir][rn]=items;
      if(dim)
        this.dims[dir][rn]=dim
    },
    addRow:function(items,dim) {
      this.addItems(items,dim,'rows');
    },
    addCol:function(items,dim) {
      this.addItems(items,dim,'cols');
    },
  });
});
});
});/*
});
});*/
