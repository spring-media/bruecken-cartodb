if ('ontouchstart' in window) {
    $("html").addClass("touch");
}
$("#radius").on("change",function() {
  $("#radiusNumber").text(this.value+"m");
  showBridgesCrossedWithoutCarto();
});
var line,line2;
var sqlLayer;
var worstTurf;
var worstJson;
window.onload = function() {
  cartodb.createVis('map', 'https://welt.cartodb.com/api/v2/viz/722af5be-2bdc-11e6-a766-0e674067d321/viz.json',{"layer_selector":false,"mobile_layout":true})
    .done(function(vis, layers) {
      layer = layers[1];
      var sql = {
        sql:"select *,count(*) as count from bruecken_3_schlecht", //group by?
        cartocss:"#worst2{  marker-fill-opacity: 0.9;marker-line-color: #FFF;marker-line-width: 1;marker-line-opacity: 1;marker-placement: point;marker-type: ellipse;marker-width: 20;marker-fill: #B81609;marker-allow-overlap: true;}",
        interactivity:""
      }
      sqlLayer = layer.createSubLayer(sql);
      sqlLayer.hide();
      var map = vis.getNativeMap();
     router = L.Routing.control({
            show: true,
            language:"de",
            draggableWaypoints: true
      }).addTo(map);
      router.on("routesfound",function(re) {
   	    console.log("found route",re);
   	    line2 = re.routes[0].coordinates;
        showBridgesCrossedWithoutCarto();
      });
      var sql = new cartodb.SQL({ user: 'welt' });
      sql.execute("SELECT cartodb_id,ST_AsGeoJSON(the_geom) as the_geom FROM bruecken_3_schlecht")
        .done(function(data) {
          console.log("sql done",data.rows);
          worstJson = [];
          for (point in data.rows) {
            var pointJSON = {
              "type": "Feature",
              "properties": {"cartodb_id":data.rows[point].cartodb_id},
              "geometry": JSON.parse(data.rows[point].the_geom)
            }
            worstJson.push(pointJSON);
          }
          worstTurf = L.geoJson(worstJson,{
            pointToLayer: function (feature, latlng) {
              return L.circleMarker(latlng);
            }
          }).addTo(map);
      worstTurf.setStyle({
        color: '#ff0',
        fillColor:"#f00",
        radius:10,
        opacity: 0,
        weight: 0,
        fillOpacity: 0
      });
      router.setWaypoints([
        L.latLng(51.227741, 6.773456),
        L.latLng(52.030228, 8.532471)
      ]);
    })
    .error(function(errors) {
      console.log("errors:" + errors);
    });
 });
}
function showBridgesCrossedWithoutCarto() {
  console.log("crossed?");
  var found = [];
  var count = 0;
  var radius = $("#radius")[0].value/1000;
  console.log("for worst");
  worstTurf.eachLayer(function(layer) {
    layer.setStyle({
      fillOpacity:0
    })
    for(point in line2) {
      if(turf.distance(turf.point([line2[point].lng,line2[point].lat]),layer.feature,"kilometers")<=radius) {
        var cartoid = layer.feature.properties.cartodb_id;
        if(found.indexOf(cartoid) !== -1) {
          console.log("schon drin");
        } else {
          console.log("treffer",cartoid);
          found.push(cartoid);
        }
        layer.setStyle({
          fillOpacity:1
        });
        break;
      }
    }
    console.log("nach point");
  });
  console.log("nach worst");
  $("#output #matches").text(found.length);
}

function showBridgesCrossed() {
// not in use anymore
  var qryString = 'select * from bruecken_3_schlecht where ST_DWithin(ST_Transform(the_geom,3857), ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON(\''+'{"type":"LineString","coordinates":'+JSON.stringify(line2.map(function(d) {
  return [d.lng,d.lat]
  }))+'}'+'\'),4326),3857),'+15000+')';
  var sql = new cartodb.SQL({ user: 'welt' });
  sql.execute(qryString)  .done(function(data) {
      console.log("sql execute",data.rows);
    })
    .error(function(errors) {
      console.log("errors:" + errors);
    });
  sqlLayer.setSQL(qryString);
}
