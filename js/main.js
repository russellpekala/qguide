
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

Array.prototype.unique = function() {
    return this.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });
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

d3.json("constants/categories.json", function(categories){
    d3.json("data/enrollment.json", function(data){
        enrollmentHistogram = new Histogram('enrollment', data, 'MATH', {x: 'Enrollment Size', y: 'Number of Classes'}, 150, numTicks=30, size={
            width: 500,
            height: 350,
            margin: { top: 40, right: 50, bottom: 60, left: 120 }
        }, _categories=categories);
    });

    d3.json("data/short_workload_list.json", function(data){
        var histogramLabels = {
            "y": 'Frequency'
        };
        d3.json("data/word_categories.json", function(wordCategories){
            var scatterData = makeScatterData(data, wordCategories);
            myscatter = new Scatter('scatter', scatterData, 'workload', 'frequency', {"y": 'Frequency'}, _size={
                width: 700,
                height: 200,
                margin: { top: 20, right: 100, bottom: 20, left: 70 }
            }, isWorkScatter=false);

            myhistogram = new Histogram('histogram', data, 'nothing', {}, _maxX=10, _numTicks=30, _size={
                width: 700,
                height: 100,
                margin: { top: 5, right: 100, bottom: 60, left: 70 }
            }, _categories=categories);
        })
    });

    d3.json("data/enrollment_history.json", function(data){
        area = new Area('area', data, labels={x:"semester", y: "enrollment"}, _size={
            width: 700,
            height: 350,
            margin: { top: 40, right: 100, bottom: 60, left: 70 }
        }, _categories=categories);
    });

    d3.json("data/correlations.json", function(correlations){
        histogramLineup = new LineUp('work-lineup', correlations, null, labels={top: "Likes to Work", bottom: "Avoids Work"}, size={
            width: 200,
            height: 350,
            margin: { top: 40, right: 100, bottom: 60, left: 50 }
        }, _categories=categories);
    });

    d3.json("data/median_student.json", function(medianStudent){
        d3.json("data/median.json", function(median){
            histogramLineup = new LineUp('histogram-lineup', medianStudent, median, labels={top: "Big Class Sizes", bottom: "Small Class Sizes"}, size={
                width: 200,
                height: 350,
                margin: { top: 40, right: 100, bottom: 60, left: 50 }
            }, _categories=categories);
        })
    });

    d3.csv("data/ranked.csv", function(data){
        stdevList = new StdevList('stdevlist', data, 'MATH', 2017, 'workload', [10, 100]);

        workScatter = new Scatter('work-scatter', data, 'Workload', 'Overall', labels={x: "Workload", y: "Rating"}, size={
            width: 500,
            height: 350,
            margin: { top: 40, right: 50, bottom: 60, left: 120 }
        }, _isWorkScatter=true, categories);
    });

});


