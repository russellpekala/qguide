
LineUp = function(_parentElement, _data, _data2, _labels, _size, _categories){
    var vis = this;

    vis.parentElement = _parentElement;
    vis.data = _data;
    vis.data2 = _data2;
    vis.labels = _labels;
    vis.size = _size;
    vis.categories = _categories;

    vis.initVis();
};

LineUp.prototype.initVis = function(){
    var vis = this;

    vis.margin = vis.size.margin ? vis.size.margin : { top: 40, right: 30, bottom: 70, left: 50 };
    vis.margin2 = vis.size.margin2 ? vis.size.margin2 : { top: 40, right: 30, bottom: 70, left: 50 };

    vis.width = (vis.size.width ? vis.size.width : 500) - vis.margin.left - vis.margin.right;
    vis.height = (vis.size.height ? vis.size.height : 300) - vis.margin.top - vis.margin.bottom;

    vis.padding = .25;

    console.log("INITVIS: WIDTH, HEIGHT", vis.width, vis.height, !vis.data2);

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
        .range([0, vis.height]);

    vis.x = d3.scaleLinear()
        .range([0, vis.width / 2])
        .domain([0, 1]); // Think of this as percentage.

    vis.color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(Object.values(vis.categories).map(function(d){ return d.category; }).unique());

    // vis.yAxisg = vis.svg.append("g")
    //     .attr("class", "axis--y")
        // .attr("transform", "translate(" + (vis.width) + ",0)");

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

    vis.tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) { return d.name + ": " + d.value; });

    vis.wrangleData();
};

LineUp.prototype.wrangleData = function(){
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

LineUp.prototype.updateVis = function(){
    var vis = this;
    vis.svg.call(vis.tool_tip);
    // Set scale domains.
    if(!vis.data2) { vis.y.domain([-.5, .5])} else { vis.y.domain(d3.extent(vis.displayData,
                                                    function(d){ return +d.value; }))};
    vis.y2.domain(vis.y.domain());
    // vis.yAxis = d3.axisLeft(vis.y).tickFormat(d3.format(".1f"));

    // Due to weird scoping, all instances of brush have to be defined in this function.
    var brush = d3.brushY()
        .extent([[0, 0], [vis.width, vis.height]])
        .on("brush end", brushed);

    // TO-DO: Append brush component here
    vis.svg.append("g")
        .attr("class", "y brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", vis.height + 7);

    // // For focus
    // vis.focus.select(".axis--y")
    //     .transition()
    //     .duration(500)
    //     .call(vis.yAxis.ticks(7));

    vis.dot = vis.focus.selectAll(".dot")
        .data(vis.data);

    vis.dot.enter().append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .merge(vis.dot)
        .attr("cy", function(d){ return vis.y(+d.value); })
        .attr("cx", vis.x(0.5)) // halfway
        .style("fill", function(d){
            return vis.color(vis.categories[d.name].category);
        })
        .style("opacity", 0.6)
        .on("mouseover", vis.tool_tip.show)
        .on("mouseout", vis.tool_tip.hide);

    vis.dot.exit().remove();

    // // Labels
    // vis.focus.append('text')
    //     .attr('class', 'axis-label')
    //     .attr('text-anchor', 'middle')
    //     .attr('transform', "translate(0, " + (vis.height + 20) + ")")
    //     .text(vis.labels.bottom);
    //
    // vis.focus.append('text')
    //     .attr('class', 'axis-label')
    //     .attr('text-anchor', 'middle')
    //     .attr('transform', "translate(-0, " + (- 20) + ")")
    //     .text(vis.labels.top);


    vis.legend = vis.svg.selectAll(".legend")
        .data(vis.color.domain()).enter()
        .append("g")
        .attr("class","legend")
        .attr("transform", "translate(" + (vis.width +20) + "," + 0+ ")");

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
