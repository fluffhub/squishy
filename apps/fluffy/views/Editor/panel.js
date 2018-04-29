function Panel(panel) {
	
}
Panel.prototype={
assign:function (address,value) {
	var names=address.split('.');
	s='panel["'+names.join('"]["')+'"]='+JSON.stringify(value)+';';
	
	eval(s);
},
displays_in_rect(rect):function {
	var displays=[]
	
	for (i in panel.nodes) {
		d=dims2($('#'+i));
		if(intersect_rect(d,rect)) {
			displays[displays.length]=i;
		}
	}
	return displays;
},
extents:function() {
	var exts={'x1':NaN,'x2':NaN,'y1':NaN,'y2':NaN};
		
	for (i in panel.nodes) {
		var n=panel.nodes[i];
		
		var nex=node_extents(n);
		if(isNaN(exts.x1) || nex.x1<exts.x1) exts.x1=nex.x1;
		if(isNaN(exts.x2) || nex.x2>exts.x2) exts.x2=nex.x2;
		if(isNaN(exts.y1) || nex.y1<exts.y1) exts.y1=nex.y1;
		if(isNaN(exts.y2) || nex.y2>exts.y2) exts.y2=nex.y2;
	}
	return exts;
},
save_panel:function () {
	$('#status').html('Saving...');
	$.post("/app/get/save_panel.js",
			{panel:JSON.stringify(panel),panel_id:panel_id},
			function(){$('#status').html('Saved'); },
			'script'
	);
},
};

function PanelViewer(panel) {
	this.panel=panel;
	
}
{% include 'app/get/program.js' with p=p %}
{% include 'app/get/panel.js' with panel=panel %}
display_pallette={};


last_random_color=0;
panel_id={{panel.pk}};



