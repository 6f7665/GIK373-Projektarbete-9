let apiData = [
  {
    url: 'https://sdb.socialstyrelsen.se/api/v1/sv/dodsorsaker_manad/resultat/kon/3/region/01/diagnos/0203,1005', //0203 = Maligna tumörer i andningsorgan och brösthålans organ, 1005 = Kroniska sjukdomar i nedre luftvägarna
    options: {method: 'GET'},
    downloadStatus: '',
    dataString: ''
  },
  {
    //url: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sdg_11_52/?format=JSON&lang=en&freq=A&airpol=PM2_5&indic_he=PMD&unit=NR&geo=BE&geo=BG&geo=CZ&geo=DK&geo=DE&geo=EE&geo=IE&geo=EL&geo=ES&geo=FR&geo=HR&geo=IT&geo=CY&geo=LV&geo=LT&geo=LU&geo=HU&geo=MT&geo=NL&geo=AT&geo=PL&geo=PT&geo=RO&geo=SI&geo=SK&geo=FI&geo=SE&geo=IS&geo=LI&geo=NO&geo=CH&geo=BA&geo=ME&geo=MK&geo=AL&geo=RS&geo=XK&time=2005&time=2007&time=2008&time=2009&time=2010&time=2011&time=2012&time=2013&time=2014&time=2015&time=2016&time=2017&time=2018&time=2019&time=2020&time=2021&time=2022',
    //url: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sdg_11_52/?format=JSON&lang=en&freq=A',
    url: 'https://ec.europa.eu/eurostat/api/dissemination/sdmx/3.0/data/dataflow/ESTAT/sdg_11_52/1.0/*.*.*.*.*?c[freq]=A&c[airpol]=PM2_5&c[indic_he]=PMD&c[unit]=RT&c[geo]=BE,BG,CZ,DK,DE,EE,IE,EL,ES,FR,HR,IT,CY,LV,LT,LU,HU,MT,NL,AT,PL,PT,RO,SI,SK,FI,SE,IS,LI,NO,CH,UK,BA,ME,MK,AL,RS,XK&c[TIME_PERIOD]=2005,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022&compress=false&format=json&lang=en',
    options: {method: 'GET'},
    downloadStatus: '',
    dataString: ''
  },
  {
    url: 'open_meteo_data.json',
    options: {method: 'GET'},
    downloadStatus: '',
    dataString: ''
  },
]
// this function downloads all data from provided urls in apiData
async function fetchApiData() {
  const fetchPromises = apiData.map(async (entry) => { //async data fetch for entries
    try {
      const response = await fetch(entry.url, entry.options);
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
	AvarageValue: [],
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
  i = apiData[2].dataString.CountryCode.indexOf("SE");
  PMValuesSweden.Year = apiData[2].dataString.PMValues[i][0];
  PMValuesSweden.AvarageValue = apiData[2].dataString.PMValues[i][1];
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

//Initialize charts
let EurostatChart = new Chart(document.getElementById("EurostatCanvas"));

function printEurostatChart() {
  //print eurostat here
  const CountryCode = document.getElementById("EurostatCountrySelector").value;
  const CountryIndex = apiData[1].dataString.dimension.geo.category.index[CountryCode]; //Countrycodes and their index pos
  //console.log(CountryCode + ':' + CountryIndex);
  let YearDeaths = [];
  let Years = Object.keys(apiData[1].dataString.dimension.time.category.index);
  Years.shift(); //Remove first year, start is 2005, 2007, 2008
  let StartPos = (apiData[1].dataString.size[5] * CountryIndex);
  for (let i = 1; i < apiData[1].dataString.size[5]; i++) {//loop through each year, but omit first, number of year comes from size[5]
    YearDeaths.push(apiData[1].dataString.value[StartPos + i]);
  }
  EurostatChart.destroy(); //remove old chart
  EurostatChart = new Chart(document.getElementById("EurostatCanvas"), {
    data: {
      labels: Years,
      datasets: [{
        type: 'line',
        label: 'Dödsfall direktrelaterade till PM2.5 per 100 000 invånare',
        data: YearDeaths,
        yAxisID: 'Deaths',
        borderColor: '#ffbe0a',
        backgroundColor: '#ffbe0a',
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
          title: { text: 'antal', display: true },
          beginAtZero: true,
          type: 'linear',
          position: 'left',
          ticks: { stepSize: 100}
        }
      },
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });
  EurostatChart.update();
}

function updateEurostatChart() {
  printEurostatChart();
}

function printCharts() {
  printEurostatChart();
  console.log("printing charts...");
}

function prepareCharts() {
  let SelectionInput = document.createElement("select"); //create selectioninput
  SelectionInput.title = "Länder";
  SelectionInput.id = "EurostatCountrySelector";
  let SelectionLabel = document.createElement("label");
  SelectionLabel.htmlFor = "EurostatCountrySelector"; //add label to selectioninput
  SelectionLabel.textContent = "Välj ett land:";

  const CountryNames = apiData[1].dataString.dimension.geo.category.label; //re-instance to solve problems with directly acccessing JSON object as map.
  for (const [key, value] of Object.entries(CountryNames)) {
    if ( key.length < 3 ) {
      const NewOption = document.createElement("option");
      console.log(`${key}:${value}`);
      NewOption.value = key;
      NewOption.textContent = value; //apiData[1].dataString.dimension.geo.category.label[key];
      SelectionInput.appendChild(NewOption);
    }
  }

  SelectionInput.addEventListener("change", updateEurostatChart); //add a listener so that graph updates when county is changed
  const EurostatCanvas = document.getElementById("EurostatCanvas"); //this is the canvas the chart is printed on
  EurostatCanvas.insertAdjacentElement("beforebegin", SelectionLabel); //insert the label for the selectioninput
  EurostatCanvas.insertAdjacentElement("beforebegin", SelectionInput); //insert the selectioninput
}
 
  /*let deathRateChart = new Chart(deathRateCanvas, {
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
  console.log(PercentPrematureDeaths.Percentages);/**/
/*
  let PercentageChart = new Chart(PercentageCanvas, {
    data: {
      labels: PercentPrematureDeaths.Percentages.splice(PercentPrematureDeaths['Year'].indexOf(PMValuesSweden.Year[0])),
      datasets: [{
        type: 'line',
        label: 'PM2.5 i Stockholm',
        data: PMValuesSweden['AvarageValue'],
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
  PercentageChart.update();*/

fetchApiData().then(() => {
  prepareData();
}).then(() => {
  prepareCharts();
  printCharts();
});
