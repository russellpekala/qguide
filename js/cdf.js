var parse = d3.format(".2s");

Cdf = function(_parentElement, _data, _labels){

  this.parentElement = _parentElement;
  this.data = _data;
  this.displayData = [];
  this.labels = _labels;

  this.initVis();
}

Cdf.prototype.initVis = function(){
  var vis = this;

  vis.margin = { top: 40, right: 10, bottom: 75, left: 50 };

  vis.width = 900 - vis.margin.left - vis.margin.right;
  vis.height = 300 - vis.margin.top - vis.margin.bottom;
  vis.padding = 0.25;

  // SVG drawing area
  vis.svg = d3.select("#" + vis.parentElement).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  vis.x = d3.scaleBand()
    .rangeRound([0, vis.width]).padding(vis.padding);

  vis.y = d3.scaleLinear()
    .range([vis.height, 0]);

  vis.wrangleData('department');
};


Cdf.prototype.wrangleData = function(analyzeBy){
  var vis = this;

  vis.analyzeBy = analyzeBy;

  if(analyzeBy === 'department'){
    vis.specific = $('#department-select').val();
  }
  else if(analyzeBy === 'year'){
    vis.specific = $('#first-year-select').val();
  }

  vis.displayData = [];
  vis.runningTotal = 0;
  vis.data[vis.analyzeBy][vis.specific].forEach(function(d){
    vis.displayData.push({
      label: d[0],
      freq: d[1] + vis.runningTotal
    });
    vis.runningTotal += d[1];
  });

  vis.updateVis();
};

Cdf.prototype.updateVis = function(){
  var vis = this;

  vis.svg.selectAll("text").remove();

  var widthvar = vis.width / 50;

  vis.y.domain([0, d3.max(vis.displayData, function(d){ return d.freq; })]);
  vis.x.domain(vis.displayData.map(function(d){ return d.label; }));

  vis.bar = vis.svg.selectAll(".bar").data(vis.displayData);
  vis.bar = vis.bar.enter().append("rect")
    .merge(vis.bar)
    .attr("class", "bar")
    .attr("x", function(d){
      return vis.x(d.label);
    })
    .attr("y", function(d){
      return vis.y(d.freq);
    })
    .attr("width", vis.x.bandwidth())
    .attr("height", function(d) {
      return vis.y(vis.runningTotal - d.freq);
    });

  // Axes
  vis.svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + vis.height + ")")
    .call(d3.axisBottom(vis.x))
    .selectAll("text")
    .attr("y", -vis.x.bandwidth()/2 + 1)
    .attr("x", 7)
    .attr("transform", "rotate(90)")
    .style("text-anchor", "start");

  vis.svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(vis.y).tickFormat(parse));

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