!function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);throw new Error("Cannot find module '"+g+"'")}var j=c[g]={exports:{}};b[g][0].call(j.exports,function(a){var c=b[g][1][a];return e(c?c:a)},j,j.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b){"use strict";var c=a("./modules/driller"),d=a("./modules/caller"),e=a("./modules/simple-visualiser"),f=a("./modules/control-panel"),g=a("./modules/step-selector"),h=a("./configs/tai-chi");b.exports={init:function(){c.addDiscipline(h);var a=new c({discipline:"taiChi",disabledSteps:["inside","outside"],delay:2});if("#silent"!==window.location.hash){new d(a)}new f(a,{fieldList:["minTime","maxTime","areaWidth","areaLength","stepCount","delay","preservePosition"],actionList:["resetAndStart","stop"],formId:"onGuardControlPanel"}),new g(a,"disabledSteps"),new e(a,"visualiser")}}},{"./configs/tai-chi":2,"./modules/caller":5,"./modules/control-panel":6,"./modules/driller":7,"./modules/simple-visualiser":8,"./modules/step-selector":9}],2:[function(a,b){"use strict";b.exports={name:"taiChi",steps:{step:{frontFoot:1,move:[1,0],direction:0},back:{frontFoot:1,move:[-1,0],direction:0},shift:{frontFoot:1,move:[0,0],direction:1},"switch":{frontFoot:1,move:[0,0],direction:0},inside:{frontFoot:0,move:[0,1],direction:0},outside:{frontFoot:1,move:[0,-1],direction:0},turn:{frontFoot:0,move:[0,-1],direction:1},onGuard:{_propertyDefinition:!0,enumerable:!1,value:{frontFoot:"Left",move:[0,0],direction:0}},wuChi:{_propertyDefinition:!0,enumerable:!1,value:{frontFoot:null,move:[0,0],direction:0}}},startSequence:["wuChi","onGuard"],endSequence:["wuChi"]}},{}],3:[function(a){"use strict";var b=a("./app");b.init()},{"./app":1}],4:[function(a,b){"use strict";var c=function(a){var b=function(a,b,d,e){var h=a[b]||(a[b]=[]);h.push({callback:d,context:e||window||null}),e&&(e.on!==f&&c.apply(e),"silenceEvents"!==b&&e.on("silenceEvents",function(){g.call(this,b,d,e)},this))},d=function(a,b,c,d){var e,f=a[b];if(f)for(c||d||(f.length=[]),e=f.length-1;e>=0;e--)(c||f[e].context!==d)&&(f[e].callback!==c||d&&f[e].context&&f[e].context!==d)||f.splice(e,1)},e=function(a,b,c){var d,e=a[b],f=0;if(e)for(d=e.length;d>f;f++)e[f].callback.call(e[f].context,c,b,this)},f=function(a,c,d){if("string"!=typeof a)throw"provide a string name for the event to subscribe to";if("function"!=typeof c)throw"provide a callback for the event to subscribe to";for(var e=i(this),f=a.split(" "),g=0,h=f.length;h>g;g++)b.call(this,e,f[g],c,d)},g=function(a,b,c){if("string"!=typeof a)throw"provide a string name for the event to unsubscribe from";var e=i(this,!0),f=a.split(" ");if(!e)return!1;for(var g=0,h=f.length;h>g;g++)d.call(this,e,f[g],b,c)},h=function(a,b){for(var c=i(this),d=a.split(" "),f=0,g=d.length;g>f;f++)e.call(this,c,d[f],b)},i=function(b,c){for(var d=0,e=k.length;e>d;d++)if(k[d]===b)return j[d];return c?a:(k.push(b),j.push([]),j[j.length-1])},j=[],k=[],l=function(){return this.on=f,this.off=g,this.fire=h,this};return l.cleanUp=function(){j=[],k=[]},l}();b.exports=c},{}],5:[function(a,b){"use strict";var c=a("../utils"),d=function(a){if(!a.on)throw"driller must implement event emitter";this.driller=a,this.init()};d.prototype={init:function(){this.speaker=document.createElement("audio"),this.speaker.preload="auto",this.speaker.autoplay=!1,document.getElementsByTagName("body")[0].appendChild(this.speaker),this.driller.on("step",this.callStep,this)},callStep:function(a){this.speaker.src="assets/audio/"+c.toDashed(this.driller.discipline)+"/"+c.toDashed(a.lastStep)+".ogg",this.speaker.play()}},b.exports=d},{"../utils":10}],6:[function(a,b){"use strict";var c=function(a,b){if(!a.on)throw"controller must implement event emitter pattern";this.fieldList=b.fieldList,this.actionList=b.actionList,this.controller=a,this.form=document.getElementById(b.formId),this.init()};c.prototype={init:function(){var a,b;if(this.fieldList)for(a=0,b=this.fieldList.length;b>a;a++)this.bindField(this.fieldList[a]);if(this.actionList)for(a=0,b=this.actionList.length;b>a;a++)this.bindAction(this.actionList[a])},bindField:function(a){var b,c=document.getElementById(a),d=this;return c?(b=["checkbox","radio"].indexOf(c.type)>-1?"checked":"value",c[b]=this.controller.conf[a],c.addEventListener("change",function(){var e=c[b];d.controller.conf[a]=e;var f={};f[a]=e,d.controller.fire("configChange",f)}),void 0):(console.warn("missing field in control panel: "+a),void 0)},bindAction:function(a){var b=document.getElementById(a),c=this;return b?(b.addEventListener("click",function(){c.controller[a]()}),void 0):(console.warn("missing button on control panel: "+a),void 0)}},b.exports=c},{}],7:[function(a,b){"use strict";var c=a("../mixins/event-emitter"),d=a("../utils"),e="Left",f="Right",g="North",h="South",i="East",j="West",k=[g,i,h,j],l=function(a){this.discipline=a&&a.discipline||l.defaults.discipline,this.conf=d.extendObj({},l.defaults,l.disciplineConfigs[this.discipline],a||{}),this.init()};l.defaults={discipline:"taiChi",disabledSteps:[],minTime:1,maxTime:2,areaWidth:4,areaLength:4,stepCount:-1},l.addDiscipline=function(a){if(!a.name)throw"name must be defined for any discipline config";l.disciplineConfigs[a.name]=a,d.defineProps(a.steps)},l.disciplineConfigs={},l.prototype={init:function(a){var b=this.conf.startPosition||{},c=this;this.disabledSteps={},this.conf.disabledSteps.map(function(a){c.disabledSteps[a]=!0}),this.coords=(this.conf.preservePosition?this.coords:b.coords)||[0,0],this.frontFoot=b.frontFoot||null,this.direction=this.conf.preservePosition?this.direction:b.direction,this.direction="undefined"==typeof this.direction?0:this.direction,this.longDirection=k[this.direction],this.stepCount=this.conf.stepCount,this.conf.minTime=Math.max(this.conf.minTime,.5),this.conf.maxTime=Math.max(this.conf.maxTime,this.conf.minTime),this.fire("initialised"),this.conf.autoplay&&!a&&this.start()},_start:function(){this.fire("started"),this.running=!0,this.startSequence=this.conf.startSequence.slice(),this.announceStep(this.startSequence.shift()),this.takeStep()},start:function(a){var b=this;if(a)this.init(!0);else if(this.running===!0)return;this.conf.delay?setTimeout(function(){b._start(a)},1e3*this.conf.delay):this._start(a)},resetAndStart:function(){this.stop(!0),this.start(!0)},announceStep:function(a){if(!this.conf.steps[a])throw"invalid step name: "+a;this.fire("step",{direction:k[this.direction],frontFoot:this.frontFoot,lastStep:a,coords:this.coords.slice()})},stop:function(a){this.running===!0&&(clearTimeout(this.timer),a||(this.endSequence=this.conf.endSequence.slice(),this.takeStep(!0)),this.fire("stopped"),this.running=!1)},takeStep:function(a){var b,c=this;return this.stepCount||a||this.startSequence.length?(this.stepCount&&!this.startSequence.length&&this.stepCount--,b=this.getNextStepName(a),a?b&&(this.adjustPosition(b),this.endSequence.length&&c.takeStep(a)):this.timer=setTimeout(function(){c.adjustPosition(b),c.takeStep()},this.getTimeInterval()),void 0):this.stop()},getNextStepName:function(a){var b;return(b=a?this.endSequence.length?this.endSequence.shift():void 0:this.startSequence.length?this.startSequence.shift():this.getRandomStep())?this.validateStep(b)?b:this.getNextStepName(a):void 0},getRandomStep:function(){return d.pickRandomProperty(this.conf.steps)},validateStep:function(a){if(this.disabledSteps[a])return!1;var b=this.adjustPosition(a,!0);return b[0]>=0&&b[1]>=0&&b[1]<this.conf.areaWidth&&b[0]<this.conf.areaLength},adjustPosition:function(a,b){var c,d,g,h,i,j,l,m;if(i=this.conf.steps[a],!i)throw"invalid step name: "+a;switch(j=(this.direction+(this.frontFoot===e?1:-1)*i.direction+4)%4,l=k[j],d=i.move[1]*(this.frontFoot!==f?1:-1),g=i.move[0],m=i.frontFoot===e?e:i.frontFoot===f?f:null===i.frontFoot?null:1===i.frontFoot?this.frontFoot===f?e:f:this.frontFoot,this.direction){case 0:c=[g,d];break;case 1:c=[-d,g];break;case 2:c=[-g,-d];break;case 3:c=[d,-g]}return h=[this.coords[0]+c[0],this.coords[1]+c[1]],b?h:(this.coords=h,this.currentStep=i,this.direction=j,this.longDirection=l,this.frontFoot=m,this.announceStep(a),void 0)},getTimeInterval:function(){var a=2,b=this.conf.maxTime-this.conf.minTime,c=a+b*Math.random();return c=Math.max(Math.min(this.conf.maxTime,c),this.conf.minTime),1e3*c},enableStep:function(a){var b=this.conf.disabledSteps.indexOf(a);this.disabledSteps[a]=!1,b>-1&&(this.conf.disabledSteps.splice(b,1),this.fire("configChange",{disabledSteps:this.conf.disabledSteps}))},disableStep:function(a){var b=this.conf.disabledSteps.indexOf(a);this.disabledSteps[a]=!0,-1===b&&(this.conf.disabledSteps.push(a),this.fire("configChange",{disabledSteps:this.conf.disabledSteps}))},updateSettings:function(a){this.conf=d.extendObj(this.conf,a)}},c.apply(l.prototype),b.exports=l},{"../mixins/event-emitter":4,"../utils":10}],8:[function(a,b){"use strict";var c=a("../utils"),d="&nbsp;&nbsp;&nbsp;&nbsp;",e=function(a,b){this.conf=a.conf,this.driller=a,this.domNode=document.getElementById(b),this.init()};e.prototype={init:function(){this.driller.on("initialised",function(){this.prime()},this),this.driller.on("step",function(a){this.conf.areaWidth>0&&this.conf.areaLength>0&&(this.setPosition(a.coords,a.direction,a.frontFoot),this.updateCaption(c.camelToSpaced(a.lastStep)))},this),this.prime()},prime:function(){this.conf.areaWidth>0&&this.conf.areaLength>0&&(this.undrawGrid(),this.drawCaption(),this.drawGrid(),this.setPosition(this.driller.coords,this.driller.longDirection,"center"))},drawCaption:function(){this.caption=document.createElement("h2"),this.caption.innerHTML="&nbsp;",this.domNode.appendChild(this.caption)},updateCaption:function(a){this.caption.innerHTML=a.charAt(0).toUpperCase()+a.substr(1)},drawGrid:function(){for(var a,b,c,e=document.createElement("table"),f=document.createElement("tr"),g=document.createElement("td"),h=this.conf.areaWidth,i=this.conf.areaLength;i--;)for(b=f.cloneNode(),e.appendChild(b),a=0;h>a;a++)c=g.cloneNode(),c.innerHTML=d,b.appendChild(c);this.domNode.appendChild(e),this.grid=e,e.className="floorspace"},undrawGrid:function(){this.domNode.innerHTML=""},setPosition:function(a,b,c){this.position&&this.unshowPosition();var d=this.grid.getElementsByTagName("tr")[this.conf.areaLength-1-a[0]].getElementsByTagName("td")[a[1]];d.className="current "+b.toLowerCase()+" "+(c&&c.toLowerCase()),this.position=a,d.innerHTML="&#8593;"},unshowPosition:function(){var a=this.grid.getElementsByTagName("tr")[this.conf.areaLength-1-this.position[0]].getElementsByTagName("td")[this.position[1]];a.className="",a.innerHTML=d}},b.exports=e},{"../utils":10}],9:[function(a,b){"use strict";var c=a("../utils"),d=function(a,b){this.driller=a,this.domNode=document.getElementById(b),this.init()};d.prototype={init:function(){var a=document.createElement("p");a.textContent="Choose which steps to include in your drill",this.domNode.appendChild(a),this.createInputs()},createInputs:function(){var a,b;for(var d in this.driller.conf.steps)a=document.createElement("label"),a["for"]=d,a.textContent=c.camelToSpaced(d),b=document.createElement("input"),b.id=d,b.name="stepSelector",b.type="checkbox",this.domNode.appendChild(b),this.domNode.appendChild(a),this.bindInputToDriller(d,b)},bindInputToDriller:function(a,b){var c=this;b.checked=-1===this.driller.conf.disabledSteps.indexOf(a),b.addEventListener("change",function(){b.checked?c.driller.enableStep(a):c.driller.disableStep(a)})}},b.exports=d},{"../utils":10}],10:[function(a,b){var c=function(a){var b,c=0;for(var d in a)Math.random()<1/++c&&(b=d);return b},d=function(a){var b;for(var c in a)b=a[c],b._propertyDefinition&&(delete a[c],Object.defineProperty(a,c,b));return a},e=function(a){var b,c=Array.prototype.slice.call(arguments,1);if(!c.length)return a;c.length>1?(b=c.pop(),a=e.apply(this,Array.prototype.concat.apply([a],c))):b=c[0];for(var d in b)a[d]=b[d];return a},f=function(a){return a.replace(/\-\w/g,function(a){return a.charAt(1).toUpperCase()})},g=function(a){return a.replace(/[^A-Z][A-Z]/g,function(a){return a.charAt(0)+"-"+a.charAt(1).toLowerCase()})},h=function(a){return a.replace(/-/g," ")},i=function(a){return h(g(a))};b.exports={pickRandomProperty:c,defineProps:d,extendObj:e,toCamel:f,toDashed:g,dashedToSpaced:h,camelToSpaced:i}},{}]},{},[3]);