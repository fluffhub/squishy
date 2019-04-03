Module(function M() {
  M.Import(
    "squishy/basic",
    "squishy/interactive",
    "squishy/transform",
    "spoon/conf",
    "squishy/events",
    "spoon",
    "spoon/alignment",
    "squishy/styles",
    function(basic,interactive,transform,conf,events,spoon, alignment, styles) {
      
      var cardinal_directions = ["e","s","w","n"];
      var pos = ["top","right","bottom","left"];
      var dim = ["height","width"]
      var dirs = ["n","e","s","w","nw","ne","se","sw"]
      var configs=[
        [[0], [0]], //n
        [[1], [1]], //e
        [[2], [0]], //s
        [[3], [1]], //w
        [[0,2],[0,1]],
        [[0,1],[0,1]],
        [[1,2],[0,1]],
        [[2,3],[0,1]]
      ];
      M.Style(function S() {
        var Gradient=styles.Gradient;
        var Color=styles.Color;
        var S=this;
        var theme = S.Theme({
          corner_handle_size__px:30,
          side_handle_size__px:10,
          handle_offset__px:5,
          frame_bg_color__color:[0.5,0.5,0.5,0.5],
          frame_fg_color__color:[0.8,0.8,0.8,0.5],
          bar_height__px:25,
          bar_font_size__px:12.5,
          in_common__color:[0.1,0.1,0.1,0.5],
          available__color:[0.5,0.75,1.0,0.7]
        });
        S.Init(function() {
          for (var i=0;i<dirs.length;i++) {
            var config = configs[i];
            var dir=dirs[i];
            var size = theme.side_handle_size;
            var c0=config[0];
            var c1=config[1];
            var style={};
            
            if(c0.length==2) size=theme.corner_handle_size;
            else style[dim[1-c1]] = "100%"          
            for(var x=0;x<c0.length;x++) {
              style[pos[c0[x]]]="-"+theme.handle_offset;
            }
            for(var y=0;y<c1.length;y++) {
              style[dim[c1[y]]]=size;
            }
            S.addStyle(".ui-resizable-"+dir, style)
          }
          S.addStyle(".ui-resizable-e, .ui-resizable-w", {
            top__px:0
          });
          S.addStyle(".ui-resizable-n, .ui-resizable-s", {
            left__px:0
          });
          S.addStyle(".align_button", { position:"absolute",
            margin:"auto",//border_style:"dashed",border_color:"blue",
            box_sizing:"border-box",width:"auto",height:"auto",
            opacity:0.0, box_shadow:"0 0 20px 0 "+Color([1,0.5]),
            transition:"opacity 0.1s ease-out, box-shadow 0.2s ease-out 0.1s",
            pointer_events:"none",
          });
          S.addStyle(".align_button.visible", {
            opacity:1.0,pointer_events:"all",box_shadow:"0 0 5px 0 "+Color([1,0.5])
          });
          S.addStyle(".horizontal.align_button.available", { 
            background: Gradient("to bottom", Color([0,0]), "0%",theme.available__color, "50%",Color([0,0]), "100%"),
          });
          S.addStyle(".vertical.align_button.available", {
            background: Gradient("to right", Color([0,0]), "0%",theme.available__color, "50%",Color([0,0]), "100%"),
          });
          S.addStyle(".horizontal.align_button.in_common", {
            background: Gradient("to right", Color([0,0]), "0%",theme.in_common__color, "50%",Color([0,0]), "100%"),
          });
          S.addStyle(".vertical.align_button.in_common", {
            background: Gradient("to bottom", Color([0,0]), "0%",theme.in_common__color, "50%",Color([0,0]), "100%"),
          });

          S.addStyle(".align_button_e", { });
          S.addStyle(".align_button_n", { });
          S.addStyle(".align_button_s", { });
          S.addStyle(".align_button_w", { });

          S.Prefix(".acw", function() {
            S.addStyle("", { position: "absolute", display: "inline-block", background_color__color: [239, 239, 239],
             transition: "opacity 0.2s ease-out, box-shadow 0.1s ease-out",border_radius:"1px", opacity: 0, "z-index":0 
            });
            S.addStyle(".visible", {  opacity: 1, z_index: 1000,
              box_shadow:"0px 0px 3px 0px "+Color([0,0.7]) 
            });
            S.addStyle(".active", {  transition:"opacity 0.1s, box-shadow 0.2s ease-in", 
            box_shadow:"1px 1px 6px 1px "+Color([0,0.5]) ,z_index:1000000
          });
            S.addStyle(" .acc", { overflow:"hidden",left: 0, right: 0, 
            top:theme.bar_height__px, bottom: 0, position: "absolute"        
          });
            S.addStyle(" .acb", { font_size:theme.font_size__px, 
              height:theme.bar_height__px,line_height:theme.bar_height__px,
              text_indent__px:theme.bar_height/2, 
            });
          });
        });
      });

      var AppConfig=M.Class(function C() {
        C.Super(interactive.MomentaryButton);
        C.Init(function AppConfig() {
          var config=this;
          this.hidden=true;
          interactive.MomentaryButton.call(this,"o", function() {
            config.hidden=!config.hidden; 
          });
        });
      });
      
      var AppContainer=M.Class(function C() {
        C.Super(transform.HTMLPositionBox);
        C.Mixin(transform.Resizable);
        C.Mixin(transform.Draggable);
        C.Mixin(events.HasEvents);
        C.Init(function AppContainer() {
          transform.HTMLPositionBox.call(this);
          this.addClass("acw");

          //titlebar
          this.titlebar=new basic.Div("acb")
          this.add(this.titlebar);
          this.titlebar.Mixin(events.hasEvents);
          this.position={x:0,y:0};
          this.size={width:400,height:300};
          
          //content
          this.contents=new basic.Div("acc");
          this.add(this.contents);
          var acw=this;
          this.titlebar.addEvent("context","contextmenu",function() {
            
          });
          this.titlebar.enableEvents("context");
          this.drawTransform();
          //window controls

          //draggable
          var acw=this;
          var wm=acw.parent;
          
          this.enabledrag(function ondrag(i,v) {
            acw.drawTransform();
            for(var i=0;i<cardinal_directions.length;i++){ 
              var dir=cardinal_directions[i];
              var handle = acw.handles[cardinal_directions[i]];
              if("ew".indexOf(dir)>-1) {
                handle.delta.x=acw.delta.x;
              } else {
                handle.delta.y=acw.delta.y;
              }
              acw.parent.am.realign(handle);
            }
          },this.titlebar.element);

          this.enableresize("n,e,s,w,nw,ne,se,sw",function onresize(handle) {
            if(this.parent.am) {
              this.parent.am.realign(handle);
            }
          });

          this.onresizestart=function onresizestart(handle) {
            if("enws".indexOf(handle.dir)>-1) {
              this.parent.am.show_alignment_groups(handle)
            }
          };

          this.onresizestop=function onresizestop(handle, e) {
            this.parent.am.hide_edges();
          };
        });
      });
    });
});
