function onReady(){	

	var clock = new com.o2GEEK.AlarmClock('clock');
	var clock2 = new com.o2GEEK.Clock('clock2', -300, 'ETC');
	var clock3 = new com.o2GEEK.TextClock('clock3', -700, 'PST');
	//LiveDate.call(clock,1,2,3);
	LiveDate.apply(clock, [1,2,3]);
}

function LiveDate(a, b, c) {
	console.log(this, a, b, c);

}


Date.__interval = 0;
Date.__aDates = [];

Date.addToInterval = function(date){
	this.__aDates.push(date);
	
	if(!Date.__interval){
		Date.__interval = setInterval(function(){Date.updateDates()}, 1000);
	}
}

Date.updateDates = function() {
	for (var index = 0; index < this.__aDates.length; index++) {
		
		if(this.__aDates[index] instanceof Date){
			this.__aDates[index].updateSeconds();		
		} else if (this.__aDates[index] instanceof Function){
			this.__aDates[index]();
		} else if (this.__aDates[i] && this.__aDates[i]['update']){
			this.__aDates[index].update();
		}
		
	}
};

Date.prototype.updateSeconds = function() {
	this.setSeconds(this.getSeconds()+1);
}

Date.prototype.autoClock = function(isAuto){
	//clearInterval(this.clockInterval);
	if(isAuto){
		//var that = this;
		//this.clockInterval = setInterval(function(){that.updateSeconds()}, 1000);
		Date.addToInterval(this);
	}
}

var com = com || {};
com.o2GEEK = com.o2GEEK || {};

com.o2GEEK.Clock = function(id, offset, label) {
	offset = offset || 0;
	this.label = label || ''
	var d = new Date();
	var offset = (offset + d.getTimezoneOffset())*60*1000;
	this.d = new Date(offset + d.getTime());
	this.d.autoClock(true);
	this.id = id;
	
	
	this.tick(true);
	Date.addToInterval(function(){
	 	this.updateClock();
		 }.bind(this),1000);

}

com.o2GEEK.Clock.prototype.tick = function(isTick){
	//clearInterval(this.myInternalInterval);
	this.isTicking = isTick;
	// if(isTick){
	// 	this.myInternalInterval = setInterval(function(){
	// 	this.updateClock()}.bind(this),1000);
	// 	this.updateClock();
	// }
}

com.o2GEEK.Clock.prototype.updateClock = function() {
	if(this.isTicking){
		var date = this.d;
		var clock = document.getElementById(this.id);
		
		clock.innerHTML = this.formatOutput(date.getHours(),
			 date.getMinutes(),date.getSeconds(), this.label);		
	}
};

com.o2GEEK.Clock.prototype.formatOutput = function(h, m, s, label) {
	return this.formatDigits(h) + ":" + this.formatDigits(m)
			+ ":" + this.formatDigits(s) + " " + label;
}
	
com.o2GEEK.Clock.prototype.formatDigits = function(val) {
		if(val < 10) {
			val = "0" + val;
		}
		return val;
};

// create new constructor
com.o2GEEK.TextClock = function(id, offset, label){
	// refer back to parent
	com.o2GEEK.Clock.apply(this, arguments);
}

// load prototype
com.o2GEEK.TextClock.prototype = createObject(com.o2GEEK.Clock.prototype, com.o2GEEK.TextClock);
// set constructor
//com.o2GEEK.TextClock.prototype.constructor = com.o2GEEK.TextClock;

com.o2GEEK.TextClock.prototype.formatOutput = function(h, m, s, label) {
	return this.formatDigits(h) + " Hour " + this.formatDigits(m)
			+ " Minutes " + this.formatDigits(s) + " Seconds " + label;
}

com.o2GEEK.AlarmClock = function(id, offset, label){
	// refer back to parent
	com.o2GEEK.Clock.apply(this, arguments);

	console.log(this.version);
	
	this.doUpdate = true;
	this.dom = document.getElementById(id);
	this.dom.contentEditable = true;
	
	this.dom.addEventListener('focus', function(e){
		this.dom.innerHTML = this.dom.innerHTML.slice(0,this.dom.innerHTML.lastIndexOf(':'));
		this.tick(false);
	}.bind(this));
	
	this.dom.addEventListener('blur', function(e){
		var a = this.dom.innerHTML.split(':');
		this.almH = parseInt(a[0]);
		this.almM = parseInt(a[1]);
		if((this.almH >= 0 && this.almH<24) &&
			(this.almM>= 0 && this.almM < 60)) {
				var event = new Event('restart_tick');
				this.dom.dispatchEvent(event);
		}
		console.log(this.almH, this.almM);
	}.bind(this));
	
	this.dom.addEventListener('restart_tick', function(e){
		this.tick(true);
	}.bind(this));
}
// load prototype
com.o2GEEK.AlarmClock.prototype = createObject(com.o2GEEK.Clock.prototype, com.o2GEEK.AlarmClock);

com.o2GEEK.AlarmClock.prototype.formatOutput = function(h,m,s, label) {
	var output;
	if( h == this.almH && m == this.almM) {
		output = 'Alarm wake up!';
		var snd = new Audio('art/beep.mp3');
		snd.play();
	} else {
		output = com.o2GEEK.Clock.prototype.formatOutput.apply(this, arguments);
	}
	return output;
}

function createObject(proto, cons){
	function c() {}
	c.prototype = proto;
	c.prototype.constructor = cons;
	return new c();
}

window.onload = onReady;