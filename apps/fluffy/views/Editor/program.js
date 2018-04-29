/*
 * [{"pk": 1, 
 * "model": "fluff.program", 
 * "fields": {
	 * 	"status": 0, 
	 * "console": "Purposely left blank.", 
	 * "name": "", 
	 * "created": "2014-11-09 08:12:11", 
	 * "graph": "{u'nodes': {}, u'wires': {}}", 
	 * "creator": 2, 
	 * "rate": 1.0, 
	 * "values": "", 
	 * "type": 1, 
	 * "saved": "2014-11-09 08:12:11"
 * }}]
 */
$.ajaxSetup({ 
     beforeSend: function(xhr, settings) {
         function getCookie(name) {
             var cookieValue = null;
             if (document.cookie && document.cookie != '') {
                 var cookies = document.cookie.split(';');
                 for (var i = 0; i < cookies.length; i++) {
                     var cookie = jQuery.trim(cookies[i]);
                     // Does this cookie string begin with the name we want?
                 if (cookie.substring(0, name.length + 1) == (name + '=')) {
                     cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                     break;
                 }
             }
         }
         return cookieValue;
         }
         if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
             // Only send the token to relative URLs i.e. locally.
             xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
         }
     } 
});
function Program(data,id) {
	this.editable_fields=['status','name','rate','type','graph'];
	this.graph={nodes:{},wires:{}};
	if(data) {
		//console.debug(data);
		
		for (n in data) {
			this[n]=data[n];
		}
		if(this.graph=='') this.graph={nodes:{},wires:{}};
		//console.debug(this);
	/*	this.data=$.extend({},data);
		//$.extend(this.fields,data.fields);
		console.debug(data.fields);
		if(data.graph!='') $.extend(this.graph,data.graph);
		console.debug(this.graph);
		try {
		

		}
		catch(e) {}*/
	}
}
Program.prototype={
	to_json:function() {
		
	},
	stop:function() {
		$.ajax("/!program/"+this.id+"/stop",function() {
			this.update_status('stopped');
		});
	},
	program_types:['Active','Passive','Simulate'],
	toggle:function () {
		if(this.state!='waiting') {
			if(this.state=='stopped') {
				this.start()
			}
			if(this.state=='running') {
				this.stop();
			}
		}
	},

	start:function () {
		this.update_status('waiting');
		$.ajax({
			url:"/!program/"+program.id+"/start",
			success:function() {
					
					if(program.type==1) {
						this.load();
					}
					if(program.type==0) {
						this.update_status('running');
					}
					
					//play();
			},
			error:function() {
				this.update_status('error');
				}
		});
	},
	load:function () {
		if(this.id) {
			this.update_status('waiting');
			$.getJSON("/!program/"+this.id,
			{id:program.id},
			function(data){
				this.data=data;
				$.extend(this.graph,data.graph);
				$.extend(this.values,data.values);
				//for(k in this.fields) this.fields[k]=data.fields[k];
				if(!running && program.status==2 && program.type==0 ) {
					this.update_status('running');
				}
				else {
					this.update_status('ready');
				}
			},
			'script');
			
		}
	},
	toJson:function() {
		fields.graph=this.graph;
		
		return {id:this.id,fields:this};
	},
	save:function() {
		var id=this.id;
		//console.debug(id);
		if(id) {
			//this.update_status('waiting');
			var saveObj={id:id,_model:this._model};
			for (i in this.editable_fields) {
				var fn=this.editable_fields[i];
				saveObj[fn]=this[fn];
			}
			
			$.ajax("/!program/"+id+"/update",{
				
				
			data:{data:JSON.stringify(saveObj)},
			type:'POST',
			success:function(data){
				//this.update_status('ready');
				alert('saved');
			},
			dataType:'script'});
		}
	},
	update_status:function(new_status) {
		if(new_status) {
			this.state=new_status;
			this.statuses[new_status]();
		}
		return this.state
	},
	statuses:{
				'waiting':function() {}, 
				'unsaved':function() {}, 
				'ready':function() {},
				'running':function() {}, 
				'stopped':function() {}, 
				'error':function() {}, 
	},

};