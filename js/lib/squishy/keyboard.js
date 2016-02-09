Module(function M() {
M.Import('squishy/events',function (events) {
  M.Class(function C() {
    C.Init(function Keyboard(target) {
      target.onkeydown=this.keypress();
      target.onkeyup=this.keyup();
    });
    C.Mixin({
      modifier_keys:{
        'shift':false,
        'alt':false,
        'ctrl':false
      },
      layout:{
        16:'shift',
        18:'alt',
        17:'ctrl',
        32:'space',
        9:'tab',
        20:'caps',
        27:'esc',
        91:'os',
        93:'opt',
        37:'left',
        38:'up',
        39:'right',
        40:'down',
        33:'pgup',
        34:'pgdown',
        46:'del',
        8:'backspace',
        45:'ins'
      },
      actions:{
        'esc':function() { // clear selection
        },
        'tab':function() { //switch through panel tabs
        },
        'left':function() {
          //move selection to left
        },
      },
      pressed:{},
      keypress:function () {
        var that=this;
        return function(evt) {
          evt = evt || window.event;
          try {
            keyname=that.layout[evt.which];
            that.pressed[keyname]=true;
            if(keyname in that.actions) {
              that.actions[keyname]();
            }
          }
          catch(E) {
            //unknown keystroke - just place number in pressed
            that.pressed[evt.which]=true;
          }
        }
      },
      keyup:function () {
        var that=this;
        return function(evt) {
          evt=evt||window.event;
          try{
            keyname=that.layout[evt.which];
            that.pressed[keyname]=false;
          }
          catch(e) {
            //unknown keystroke
            that.pressed[evt.which]=false;
          }
        }
      }
    });
  });
});
});




