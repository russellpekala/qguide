Barchart = function(_parentElement, _data, _year, _metric, _metrics, _conventions, _categories){

  this.parentElement = _parentElement;
  this.data = _data;
  this.year = _year;
  this.metric = _metric;
  this.metrics = _metrics;
  this.conventions = _conventions;
  this.displayData = [];

    // this.preprocess();
    this.categories = _categories;
  this.initVis();
    this.preprocess();
    this.wrangleData();

};

Barchart.prototype.initVis = function(){
  var vis = this;

  vis.margin = { top: 40, right: 60, bottom: 25, left: 60 };

  vis.width = 700 - vis.margin.left - vis.margin.right;
  vis.gap = 40; // in pixels
  vis.widthLeft = 400;
  vis.widthRight = vis.width - vis.widthLeft - vis.gap;
  vis.height = 500 - vis.margin.top - vis.margin.bottom;
  vis.padding = 0.25;

  // SVG drawing area
  vis.svg = d3.select("#" + vis.parentElement).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  vis.y = d3.scaleBand()
    .rangeRound([0, vis.height])
    .padding(vis.padding);

  vis.xleft = d3.scaleLinear()
    .rangeRound([0, vis.widthLeft]);

    vis.xright = d3.scaleLinear()
        .rangeRound([0, vis.widthRight]);

  vis.color = d3.scaleOrdinal()
    .range([
        "#FFCCD6",
        "#D8ADB6",
        "#F27991",
        "#A80022",
        "#992233",
        "green",
        "blue"]);

  vis.yAxis = d3.axisLeft(vis.y);

  vis.numSelected = 30;

  vis.tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d, i) { return (vis.categories[d.dept].name +
                                    ": " + (d.name.substr(d.name.length - 3) === "var" ? d3.format(".1f") : d3.format(".0%"))
                                            (d.x1 - d.x0)); } );
};

Barchart.prototype.wrangleData = function(){
  var vis = this;
  vis.displayData = vis.data.filter(function(d){
    return (d.year == vis.year);
  }).slice(0, vis.numSelected - 1);

  vis.sort();
};

Barchart.prototype.changeYear = function(){
  var vis = this;

  vis.year = $('#year-select').val();

  vis.wrangleData();
};

Barchart.prototype.changeMetric = function(){
  var vis = this;

  vis.metric = $('#metric-select').val();

  vis.wrangleData();
};

Barchart.prototype.sort = function(){
  var vis = this;

  var sorting = $('#sort-select').val();
  if(sorting === 'alphabetical'){
    vis.displayData.sort(function(a, b){
      if(a.department1 < b.department1){
        return -1;
      }
      else {
        return 1;
      }
    });
  }
  else if(sorting === 'mean'){
    vis.displayData.sort(function(a, b){
      if(a[vis.metric + '_mean'] < b[vis.metric + '_mean']){
        return -1;
      }
      else {
        return 1;
      }
    });
  }
  else if(sorting === 'instdev'){
    vis.displayData.sort(function(a, b){
      if(a[vis.metric + '_instdev'] < b[vis.metric + '_instdev']){
        return -1;
      }
      else {
        return 1;
      }
    });
  }
  else if(sorting === 'outstdev'){
    vis.displayData.sort(function(a, b){
      if(a[vis.metric + '_outstdev'] < b[vis.metric + '_outstdev']){
        return -1;
      }
      else {
        return 1;
      }
    });
  }

  vis.updateVis();
};

