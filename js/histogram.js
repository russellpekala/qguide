
var parse = d3.format(".2s");

Histogram = function(_parentElement, _data, _startKey, _labels, _numTicks, _maxX){
  var vis = this;

  vis.parentElement = _parentElement;
  vis.data = _data;
  vis.displayData = [];
  vis.key = _startKey;
  vis.labels = _labels;
  vis.numTicks = _numTicks;
  vis.maxX = _maxX;

  vis.initVis();
};


/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */

Histogram.prototype.initVis = function(){
  var vis = this;

  vis.margin = { top: 40, right: 10, bottom: 70, left: 50 };

  vis.width = 500 - vis.margin.left - vis.margin.right;
  vis.height = 300 - vis.margin.top - vis.margin.bottom;
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
    .attr("class", "y-axis")

  vis.wrangleData(vis.key);
};

Histogram.prototype.updateKey = function(newKey){
  var vis = this;

  if (newKey === undefined){
    vis.key = $('#enrollment-select').val();
  }
  else {
    vis.key = newKey;
  }

  vis.wrangleData();
};

Histogram.prototype.wrangleData = function(){
  var vis = this;

  vis.displayData = vis.data[vis.key];

  vis.displayData.forEach(function(d, i){
    vis.displayData[i] = Math.min(d, vis.maxX); // Truncate points.
  });

  vis.x.domain(d3.extent(vis.displayData, function(d){ return d; }));

  vis.bins = d3.histogram()
    .domain(vis.x.domain())
    .thresholds(vis.x.ticks(vis.numTicks))
    (vis.displayData);

  vis.updateVis();
};

Histogram.prototype.updateVis = function(){
  var vis = this;

  vis.svg.selectAll(".label").remove();

  vis.y.domain([0, d3.max(vis.bins, function(d) { return d.length; })]);

  var widthvar = vis.x(vis.bins[0].x1) - vis.x(vis.bins[0].x0);

  vis.bar = vis.svg.selectAll(".bar").data(vis.bins);
  vis.bar = vis.bar.enter().append("rect")
    .merge(vis.bar)
    .attr("class", "bar")
    .attr("x", function(d) {
      return (vis.x(d.x0));
    })
    .attr("y", function(d){
      return vis.y(d.length);
    })
    .attr("height", function(d){
      return vis.height - vis.y(d.length);
    })
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
    .call(vis.yAxis);

  // Labels
  vis.svg.append('text')
    .attr('class', 'title label')
    .attr('text-anchor', 'middle')
    .attr('transform', "translate("+ vis.width/2 +","+ (-20) +")")
    .text(vis.labels.title);

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

