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

function breakup_value(alp, xi, step_count, split_values, key, getPotential){
  // Значения по умолчанию
  split_values = split_values || {};

  // Переменные функции
  var xi_r_step,                  // Размер шага по вещественной части xi
      xi_r_itr,                   // Счетчик по вещественной части xi
      xi_i_step,                  // Размер шага по мнимой части xi
      xi_i_itr,                   // Счетчик по мнимой части xi

      potential,                  // Значение потенциала

      cell_size            = 1,   // Размер клетки по x 
      cell_partition_count,       // Кол-во точек, на которые делится клетка

      x_step,                     // Размер шага по x
      x_itr,                      // Счетчик по x
      x_str,                      // Начало отрезка по x
      x_end,                      // Конец отрезка по x

      comparison_count     = 2,   // Количесво клеток, которые нужно сравнить
      comparisons          = [],  // Элементы, котрые необходимо сравнивать
      c_itr,                      // Счетчик по comparisons

      max_iteration_count  = 5,  // Максимальное кол-во итерация сравнения
      comparisons_itr      = 0,   // Глобальный счетчик кол-ва сравнений
      comparisons_break;          // Переключатель, заканчивающий сравнения

  // Дополнительная обработка данных
  alp = alp[0];
  key = key || (alp + 'x' + xi[0] + 'x' + xi[1]);

  if(xi[0].r > xi[1].r){
    xi[0].r = xi[0].r + xi[1].r;
    xi[1].r = xi[0].r - xi[1].r;
    xi[0].r = xi[0].r - xi[1].r;
  }
  if(xi[0].i > xi[1].i){
    xi[0].i = xi[0].i + xi[1].i;
    xi[1].i = xi[0].i - xi[1].i;
    xi[0].i = xi[0].i - xi[1].i;
  }
  xi_r_step = (xi[1].r - xi[0].r) / (step_count - 1);
  xi_i_step = (xi[1].i - xi[0].i) / (step_count - 1);

  split_values[step_count]      = split_values[step_count]      || {};
  split_values[step_count][key] = split_values[step_count][key] || {};

  cell_partition_count = 10;//step_count / 10;

  x_step = cell_size / (cell_partition_count - 1);

  // Заполнение значений
  for(xi_r_itr = xi[0].r; xi_r_itr <= xi[1].r; xi_r_itr += xi_r_step){
    split_values[step_count][key][xi_r_itr] = split_values[step_count][key][xi_r_itr] || {};
    for(xi_i_itr = xi[0].i; xi_i_itr <= xi[1].i; xi_i_itr += xi_i_step){
      if(split_values[step_count][key][xi_r_itr][xi_i_itr] === undefined){
        split_values[step_count][key][xi_r_itr][xi_i_itr] = {
          max: {}
        };

        comparisons = [];
        for(c_itr = 0; c_itr < comparison_count; c_itr++){
          comparisons.push(undefined);
        }

        comparisons_itr = 0;
        while(max_iteration_count === 0 || comparisons_itr < max_iteration_count){
          for(c_itr = 0; c_itr < comparison_count; c_itr++){
            if(comparisons[c_itr] === undefined){
              x_str = cell_size * comparisons_itr;
              x_end = x_str + cell_size;
              for(x_itr = x_str; x_itr < x_end; x_itr += x_step){
                potential = getPotential(x_itr, new Complex(xi_r_itr, xi_i_itr), alp);

                if(comparisons[c_itr] === undefined || potential > comparisons[c_itr].value){
                  comparisons[c_itr] = {
                    value:      potential,
                    coordinate: x_itr,
                    alp:        alp,
                    xi:         new Complex(xi_r_itr, xi_i_itr)
                  };
                }
              }
            }
          }

          comparisons_break = true;
          for(c_itr = 1; c_itr < comparison_count; c_itr++){
            comparisons_break = comparisons_break && comparisons[0].value > comparisons[c_itr].value;
          }
          if(comparisons_break){
            break;
          }

          comparisons_itr++;
          comparisons.shift();
          comparisons.push(undefined);
        }
        split_values[step_count][key][xi_r_itr][xi_i_itr].max = comparisons[0];
      }
    }
  }

  return split_values;
}

function improperIntegral(fun, a){
  var max_n = 25,
      i = 0,
      step = 1,
      b = a + step,
      I,
      eps = Math.pow(10, -5);

  do{
    I = ownIntegral(fun, a, b);
    b *= 2;
    i++;
  }while(Comp.abs(I) >= eps && i < max_n);

  return I;
}
function ownIntegral(fun, a, b){
  var n = 100,
      h = (b - a) / n,
      s = 0,
      x = a;

  for(var i = 0; i < n; i++){
    x += h;

    s = Comp['+'](s, fun(x));
  }
  s = Comp['*'](s, h);

  return s;
}

function L(x, y){
  var n = 100,
      a = 0,
      b = x,
      h = (b - a) / n,

      xj = a + h /2,
      xk,

      Ff = function (x, y){ return Math.pow(x, 2) * y; },
      Lf = function (x, y){ return - 4 * Math.pow(x, 2) * y / (4 + Math.pow(x, 4)); },

      A = [],
      B = [],
      L;

  for(var j = 0; j < n; j++){
    A.push([]);
    B.push( - Ff(x, xj));

    xk = a + h /2;
    for(var k = 0; k < n; k++){
      A[j].push(
        Number(k == j) + h * Ff(xk, xj)
      );

      xk += h;
    }

    xj += h;
  }

  L = solution_of_lae(A, B);

  var s = - Ff(x, y);
  xk = a + h /2;
  for(var k in L){
    L[k] = L[k].r;

    s -= h * Ff(xk, y) * L[k];

    xk += h;
  }

  console.log( s, Lf(x, y),  Math.abs(s - Lf(x, y)) );
}