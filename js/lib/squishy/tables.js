Module(function M() {
M.Import('squishy/DOM',function(DOM) {
  var LayoutItem=DOM.LayoutItem;
  var TableRow=M.Class(function C() {
    C.Super(LayoutItem);
    C.Init(function TableRow(height) {
      LayoutItem.call(this,'tr');
      this.cells=[];

    });

    C.Def(function addCell(content,width) {
      var cell=new LayoutItem('td',null,null,{valign:'middle'});
      cell.content=content;
      cell.add(content);
      this.add(cell);
      this.cells[this.cells.length]=cell;
    });
  });
  M.Class(function C() {
    C.Super(LayoutItem);
    C.Init(function Table(name) {
      LayoutItem.call(this,'table',name,null,{cellpadding:0,cellspacing:0,border:0});
      this.rows=[];
      this.cols=[];
    });

    C.Def(function addRow(row,cls,height,pos) {
      var R=new TableRow(height);
      if (row)  R=row;

      if(pos==0) {
        this.addBefore(R);
        this.rows.unshift(R);
      }
      else {
        this.add(R);
        this.rows.push(R);
        pos=this.rows.length-1;
      }
//      if(this.rows.length%2==0)
//        row.addClass('even');
      return pos;
    });
    C.Def(function addCell(content, width,rownumber,before) {
      if(rownumber) {}
      else	{rownumber=this.rows.length;}
      this.rows[rownumber].addCell(content,width);
    });
  });



});
});

