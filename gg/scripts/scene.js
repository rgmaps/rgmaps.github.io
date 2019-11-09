require([
    "esri/Map",
    "esri/widgets/Track",
    "esri/views/MapView",
    "esri/views/SceneView",
    "esri/core/watchUtils",
    "esri/layers/FeatureLayer",
    "esri/widgets/Editor",
    "esri/widgets/Home",
    "esri/widgets/Legend",
    "esri/widgets/Search"
  ], function(Map, Track, MapView, SceneView, watchUtils, FeatureLayer, Editor, Home, Legend, Search) {
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

    var search = new Search({
      view: view1
    });

    view1.ui.add(search, "top-right");

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
    var gogPointLayerInit = new FeatureLayer({
      portalItem: {
          id: "9de11ff5356140318deffd61d5ad6c92"},
      elevationInfo:{
        mode: "on-the-ground"
      }});


    // add feature layers to variable
    var gogPointLayer = new FeatureLayer({
        portalItem: {
            id: "4db03b05488544dca370e42d76a62353"},
        elevationInfo:{
          mode: "on-the-ground"
        },
        returnZ: false,
        // Select peaks higher than 3000m
        title: "Points of Interest",
        // Set a renderer that will show the points with icon symbols
        renderer: {
          type: "simple", // autocasts as new SimpleRenderer()
          symbol: {
            type: "point-3d", // autocasts as new PointSymbol3D()
            symbolLayers: [
              {
                type: "icon", // autocasts as new IconSymbol3DLayer()
                resource: {
                  primitive: "circle"
                },
                material: {
                  color: "black"
                },
                size: 4
              }
            ]
          }
        },
        outFields: ["*"],
        // Add labels with callouts of type line to the icons
        labelingInfo: [
          {
            // When using callouts on labels, "above-center" is the only allowed position
            labelPlacement: "above-center",
            labelExpressionInfo: {
              value: "{NAME}"
            },
            symbol: {
              type: "label-3d", // autocasts as new LabelSymbol3D()
              symbolLayers: [
                {
                  type: "text", // autocasts as new TextSymbol3DLayer()
                  material: {
                    color: "black"
                  },
                  halo: {
                    color: [255, 255, 255, 0.7],
                    size: 2
                  },
                  size: 10
                }
              ],
              // Labels need a small vertical offset that will be used by the callout
              verticalOffset: {
                screenLength: 80,
                maxWorldLength: 200,
                minWorldLength: 30
              },
              // The callout has to have a defined type (currently only line is possible)
              // The size, the color and the border color can be customized
              callout: {
                type: "line", // autocasts as new LineCallout3D()
                size: 0.5,
                color: [0, 0, 0],
                border: {
                  color: [255, 255, 255, 0.7]
                }
              }
            }
          }
        ]
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
      map.add(gogPointLayerInit)
      map.add(gogLineLayer);
      map.add(gogPolyLayer);

      search.sources.push({
        layer: gogPointLayer,
        searchFields: ["Name"],
        displayField: "Name",
        exactMatch: false,
        outFields: ["Name", "Type"],
        resultGraphicEnabled: true,
        name: "Points of Interest",
        placeholder: "Example: Climbing Wall",
      });

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
      var track = new Track({
        view: view1
      });
      view1.ui.add(track, "top-left");

      

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
    view1.ui.add("logoDiv", "bottom-right");

    var legendStatus = 0
    document.getElementById('button1').onclick = function(){
      if (legendStatus == 1){
        view1.ui.remove(legend);
        legendStatus = 0;
        document.getElementById("button1").innerHTML = "&#9776;";
      }
      else{
        view1.ui.add(legend, "bottom-right");
        legendStatus = 1;
        document.getElementById("button1").innerHTML = "&#10140;"
      }
  };
  });