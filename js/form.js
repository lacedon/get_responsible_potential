window.onload = function (){
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

      plot_id = 'print_field';

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

    split_values = breakup_value(value.a, value.x, n);
    console.log('split_values', split_values);

    function createMatrix(){
      var out = [],
          itr = 0;
      for(var r in split_values[value.a[0]][n]){
        out.push([]);
        for(var i in split_values[value.a[0]][n][r]){
          out[itr].push(split_values[value.a[0]][n][r][i].max.coordinate);
        }
        itr ++;
      }
      return out;
    }

    document.getElementById('print_field').style.display = 'block';
    var plot = new Plot(document.getElementById('print_field'), {
      plot_padding: 0,
      palet_place: 'right'
    });
    plot.set_values(createMatrix()).draw();
    console.log(plot);
  }
};