const deathRateCanvas = document.getElementById('deathRateCanvasID');
let deathRateData = {
  YearMonth: [],
  DeathNumber: [],
};
fetch('https://sdb.socialstyrelsen.se/api/v1/sv/dodsorsaker_manad/resultat/diagnos/10')
  .then((response) => response.json())
  .then((data) => {
    for (let i = 0; i < data['data'].length; i++) {
      const date_string = `${data['data'][i]['ar']}${data['data'][i]['manadId']}`;
      if(deathRateData['YearMonth'].indexOf(parseInt(date_string)) == -1) {
        deathRateData['YearMonth'].push(parseInt(date_string));
        deathRateData['DeathNumber'].push(parseInt(data['data'][i]['varde']));
      }
      else {
        deathRateData['DeathNumber'][deathRateData['YearMonth'].indexOf(date_string)] = parseInt(deathRateData['DeathNumber'][deathRateData['YearMonth'].indexOf(date_string)]) + parseInt(data['data'][i]['varde']);
      }
    }
    const deathRateChart = new Chart(deathRateCanvas, {
      type: 'line',
      data: {
        labels: deathRateData['YearMonth'],
        datasets: [{
          label: 'dödsfall',
          data: deathRateData['DeathNumber'],
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    deathRateChart.update();
    console.log(deathRateData);
  });