PanelViewer.prototype=Object.create(Element.prototype);
$.extend(PanelViewer.prototype,{
	default_screen_style:{'background':'rgb(250,250,250)'},
	displays:{},
	running:false,
	process:null,
	snapTolerance:10,
	default_screens:{ "Ipad":{w:1024,h:768},
	 				"Retina Ipad":{w:2048,h:1536},
	 				"Ipad Mini":{w:1024,h:768},
	 				"Retina Ipad Mini":{w:1024,h:768},
	 				"Iphone 4 (480 x 800)":{w:480,h:800},
	 				"Iphone 5 (920 x 1280)":{w:920,h:1280},
	 				"1080P (1920 x 1080)":{w:1920,h:1080},
	 				"VGA (640 x 480)":{w:640,h:480},
	 				"QVGA (240 x 320)":{w:240,h:320},
	 				"WXGA (640 x 480)":{w:800,h:480},},
check_screens:function() {
	exts=extents();
	home=$('#panel_screen');
	o=home.position();
	d={left:o.left,top:o.top,w:home.width(),h:home.height()};
	return {left:exts.x1<0?0-parseInt(exts.x1 / d.w)+1:0,
			right:exts.x2>d.w?parseInt(exts.x2 / d.w):0,
			top:exts.y1<0?0-parseInt(exts.y1 / d.h)+1:0,
			bottom:exts.y2>d.h?parseInt(exts.y2/d.h):0}
	
}	,
 tile_screens:function() {
	screens=check_screens();
	screen_elements={}

	homedims=dims($('#panel_screen'));

	for(x=0-screens.left;x<=screens.right;x++) {
		for (y=0-screens.top;y<=screens.bottom;y++) {
			n=x+'x'+y;
			srect={x1:x*homedims.w,y1:y*homedims.h,
				y2:y*homedims.h+homedims.h,x2:x*homedims.w+homedims.w,
				h:homedims.h,w:homedims.w
			}
			if(n in panel.screens) {
				//just change values that are there
				panel.screens[n].x=srect.x1;
				panel.screens[n].y=srect.y1;
				panel.screens[n].h=srect.h;
				panel.screens[n].w=srect.w;
			}			
			else {
				panel.screens[n]={'x':x*homedims.w,'y':y*homedims.h,'w':homedims.w,'h':homedims.h,'style':{'background':'#eee'}}
			}
			
		}
	}
	for (n in panel.screens) {
		p=panel.screens[n];
		srect={ x1:p.x,x2:p.x+p.w,y1:p.y,y2:p.y+p.h };
		panel.screens[n].nodes=displays_in_rect(srect);	
		if(panel.screens[n].nodes.length==0&&n!='0x0') {
			delete panel.screens[n]
		}
	}
},
 play:function() {
	running=true
	process=setInterval(load_program, program.interval*1000);
},
 stop:function() {
	running=false
	clearInterval(process);
}
 draw_screens:function() {
	$('.screen').remove();
	for (name in panel.screens) {
		p=panel.screens[name];
		console.debug(name);
		console.debug(p);
		if(name!='0x0') {
			$screen=$('<div class="screen" id="'+name+'"></div>');
			$screen.css({'position':'absolute','left':p.x,'top':p.y,'width':p.w,'height':p.h});
			$screen.css(p.style || panel.screens['0x0'].style || default_screen_style);	
			$screen.prependTo('#graph');
			$screen.click(edit_screen(name))
		}
		else {
			$screen=$('#panel_screen');
			$screen.css({'position':'absolute','left':p.x,'top':p.y,'width':p.w,'height':p.h});
			$screen.css(p.style || default_screen_style);
			$screen.click(edit_screen(name))
		}
	}
	
},
draw_panel:function (){ 
	$g=$('#graph');
	//$g.html('');
	$g.children().each(function() {
		if(!$(this).hasClass('screen_outline')) $(this).remove(); 
	});
	$(window).resize();

	for (nodename in panel.nodes) {
		n=panel.nodes[nodename];
		$d=$('<div id="'+nodename+'" class="display" >');
		$d.css({position:"absolute",width:n.dimensions.w +'px',height:n.dimensions.h+'px',top:n.dimensions.y+'px',left:n.dimensions.x+'px'});
		$('#graph').append($d);
		$d.load('/editor/panel/'+panel_id+'/'+nodename+'/view',function(nodename) { return function() {
			displays[nodename].draw(nodename);
				$('#graph .display#'+nodename).draggable({stop:stop_display_drag,snap:'.display'});
	$('#graph .display#'+nodename).resizable({handles:'n,e,s,w,ne,nw,sw,se',stop:stop_display_resize,resize:scale_display});

		}}(nodename));
		
	}
	tile_screens();
	draw_screens();
},
	nav_drag:function() {
		$gc.mousedown(function(e) {
		if(e.which==2) {
			$('#graph-container').data('moving',true);
			$('#graph-container').data('mp',{left:e.pageX,top:e.pageY});
		}
	}).mousemove(function(e) {
		if(e.which==2) {
			if($('#graph-container').data('moving')) {
				p=$('#graph-container').data('mp');
				d={left:e.pageX-p.left,top:e.pageY-p.top};
				pos=$('#graph').position();
				$('#graph').css({left:pos.left+d.left,top:pos.top+d.top});
				$('#graph-container').data('mp',{left:e.pageX,top:e.pageY});
				//draw_overlay();
			}
		}
	}).mouseup(function(e) {
		if($('#graph-container').data('moving')) {
			$('#graph-container').data('moving',false);
		}
	});	
	},
	update_displays:function () {
	$('#graph .display').each(function() {
		update_display($(this));
	});	
},

 update_display:function(display) {
	var id=display.attr('id');
		style=panel.nodes[id].style;	
		display.css(style);
}
});
	
	
function PanelEditor(panel) {
		background=panel.background||'white';
	canvas=document.getElementById('graph-overlay');
	context=canvas.getContext('2d');
	$gc=$('#graph-container');
	$gc.droppable({accept:".node.template", drop:function(e,ui) {
		$n=$(ui.draggable);
		n=$.extend(true, {}, $n.data('node'));
		off=$('#graph').offset();
		n.dimensions.x=e.pageX-off.left-$n.width()/2;
		n.dimensions.y=e.pageY-off.top-$n.height()/2;
		add_node(n);
	}});
	$.ajax({dataType:'json',url:"/app/get/display_pallette.js",
		success:function(data){node_pallette=data;node_drawer(); }
	});
		$('#save').click(function() { save_panel(); });
	$(".node.template").each(function() {
		$n=$(this);
		$n.draggable({helper:'clone', appendTo:'body'});	
	});
		draw_panel();
	$('#graph').css({top:'30px'});

	$('.display,.screen').each(function() {
		$eb=$(this).find('.editor_bar');
		$(this).mouseover(function(e) {
			$eb=$(this).find('.editor_bar');
			if(!$eb.hasClass('hovering'))
				$eb.addClass('hovering');
				$(this).find('.ui-resizable-handle').addClass('hovering');
		}).mouseout(function(e) {
			$eb=$(this).find('.editor_bar');
			$eb.removeClass('hovering');
			$(this).find('.ui-resizable-handle').removeClass('hovering');
		});

	});
	update_displays();
	$('.editor_bar').mousedown(function(e) {
			$(this).siblings('.editor_window').toggle();
			$(this).addClass('hovering');
	});
	
	$('#graph .display').each(function() {
		de=display_editor(panel.nodes[$(this).attr('id')])
		$(this).append(de[0]);
		o=de[0].offset();
			de[1].css({top:o.top,left:o.left});
	
		$('body').append(de[1]);
	});
}
PanelEditor.prototype=Object.create(Pane.prototype);
$.extend(PanelEditor.prototype,{controls={};
property_editors:{
	'background':color_editor,
	'width':pixel_editor,
	'height':pixel_editor,
	'border':border_picker,
	'lineStyle':color_editor,
	'numeric':numeric_editor,
	'default':value_editor,
	'checkbox':checkbox,
	'color':color_editor,
	'symbol':symbol_picker,
	
},
style_editors:{
	'background':color_editor,
	'width':pixel_editor,
	'height':pixel_editor,
	'border':border_picker,
	'color':color_editor,
	'default':value_editor,
},
delete_display:function (nodename) {
	delete panel.nodes[nodename];
	for (wirename in graph.wires) {
		w=graph.wires[wirename];
		if(~w.start.indexOf(nodename) || ~w.end.indexOf(nodename)) {
			delete graph.wires[wirename];
			
		}
	}
	draw_graph()
},
stop_display_drag:function (e) {
	$d=$(this);
	console.debug($d);
	console.debug($d.attr('id'));
	node=panel.nodes[$d.attr('id')];
	pos=$d.position();
	node.dimensions.x=pos.left;
	node.dimensions.y=pos.top;
	panel.nodes[$d.attr('id')]=node;
	check_screens();
	save_panel();
},
stop_display_resize:function (e) {
	$d=$(this);
	node=panel.nodes[$d.attr('id')];
	node.dimensions.w=$d.width();
	node.dimensions.h=$d.height();
	panel.nodes[$d.attr('id')]=node;
	check_screens();
	save_panel();
	
},
add_node:function (node) {
	i=0;
	/*
	for (n in graph.nodes) {
		rr=n.match(new RegExp(""+node.name+"([0-9]*)"));
		if(rr!=null){
			if(rr[1]=='')
				j=1;
			else 
			j=parseInt(rr[1]);
			if (j>i) i=j;
		}
	}
	
	if(i>0){
		nodename=node.name.replace(/[^a-zA-Z]+/g,'')+(i+1)
	}
	else {
		nodename=node.name.replace(/[^a-zA-Z]+/g,'')
	}*/
	//node.name=nodename;
	panel.nodes[node.name]=node;
	save_panel();
	draw_panel();
},
scale_display:function (event, ui) {
	$r=$(this);
	nodename=$r.attr('id');
	console.debug(nodename);
	$r.css({'z-index':10000010});
	//item_containment($r);
	peers=$r.siblings('.display');
	neighbor_bounds={};
	p=$r.position();
	x1=p.left;
	x2=p.left+$r.width();
	y1=p.top;
	y2=p.top+$r.height();
	op=ui.originalPosition;
	os=ui.originalSize;
	np=ui.position;
	ns=ui.size;
	d={left:np.left-op.left,
		top:np.top-op.top,
		right:(np.left+ns.width)-(op.left+os.width),
		bottom:(np.top+ns.height)-(op.top+os.height)
	};
	//console.debug(JSON.stringify(d));
	peers.each(function() {
		$p=$(this);
		$p.css({'z-index':1000010});
		pp=$p.position();
		px1=pp.left;
		px2=pp.left+$p.width();
		py1=pp.top;
		py2=pp.top+$p.height();
		if(d.left!=0) {
			if(Math.abs(px2-x1)<=snapTolerance) {
				//right-left snap
				//console.debug('RL');
				$r.css({left:px2});
				$r.width(x2-px2);
			}
			if(Math.abs(px1-x1)<=snapTolerance) {
				//console.debug('LL');
				$r.css({left:px1});
				$r.width(x2-px1);
			}
		}
		if(d.right!=0) {
			if(Math.abs(px1-x2)<=snapTolerance) {
				//left-right snap
				//console.debug('LR');
				$r.width(px1-x1);
			}
			if(Math.abs(px2-x2)<=snapTolerance) {
				//console.debug('RR');
				$r.width(px2-x1);
			}
		}
		if(d.top!=0) {
			if(Math.abs(py2-y1)<=snapTolerance) {
				//top=bottom snap
				//console.debug('TB');
				$r.css({top:py2});
				$r.height(y2-py2);
			}
			if(Math.abs(py1-y1)<=snapTolerance) {
				//console.debug('TT');
				$r.css({top:py1});
				$r.height(y2-py1);
			}
		}
		if(d.bottom!=0) {
			if(Math.abs(py1-y2)<=snapTolerance) {
				//bottom-top snap
				//console.debug('BT');
				$r.height(py1-y1);
			}
			if(Math.abs(py2-y2)<=snapTolerance) {
				//console.debug('BB');
				$r.height(py2-y1);
			}
		}
	});
	set_resize_handles($r);
	console.debug('displays['+nodename+'].draw('+nodename+'))');
	displays[nodename].draw(nodename);
}
});

