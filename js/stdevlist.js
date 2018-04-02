StdevList = function(_parentElement, _data, _color){
  var vis = this;
  
  vis.parentElement = _parentElement;
  vis.data = _data;
  vis.color = _color;
  vis.pageSize = 10;

  this.initVis();
};

StdevList.prototype.initVis = function() {
  var vis = this;

  vis.table = d3.select('#' + vis.parentElement).append('table');
  vis.headersTr = vis.table.append('thead').append('tr');
  vis.tableBody = vis.table.append('tbody');
  vis.activePage = 0; // Initially zeroth page is active.

  vis.wrangleData();
};

StdevList.prototype.wrangleData = function(newActivePage){
  var vis = this;

  var oldButtons = d3.selectAll(".page");
  oldButtons.remove();

  vis.department = $('#department-select2').val();
  vis.metric = $('#metric-select2').val();
    var v = $("#update-term2").val();
    vis.term = v.split("_")[1];
    vis.year = v.split("_")[0];
    vis.num = $('#num-select2').val();
    vis.sortOrder = $('#order-select2').val();
  
  vis.displayData = vis.data;
    vis.displayData = vis.displayData.filter(function(d, i){
        return ((d.department === vis.department) &
            (d.term === vis.term) &
            (d.year === vis.year));
    });
    for(var i = 0; i < Math.ceil(vis.displayData.length / vis.pageSize); i++){
        var button = document.createElement("button");
        button.innerHTML = (i * vis.pageSize + 1) + "-" + Math.min((i+1) * vis.pageSize, vis.displayData.length - 1);
        button.id = "page" + i;
        if (i===vis.activePage){
            button.className = "active page";
        }
        else {
            button.className = "page";
        }
        button.addEventListener("click", function(d){
            vis.activePage = parseInt(d.target.id.substring(d.target.id.length-1));
            vis.wrangleData();
        });
        correctDiv = document.getElementById("for-nav");
        correctDiv.appendChild(button);
    }

    vis.displayData = vis.displayData.sort(function(a, b){
        return (+a[vis.metric] < +b[vis.metric]? 1 * vis.sortOrder : -1 * vis.sortOrder);
    });

  vis.displayData = vis.displayData.filter(function(d, i){
    return ((d.department === vis.department) &
            (d.term === vis.term) &
            (d.year === vis.year) &
            (i < (vis.activePage + 1) * vis.pageSize) &
            (i >= (vis.activePage) * vis.pageSize));
  });



  vis.updateVis();
};

function colspan(index){
  if (index === 0){
    return 200;
  }
  else if (index === 1){
    return 100;
  }
  else {
    return 100;
  }
}

StdevList.prototype.updateVis = function(){
  var vis = this;



  vis.tableBody.selectAll("tr").remove();

  var titles = d3.keys(vis.data[0]).filter(function(d){
    return ((d !== 'department') &
            (d !== 'term') &
            (d !== 'year') &
            (d !== 'Workload') &
            (d !== 'Overall'));
  });
  titles = titles.concat(["Overall", "Workload"]);

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    var v = hexToRgb(vis.color(vis.department));


  var headers = vis.headersTr.selectAll('th').data(titles);
  headers = headers.enter().append('th')
      .attr("colspan", function(d, i) { return colspan(i); })
      .attr("class", function(d, i) { return 'col_' + i; })
    .merge(headers)
    .text(function (d){
      return d;
    })
      .style("background-color",  "rgba(" + v.r + "," + v.g + "," + v.b + "," + 0.6 + ")");

    d3.select(".active").style("background-color", "rgba(" + v.r + "," + v.g + "," + v.b + "," + 0.6 + ")");

  var rows = vis.tableBody.selectAll('tr')
    .data(vis.displayData).enter()
    .append('tr');

  rows.selectAll('td')
    .data(function (d) {
      return titles.map(function (k) {
        return { 'value': d[k], 'name': k};
      });
    }).enter()
    .append('td')
    .attr('data-th', function (d) {
      return d.name;
    })
      .attr("colspan", function(d, i) { return colspan(i); })
      .attr("class", function(d, i) { return 'col_' + i; })
    .text(function (d) {
      return d.value;
    });

};
