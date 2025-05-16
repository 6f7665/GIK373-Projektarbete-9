

 var mymap = L.map('liveMapPm25').setView([60.48535352815737, 15.43125126439487], 13);
    L.tileLayer('https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}@2x.png?key=eGeFyLanxor3Gycw7nWl', {
    maxZoom: 18,
    attribution: 'Map data: <a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
   
}).addTo(mymap);
 L.tileLayer('https://tiles.aqicn.org/tiles/usepa-pm25/{z}/{x}/{y}.png?token=7ae348689f53550f5ea766916006bf882b79cbc4', {
    maxZoom: 18,
    attribution: 'Air quality, PM 2.5 data: <a href="https://aqicn.org" target="_blank">&copy; Aqicn</a>',

}).addTo(mymap);
     