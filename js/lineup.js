
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

    vis.width = (vis.size.width ? vis.size.width : 500) - vis.margin.left - vis.margin.right;
    vis.height = (vis.size.height ? vis.size.height : 300) - vis.margin.top - vis.margin.bottom;
    vis.padding = .25;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.yAxis = vis.svg.append("g")
        .attr("class", "y-axis");

    vis.color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(Object.values(vis.categories).map(function(d){ return d.category; }).unique());

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

LineUp.prototype.wrangleData = function(){
    var vis = this;

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


    if(!vis.data2){
        vis.y.domain([-.5, .5]);
    }
    else {
        vis.y.domain(d3.extent(vis.displayData, function(d){ return +d.value; }))
    }
    // vis.x.domain([0, 10]);

    vis.yAxis = d3.axisLeft(vis.y).tickFormat(d3.format(".1f"));

    vis.svg.select(".y-axis")
        .transition()
        .duration(500)
        .call(vis.yAxis.ticks(7));

    vis.dot = vis.svg.selectAll(".dot")
        .data(vis.data);

    vis.dot.enter().append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .merge(vis.dot)
        .attr("cy", function(d){ return vis.y(d.value); })
        .style("fill", function(d) {
            return vis.color(vis.categories[d.name].category);
        })
        .style("opacity", 0.6);

    vis.dot.exit().remove();

    // Labels
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

    vis.label = vis.svg.selectAll(".label")
        .data(vis.labelStatus === "true" ? vis.data : []);

    vis.label.enter().append("text")
        .attr("class", "label")
        .attr("r", 5)
        .merge(vis.label)
        .attr("x", function(d){ return 10; })
        .attr("y", function(d){ return 3 + vis.y(d.value); })
        .text(function(d){ return d.word; });

    vis.label.exit().remove();

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

    // Legend stuff
    // vis.legendHolder = vis.svg.append("g")
    //     .attr("class", "legend-holder")
    //     .attr("id", "bar-legend-holder");
    //
    // vis.legend = vis.legendHolder.selectAll(".legend")
    //     .data(vis.color.domain());
    //
    // vis.legend = vis.legend.enter().append("rect")
    //     .merge(vis.legend)
    //     .attr("class", "legend")
    //     .attr("x",  vis.width + 30)
    //     .attr("y", function(d, i) { return i * 20; })
    //     .attr("width", 10)
    //     .attr("height", 10)
    //     // .on("click", function(d){
    //     //     vis.adjustCategories(d);
    //     // })
    //     // .attr("opacity", function(d){ return vis.activeCategories.indexOf(d) >= 0 ? 1 : .3; })
    //     .style("fill", vis.color);
    //
    // vis.legend.exit().remove();
    //
    // vis.legendText = vis.legendHolder.selectAll(".legend-text")
    //     .data(vis.color.domain());
    //
    // vis.legendText = vis.legendText.enter().append("text")
    //     .attr("class", "legend-text")
    //     .merge(vis.legendText)
    //     .attr("x",  vis.width + 30 + 15)
    //     .attr("y", function(d, i){ return i * 20 + 5;})
    //     .attr("dy", ".35em")
    //     .style("text-anchor", "begin")
    //     .style("font" ,"10px sans-serif")
    //     .style("font-weight" , function(d){
    //         return vis.activeCategories.indexOf(d) >= 0 ? "bolder" : "normal";
    //     })
    //     .text(function(d){
    //         return d;
    //     });
    //
    // vis.legendText.exit().remove();

};
