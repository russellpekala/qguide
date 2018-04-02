Area2 = function(_parentElement, _data, _labels, _size, _categories, _color, _naiveColor){
    var vis = this;
    this.parentElement = _parentElement;
    this.data = _data;

    this.labels = _labels;
    this.size = _size;
    this.categories = _categories;
    this.color = _color;
    this.naiveColor = _naiveColor;
    if(this.data){
        this.wasBigArea = true;
    }

    this.initVis();
};

Area2.prototype.initVis = function(){
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

    vis.translate = function(yearTerm){
        var arr = yearTerm.split("_");
        return capitalizeFirstLetter(arr[1]) + " " + arr[0];
    };

    vis.x = d3.scaleOrdinal();

    vis.xAxisg = vis.svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.yAxisg = vis.svg.append("g")
        .attr("class", "y-axis");


    vis.tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([0, 0])
        .html(function(d) { return this.id; });

    vis.wrangleData();
};


Area2.prototype.wrangleData = function(){
    var vis = this;

    vis.dept = $("#department-select3").val();

    vis.displayData = vis.data.map(function(d){
        var obj = {
            year: d.year
        };
        obj[vis.dept] = d[vis.dept];
        return obj;
    });
    function constructOrdRange() {
        var lst = [];
        var step = vis.width / (vis.data.length - 1)
        for (var i = 0; i < vis.data.length; i++) {
            lst.push(i * step);
        }
        return lst;
    }
    vis.x.domain(vis.data.map(function (d) {
        return vis.translate(d.year);
    })).range(constructOrdRange());

    vis.y.domain([0, d3.max(vis.displayData, function (d) {
        return Object.values(d)[1];
    })]);

    vis.updateVis();
};

Area2.prototype.updateVis = function() {
    var vis = this;

    var oldLabels = vis.svg.selectAll(".axis-label");
    oldLabels.remove();

    vis.keys = Object.keys(vis.data[0]).filter(function (d) {
        return d !== "year";
    });


    vis.stack = d3.stack().keys([vis.dept]);
    vis.stacked = vis.stack(vis.displayData);

    vis.area = d3.area()
        .x(function (d) {
            return vis.x(vis.translate(d.data.year));
        })
        .y0(function (d) {
            return vis.y(d[0]);
        })
        .y1(function (d) {
            return vis.y(d[1]);
        });

    vis.layer = vis.svg.selectAll(".area")
        .data(vis.stacked);

    vis.layer.enter().append("path")
        .merge(vis.layer)
        .transition()
        .duration(500)
        .attr("class", "area")
        .attr("id", function (d) {
            return d.key;
        })
        .style("fill", function (d) {
            return vis.color(d.key);
        })
        .attr("d", vis.area)
        .style("opacity", .6)
        .style("stroke", "white")
        .style("stroke-width", 1);

    vis.layer.exit().remove();

    vis.xAxis = d3.axisBottom(vis.x);
    vis.yAxis = d3.axisLeft(vis.y).tickFormat(parse);
    vis.svg.select(".x-axis")
        .transition()
        .duration(500)
        .call(vis.xAxis)
        .selectAll("text")
        .attr("text-anchor", "start")
        .attr("transform", "translate(10, 0)rotate(45)");

    vis.svg.select(".y-axis")
        .transition()
        .duration(500)
        .call(vis.yAxis.ticks(5));

    vis.svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', "translate(" + vis.width / 2 + "," + (vis.height + 60) + ")")
        .text(vis.labels.x);

    vis.svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', "translate(-37, " + (vis.height / 2) + ")rotate(-90)")
        .text(vis.labels.y);

}