function DisplayEditor(display) {
	//this is basically a template for the editor
	$eb=$('<div class="editor_bar"></div>').append('<strong>'+display.name+'</strong>').append('<span class="icon-cog"></span>');
	$eb.mousedown(function(e) {
		$('.editor_window').hide();
		o=$(this).offset();
		
		$('#'+display.name+'.editor_window').css({top:o.top,left:o.left}).data('old',panel.nodes[$(this).parents('.display').attr('id')]).show();
	});
	$ew=$('<div class="editor_window" id="'+display.name+'">');
	$web=$('<div class="editor_bar"></div>').append($('<div class="cancel"/>').mousedown(function(e) {
		$('.editor_window').hide();
		$(this).parents('.editor_window').find('.editor').hide();
		panel.nodes[$(this).parents('.editor_window').attr('id')]=$(this).parents('.editor_window').data('old');
	})).append($('<div class="save"/>').mousedown(function(e) {
		$('.editor_window').hide();
		save_panel();
		$(this).parents('.editor_window').find('.editor').hide();
		update_display($('#graph .display#'+$(this).parents('.editor_window').attr('id')));
	})).append('<strong>'+display.name+'</strong>');
	$ew.append($web);
	$ew.append($('<div class="menu_item dimensions"></div>').append('<span>Size:</span><input type="text" name="w" value="'+display.dimensions.w+'"><span>px x </span><input value="'+display.dimensions.h+'" type="text" name="h"><span>px</span>'));
	for (property in display.style) {
		$mi=$('<div class="menu_item"></div>').append('<strong>'+property+':</strong>').append(get_style_editor('nodes.'+display.name+'.style.'+property+'',property,display.style[property]).attr('id','style_'+property));
		$mi.find('input').change(function() {
			id=$(this).attr('id');
			if($(this).attr('type')=='checkbox') { console.debug('checkbox changed'); assign(id,$(this).val()=="on"); }
			else assign(id,$(this).val());
			update_display($('#graph .display#'+$(this).parents('.editor_window').attr('id')));		
		})
		$ew.append($mi);
	}

	
	for (property in display.display_properties) {
		t=display.display_properties[property];
		v=display.properties[property];
		$mi=$('<div class="menu_item"></div>').append('<strong>'+property+':</strong>').append(property_editors[t]('nodes.'+display.name+'.properties.'+property+'',v)).attr('id','property_'+property);
		$mi.find('input').change(function() {	
			id=$(this).attr('id');
			if($(this).attr('type')=='checkbox') { console.debug('checkbox changed'); assign(id,$(this).val()=="on"); }
			else assign(id,$(this).val());
			update_display($('#graph .display#'+$(this).parents('.editor_window').attr('id')));		
		});
		$ew.append($mi);
	}
//	$save=$('<input type="submit" class="save" value="save">');
	
//	$cancel=$('<input type="button" class="cancel" value="cancel">');
	
//	$ew.append($('<div class="editor_controls"></div>').append($save).append($cancel));
	$ew.draggable({handle:'.editor_bar',containment:'window'});
	return [$eb,$ew];
}



function SCreenEdtiro(screen_name) {
	return function(e) {
		$('.editor').remove();
		scr=panel.screens[screen_name];
		panel_editor=$('<div class="editor"></div>');
		$f=$('<form> </form>')
		for (style in scr.style) {
			$item=$('<div class="item"></div>');
			$item.append('<strong>'+style+'</strong>');
			$item.append(get_style_editor('screens.'+scr.name+'.style.'+style,style, scr.style[style]));
			$f.append($item);
		}
		$f.submit(function(e) {
			
		});
		panel_editor.append($f);
		panel_editor.appendTo($('#graph'));
		
		panel_editor.css({'position':'absolute',top:scr.y+'px',left:scr.x+'px'})
	}
}




function set_resize_handles($item) {
	$item.find('.ui-resizable-w, .ui-resizable-e').css({'line-height':$item.height()});
}
function node_extents(node) {
	return {'x1':node.dimensions.x,'y1':node.dimensions.y,'x2':node.dimensions.x+node.dimensions.w,'y2':node.dimensions.y+node.dimensions.h};
}
