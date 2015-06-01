window.onload = function(){
  set_default_values();

  document.getElementById('form-button').onclick = function(){
    var
      elements = {
        a: document.getElementById('form-alpha'),
        x: document.getElementById('form-xi')
      },
      value = {
        a: elements.a.getElementsByTagName('input')[0].value,
        x: elements.x.getElementsByTagName('input')[0].value
      },
      exit = false;

    for(var i in value){
      if(value[i]){
        removeClass(elements[i], 'error');
        value[i] = value[i].split(', ');
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

    var x = [
      Number(document.getElementById('form-interval-input-start').value),
      Number(document.getElementById('form-interval-input-end').value)
    ].sort(),
        n = Number(document.getElementById('form-step-input').value) || 1000,
        step = (x[1] - x[0]) / n,
        p = [],
        plotM = new Plot('print_field-M', {w:600, h:350}),
        plotL = new Plot('print_field-L', {w:600, h:350});
    for(var i = 0, x = x[0]; i <= n; i += 1, x += step){
      p.push(new Complex(x));
    }

    setTimeout(function(){
      plotM.setParametr(p).setFunction(function(x){
        return Marchenko.get_potential(x, value.x[0], value.a[0], step);
      }).draw();
      document.getElementById('print_field-M').style.display = 'block';
      console.log('plotM', plotM);
    }, 0);

    /*
    setTimeout(function(){
      plotL.setParametr(p).setFunction(function(x){
        return Levitan.get_potential(x, value.x[0], value.a[0], step);
      }).draw();
      document.getElementById('print_field-L').style.display = 'block';
      console.log('plotL', plotL);


      var m;
      for(var i in plotL.fun_out){
        var e = Math.abs(
          plotL.fun_out[i].r -
          plotM.fun_out[i].r
        );
        if(m === undefined || e > m){
          m = e;
        }
      }
      console.log(m);
    }, 0);
    */

    console.log('###');
  }
};