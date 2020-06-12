---
layout: post
title: "Making Labeling Better in AutoCAD"
comments: true
description: "Extending ArcGIS for AutoCAD to make labeling great again"
keywords: "school"
---
As a preface, the whole point of this post is to explain a bit about the project I am embarking on for my Capstone Course in my [GIS Masters program](https://geography.wisc.edu/gis/onlinemasters/) (GO BADGERS!) ![](https://d1si3tbndbzwz9.cloudfront.net/football/team/748/logo.png). 

One of the big problems with GIS and CAD integration is the incompatibility of concepts between the two. Most people believe that these two platforms are competitors but in reality they are nothing of the sort. They are actually complimentary to one another. Each has their strengths and each has their weakness, and those strengths and weakness tend to be opposite one another.

Labeling is a strength in GIS and particularly ArcGIS. Labels are derived from attribute values stored in the fields of the data. The makes it easy to label every feature without having to perform a laborious manual process (as you do in AutoCAD). The ArcGIS engine can handle this for you, to include label text and label placement. AutoCAD lacks this sort of Automatic labeling ability. Labels in AutoCAD are just another entity in the drawing, they are treated as if there were a point object. This provides more flexibility but at the same time can lead to labor intensive workflows for the CAD user. 

When looking to solve this problem it is first useful to see how a CAD file is structured. At the core of it, CAD drawings (.dwg) are just databases. They hold the information about what the object is and the coordinates for that object. So in many ways this is similar to GIS. Both are really database driven programs. When you start to think about things in this way you start to see how these two systems can get closer together. The [ArcGIS for AutoCAD](https://www.esri.com/en-us/arcgis/products/arcgis-for-autocad) plugin does just this. It created connections to GIS feature layers that lives on the web and adds them to a CAD drawing. In doing so it stores the Geometry in the CAD drawing while extending the "CAD Database" by adding the attribute information of the GIS features. So now we have a CAD drawing with both the geometry and the attribute information. We are bringing these two tools closer together. 

So now that we have all the information we need, by extending AutoCAD with ArcGIS for AutoCAD we can start thinking about how to bring some more GIS functionality to AutoCAD. The goal is to create a tool, written on top of ArcGIS for AutoCAD, that can generate AutoCAD labels on features that contain attribute information. Here are the next steps for my project:

1. Learn C#
2. Wrap my head around the AutoCAD .net API
