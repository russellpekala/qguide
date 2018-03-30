
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
  wordcloud = new WordCloud('wordcloud', data, {});
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
            margin: { top: 40, right: 50, bottom: 30, left: 120 }
        }, _categories=categories);
    });

    d3.json("data/short_workload_list.json", function(data){
        var histogramLabels = {
            "y": 'Frequency'
        };
        d3.json("constants/word_categories.json", function(wordCategories){
            var scatterData = makeScatterData(data, wordCategories);
            console.log(scatterData);
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
        workLineupF = new LineUpFocus('work-lineupf', correlations, null, _labels={top: "Likes to Work", bottom: "Avoids Work"}, _size={
            width: 80,
            height: 350,
            margin: { top: 40, right: 0, bottom: 30, left: 40 },
        },_categories=categories, _isWorkLineUp=true);
        workLineupC = new LineUpContext('work-lineupc', correlations, null, labels={top: "Likes to Work", bottom: "Avoids Work"}, size={
            width: 185,
            height: 350,
            margin: { top: 40, right: 110, bottom: 30, left: 40 },
        }, _categories=categories, _isWorkLineUp=true);
    });

    d3.json("data/median_student.json", function(medianStudent){
        d3.json("data/median.json", function(median){
            histogramLineupF = new LineUpFocus('histogram-lineupf', medianStudent, median, labels={top: "Big Class Sizes", bottom: "Small Class Sizes"}, size={
                width: 80,
                height: 350,
                margin: { top: 40, right: 0, bottom: 30, left: 40 },
            }, _categories=categories, _isWorkLineUp=false);

            histogramLineupC = new LineUpContext('histogram-lineupc', medianStudent, median, labels={top: "Big Class Sizes", bottom: "Small Class Sizes"}, size={
                width: 185,
                height: 350,
                margin: { top: 40, right: 110, bottom: 30, left: 40 },
            }, _categories=categories, _isWorkLineUp=false);
        })
    });

    d3.csv("data/ranked.csv", function(data){
        stdevList = new StdevList('stdevlist', data, 'MATH', 2017, 'workload', [10, 100]);

        workScatter = new Scatter('work-scatter', data, 'Workload', 'Overall', labels={x: "Workload", y: "Rating"}, size={
            width: 500,
            height: 350,
            margin: { top: 40, right: 50, bottom: 30, left: 120 }
        }, _isWorkScatter=true, categories);
    });

});


function brushedEnrollment() {
    // Get the extent of the current brush
    var selectionRange = d3.brushSelection(d3.select("#histogram-lineupc .brush").node());
    // Convert the extent into the corresponding domain values
    var selectionDomain = selectionRange.map(histogramLineupC.y.invert);
    selectionDomain.reverse();
    histogramLineupF.y.domain(selectionDomain);
    // Update focus chart (detailed information)
    histogramLineupF.updateVis();
}

function brushedWorkload() {
    // Get the extent of the current brush
    var selectionRange = d3.brushSelection(d3.select("#work-lineupc .brush").node());
    // Convert the extent into the corresponding domain values
    var selectionDomain = selectionRange.map(workLineupC.y.invert);
    selectionDomain.reverse();
    workLineupF.y.domain(selectionDomain);
    // Update focus chart (detailed information)
    workLineupF.updateVis();
}