

 var aqiMap = L.map('liveMapPm25').setView([53.83029146974107, 9.957592944564151], 5);

L.tileLayer('https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}@2x.png?key=eGeFyLanxor3Gycw7nWl', {
    maxZoom: 18,
    attribution: 'Background Map: <a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a> <br> Air quality map & Pm2.5 readings: <a href="https://aqicn.org" target="_blank">&copy; Aqicn</a>  <a href="https://aqicn.org/sources/" target="_blank">&copy; Aqicn sources</a> '
}).addTo(aqiMap);

L.tileLayer('https://tiles.aqicn.org/tiles/usepa-pm25/{z}/{x}/{y}.png?token=7ae348689f53550f5ea766916006bf882b79cbc4', {
    maxZoom: 18,
}).addTo(aqiMap);