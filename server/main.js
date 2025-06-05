// this file is the NodeJS file for relaying data from openmeteo
// Grupp 9: Oscar Vestlund, Joel Sandbäck, Porsche Thichan
// run this file in the repository main directory and connect to localhost:8080/index.html

/* nginx forward to nodejs and redirect from / to /index.html
# /etc/nginx/nginx.conf

user www;

# Set number of worker processes automatically based on number of CPU cores.
worker_processes auto;

# Enables the use of JIT for regular expressions to speed-up their processing.
pcre_jit on;

# Configures default error logger.
error_log /var/log/nginx/error.log warn;

# Includes files with directives to load dynamic modules.
include /etc/nginx/modules/*.conf;

# Include files with config snippets into the root context.
include /etc/nginx/conf.d/*.conf;

events {
	# The maximum number of simultaneous connections that can be opened by
	# a worker process.
	worker_connections 1024;
}

http {
	include /etc/nginx/mime.types;
	server {
		server_name oscarv.se;
		listen 80;
		location / {
			root /www/oscarv.se;
		}
	}
	server {
		server_name GIK373-Projektarbete-9.oscarv.se;
		listen 80;
		#location / {
		#	root /www/oscarv.se/GIK373-Projektarbete-9;
		#}
		location / {
			rewrite	^/$	/index.html	last;
			proxy_pass http://127.0.0.1:8080/;
		}
	}
}
*/

const http = require('node:http');
const filesystem = require('node:fs');
let OpenMeteoFetchTime = 0; //set time to 1970-01-01T00:00

const CapitalCoords = [
	["ad",["Andorra",42.5,1.5165]],
	["al",["Tirana",41.3275,19.8189]],
	["at",["Vienna",48.2,16.3666]],
	["ba",["Sarajevo",43.85,18.383]],
	["be",["Brussels",50.8333,4.3333]],
	["bg",["Sofia",42.6833,23.3167]],
	["by",["Minsk",53.9,27.5666]],
	["ch",["Bern",46.9167,7.467]],
	["cy",["Nicosia",35.1667,33.3666]],
	["cz",["Prague",50.0833,14.466]],
	["de",["Berlin",52.5218,13.4015]],
	["dk",["Copenhagen",55.6786,12.5635]],
	["ee",["Tallinn",59.4339,24.728]],
	["es",["Madrid",40.4,-3.6834]],
	["fi",["Helsinki",60.1756,24.9341]],
	["fr",["Paris",48.8667,2.3333]],
	["gb",["London",51.5072,-0.1275]],
	["gr",["Athens",37.9833,23.7333]],
	["hr",["Zagreb",45.8,16]],
	["hu",["Budapest",47.5,19.0833]],
	["ie",["Dublin",53.3331,-6.2489]],
	["is",["Reykjavik",64.15,-21.95]],
	["it",["Rome",41.896,12.4833]],
	["li",["Vaduz",47.1337,9.5167]],
	["lt",["Vilnius",54.6834,25.3166]],
	["lu",["Luxembourg",49.6117,6.13]],
	["lv",["Riga",56.95,24.1]],
	["mc",["Monaco",43.7396,7.4069]],
	["md",["Chisinau",47.005,28.8577]],
	["me",["Podgorica",42.466,19.2663]],
	["mk",["Skopje",42,21.4335]],
	["mt",["Valletta",35.8997,14.5147]],
	["nl",["Amsterdam",52.35,4.9166]],
	["no",["Oslo",59.9167,10.75]],
	["pl",["Warsaw",52.25,21]],
	["pt",["Lisbon",38.7227,-9.1449]],
	["ro",["Bucharest",44.4334,26.0999]],
	["rs",["Belgrade",44.8186,20.468]],
	//["ru",["Moscow",55.7522,37.6155]],
	["se",["Stockholm",59.3508,18.0973]],
	["si",["Ljubljana",46.0553,14.515]],
	["sk",["Bratislava",48.15,17.117]],
	["sm",["San Marino",43.9172,12.4667]],
	["ua",["Kiev",50.4334,30.5166]],
];

