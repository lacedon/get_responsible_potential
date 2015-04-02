function get_k(ln, ls){
  var k = [],
      b, c,
      lnn, lns, lsn;
  ln = [ln[0].pow(2), ln[1].pow(2)];

  b = Comp['-'](Comp['+'](ln[0], ln[1]), Comp['+'](ls[0], ls[1]));
  b = Comp['/'](b, 2);

  lnn = Comp['*'](ln[0], ln[1]);
  lns = Comp['*'](ln[0], ls[1]);
  lsn = Comp['*'](ls[0], ln[1]);
  c   = Comp['-'](lnn, Comp['+'](lns, lsn));
  c   = Comp['-'](b.pow(2), c).pow(0.5);

  k.push(Comp['+'](b, c));
  k.push(Comp['-'](b, c));

  return [k[0].pow(0.5), k[1].pow(0.5)];
}
function get_m(ln, k){
  var m  = [],
      i  = new Complex(0, 1),
      ki =[Comp['*'](k[0], i), Comp['*'](k[1], i)];

  for(var i = 0; i < 2; i++){
    var x;
    m.push(0);

    m[i] = Comp['/'](Comp['+'](ki[i], ln[i]),   Comp['-'](ki[i], ln[i])  );

    x    = Comp['/'](Comp['+'](ki[i], ln[1-i]), Comp['-'](ki[i], ln[1-i]));
    m[i] = Comp['*'](m[i], x);

    x    = Comp['/'](Comp['+'](k[i], k[1-i]),  Comp['-'](k[i], k[1-i]) );
    m[i] = Comp['*'](m[i], x);

    m[i] = Comp['*'](m[i], Comp['*'](2, k[i]));
  }

  return m;
}

function get_spectral_data(a, x){
  var ln = [x, x.negative().conjugate()],
      ls = [a, a.conjugate()],
      k, m;
  //console.log([ln[0].toString(), ln[1].toString()], [ls[0].toString(), ls[1].toString()]);

  k = get_k(ln, ls);
  m = get_m(ln, k);

  return {
    k: k,
    m: m
  };
}

function get_potential(x, k, m){
  var s = new Complex,
      N = 2,
      A = [], B = [], P;

  for(var i = 0; i < N; i ++){
    A.push([]);
    for(var j = 0; j < N; j ++){
      var p = Comp['+'](k[i], k[j]);
      A[i].push(
        Comp['/'](Comp['*'](m[j], Comp.exp(Comp['*'](p, x).negative())), p)
      );
      if(i == j){
        A[i][j] = Comp['+'](A[i][j], 1);
      }
    }

    B.push(
      Comp['*'](m[i], Comp.exp(Comp['*'](k[i], x).negative())).negative()
    );
  }

  P = solution_of_lae(A, B);

  for(var i = 0; i < N; i ++){
    s = Comp['+'](s, Comp['*'](P[i], Comp.exp(Comp['*'](k[i], x).negative())));
  }

  s = Comp['*'](s, -2);

  if(Math.abs(s.i) < Math.pow(10, -5)){
    s.i = 0;
  }
  return s;
}

function solution_of_lae(A, B){
  var Y = [],
      n = A.length;
  for(var itr = 0; itr < n; itr++){
    Y.push(new Complex);

    var A_old = [];
    for(var i = 0; i < n; i++){
      A_old.push([]);
      for(var j = 0; j < n; j++){
        A_old[i].push(A[i][j]);
      }
    }

    for(var i = itr + 1; i < n; i++){
      for(var j = 0; j < n; j++){
        if(j > itr){
          A[i][j] = Comp['-'](A[i][j], Comp['*'](A_old[itr][j], Comp['/'](A_old[i][itr], A_old[itr][itr])));
        }
      }
      B[i] = Comp['-'](B[i], Comp['*'](B[itr], Comp['/'](A_old[i][itr], A_old[itr][itr])));
      A[i][itr] = new Complex;
    }
  }

  for(var z = 0; z < n; z++){
    i = n - z - 1;
    Y[i] = B[i];
    for(var j = i + 1; j < n; j++){
      Y[i] = Comp['-'](Y[i], Comp['*'](A[i][j], Y[j]));
    }
    Y[i] = Comp['/'](Y[i], A[i][i]);
  }

  return Y;
}
