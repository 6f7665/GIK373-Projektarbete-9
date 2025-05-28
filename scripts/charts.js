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
  {
    url: 'https://sdmx.oecd.org/public/rest/data/OECD.ENV.EPI,DSD_AIR_POL@DF_AIR_POLL,/AUT+BEL+CZE+DNK+EST+FIN+FRA+DEU+HUN+ISL+IRL+ITA+LVA+LTU+LUX+NLD+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE.A.MEAN_POP....?startPeriod=2013&endPeriod=2020&format=jsondata',
    options: {method: 'GET'},
    downloadStatus: '',
    dataString: ''
  },
  {
    url: "/image/europe.svg",
    options: { method: "GET" },
    downloadStatus: "",
    dataString: "",
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

      if (entry.url.endsWith('.svg')) {
        entry.dataString = await response.text();
      } else {
        entry.dataString = await response.json();
      }

      entry.downloadStatus = 'Success';
    } catch (error) {
      entry.downloadStatus = 'Error';
      entry.dataString = `Error fetching data: ${error.message}`;
    }
  });
  //wait until everything is done
  await Promise.all(fetchPromises);
}

function calculateSumOfArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += parseInt(arr[i]);
  }
  return sum;
}
function calculateLinearRegression(xa, ya) {
  //this uses the Least Squares Method to calculate and return B-one and B-zero
  const xsum = calculateSumOfArray(xa);
  const ysum = calculateSumOfArray(ya);
  let xya = [];
  let x2a = [];
  for (let i = 0; i < xa.length; i++) {
    xya.push(parseInt(xa[i]) * parseInt(ya[i]));
    x2a.push(parseInt(xa[i]) * parseInt(xa[i]));
  }
  const xysum = calculateSumOfArray(xya);
  const x2sum = calculateSumOfArray(x2a);
  //b-zero = constant
  //b-one = m/coefficient
  // y = b-one * x + b-zero
  const b_one = (((xa.length * xysum) - (xsum * ysum)) / ((xa.length * x2sum) - (xsum * xsum)));
  const b_zero = ((ysum - (b_one * xsum)) / xa.length);
  let b = [b_zero, b_one];
  return b; //this gives you b[0] and b[1] for b-zero and b-one if you const b = calculateLinearRegression :)
}
function calculateDeterminationCoefficient(b, xa, ya) {
  let ssr_arr = []; //store square of regression in this array
  let sst_arr = []; //store sum of squares in this array
  const ymean = (calculateSumOfArray(ya) / ya.length);
  for (let i = 0; i < ya.length; i++) {
    const diff_ssr = (b[0] + b[1]*parseInt(xa[i]) - parseInt(ya[i]));
    const diff_sst = (ymean - parseInt(ya[i]));
    ssr_arr.push(diff_ssr * diff_ssr);
    sst_arr.push(diff_sst * diff_sst);
  }
  const sst = calculateSumOfArray(sst_arr);
  const ssr = calculateSumOfArray(ssr_arr);
  const r2 = ((sst - ssr) / sst);
  return r2;
}

let DeathRateDataSweden = {
  Year: [],
  YearDeathCount: [],
  Month: [],
  MonthDeathCount: [],
  MonthDeathAvg: [],
  MonthlyCount: [0,0,0,0,0,0,0,0,0,0,0,0],
};
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
let OpenmeteoData = [];
function prepareOpenMeteoData() {
  for (let i = 0; i < apiData[2].dataString.CountryCode.length; i++) {
    Country = {
      Code: apiData[2].dataString.CountryCode[i],
      Year: apiData[2].dataString.PMValues[i][0],
      PMValues: apiData[2].dataString.PMValues[i][1],
      b: [0,0],
      r2: 0,
    }
    Country.b = calculateLinearRegression(Country.Year, Country.PMValues);
    Country.r2 = calculateDeterminationCoefficient(Country.b, Country.Year, Country.PMValues);
    OpenmeteoData.push(Country);
  }
  console.log(OpenmeteoData);
}
let EurostatData = [];
function prepareEuroStatData() {
  let CountryCodes = apiData[1].dataString['dimension']['geo']['category']['index'];
  for (const [CountryCode, CountryIndex] of Object.entries(CountryCodes)) {
    //Prepare eurostat data
    let Country = {
      Code: CountryCode,
      Year: [],
      YearDeaths: [],
      b: [0,0],
      r2: 0,
    };
    let YearLabels = apiData[1].dataString['dimension']['time']['category']['index'];
    const YearCount = apiData[1].dataString['size'][5];
    for (const [Year, Index] of Object.entries(YearLabels)) {
      Country.Year.push(parseInt(Year));
      Country.YearDeaths.push(apiData[1].dataString['value'][(YearCount * CountryIndex) + parseInt(Index)]);
    }
    Country.b = calculateLinearRegression(Country.Year, Country.YearDeaths);
    Country.r2 = calculateDeterminationCoefficient(Country.b, Country.Year, Country.YearDeaths);
    EurostatData.push(Country);
  }
  console.log(EurostatData);
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
}
const deathRateCanvas = document.getElementById('deathRateCanvasID');
const PercentageCanvas = document.getElementById('P2DeathPercentageID');

