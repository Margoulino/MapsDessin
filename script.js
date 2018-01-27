function initMap() {
  /*-----Definition de la carte à afficher*/
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: {
      lat: 33.678,
      lng: -116.243
    },
    mapTypeId: google.maps.MapTypeId.NULL,
    mapTypeControl: false /*active/désactive la selection satellite/plan*/
  });

  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.NULL,/*<-----Outil main préselectionné*/
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      /*Selection des modes de dessin*/
      drawingModes: [
        google.maps.drawing.OverlayType.POLYGON,
        google.maps.drawing.OverlayType.RECTANGLE,
        google.maps.drawing.OverlayType.CIRCLE,
        google.maps.drawing.OverlayType.MARKER
      ]
    },
    polygonOptions: {
      editable: true,
      draggable: true
    },
    circleOptions: {
      editable: true,
      draggable: true
    },
    markerOptions: {
      draggable: true
    }

  });
  drawingManager.setMap(map);

  google.maps.event.addListener(drawingManager, "overlaycomplete", function(event) {
    var polygon = event.overlay;
    var rectangle = event.overlay;
    var circle = event.overlay;

    google.maps.event.addListener(polygon, 'click', function(e) {
      rotatePolygon(polygon, 1);
    });
    google.maps.event.addListener(polygon, 'rightclick', function(e) {
      rotatePolygon(polygon, -1);
    });

    google.maps.event.addListener(circle, 'click', function(e) {
      rotatePolygon(polygon, 1);
    });
    google.maps.event.addListener(circle, 'rightclick', function(e) {
      rotatePolygon(polygon, -1);
    });

    /*Verification pour que les cercles ne se transforment pas en carrés*/
    if (rectangle instanceof google.maps.Rectangle) {
      var rectPoly = createPolygonFromRectangle(rectangle);

      google.maps.event.addListener(rectPoly, 'click', function(e) {
        rotatePolygon(rectPoly, 1);
      });
      google.maps.event.addListener(rectPoly, 'rightclick', function(e) {
        rotatePolygon(rectPoly, -1);
      });
    }

  });
  //-----Cacher le fond de carte
  var styleControl = document.getElementById('style-selector-control');
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(styleControl);
  // Apply new JSON when the user chooses to hide/show features.
  document.getElementById('hide-poi').addEventListener('click', function() {
    map.setOptions({
      styles: styles['hide']
    });
  });
  document.getElementById('show-poi').addEventListener('click', function() {
    map.setOptions({
      styles: styles['default']
    });
  });
}

//----Rotation des formes-------
function createPolygonFromRectangle(rectangle) {
  var map = rectangle.getMap();

  var coords = [{
    lat: rectangle.getBounds().getNorthEast().lat(),
    lng: rectangle.getBounds().getNorthEast().lng()
  }, {
    lat: rectangle.getBounds().getNorthEast().lat(),
    lng: rectangle.getBounds().getSouthWest().lng()
  }, {
    lat: rectangle.getBounds().getSouthWest().lat(),
    lng: rectangle.getBounds().getSouthWest().lng()
  }, {
    lat: rectangle.getBounds().getSouthWest().lat(),
    lng: rectangle.getBounds().getNorthEast().lng()
  }];

  // Construct the polygon.
  var rectPoly = new google.maps.Polygon({
    path: coords,
    draggable: true,
    editable: true

  });
  var properties = ["strokeColor", "strokeOpacity", "strokeWeight", "fillOpacity", "fillColor"];
  //inherit rectangle properties
  var options = {};
  properties.forEach(function(property) {
    if (rectangle.hasOwnProperty(property)) {
      options[property] = rectangle[property];
    }
  });
  rectPoly.setOptions(options);

  rectangle.setMap(null);
  rectPoly.setMap(map);
  return rectPoly;
}

function autoRotatePolygon(polygon, angle) {
  window.setInterval(function() {
    rotatePolygon(polygon, 5);
  }, 250);
}

function rotatePolygon(polygon, angle) {
  var map = polygon.getMap();
  var prj = map.getProjection();
  var origin = prj.fromLatLngToPoint(polygon.getPath().getAt(0)); //rotate around first point

  var coords = polygon.getPath().getArray().map(function(latLng) {
    var point = prj.fromLatLngToPoint(latLng);
    var rotatedLatLng = prj.fromPointToLatLng(rotatePoint(point, origin, angle));
    return {
      lat: rotatedLatLng.lat(),
      lng: rotatedLatLng.lng()
    };
  });
  polygon.setPath(coords);
}

function rotatePoint(point, origin, angle) {
  var angleRad = angle * Math.PI / 180.0;
  return {
    x: Math.cos(angleRad) * (point.x - origin.x) - Math.sin(angleRad) * (point.y - origin.y) + origin.x,
    y: Math.sin(angleRad) * (point.x - origin.x) + Math.cos(angleRad) * (point.y - origin.y) + origin.y
  };
}

//----Cacher le fond de carte
var styles = {
  default: null,
  hide: [{
    featureType: 'background',
    stylers: [{
      visibility: 'off'
    }]
  }, {
    featureType: 'transit',
    elementType: 'labels.icon',
    stylers: [{
      visibility: 'off'
    }]
  }]
};
