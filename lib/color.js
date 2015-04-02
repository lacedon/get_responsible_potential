var Color = function (r, g, b){
  this.r = Math.floor(this.__get_module_color__(r));
  this.g = Math.floor(this.__get_module_color__(g));
  this.b = Math.floor(this.__get_module_color__(b));
};
Color.prototype.__get_module_color__ = function (x){
  x = Number(x) || 0;
  if(x < 0){
    return 0;
  }
  else if(x > 255){
    return 255;
  }
  return x;
};
Color.prototype.__to_16__ = function (color){
  if(this[color] != undefined){
    if(this[color] < 16){
      return '0' + this[color].toString(16);
    }
    return this[color].toString(16);
  }
  return undefined;
};

Color.prototype.toString = function (type){
  type = type || '16';
  if(type == '16'){
    return '#' + this.__to_16__('r') + this.__to_16__('g') + this.__to_16__('b');
  }
  else if('RGB'){
    return 'RGB(' + this.r + ', ' + this.g + ', ' + this.b + ')';
  }
};

Color.prototype.contrast = function(){
  this.r = this.__get_module_color__(255 - this.r);
  this.g = this.__get_module_color__(255 - this.g);
  this.b = this.__get_module_color__(255 - this.b);
  return this;
};

Color.prototype.lighten = function(multiplier){
  multiplier = multiplier || 1;
  this.r = this.__get_module_color__(this.r + multiplier);
  this.g = this.__get_module_color__(this.g + multiplier);
  this.b = this.__get_module_color__(this.b + multiplier);
  return this;
};
Color.prototype.blur = function(multiplier){
  multiplier = multiplier || 1;
  this.r = this.__get_module_color__(this.r - multiplier);
  this.g = this.__get_module_color__(this.g - multiplier);
  this.b = this.__get_module_color__(this.b - multiplier);
  return this;
};

Color.prototype.stir = function(){
  var r = this.r,
      g = this.g,
      b = this.b;
  this.r = g;
  this.g = b;
  this.b = r;
  return this;
};