function set_default_values(){
  var default_values  = window.location.search;
  if(default_values !== ''){
    default_values = default_values.substr(1).split('&');
    for(var i in default_values){
      default_values[i] = default_values[i].split('=');
      var el = document.getElementById(default_values[i][0]);
      if(el){
        el.value = default_values[i][1];
      }
    }
  }
}