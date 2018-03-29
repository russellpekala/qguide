
WordCloud = function(_parentElement, _data, _labels){

    this.parentElement = _parentElement;
    this.data = _data;

    this.specific = "fall_2018";
    this.type = "year";
    this.labels = _labels;

    this.initVis();
};

WordCloud.prototype.initVis = function() {
    var vis = this;

    vis.color = d3.scaleLinear()
        .domain([0, 1, 2, 3, 4, 5, 6, 10, 15, 20, 100])
        .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222"]);

    vis.font = d3.scaleLinear()
        .range([13, 40]);

    vis.wrangleData();
}

WordCloud.prototype.wrangleData = function() {
    var vis = this;
    var selection = $("#select-wordcloud").val();

    // We know it's a year if last char is int.
    var isDept = isNaN(selection.substr(selection.length - 1));

    if (isDept){
        vis.type = "department";
        vis.specific = selection;
    }
    else {
        vis.type = "year";
        vis.specific = selection;
    }
    vis.displayData = vis.data[vis.type][vis.specific].map(function(d){
        return {
            text: d[0],
            size: d[1]
        }
    });
    vis.updateVis();
}

WordCloud.prototype.updateVis = function() {
    var vis = this;
    d3.select("#wordcloud svg").remove(); // Remove old
    vis.font.domain(d3.extent(vis.displayData, function(d) { return +d.size; }));

    function roundRight(num){
        return Math.floor(vis.font(num));
    }

    d3.layout.cloud().size([800, 300])
        .words(vis.displayData.map(function(d){
            return {
                size: roundRight(d.size),
                text: d.text
            }
        }))
        .rotate(0)
        .fontSize(function(d) { return d.size; })
        .on("end", draw)
        .start();

    function draw(words) {
        d3.select("#" + vis.parentElement).append("svg")
            .attr("width", 850)
            .attr("height", 350)
            .attr("class", "wordcloud")
            .append("g")
            // without the transform, words words would get cutoff to the left and top, they would
            // appear outside of the SVG area
            .attr("transform", "translate(320,200)")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("fill", function(d, i) { return vis.color(i); })
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
    }
}