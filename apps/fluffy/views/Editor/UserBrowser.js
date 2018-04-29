Module(function M() {
M.Import('squishy/basic', 'squishy/tables', 'squishy/template', 
         'Editor/Models', 'Editor/Library', 'Editor/DiagramBlock',
         function(basic, tables, BT,
                   Models,Lib,DB) {
  var TableRow=tables.TableRow;
  var Table=tables.Table;
  var Pane=basic.Pane;
  var FakeLink=basic.FakeLink;
  var Span=basic.Span;
  var LibraryItem=Lib.LibraryItem;


  var ProgramRow=M.Class(function C() {
    C.Super(TableRow);
    C.Init(function ProgramRow(p) {
      TableRow.call(this,20);
      var n,status=null;
      n=p.name
      if(n=='') n='<i>Unnamed</i>';
      status=p.status;
      this.link=new FakeLink('#/edit/program/'+p.id,n);
      this.link.program=p;

      this.addCell(this.link);
      this.addCell(new Span('-'),20);
    });
  });
  var DeviceRow=M.Class(function C() {
    C.Super(TableRow);
    C.Init(function DeviceRow(p) {
      TableRow.call(this,20);
      var n=p.useragent;
      this.link=new FakeLink("#/device/"+p.id,"Local Storage");
      this.link.device=p.id;
      this.useragent=n;
      this.addCell(this.link);
    });
  });

  M.Class(function C() {
    C.Super(Pane);
    C.Init(function UserBrowser(editorwindow) {
      Pane.call(this,'User','User');
      this.window=editorwindow;
      this.Devices=new Table('file-browser');
      this.Programs=new Table('file-browser');
      this.contents.add(this.Devices);
      this.Devices.add(new DeviceRow({id:0,useragent:navigator.userAgent}));
      this.contents.add(this.Programs);
      this.update();
    });

    C.Mixin({
      update:function() {
        this.Programs.clear();
        var UB=this;
        Models.Local.Program.all(function(p) {
          var PR=new ProgramRow(p);


          PR.link.click=function() {
            UB.window.open(p);
          };
          var BTs=BT.getTemplates(p);
          if(BTs.length&&BTs.length>0) {
            var B;
            if(BTs.repr)
              B=BTs.repr();
            else
              B=new DB.SVGBlock(p);
              //B.location=target;
              var BC=new LibraryItem(BTs,UB.window);
              //   BC.
              BC.add(B);
              PR.add(BC);
          }
          UB.Programs.add(PR);
        });
      },
      new_program:function() {

      },

    });
  });
});
});
