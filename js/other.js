
var margin = {top: 20, right: 30, bottom: 30, left: 30},
  width = 700 - margin.left - margin.right,
  height = 200 - margin.top - margin.bottom;

var maxCutoff = 105;
var numBoxes = 21;
// var max = maxCutoff;
// var min = 0;
var x = d3.scaleLinear()
  .domain([0, maxCutoff])
  .range([0, width]);
var formatCount = d3.format(",.0f");
var color = "steelblue";
var plotLocation = '#figure1';
var svg = d3.select(plotLocation).append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x",0 - (height / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Number of Classes in Sizerange");

svg.append("text")
// .attr("transform", "rotate(-90)"))
  .attr("y", 170)
  .attr("x", (width / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Size of Class");

function makeButton(department){
  var btn = document.createElement("BUTTON");
  btn.className = "button1 hvr-fade1";
  btn.style = "cursor:pointer;";
  btn.onclick = function(){refresh(finalDepartments, department);};
  btn.innerHTML = department;
  var buttonLocation = 'button1';
  document.getElementById(buttonLocation).appendChild(btn);
}


function makeButtons(processed,sort_method) {
  new_processed = [];
  for(var i in processed){
    new_processed.push(processed[i]);
  }
  if(sort_method == 'name'){
    new_processed = new_processed.sort(function(a,b){
      if(a.name < b.name){return -1};
      if (a.name > b.name){return 1};
      return 0;
    });
  }
  else {new_processed = new_processed.sort(function(a,b){return b[sort_method] - a[sort_method]});
  }
  for(var i=0; i<new_processed.length; i++){
    if(new_processed[i].name.length > 0) {
      makeButton(new_processed[i].name);
    }
  }
}

function resort(processed, method){
  var button_location = 'button1';
  var node = document.getElementById(button_location);
  while (node.hasChildNodes()) {
    node.removeChild(node.lastChild);
  }
  makeButtons(processed, method);
}

function update_text(processed, department){
  var text_location = "#text" + '1';
  var text0 = department + ": ";
  var text1 = "Mean = " + processed[department]['mean'].toString();
  var text2 = ", Median = " + processed[department]['median'].toString();
  var text3 = ", Median Student = " + processed[department]['median_student'].toString();
  var text4 = ", Total Enrollment = " + processed[department]['total_enrollment'].toString();
  d3.select(text_location).text(text0+text1+text2+text3+text4);
}

function refresh(processed, department){
  update_text(processed,department);
  var values = processed[department].storage;
  var data = d3.histogram()
    .bins(x.ticks(numBoxes))
    (values);

  // Reset y domain using new data
  var yMax = d3.max(data, function(d){return d.length});
  var yMin = d3.min(data, function(d){return d.length});
  var y = d3.scale.linear()
    .domain([0, yMax])
    .range([height, 0]);

  y.domain([0, yMax]);
  var colorScale = d3.scale.linear()
    .domain([yMin, yMax])
    .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);

  var bar = svg.selectAll(".bar").data(data);

  // Remove object with data
  bar.exit().remove();

  bar.transition()
    .duration(1000)
    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
  bar.select("rect")
    .transition()
    .duration(1000)
    .attr("height", function(d) { return height - y(d.y); })
    .attr("fill", function(d) { return colorScale(d.y) });
  bar.select("text")
    .transition()
    .duration(1000)
    .text(function(d) { return formatCount(d.y); });
}

function loadgraph(processed, department) {
  //Create a list to store the histogram stuff.
  update_text(processed,department);
  makeButtons(processed, 'name');
  var enrollments = processed[department].storage;
  var iter = 0;
  enrollments.forEach(function(d){
    enrollments[iter] = Math.min(maxCutoff,d);
    iter ++ ;
  });
  // Generate a histogram using twenty uniformly-spaced bins.
  var data = d3.histogram()
    .bins(x.ticks(numBoxes))
    (enrollments);

  var yMax = d3.max(data, function(d){return d.length});
  var yMin = d3.min(data, function(d){return d.length});
  var colorScale = d3.scale.linear()
    .domain([yMin, yMax])
    .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);
  var y = d3.scale.linear()
    .domain([0, yMax])
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var bar = svg.selectAll(".bar")
    .data(data)
    .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

  bar.append("rect")
    .attr("x", 1)
    .attr("width", (x(data[0].dx) - x(0)) - 1)
    .attr("height", function(d) { return height - y(d.y); })
    .attr("fill", function(d) { return colorScale(d.y) });

  bar.append("text")
    .attr("dy", ".75em")
    .attr("y", -12)
    .attr("x", (x(data[0].dx) - x(0)) / 2)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatCount(d.y); });

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
} //Closes loadgraph

//Stats will be median class size, median student's class size, mean class size in JSON
function computeStats(){
  var departments = {};
  d3.csv("data/courses.csv", function(error, data){
    console.log(data);
    data = data.filter(function(d){return parseInt(d['UGrad']) > 0});
    data.forEach(function(d){
      var text = d['Course Department'];
      if(departments.hasOwnProperty(text)) {
        departments[text].storage.push(parseInt(d['Total']))
      }
      else {
        departments[text] = {
          storage : [parseInt(d['Total'])],
          median : 0,
          median_student : 0,
          mean : 0,
          name : text,
          total_enrollment : 0,
        }
      }
    });
    Object.keys(departments).forEach(function(key,index) {
      departments[key]['storage'] = departments[key]['storage'].sort(function(a,b){return a - b});
      var sum = departments[key]['storage'].reduce(function(a,b){return parseInt(a) + parseInt(b);});
      departments[key]['total_enrollment'] = sum;
      var length = departments[key]['storage'].length;
      //Calculate mean.  This is simple
      departments[key]['mean'] = Math.round(sum/length);
      //Calculate median.  Casework then simple.
      if(length % 2 == 1){
        departments[key]['median'] = departments[key]['storage'][(length-1)/2];
      }
      else {
        departments[key]['median'] = 0.5 * (parseInt(departments[key]['storage'][length/2]) +
          parseInt(departments[key]['storage'][length/2 - 1]));
      }
      //Calculate median student.  Find min partition for sorted list.
      var sumleft = 0;
      var sumright = sum;
      var current;
      var bestdiff = 400;
      var bestindex;
      for(var i = 0; i < length; i++){
        current = parseInt(departments[key]['storage'][i])
        sumleft += current;
        sumright -= current;
        lastdiff = sumright - sumleft;
        if(Math.abs(lastdiff) < Math.abs(bestdiff)){
          bestdiff = Math.abs(lastdiff);
          bestindex = i;
          bestdiff = lastdiff;
        }//Ends if statement
      }//Ends for loop
      if(bestdiff > 0){
        departments[key]['median_student'] = departments[key]['storage'][bestindex + 1];
      }
      else if (bestdiff < 0){
        departments[key]['median_student'] = departments[key]['storage'][bestindex];
      }
      else {
        departments[key]['median_student'] = 0.5 * (departments[key]['storage'][bestindex] + departments[key]['storage'][bestindex + 1]);
      }
    });//Ends iteration over keys
    //Load initial graph
    loadgraph(finalDepartments,'Economics');
  }) //Ends d3.csv
  return departments;
}
//Load initial values
finalDepartments = computeStats();