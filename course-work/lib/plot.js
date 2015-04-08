var Plot = function (el, attr){
  if(typeof el == 'string'){
    el = document.getElementById(el);
  }
  attr = attr || {};
  par = el;
  par.innerHTML = '<canvas>Ваш браузер не поддерживает canvas.</canvas>';
  el = par.getElementsByTagName('canvas')[0];

  var w = attr.w || el.width,
      h = attr.h || el.height;

  this.parent     = par;
  this.el         = el;
  this.ctx        = el.getContext('2d');


  this.par        = undefined;
  this.par_max    = undefined;
  this.par_min    = undefined;
  this.par_isReal = undefined;

  this.fun        = undefined;
  this.fun_out    = undefined;
  this.fun_max    = undefined;
  this.fun_min    = undefined;
  this.fun_isReal = undefined;

  this.palet      = undefined;

  this.parent.style.position  = 'relative';
  this.border                 = 2;
  this.palet_height           = 20;
  this.font_size              = 15;
  this.ctx.textAlign          = "center";
  this.ctx.textBaseline       = "center";
  this.ctx.fillStyle          = new Color().toString();
  this.ctx.font               = this.font_size+"px tahoma";

  this.setWidth(w);
  this.setHeight(h);
}

Plot.prototype.setHeight = function (x){
  this.h = x - (2 * this.border) - (this.palet_height + this.font_size);
  this.el.height = x;
}
Plot.prototype.setWidth = function (x){
  this.w = x - (2 * this.border);
  this.el.width = x;
}

Plot.prototype.setParametr = function (x){
  this.par = x;
  this.par_max = {};
  this.par_min = {};
  this.par_isReal = true;

  for(i in this.par){
    if(!this.par[i].isReal()){
      this.par_isReal = false;
    }
    if(typeof(this.par[i]) == 'number'){
      this.par[i] = new Complex(this.par[i]);
    }

    if(this.par_max.r == undefined || this.par[i].r > this.par_max.r){
      this.par_max.r = this.par[i].r;
    }
    if(this.par_max.i == undefined || this.par[i].i > this.par_max.i){
      this.par_max.i = this.par[i].i;
    }

    if(this.par_min.r == undefined || this.par[i].r < this.par_min.r){
      this.par_min.r = this.par[i].r;
    }
    if(this.par_min.i == undefined || this.par[i].i < this.par_min.i){
      this.par_min.i = this.par[i].i;
    }
  }

  return this;
}
Plot.prototype.setFunction = function (x){
  this.fun = x;
  return this;
}

Plot.prototype.__setFunctionOut__ = function(type){
  type = type || 0

  this.fun_out = {};
  this.fun_max = {};
  this.fun_min = {};
  this.fun_isReal = true;

  if(type == 0){
    for(var i in this.par){
      var this_el = this.fun(this.par[i]);
      if(typeof(this_el) == 'number'){
        this_el = new Complex(this_el);
      }
      this.fun_out[this.par[i]] = this_el;

      this_el = this.fun_out[this.par[i]];

      this.fun_isReal = this.fun_isReal && this_el.isReal();

      if(this.fun_max.r == undefined || this_el.r > this.fun_max.r){
        this.fun_max.r = this_el.r;
      }
      if(this.fun_max.i == undefined || this_el.i > this.fun_max.i){
        this.fun_max.i = this_el.i;
      }

      if(this.fun_min.r == undefined || this_el.r < this.fun_min.r){
        this.fun_min.r = this_el.r;
      }
      if(this.fun_min.i == undefined || this_el.i < this.fun_min.i){
        this.fun_min.i = this_el.i;
      }
    }
  }
  else if(type == 1){
    for(var i in this.par){
      for(var j in this.par){
        var val = new Complex(this.par[j].r, this.par[i].i),
            this_el = this.fun(val);
        if(typeof(this_el) == 'number'){
          this_el = new Complex(this_el);
        }
        this.fun_out[val] = this_el;

        this_el = this.fun_out[val];
        this.fun_isReal = this.fun_isReal && this_el.isReal();

        if(this.fun_max.r == undefined || this_el.r > this.fun_max.r){
          this.fun_max.r = this_el.r;
        }
        if(this.fun_max.i == undefined || this_el.i > this.fun_max.i){
          this.fun_max.i = this_el.i;
        }

        if(this.fun_min.r == undefined || this_el.r < this.fun_min.r){
          this.fun_min.r = this_el.r;
        }
        if(this.fun_min.i == undefined || this_el.i < this.fun_min.i){
          this.fun_min.i = this_el.i;
        }
      }
    }
  }

  return this;
}

