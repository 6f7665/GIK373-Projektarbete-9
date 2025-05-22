let apiData = [
  {
    url: 'https://sdb.socialstyrelsen.se/api/v1/sv/dodsorsaker_manad/resultat/kon/3/region/01/diagnos/0203,1005', //0203 = Maligna tumörer i andningsorgan och brösthålans organ, 1005 = Kroniska sjukdomar i nedre luftvägarna
    downloadStatus: '',
    dataString: ''
  },
  {
    //url: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sdg_11_52/?format=JSON&lang=en&freq=A&airpol=PM2_5&indic_he=PMD&unit=NR&geo=BE&geo=BG&geo=CZ&geo=DK&geo=DE&geo=EE&geo=IE&geo=EL&geo=ES&geo=FR&geo=HR&geo=IT&geo=CY&geo=LV&geo=LT&geo=LU&geo=HU&geo=MT&geo=NL&geo=AT&geo=PL&geo=PT&geo=RO&geo=SI&geo=SK&geo=FI&geo=SE&geo=IS&geo=LI&geo=NO&geo=CH&geo=BA&geo=ME&geo=MK&geo=AL&geo=RS&geo=XK&time=2005&time=2007&time=2008&time=2009&time=2010&time=2011&time=2012&time=2013&time=2014&time=2015&time=2016&time=2017&time=2018&time=2019&time=2020&time=2021&time=2022',
    url: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sdg_11_52/?format=JSON&lang=en&freq=A',
    downloadStatus: '',
    dataString: ''
  },
  {
    url: 'open_meteo_data.json',
    downloadStatus: '',
    dataString: ''
  },
]
// this function downloads all data from provided urls in apiData
async function fetchApiData() {
  const fetchPromises = apiData.map(async (entry) => { //async data fetch for entries
    try {
      const response = await fetch(entry.url);
      //throw error if response is not ok
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      entry.dataString = await response.json();
      entry.downloadStatus = 'Success';
    } catch (error) {
      entry.downloadStatus = 'Error';
      entry.dataString = `Error fetching data: ${error.message}`;
    }
  });
  //wait until everything is done
  await Promise.all(fetchPromises);
}

let DeathRateDataSweden = {
  Year: [],
  YearDeathCount: [],
  Month: [],
  MonthDeathCount: [],
  MonthDeathAvg: [],
  MonthlyCount: [0,0,0,0,0,0,0,0,0,0,0,0],
};
let PMValuesSweden = {
  Year: [],
  YearAvarage: [],
  Month: [],
  MonthAvarage: [],
  Monthly: ["01","02","03","04","05","06","07","08","09","10","11","12"],
  MonthlyAvarage: [0,0,0,0,0,0,0,0,0,0,0,0],
  MonthlyCount: [0,0,0,0,0,0,0,0,0,0,0,0],
};
let EurostatData = {
  Year: [],
  YearDeaths: [],
}
let PercentPrematureDeaths = {
  Year: [],
  Percentages: [],
}

function prepareData() {
  apiData.forEach((entry, index) => {
    console.log(`DataString for URL ${index + 1}`);
    console.log(entry.dataString);
    console.log('--------------------');
  });
  prepareSdbData();
  prepareOpenMeteoData();
  prepareEuroStatData();
  combineData();
}
function prepareSdbData() {
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
        DeathRateDataSweden['MonthlyCount'][DeathRateDataSweden['Month'].indexOf(dataObj.manadId)]++;
      }
    }
  }
  for (let i = 0; i < 12; i++) {
    DeathRateDataSweden['MonthDeathAvg'][i] = DeathRateDataSweden['MonthDeathCount'][i] / DeathRateDataSweden['MonthlyCount'][i];
  }
}
function prepareOpenMeteoData() {
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
        PMValuesSweden['MonthlyAvarage'][PMValuesSweden.Monthly.indexOf(Time[1])] += (AvarageMonthValue / ValueMonthCount);
        PMValuesSweden['MonthlyCount'][PMValuesSweden.Monthly.indexOf(Time[1])]++;
        ValueMonthCount = 0;
        AvarageMonthValue = 0;
      }
      //if the year switches over, calculate avarage and push to array
      if (Time[0] != CurrentTime[0]) {
        PMValuesSweden['Year'].push(parseInt(Time[0]));
        PMValuesSweden['YearAvarage'].push(AvarageYearValue / ValueYearCount);
        ValueYearCount = 0;
        AvarageYearValue = 0;
      }
      //up the value counter and add value to total for year and month
      const pm2_5Int = parseInt(pm2_5);
      ValueYearCount++; //this counts the number of values added together for the actual year
      ValueMonthCount++; //this counts the number of values added together for the actual month
      AvarageMonthValue += pm2_5Int;
      AvarageYearValue += pm2_5Int;
    }
    //set the current time as time so that we can check if year or month switches over
    Time = CurrentTime;
  }
  for (let i = 0; i < 12; i++) {
    PMValuesSweden['MonthlyAvarage'][i] = PMValuesSweden['MonthlyAvarage'][i] / PMValuesSweden['MonthlyCount'][i];
  }
  console.log(PMValuesSweden);
}
function prepareEuroStatData() {
  //Prepare eurostat data
  let YearLabels = apiData[1].dataString['dimension']['time']['category']['index'];
  const YearCount = apiData[1].dataString['size'][5];
  for (const [Year, Index] of Object.entries(YearLabels)) {
    EurostatData['Year'].push(parseInt(Year));
    EurostatData['YearDeaths'].push(apiData[1].dataString['value'][(YearCount * 28) + parseInt(Index)]);
  }
}
function combineData() {
  //Combine Socialstyrelsen and Eurostat
  for (let i = 0; i < EurostatData.Year.length; i++) {
  const Year = EurostatData.Year[i];
    PercentPrematureDeaths.Year.push(Year);
    const CurrentYearPercentage = 100 * EurostatData.YearDeaths[i] / DeathRateDataSweden.YearDeathCount[DeathRateDataSweden.Year.indexOf(Year)];
    console.log(`current year percentage is: ${CurrentYearPercentage}`);
    PercentPrematureDeaths.Percentages.push(`${Year}: ${CurrentYearPercentage.toFixed(1)}%`);
  }
}
const deathRateCanvas = document.getElementById('deathRateCanvasID');
const PercentageCanvas = document.getElementById('P2DeathPercentageID');

