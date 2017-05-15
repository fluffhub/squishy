Module(function M() {
  M.Import("fluffy/JSeditor","spoon",

    //  context actions
    //  list view
    //  tile view
    //  editor
    //  viewer

    function (JSe,spoon) {
       console.debug({"js editor loaded":JSe} );
      M.Def(function match(file,name) {
        if(typeof name=="string" && name.slice(-3)==".js") {
          return true;
        }

      });

      M.Class(function C() {
        C.Init(function Tile() {
          C.Super(spoon.Tile)
        });
      });

      M.Class(function C() {
        C.Init(function ListItem() {

        })
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
