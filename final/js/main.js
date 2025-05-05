// Global objects go here (outside of any functions)
let data, scatterplot, barchart;
/**
 * Load data from CSV file asynchronously and render charts
 */

d3.csv("data/video-game-sales.csv")
  .then(_data => {
    data = _data; // for safety, so that we use a local copy of data.

    data.forEach(d => {
      d.Global_Sales = +d.Global_Sales;
      d.NA_Sales     = +d.NA_Sales;
      d.EU_Sales     = +d.EU_Sales;
      d.JP_Sales     = +d.JP_Sales;
      d.Other_Sales  = +d.Other_Sales;
      d.Year         = +d.Year;          
    });

    drawVis();

    d3.selectAll("select").on("change", drawVis);
  })
  .catch(error => console.error("Data loading error:", error));


function drawVis() {
  //our dropdown options
  const xAttr       = d3.select("#x-axis-select").property("value");
  const yAttr       = d3.select("#y-axis-select").property("value");
  const aggregation = d3.select("#aggregation-select").property("value");
  const sortOrder   = d3.select("#sort-select").property("value");
  
  d3.select("#chart-area").html("");
  d3.select("#chart-area")
    .append("svg")
      .attr("id", "chart-svg");

  const maxY = d3.max(data, d => d[yAttr]);
  const colorScale = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, maxY]);

    let chartType;

  //if the user selects these dropdowns, we create a barchart else a scatterplot
  if (["Genre","Platform","Publisher"].includes(xAttr)) {   
    barchart = new Barchart(
      { parentElement: "#chart-area", colorScale },
      data, xAttr, yAttr, aggregation, sortOrder
    );
    barchart.updateVis(aggregation, sortOrder);
    chartType = "bar chart";
  } else {
    // scatter: show top 30 games by chosen Y
    // const top30 = data.slice()
    //   .sort((a,b) => d3.descending(a[yAttr], b[yAttr]))
    //   .slice(0, 30);
    scatterplot = new Scatterplot(
      { parentElement: "#chart-area", colorScale },
      data
    );
    scatterplot.updateVis(yAttr, aggregation);
    chartType = "scatterplot";
  }
updateChartSummary(xAttr, yAttr,chartType,aggregation );
}

function updateChartSummary(xAttr, yAttr,chartType,aggregation) {
  const xLabelMap = {
    "Publisher": "top video game publishers",
    "Genre": "game genres such as Action, Sports, or Puzzle",
    "Platform": "gaming platforms like PlayStation and Xbox",
    "Year": "video game releases from 1980 to 2020"
  };

  const yLabelMap = {
    "Global_Sales": "worldwide sales",
    "NA_Sales": "North American market",
    "EU_Sales": "European market",
    "JP_Sales": "Japanese market",
    "Other_Sales": "other global regions"
  };

  const xPhrase = xLabelMap[xAttr];
  const yPhrase = yLabelMap[yAttr];

  const aggPhrase = aggregation === "count"
  ? "the number of games released"
  : "total video game sales";

  const summaryText = `<span style="color:#4ce7ff; font-weight:bold;">What is this chart doing?</span><br>This ${chartType} shows ${xPhrase} compared across ${yPhrase} based on ${aggPhrase}, helping you explore patterns and trends in the video game industry.`;

  document.getElementById("chart-summary").innerHTML = summaryText;
}

// call introJs for tutorial
introJs().setOptions({
  tooltipClass: "tutorial-tooltip",
  // detailed info for each step in the tutorial
  steps: [
    {
      title: "Hello there!",
      intro: "Welcome to our Data Visualization -- Video Game Sale!"
    },
    {
      title: "This is a tutorial",
      intro: "For the next few steps, we are going to show you how to navigate through this visualization!"
    },
    {
      element: document.querySelector('#x-axis-select'),
      title: "Attribute button",
      intro: "Different attributes of video game data, such as Year, Genre, Platform released, and Publisher."
    },
    {
      element: document.querySelector('#y-axis-select'),
      title: "Region button",
      intro: "Different regions of video game sale, such as North America, Japan, Europe, and the overall Global sum."
    }, 
    {
      element: document.querySelector('#aggregation-select'),
      title: "Metric button",
      intro: "This is about the overall unit you want to use for analysis, whether it is the Number of Copies Sold or the Number of Games Released."
    }, 
    {
      element: document.querySelector('#sort-select'),
      title: "Sort button",
      intro: "You can choose to sort by ascending or descending. Note that it ONLY works for Bar Chart."
    },
    {
      element: document.querySelector('#sort-select'),
      title: "Sort button",
      intro: "Sometimes if you want to see maximum and minimum values, you might want to look at BOTH descending and ascending orders to get the full picture."
    },
    {
      element: document.querySelector('#chart-area'),
      title: "Chart area",
      intro: "You would see two types of chart here: Bar Chart or Scatter Plot, depending on how you arrange the attributes!",
      position: "right"
    },
    {
      element: document.querySelector('#chart-summary'),
      title: "Chart summary",
      intro: "If you are lost or have trouble understanding what the chart is doing, use the summary to comprehend it! We are here for you!"
    },
    {
      element: document.querySelector('.btn-info'),
      title: "Original data",
      intro: "If you are interested in what the original raw data look like, feel free to explore it by clicking here!"
    },
    {
      element: document.querySelector('.tutorial'),
      title: "Rewatch the tutorial",
      intro: "If you want to rewatch the tutorial again, just click this button right here!"
    },
    {
      title: "Have fun!",
      intro: "This is the end of the tutorial. Wish you learn a little bit about what you can do with this viz!"
    }
  ]
}).start();