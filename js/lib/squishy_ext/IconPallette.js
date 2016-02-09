function getIconChar(element) {
 return (window.getComputedStyle(element,':before').getPropertyValue('content'));   
}

function ICS(target,field,icon) {
	this.elm=target;
	this.field=field;
	if(icon)
	this.value=icon;
	this.selector=$('<div class="selector"/>');
	this.selector.hide();
	pos=this.elm.position();
	//this.selector.css({top:pos.top+'px',left:pos.left+'px'})
	var o=this;

	this.activate=function() {
		o.selector.show();	
	};
	
	this.select=function() {
		var p=$(this);
	    o.selector.find('span').removeClass('active');
	    o.elm.find('span').attr('class',p.attr('class'));
	    o.field.attr('value',p.attr('class'));
	    o.value=p.attr('class');
	    p.addClass('active');
	    o.character=getIconChar(p[0]);
	    o.selector.hide();
	    o.callback();
	};

    for (key in this.icons) {
		icon=this.icons[key];
		$i=$('<span class="'+icon+'">');
		$i.click(this.select);
		if(icon==this.field.attr('value')){
			$i.addClass('active');
			this.elm.find('span').attr('class',icon);
		}
		this.selector.append($i);
		
	}
	this.elm.click(this.activate);
	this.elm.after(this.selector);
	
}
ICS.prototype={
	callback:function(){},
	icons:[
	'blank','icon-twitter','icon-instagram','icon-lab',
	'icon-davidstar','icon-cross','icon-moonandstar','icon-bomb','icon-diamond',
	'icon-brush','icon-library','icon-justice','icon-pig','icon-radioactive',
	'icon-male','icon-female','icon-ribbon','icon-lightning','icon-sun','icon-moon',
	'icon-bike','icon-rocket','icon-cone','icon-atom','icon-yingyang',
	'icon-navigation','icon-anchor','icon-music','icon-star','icon-earth',
	'icon-heart','icon-quill','icon-droplet','icon-cog','icon-thumbs-up','icon-smiley',
	'icon-grin','icon-picassa','icon-tux'],
	value:"blank"
};
