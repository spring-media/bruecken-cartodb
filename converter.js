var fs = require('fs-extra')
var csv = require('csv')
var converter = require('coordinator')
var fn = converter('utm', 'latlong')

var parser = csv.parse({ delimiter: ',' }, function(err, data){
  csv.transform(data, function(d,u,i){
    if(d[0] === 'bauwerksnr') {
      d.push("latitude");
      d.push("longitude");
      return d;
    }
    var latLng = fn(d[4], d[3], 32)
    d.push(latLng.latitude)
    d.push(latLng.longitude)
    return d
  }, function(err, output){
    csv.stringify(output, function(err, finalOutput){
      fs.outputFile( __dirname + '/data/output/bruecken_karte_latlong.csv', finalOutput, function(err){
        console.log('File written!')
      })
    })
  })
})

fs.createReadStream( __dirname + '/data/bruecken_karte.csv' ).pipe(parser)
