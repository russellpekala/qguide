LineUpContext = function(_parentElement, _data, _data2, _labels, _size, _categories, _isWorkLineUp){
    var vis = this;

    vis.parentElement = _parentElement;
    vis.data = _data;
    vis.data2 = _data2;
    vis.labels = _labels;
    vis.size = _size;
    vis.categories = _categories;
    vis.isWorkLineUp = _isWorkLineUp;

    vis.initVis();
};

LineUpContext.prototype.initVis = function(){
    var vis = this;

    vis.margin = vis.size.margin ? vis.size.margin : { top: 40, right: 30, bottom: 70, left: 50 };
    vis.margin2 = vis.size.margin2 ? vis.size.margin2 : { top: 40, right: 30, bottom: 70, left: 50 };

    vis.width = (vis.size.width ? vis.size.width : 500) - vis.margin.left - vis.margin.right;
    vis.height = (vis.size.height ? vis.size.height : 300) - vis.margin.top - vis.margin.bottom;

    vis.padding = .25;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Define the scales.
    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.x = d3.scaleLinear()
        .range([0, vis.width])
        .domain([0, 1]); // Think of this as percentage.

    vis.color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(Object.values(vis.categories).map(function(d){ return d.category; }).unique());

    vis.yAxisg = vis.svg.append("g")
        .attr("class", "axis--y");

    // Prepare and set the data.
    function preprocess(data) {
        var lst = [];
        Object.keys(data).forEach(function(key){
            lst.push({name: key, value: data[key]})
        });
        return lst;
    }
    vis.data = preprocess(vis.data);

    if(!!vis.data2){
        vis.data2 = preprocess(vis.data2);
    }

    vis.wrangleData();
};

LineUpContext.prototype.wrangleData = function(){
    var vis = this;

    // If there are two options (median and median student) we use selectvalue to select.
    if(!!vis.data2){
        vis.displayData = $("#view-select").val() === "val" ? vis.data : vis.data2;
    }
    else {
        vis.displayData = vis.data;
    }

    vis.updateVis();
};

LineUpContext.prototype.updateVis = function(){
    var vis = this;
    // Set scale domains.
    if(!vis.data2) { vis.y.domain([-.5, .5])} else { vis.y.domain([0, d3.max(vis.displayData,
        function(d){ return +d.value; }) + 5])};

    vis.yAxis = d3.axisLeft(vis.y);

    // Due to weird scoping, all instances of brush have to be defined in this function.
    var brush = d3.brushY()
        .extent([[0, 0], [vis.width, vis.height]])
        .on("brush end", vis.isWorkLineUp ? brushedWorkload : brushedEnrollment);

    // TO-DO: Append brush component here
    vis.svg.append("g")
        .attr("class", "y brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", vis.height + 7);

    vis.svg.select(".axis--y")
        .transition()
        .duration(500)
        .call(vis.yAxis);

    vis.dot = vis.svg.selectAll(".dot")
        .data(vis.displayData);

    vis.dot.enter().append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .merge(vis.dot)
        .attr("cy", function(d){ return vis.y(+d.value); })
        .attr("cx", vis.x(0.5)) // halfway
        .style("fill", function(d){
            return vis.color(vis.categories[d.name].category);
        })
        .style("opacity", 0.6);

    vis.dot.exit().remove();

    // Labels

    vis.svg.append('text')
        .attr('width', 30)
        .attr('class', 'disclaimer')
        .attr('text-anchor', 'left')
        .attr('transform', "translate(" + (vis.width + 30) + ", " + (vis.height/2 + 30) + ")")
        .text("Please drag the");

    vis.svg.append('text')
        .attr('width', 30)
        .attr('class', 'disclaimer')
        .attr('text-anchor', 'left')
        .attr('transform', "translate(" + (vis.width + 30) + ", " + (vis.height/2 + 41) + ")")
        .text("context area or");
    vis.svg.append('text')
        .attr('width', 30)
        .attr('class', 'disclaimer')
        .attr('text-anchor', 'left')
        .attr('transform', "translate(" + (vis.width + 30) + ", " + (vis.height/2 + 52) + ")")
        .text("click a dot for");

    vis.svg.append('text')
        .attr('width', 30)
        .attr('class', 'disclaimer')
        .attr('text-anchor', 'left')
        .attr('transform', "translate(" + (vis.width + 30) + ", " + (vis.height/2 + 63) + ")")
        .text("detail.");

    vis.svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', "translate(-0, " + (- 20) + ")")
        .text("Context Area");


    vis.legend = vis.svg.selectAll(".legend")
        .data(vis.color.domain()).enter()
        .append("g")
        .attr("class","legend")
        .attr("transform", "translate(" + (vis.width + 20) + "," + 0+ ")");

    vis.legend.append("rect")
        .attr("x", 0)
        .attr("y", function(d, i) { return 20 * i; })
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function(d) { return vis.color(d); });

    vis.legend.append("text")
        .attr("x", 20)
        .attr("dy", "0.75em")
        .attr("y", function(d, i) { return 20 * i; })
        .text(function(d) {return d});

    vis.legend.append("text")
        .attr("x",0)
        //      .attr("dy", "0.75em")
        .attr("y",-10)
        .text("Categories");
};