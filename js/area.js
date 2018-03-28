Area = function(_parentElement, _data, _labels, _size){

    this.parentElement = _parentElement;
    this.data = _data;

    this.labels = _labels;
    this.size = _size;

    this.initVis();
};

Area.prototype.initVis = function(){
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

    function constructOrdRange(){
        var lst = [];
        var step = vis.width / (vis.data.length - 1)
        for(var i = 0; i < vis.data.length; i++) {
            lst.push(i * step);
        }
        return lst;
    }

    vis.x = d3.scaleOrdinal()
        .range(constructOrdRange());

    vis.color = d3.scaleOrdinal(d3.schemeCategory10);

    vis.xAxisg = vis.svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.yAxisg = vis.svg.append("g")
        .attr("class", "y-axis");

    vis.stack = d3.stack();

    vis.area = d3.area()
        .x(function(d) { return vis.x(d.data.year); })
        .y0(function(d) { return vis.y(d[0]); })
        .y1(function(d) { return vis.y(d[1]); });

    vis.keys = Object.keys(vis.data[0]); // Everything but "year"
    console.log(vis.keys);
    vis.keys.splice(vis.keys.indexOf("year"), 1);
    console.log(vis.keys);
    vis.wrangleData();
};


Area.prototype.wrangleData = function(){
    var vis = this;

    vis.runningTotal = 0;


    vis.updateVis();
};

Area.prototype.updateVis = function() {
    var vis = this;

    vis.xAxis = d3.axisBottom(vis.x);
    vis.yAxis = d3.axisLeft(vis.y).tickFormat(parse);

    vis.svg.select(".x-axis")
        .transition()
        .duration(500)
        .call(vis.xAxis.ticks(3));

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

    vis.x.domain(vis.data.map(function(d) { return d.year; }));
    vis.y.domain([0, d3.max(vis.data, function(d){
        var t = 0;
        vis.keys.forEach(function(k){
            t += d[k];
        });
        return t;
    })]);
    console.log(vis.y.domain());
    console.log(vis.x.domain());
    vis.stack.keys(vis.keys);

    vis.layer = vis.svg.selectAll(".layer")
        .data(vis.stack(vis.data))
        .enter().append("g")
        .attr("class", "layer");

    vis.layer.append("path")
        .attr("class", "area")
        .style("fill", function(d) { console.log(d); return vis.color(d.key); })
        .attr("d", vis.area);

    vis.layer.filter(function(d) { console.log(d); return d[d.length - 1][1] - d[d.length - 1][0] > 0.01; })
        .append("text")
        .attr("x", vis.width - 6)
        .attr("y", function(d) { return vis.y((d[d.length - 1][0] + d[d.length - 1][1]) / 2); })
        .attr("dy", ".35em")
        .style("font", "10px sans-serif")
        .style("text-anchor", "end")
        .text(function(d) { return d.key; });


}