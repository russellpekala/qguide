
LineUp = function(_parentElement, _data, _labels, _size){
    var vis = this;

    vis.parentElement = _parentElement;
    vis.data = [{
        dept: "Math",
        category: "STEM",
        coeff: 0.2
    }, {
        dept: "Science",
        category: "STEM",
        coeff: -.4
    }, {
        dept: "History",
        category: "Liberal",
        coeff: 0.1
    }];
    vis.labels = _labels;
    vis.size = _size;

    vis.initVis();
};

LineUp.prototype.initVis = function(){
    var vis = this;

    vis.margin = vis.size.margin ? vis.size.margin : { top: 40, right: 30, bottom: 70, left: 50 };

    vis.width = (vis.size.width ? vis.size.width : 500) - vis.margin.left - vis.margin.right;
    vis.height = (vis.size.height ? vis.size.height : 300) - vis.margin.top - vis.margin.bottom;
    vis.padding = .25;

    // SVG drawing area
    console.log('in lineup', vis.parentElement);
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.yAxis = vis.svg.append("g")
        .attr("class", "y-axis");

    Array.prototype.unique = function() {
        return this.filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });
    }

    vis.color = d3.scaleOrdinal(d3["schemeAccent"])
        .domain(vis.data.map(function(d){ return d.category; }).unique());

    vis.wrangleData();
};

LineUp.prototype.wrangleData = function(){
    var vis = this;

    vis.updateVis();
};

LineUp.prototype.updateVis = function(){
    var vis = this;
    vis.y.domain([-.5, .5]);
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
        // .attr("cx", function(d){ return vis.x(d[vis.metric]); })
        .attr("cy", function(d){ return vis.y(d.coeff); })
        // .style("fill", function(d) {
        //     return vis.color(d.category);
        // })
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
        .data(vis.labelStatus === "true" ? vis.displayData : []);

    vis.label.enter().append("text")
        .attr("class", "label")
        .attr("r", 5)
        .merge(vis.label)
        .attr("x", function(d){ return 10; })
        .attr("y", function(d){ return 3 + vis.y(d.coeff); })
        .text(function(d){ return d.word; });

    vis.label.exit().remove();

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
