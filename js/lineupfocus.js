LineUpFocus = function(_parentElement, _data, _data2, _labels, _size, _categories, _isWorkLineUp){
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

LineUpFocus.prototype.initVis = function(){
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

    // vis.svg.append("defs").append("clipPath")
    //     .attr("id", "clip")
    //     .append("rect")
    //     .attr("width", vis.width)
    //     .attr("height", vis.height);

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

    vis.tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) { return d.name + ": " + d.value; });

    vis.wrangleData();
};

LineUpFocus.prototype.wrangleData = function(){
    var vis = this;

    // If there are two options (median and median student) we use selectvalue to select.
    if(!!vis.data2){
        vis.displayData = $("#view-select").val() === "val" ? vis.data : vis.data2;
    }
    else {
        vis.displayData = vis.data;
    }

    // Set scale domains.
    if(!vis.data2) { vis.y.domain([-.5, .5])} else { vis.y.domain([0, d3.max(vis.displayData,
        function(d){ return +d.value; }) + 5])};

    vis.updateVis();
};

LineUpFocus.prototype.updateVis = function(){
    var vis = this;
    vis.svg.call(vis.tool_tip);
    vis.svg.selectAll(".axis-label").remove();

    console.log(vis.isWorkLineUp);

    vis.yAxis = d3.axisLeft(vis.y);

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
        .style("opacity", function(d){
            var v = vis.y(d.value);
            return (v < vis.y.range()[1] && v > vis.y.range()[0]) || (v > vis.y.range()[1] && v < vis.y.range()[0]) ? 0.6 : 0;
        })
        .on("mouseover", vis.tool_tip.show)
        .on("mouseout", vis.tool_tip.hide)
        .on("click", function(d){
            console.log(d);
            if(!vis.isWorkLineUp){
                $("#enrollment-select").val(d.name);
                enrollmentHistogram.updateKey(d.name, vis.color(vis.categories[d.name].category));
            }
            else {
                console.log('in else')
                $("#department-select").val(d.name);
                workScatter.updateDept();
            }
        });

    vis.dot.exit().remove();

    // // Labels
    vis.svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', "translate(0, " + (vis.height + 20) + ")")
        .text(vis.labels.bottom);

    vis.svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', "translate(-0, " + (- 20) + ")")
        .text(vis.labels.top);

};