class Scatterplot {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        colorScale: _config.colorScale,
        containerWidth: _config.containerWidth || 1000,
        containerHeight: _config.containerHeight || 625,
        margin: _config.margin || { top: 25, right: 20, bottom: 110, left: 60 },
        tooltipPadding: _config.tooltipPadding || 15
      };
      this.data = _data;
      this.xAttr = 'Year';          // Always Year
      this.yAttr = 'Global_Sales';   // Default yAttr
      this.aggregation = 'sum';      // Default aggregation
      this.initVis();
    }
    /**
    * We initialize scales/axes and append static elements, such as axis titles.
    */
    initVis() {
      let vis = this;

      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
       // Initialize scales
      vis.xScale = d3.scaleLinear().range([0, vis.width]);
      vis.yScale = d3.scaleLinear().range([vis.height, 0]);
  
      // Initialize axes
      vis.xAxis = d3.axisBottom(vis.xScale).ticks(6).tickSize(-vis.height - 10).tickFormat(d3.format("d")).tickPadding(10);
      vis.yAxis = d3.axisLeft(vis.yScale).ticks(6).tickSize(-vis.width - 10).tickPadding(10);
  
      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement).select('svg')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);
  
      // Append group element that will contain our actual chart 
      // and position it according to the given margin config
      vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
  
      // Append empty x-axis group and move it to the bottom of the chart
      vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
      // Append y-axis group
      vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');
      
      // Append x-axis title
      vis.xAxisLabel = vis.svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("x", vis.config.margin.left + vis.width / 2)
        .attr("y", vis.config.margin.top + vis.height + 75)
        .style("fill", "#66ccff")
        .style("font-size", "16px")
        .text('Release Year'); // Always fixed
  
      // Append y-axis title
      vis.yAxisLabel = vis.svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -vis.config.margin.top - vis.height / 2)
        .attr("y", 15)
        .style("fill", "#66ccff")
        .style("font-size", "16px");
  
      vis.symbol = d3.symbol().type(d3.symbolCircle).size(240);
    }
  
  /**
   * Prepare the data and scales before we render it.
   */
    updateVis(yAttr = 'Global_Sales', aggregation = 'sum') {
      let vis = this;

        console.log(vis.data);

        vis.yAttr = yAttr;
        vis.aggregation = aggregation;

        const aggregatedData = d3.rollups(
          vis.data,
          v => aggregation === "sum"
            ? d3.sum(v, d => d[yAttr])
            : v.length,
          d => +d[vis.xAttr]
        ).map(([key, value]) => ({ key, value }));
    
        vis.aggregatedData = aggregatedData;
        console.log("Scatterplot data points:", vis.aggregatedData.length);

        // Specificy accessor functions
        vis.xValue = d => d.key;
        vis.yValue = d => d.value;
        vis.colorValue = d => d.value;
    
        // Set the scale input domains
        vis.xScale.domain(d3.extent(aggregatedData, vis.xValue));
        vis.yScale.domain([0, d3.max(aggregatedData, vis.yValue)]);
        
        vis.config.colorScale.domain([0, d3.max(vis.aggregatedData, vis.yValue)]);

        vis.yAxisLabel.text(
          aggregation === 'sum'
            ? `${yAttr.replace("_", " ")} (in millions)`
            : `# of Games ${regionFromYAttr(yAttr)}`
        );
    
        vis.renderVis();
      }

  /**
    * Bind data to visual elements.
    */
    renderVis() {
      let vis = this;
       
      // Add circles
      const symbols = vis.chart.selectAll('.circle')
        .data(vis.aggregatedData)
        .join('path')
        .attr('class', 'circle')
        .attr('transform', d => `translate(${vis.xScale(vis.xValue(d))}, ${vis.yScale(vis.yValue(d))})`)
        .attr('fill', d => vis.config.colorScale(vis.colorValue(d)))
        .attr('stroke', 'black')
        .attr('d', vis.symbol);

      // Tooltip event listeners
      symbols.on('mouseover', (event, d) => {
        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', `${event.pageX + vis.config.tooltipPadding}px`)
          .style('top', `${event.pageY + vis.config.tooltipPadding}px`)
          .style("background-color", "white")
          .style("border", "solid")
          .style("border-width", "1px")
          .style("border-radius", "5px")
          .style("padding", "10px")
          .html(`
            <div class="tooltip-title">${d.key}</div>
            <ul>
              <li>${vis.aggregation === 'sum' ? `${d3.format(".4~g")(d.value)} million units` : `Count: ${d3.format(".4~g")(d.value)}`}</li>
              <li>Top 3 Games in ${d.key} (in millions of copies sold): 
                <ol>
                  ${
                    vis.data
                    .filter(g => +g[vis.xAttr] === d.key)
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
      .on('mousemove', event => {
        vis.positionToolTip(event);
      })
      .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
      });
  
      vis.xAxisG.call(vis.xAxis).call(g => g.select('.domain').remove());
      vis.yAxisG.call(vis.yAxis).call(g => g.select('.domain').remove());
  
      vis.renderColorLegend();
    }
    
    /**
    * Generate color legend
    */
    renderColorLegend() {
      const vis = this;
      const colorScale = vis.config.colorScale;
      if (!colorScale || typeof colorScale.domain !== 'function') return;
    
      const domain = colorScale.domain();
      const legendWidth = 20;
      const legendHeight = 200;
    
      vis.svg.selectAll(".legend").remove();
    
      const defs = vis.svg.append("defs");
      const gradient = defs.append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "100%")
        .attr("y2", "0%");
    
      gradient.append("stop").attr("offset", "0%").attr("stop-color", colorScale(domain[0]));
      gradient.append("stop").attr("offset", "100%").attr("stop-color", colorScale(domain[1]));
    
      const legend = vis.svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${vis.config.containerWidth - 80}, ${vis.config.margin.top})`);
    
      legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");
    
      const legendScale = d3.scaleLinear()
        .domain(domain)
        .range([legendHeight, 0]);
    
      const tickValues = d3.ticks(domain[0], domain[1], 4); 

      const legendAxis = d3.axisRight(legendScale)
        .tickValues(tickValues)
        .tickFormat(d => 
                      (vis.aggregation === 'sum' ? 
                        `${d3.format(".4")(d)}M` : 
                        `${d3.format(".4")(d)}`)); 

      legend.append("g")
        .attr("transform", `translate(${legendWidth}, 0)`)
        .call(legendAxis)
        .select(".domain").remove();

      legend.append("text")
        .attr("x", legendWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("Legend");
    }   
    
    positionToolTip(event) {
      const tooltip = d3.select('#tooltip');
      const tooltipPadding = this.config.tooltipPadding;
      const screenPadding = 16;
  
      const tooltipNode = tooltip.node();
      const tooltipWidth = tooltipNode.offsetWidth;
      const tooltipHeight = tooltipNode.offsetHeight;
  
      let x = event.pageX + tooltipPadding;
      let y = event.pageY + tooltipPadding;
  
      // If overflow on right, move to left of cursor
      if (x + tooltipWidth + screenPadding > window.innerWidth) {
        x = event.pageX - tooltipWidth - tooltipPadding;
      }
  
      // If overflow on bottom, move above cursor
      if (y + tooltipHeight + screenPadding > window.innerHeight) {
        y = event.pageY - tooltipHeight - tooltipPadding;
      }
  
      tooltip.style('left', `${x}px`)
            .style('top', `${y}px`);
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