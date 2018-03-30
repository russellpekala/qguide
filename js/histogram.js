
var parse = d3.format(".2s");

Histogram = function(_parentElement, _data, _startKey, _labels, _maxX, _numTicks, _size, _categories){
  var vis = this;

  vis.parentElement = _parentElement;
  vis.data = _data;
  vis.displayData = [];
  vis.key = _startKey;
  vis.labels = _labels;
  vis.maxX = _maxX;
  vis.numTicks = _numTicks;
  vis.size = _size;
  vis.view = "length";
  vis.categories = _categories;

  vis.initVis();
};


/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */

Histogram.prototype.initVis = function(){
  var vis = this;

  vis.margin = vis.size.margin ? vis.size.margin : { top: 40, right: 30, bottom: 70, left: 50 };

  vis.width = (vis.size.width ? vis.size.width : 500) - vis.margin.left - vis.margin.right;
  vis.height = (vis.size.height ? vis.size.height : 300) - vis.margin.top - vis.margin.bottom;
  vis.padding = .25;

  // SVG drawing area
  vis.svg = d3.select("#" + vis.parentElement).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  vis.x = d3.scaleLinear()
    .range([0, vis.width]);

  vis.y = d3.scaleLinear()
    .range([vis.height, 0]);

  vis.xAxisg = vis.svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + vis.height + ")");

  vis.yAxis = vis.svg.append("g")
    .attr("class", "y-axis");

  vis.color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(Object.values(vis.categories).map(function(d){ return d.category; }).unique());

  vis.wrangleData();
};

Histogram.prototype.updateKey = function(newKey, newCat){
  var vis = this;

  if (newKey === undefined){
    vis.key = $('#enrollment-select').val();
  }
  else {
    vis.key = newKey;
  }

  vis.cat = newCat;

  vis.wrangleData();
};

Histogram.prototype.updateView = function(newView){
    var vis = this;

    vis.view = $("#view-select").val();

    vis.wrangleData();
};

Histogram.prototype.wrangleData = function(){
  var vis = this;

  if (vis.key === "nothing"){
    vis.displayData = [];
    vis.svg.append("text")
        .attr("id", "warning")
        .attr("x", vis.width / 2)
        .attr("y", vis.height / 2)
        .style("text-anchor", "middle")
        .text("Click a dot");
  }
  else {
    vis.displayData = vis.data[vis.key]
  }

  vis.displayData.forEach(function(d, i){
    vis.displayData[i] = Math.min(d, vis.maxX); // Truncate points.
  });

  vis.x.domain([0, d3.max(vis.displayData, function(d){ return d; })]);

  vis.bins = vis.key === "nothing" ? [] : d3.histogram()
    .domain(vis.x.domain())
    .thresholds(vis.x.ticks(vis.numTicks))
    (vis.displayData);

  vis.bins2 = vis.bins.map(function(d){
    if (d.length === 0){
      return {
          val: 0,
          x0: d.x0,
          x1: d.x1
      }
    }
    else {
      return {
          val: d.reduce(function(a, b){
             return a + b;
          }),
          x0: d.x0,
          x1: d.x1
      }
    }
  });

  vis.binUp = vis.view === "val" ? vis.bins2 : vis.bins;
  vis.updateVis();
};

Histogram.prototype.updateVis = function(){
  var vis = this;

  vis.svg.selectAll(".label").remove();
  if (vis.key !== "nothing"){
    vis.svg.select("#warning").remove();
  }

  // vis.view = length or val
  vis.y.domain([0, d3.max(vis.binUp, function(d) { return d[vis.view]; })]);


  var widthvar = vis.key === "nothing" ? 0 : (vis.x(vis.bins[0].x1) - vis.x(vis.bins[0].x0));

  vis.bar = vis.svg.selectAll(".bar").data(vis.binUp);
  vis.bar = vis.bar.enter().append("rect")
    .merge(vis.bar)
      .transition()
      .duration(500)
    .attr("class", "bar")
    .attr("x", function(d) {
      return (vis.x(d.x0));
    })
    .attr("y", function(d){
      return vis.y(d[vis.view]);
    })
    .attr("height", function(d){
      return vis.height - vis.y(d[vis.view]);
    })
    .style("fill", function(d) {
        return vis.cat;
    })
      .style("opacity", 0.6)
    .attr("width", widthvar * (1 - vis.padding));

  vis.xAxis = d3.axisBottom(vis.x);
  vis.yAxis = d3.axisLeft(vis.y).tickFormat(parse);

  vis.svg.select(".x-axis")
    .transition()
    .duration(500)
    .call(vis.xAxis);

  vis.svg.select(".y-axis")
    .transition()
    .duration(500)
    .call(vis.yAxis.ticks(3));

  // Labels
  vis.svg.append('text')
    .attr('class', 'axis-label label')
    .attr('text-anchor', 'middle')
    .attr('transform', "translate("+ vis.width/2 +","+ (vis.height + 30) +")")
    .text(vis.labels.x);

  vis.svg.append('text')
    .attr('class', 'axis-label label')
    .attr('text-anchor', 'middle')
    .attr('transform', "translate(-37, " + (vis.height / 2) + ")rotate(-90)")
    .text(vis.labels.y);

};