Plot.prototype.__create_palet__ = function (type, attr){
  type = type || 0;
  attr = attr || 'i';

  var step = 5;

  if(this.fun_isReal === undefined){
    this.__setFunctionOut__();
  }

  if(type == 0){
    var l = (this.fun_max[attr] - this.fun_min[attr]) / 255;
    this.palet = {};

    var val = parseFloat(this.fun_min[attr]);
        val = val - (val % 0.01) - 1;
    this.palet[val+(attr=='i'?'i':'')] = new Color(0, 0, 255);
    for(var i = step; i < 255; i += step){
      val = parseFloat(this.fun_min[attr] + l * i);
      val = val - (val % 0.01);;
      this.palet[val+(attr=='i'?'i':'')] = new Color(0, i, 255-i);
    }
  }
  else if(type == 1){
    var l_r = (this.fun_max.r - this.fun_min.r) / 255,
        l_i = (this.fun_max.i - this.fun_min.i) / 255;
    this.palet = {};

    for(var i = 0, r_key = 0; i < 255; i += step){
      r_key = parseFloat(this.fun_min.r + l_r * i).toFixed(2);
      this.palet[r_key] = {};
      for(var j = 0, i_key = 0; j < 255; j += step){
        i_key = parseFloat(this.fun_min.i + l_i * j).toFixed(2);
        this.palet[r_key][i_key] = new Color(i, j, 255-i-j);
      }
    }
  }

  return this;
}
Plot.prototype.__get_color__ = function(x, type, attr){
  type = type || 0;
  attr = attr || 'i';

  if(type == 0){
    var k;
    for(var val in this.palet){
      if(x != undefined && x[attr] >= new Complex(val)[attr]){
        k = val;
      }
      else{
        break;
      }
    }
    if(k != undefined){
      return this.palet[k];
    }
  }
  else if(type == 1){
    var k_x, k_y;
    for(var val_r in this.palet){
      for(var val_i in this.palet[val_r]){
        if(x != undefined && x.i >= new Complex(val_r, val_i).i){
          k_y = val_i;
        }
        else if(x != undefined && x.r >= new Complex(val_r, val_i).r){
          k_x = val_r;
        }
        else{
          break;
        }
      }
    }
    if(k_x != undefined && k_y != undefined){
      return this.palet[k_x][k_y];
    }
  }
  return new Color();
}

Plot.prototype.clear = function(){
  this.ctx.clearRect(0, 0, this.w, this.h);
  return this;
}

Plot.prototype.setText = function(text, x, y){
  text = text || '';
  if(x == undefined){
    x = this.w / 2;
  }
  if(y == undefined){
    y = this.h / 2;
  }
  this.ctx.fillText(text, x, y);

  this.ctx.textAlign    = "center";
  this.ctx.textBaseline = "center";
  this.ctx.fillStyle    = new Color().toString();
  return this;
}

Plot.prototype.__draw_axis__ = function(){
  var l_x = (this.par_max.r - this.par_min.r) || 1,
      l_y = (this.fun_max.r - this.fun_min.r) || 1,
      scale_x = this.w / l_x,
      scale_y = this.h / l_y,
      zero_x = this.par_max.r >= 0 && this.par_min.r <= 0,
      zero_y = this.fun_max.r >= 0 && this.fun_min.r <= 0,
      color = new Color(255,0,0).toString(),
      x, y,
      dt = 5;

  this.ctx.beginPath();
  this.ctx.strokeStyle = color;

  x = this.border;
  x += (zero_x ?(-this.par_min.r * scale_x) :0);
  y = this.border;
  this.ctx.moveTo(x, y);
  this.ctx.textAlign    = "left";
  this.ctx.textBaseline = "top";
  this.ctx.fillStyle = color;
  this.setText(this.fun_max.r, x+dt, y);
  y += this.h;
  this.ctx.lineTo(x, y);
  this.ctx.textAlign    = "left";
  this.ctx.textBaseline = "bottom";
  this.ctx.fillStyle = color;
  this.setText(this.fun_min.r, x+dt, y);

  x = this.border;
  y -= (zero_y ?(-this.fun_min.r * scale_y) :0);
  this.ctx.moveTo(x, y);
  this.ctx.textAlign    = "left";
  this.ctx.textBaseline = "top";
  this.ctx.fillStyle = color;
  this.setText(this.par_min.r, x, y+dt);
  x += this.w;
  this.ctx.lineTo(x, y);
  this.ctx.textAlign    = "right";
  this.ctx.textBaseline = "top";
  this.ctx.fillStyle = color;
  this.setText(this.par_max.r, x, y+dt);


  this.ctx.stroke();

  return this;
}
Plot.prototype.__draw_palet__ = function(){
  var scale = this.w / (Object.keys(this.palet).length || 1),
      y = this.h + 2 * this.border,
      color = new Color(255,0,0).toString(),
      j = 0;
  for(var i in this.palet){
    x = this.border + scale * j;
    this.ctx.fillStyle = this.palet[i].toString();
    this.ctx.fillRect(x, y, scale, this.palet_height);
    j++;
  }
  y += this.palet_height;
  this.ctx.textAlign    = "left";
  this.ctx.textBaseline = "top";
  this.ctx.fillStyle = color;
  this.setText(this.fun_min.i, this.border, y);

  this.ctx.textAlign    = "right";
  this.ctx.textBaseline = "top";
  this.ctx.fillStyle = color;
  this.setText(this.fun_max.i, this.w+this.border, y);

  return this;
}

