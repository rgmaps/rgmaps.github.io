require(["esri/Map",
        "esri/views/SceneView",
        "esri/layers/FeatureLayer",
        "esri/widgets/Editor"], function(Map, SceneView, FeatureLayer, Editor) {
    var map = new Map({
      basemap: "hybrid",
      ground: "world-elevation"
    });

    var gogLayer = new FeatureLayer({
        portalItem: {
            id: "eb33faecd2724508bf6c7e35bebc314e"}
    });

    var view = new SceneView({
      container: "viewDiv",
      map: map,
      camera: {
        position: [-104.895, 38.870, 2600],
        heading: 60,
        tilt: 63.35
      },

    });
    map.add(gogLayer);

    let editor = new Editor({
        view: view
      });

      // Add widget to top-right of the view
      view.ui.add(editor, "top-right");
  });