Barchart.prototype.updateVis = function() {
  var vis = this;

    vis.svg.call(vis.tool_tip);
  vis.svg.selectAll("text").remove();

  vis.xleft.domain([0, d3.max(vis.displayData, function(d) {
    return d[vis.metric + '_boxes']["4"].x1;
  })]);
    vis.xright.domain([0, d3.max(vis.displayData, function(d) {
        return d[vis.metric + '_boxes']["6"].x1;
    })]);
  vis.y.domain(vis.displayData.map(function(d) { return d.department1; }));
  vis.color.domain(makeColorDomain(vis.metric));

  // Legend stuff
  vis.barLegendHolder = vis.svg.append("g")
    .attr("class", "legend-holder")
    .attr("id", "bar-legend-holder");

  vis.legendTab = [0, 80, 160, 240, 320, 400, 480];

  vis.barLegend = vis.barLegendHolder.selectAll(".legend")
    .data(makeColorDomain(vis.metric));

  vis.barLegend2 = vis.barLegend.enter().append("rect")
    .merge(vis.barLegend)
      .attr("class", function(d){ return "legend " + d; })
    .attr("x", function(d, i) { return vis.legendTab[i]; })
    .attr("y", -35)
    .attr("width", 18)
    .attr("height", 18)
      .style("stroke-width", 2)
      .style("stroke", "#000000")
      .style("opacity", 0.6)
    .style("fill", vis.color)
      .on("mouseover", function(d){
        var subbarsOfThisCategory = d3.selectAll("." + d);
        subbarsOfThisCategory.style("opacity", 1);
      })
      .on("mouseout", function(d){
          var subbarsOfThisCategory = d3.selectAll("." + d);
          subbarsOfThisCategory.style("opacity", 0.6);
      });

  vis.barLegendText = vis.barLegend;
  vis.barLegendText = vis.barLegendText.enter().append("text")
    .merge(vis.barLegendText)
    .attr("x", function(d, i){ return vis.legendTab[i] + 21; })
    .attr("y", -27)
    .attr("dy", ".35em")
    .style("text-anchor", "begin")
    .style("font" ,"10px sans-serif")
    .text(function(d, i){
      if(i <= 4){
        return vis.conventions[vis.metric]["intervals"][i].label;
      }
      else if (i == 5){
        return "In-Variance";
      }
      else if (i == 6){
          return "Out-Variance";
      }

    });

  d3.selectAll(".axis")
    .style("fill", "none")
    .style("stroke", "#000")
    .style("shape-rendering", "crispEdges");

  var barMove = vis.width/2 - vis.barLegendHolder.node().getBBox().width/2;
  d3.selectAll("#bar-legend-holder").attr("transform", "translate(" + barMove  + ",0)");

  vis.svg.append("g")
    .attr("class", "y-axis")
    .call(vis.yAxis);

  vis.bars = vis.svg.selectAll(".bar").data(vis.displayData);
  vis.bars = vis.bars.enter().append("g")
    .merge(vis.bars)
      .attr("class", function(d){ return "bar " + d.department1; })
    .attr("transform", function(d) { return "translate(0," + vis.y(d.department1) + ")"; });

  vis.text1 = vis.bars.append("text")
    .attr("x", function(d) { return 420; })
    .attr("y", vis.y.bandwidth()/2)
    .attr("dy", "0.5em")
    .attr("dx", "0.5em")
    .style("font" ,"12px sans-serif")
    .style("text-anchor", "end")
    .style("fill", 'black')
    .style("cursor", "pointer")
    .text(function(d) {
      return d3.format(".1f")(d[vis.metric + '_mean']);
    });

  vis.subbars = vis.bars.selectAll("rect")
    .data(function(d){ return d[vis.metric + '_boxes']; });

  vis.subbars = vis.subbars.enter().append("rect")
    .merge(vis.subbars)
    .on('mouseover', function(d) {
      var barsInThatDept = d3.selectAll("g." + d.dept + " rect");
      barsInThatDept.style("opacity", 1);
        vis.tool_tip.show(d);
      d3.select(this).style("fill", "red");
    })
    .on('mouseout', function(d) {
        var barsInThatDept = d3.selectAll("g." + d.dept + " rect");
        barsInThatDept.style("opacity", 0.6);
      vis.tool_tip.hide();
      d3.select(this).style("fill", function(d) { return vis.color(d.name); });
    })
    .attr("class", function(d){
      return d.name + " subrect";
    })
    .transition()
    .duration(1000)
    .attr("height", vis.y.bandwidth)
    .attr("x", function(d, i) {
      if(i <=4 ) { return vis.xleft(d.x0) } else { return vis.widthLeft + vis.gap + vis.xright(d.x0); };
    })
    .attr("width", function(d, i) {
      if (i <= 4) { return vis.xleft(d.x1) - vis.xleft(d.x0) } else { return vis.xright(d.x1) - vis.xright(d.x0)};
    })
    .style("fill", function(d) { return vis.color(d.name); })
      .style("opacity", 0.6)
      .style("stroke-width", 1)
      .style("stroke", "black")
    .style("cursor", "pointer");

  // vis.bars.exit().remove();
  // vis.subbars.exit().remove();
};

// Data specific wrangling functions
function makeColorDomain(metric){
  var lst = [];
  var nums = [1,2,3,4,5];
  nums.forEach(function(d){
    lst.push(metric + '_s' + d.toString());
  });
  return lst.concat([metric + '_invar', metric + '_outvar']);
}

Barchart.prototype.preprocess = function() {
  var vis = this;

  vis.data.forEach(function(d) {
    // Get the survey boxes in
    vis.metrics.forEach(function(m){
      var x0 = 0, idx = 0;
      d[m + '_boxes'] = makeColorDomain(m).map(function(name) {
        return {
          name: name,
          x0: x0,
          x1: x0 += d[name],
            dept: d.department1
        };
      });
      // Normalize
      var total = d[m + '_boxes'][4].x1;
      d[m + '_boxes'].forEach(function(d){
        d.x0 = d.x0/total;
        d.x1 = d.x1/total;
      });
      // Add in stats
        var invar = d[m + "_instdev"] * d[m + "_instdev"];
        var outvar = d[m + "_outstdev"] * d[m + "_outstdev"];
        d[m + '_boxes'] = d[m + '_boxes'].slice(0,5);
      d[m + '_boxes'].push({
              name: m + "_invar",
              x0: 0,
              x1: invar,
              dept: d.department1
          });
      d[m + '_boxes'].push({
          name: m + "_outvar",
          x0: invar,
          x1: invar + outvar,
          dept: d.department1
      });
    });

  });
};
