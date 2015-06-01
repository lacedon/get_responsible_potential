var Levitan = {
  _cash: {
    get_potential: {},
  },
  _data: {}
};

Levitan._get_F = function (x, y, ln, ls){
  this._cash.F = this._cash.F || {}
  var key = x.toString() + y.toString() + ls.toString() + ln.toString();

  if(this._cash.F[key] === undefined){
    var F = 0,
        f,
        xmy = Math.abs(x - y),
        xpy = x + y,
        C_i = new Complex(0, 1);

    f = function(z){
      /*
        var pk  = Comp['*'](ln[i], C_i)
            pki = Comp['*'](pk, C_i),
            l = Comp['*'](  2, pki),
            e = Comp['*'](- z, pki);

        return Comp['/'](Comp.exp(e), l);
      */
      var s = 0;

        s = Comp['+'](
          Comp['*'](
            Comp.exp( Comp['*']( ln[0], z) ),
            Comp['/'](
              ls[0],
              Comp['*'](2, ln[0])
            )
          ),
          Comp['*'](
            Comp.exp( Comp['*']( ln[1], z) ),
            Comp['/'](
              ls[1],
              Comp['*'](2, ln[1])
            )
          )
        ).negative();

      return s;
    }

    this._cash.F[key] = Comp['-']( f(xmy), f(xpy) );

    if(this._cash.F[key].isReal() || Math.abs(this._cash.F[key].i) < Math.pow(10, 0)){
      this._cash.F[key] = this._cash.F[key].r;
    }
    else{
      console.log(key, this._cash.F[key]);
      throw new Error('F должна быть вещественной.');
    }
  }

  return this._cash.F[key];
}
Levitan._get_L = function (x, y, ln, ls){
  this._cash.L = this._cash.L || {}
  var key = x.toString() + y.toString() + ls.toString() + ln.toString();

  if(this._cash.L[key] === undefined){
    var n = 50,
        a = 0,
        b = x,
        h = (b - a) / n,
        hd2 = h /2,

        xj, xk,

        A = [],
        B = [],
        L;
    a += hd2;

    xj = a;
    for(var j = 0; j < n; j++){
      A.push([]);
      B.push( - this._get_F(b, xj, ln, ls));

      xk = a;
      for(var k = 0; k < n; k++){
        A[j].push(
          Number(k == j) + h * this._get_F(xk, xj, ln, ls)
        );

        xk += h;
      }

      xj += h;
    }

    L = solution_of_lae(A, B);

    this._cash.L[key] = - this._get_F(x, y, ln, ls);
    xk = a;
    for(var k in L){
      L[k] = L[k].r;

      this._cash.L[key] -= h * this._get_F(xk, y, ln, ls) * L[k];

      xk += h;
    }
  }

  return this._cash.L[key];
}
Levitan._get_spectral_data = function(xi, alp, dataKey){
  var ln = [xi,  xi.conjugate()],
      ls = [alp, alp.conjugate()];
  /*
  ln = [new Complex(-0.5), new Complex(-3.5)];
  ls = [new Complex(2), new Complex(1)];
  */

  this._data[dataKey] = {
    ln: ln,
    ls: ls
  }

  return this._data[dataKey];
}

Levitan.get_potential = function(x, xi, alp, dx){
  x = Number(x);
  dx = dx || 0.0001;

  var dataKey = alp.toString() + ';' + xi.toString(),
      cashKey = x.toString() + dataKey + dx.toString();

  if(this._cash.get_potential[cashKey] === undefined){
    if(this._data[dataKey] == undefined){
      this._get_spectral_data(xi, alp, dataKey);
    }

    var ln  = this._data[dataKey].ln,
        ls  = this._data[dataKey].ls,
        xmd = x + dx,
        dL = this._get_L(x,   x,   ln, ls) -
             this._get_L(xmd, xmd, ln, ls);
    
    this._cash.get_potential[cashKey] = - 2 * dL / dx;
  }

  return this._cash.get_potential[cashKey];
}