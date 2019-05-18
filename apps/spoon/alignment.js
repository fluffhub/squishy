Module(function M() {
M.Import("squishy/interactive", "spoon", function(interactive, spoon) {

var AlignmentManager=M.Class(function C() {
    C.Init(function AlignmentManager(main) {
        Object.defineProperty(this, "main",{value:main, configurable:false, writable:false}); 
      this.groups=[];
    });
    C.Def(function group(handle, target) {
      var alignment_groups=this.groups;
      var target_alignment_group=[];
      var group_found = false;
      var source_groups = [];
      var target_groups = [];
      var already_grouped = false;
      var result_group = [];
<<<<<<< HEAD
=======

      var target_offset=target.offset();
      var handle_offset=handle.offset();

>>>>>>> 4fb662ae4e9e1be8c512f3d6abc0596fd275d9f0
      alignment_groups.forEach(function(alignment_group, l) {
      // for(var l=0;l<alignment_groups.length;l++) {
        // var alignment_group = alignment_groups[l];
        var found_source=false;
        var found_target=false;
          
        alignment_group.forEach(function(aligned) {
          // for(var m=0,found_both=false;m<alignment_group.length && !found_both;m++) {
          //var aligned = alignment_group[m];
          if(aligned.__self__ === handle.__self__) found_source=true;
          if(aligned.__self__ === target.__self__) found_target=true;
          if(found_source && found_target) found_both=already_grouped=true;
        });
        
        if(found_source) {
          //the source item is already in this group 
          source_groups.push(l)
        } 
        if(found_target) {
          //the target item is already in this group
          target_groups.push(l)
        } 
<<<<<<< HEAD
        
=======
>>>>>>> 4fb662ae4e9e1be8c512f3d6abc0596fd275d9f0
      });
      if(!already_grouped) {
        if(source_groups.length==0) {
          //the source is not currently in a group 
          if(target_groups.length==0) {
            //neither item is in a group, create a new group with both
<<<<<<< HEAD

            result_group.push(handle);
            result_group.push(target);
          } else {
=======
            result_group.push(handle);
            result_group.push(target);
          } else {
            //The target item is already in a group but not the source.  
>>>>>>> 4fb662ae4e9e1be8c512f3d6abc0596fd275d9f0
            for(var m=0;m<target_groups.length;m++) {
              var n = target_groups[m];
              result_group = result_group.concat(alignment_groups[n]);
              alignment_groups.splice(n);
            }
            result_group.push(handle);
          }
        } else {
          if(target_groups.length==0) {
<<<<<<< HEAD
=======
            //The source item is in a group but not the target
>>>>>>> 4fb662ae4e9e1be8c512f3d6abc0596fd275d9f0
            for(var m=0;m<source_groups.length;m++) {
              var n = source_groups[m]
              result_group = result_group.concat(alignment_groups[n]);
              alignment_groups.splice(n);
            }
            result_group.push(target);
            //the source is currently in a group
            //the target is not currently in a group
          } else {
            //both items are in a group - merge the groups
            for(var m=0;m<source_groups.length;m++) {
              var n=source_groups[m];
              result_group = result_group.concat(alignment_groups[n]);
              alignment_groups.splice(n);
            }
            for(var m=0;m<target_groups.length;m++) {
              var n = target_groups[m]
              result_group = result_group.concat(alignment_groups[n]);
              alignment_groups.splice(n);
            }
          }
        }
<<<<<<< HEAD
      console.debug({adding_result:result_group});
        alignment_groups.push(result_group);
      }
=======
        console.debug({adding_result:result_group});
        alignment_groups.push(result_group);
        
        if("ew".indexOf(target.dir)>-1) {
          target.delta.x=handle_offset.x-target_offset.x;
          target.parent.doResize(handle, true);
        } else {
          target.delta.y=handle_offset.y-target_offset.y;
          target.parent.doResize(handle, true);
        }
      }

>>>>>>> 4fb662ae4e9e1be8c512f3d6abc0596fd275d9f0
    });
    C.Def(function contains(handle) {

    });
    C.Def(function find_in_groups(handle) {
<<<<<<< HEAD
        for(var i=0;i<this.groups.length;i++) {
            var group = this.groups[i];
            for(var j=0;j<group.length;j++) {
                var item = group[j];
                if(item===handle) return i;
            }
        }
=======
      for(var i=0;i<this.groups.length;i++) {
        var group = this.groups[i];
        for(var j=0;j<group.length;j++) {
            var item = group[j];
            if(item===handle) return i;
        }
      }
>>>>>>> 4fb662ae4e9e1be8c512f3d6abc0596fd275d9f0
    });
    C.Def(function show_alignment_groups(handle) {
      var dir=handle.dir;
      var horizontal = (dir=="n" || dir =="s")
      var me=handle.parent;
      var wm=this.main
      var am = this;

      am.currently_dragging = handle;
<<<<<<< HEAD
=======
      var in_group = am.find_in_groups(am.currently_dragging);
>>>>>>> 4fb662ae4e9e1be8c512f3d6abc0596fd275d9f0
      var app_names = Object.keys(wm.tasks);
      var dirs;
      if(horizontal) dirs=["n","s"];
      else dirs=["e","w"];
      app_names.forEach(function (app_name) {
      //for(var i=0;i<app_names.length;i++) {
      //  var app_name =app_names[i];
        
        var tasks=wm.tasks[app_name];
        tasks.forEach(function (task) {
        // for(var j=0;j<tasks.length;j++) {
          // var task = tasks[j];
          if(task.__self__!==me.__self__) { 
             dirs.forEach(function(dir) {
              var this_handle=task.handles[dir];
           
            //for(var k=0;k<handles.length;k++) {
              //var this_handle=handles[k];
              var align_button;
              if(this_handle.align_button) { 
                align_button=this_handle.align_button;
              } else {
                align_button = new Aligner(this_handle, function join(self) {
                  console.debug({self:self, am:am.currently_dragging});
                  am.group(self, am.currently_dragging);
                });

                spoon.main.hud.add(align_button);
              }
<<<<<<< HEAD
              var styler=this_handle.align_button.element.style;
              var offset=this_handle.offset();

              styler.top=offset.y+"px";
              styler.left=offset.x+"px";
              styler.width=this_handle.width()+"px";
              styler.height=this_handle.height()+"px";
=======
              align_button.doResize();
>>>>>>> 4fb662ae4e9e1be8c512f3d6abc0596fd275d9f0

              align_button.enableEvents("join_alignment_group");
              
              align_button.addClass("visible");
              align_button.addClass("available");
<<<<<<< HEAD
              var in_group = am.find_in_groups(am.currently_dragging);
=======

>>>>>>> 4fb662ae4e9e1be8c512f3d6abc0596fd275d9f0
              if(in_group!==undefined) {
              am.groups[in_group].forEach(function(other_handle) {
                other_handle.align_button.removeClass("available");
                other_handle.align_button.addClass("in_common");
              });
            }
            });
          }
        });
      });
    });
    C.Def(function hide_edges() {
      var wm = this.main;
      if(wm.am && wm.am.currently_dragging)
      delete wm.am.currently_dragging
      
      var app_names = Object.keys(wm.tasks);
      var parent=this.parent;
      app_names.forEach(function(app_name) {
        var tasks=wm.tasks[app_name];
        tasks.forEach(function(task) {
          Object.keys(task.handles).forEach(function(handlename) {
            var handle=task.handles[handlename];
            if(handle.align_button) {
              handle.align_button.removeClass("visible");
              handle.align_button.removeClass("available");
              handle.align_button.removeClass("in_common");
              handle.align_button.disableEvents("join_alignment_group");
            }
          });
        });
      });
    });
    C.Def(function realign(handle) { 
      var groups = this.groups;
      if (handle.dir.length==2) {
        // non-cardinal direction - pass delta from this to the other two handles, 
        // and run resize on them
        // the trick to this is that direction names are combinations - 
        // nw can be broken down into n and w which are the corresponding cardinal handles
        var other_handles = handle.dir.split('')
        for(var i=0;i<other_handles.length;i++) {
          var other_dir = other_handles[i];
          var other_handle = handle.parent.handles[other_dir];
          var horizontal = "ns".indexOf(other_dir)>-1;
          if(!horizontal) other_handle.delta.x=handle.delta.x;
          else other_handle.delta.y=handle.delta.y;

          this.realign(other_handle);
        }
      } else {
        for (var i=0;i<groups.length;i++) {
          var alignment_group = groups[i];
          var found=false;
          for (var j=0;j<alignment_group.length&&!found;j++) {
            var comparison = alignment_group[j];
            if(comparison.__self__ === handle.__self__) {
              //this alignment group is going to get moved!
              found=true;
            }
          }
          if(found) {
            var horizontal = "ns".indexOf(handle.dir)>-1;
            for (var j=0;j<alignment_group.length;j++) {
              var target = alignment_group[j];
              if(target.__self__ !== handle.__self__) {
                if(!horizontal) target.delta.x=handle.delta.x;
                else target.delta.y=handle.delta.y;
                target.parent.doResize(target, true);

                if(target.align_button) {
                  var offset = target.align_button.offset();
                  if (!horizontal) {
                    target.align_button.element.style.left=(target.delta.x+offset.x)+"px"
                  } else {
                    target.align_button.element.style.top=(target.delta.y+offset.y)+"px"
                  }
                }
              }
            }
          }
        }
      }
    });
  });
  var Aligner=M.Class(function C() {
    C.Super(interactive.MomentaryButton);
    C.Init(function Aligner(handle, join) {
      var classname=(handle.dir=="n"||handle.dir=="s")?"horizontal":"vertical"
      var aligner=this;
      interactive.MomentaryButton.call(this, " ", classname+" align_button align_button_"+handle.dir,function(e) {
        aligner.trigger("join_alignment_group", e);
      });
      var align_button=this;
      
      align_button.addEvent("join_alignment_group", "mouseup touchend", function(e) { 
        join.call(this, align_button.handle);

        this.disableEvents("join_alignment_group");
      }, align_button, {capture:true});
    
      align_button.removeClass("button");
      this.handle=handle;
      handle.align_button=this;
    });
<<<<<<< HEAD
=======
    C.Def(function doResize() {
      var styler=this.element.style;
      var offset=this.handle.offset();

      styler.top=offset.y+"px";
      styler.left=offset.x+"px";
      styler.width=this.handle.width()+"px";
      styler.height=this.handle.height()+"px";
    })
>>>>>>> 4fb662ae4e9e1be8c512f3d6abc0596fd275d9f0
  });
});
});