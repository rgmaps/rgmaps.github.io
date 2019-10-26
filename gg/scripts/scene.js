require(["esri/Map",
  "esri/views/MapView",
  "esri/views/SceneView",
  "esri/layers/FeatureLayer",
  "esri/WebMap",
  "esri/WebScene",
  "esri/widgets/Editor"
], function(Map, MapView, SceneView, FeatureLayer, WebMap, WebScene, Editor) {
  var switchButton = document.getElementById("switch-btn");

  var map = new Map({
    basemap: "hybrid",
    ground: "world-elevation"
  });
  

  var gogPointLayer = new FeatureLayer({
    portalItem: {
        id: "4db03b05488544dca370e42d76a62353"},
    elevationInfo:{
      mode: "on-the-ground"
    }
  });

  var gogLineLayer = new FeatureLayer({
    portalItem: {
        id: "024fc6d76e184c0a88bd6cad7c993fef"},
    elevationInfo:{
      mode: "on-the-ground"
    }
  });

  var gogPolyLayer = new FeatureLayer({
    portalItem: {
        id: "fcb72f3742854849baec336d94b0334b"},
    elevationInfo:{
      mode: "on-the-ground"
    }
  });

  var appConfig = {
    mapView: null,
    sceneView: null,
    activeView: null,
    container: "viewDiv" // use same container for views
  };

  var initialViewParams = {
    zoom: 12,
    center: [-104.895, 38.870],
    container: appConfig.container
  };


  // create 2D view and and set active
  appConfig.mapView = createView(initialViewParams, "3d");
  appConfig.mapView.map = map;
  appConfig.activeView = appConfig.mapView;

  // create 3D view, won't initialize until container is set
  initialViewParams.container = null;
  initialViewParams.map = map;
  initialViewParams.camera = {
    position: [-104.895, 38.870, 2600],
    heading: 60,
    tilt: 63.35
  };
  
  appConfig.sceneView = createView(initialViewParams, "2d");

  // switch the view between 2D and 3D each time the button is clicked
  switchButton.addEventListener("click", function() {
    switchView();
  });

  map.add(gogPointLayer);
  map.add(gogLineLayer);
  map.add(gogPolyLayer);

  // Switches the view from 2D to 3D and vice versa
  function switchView() {
    var is3D = appConfig.activeView.type === "3d";
    var activeViewpoint = appConfig.activeView.viewpoint.clone();

    // remove the reference to the container for the previous view
    appConfig.activeView.container = null;

    if (is3D) {
      appConfig.sceneView.viewpoint = activeViewpoint;
      appConfig.sceneView.container = appConfig.container;
      appConfig.activeView = appConfig.sceneView;
      switchButton.value = "2D";
/*       scene.add(gogPointLayer);
      scene.add(gogLineLayer);
      scene.add(gogPolyLayer); */


    } else {
      // if the input view is a SceneView, set the viewpoint on the
      // mapView instance. Set the container on the mapView and flag
      // it as the active view
      appConfig.mapView.viewpoint = activeViewpoint;
      appConfig.mapView.container = appConfig.container;
      appConfig.activeView = appConfig.mapView;
      switchButton.value = "3D";
      map.add(gogPointLayer);
      map.add(gogLineLayer);
      map.add(gogPolyLayer);
    }
  }

  // convenience function for creating a 2D or 3D view
  function createView(params, type) {
    var view;
    var is2D = type === "2d";
    if (is2D) {
      view = new MapView(params);
            let editor = new Editor({
        view: view
      });

      // Add widget to top-right of the view
      view.ui.add(editor, "top-right");
      return view;
    } else {
      view = new SceneView(params);
    }
    return view;
  }
  switchView();
});