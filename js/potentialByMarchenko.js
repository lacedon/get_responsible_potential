var Marchenko = {
  _cash: {
    get_potential: {},
  },
  _data: {}
};

Marchenko._get_k = function(ln, ls){
  var k = [],
      b, c, D,
      ln2 = [
        Comp.pow(ln[0], 2).negative(),
        Comp.pow(ln[1], 2).negative()
      ],
      lnn, lns, lsn,
      tmp;

  b = Comp['-'](
    Comp['+'](ln2[0], ln2[1]),
    Comp['+'](ls[0],  ls[1])
  );

  lnn = Comp['*'](ln2[0], ln2[1]);
  lns = Comp['*'](ln2[0], ls[1]);
  lsn = Comp['*'](ls[0], ln2[1]);
  c   = Comp['-'](lnn, Comp['+'](lns, lsn));

  D   = Comp.pow(Comp['-'](
    Comp.pow(b, 2),
    Comp['*'](4, c)
  ), 0.5);

  /*
    console.log([
      Comp['/'](
        Comp['+'](b, D),
        2
      ).toString(),
      Comp['/'](
        Comp['-'](b, D),
        2
      ).toString(),
    ]);
  */

  k.push( Comp.pow( Comp['/'](
    Comp['+'](b, D),
    2
  ).negative(), 0.5 ) );

  k.push( Comp.pow( Comp['/'](
    Comp['-'](b, D),
    2
  ).negative(), 0.5 ) );

  /*
    if(
      Comp.abs(Comp.pow(k[0], 2)) > Comp.abs(Comp.pow(k[1], 2))
    ){
      tmp  = k[1];
      k[1] = k[0];
      k[0] = tmp;
    }
  */

  return k;
}
Marchenko._get_m = function(ln, k){
  var m  = [];

  for(var i = 0; i < 2; i++){
    var x;
    m.push(0);

    m[i] = Comp['/'](Comp['+'](k[i], ln[i]),   Comp['-'](k[i], ln[i])  );

    x    = Comp['/'](Comp['+'](k[i], ln[1-i]), Comp['-'](k[i], ln[1-i]));
    m[i] = Comp['*'](m[i], x);

    x    = Comp['/'](Comp['+'](k[i], k[1-i]),  Comp['-'](k[i], k[1-i]) );
    m[i] = Comp['*'](m[i], x);

    m[i] = Comp['*'](m[i], Comp['*'](2, k[i]));
  }

  return m;
}
Marchenko._get_spectral_data = function(xi, alp, dataKey){
  var ln = [xi,  xi.conjugate()],
      ls = [alp, alp.conjugate()],
      spectral_data = {};
  /*
  ln = [new Complex(-0.5), new Complex(-3.5)];
  ls = [new Complex(2), new Complex(1)];
  */

  spectral_data = {
    ln: ln,
    ls: ls,
    k:  undefined,
    m:  undefined
  }

  if(dataKey !== undefined){
    spectral_data.k = this._get_k(ln, ls)
    spectral_data.m = this._get_m(ln, spectral_data.k);

    this._data[dataKey] = spectral_data;
  }

  return spectral_data;
}
Marchenko._get_A = function(x, y, k, m){
  var s = new Complex,
      N = 2,
      A = [], B = [], P;
  for(var i = 0; i < N; i ++){
    A.push([]);
    for(var j = 0; j < N; j ++){
      var p = Comp['+'](k[i], k[j]);
      A[i].push( Comp['/'](
        Comp['*'](
          m[i],
          Comp.exp(
            Comp['*'](p, x).negative()
          )
        ),
        p
      ) );
      if(i == j){
        A[i][j] = Comp['+'](A[i][j], 1);
      }
    }

    B.push( Comp['*'](
      m[i],
      Comp.exp(
        Comp['*'](k[i], x).negative()
      )
    ).negative() );
  }

  P = solution_of_lae(A, B);

  for(var i = 0; i < N; i ++){
    s = Comp['+'](
      s,
      Comp['*'](
        P[i],
        Comp.exp(
          Comp['*'](k[i], y).negative()
        )
      )
    );
  }

  if(Math.abs(s.i) < Math.pow(10, -5)){
    s.i = 0;
  }

  return s.r;
}

Marchenko.get_potential = function(x, xi, alp, dx){
  x = Number(x);
  dx = dx || 0.0001;

  var dataKey = alp.toString() + ';' + xi.toString(),
      cashKey = x.toString() + dataKey + dx.toString();

  if(this._cash.get_potential[cashKey] === undefined){
    var xmd = (x + dx),
        k, m, A, dA;

    if(this._data[dataKey] == undefined){
      this._get_spectral_data(xi, alp, dataKey);
    }
    k = this._data[dataKey].k;
    m = this._data[dataKey].m;

    if(Comp['=='](k[0].conjugate(), k[1])){
      this._cash.get_potential[cashKey] = 0;
    }
    else{
      dA = this._get_A(x,   x,   k, m) -
           this._get_A(xmd, xmd, k, m);

      this._cash.get_potential[cashKey] = 2 * dA / dx;
    }

    // this._cash.get_potential[cashKey] = - 2 * this._get_A(x, x, k, m);
  }

  return this._cash.get_potential[cashKey];
}