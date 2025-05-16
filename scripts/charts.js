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
	//for (let i = 0; i < apiData[].datastring.data.length; i++) {}
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