//this function updates all graphs
function updateGraphs() {
  let deathRateChart = new Chart(deathRateCanvas, {
    data: {
      labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      datasets: [{
        type: 'line',
        label: 'Dödsfall av lungcancer och KOL',
        data: DeathRateDataSweden['MonthDeathAvg'],
        yAxisID: 'Deaths',
        borderColor: '#ffbe0a',
        backgroundColor: '#ffbe0a',
      }, {
        type: 'line',
        label: 'PM2.5 i Stockholm',
        data: PMValuesSweden['MonthlyAvarage'],
        yAxisID: 'PM2_5',
        borderColor: '#0a3fff',
        backgroundColor: '#0a3fff',
      },]
    },
    options: {
      scales: {
        PM2_5: {
          title: { text: 'µg/m³', display: true },
          beginAtZero: true,
          type: 'linear',
          position: 'right',
          min: 6,
          max: 11,
          ticks: { stepSize: 1}
        },
        Deaths: {
          title: { text: 'antal dödsfall', display: true },
          beginAtZero: true,
          type: 'linear',
          position: 'left',
          min: 200,
          max: 325,
          ticks: { stepSize: 25}
        }
      },
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });
  deathRateChart.update();
  console.log(PercentPrematureDeaths.Percentages);

  let PercentageChart = new Chart(PercentageCanvas, {
    data: {
      labels: PercentPrematureDeaths.Percentages.splice(PercentPrematureDeaths['Year'].indexOf(PMValuesSweden.Year[0])),
      datasets: [{
        type: 'line',
        label: 'PM2.5 i Stockholm',
        data: PMValuesSweden['YearAvarage'],
        yAxisID: 'PM2_5',
        borderColor: '#0a3fff',
        backgroundColor: '#0a3fff',
      },{
        type: 'bar',
        label: 'Dödsfall direktrelaterade till PM2.5',
        data: EurostatData.YearDeaths.splice(EurostatData.Year.indexOf(PMValuesSweden.Year[0])), //splice the data so that it begins at same year as the PM-values
        borderColor: '#ff0a46',
        backgroundColor: '#ff0a46',
        yAxisID: 'Deaths',
      },{
        type: 'bar',
        label: 'Dödsfall av lungcancer och KOL',
        data: DeathRateDataSweden['YearDeathCount'].splice(DeathRateDataSweden['Year'].indexOf(PMValuesSweden.Year[0])), //splice the data so that both datasets begin at the same year
        borderColor: '#ffbe0a',
        backgroundColor: '#ffbe0a',
        yAxisID: 'Deaths',
      },]
    },
    options: {
      scales: {
        PM2_5: {
          title: { text: 'µg/m³', display: true },
          beginAtZero: true,
          type: 'linear',
          position: 'right',
          min: 0,
          max: 15,
          ticks: { stepSize: 1}
        },
        Deaths: {
          title: { text: 'antal dödsfall', display: true },
          beginAtZero: true,
          type: 'linear',
          position: 'left',
          max: 7500,
          ticks: { stepSize: 500}
        }
      }
    }
  });
  PercentageChart.update();
}

fetchApiData().then(() => {
  prepareData();
}).then(() => {
  updateGraphs();
});
