var Complex = function (x, y){
  if(typeof x == 'string' && y == undefined){
    var p = this.parseString(x);
    x = p[0];
    y = p[1];
  }
  this.r = Number(x) || 0;
  this.i = Number(y) || 0;
};

Complex.prototype.toString = function (){
  var out   = '',
      has_r = this.r != 0,
      has_i = this.i != 0;
  if(!(has_r || has_i)){
    return '0';
  }
  if(has_r){
    out += this.r;
  }
  if(has_i){
    if(has_r && this.i > 0){
      out += '+';
    }
    if(this.i != 1){
      if(this.i == -1){
        out += '-';
      }
      else{
        out += this.i;
      }
    }
    out += 'i';
  }
  return out;
};

Complex.prototype.parseString = function(x){
  x = String(x) || '';
  var r = 0,
      i = 0,
      search,
      last_sign = /([-+][0-9.,i]+$)/,
      parse_i = function(i){
        if(i[0] == '+'){//убираем + в начале
          i = i.substring(1);
        }
        switch(i){
          case  'i': return  1;
          case '-i': return -1;
          default  : return i;
        }
      };

  if(x[x.length-1] != 'i'){//есть только действительная часть
    r = x;
  }
  else{
    search = x.search(last_sign);
    if(search == 0 || search == -1){//есть только мнимая часть
      i = parse_i(x);
    }
    else{//есть обе части
      r = x.split(last_sign);

      i = parse_i(r[1]);
      r = r[0];
    }
  }
  return [parseFloat(r), parseFloat(i)];
};

Complex.prototype.equals = function (x){
  if(typeof x == 'number'){
    x = new Complex(x);
  }
  return this.r == x.r && this.i == x.i;
}

Number.prototype.isReal = function (){
  return true;
}
Complex.prototype.isReal = function (){
  return this.i == 0;
}

Complex.prototype.conjugate = function(){
  return new Complex(this.r, -this.i);
}
Complex.prototype.isConjugate = function(x){
  if(typeof x == 'number'){
    x = new Complex(x);
  }
  return this.r == x.r && this.i == -x.i;
}

Complex.prototype.abs = function(){
  return Math.pow(Math.pow(this.r, 2) + Math.pow(this.i, 2), 0.5);
}

Complex.prototype.add = function (x){
  if(typeof x == 'number'){
    return new Complex(this.r + x, this.i);
  }
  return new Complex(this.r + x.r, this.i + x.i);
};
Complex.prototype.minus = function (x){
  if(typeof x == 'number'){
    return new Complex(this.r - x, this.i);
  }
  return new Complex(this.r - x.r, this.i - x.i);
};
Complex.prototype.mul = function (x){
  if(typeof x == 'number'){
    return new Complex(this.r * x, this.i * x);
  }
  return new Complex(this.r * x.r - this.i * x.i, this.r * x.i + this.i * x.r);
};
Complex.prototype.div = function (x){
  if(typeof x == 'number'){
    return new Complex(this.r / x, this.i / x);
  }

  var r = this.r * x.r + this.i * x.i,
      i = this.i * x.r - this.r * x.i,
      d = Math.pow(x.r, 2) + Math.pow(x.i, 2);
  return new Complex(r / d, i / d);
};
Complex.prototype.pow = function (n){
  n = n || 0;

  if(n == 0){
    return new Complex(1);
  }

  if(this.isReal()){
    var r = Math.pow(this.r, n);
    if(!isNaN(r)){
      return new Complex(r);
    }
  }

  if(!(n%1)){//если n - целое
    var s = new Complex(1),
        op = ((n < 0)?'div':'mul');
    n = Math.abs(n);
    for(var i = 0; i < n; i++){
      s = s[op](this);
    }
    return s;
  }
  else{//если n - дробное
    var r = this.abs(),
        u = Math.acos(this.r / r),
        i;
    r = Math.pow(r, n);

    i = r * Math.sin(n * u);
    if(this.i < 0){
      i = -i;
    }
    return new Complex(r * Math.cos(n * u), i);
  }
};
Complex.prototype.exp = function (){
  var e = Math.exp(this.r);
  return new Complex(e * Math.cos(this.i), e * Math.sin(this.i));
}

Complex.prototype.negative = function (){
  return new Complex(-this.r, -this.i);
}

var Comp = {
  '+':   function(x, y){ if(typeof x == 'number'){x = new Complex(x);} if(typeof y == 'number'){y = new Complex(y);} return x.add(y);       },
  '-':   function(x, y){ if(typeof x == 'number'){x = new Complex(x);} if(typeof y == 'number'){y = new Complex(y);} return x.minus(y);     },
  '*':   function(x, y){ if(typeof x == 'number'){x = new Complex(x);} if(typeof y == 'number'){y = new Complex(y);} return x.mul(y);       },
  '/':   function(x, y){ if(typeof x == 'number'){x = new Complex(x);} if(typeof y == 'number'){y = new Complex(y);} return x.div(y);       },
  '==':  function(x, y){ if(typeof x == 'number'){x = new Complex(x);} if(typeof y == 'number'){y = new Complex(y);} return x.equals(y);    },
  'pow': function(x, n){ if(typeof x == 'number'){x = new Complex(x);} if(typeof y == 'number'){y = new Complex(y);} return x.pow(n);       },
  'exp': function(x){    if(typeof x == 'number'){x = new Complex(x);} if(typeof y == 'number'){y = new Complex(y);} return x.exp();        },
  'neg': function(x){    if(typeof x == 'number'){x = new Complex(x);} if(typeof y == 'number'){y = new Complex(y);} return x.negative();   },
  'con': function(x){    if(typeof x == 'number'){x = new Complex(x);} if(typeof y == 'number'){y = new Complex(y);} return x.conjugate();  },
  'abs': function(x){    if(typeof x == 'number'){x = new Complex(x);} if(typeof y == 'number'){y = new Complex(y);} return x.abs();        }
};