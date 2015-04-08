var k = {},
    m = {};

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

    if(k[value.a[0]] == undefined){
      k[value.a[0]] = {};
    }
    if(m[value.a[0]] == undefined){
      m[value.a[0]] = {};
    }

    if(
      k[value.a[0]][value.x[0]] == undefined || 
      m[value.a[0]][value.x[0]] == undefined
    ){
      var spectral_data = get_spectral_data(value.a[0], value.x[0]);
      k[value.a[0]][value.x[0]] = spectral_data.k;
      m[value.a[0]][value.x[0]] = spectral_data.m;
    }

    var x = [
      Number(document.getElementById('form-interval-input-start').value),
      Number(document.getElementById('form-interval-input-end').value)
    ].sort(),
    n = Number(document.getElementById('form-step-input').value);
    step = (x[1] - x[0]) / (n || 1000),
    p = [],
    c = new Plot('print_field', {w:600, h:350});
    for(var i = 0, x = x[0]; i <= n; i += 1, x += step){
      p.push(new Complex(x));
    }

    console.log('> k: ', k[value.a[0]][value.x[0]][0].toString(), ', ', k[value.a[0]][value.x[0]][1].toString());
    console.log('> m: ', m[value.a[0]][value.x[0]][0].toString(), ', ', m[value.a[0]][value.x[0]][1].toString());
    c.setParametr(p).setFunction(function(x){
      return get_potential(x, k[value.a[0]][value.x[0]], m[value.a[0]][value.x[0]]);
    }).draw();
    document.getElementById('print_field').style.display = 'block';
    console.log(c);
  }
};