
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
      name: k,
      frequency: num,
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
  wordcloud = new WordCloud('wordcloud', data, labels);
  // cdf = new Cdf('cdf', data, labels);
});

d3.json("data/short_workload_list.json", function(data){
  var histogramLabels = {
    "y": 'Frequency'
  };
  d3.json("data/word_categories.json", function(wordCategories){
    var scatterData = makeScatterData(data, wordCategories);
    var labelsScatter = {
      "y": 'Frequency',
    };
    myscatter = new Scatter('scatter', scatterData, 'frequency', 'workload', labelsScatter, _size={
        width: 700,
        height: 200,
        margin: { top: 20, right: 100, bottom: 20, left: 70 }
    }, isWorkScatter=false);
    myhistogram = new Histogram('histogram', data, 'nothing', histogramLabels, _maxX=10, _numTicks=30, _size={
        width: 700,
        height: 100,
        margin: { top: 5, right: 100, bottom: 60, left: 70 }
    });
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
  enrollmentHistogram = new Histogram('enrollment', data, 'MATH', labels, 150, numTicks=30, size={});
});

d3.csv("data/ranked.csv", function(data){
  stdevList = new StdevList('stdevlist', data, 'MATH', 2017, 'workload', [10, 100]);

  workLineup = new LineUp('work-lineup', [], labels={top: "Likes to Work", bottom: "Avoids Work"}, size={
      width: 200,
      height: 350,
      margin: { top: 40, right: 100, bottom: 60, left: 70 }
  });
  var sampleData2 = [{ year: 2014, MATH: 140, HIST: 100}, { year: 2015, MATH: 110, HIST: 60}, { year: 2016, MATH: 110, HIST: 90}]

  var sampleData = {
      "MATH": [{ name: "Math 113", enrollment: 12, workload: 25, overall_rating: 4.2 },
          { name: "Math 11", enrollment: 22, workload: 6, overall_rating: 4.7 }],
      "HIST" : [{ name: "Hist 11", enrollment: 32, workload: 9, overall_rating: 4.1 }]
  };

  workScatter = new Scatter('work-scatter', sampleData, 'workload', 'overall_rating', labels={x: "Rating", y: "Workload"}, size={
      width: 500,
      height: 350,
      margin: { top: 40, right: 100, bottom: 60, left: 70 }
  }, isWorkScatter=true);

  area = new Area('area', sampleData2, labels={x:"semester", y: "enrollment"}, size={
        width: 500,
        height: 350,
        margin: { top: 40, right: 100, bottom: 60, left: 70 }
    });
});