let OpenMeteoData = {
	CountryCode: [],
	PMValues: [],
}

function prepareOpenMeteoData(data) {

	let CountryCode = []; //this is what we return
	//setup variables to calculate avarages

	//loop through each country
	for (let i = 0; i < data.length; i++) {
		if ( CapitalCoords[i][1][1].toFixed(1) != data[i].latitude.toFixed(1) || CapitalCoords[i][1][2].toFixed(1) != data[i].longitude.toFixed(1) ) {
			console.log(`warning: possibly wrong coordinates for ${CapitalCoords[i][1][0]}`);
		}
		OpenMeteoData.CountryCode.push(CapitalCoords[i][0].toUpperCase());
		let Year = data[i].hourly.time[0].split("-")[0]; //start year stored in variable
		let ValueCount = 0;
		let AvarageValue = 0;
		let YearArray = [];
		let AvarageValueArray = [];
		for ( let x = 0; x < data[i].hourly.pm2_5.length; x++ ) {
			const pm2_5 = parseFloat(data[i].hourly.pm2_5[x]);
			const CurrentYear = data[i].hourly.time[x].split("-")[0]; //this stores the current year of the data
			if ( pm2_5 != null ) {
				if (Year != CurrentYear) {
					YearArray.push(Year);
					Year = CurrentYear;
					AvarageValueArray.push((AvarageValue / ValueCount)); //push value added together by count of values
					ValueCount = 0;
					AvarageValue = 0;
				}
			}
			ValueCount++;
			AvarageValue += pm2_5;
		}
		OpenMeteoData.PMValues.push([YearArray, AvarageValueArray]);
	}
}

function sendForbidden(response) {
	response.writeHead(403, {'Content-Type':'text/html'});
	response.write('403 - Forbidden');
	response.end();
}
function sendFileNotFound(response) {
	response.writeHead(404, {'Content-Type':'text/html'});
	response.write('404 - File Not Found');
	response.end();
}
function readData(filename) {
	if(filesystem.existsSync(filename)) { //check if the file exists
		try {
			return filesystem.readFileSync(filename); 
		} catch (err) {
			console.log(err);
		}
	} else {
		return undefined; //by default a function that doesn't return anything will return undefined, but lets make it obvious
	}
}
function sendResponse (data, type, response) {
	response.writeHead(200, {'Content-Type':type});
	response.write(data);
	response.end();
}
function serveJSON(request, response) {
	if (request.url.split('/').pop() == 'open_meteo_data.json') { // check if it's actually asking for the right json
		if ( Date.now() - OpenMeteoFetchTime >= 28800000 ) { //fetch new api data if the current data is 8 hours or older (this is milliseconds from 1970 as an int)
			try {
				sendResponse(JSON.stringify(OpenMeteoData), 'application/json', response); //send 8 hour old data to client first, then update since update takes 50 seconds
				fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=42.5,41.3275,48.2,43.85,50.8333,42.6833,53.9,46.9167,35.1667,50.0833,52.5218,55.6786,59.4339,40.4,60.1756,48.8667,51.5072,37.9833,45.8,47.5,53.3331,64.15,41.896,47.1337,54.6834,49.6117,56.95,43.7396,47.005,42.466,42,35.8997,52.35,59.9167,52.25,38.7227,44.4334,44.8186,59.3508,46.0553,48.15,43.9172,50.4334&longitude=1.5165,19.8189,16.3666,18.383,4.3333,23.3167,27.5666,7.467,33.3666,14.466,13.4015,12.5635,24.728,-3.6834,24.9341,2.3333,-0.1275,23.7333,16,19.0833,-6.2489,-21.95,12.4833,9.5167,25.3166,6.13,24.1,7.4069,28.8577,19.2663,21.4335,14.5147,4.9166,10.75,21,-9.1449,26.0999,20.468,18.0973,14.515,17.117,12.4667,30.5166&hourly=pm2_5&start_date=2013-01-01&end_date=2025-05-22')
				.then((response) => response.json())
				.then((data) => {
					OpenMeteoFetchTime = Date.now();
					prepareOpenMeteoData(data); //update loaded data
					filesystem.writeFileSync('data/open_meteo.json', JSON.stringify(OpenMeteoData)); //store data to file
				});
			} catch (err) {
				console.log(err);
			}
			
		} else {
			sendResponse(JSON.stringify(OpenMeteoData), 'application/json', response); //since it's not 8 hours or older, send 
		}
		return 0;
	} else if (request.url.split('/').pop() == 'country_codes.json') { // check if it's actually asking for the right json
		serveFile(request, response, 'application/json', 'data/');
		return 0;
	} else {
		sendForbidden(response);
		return 0;
	}
}
function serveFile(request, response, type, folder) {
	const filename = './' + folder + request.url.split('/').pop();
	const data = readData(filename);
	if ( data != undefined ) {
		sendResponse(data, type, response);
	} else {
		console.log(`${filename} 404`);
		sendFileNotFound(response);
	}
}

