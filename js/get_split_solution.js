function breakup_value(a, xi, step_count, split_values, key){
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

      max_iteration_count  = 2,  // Максимальное кол-во итерация сравнения
      comparisons_itr      = 0,   // Глобальный счетчик кол-ва сравнений
      comparisons_break;          // Переключатель, заканчивающий сравнения

  // Дополнительная обработка данных
  a = a[0];
  key = key || (a + 'x' + xi[0] + 'x' + xi[1]);

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

  split_values[step_count]      = split_values[step_count]        || {};
  split_values[step_count][key] = split_values[step_count][key] || {};

  cell_partition_count = 10;//step_count / 10;

  x_step = cell_size / (cell_partition_count - 1);
  console.log('get_split_solution.js', {
    x_str:  cell_size * comparisons_itr,
    x_end:  cell_size * comparisons_itr + cell_size,
    x_step: x_step,
    cell_size: cell_size,
    cell_partition_count: cell_partition_count,
    split_values: split_values,
  })

  // Заполнение значений
  for(xi_r_itr = xi[0].r; xi_r_itr <= xi[1].r; xi_r_itr += xi_r_step){
    split_values[step_count][key][xi_r_itr] = split_values[step_count][key][xi_r_itr] || {};
    for(xi_i_itr = xi[0].i; xi_i_itr <= xi[1].i; xi_i_itr += xi_i_step){
      if(split_values[step_count][key][xi_r_itr][xi_i_itr] === undefined){
        split_values[step_count][key][xi_r_itr][xi_i_itr] = get_spectral_data(a, new Complex(xi_r_itr, xi_i_itr));

        split_values[step_count][key][xi_r_itr][xi_i_itr].max = {};

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
                potential = get_potential(x_itr, split_values[step_count][key][xi_r_itr][xi_i_itr].k, split_values[step_count][key][xi_r_itr][xi_i_itr].m);
                // potential = potential ?Comp.abs(potential) :0;
                potential = potential.r;
                if(comparisons[c_itr] === undefined || potential > comparisons[c_itr].value){
                  comparisons[c_itr] = {
                    value:      potential,
                    coordinate: x_itr,
                    a:          a,
                    xi:         new Complex(xi_r_itr, xi_i_itr),
                    k:          split_values[step_count][key][xi_r_itr][xi_i_itr].k,
                    m:          split_values[step_count][key][xi_r_itr][xi_i_itr].m
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