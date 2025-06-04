let apiData = [
  {
    url: 'https://sdb.socialstyrelsen.se/api/v1/sv/dodsorsaker_manad/resultat/kon/3/region/00/diagnos/1005,1006', //1006 = Dammlunga, 1005 = Kroniska sjukdomar i nedre luftvägarna
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
    url: '/image/europe.svg',
    options: { method: 'GET' },
    downloadStatus: '',
    dataString: '',
  },
  {
    url: '/country_codes.json',
    options: { method: 'GET' },
    downloadStatus: '',
    dataString: '',
  },
]
let ProgressMonitor = { 
  Status: 0,
  Max: apiData.length,
}
let ChartFontSize = 11;
// this function downloads all data from provided urls in apiData
async function fetchApiData() {
  initProgressBar();
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
      ProgressMonitor.Status++;
      updateProgressBar(ProgressMonitor);
    } catch (error) {
      entry.downloadStatus = 'Error';
      entry.dataString = `Error fetching data: ${error.message}`;
    }
  });
  //wait until everything is done
  await Promise.all(fetchPromises);
}

function initProgressBar() {
    const visuals = document.querySelectorAll('.visual__information').forEach(element => {
    const progress = document.createElement('div');
    const progressBar = document.createElement('div');
    const progression = document.createElement('div');
    progress.className = 'progress';
    progressBar.className = 'progress__bar';
    progression.className = 'progression';
    progress.appendChild(progressBar);
    progressBar.appendChild(progression);
    element.insertAdjacentElement('beforebegin', progress);
  });
}

function updateProgressBar(ProgressMonitor) {
  const progressPercent = ProgressMonitor.Status / ProgressMonitor.Max * 100;

  document.querySelectorAll('.progression').forEach(element => {
    let current = parseFloat(element.style.width) || 0;
    const progressWrapper = element.closest('.progress'); //find closest .progress from where the element is

    clearInterval(element.animationId);

    element.animationId = setInterval(() => {
      if (current >= progressPercent) {
        clearInterval(element.animationId);
        element.style.width = progressPercent + '%';

        //if progress is complete, set the .progress to display none
        if (progressPercent >= 100 && progressWrapper) {
          setTimeout(() => {
            progressWrapper.style.display = 'none';
          }, 300); //short delay so that animation doesn't end too quick
        }
      } else {
        current += 1; //this number is the speed of animation
        element.style.width = current + '%';
      }
    }, 10);
  });
}

function calculateSumOfArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += parseFloat(arr[i]);
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
    xya.push(parseFloat(xa[i]) * parseFloat(ya[i]));
    x2a.push(parseFloat(xa[i]) * parseFloat(xa[i]));
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
    const diff_ssr = (b[0] + b[1]*parseFloat(xa[i]) - parseFloat(ya[i]));
    const diff_sst = (ymean - parseFloat(ya[i]));
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
        DeathRateDataSweden['YearDeathCount'][DeathRateDataSweden['Year'].indexOf(dataObj.ar)] += parseInt(dataObj.varde) / 106;
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
  ProgressMonitor.Status++;
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
  ProgressMonitor.Status++;
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
  ProgressMonitor.Status++;
}
let OECDData = [];
function prepareOECDData() {
  const Data = apiData[3].dataString.data;
  const CountryArray = Data.structures[0].dimensions.series[0].values;
  const DataYears = [];
  for (const item of Object.values(Data.structures[0].dimensions.observation[0].values)){
    DataYears.push(parseInt(item.id));
  }
  const PM25Array = Object.values(Data.dataSets[0].series);
  for (let i = 0; i < CountryArray.length; i++){ //loop through countries and add countrycode, years and values to array
    Country = {
      Code: apiData[5].dataString[apiData[5].dataString.indexOf(CountryArray[i].id) - 1], //magic
      Year: DataYears,
      PM25Exp: [], 
    };
    for (const item of Object.values(PM25Array[i].observations)) { //loop through years for actual country and store values
      Country.PM25Exp.push(item[0]);
    }
    OECDData.push(Country);
  }
  ProgressMonitor.Status++;
}
function prepareData() {
  /*apiData.forEach((entry, index) => {
    console.log(`DataString for URL ${index + 1}`);
    console.log(entry.dataString);
    console.log('--------------------');
  });*/
  prepareSdbData();
  prepareOpenMeteoData();
  prepareEuroStatData();
  prepareOECDData();
}
const deathRateCanvas = document.getElementById('deathRateCanvasID');
const PercentageCanvas = document.getElementById('P2DeathPercentageID');


