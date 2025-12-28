const platformFullNames = {
  PS3: "PlayStation 3",
  PS2: "PlayStation 2",
  PS4: "PlayStation 4",
  PS: "PlayStation",
  PSP: "PlayStation Portable",
  PSV: "PlayStation Vita",
  XB: "Xbox",
  X360: "Xbox 360",
  XOne: "Xbox One",
  DS: "Nintendo DS",
  GBA: "Game Boy Advance",
  GB: "Game Boy",
  "3DS": "Nintendo 3DS",
  GC: "GameCube",
  N64: "Nintendo 64",
  Wii: "Wii",
  WiiU: "Wii U",
  NES: "Nintendo Entertainment System",
  SNES: "Super Nintendo Entertainment System",
  GEN: "Sega Genesis",
  SAT: "Sega Saturn",
  DC: "Dreamcast",
  PC: "PC"
};

class Barchart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, xAttr, yAttr, aggregation, sortOrder) {
    // Configuration object with defaults
    this.config = {
      parentElement: _config.parentElement,
      colorScale: _config.colorScale,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 625,
      margin: _config.margin || { top: 40, right: 40, bottom: 170, left: 70 },
    };
    this.data = _data;
    this.xAttr = xAttr;
    this.yAttr = yAttr;
    this.aggregation = aggregation;
    this.sortOrder = sortOrder;
    this.initVis();
  }
  /**
   * Initialize scales/axes and append static elements, such as axis titles
   */
  initVis() {
    let vis = this;
   
   // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).select("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);
   
      // SVG Group containing the actual chart; D3 margin convention
    vis.chart = vis.svg.append("g")
      .attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Initialize scales 
    vis.xScale = d3.scaleBand().range([0, vis.width]).padding(0.1);
    vis.yScale = d3.scaleLinear().range([vis.height, 0]);

    // Initialize axes 
    vis.xAxis = d3.axisBottom(vis.xScale).tickSizeOuter(0);
    vis.yAxis = d3.axisLeft(vis.yScale).tickSizeOuter(0);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${vis.height})`);

    // Append y-axis group 
    vis.yAxisG = vis.chart.append("g")
      .attr("class", "axis y-axis");

    // Append x-axis title
    vis.xAxisLabel = vis.svg.append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")
      .attr("x", vis.config.margin.left + vis.width / 2)
      .attr("y", vis.config.margin.top + vis.height + 90)
      .style("fill", "#66ccff")
      .style("font-size", "16px");

    // Append y-axis title
    vis.yAxisLabel = vis.svg.append("text")
      .attr("class", "y-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -vis.config.margin.top - vis.height / 2)
      .attr("y", 15)
      .style("fill", "#66ccff")
      .style("font-size", "16px");

    vis.annotationsG = vis.chart
      .append("g")
      .attr("class", "annotations-group");
  }

  /**
   * Prepare data and scales before we render it
   */
  updateVis(aggregation, sortOrder) {
    let vis = this;

    vis.aggregation = aggregation;
    vis.sortOrder = sortOrder;

    const aggregatedDataMap = d3.rollups(
      vis.data,
      v => aggregation === "sum"
        ? d3.sum(v, d => d[vis.yAttr])
        : v.length,
      d => d[vis.xAttr]
    );

    vis.aggregatedData = Array.from(aggregatedDataMap, ([key, value]) => ({ key, value }))
    .sort((a, b) => sortOrder === "desc" ? b.value - a.value : a.value - b.value)
    .slice(0, 20);

    // Specificy accessor functions
    vis.colorValue = d => d.value;
    vis.xValue = d => d.key;
    vis.yValue = d => d.value;
   
    // Set the scale input domains
    vis.xScale.domain(vis.aggregatedData.map(vis.xValue));
    vis.yScale.domain([0, d3.max(vis.aggregatedData, vis.yValue)]);

    // add some annotation explaining the zero-value data
      vis.annotationSpecification = [
        {
          note: { 
            title: "Zero-value Explanation",
            label: "You may be wondering why these data are all ZERO? Well, they are all correct datapoints based on the dataset. They are zero because some publishers only launched games in specific region. Therefore, those publishers just had zero sales data. At the same time, we as designers chose to only display a part of the data at a time, therefore making you feel like the data is weird. We eventually made this design choice for the sake of loyalty to the dataset and wished our visualization can accurately reflect what it shows.",
          },
          className: "zero-value",
          type: d3.annotationCalloutRect,
          x: 0,
          y: 200,
          dy: -15,
          dx: 30,
          subject: {
            width: 890,
            height: 20,
          }
        }
      ];


    // Generate the annotation based on the given specifications
    vis.makeAnnotations = d3.annotation()
      .annotations(vis.annotationSpecification)
      .textWrap(385);

    console.log("xAttr:", vis.xAttr);
    console.log("sortOrder:", vis.sortOrder);
    console.log("aggregation:", vis.aggregation);
    console.log("yAttr:", vis.yAttr);

    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    let vis = this;


    const prepositionMap = {
      "Genre" : "of",
      "Publisher" : "by",
      "Platform" : "on"
    }

    const prepositionPhrase = prepositionMap[vis.xAttr];

    vis.chart.selectAll(".bar")
      .data(vis.aggregatedData, vis.xValue)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => vis.xScale(vis.xValue(d)))
      .attr("y", d => vis.yScale(vis.yValue(d)))
      .attr("width", vis.xScale.bandwidth())
      .attr("height", d => vis.height - vis.yScale(vis.yValue(d)))
      .attr("fill", d => vis.config.colorScale(vis.colorValue(d)))
      .on("mouseover", (event, d) => {
        const fullName = platformFullNames[d.key] || d.key;
        d3.select("#tooltip")
          .style("display", "block")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`)
          .style("background-color", "white")    
          .style("border", "solid")               
          .style("border-width", "1px")          
          .style("border-radius", "5px")           
          .style("padding", "10px")               
          .style("color", "black")                 
          .style("font-size", "14px")              
          .style("box-shadow", "0px 4px 8px rgba(0,0,0,0.2)") 
          .html(`
            <div class="barchart-tooltip-title">
               <div><strong>${vis.xAttr}:</strong> ${fullName}</div>
            </div>
            <div>${vis.aggregation === "sum" ? vis.yAttr.replace("_", " ") : "# of Games"}: ${d.value.toFixed(2)}</div>
            <ul>
              <li>Top 3 Games ${prepositionPhrase} ${d.key} (in millions of copies sold): 
                <ol>
                  ${
                    vis.data
                    .filter(g => g[vis.xAttr] === d.key)
                    .slice(0, 3)
                    .map(g => `
                      <li>
                        <strong>${g.Name}</strong> - (${g.Platform})<br>
                        ${d3.format(".2f")(g[vis.yAttr])}M
                      </li>
                    `)
                    .join('')
                  }
                </ol>
              </li>
            </ul>
          `);
      })
      .on("mousemove", event => {
        vis.positionTooltip(event);
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("display", "none");
      });

    vis.xAxisG.transition()
      .duration(2000)
      .call(vis.xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("x", -10)
      .attr("y", 10)
      .style("text-anchor", "end")
      .style("font-size", "12px");

    vis.yAxisG
    .transition()
    .duration(2000)
    .call(vis.yAxis);

    if (vis.xAttr === "Publisher") {
      vis.xAxisLabel.attr("y", vis.config.margin.top + vis.height + 130);
    } else {
      vis.xAxisLabel.attr("y", vis.config.margin.top + vis.height + 90);
    }

    vis.xAxisLabel.text(vis.xAttr);
    vis.yAxisLabel.text(
      vis.aggregation === "sum"
        ? `${vis.yAttr.replace("_", " ")} (in millions)`
        : `# of Games ${regionFromYAttr(vis.yAttr)}`
    );

    // Publisher + ascending + non-Global sales + total sales
    if (vis.xAttr === "Publisher" && vis.sortOrder === "asc" && 
      vis.yAttr != "Global_Sales" && vis.aggregation === "sum"){
        // Add annotation elements to the SVG
        vis.annotationsG.selectAll("*").remove(); // clear old annotations
        vis.annotationsG.raise();
        vis.annotationsG.call(vis.makeAnnotations);
      } else {
        vis.annotationsG.selectAll("*").remove(); // clear if not needed
      }
  }
  // dynamically position the tooltip so that it always stays within the screen
  positionTooltip(event) {
    const tooltip = d3.select('#tooltip');
    const tooltipPadding = 10; // or use this.config.tooltipPadding if you add it
    const screenPadding = 16;
  
    const tooltipNode = tooltip.node();
    const tooltipWidth = tooltipNode.offsetWidth;
    const tooltipHeight = tooltipNode.offsetHeight;
  
    let x = event.pageX + tooltipPadding;
    let y = event.pageY + tooltipPadding;
  
    // Avoid right overflow
    if (x + tooltipWidth + screenPadding > window.innerWidth) {
      x = event.pageX - tooltipWidth - tooltipPadding;
    }
  
    // Avoid bottom overflow
    if (y + tooltipHeight + screenPadding > window.innerHeight) {
      y = event.pageY - tooltipHeight - tooltipPadding;
    }
  
    tooltip.style('left', `${x}px`).style('top', `${y}px`);
  }  
}

// Helper function for y-axis label
function regionFromYAttr(yAttr) {
  switch (yAttr) {
    case "Global_Sales": return "(Worldwide)";
    case "NA_Sales": return "in North America";
    case "EU_Sales": return "in Europe";
    case "JP_Sales": return "in Japan";
    case "Other_Sales": return "in Other Regions";
    default: return "";
  }
}

