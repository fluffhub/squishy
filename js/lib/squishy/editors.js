function pixel_editor(id,value) {
	return $('<div class="pixel_editor"><input id="'+id+'" name="'+id+'" type="text" value="value">px</div>');	
}
function border_picker(id,value) {
	return $('<div class="pixel_editor"><input id="'+id+'" name="'+id+'" type="text" value="'+value+'"></div>');	
}
function value_editor(id,value) {
	return $('<div class="pixel_editor"><input id="'+id+'" name="'+id+'" type="text" value="value"></div>');
}
function numeric_editor(id,value) {
	return $('<input id="'+id+'" name="'+id+'" type="text" value="'+value+'">');
}

function symbol_picker(id,value) {
	return $('<input id="'+id+'" name="'+id+'" type="text">');
}

function color_editor(id,color) {
		$b=$('<div class="color_chip"></div>');
		var qq=15;
		$b.css({background:color,border:'1px solid #111'});
		$be=$('<div class="editor color_picker"></div>');
		$i=$('<input type="text" id="'+id+'" name="color">');

		$be.append($i);
		$save=$('<div class="save"/>');
		$cancel=$('<div class="cancel"/>');
		$cancel.click(function(e) {
			$(this).parent().hide();
		});
		$be.append($save);
		$be.append($cancel);
		//$be.append()	

		$be.css({display:'none'});
		cols=color_pallette();
	
		$pallette=$('<div class="pallette"></div>');
		for (var i in cols) {
			col=cols[i];
			$col=$('<div class="pallette_row"></div>');
			
			$col.css({width:12*col.length+12});
			for (var j in col) {
				color=col[j];
				rgb='rgb('+color.r+','+color.g+','+color.b+')';
				hex=hexcolor(color);
				$chip=$('<div class="color_chip"></div> ');
				$chip.data('color',color);
				
				$chip.css({'background':hex});
				$chip.click(function(e) {
					$e=$(this).parents('.editor');
					$i=$e.find('input[name="color"]');

					color=$(this).data('color');
					hex=hexcolor(color);
					$i.val(hex);
					$i.css({'background':hex});
					textcolor=color.r+color.g+color.b;
					if(textcolor>255) textcolor=255;
					else textcolor=0;
					$i.css({'color':hexcolor({r:255-textcolor,g:255-textcolor,b:255-textcolor})});
					$cc=$i.parents('.color_chip');
					id=$i.attr('id');
					
				
					assign(id,$i.val());
					$i.change();
					
					$cc.css({background:hex});
					$e.hide();
					
				});
				$col.append($chip);
			}
			$pallette.append($col);
		}
		$be.append($pallette);
	
		$b.append($be);

		$b.click(function(e) {
			$be=$(this).find('.color_picker');
			$b=$(this);
			$('.editor').hide();
			$be.css({top:$b.position().top+'px',left:$b.position().left+'px'});
			$be.show();
			
		});

		return $b;
		
}


function get_style_editor(id, name, value) {
	return style_editors[name](id, value);
}
function Tooltip(content, target,direction) {
	this.target=$(target);
    
    this.elm=$('<div class="tooltip ">'+content+'</div>');
    this.closer=$('<span class="closer"></span>');
    this.elm.append(this.closer);
    this.target.after(this.elm);
    this.closer.click(this.hide());
	pos=this.target.position();
    if(direction) {
    	this.direction=direction;
        if(direction=='up')
            this.direction='upwards';
        else if (direction=='down')
            this.direction='downwards';

    }
    else {
        if(pos.top>100)
            this.direction='downwards';
        else
            this.direction='upwards';
    }
    if(this.direction=='upwards') 
        this.pos={top:pos.top+this.target.outerHeight()+6,left:pos.left-this.elm.width()*0.1+this.target.outerWidth()/2};    
    else if(this.direction=='downwards') 
        this.pos={top:pos.top-16-this.elm.outerHeight(),left:pos.left-this.elm.width()*0.1+this.target.outerWidth()/2};    
	else if(this.direction=='left')
		this.pos={top:pos.top-this.elm.height()*0.5+this.target.outerHeight()/2+2,left:pos.left+this.target.outerWidth()+16};
	else if(this.direction=='right')
		this.pos={top:pos.top-this.elm.height()*0.5+this.target.outerHeight()/2+2,left:pos.left-16-this.elm.outerWidth()};
    this.elm.css(cssify(this.pos));
    this.elm.addClass(this.direction);
    
}
Tooltip.prototype={

    hide:function() {
       var  o=this;
        return function() {
             $(this).parent().hide();   
        };
    }
    
};

