
// Inverts dict
function swap(json){
  var ret = {};
  for(var key in json){
    json[key].forEach(function(el){
      ret[el] = key;
    });
  }
  return ret;
}

function makeScatterData(raw_data, categories){
  var result = [];
  var assignments = swap(categories);
  Object.keys(raw_data).forEach(function (k){
    d = raw_data[k];
    var num = d.length;
    var mean = d.reduce(function(a, b){ return a + b; }) / num;
    result.push({
      word: k,
      num: num,
      workload: mean,
      category: assignments[k]
    });
  });
  return result;
}

d3.json("data/cdf_data.json", function(data){
  var labels = {
    "x": 'Word',
    "y": 'Cumulative Frequency',
    "title": 'Cumulative Distribution of Words'
  };
  cdf = new Cdf('cdf', data, labels);
});

d3.json("data/short_workload_list.json", function(data){
  var labels = {
    "x": 'Workload',
    "y": 'Number of Occurances at that Workload',
    "title": 'A Look at The Use of Words'
  };
  d3.json("data/word_categories.json", function(wordCategories){
    var scatterData = makeScatterData(data, wordCategories);
    var labelsScatter = {
      "x": 'Frequency',
      "y": 'Workload',
      "title": 'A Look at The Use of Words--Scatter'
    };
    myscatter = new Scatter('scatter', scatterData, 'workload', labelsScatter);
    myhistogram = new Histogram('histogram', data, 'easy', labels, 30, 15);
  })
});

d3.json("constants/conventions.json", function(conventions){
  d3.csv("data/statistics.csv", function(data){
    data.forEach(function(d){
      data.columns.forEach(function(col){
        if(!isNaN(d[col])){
          d[col] = +d[col];
        }
      });
    });
    barchart = new Barchart('barchart', data, 2017, 'workload', ['workload', 'overall'], conventions);
  });
});

d3.json("data/enrollment.json", function(data){
  var labels = {
    "x": 'Enrollment Size',
    "y": 'Number of Classes',
    "title": 'Enrollment Data'
  };
  enrollmentHistogram = new Histogram('enrollment', data, 'MATH', labels, 30, 150);
});

d3.csv("data/ranked.csv", function(data){
  console.log(data);
  stdevList = new StdevList('stdevlist', data, 'MATH', 2017, 'workload', [10, 100]);
});
