// Sine Curve

// draws (approximate) sine curve at the origin of the artboard

// The values of the coordinates are based on
// Don Lancaster's Guru's Lair Cubic Spline Library.
// http://www.tinaja.com/cubic01.asp


// JavaScript Script for Adobe Illustrator CS3
// Tested with Adobe Illustrator CS3 13.0.3, Windows XP SP2 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Copyright(c) 2009 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// 2009-05-23
// 2010.05.31  modify to work with CS5

// settings ---------------------------

var magnification_ratio = 10;
var loop_times = 8;

// ---------------------------------------------------------
// A fix for the change of the document origin in CS5,
// and for the multi-artboard in CS4 or later.
// This function locates the active artboard's origin on the
// bottom left at first, and restores it at the end.
//
// USAGE:
// var g_origin = Origin();
// ... (do something in legacy style)
// g_origin.restore();

function Origin(){
    this.ver15_or_later = (parseFloat(version.substr(0, 2)) >= 15); // CS5 or later
    this.ver14 = (version.substr(0, 2) == "14"); // CS4
    
    if(this.ver15_or_later){
        this.saved_coord_system = app.coordinateSystem;
        app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

        var idx  = app.activeDocument.artboards.getActiveArtboardIndex();
        this.ab  = app.activeDocument.artboards[idx];
        
        var o   = this.ab.rulerOrigin;
        var r   = this.ab.artboardRect;
        this.saved_origin = [o[0], o[1]];
        this.ab.rulerOrigin = [0, r[1] - r[3]];
        
    } else if(this.ver14){
        var o = app.activeDocument.rulerOrigin;
        this.saved_origin = [o[0], o[1]];
        app.activeDocument.rulerOrigin = [0, 0];
    }

    this.restore = function(){
        if(this.ver15_or_later){
            this.ab.rulerOrigin = this.saved_origin;
            app.coordinateSystem = this.saved_coord_system;
            
        } else if(this.ver14){
            app.activeDocument.rulerOrigin = this.saved_origin;
        }
    };
        
    return this;
}
// ---------------------------------------------------------
var g_origin = Origin();

main();

g_origin.restore();

function main(){
  if(documents.length<1) return;
  with(activeDocument.activeLayer){
    if(locked || !visible){
      alert("please unlock and show the active layer to draw");
      return;
    }
  }

  var path = activeDocument.activeLayer.pathItems.add();
  with(path){
    closed = false;
    filled = false;
    stroked = true;
    strokeWidth = 1.0;
    strokeColor = new GrayColor();
    strokeColor.gray = 100;
  }
  var r2 = Math.sqrt(2);
  var p  = Math.PI / 12;

  // list of coordinate for [anchor, rightDirection, leftDirection]
  var pnts = [
    [[0,0], [p, (2 * r2 - 1)/7], [-p, -(2 * r2 - 1)/7]],
    [[p*3, r2/2], [p*4, (3 * r2 + 2)/7], [p*2, (4 * r2 - 2)/7]],
    [[p*6, 1], [p*7, 1], [p*5, 1]],
    [[p*9, r2/2], [p*10, (4 * r2 - 2)/7], [p*8, (3 * r2 + 2)/7]]
    ];
  
  loop_times *= 2;
  var j;
  for(var i = 0; i < loop_times; i++){
    for(j=0; j<pnts.length; j++){
      with(path.pathPoints.add()){
        anchor = mul(pnts[j][0], i);
        rightDirection = mul(pnts[j][1], i);
        leftDirection = mul(pnts[j][2], i);
      }
    }
  }
  with(path.pathPoints.add()){
    anchor = mul(pnts[0][0], i);
    rightDirection = mul(pnts[0][1], i);
    leftDirection = mul(pnts[0][2], i);
  }
}

function mul(ar, i){
  return [(ar[0] + (i * Math.PI)) * magnification_ratio,
          ar[1] * magnification_ratio * (i % 2 ? -1 : 1)];
}
