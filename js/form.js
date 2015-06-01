window.onload = function (){
  set_default_values();

  var split_values = {};
  document.getElementById('form-button').onclick = function (){
    var
      elements = {
        a: document.getElementById('form-alpha'),
        x: document.getElementById('form-xi')
      },
      value = {
        a: [
          document.getElementById('form-alpha-input').value
        ],
        x: [
          document.getElementById('form-xi-input-start').value,
          document.getElementById('form-xi-input-end')  .value
        ]
      },
      exit = false,

      n = Number(document.getElementById('form-step-input').value) || 100,
      key,

      plot_id = 'print_field',

      spectral_data;

    for(var i in value){
      if(value[i]){
        removeClass(elements[i], 'error');
        for(var j in value[i]){
          value[i][j] = new Complex(value[i][j]);
        }
      }
      else{
        addClass(elements[i], 'error');
        exit = true;
      }
    }
    if(exit){
      return;
    }

    key = value.a[0] + 'x' + value.x[0] + 'x' + value.x[1];

    function getPotentialByLevitan(x, xi, alp, dx){
      return Math.abs(Levitan.get_potential(x, xi, alp, dx));
    }
    function getPotentialByMarchenko(x, xi, alp, dx){
      return Math.abs(Marchenko.get_potential(x, xi, alp, dx));
    }
    breakup_value(
      value.a,
      value.x,
      n,
      split_values,
      key,
      getPotentialByMarchenko
    );
    console.log('split_values', split_values);

    function createMatrix(split_values){
      var out = [], itr, obj;
      for(var r in split_values){
        itr = 0;
        for(var i in split_values[r]){
          if(out[itr] === undefined){
            out.push([]);
          }
          obj = {
            value:  split_values[r][i].max.value,
            q:      split_values[r][i].max.value,
            x:      split_values[r][i].max.coordinate,
            alp:    split_values[r][i].max.alp,
            xi:     split_values[r][i].max.xi
          };

          out[itr].push(obj);
          itr ++;
        }
      }
      out.reverse();
      return out;
    }

    spectral_data = Marchenko._get_spectral_data(value.x[0], value.a[0]);
    console.log('spectral_data', spectral_data);

    document.getElementById('print_field').style.display = 'block';
    var plot = new Plot(document.getElementById('print_field'), {
      plot_padding: 0,
      palet_place: 'right',
      maxDiff: 2 * (spectral_data.ls[0].r + spectral_data.ls[1].r)
    });
    plot.set_values(createMatrix(split_values[n][key])).draw();
    console.log('plot', plot);
  }
};