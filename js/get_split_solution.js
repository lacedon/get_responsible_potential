function breakup_value(a, xi, step_count, split_values){
  // Значения по умолчанию
  split_values = split_values || {};

  // Переменные функции
  var xi_r_step,                  // Размер шага по вещественной части xi
      xi_r_itr,                   // Счетчик по вещественной части xi
      xi_i_step,                  // Размер шага по мнимой части xi
      xi_i_itr,                   // Счетчик по мнимой части xi

      a_key,                      // Строковое представление a

      potential,                  // Значение потенциала

      cell_size            = 1,   // Размер клетки по x 
      cell_partition_count = 50,  // Кол-во точек, на которые делится клетка

      x_step,                     // Размер шага по x
      x_itr,                      // Счетчик по x
      x_str,                      // Начало отрезка по x
      x_end,                      // Конец отрезка по x

      comparison_count     = 2,   // Количесво клеток, которые нужно сравнить
      comparisons          = [],  // Элементы, котрые необходимо сравнивать
      c_itr,                      // Счетчик по comparisons

      max_iteration_count  = 10,  // Максимальное кол-во итерация сравнения
      comparisons_itr      = 0,   // Глобальный счетчик кол-ва сравнений
      comparisons_break;          // Переключатель, заканчивающий сравнения

  // Дополнительная обработка данных
  a = a[0];
  a_key = a.toString();

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

  split_values[a_key]             = split_values[a_key]             || {};
  split_values[a_key][step_count] = split_values[a_key][step_count] || {};

  x_step = cell_size / (cell_partition_count - 1);

  // Заполнение значений
  for(xi_r_itr = xi[0].r; xi_r_itr <= xi[1].r; xi_r_itr += xi_r_step){
    split_values[a_key][step_count][xi_r_itr] = split_values[a_key][step_count][xi_r_itr] || {};
    for(xi_i_itr = xi[0].i; xi_i_itr <= xi[1].i; xi_i_itr += xi_i_step){
      if(split_values[a_key][step_count][xi_r_itr][xi_i_itr] === undefined){
        split_values[a_key][step_count][xi_r_itr][xi_i_itr] = get_spectral_data(a, new Complex(xi_r_itr, xi_i_itr));

        split_values[a_key][step_count][xi_r_itr][xi_i_itr].max = {
          value:      undefined,
          coordinate: undefined
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
                potential = get_potential(x_itr, split_values[a_key][step_count][xi_r_itr][xi_i_itr].k, split_values[a_key][step_count][xi_r_itr][xi_i_itr].m);
                // potential = potential ?Math.abs(potential) :0;
                potential = Math.abs(potential.r);
                if(comparisons[c_itr] === undefined || comparisons[c_itr].value < potential){
                  comparisons[c_itr] = {
                    value: potential,
                    coordinate: x_itr
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
        split_values[a_key][step_count][xi_r_itr][xi_i_itr].max = comparisons[0];

      }
    }
  }

  return split_values;
}