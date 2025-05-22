// this file is the NodeJS file for relaying data from openmeteo

const http = require('node:http');
const filesystem = require('node:fs');
let OpenMeteoFetchTime = 0;
let OpenMeteoData = JSON.parse(readData('data/open_meteo.json'));

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
		return undefined; //by default a function that doesn't return anything will return undefined
	}
}
function sendResponse (data, type, response) {
	response.writeHead(200, {'Content-Type':type});
	response.write(data);
	response.end();
}
function serveJSON(request, response) {
	if (request.url.split('/').pop() == 'open_meteo_data.json') { // check if it's actually asking for the right json
		if ( Date.now() - OpenMeteoFetchTime >= 28800000 ) { //fetch api data every 6 hours
			try {
				fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=42.5,41.3275,48.2,43.85,50.8333,42.6833,53.9,46.9167,35.1667,50.0833,52.5218,55.6786,59.4339,40.4,60.1756,48.8667,51.5072,37.9833,45.8,47.5,53.3331,64.15,41.896,47.1337,54.6834,49.6117,56.95,43.7396,47.005,42.466,42,35.8997,52.35,59.9167,52.25,38.7227,44.4334,44.8186,59.3508,46.0553,48.15,43.9172,50.4334&longitude=1.5165,19.8189,16.3666,18.383,4.3333,23.3167,27.5666,7.467,33.3666,14.466,13.4015,12.5635,24.728,-3.6834,24.9341,2.3333,-0.1275,23.7333,16,19.0833,-6.2489,-21.95,12.4833,9.5167,25.3166,6.13,24.1,7.4069,28.8577,19.2663,21.4335,14.5147,4.9166,10.75,21,-9.1449,26.0999,20.468,18.0973,14.515,17.117,12.4667,30.5166&hourly=pm2_5&start_date=2013-01-01&end_date=2025-05-22')
				.then((response) => response.json())
				.then((data) => {
					OpenMeteoData = data;
					filesystem.writeFileSync('data/open_meteo.json', JSON.stringify(OpenMeteoData));
					sendResponse(JSON.stringify(OpenMeteoData), 'application/json', response);
				});
			} catch (err) {
				console.log(err);
			}
			
		} else {
			sendResponse(JSON.stringify(OpenMeteoData), 'application/json', response);
		}
		return 0;
	}
	sendForbidden();
	return 0;
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
const server = http.createServer(function (request, response) {
	console.log(request.url.split('.').pop());
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

