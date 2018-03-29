Scatter = function(_parentElement, _data, _metricX, _metricY, _labels, _size, _isWorkScatter, _categories){

  this.parentElement = _parentElement;
  this.data = _data;
  this.metricY = _metricY;
  this.metricX = _metricX;
  this.displayData = [];
  this.labels = _labels;
  this.labelStatus = $("#label-select").val();
  this.size = _size;
  this.isWorkScatter = _isWorkScatter;
  this.department = "MATH";
  this.categories = _categories;

  this.initVis();
};

Scatter.prototype.initVis = function(){
  var vis = this;

  vis.margin = vis.size.margin ? vis.size.margin : { top: 40, right: 30, bottom: 70, left: 50 };

  vis.width = (vis.size.width ? vis.size.width : 500) - vis.margin.left - vis.margin.right;
  vis.height = (vis.size.height ? vis.size.height : 300) - vis.margin.top - vis.margin.bottom;

  // SVG drawing area
  vis.svg = d3.select("#" + vis.parentElement).append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  vis.y = d3.scaleLinear()
    .range([vis.height, 0]);

  vis.x = d3.scaleLinear()
    .range([0, vis.width]);

    vis.xAxisg = vis.svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.yAxisg = vis.svg.append("g")
        .attr("class", "y-axis");

    Array.prototype.unique = function() {
        return this.filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });
    };

    // Color only relevant for word categories one.
    if (!vis.isWorkScatter){
        vis.color = d3.scaleOrdinal()
            .range(['#32CD32', "#ff00ff", "#7fffd4"])
            .domain(vis.data.map(function(d){ return d.category; }).unique());

        vis.activeCategories = vis.color.domain().slice(0, 2); // By default show the first two.
    }
    else {
        vis.color = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(Object.values(vis.categories).map(function(d){ return d.category; }).unique());
        vis.enrollmentScale = d3.scaleLinear()
            .range([2, 10]);
        vis.sizer = "Enrollment";
    }

  vis.wrangleData();
};

Scatter.prototype.updateMetricY = function(newMetricY){
  var vis = this;

  vis.metricY = newMetricY;

  vis.wrangleData();
};


Scatter.prototype.wrangleData = function(){
  var vis = this;

    var v = $("#update-term").val();
    vis.term = v.split("_")[1];
    vis.year = v.split("_")[0];

  vis.displayData = [];
  if (vis.isWorkScatter){
    vis.displayData = vis.data.filter(function(d, i){
        return ((d.department === vis.department) &&
            (d.term === vis.term) &&
            (d.year === vis.year));
    });
  }
  else {
      vis.displayData = vis.data.filter(function(d){
          return vis.activeCategories.indexOf(d.category) >= 0;
      });
  }

  vis.updateVis();
};

Scatter.prototype.labelChange = function(){
    var vis = this;
    vis.labelStatus = $("#label-select").val();
    vis.wrangleData();
};

Scatter.prototype.metricChangeY = function(){
    var vis = this;
    vis.metricY = $("#metric-select-scatter").val();
    vis.wrangleData();
};

Scatter.prototype.adjustCategories = function(val){
    var vis = this;
    var idx = vis.activeCategories.indexOf(val);
    if(idx >= 0){
      vis.activeCategories.splice(idx, 1)
    }
    else {
      vis.activeCategories.push(val);
    }

    vis.wrangleData();
};

var tool_tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) { return d.Course });

Scatter.prototype.updateDept = function(){
    var vis = this;

    vis.department = $("#department-select").val();

    vis.wrangleData();
};

