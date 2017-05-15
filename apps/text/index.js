Module(function M() {
  M.Import(
    "spoon","basic","system",
    //  context actions
    //  list view
    //  tile view
    //  editor
    //  viewer
    function (spoon,basic,system) {
      M.Def(function match(name, file) {
        if (file instanceof system.File || typeof file=="string" ) {
          return true;

        }

      });
      M.Class(function C() {
        C.Super(basic.Div)
        C.Init(function TextEditor(loc) {
          basic.Div.call(this);
          this.addClass("TextEditor");

        });
      });
      M.Class(function C() {
        C.Super(spoon.Tile);
        C.Init(function Tile() {

        });
      });

      M.Class(function C() {
        C.Init(function ListItem() {

        });
      });

      M.Class(function C() {
        C.Init(function Icon() {

        });
      });
      M.Class(function C() {
        C.Init(function Editor() {

        });
      });

      M.Class(function C() {
        C.Init(function Viewer() {

        });
      });



    });
});
