Area = function(_parentElement, _data, _labels, _size, _categories){

    this.parentElement = _parentElement;
    this.data = _data;

    this.labels = _labels;
    this.size = _size;
    this.categories = _categories;

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

    vis.translate = function(yearTerm){
        var arr = yearTerm.split("_");
        return arr[1] + " " + arr[0];
    }

    function constructOrdRange(){
        var lst = [];
        var step = vis.width / (vis.data.length - 1)
        for(var i = 0; i < vis.data.length; i++) {
            lst.push(i * step);
        }
        return lst;
    }

    vis.x = d3.scaleOrdinal().range(constructOrdRange());

    vis.color = d3.scaleOrdinal(d3.schemeCategory10);

    vis.xAxisg = vis.svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.yAxisg = vis.svg.append("g")
        .attr("class", "y-axis");


    vis.area = d3.area()
        .x(function(d) { return vis.x(d.data.year); })
        .y0(function(d) { return vis.y(d[0]); })
        .y1(function(d) { return vis.y(d[1]); });

    vis.tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([0, 0])
        .html(function(d) { return this.id; });

    vis.wrangleData();
};


Area.prototype.wrangleData = function(){
    var vis = this;

    vis.runningTotal = 0;


    vis.updateVis();
};

Area.prototype.updateVis = function() {
    var vis = this;

    vis.keys = Object.keys(vis.data[0]).filter(function(d){ return d !== "year"; }); // Everything but "year"

    vis.x.domain(vis.data.map(function(d) { return vis.translate(d.year); }));
    vis.y.domain([0, d3.max(vis.data, function(d){
        var t = 0;
        vis.keys.forEach(function(k){
            t += d[k];
        });
        return t;
    })]);


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
        .attr('transform', "translate("+ vis.width/2 +","+ (vis.height + 60) +")")
        .text(vis.labels.x);

    vis.svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', "translate(-37, " + (vis.height / 2) + ")rotate(-90)")
        .text(vis.labels.y);



    // Sorting by category then by size:
    function calculateOrder(data){
        var totals = {};
        data.forEach(function(d){
            Object.keys(d).forEach(function(k){
                if (k !== "year") {
                    totals[k] = !totals[k] ? d[k] : totals[k] + d[k];
                }
            });
        });
        // Now calculate which subcategory has the most

        var categoryTotals = {};
        Object.keys(totals).forEach(function(dept){
            var v = categoryTotals[vis.categories[dept].category];
            categoryTotals[vis.categories[dept].category] = (v ? v + totals[dept] : totals[dept]);
        })
        var arr = [];
        function compare(a, b){
            if (a[1] > b[1]){
                return -1;
            }
            else {
                return 1;
            }
        }
        for (var key in categoryTotals) {
            if (categoryTotals.hasOwnProperty(key)) {
                arr.push( [ key, categoryTotals[key] ] );
            }
        }
        arr.sort(compare);
        vis.biggestCategories = arr.map(function(d){ return d[0]; });

        // Now, order departments by subcategory total then by individual department total.
        var finalList = [];
        vis.biggestCategories.forEach(function(cat){
            var tmpList = [];
            Object.keys(vis.categories).forEach(function(dept){
                var v = vis.categories[dept];
                if(v.category === cat){
                    tmpList.push([dept, totals[dept]]);
                }
            });
            tmpList.sort(compare);
            finalList = finalList.concat(tmpList.map(function(d){ return d[0]; }));
        });
        return finalList;
    }

    vis.order = calculateOrder(vis.data);

    vis.stack = d3.stack().keys(vis.order);
    vis.stacked = vis.stack(vis.data);


    vis.layer = vis.svg.selectAll(".layer")
        .data(vis.stacked)
        .enter().append("g")
        .attr("class", "layer");

    function findPos(v){
        var newThing = [0];
        vis.order.forEach(function(d, i){
            if(i > 0){
                if(vis.categories[vis.order[i]].category === vis.categories[vis.order[i-1]].category){
                    newThing.push(newThing[i-1] + 1);
                }
                else{
                    newThing.push(0);
                }
            }
        });
        return newThing[vis.order.indexOf(v)]
    }

    vis.biggestCategories.reverse();
    vis.color.domain(vis.biggestCategories);

    vis.layer.append("path")
        .attr("class", "area")
        .attr("id", function(d){ return d.key; })
        .style("fill", function(d) { return d3.rgb(vis.color(vis.categories[d.key].category)).brighter(findPos(d.key)/8); })
        .attr("d", vis.area)
        .style("opacity", .6)
        .on("mouseover", function(d){
            this.style.opacity = 1;
            $("#department-label").html(this.id);
        })
        .on("mouseout", function(d){
            this.style.opacity = .6;
            $("#department-label").html("");
        })

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

    // vis.layer.filter(function(d) { return d[d.length - 1][1] - d[d.length - 1][0] > 0.01; })
    //     .append("text")
    //     .attr("x", vis.width - 6)
    //     .attr("y", function(d) { return vis.y((d[d.length - 1][0] + d[d.length - 1][1]) / 2); })
    //     .attr("dy", ".35em")
    //     .style("font", "10px sans-serif")
    //     .style("text-anchor", "end")
    //     .text(function(d) { return d.key; });


}