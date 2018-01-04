

Histogram = function(_parentElement, _data, _startWord){
  var vis = this;

  vis.parentElement = _parentElement;
  vis.data = _data;
  vis.displayData = [];
  vis.word = _startWord;

  vis.initVis();
}


/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */

Histogram.prototype.initVis = function(){
  var vis = this;

  vis.margin = { top: 40, right: 0, bottom: 20, left: 30 };

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
    .range([0, vis.height]);

  vis.wrangleData(vis.word);
};

Histogram.prototype.updateWord = function(newWord){
  var vis = this;

  vis.word = newWord;

  vis.wrangleData();
}

Histogram.prototype.wrangleData = function(){
  var vis = this;

  vis.displayData = vis.data[vis.word];
  console.log(vis.displayData);
  console.log('display above');

  vis.x.domain([0, 15]);

  vis.bins = d3.histogram()
    .domain(vis.x.domain())
    .thresholds(vis.x.ticks(30))
    (vis.displayData);

  vis.updateVis();
};

Histogram.prototype.updateVis = function(){
  var vis = this;

  vis.y.domain([0, d3.max(vis.bins, function(d) { return d.length; })]);

  var widthvar = vis.x(vis.bins[0].x1) - vis.x(vis.bins[0].x0);

  vis.bar = vis.svg.selectAll(".bar").data(vis.bins);
  vis.bar = vis.bar.enter().append("rect")
    .merge(vis.bar)
    .attr("class", "bar")
    .attr("x", function(d) {
      return vis.x(d.x0);
    })
    .attr("y", function(d){
      return vis.height - vis.y(d.length);
    })
    .attr("height", function(d){
      return vis.y(d.length);
    })
    .attr("width", widthvar * (1 - vis.padding));


  vis.svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + vis.height + ")")
    .call(d3.axisBottom(vis.x));


};

