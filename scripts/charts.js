let apiData = [
	{
		url: 'https://sdb.socialstyrelsen.se/api/v1/sv/dodsorsaker_manad/resultat/diagnos/10',
		downloadStatus: '',
		dataString: ''
	},
	{
		url: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sdg_11_52/?format=JSON&lang=en&freq=A&airpol=PM2_5&indic_he=PMD&unit=NR&geo=BE&geo=BG&geo=CZ&geo=DK&geo=DE&geo=EE&geo=IE&geo=EL&geo=ES&geo=FR&geo=HR&geo=IT&geo=CY&geo=LV&geo=LT&geo=LU&geo=HU&geo=MT&geo=NL&geo=AT&geo=PL&geo=PT&geo=RO&geo=SI&geo=SK&geo=FI&geo=SE&geo=IS&geo=LI&geo=NO&geo=CH&geo=BA&geo=ME&geo=MK&geo=AL&geo=RS&geo=XK&time=2005&time=2007&time=2008&time=2009&time=2010&time=2011&time=2012&time=2013&time=2014&time=2015&time=2016&time=2017&time=2018&time=2019&time=2020&time=2021&time=2022',
		downloadStatus: '',
		dataString: ''
	},
	{
		url: 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=62&longitude=15&hourly=european_aqi_pm2_5&timezone=auto&start_date=2013-01-01&end_date=2025-05-18',
		downloadStatus: '',
		dataString: ''
	},
]
async function fetchApiData() {
    const fetchPromises = apiData.map(async (entry) => {
        try {
            const response = await fetch(entry.url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
			entry.dataString = await response.json();
            //const data = await response.json();
            //entry.dataString = JSON.stringify(data);
            entry.downloadStatus = 'Success';
        } catch (error) {
            entry.downloadStatus = 'Error';
            entry.dataString = `Error fetching data: ${error.message}`;
        }
    });

    await Promise.all(fetchPromises);
}

let DeathRateDataSweden = {
  Year: [],
  YearDeathCount: [],
  Month: [],
  MonthDeathCount: [],
};
let PMValuesSweden = {
  Year: [],
  YearAvarage: [],
  Month: [],
  MonthAvarage: [],
  Monthly: [],
  MonthlyAvarage: [],
};

function prepareData() {
    apiData.forEach((entry, index) => {
        console.log(`DataString for URL ${index + 1}`);
        console.log(entry.dataString);
        console.log('--------------------');

    });
	//prepare data from Socialstyrelsen
	for (let i = 0; i < apiData[0].dataString.data.length; i++) {
		const dataObj = apiData[0].dataString.data[i];
		if (dataObj.konId == 3) {
			if (DeathRateDataSweden['Year'].indexOf(dataObj.ar) == -1) {
				DeathRateDataSweden['Year'].push(dataObj.ar);
				DeathRateDataSweden['YearDeathCount'].push(parseInt(dataObj.varde));
			}
			else {
				DeathRateDataSweden['YearDeathCount'][DeathRateDataSweden['Year'].indexOf(dataObj.ar)] += parseInt(dataObj.varde);
			}
			if ( DeathRateDataSweden['Month'].indexOf(dataObj.manadId) == -1 ) {
				DeathRateDataSweden['Month'].push(dataObj.manadId);
				DeathRateDataSweden['MonthDeathCount'].push(parseInt(dataObj.varde));
			}
			else {
				DeathRateDataSweden['MonthDeathCount'][DeathRateDataSweden['Month'].indexOf(dataObj.manadId)] += parseInt(dataObj.varde);
			}
		}
	}
	//prepare data from openMeteo
	//setup values to calculate avarages
	var ValueYearCount = 0;
	var AvarageYearValue = 0;
	var ValueMonthCount = 0;
	var AvarageMonthValue = 0;
	//load current time and remove days and hours
	let Time = apiData[2].dataString.hourly.time[0].split("-").splice(0,2);
	//iterate the json from the api call
	for (let i = 0; i < apiData[2].dataString.hourly.time.length; i++) {
		const pm2_5 = apiData[2].dataString.hourly.european_aqi_pm2_5[i];
		let CurrentTime = apiData[2].dataString.hourly.time[i].split("-").splice(0,2);
		//ignore null values
		if ( pm2_5 != null ) {
			//if the month is switching over to a new month, calculate avarage and push to array
			if (Time[1] != CurrentTime[1]) {
				PMValuesSweden['Month'].push(Time[1]);
				PMValuesSweden['MonthAvarage'].push(AvarageMonthValue / ValueMonthCount);
				ValueMonthCount = 0;
				AvarageMonthValue = 0;
			}
			//if the year switches over, calculate avarage and push to array
			if (Time[0] != CurrentTime[0]) {
				PMValuesSweden['Year'].push(Time[0]);
				PMValuesSweden['YearAvarage'].push(AvarageYearValue / ValueYearCount);
				ValueYearCount = 0;
				AvarageYearValue = 0;
			}
			//up the value counter and add value to total for year and month
			const pm2_5Int = parseInt(pm2_5);
			ValueYearCount++;
			ValueMonthCount++;
			AvarageMonthValue += pm2_5Int;
			AvarageYearValue += pm2_5Int;
		}
		//set the current time as time so that we can check if year or month switches over
		Time = CurrentTime;
	}
	console.log(PMValuesSweden);
}
const deathRateCanvas = document.getElementById('deathRateCanvasID');
/*let deathRateChart = new Chart(deathRateCanvas, {
  type: 'line',
  data: {
    labels: DeathRateDataSweden['Year'],
    datasets: [{
      label: 'dödsfall per år på grund av andningsproblem',
      data: DeathRateDataSweden['YearDeathCount'],
    }]
  }
});*/
function updateGraphs() {
	//here we update all the graphs/canvases
	//deathRateChart.destroy();
    let deathRateChart = new Chart(deathRateCanvas, {
      type: 'line',
      data: {
        labels: DeathRateDataSweden['Year'],
        datasets: [{
          label: 'dödsfall per år på grund av andningsproblem',
          data: DeathRateDataSweden['YearDeathCount'],
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
    deathRateChart.update();
	console.log(DeathRateDataSweden);
}

fetchApiData().then(() => {
    prepareData();
}).then(() => {
	updateGraphs();
});

//window.addEventListener('resize', updateGraphs);
