StdevList = function(_parentElement, _data, _department, _year, _classSizeRange){
  var vis = this;
  
  this.parentElement = _parentElement;
  this.data = _data;
  this.classSizeRange = _classSizeRange; // What class sizes to consider.
  this.displayData = [];

  this.initVis();
};

StdevList.prototype.initVis = function() {
  var vis = this;

  table = d3.select('#' + vis.parentElement).append('table');
  headersTr = table.append('thead').append('tr');
  tableBody = table.append('tbody');

  vis.wrangleData();
};

StdevList.prototype.wrangleData = function(){
  var vis = this;
  vis.department = $('#department-select2').val();
  vis.metric = $('#metric-select2').val();
  vis.year = $('#year-select2').val();
  vis.term = $('#term-select2').val();
    vis.num = $('#num-select2').val();
    vis.sortOrder = $('#order-select2').val();
  
  vis.displayData = vis.data;
  vis.displayData = vis.displayData.filter(function(d){
    return ((d.department === vis.department) &
            (d.term === vis.term) &
            (d.year === vis.year));
  });

  // If truncating to popular classes, need to have this.
  vis.displayData = vis.displayData.sort(function(a, b){
    return (+a["Enrollment"] < +b["Enrollment"]? 1 : -1);
  }).slice(0, vis.num);
  vis.displayData = vis.displayData.sort(function(a, b){
    return (+a[vis.metric] < +b[vis.metric]? 1 * vis.sortOrder : -1 * vis.sortOrder);
  });

  vis.updateVis();
};

function colspan(index){
  if (index == 0){
    return 200;
  }
  else if (index == 1){
    return 100;
  }
  else {
    return 100;
  }
}

StdevList.prototype.updateVis = function(){
  var vis = this;
  tableBody.selectAll("tr").remove();

  var titles = d3.keys(vis.data[0]).filter(function(d){
    return ((d !== 'department') &
            (d !== 'term') &
            (d !== 'year') &
            (d !== 'Workload') &
            (d !== 'Overall'));
  });
  titles.push(vis.metric);

  var headers = headersTr.selectAll('th').data(titles);
  headers = headers.enter().append('th')
      .attr("colspan", function(d, i) { return colspan(i); })
      .attr("class", function(d, i) { return 'col_' + i; })
    .merge(headers)
    .text(function (d){
      return d;
    });

  var rows = tableBody.selectAll('tr')
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
