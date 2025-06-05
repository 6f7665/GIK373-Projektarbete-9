//Grupp 9: Oscar Vestlund, Joel Sandbäck, Porsche Thichan
$ = function(id) {
  return document.getElementById(id);
}

var showPop = function(id) {
	$(id).style.display ='block';
}
var hidePop = function(id) {
	$(id).style.display ='none';
}
