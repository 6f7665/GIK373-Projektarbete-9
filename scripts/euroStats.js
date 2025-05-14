const euroStatURL =
  "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sdg_11_52/?format=JSON&lang=en&freq=A&airpol=PM2_5&indic_he=PMD&unit=NR&geo=BE&geo=BG&geo=CZ&geo=DK&geo=DE&geo=EE&geo=IE&geo=EL&geo=ES&geo=FR&geo=HR&geo=IT&geo=CY&geo=LV&geo=LT&geo=LU&geo=HU&geo=MT&geo=NL&geo=AT&geo=PL&geo=PT&geo=RO&geo=SI&geo=SK&geo=FI&geo=SE&geo=IS&geo=LI&geo=NO&geo=CH&geo=BA&geo=ME&geo=MK&geo=AL&geo=RS&geo=XK&time=2005&time=2007&time=2008&time=2009&time=2010&time=2011&time=2012&time=2013&time=2014&time=2015&time=2016&time=2017&time=2018&time=2019&time=2020&time=2021&time=2022";

let myChart = new Chart(document.getElementById("euroStat"));

fetch(euroStatURL)
  .then((response) => response.json())
  .then(BuildEuroStatGraph);

// Build Everything together
function BuildEuroStatGraph(dataEuroStat) {
  selectCountryOption(dataEuroStat);
  printEuroStatChart(dataEuroStat);
}

// print a chart
function printEuroStatChart(dataEuroStat) {
  myChart.destroy(); // destroy the existing chart before creating a new one

  const countryKeys = Object.keys(dataEuroStat.dimension.geo.category.index); // Countries but in order of their index number.
  const years = Object.values(dataEuroStat.dimension.time.category.label); // Values of every year, basically ["2005", "2006", "2007", ...]

  const countryNumber = getSelectedCountry(dataEuroStat); // get index of chosen country
  let startingIndex = countryNumber * 17; // The starting index for each selected country since each country has 17 values.

  const data = [];

  // Loop trough the values 17 times from where the startingIndex is.
  for (let i = 0; i < years.length; i++) {
    const values = dataEuroStat.value[startingIndex];
    data[i] = values; // Store it in array
    startingIndex = startingIndex + 1;
  }

  // define label and which data to use.
  const datasets = [
    {
      label:
        "Premature deaths due to exposure to fine particulate matter (PM2.5) by selected country.",
      data: data,
    },
  ];

  // Create a line chart
  myChart = new Chart(document.getElementById("euroStat"), {
    type: "line",
    data: { labels: years, datasets: datasets },
  });
}

// Find the correct index number of the chosen country from the selection.
function getSelectedCountry(dataEuroStat) {
  const countryKeys = Object.keys(dataEuroStat.dimension.geo.category.index); // Countries but in order of their index number.

  const selectedOption = document.querySelector("#countries");
  chosenCountry = selectedOption.value;

  if (countryKeys.includes(chosenCountry) == true) {
    return countryKeys.indexOf(chosenCountry);
  }
}

// create a selection of countries taken from the dataset
function selectCountryOption(dataEuroStat) {
  const countryNames = dataEuroStat.dimension.geo.category.label;

  const labelSelect = document.createElement("label");
  labelSelect.textContent = "Choose a country: ";
  const newSelect = document.createElement("select"); // create a select bar
  newSelect.title = "countries";
  newSelect.id = "countries";

  for (const country in countryNames) {
    if (countryNames.hasOwnProperty(country)) {
      const newOption = document.createElement("option");
      newOption.value = country; // This is for the value of the options. Example: DE
      newOption.textContent = countryNames[country]; // This is for labeling in the select. Example: Germany
      newSelect.appendChild(newOption);
    }
  }

  // check for event on the selectino menu, If there is, run the chart function again.
  newSelect.addEventListener("change", () => {
    printEuroStatChart(dataEuroStat);
  });

  const currentDiv = document.getElementById("euroStat"); // identify where chart is in the document
  currentDiv.insertAdjacentElement("beforebegin", newSelect); // Insert select before chart
  newSelect.insertAdjacentElement("beforebegin", labelSelect); // Insert label before the selection menu
}
