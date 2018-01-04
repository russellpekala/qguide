
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
  cdf = new Cdf('cdf', data, 'department', 'MATH');
});

d3.json("data/short_workload_list.json", function(data){
  d3.json("data/word_categories.json", function(wordCategories){
    var scatterData = makeScatterData(data, wordCategories);
    myscatter = new Scatter('scatter', scatterData, 'workload');
    myhistogram = new Histogram('histogram', data, 'easy');
  })
});


d3.csv("data/statistics.csv", function(data){
  data.forEach(function(d){
    data.columns.forEach(function(col){
      if(!isNaN(d[col])){
        d[col] = +d[col];
      }
    });
  });
  barchart = new Barchart('barchart', data, 2017, 'workload', ['workload', 'overall']);
});
