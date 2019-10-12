---
layout: post
title: "ArcPy Python Toolbox Project"
comments: true
description: "First project for GEOG 777, and exploration of using ArcPy Toolboxes"
keywords: "school"
---
First project for Geog 777. Getting closer to finishing this masters....the coundown has absolutley begun. I spend all day around Esri products so I thought why the hell not spend my evening around Esri products as well. This was my first dive into using ArcGIS Python toolboxes. Overall I would say it was sucessfull but lots of refinement is still needed to get it to a spot where I feel it should be. The learning continues. 

Here is the code, based on some of the samples found in the ArcGIS Pro developer guides. 

````Python
import arcpy
from arcpy import env
from arcpy.sa import *
import os


class Toolbox(object):
    def __init__(self):
        '''Define the toolbox (the name of the toolbox is the name of the
        .pyt file).'''
        self.label = 'Toolbox'
        self.alias = ''

        # List of tool classes associated with this toolbox
        self.tools = [Tool]


class Tool(object):
    def __init__(self):
        '''Define the tool (tool name is the name of the class).'''
        self.label = 'Nitrate vs Cancer Rates Analysis'
        self.description = 'Calculates the regression from the data provided'
        self.canRunInBackground = False
   
    def getParameterInfo(self):
        #Define parameter definitions

        # First parameter
        pointField = arcpy.Parameter(
            displayName='Input Point Features',
            name='in_features',
            datatype='GPFeatureLayer',
            parameterType='Required',
            direction='Input')
        pointField.filter.list = ['Point']

        # second param
        polygonField = arcpy.Parameter(
            displayName='Input Polygon Features',
            name='in_features2',
            datatype='GPFeatureLayer',
            parameterType='Optional',
            direction='Input')
        polygonField.filter.list = ['Polygon']

        kValue = arcpy.Parameter(
            displayName='IDW K Value',
            name='inputKValue',
            datatype='long',
            parameterType='Required',
            direction='Input')
        kValue.filter.type = 'Range'
        kValue.filter.list = [0.001, 100] # change these field values

        params = [pointField, polygonField, kValue]

        return params

    def isLicensed(self):
        '''Set whether tool is licensed to execute.'''
        return True

    def updateParameters(self, parameters):
        '''Modify the values and properties of parameters before internal
        validation is performed.  This method is called whenever a parameter
        has been changed.'''
        return

    def updateMessages(self, parameters):
        '''Modify the messages created by internal validation for each tool
        parameter.  This method is called after internal validation.'''
        return

    def execute(self, parameters, messages):
        '''The source code of the tool.'''
        #inPoints = parameters[0].valueAsText
        #inPoly = parameters[1].valueAsText
        #messages.addMessage(inPoints + inPoly)
        # Set environment settings
        env.workspace = 'in_memory'
        aprx = arcpy.mp.ArcGISProject('CURRENT')
        dataPath = aprx.homeFolder # set var to store directory of data locations

    #Setting up the processing of the IDW map
        # Set local variables
        messages.addMessage('starting')
        inPointFeatures = parameters[0].valueAsText
        zField = 'nitr_ran'
        cellSize = 0.008
        power = parameters[2].valueAsText
        #searchRadius = RadiusVariable(12)

        # Execute IDW
        outIDW = Idw(inPointFeatures, zField,'', cellSize, power)

        # Save the output 
        # outIDW.save('C:/cdata/IDWout')
        idwFile = 'idw' + '_kValue_' + parameters[2].valueAsText
        outIDWFile = os.path.join(dataPath, idwFile)
        outIDW.save(outIDWFile)
        messages.addMessage('ended')
        

        lyrTest = outIDWFile 
        aprx = arcpy.mp.ArcGISProject('CURRENT')
        #aprxMap = aprx.listMaps('Map')[0]
        aprxMap = aprx.activeMap

        idwLayer = aprxMap.addDataFromPath(lyrTest)

        #ADDING ZONAL STATISTICS
        inZoneData = parameters[1].valueAsText
        zoneField = 'FID'
        inValueRaster = outIDWFile 
        zonalStatsFile = os.path.join(dataPath, 'zsout.dbf')

        if len(arcpy.ListFields(inZoneData,"ref_ID"))>0:  
            messages.addMessage('REF_ID Already exists')   
        else:  
            arcpy.AddField_management(inZoneData, 'ref_ID', "LONG", 10, field_is_nullable="NULLABLE")
            arcpy.management.CalculateField(inZoneData, "ref_ID", "!FID!", "PYTHON3", '')

        # Execute ZonalStatistics
        outZonalStatistics = ZonalStatisticsAsTable(inZoneData, zoneField, inValueRaster,
                                            zonalStatsFile, 'NODATA', 'ALL')

        # JOIN THE DATA
        arcpy.JoinField_management(parameters[1].valueAsText, 'FID', zonalStatsFile, 'FID_')
        tractlyr = aprxMap.listLayers(parameters[1].valueAsText)[0]
        tractlyr.definitionQuery = 'ZonalSt_shp1.FID IS NOT NULL'

        olsFileName = 'olsResults'
        outOLSFile = os.path.join(dataPath, olsFileName + '.shp')

        arcpy.OrdinaryLeastSquares_stats(inZoneData, 'ref_ID', outOLSFile, 
                                 'canrate','mean')

        messages.addMessage(outOLSFile)
        aprxMap.addDataFromPath(outOLSFile)

        arcpy.Delete_management('in_memory')
        # CREATE OLS LAYER

        return
````