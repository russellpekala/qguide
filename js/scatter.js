Scatter = function(_parentElement, _data, _metric, _labels){

  this.parentElement = _parentElement;
  this.data = _data;
  this.metric = _metric;
  this.displayData = [];
  this.labels = _labels;

  this.initVis();
};

Scatter.prototype.initVis = function(){
  var vis = this;

  vis.margin = { top: 40, right: 10, bottom: 60, left: 70 };

  vis.width = 500 - vis.margin.left - vis.margin.right;
  vis.height = 300 - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
  vis.svg = d3.select("#" + vis.parentElement).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  vis.x = d3.scaleSqrt()
    .range([0, vis.width]);

  vis.y = d3.scaleLinear()
    .range([vis.height, 0]);

  vis.wrangleData();
};

Scatter.prototype.updateMetric = function(newMetric){
  var vis = this;

  vis.metric = newMetric;

  vis.wrangleData();
};

Scatter.prototype.wrangleData = function(){
  var vis = this;

  vis.displayData = [];
  vis.runningTotal = 0;
  vis.displayData = vis.data;

  vis.updateVis();
};

Scatter.prototype.updateVis = function(){
  var vis = this;

  vis.y.domain([0, d3.max(vis.displayData, function(d){ return d[vis.metric]; })]);
  vis.x.domain([100, d3.max(vis.displayData, function(d){ return d.num; })]);

  var colorDict = {
    rigor: 'red',
    activity: 'yellow',
    subject: 'blue'
  };

  vis.dot = vis.svg.selectAll(".dot")
    .data(vis.displayData)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 5)
    .attr("cx", function(d){ return vis.x(d.num); })
    .attr("cy", function(d){ return vis.y(d[vis.metric]); })
    .style("fill", function(d) {
      return colorDict[d.category];
    })
    .on("mouseover", function(d) {
      console.log(d.word);
    })
    .on("click", function(d){
      myhistogram.updateKey(d.word);
    });

  // Axes
  vis.svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + vis.height + ")")
    .call(d3.axisBottom(vis.x));

  vis.svg.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(vis.y));

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