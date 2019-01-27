// Helper functions
String.prototype.capitalize = function() 
{
	return this.charAt(0).toUpperCase() + this.slice(1) 
}

String.prototype.capitalizeWords = function() 
{ 
	return this.replace(/\b\w/g, function(w){ return w.toUpperCase() }) 
}

Array.prototype.getRandomOne = function() 
{
	var len = this.length;
	var rand = Math.floor(Math.random() * len) % len;

	return this[rand];
}

Date.prototype.addDays = function(days) 
{
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  
  return dat;
}