//initialize data
function init() {
	return new Promise(function(resolve, reject) {
		try {
			const StoredData = undefined;
			//const StoredData = readData('data/open_meteo.json'); //load backup if rate limited
			if (StoredData != undefined ) {
				prepareOpenMeteoData(JSON.parse(StoredData)); //load stored data as it was real data
				OpenMeteoFetchTime = Date.now();
			} else {
				console.log("Downloading openmeteo data, this might take about 1 minute")
				fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=42.5,41.3275,48.2,43.85,50.8333,42.6833,53.9,46.9167,35.1667,50.0833,52.5218,55.6786,59.4339,40.4,60.1756,48.8667,51.5072,37.9833,45.8,47.5,53.3331,64.15,41.896,47.1337,54.6834,49.6117,56.95,43.7396,47.005,42.466,42,35.8997,52.35,59.9167,52.25,38.7227,44.4334,44.8186,59.3508,46.0553,48.15,43.9172,50.4334&longitude=1.5165,19.8189,16.3666,18.383,4.3333,23.3167,27.5666,7.467,33.3666,14.466,13.4015,12.5635,24.728,-3.6834,24.9341,2.3333,-0.1275,23.7333,16,19.0833,-6.2489,-21.95,12.4833,9.5167,25.3166,6.13,24.1,7.4069,28.8577,19.2663,21.4335,14.5147,4.9166,10.75,21,-9.1449,26.0999,20.468,18.0973,14.515,17.117,12.4667,30.5166&hourly=pm2_5&start_date=2013-01-01&end_date=2025-05-22')
				.then((response) => response.json())
				.then((data) => {
					console.log("Processing openmeteo data...")
					OpenMeteoFetchTime = Date.now();
					prepareOpenMeteoData(data); //update loaded data
					try {
						filesystem.mkdirSync('data');
					} catch (fs_error) {
						console.log(fs_error);
					}
					console.log("Storing backup...")
					filesystem.writeFileSync('data/open_meteo.json', JSON.stringify(OpenMeteoData)); //store data to file
					resolve();
				});
			}
		} catch (err) {
			console.log(err);
			reject();
		}
	})
}
function run() {
	const server = http.createServer(function (request, response) {
		//console.log(request.url.split('.').pop());
		switch(request.url.split('.').pop()) {
			case 'json': serveJSON(request, response); break;
			case 'html': serveFile(request, response, 'text/html', ''); break;
			case 'css': serveFile(request, response, 'text/css', 'style/' ); break;
			case 'js': serveFile(request, response, 'text/javascript', 'scripts/' ); break;
			case 'svg': serveFile(request, response, 'image/svg+xml', 'image/'); break;
			case 'png': serveFile(request, response, 'image/png', 'image/'); break;
			case 'jpg': serveFile(request, response, 'image/jpeg', 'image/'); break;
			case 'ico': serveFile(request, response, 'image/x-icon', 'image/'); break;
			default: sendForbidden(response);
		}
	}).listen(8080);
	console.log("Server started on localhost:8080");
}

init().then(run);
