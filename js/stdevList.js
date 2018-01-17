StdevList = function(_parentElement, _data, _department, _year, _classSizeRange){

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
  
  vis.displayData = vis.data;
  vis.displayData = vis.displayData.filter(function(d){
    return ((d.department === vis.department) &
            (d.term === vis.term) &
            (d.year === vis.year));
  });
  vis.displayData = vis.displayData.sort(function(a, b){
    return (+a[vis.metric] < +b[vis.metric]? 1 : -1);
  });

  vis.updateVis();
};

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
    .text(function (d) {
      return d.value;
    });

};