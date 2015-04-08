var Plot = function (el, attr){
  if(typeof el == 'string'){
    el = document.getElementById(el);
  }
  el.innerHTML =
    '<canvas>Ваш браузер не поддерживает canvas.</canvas>';
  ctx = el.getElementsByTagName('canvas')[0];

  this.plot = {
    w: 150,
    h: 150,
    padding: 20,
    el:  ctx,
    ctx: ctx.getContext('2d'),
    indent: {
      x: 20,
      y: 20
    }
  };

  this.vals = {
    min: undefined,
    max: undefined,
    elements: {},
  };

  this.x = {
    min: undefined,
    max: undefined,
    count: 0
  };

  this.y = {
    min: undefined,
    max: undefined,
    count: 0
  };

  this.point = {
    size: 1
  };

  this.palet = {
    place:  'bottom',
    size:   35,
    margin: 20,
    palet: []
  }

  this.set_attr(attr);
}

Plot.prototype._pointSizeDefined = function (){
  var ps_x = this.plot.w / this.x.count,
      ps_y = this.plot.h / this.y.count,
      ps_mf;
  this.point.size = (ps_x > ps_y ?ps_y :ps_x);
  ps_mf = Math.floor(this.point.size);
  if(ps_mf != this.point.size){
    this.point.size = ps_mf + 1;
  }

  this.plot.w = this.x.count * this.point.size;
  this.plot.h = this.y.count * this.point.size;

  return this;
}

Plot.prototype._plotSizesDefined = function (){
  this.plot.el.width  = this.plot.w + this.plot.padding * 2;
  this.plot.el.height = this.plot.h + this.plot.padding * 2;
  this.plot.indent.x  = this.plot.padding;
  this.plot.indent.y  = this.plot.padding;
  var plot_par = '',
      indent_par = '';
  switch(this.palet.place){
    case 'left':
      indent_par = 'x';
    case 'right':
      plot_par = 'width';
      break;
    case 'top':
      indent_par = 'y';
    case 'bottom':
      plot_par = 'height';
      break;
  }
  if(plot_par){
    this.plot.el[plot_par] += this.palet.size + this.palet.margin;
  }
  if(indent_par){
    this.plot.indent[indent_par] += this.palet.size + this.palet.margin;
  }

  return this;
}
Plot.prototype._plotDrawPoint = function (x, y, val){
  var coor_x    = this.plot.indent.x + this.point.size * x,
      coor_y    = this.plot.indent.y + this.point.size * y,
      width     = this.point.size,
      height    = this.point.size;

  this.plot.ctx.fillStyle = this._plotGetColor(val);
  this.plot.ctx.fillRect(coor_x, coor_y, width, height);

  return this;
};
Plot.prototype._paletSetPalet = function (){
  var start_color  = new Color(5, 0, 50),
      colors_count = 15,
      color_step   = 255 / colors_count ;
      val_step     = (this.vals.max - this.vals.min) / (colors_count - 1),
      transition   = 'lighten';
  this.palet.palet = [];


  for(var i = 0; i < colors_count; i ++){
    this.palet.palet.push({
      color: start_color.clone(),
      val: this.vals.min + i * val_step
    });

    start_color[transition](color_step);
    if(i > 0 && i % 4 === 0){
      start_color.contrast();
      transition = transition == 'lighten' ?'blur' :'lighten';
    }
  }

  return this;
}
Plot.prototype._plotDrawPalet = function (){
  var indent = {
      x: 0,
      y: 0
    },
      side = true, // |
      size = 0;
  if(this.palet.place != 'hidden'){
    switch(this.palet.place){
      case 'right':
        indent.x = this.plot.w + this.palet.margin;
      case 'left':
        size = Math.floor(this.plot.w / this.palet.palet.length) + 1;
        indent.x += this.plot.padding;
        indent.y = this.plot.padding + this.plot.h;
        break;
      case 'bottom':
        indent.y = this.plot.h + this.palet.margin;
      case 'top':
        side = false; // -
        size = Math.floor(this.plot.h / this.palet.palet.length) + 1;
        indent.y += this.plot.padding;
        indent.x = this.plot.padding;
        break;
    }

    for(var i = 0; i < this.palet.palet.length; i ++){
      this.plot.ctx.fillStyle = this.palet.palet[i].color.toString();
      if(side){
        this.plot.ctx.fillRect(indent.x, indent.y - size * (i + 1), this.palet.size, size);
      }
      else{
        this.plot.ctx.fillRect(indent.x + size * i, indent.y, size, this.palet.size);
      }
    }
  }

  return this;
};
Plot.prototype._plotGetColor  = function (val){
  var choose;
  for(var i = 0; i < this.palet.palet.length; i ++){
    if(choose == undefined || val >= this.palet.palet[i].val){
      choose = this.palet.palet[i].color;
    }
  }
  return choose.toString();
};
Plot.prototype._plotClearPlot = function(){
  var indent = 2 * this.plot.padding + this.palet.size + this.palet.margin;
  this.plot.ctx.fillStyle = '#FFFFFF';
  this.plot.ctx.clearRect(0, 0, this.plot.w + indent, this.plot.h + indent);
  return this;
}

Plot.prototype.set_values = function (vals){
  this.vals.elements = vals;
  this.y.count = vals.length;
  this.x.count = vals[0].length;

  this.vals.min = undefined;
  this.vals.max = undefined;
  for(var i = 0; i < this.y.count; i ++){
    for(var j = 0; j < this.x.count; j ++){
      if(this.vals.max == undefined || this.vals.elements[i][j].value > this.vals.max){
        this.vals.max = this.vals.elements[i][j].value;
      }
      if(this.vals.min == undefined || this.vals.elements[i][j].value < this.vals.min){
        this.vals.min = this.vals.elements[i][j].value;
      }
    }

    first = false;
  }

  this._pointSizeDefined();

  return this;
}

Plot.prototype.set_attr = function (attr){
  attr = attr || {};

  if(attr.plot_padding !== undefined){ this.plot.padding = attr.plot_padding; }
  if(attr.plot_width   !== undefined){ this.plot.w       = attr.plot_width; }
  if(attr.plot_height  !== undefined){ this.plot.h       = attr.plot_height; }

  if(attr.palet_place  !== undefined){ this.palet.place  = attr.palet_place; }
  if(attr.palet_size   !== undefined){ this.palet.size   = attr.palet_size; }
  if(attr.palet_margin !== undefined){ this.palet.margin = attr.palet_margin; }

  return this;
}

Plot.prototype.draw = function (){
  this._plotSizesDefined()
      ._plotClearPlot()
      ._paletSetPalet()
      ._plotDrawPalet();

  for(var i in this.vals.elements){
    for(var j in this.vals.elements[i]){
      this._plotDrawPoint(j, i, this.vals.elements[i][j].value);
    }
  }

  var plot = this;
  this.plot.el.onclick = function(e){
    var offsetX = e.offsetX < 0 ?0 :Math.floor(e.offsetX / plot.point.size),
        offsetY = e.offsetY < 0 ?0 :Math.floor(e.offsetY / plot.point.size),
        val     = undefined,
        search  = '';
    if(plot.vals.elements[offsetY] && plot.vals.elements[offsetY][offsetX] !== undefined){
      val = plot.vals.elements[offsetY][offsetX];
    }

    search +=
       'form-interval-input-start=0' +
      '&form-interval-input-end=10'  +
      '&form-xi-input='    + val.xi.toString() +
      '&form-alpha-input=' + val.a.toString();

    window.open('./course-work/index.html?'+search, val.xi.toString() + 'x' + val.a.toString());

    return false;
  }

  return this;
}