//Initialize charts
let EurostatChart = new Chart(document.getElementById("EurostatCanvas"));
function printEurostatChart() {
  //print eurostat here
  let CountryCode = document.getElementById("EurostatCountrySelector").value;
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
    YearPM25.push(PM25);
  }
  let Max = 0;
  const DeathMax = Math.max.apply(Math, YearDeaths);
  const PM25Max= parseInt(Math.max.apply(Math, YearPM25));
  if (DeathMax / 10 >= PM25Max) {
    Max = parseInt(DeathMax / 20) + 2;
  } else {
    Max = (parseInt(PM25Max / 2) + 1 );
  }
  /*const b = calculateLinearRegression(Years, YearDeaths);
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
        borderColor: '#FFAB03',
        backgroundColor: 'rgba(0,0,0,0)'
      }, {
        type: 'line',
        label: 'PM2.5 i huvudstaden',
        data: YearPM25,
        yAxisID: 'PM2_5',
        borderColor: '#010d75',
        backgroundColor: 'rgba(0,0,0,0)'
      },]
    },
    options: {
      aspectRatio: 1.7,
      scales: {
        PM2_5: {
          title: {
            text: 'µg/m³',
            display: true,
            font: {
              size: ChartFontSize,
              family: "Metrophobic, sans-serif"
	    }
	  },
          beginAtZero: true,
          type: 'linear',
          position: 'right',
	  min: 0,
          max: Max * 2,
          ticks: { stepSize: 2, fontSize: ChartFontSize}
        },
        Deaths: {
          title: {
            text: 'antal',
            display: true,
            font: {
              size: ChartFontSize,
              family: "Metrophobic, sans-serif"
	    }
	  },
          beginAtZero: true,
          type: 'linear',
          position: 'left',
	  min: 0,
          max: (Max * 20),
          ticks: { stepSize: 20, fontSize: ChartFontSize}
        }
      },
      plugins: {
        legend: {
          labels: {
            boxWidth: ChartFontSize,
            font: {
              size: ChartFontSize,
              family: "Metrophobic, sans-serif"
	    }
	  }
        },
      },
      elements:{
        point:{
          borderWidth: 0,
          radius: 0,
          backgroundColor: 'rgba(0,0,0,0)'
        }
      }
    }
  });
  EurostatChart.update();
}
function updateEurostatChart() {
  printEurostatChart();
}


let SwedenChart = new Chart(document.getElementById("SwedenCanvas"));
function printSwedenChart() {
  const OpenmeteoStockholm = OpenmeteoData.find((element) => element.Code == "SE"); //where code is SE
  const EurostatSweden = EurostatData.find((element) => element.Code == "SE"); //get country with SE
  const OECDSweden = OECDData.find((element) => element.Code == "SE"); //get country with SE
  const StartYear = OpenmeteoStockholm.Year[0];
  SwedenChart.destroy(); //remove old chart
  SwedenChart = new Chart(SwedenCanvas, {
    data: {
      labels: OpenmeteoStockholm.Year,
      datasets: [{
        type: 'line',
        label: 'PM2.5 i Stockholm',
        data: OpenmeteoStockholm.PMValues,
        yAxisID: 'PM2_5',
        borderColor: '#010d75',
        backgroundColor: 'rgba(0,0,0,0)'
      },{
        type: 'line',
        label: 'PM2.5 i Sverige',
        data: OECDSweden.PM25Exp, 
        yAxisID: 'PM2_5',
        borderColor: '#7d89f5',
        backgroundColor: 'rgba(0,0,0,0)'
      },{
        type: 'bar',
        label: 'Dödsfall direktrelaterade till PM2.5',
        data: EurostatSweden.YearDeaths,//.splice(EurostatSweden.Year.indexOf(StartYear)), //splice the data so that it begins at same year as the PM-values
        borderColor: '#FFAB03',
        backgroundColor: '#FFAB03',
        yAxisID: 'Deaths',
      },{
        type: 'bar',
        label: 'Dödsfall av dammlunga, bronkit, KOL och astma',
        data: DeathRateDataSweden.YearDeathCount,//.splice(DeathRateDataSweden.Year.indexOf(StartYear)), //splice the data so that both datasets begin at the same year
        borderColor: '#F5E97D',
        backgroundColor: '#F5E97D',
        yAxisID: 'Deaths',
      },]
    },
    options: {
      plugins: {
        legend: {
          labels: {
            boxWidth: ChartFontSize,
            font: { size: ChartFontSize}
	  }
        },
      },
      aspectRatio: 1.7,
      scales: {
        PM2_5: {
          title: {
            text: 'µg/m³',
            display: true,
            font: {
              size: ChartFontSize,
              family: "Metrophobic, sans-serif"
	    }
	  },
          beginAtZero: true,
          type: 'linear',
          position: 'right',
          min: 0,
          max: 8,
          ticks: { stepSize: 1},
          scaleFontSize: 30,
        },
        Deaths: {
          title: {
            text: 'antal dödsfall',
            display: true,
            font: {
              size: ChartFontSize,
              family: "Metrophobic, sans-serif"
	    }
	  },
          beginAtZero: true,
          type: 'linear',
          position: 'left',
          //max: 400,
          ticks: { stepSize: 100, fontSize: ChartFontSize}
        }
      },
      elements:{
        point:{
          borderWidth: 0,
          radius: 0,
          backgroundColor: 'rgba(0,0,0,0)'
        }
      }
    }
  });
  SwedenChart.update();
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
  let EastArr = [];
  let WestArr = [];
  //console.log(barr);
  const bmax = 10 + 10 * parseInt(Math.max.apply(Math, barr) / 10);
  for (let i = 0; i < EurostatData.length; i++) {
    const value = (1 * EurostatData[i].YearDeaths.at(-1) / bmax);
    //console.log(value);
    let id = EurostatData[i].Code;
    const WestEuropeanCountryCodes = ["AD","BE","CH","DE","DK","ES","FI","FR","IT","LI","NL","NO","PT","SE"];
    let color = `hsla(40, 99%, 50%, ${value})`;
    try {
      document.getElementById(id).style.fill = color;
        if (WestEuropeanCountryCodes.indexOf(id) != -1) {
          WestArr.push(EurostatData[i].YearDeaths.at(-1));
        } else {
          EastArr.push(EurostatData[i].YearDeaths.at(-1));
        }
      } catch (error){
      console.log(id,error);
    }
  }
  const EastMed = calculateSumOfArray(EastArr) / EastArr.length;
  const WestMed = calculateSumOfArray(WestArr) / WestArr.length;
  let EastDiff2 = [];
  let WestDiff2 = [];
  for (let x = 0; x < WestArr.length; x++) {
    let Diff = WestArr[x] - WestMed;
    WestDiff2.push(Diff * Diff);
  }
  const WestSigma = Math.sqrt(calculateSumOfArray(WestDiff2) / WestDiff2.length);
  //console.log(WestSigma);
  for (let x = 0; x < EastArr.length; x++) {
    let Diff = EastArr[x] - EastMed;
    EastDiff2.push(Diff * Diff);
  }
  const EastSigma = Math.sqrt(calculateSumOfArray(EastDiff2) / EastDiff2.length);
  //console.log(EastSigma);
  const T = (EastMed - WestMed) / ((EastMed - WestMed) / Math.sqrt((EastSigma/EastDiff2.length) + (WestSigma/WestDiff2.length)) * Math.sqrt(1/EastDiff2.length + 1/WestDiff2.length) );
  const FD = EastDiff2.length + WestDiff2.length - 2;
  console.log(T);
  try {
    document.getElementById('LegendMax').textContent=`${bmax}`;
  } catch (error) {
    console.log(id,error);
  }
  try {
    document.getElementById('TID').textContent=`${T.toFixed(2)}`;
    document.getElementById('FDID').textContent=`${FD}`;
  } catch (error) {
    console.log(id,error);
  }
};
let ScatterPlot = new Chart(document.getElementById("ScatterPlotCanvas"));
function printScatterPlot() {
  let PointArray = [];
  let CountryCodeArray = [];
  let LabelArray = [];
  let xa = [];
  let ya = [];
  for (let i = 0; i < OECDData.length; i++) {
	const Point = {
      x: OECDData[i].PM25Exp.at(-1),
      c: apiData[5].dataString.at(apiData[5].dataString.indexOf(OECDData[i].Code) - 1),
      y: -1,
      //cc: OECDData[i].Code,
	};
    //xa.push(Point.x);
    CountryCodeArray.push(OECDData[i].Code); //push cc here
    LabelArray.push(apiData[5].dataString.at(apiData[5].dataString.indexOf(OECDData[i].Code) - 1));
    PointArray.push(Point);
  }
  //console.log(EurostatData);
  for (let i = 0; i < EurostatData.length; i++) {
    const y = EurostatData[i].YearDeaths.at(-1);
	const cc = EurostatData[i].Code;
	//console.log(cc);
    const index = CountryCodeArray.indexOf(cc);
	//console.log(index);
    if (index != -1) {
	  PointArray[index].y = y;
	}
  }
  for (let i = PointArray.length - 1; i >= 0; i--) {
    if (PointArray[i].y === -1) {
      PointArray.splice(i, 1);
	} else {
      ya.push(PointArray[i].y);
      xa.push(PointArray[i].x);
	}
  }
  const b = calculateLinearRegression(xa, ya);
  const Prediction = [
    {x: 6,y: (b[0] + b[1] * 6)},
    {x: 18,y: (b[0] + b[1] * 18)}
  ];
  const R2 = calculateDeterminationCoefficient(b, xa, ya);
  ScatterPlot.destroy();
  ScatterPlot = new Chart(document.getElementById("ScatterPlotCanvas"), {
    data: {
      labels: LabelArray,
      datasets: [{
        type: 'scatter',
        label: 'Europeiska länder',
        data: PointArray,
        borderColor: '#010d75',
        backgroundColor: '#010d75',
	  },{
        type: 'scatter',
        label: `trend: ${b[1].toFixed(2)} dödsfall / hundratusen / 1 µg / m³, R² = ${R2.toFixed(3)}`,
        data: Prediction,
        showLine: true,
        lineTension: 0,
        borderDash: [5,5],
        borderColor: '#FFAB03',
        backgroundColor: 'rgba(0,0,0,0)',
        tooltip: false,
      }]
    },
    options: {
      aspectRatio: 1.7,
      scales: {
        x: {
          title: {
            text: 'µg/m³',
            display: true,
            font: {
              size: ChartFontSize,
              family: "Metrophobic, sans-serif"
	    }
	  },
          type: 'linear',
          position: 'bottom',
          ticks: { stepSize: 2, fontSize: ChartFontSize}
        },
        y: {
          title: {
            text: 'dödsfall/hundratusen',
            display: true,
            font: {
              size: ChartFontSize,
              family: "Metrophobic, sans-serif"
	    }
	  },
          type: 'linear',
          position: 'bottom',
          ticks: { stepSize: 10, fontSize: ChartFontSize}
        },
      },
      plugins: {
        legend: {
          labels: {
            boxWidth: ChartFontSize,
            font: { size: ChartFontSize}
	  }
        },
        tooltip: { //thanks andrei, https://github.com/chartjs/Chart.js/issues/1889#issuecomment-304695797
          filter: function (tooltipItem) {
            return tooltipItem.datasetIndex === 0;
          }
	}
      },
      elements:{
        point:{
          borderWidth: 0,
          radius: 4,
          backgroundColor: 'rgba(0,0,0,0)'
        }
      }
    }
  });
  ScatterPlot.update();
}

function printCharts() {
  printScatterPlot();
  printSwedenChart();
  printEurostatChart();
  printMap();
  console.log("printing charts...");
}
function updateFontSize() {
  if (window.innerWidth >= 800) {
    ChartFontSize = 14;
  } else {
    ChartFontSize = 11;
  }
  printCharts();
}
window.onresize = updateFontSize;

function prepareCharts() {
  let SelectionInput = document.createElement("select"); //create selectioninput
  SelectionInput.title = "Länder";
  SelectionInput.id = "EurostatCountrySelector";
  SelectionInput.className = "selection__input";
  let SelectionLabel = document.createElement("label");
  SelectionLabel.htmlFor = "EurostatCountrySelector"; //add label to selectioninput
  SelectionLabel.textContent = "Välj ett land: ";
  SelectionLabel.className = "selection__label";

  const CountryNames = apiData[1].dataString.dimension.geo.category.label; //re-instance to solve problems with directly acccessing JSON object as map.
  for (const [key, value] of Object.entries(CountryNames)) {
    if ( key.length < 3 && key != 'EL' && key != 'UK' && key != 'XK' ) {
      const NewOption = document.createElement("option");
      //console.log(`${key}:${value}`);
      NewOption.value = key;
      let SwedishCountryName = apiData[5].dataString.at(apiData[5].dataString.indexOf(key) - 1);
      NewOption.textContent = SwedishCountryName; //apiData[1].dataString.dimension.geo.category.label[key];
      SelectionInput.appendChild(NewOption);
    }
  }

  SelectionInput.addEventListener("change", updateEurostatChart); //add a listener so that graph updates when county is changed
  const EurostatCanvas = document.getElementById("EurostatCanvas"); //this is the canvas the chart is printed on
  EurostatCanvas.insertAdjacentElement("beforebegin", SelectionLabel); //insert the label for the selectioninput
  EurostatCanvas.insertAdjacentElement("beforebegin", SelectionInput); //insert the selectioninput
}

    /*data: {
      labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      datasets: [{
        type: 'line',
        label: 'Dödsfall av lungcancer och KOL',
        data: DeathRateDataSweden['MonthDeathAvg'],
        yAxisID: 'Deaths',
        borderColor: '#ffbe0a',
        backgroundColor: '#ffbe0a',
      },{
        type: 'line',
        label: 'PM2.5 i Stockholm',
        data: OpenmeteoData[]['MonthlyAvarage'],
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
  });*/

/*
  let PercentageChart = new Chart(PercentageCanvas, {
  PercentageChart.update();*/

fetchApiData().then(() => {
  prepareData();
}).then(() => {
  prepareCharts();
  updateFontSize(); //this updates font size for graphs and prints the charts
});
