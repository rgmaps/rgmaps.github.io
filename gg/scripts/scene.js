require([
    "esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/core/watchUtils",
    "esri/layers/FeatureLayer",
    "esri/widgets/Editor",
    "esri/widgets/Home",
    "esri/widgets/Legend"
  ], function(Map, MapView, SceneView, watchUtils, FeatureLayer, Editor, Home, Legend) {
    var map = new Map({
      basemap: "hybrid",
      ground: "world-elevation"
    });

    var view1 = new SceneView({
      id: "view1",
      container: "view1Div",
      map: map,
      camera: {
        position: [-104.895, 38.870, 2600],
        heading: 60,
        tilt: 63.35
      },
    });

    var view2 = new MapView({
      id: "view2",
      container: "view2Div",
      map: map,
      center: [-104.879, 38.879],
      zoom: 16,
      constraints: {
        // Disable zoom snapping to get the best synchronization
        snapToZoom: false
      }
    });

    // add feature layers to variable
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

      //add feature layers to map
      map.add(gogPointLayer);
      map.add(gogLineLayer);
      map.add(gogPolyLayer);

      //create editor widget
      let editor = new Editor({
        view: view2
      });

      // Add widget to top-right of the view
      view2.ui.add(editor, "top-right");

      //add home button
      var homeBtn = new Home({
        view: view1
      });

      // Add the home button to the top left corner of the view
      view1.ui.add(homeBtn, "top-left");

      //add legend to scene view only
      var legend = new Legend({
        view: view1,
        layerInfos: [
          {
            layer: gogLineLayer,
            title: "Roads and Trails"
          },
          {
            layer: gogPointLayer,
            title: "Attractions"
          },
          {
            layer: gogPolyLayer,
            title: "Areas"
          }
        ]
      });
      legend.style = "card";

      // Add widget to the bottom right corner of the view
      view1.ui.add(legend, "bottom-right");
      
    /**
     * utility method that synchronizes the viewpoint of a view to other views
     */
    var synchronizeView = function(view, others) {
      others = Array.isArray(others) ? others : [others];

      var viewpointWatchHandle;
      var viewStationaryHandle;
      var otherInteractHandlers;
      var scheduleId;

      var clear = function() {
        if (otherInteractHandlers) {
          otherInteractHandlers.forEach(function(handle) {
            handle.remove();
          });
        }
        viewpointWatchHandle && viewpointWatchHandle.remove();
        viewStationaryHandle && viewStationaryHandle.remove();
        scheduleId && clearTimeout(scheduleId);
        otherInteractHandlers = viewpointWatchHandle = viewStationaryHandle = scheduleId = null;
      };

      var interactWatcher = view.watch("interacting,animation", function(
        newValue
      ) {
        if (!newValue) {
          return;
        }
        if (viewpointWatchHandle || scheduleId) {
          return;
        }

        // start updating the other views at the next frame
        scheduleId = setTimeout(function() {
          scheduleId = null;
          viewpointWatchHandle = view.watch("viewpoint", function(
            newValue
          ) {
            others.forEach(function(otherView) {
              otherView.viewpoint = newValue;
            });
          });
        }, 0);

        // stop as soon as another view starts interacting, like if the user starts panning
        otherInteractHandlers = others.map(function(otherView) {
          return watchUtils.watch(
            otherView,
            "interacting,animation",
            function(value) {
              if (value) {
                clear();
              }
            }
          );
        });

        // or stop when the view is stationary again
        viewStationaryHandle = watchUtils.whenTrue(
          view,
          "stationary",
          clear
        );
      });

      return {
        remove: function() {
          this.remove = function() {};
          clear();
          interactWatcher.remove();
        }
      };
    };

    /**
     * utility method that synchronizes the viewpoints of multiple views
     */
    var synchronizeViews = function(views) {
      var handles = views.map(function(view, idx, views) {
        var others = views.concat();
        others.splice(idx, 1);
        return synchronizeView(view, others);
      });

      return {
        remove: function() {
          this.remove = function() {};
          handles.forEach(function(h) {
            h.remove();
          });
          handles = null;
        }
      };
    };

    // bind the views
    synchronizeViews([view1, view2]);

    var legendStatus = 1
    document.getElementById('button1').onclick = function(){
      if (legendStatus == 1){
        view1.ui.remove(legend);
        legendStatus = 0
      }
      else{
        view1.ui.add(legend, "bottom-right");
        legendStatus = 1
      }
  };
  });