Scatter.prototype.updateVis = function(){
  var vis = this;
  vis.svg.call(tool_tip);
  vis.svg.selectAll(".axis-label").remove();
  vis.svg.selectAll(".legend-text").remove();
  vis.svg.selectAll(".legend").remove();


  vis.y.domain([0, d3.max(vis.displayData, function(d){
      return d[vis.metricY];
  })]);

  if (vis.isWorkScatter){
      vis.y.domain([2, 5]); // Approx domain for rating.
      vis.x.domain([0, d3.max(vis.displayData, function(d){
          return +d[vis.metricX];
      })]);
      vis.enrollmentScale.domain(d3.extent(vis.displayData, function(d){
          return +d[vis.sizer];
      }));
  }
  else {
      vis.x.domain([0, 10]); // Approx domain for workload.
  }

  vis.xAxis = d3.axisBottom(vis.x);
  vis.yAxis = d3.axisLeft(vis.y).tickFormat(parse);

  vis.svg.select(".x-axis")
      .transition()
      .duration(500)
      .call(vis.xAxis);

  vis.svg.select(".y-axis")
      .transition()
      .duration(500)
      .call(vis.yAxis.ticks(5));

  vis.svg.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', "translate("+ vis.width/2 +","+ (vis.height + 30) +")")
      .text(vis.labels.x);

  vis.svg.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', "translate(-37, " + (vis.height / 2) + ")rotate(-90)")
      .text(vis.labels.y);

  vis.dot = vis.svg.selectAll(".dot")
    .data(vis.displayData);

  vis.dot.enter().append("circle")
        .attr("class", "dot")
        .attr("r", function(d){
            return !vis.isWorkScatter ? 5 : vis.enrollmentScale(d[vis.sizer]);
        })
      .merge(vis.dot)
        .attr("cx", function(d){
            return vis.x(d[vis.metricX]);
        })
        .attr("cy", function(d){ return vis.y(d[vis.metricY]); })
        .style("fill", function(d) {
            if(vis.isWorkScatter){
                return vis.color(vis.categories[d.department].category);
            }
            else {
                return vis.color(d.category);
            }

        })
      .style("opacity", 0.6)
        .on("mouseover", tool_tip.show)
          .on("mouseout", tool_tip.hide)
        .on("click", function(d){
          $("#scatter .dot").css("opacity", 0.6).attr("r", 5);
          this.style.opacity = 1;
          this.setAttribute("r", 8);
          myhistogram.updateKey(d.name); // Adjust histogram below
        });

    vis.dot.exit().remove();

    vis.label = vis.svg.selectAll(".label")
        .data(vis.labelStatus === "true" ? vis.displayData : []);

    vis.label.enter().append("text")
        .attr("class", "label")
        .attr("r", 5)
        .merge(vis.label)
        .attr("x", function(d){ return 8 + vis.x(d[vis.metricX]); })
        .attr("y", function(d){ return 3 + vis.y(d[vis.metricY]); })
        .text(function(d){ return d.name; });

    vis.label.exit().remove();

    // Legend stuff
    if (!vis.isWorkScatter){
        vis.legendHolder = vis.svg.append("g")
            .attr("class", "legend-holder")
            .attr("id", "bar-legend-holder");

        vis.legend = vis.legendHolder.selectAll(".legend")
            .data(vis.color.domain());

        vis.legend = vis.legend.enter().append("rect")
            .merge(vis.legend)
            .attr("class", "legend")
            .attr("x",  vis.width + 30)
            .attr("y", function(d, i) { return i * 20; })
            .attr("width", 10)
            .attr("height", 10)
            .on("click", function(d){
                vis.adjustCategories(d);
            })
            .attr("opacity", function(d){ return vis.activeCategories.indexOf(d) >= 0 ? 1 : .3; })
            .style("fill", vis.color);

        vis.legend.exit().remove();

        vis.legendText = vis.legendHolder.selectAll(".legend-text")
            .data(vis.color.domain());

        vis.legendText = vis.legendText.enter().append("text")
            .attr("class", "legend-text")
            .merge(vis.legendText)
            .attr("x",  vis.width + 30 + 15)
            .attr("y", function(d, i){ return i * 20 + 5;})
            .attr("dy", ".35em")
            .style("text-anchor", "begin")
            .style("font" ,"10px sans-serif")
            .style("font-weight" , function(d){
                return vis.activeCategories.indexOf(d) >= 0 ? "bolder" : "normal";
            })
            .text(function(d){
                return d;
            });

        vis.legendText.exit().remove();
    }
};