Plot.prototype.__draw_rr__ = function (){
  var l_x = (this.par_max.r - this.par_min.r) || 1,
      l_y = (this.fun_max.r - this.fun_min.r) || 1,
      scale_x = this.w / l_x,
      scale_y = this.h / l_y;

  this.ctx.beginPath();
  this.ctx.strokeStyle = new Color().toString();
  for(var i in this.par){
    var x = scale_x * (this.par[i].r - this.par_min.r),
        y = scale_y * (this.fun_max.r - this.fun_out[this.par[i]].r);
    x += this.border;
    y += this.border;
    if(i == 0){
      this.ctx.moveTo(x, y);
    }
    this.ctx.lineTo(x, y);
  }
  this.ctx.stroke();

  return this;
}
Plot.prototype.__draw_rc__ = function (){
  var l_x = (this.par_max.r - this.par_min.r) || 1,
      l_y = (this.fun_max.r - this.fun_min.r) || 1,
      scale_x = this.w / l_x,
      scale_y = this.h / l_y;
  this.__create_palet__(0, 'i');

  var last_x, last_y;
  for(var i in this.par){
    var x = scale_x * (this.par[i].r - this.par_min.r),
        y = scale_y * (this.fun_max.r - this.fun_out[this.par[i]].r);
    x += this.border;
    y += this.border;
    if(i == 0){
      last_x = x;
      last_y = y;
    }
    this.ctx.beginPath();
    this.ctx.moveTo(last_x, last_y);
    this.ctx.strokeStyle = this.__get_color__(this.fun_out[this.par[i]], 0, 'i').toString();
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    last_x = x;
    last_y = y;
  }

  this.__draw_palet__();
  return this;
}
/*
Plot.prototype.__draw_cr__ = function (){
  var l_x = this.par_max.r - this.par_min.r,
      l_y = this.par_max.i - this.par_min.i,
      scale_x = this.w / l_x,
      scale_y = this.h / l_y,
      scale = (scale_x < scale_y?scale_y :scale_y),
      ctx = this.ctx,
      draw_cell = function (x, y, color){
        ctx.fillStyle = color.toString();
        ctx.fillRect(scale_x * x, scale_y * y, scale_x, scale_y);
      };
  this.__create_palet__(0, 'r');

  for(var i in this.par){
    for(var j in this.par){
      var x = this.par[j].r + this.border,
          y = this.par[i].i + this.border;
      var val = new Complex(this.par[j].r, this.par[i].i);
      draw_cell(x, y, this.__get_color__(this.fun_out[val], 0, 'r'));
    }
  }

  return this;
}
Plot.prototype.__draw_cc__ = function (){
  var l_x = this.par_max.r - this.par_min.r,
      l_y = this.par_max.i - this.par_min.i,
      scale_x = this.w / l_x,
      scale_y = this.h / l_y,
      scale = (scale_x < scale_y?scale_y :scale_y),
      ctx = this.ctx,
      draw_cell = function (x, y, color){
        ctx.fillStyle = color.toString();
        ctx.fillRect(scale_x * x, scale_y * y, scale_x, scale_y);
      };
  this.__create_palet__(1);

  for(var i in this.par){
    for(var j in this.par){
      var x = this.par[j].r + this.border,
          y = this.par[i].i + this.border;
      var val = new Complex(this.par[j].r, this.par[i].i);
      draw_cell(x, y, this.__get_color__(this.fun_out[val], 1));
    }
  }

  return this;
}
*/
Plot.prototype.draw = function (attr){
  if(this.par == undefined || this.fun == undefined){
    return false;
  }

  attr = attr || {}
  if(attr.w){
    this.setWidth(attr.w);
  }
  if(attr.h){
    this.setHeight(attr.h);
  }

  this.clear().setText("Draw error.");
  if(this.par_isReal){
    this.__setFunctionOut__(0).clear().__draw_axis__();
    if(this.fun_isReal){
      this.__draw_rr__();
    }
    else{
      this.__draw_rc__();
    }
  }
  else{
    this.clear();
    this.setText("X must be real.");
  }
/*   else{
    this.__setFunctionOut__(1);
    if(this.fun_isReal){
      this.__draw_cr__();
    }
    else{
      this.__draw_cc__();
    }
  } */
  return this;
}