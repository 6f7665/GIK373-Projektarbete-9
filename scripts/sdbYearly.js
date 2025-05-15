const deathRateCanvas = document.getElementById("yearlyDeathRate");
let yearlyData = [];

const sdbURL =
  "https://sdb.socialstyrelsen.se/api/v1/sv/dodsorsaker_manad/resultat/diagnos/10";

fetch(sdbURL)
  .then((response) => response.json())
  .then(printSDBChart);

function printSDBChart(dataSDB) {
  totalDeathsPerYear(dataSDB);

  const labels = yearlyData.map((entry) => entry.year);
  const data = yearlyData.map((entry) => entry.deaths);

  const YearlyDeathRateChart = new Chart(deathRateCanvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "dödsfall",
          data: data,
        },
      ],
    },
  });
}

function totalDeathsPerYear(dataSDB) {
  const data = dataSDB.data;
  let indexCount = 0;
  let yearAndDeath = {
    deaths: 0,
    year: 0,
  };

  // Total deaths every year
  for (let i = data[0].ar; i < data[data.length - 1].ar + 1; i++) {
    let totalDeathsPerYear = 0;
    for (let k = 0; k < data.length; k++) {
      if (data[k].ar == i && data[k].konId == 3) {
        totalDeathsPerYear = totalDeathsPerYear + parseInt(data[k].varde);
      }
    }
    yearAndDeath = {
      deaths: totalDeathsPerYear,
      year: i,
    };
    yearlyData[indexCount] = yearAndDeath;
    indexCount = indexCount + 1;
  }
}