//Initialize charts
let EurostatChart = new Chart(document.getElementById("EurostatCanvas"));

function printEurostatChart() {
  //print eurostat here
  const CountryCode = document.getElementById("EurostatCountrySelector").value;
  const CountryIndex = apiData[1].dataString.dimension.geo.category.index[CountryCode]; //Countrycodes and their index pos
  let YearPM25 = [];
  let YearDeaths = [];
  let Years = Object.keys(apiData[1].dataString.dimension.time.category.index);
  Years.shift(); //Remove first year, start is 2005, 2007, 2008
  let StartPos = (apiData[1].dataString.size[5] * CountryIndex);
  const CountryCodeIndex = apiData[2].dataString.CountryCode.indexOf(CountryCode);
  const PM25Arr = apiData[2].dataString.PMValues[CountryCodeIndex][1];
  const YearArr = apiData[2].dataString.PMValues[CountryCodeIndex][0];
  for (let i = 1; i < apiData[1].dataString.size[5]; i++) {//loop through each year, but omit first, number of year comes from size[5]
    YearDeaths.push(apiData[1].dataString.value[StartPos + i]);
    let PM25 = null;
    YearArrIndex = YearArr.indexOf(Years[i - 1]);
    if ( YearArrIndex != -1 ) {
      PM25 = PM25Arr[YearArrIndex];
    }
    //console.log(PM25);
    YearPM25.push(PM25);
  }/*
  const b = calculateLinearRegression(Years, YearDeaths);
  console.log(b);
  let Trend = [];
  for (let i = 0; i < Years.length; i++) {
    Trend.push(b[0] + (b[1] * parseInt(Years[i])));
  }*/
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
      }, {
        type: 'line',
        label: 'PM2.5 i huvudstaden',
        data: YearPM25,
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
	  min: 0,
          ticks: { stepSize: 1}
        },
        Deaths: {
          title: { text: 'antal', display: true },
          beginAtZero: true,
          type: 'linear',
          position: 'left',
	  min: 0,
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

function printMap() {
  const container = document.getElementById("europeMapContainer");
  container.innerHTML = apiData[4].dataString;

  let barr = [];

  for (let i = 0; i < EurostatData.length; i++) {
    if (EurostatData[i].YearDeaths.at(-1) !== undefined) {
      barr.push(EurostatData[i].YearDeaths.at(-1));
    }
  }
  console.log(barr);
  const bmin = Math.max.apply(Math, barr);
  for (let i = 0; i < EurostatData.length; i++) {
    const value = (1 * EurostatData[i].YearDeaths.at(-1) / bmin);
    console.log(value);
    let id = EurostatData[i].Code;

    color = `hsla(0, 100%, 50%, ${value})`;

    try{document.getElementById(id).style.fill = color;}
    catch (error){
    console.log(error);
    }
  }
};

function printCharts() {
  printEurostatChart();
  printMap();
  console.log("printing charts...");
}

function prepareCharts() {
  let SelectionInput = document.createElement("select"); //create selectioninput
  SelectionInput.title = "Länder";
  SelectionInput.id = "EurostatCountrySelector";
  SelectionInput.className = "body__text";
  let SelectionLabel = document.createElement("label");
  SelectionLabel.htmlFor = "EurostatCountrySelector"; //add label to selectioninput
  SelectionLabel.textContent = "Välj ett land: ";
  SelectionLabel.className = "body__text";

  const CountryNames = apiData[1].dataString.dimension.geo.category.label; //re-instance to solve problems with directly acccessing JSON object as map.
  for (const [key, value] of Object.entries(CountryNames)) {
    if ( key.length < 3 ) {
      const NewOption = document.createElement("option");
      //console.log(`${key}:${value}`);
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
