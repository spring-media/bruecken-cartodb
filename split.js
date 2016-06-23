var fs = require('fs-extra')
var csv = require('csv')


var parser = csv.parse({ delimiter: ',' },
  function(err,data) {
    var filtered = {
      top:[],
      average:[],
      worst:[]
    };
    console.log("data");
    filtered.top.push(data[0]);
    filtered.average.push(data[0]);
    filtered.worst.push(data[0]);
    for(row in data) {
      var grade = data[row][1];
      if(grade <= 2) {
        filtered.top.push(data[row]);
        continue;
      }
      if(grade <= 3.5) {
        filtered.average.push(data[row]);
        continue;
      }
      if(grade > 3.5) {
        filtered.worst.push(data[row]);
        continue;
      }
    }
    console.log(filtered.top.length,filtered.average.length,filtered.worst.length);
    csv.stringify(filtered.top,function(err,finalOutput){
      fs.outputFile(__dirname+'/data/output/csv_top.csv',finalOutput,function(err) {
        console.log("top written");
      })
    });
    csv.stringify(filtered.average,function(err,finalOutput){
      fs.outputFile(__dirname+'/data/output/csv_average.csv',finalOutput,function(err) {
        console.log("average written");
      })
    });
    csv.stringify(filtered.worst,function(err,finalOutput){
      fs.outputFile(__dirname+'/data/output/csv_worst.csv',finalOutput,function(err) {
        console.log("worst written");
      })
    });
  }
 /*function(err, data){
  csv.transform(data, function(d){
    var latLng = fn(d[4], d[3], 32)
    d.push(latLng.latitude)
    d.push(latLng.longitude)
    return d
  }, function(err, output){
    csv.stringify(output, function(err, finalOutput){
      fs.outputFile( __dirname + '', finalOutput, function(err){
        console.log('File written!')
      })
    })
  })
}*/
);

fs.createReadStream( __dirname + '/data/output/bruecken_karte_latlong.csv' ).pipe(parser)
