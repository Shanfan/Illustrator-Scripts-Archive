// Circle

// draws a circle with specified number of anchor points.


// JavaScript Script for Adobe Illustrator CS3
// Tested with Adobe Illustrator CS3 13.0.3, Windows XP SP2 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Copyright(c) 2008-2009 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// 2008-04-20
// 2009-05-23 some refinements
// 2010-05-31 modify to work with cs5

var mpi = Math.PI;
var hpi = mpi / 2;
var wpi = mpi * 2;
var ver10 = (version.indexOf('10') == 0);

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
  if (documents.length < 1){
    return;
  }

  with(activeDocument.activeLayer){
    if(locked || ! visible){
      alert("Please select an unlocked and visible layer,\nthen run this script again.");
      return;
    }
  }

  // setting ----------------------------
  
  var number_of_anchors = 4; // (default)
  var radius  = 50;
  
  //-------------------------------------
  // CS : input the number of the anchor points
  if(! ver10){
    number_of_anchors = prompt("number of anchors", number_of_anchors);
    if(!number_of_anchors
       || isNaN( number_of_anchors )
       || number_of_anchors < 2){
      return;
    }
    number_of_anchors = parseInt( number_of_anchors );
  }

  var handle_length, theta;
  if(number_of_anchors == 2){
    handle_length = radius * 4 / 3;
    theta = mpi;
  } else {
    theta = wpi / number_of_anchors;
    handle_length = radius * 4 / 3 * (1 - Math.cos(theta / 2)) / Math.sin(theta / 2);
  }

  var pi = activeDocument.activeLayer.pathItems.add();
  var arr;
  for(var i = 0; i < number_of_anchors; i++){
    with(pi.pathPoints.add()){
      arr = [Math.cos(theta * i),
             Math.sin(theta * i)];
      
      anchor = [arr[0] * radius,
                arr[1] * radius];
      
      arr[0] *= handle_length;
      arr[1] *= handle_length;
      
      rightDirection = [anchor[0] - arr[1],
                        anchor[1] + arr[0]];
      leftDirection  = [anchor[0] + arr[1],
                        anchor[1] - arr[0]];
    }
  }

  with(pi){
    closed = true;
    filled = false;
    stroked = true;
    strokeColor = black();
    strokeWidth = 1;
  }
  with(activeDocument){
      pi.translate(width / 2, height / 2);
  }
}
// ------------------------------------------------
function black(){
  var col = new GrayColor();
  col.gray = 100;
  if(ver10){
    var col2 = new Color();
    col2.gray = col;
    return col2;
  }
  return col;
}
