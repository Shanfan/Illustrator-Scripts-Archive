// Metaball

// This script may help to create Metaball-like shapes

// USAGE : Draw some circles and select them, then run this script.
// When a prompt appears, type in a "rate" for the the connecting curves, then click OK.
// (it doesn't check in the script whether each path is really a circle)

// # Combining the shapes using Pathfinder may results several overlapping
//   anchor points on the path.  if it occurs, it may help to solve it to
//   use my another script "Merge Overlapped Anchors.js".
//   This is a simple sample script that merges overlapping anchors on the path.


// JavaScript Script for Adobe Illustrator CS3
// Tested with Adobe Illustrator CS3 13.0.3, Windows XP SP2 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Copyright(c) 2004-2009 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// 2005-09-15
// 2009-05-23 some refinements

main();
function main(){
  var pathes = [];
  getPathItemsInSelection(1, pathes);
  if(pathes.length < 2) return;
  
  activateEditableLayer(pathes[0]);

  // Settings ===============================

  var v = prompt("Metaball : rate ( 0 < x <= 100 )", 50);

  // You can modify this value (handle_len_rate).
  // The reason I hid this setting is because I can not think of
  // a smart way to set multiple values with the prompt window.
  var handle_len_rate = 2;

  // ========================================
  if(! v || isNaN(v) || v <= 0) return;
  if(v > 100) v = 100;
  v /= 100;

  var pathes2 = pathes.slice(0);
  var pi, i, j;
  
  for(i = pathes.length - 1; i >= 1; i--){
    for(j = i - 1; j >= 0; j--){
      pi = metaball(pathes[i], pathes[j], v, handle_len_rate);
      if(pi != null) pathes2.push(pi);
    }
  }
  app.activeDocument.selection = pathes2;
}

// ---------------------------------------------
function metaball(s0, s1, v, handle_len_rate){
  var arr = getGBCenterWidth(s0);
  o1 = arr[0];      // o:center, r:radius
  r1 = arr[1] / 2;
  
  arr = getGBCenterWidth(s1);
  o2 = arr[0];
  r2 = arr[1] / 2;

  if(r1 == 0 || r2 == 0) return;
  
  var pi2 = Math.PI / 2;
  
  var d = dist(o1, o2);

  var u1, u2;
  if(d <= Math.abs(r1 - r2)){
    return;
  } else if(d < r1 + r2){ // case circles are overlapping
    u1 = Math.acos((r1 * r1 + d * d - r2 * r2) / (2 * r1 * d));
    u2 = Math.acos((r2 * r2 + d * d - r1 * r1) / (2 * r2 * d));
  } else {
    u1 = 0;
    u2 = 0;
  }

  var t1 = getRad(o1, o2);
  var t2 = Math.acos((r1 - r2) / d);
  
  var t1a = t1 + u1 + (t2 - u1) * v;
  var t1b = t1 - u1 - (t2 - u1) * v;
  var t2a = t1 + Math.PI - u2 - (Math.PI - u2 - t2) * v;
  var t2b = t1 - Math.PI + u2 + (Math.PI - u2 - t2) * v;
  
  var p1a = setPnt(o1, t1a, r1);
  var p1b = setPnt(o1, t1b, r1);
  var p2a = setPnt(o2, t2a, r2);
  var p2b = setPnt(o2, t2b, r2);

  // define handle length by the distance between both ends of the curve to draw
  var d2 = Math.min(v * handle_len_rate, dist(p1a, p2a) / (r1 + r2));
  d2 *= Math.min(1, d * 2 / (r1 + r2)); // case circles are overlapping
  r1 *= d2;
  r2 *= d2;
  
  var pi = app.activeDocument.activeLayer.pathItems.add();
  with(pi){
    setEntirePath([p1a, p2a, p2b, p1b]);
    pt = pathPoints;
    with(pt[0]){
      leftDirection = anchor;
      rightDirection = setPnt(p1a, t1a - pi2, r1);
    }
    with(pt[1]){
      rightDirection = anchor;
      leftDirection = setPnt(p2a, t2a + pi2, r2);
    }
    with(pt[2]){
      leftDirection = anchor;
      rightDirection = setPnt(p2b, t2b - pi2, r2);
    }
    with(pt[3]){
      rightDirection = anchor;
      leftDirection = setPnt(p1b, t1b + pi2, r1);
    }
    
    // pathstyle
    stroked = s0.stroked;
    if(stroked) strokeColor = s0.strokeColor
    filled = s0.filled;
    if(filled) fillColor = s0.fillColor
    closed = true;
  }
  return pi;
}

// ------------------------------------------------
function getGBCenterWidth(pi){
  var gb = pi.geometricBounds; // left, top, right, bottom
  var w = gb[2] - gb[0];
  var h = gb[1] - gb[3];
  return [[gb[0] + w / 2, gb[3] + h / 2], w];
}

// ------------------------------------------------
function setPnt(pnt, rad, dis){
  return [pnt[0] + Math.cos(rad) * dis,
          pnt[1] + Math.sin(rad) * dis];
}

// ------------------------------------------------
function dist(p1, p2) {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2)
                   + Math.pow(p1[1] - p2[1], 2));
}

// ------------------------------------------------
function getRad(p1,p2) {
  return Math.atan2(p2[1] - p1[1],
                    p2[0] - p1[0]);
}

// ----------------------------------------------
function activateEditableLayer(pi){
  var lay = activeDocument.activeLayer;
  if(lay.locked || ! lay.visible) activeDocument.activeLayer = pi.layer;
}

// ------------------------------------------------
// extract PathItems from the selection which length of PathPoints
// is greater than "n"
function getPathItemsInSelection(n, pathes){
  if(documents.length < 1) return;
  
  var s = activeDocument.selection;
  
  if (!(s instanceof Array) || s.length < 1) return;

  extractPathes(s, n, pathes);
}

// --------------------------------------
// extract PathItems from "s" (Array of PageItems -- ex. selection),
// and put them into an Array "pathes".  If "pp_length_limit" is specified,
// this function extracts PathItems which PathPoints length is greater
// than this number.
function extractPathes(s, pp_length_limit, pathes){
  for(var i = 0; i < s.length; i++){
    if(s[i].typename == "PathItem"
       && !s[i].guides && !s[i].clipping){
      if(pp_length_limit
         && s[i].pathPoints.length <= pp_length_limit){
        continue;
      }
      pathes.push(s[i]);
      
    } else if(s[i].typename == "GroupItem"){
      // search for PathItems in GroupItem, recursively
      extractPathes(s[i].pageItems, pp_length_limit, pathes);
      
    } else if(s[i].typename == "CompoundPathItem"){
      // searches for pathitems in CompoundPathItem, recursively
      // ( ### Grouped PathItems in CompoundPathItem are ignored ### )
      extractPathes(s[i].pathItems, pp_length_limit , pathes);
    }
  }
}
