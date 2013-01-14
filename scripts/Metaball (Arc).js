// Metaball (Arc)

// This script may help to create Metaball-like shapes

// USAGE : Draw some circles and select them, then run this script.
// When a prompt appears, type in a number for the (minimum) diameter of
// the connecting arcs, then click OK.
// (it doesn't check in the script whether each path is really a circle)

// # Combining the shapes using Pathfinder may results several overlapping
//   anchor points on the path.  if it occurs, it may help to solve it to
//   use my another script "Merge Overlapped Anchors.js".
//   This is a simple sample script that merges overlapping anchors on the path.


// JavaScript Script for Adobe Illustrator CS3
// Tested with Adobe Illustrator CS3 13.0.3, Windows XP SP2 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Copyright(c) 2009 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// 2005-09-15
// 2009-05-23 simplifies some functions

var ver10 = (version.indexOf('10') == 0);

const mpi = Math.PI;
const hpi = mpi/2;
main();
function main(){
  // Settings (ver.10) ==========================

  var m = 50;  // default value for the diameter (millimeter)

  // ========================================
  if (documents.length<1) return;
  var s = activeDocument.selection;
  if (!(s instanceof Array) || s.length<1) return;
  
  var sp = [];
  extractPathes(s, 1, sp);
  if(sp.length < 2) return;
  activateEditableLayer(sp[0]);

  if(version.indexOf('10') != 0){ m = prompt("Metaball : input diameter (mm)", m); }
  if(!m || isNaN(m)) return;
  var r = mm2pt(m) / 2;

  var sp2 = sp.slice(0);
  var pi, j;
  for(var i = sp.length - 1; i >= 1; i--){
    for(j = i - 1; j >= 0; j--){
      pi = metaball(sp[i], sp[j], r);
      if(pi != null) sp2.push(pi);
    }
  }
  activeDocument.selection = sp2;
}

// ---------------------------------------------
function metaball(s0, s1, r){
  var arr = getGBCenterWidth(s0);
  var o1 = arr[0];
  var r1 = arr[1] / 2;
  
  arr = getGBCenterWidth(s1);
  var o2 = arr[0];
  var r2 = arr[1] / 2;
  
  if(r1 == 0 || r2 == 0) return;
  
  var d = dist(o1, o2);
  if(d <= Math.abs(r1 - r2)) return;

  if(d > r1 + r2){
    var r3 = 2 * (r1 - r2);
    var dr = d * d + r1 * r1 - r2 * r2;
    var r4 = equation2_min(r3 * r3,
                           2 * dr * r3 - 8 * d * d * r1,
                           dr * dr - 4 * d * d * r1 * r1);
    if(r4) r = Math.max( Math.abs(r4) * 1.1, r);
  }
  
  var ot1 = getRad(o1, o2);
  var ot2 = ot1 + mpi;

  var t = 2 * (r * (r + r1 + r2) + r1 * r2);
  if(t == 0) return;
  t = Math.acos((2 * r * (r + r1 + r2) + (r1 * r1 + r2 * r2 - d * d)) / t);
  if(isNaN(t)) return;
  
  var rr1 = r + r1;
  var rr2 = r + r2;
  var t2 = Math.acos( (d * d + rr1 * rr1 - rr2 * rr2) / (2 * d * rr1) );
  var t3 = mpi - t2 - t;

  var h = getHandleLengthBase(t) * r;

  var pi = s0.duplicate();
  with(pi){
    var p = pathPoints;
    if(p.length > 4) for(var i = p.length-1; i > 3; i--) p[i].remove();
    with(p[0]){
      anchor = setPnt(o1, ot1 + t2, r1);
      leftDirection = anchor;
      rightDirection = setPnt(anchor, ot1 + t2 - hpi, h);
    }
    with(p[1]){
      anchor = setPnt(o2, ot2 - t3, r2);
      leftDirection = setPnt(anchor, ot2 - t3 + hpi, h);
      rightDirection = anchor;
    }
    with(p[2]){
      anchor = setPnt(o2, ot2 + t3, r2);
      leftDirection = anchor;
      rightDirection = setPnt(anchor, ot2 + t3 - hpi, h);
    }
    with(p[3]){
      anchor = setPnt(o1, ot1 - t2, r1);
      leftDirection = setPnt(anchor, ot1 - t2 + hpi, h);
      rightDirection = anchor;
    }
  }
  return pi;
}

// ------------------------------------------------
function getGBCenterWidth(pi){
  var gb = pi.geometricBounds; // left, top, right, bottom
  return [[(gb[0] + gb[2]) / 2, (gb[1] + gb[3]) / 2], gb[2] - gb[0]];
}

// ------------------------------------------------
function setPnt(pnt, rad, dis){
  return [pnt[0] + Math.cos(rad) * dis,
          pnt[1] + Math.sin(rad) * dis];
}

// ------------------------------------------------
function dist(p1, p2) {
  return Math.sqrt(Math.pow(p1[0] - p2[0],2) + Math.pow(p1[1] - p2[1],2));
}

// ------------------------------------------------
function getHandleLengthBase(theta){
  return 4 / 3 * (1 - Math.cos( theta / 2 )) / Math.sin( theta / 2 );
}
// ------------------------------------------------
function getRad(p1,p2) {
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
}

// ----------------------------------------------
function mm2pt(n){  return n * 2.83464567;  }

// --------- -------------------------------------
// returns only minimum one of answers ###########
function equation2_min(a,b,c) {
  if(a == 0) return b == 0 ? null : -c / b;
  a *= 2;
  var d = b * b - 2 * a * c;
  if(d < 0) return;
  var rd = Math.sqrt(d);
  if(d > 0) return Math.min((-b + rd) / a, (-b - rd) / a);
  else return -b / a;
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
// ----------------------------------------------
function activateEditableLayer(pi){
  var lay = activeDocument.activeLayer;
  if(lay.locked || !lay.visible) activeDocument.activeLayer = pi.layer;
}
