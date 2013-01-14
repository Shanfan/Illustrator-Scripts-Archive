// Circumcircle

// draws circumcircles for each selcted path

// Method:
// The major reason why I wrote this script is to draw a "circumcircle"
// for a star.
// So the method to find the center and the radius for the circumcircle
// is rather incertitude.
// 1. find out a perpendicular bisector for the line connecting
//    1st anchor and 2nd anchor
// 2. do the same for 1st anchor and 3rd anchor
//    (if the path is a triangle, 2nd anchor and 3rd anchor)
// 3. find out intersection point of 1 and 2.
//    for the center of the circumcircle to draw
// 4. find out the length of the line connecting the center and 1st
//    anchor, then do the same for the center and 2nd anchor.
//    define longer one as the radius of the circumcircle to draw.


// JavaScript Script for Adobe Illustrator CS3
// Tested with Adobe Illustrator CS3 13.0.3, Windows XP SP2 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Copyright(c) 2005-2009 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// 2005-09-01 release on the web (with Japanese comments)
// 2009-05-23 some refinements

var ver10 = (version.indexOf('10') == 0);

main();
function main(){
  var sp = [];
  getPathItemsInSelection(2, sp);
  if(sp.length < 1) return;
  
  activateEditableLayer(sp[0]);

  var col = getGray(); // strokeColor
  
  var p, arr1, arr2, mp, o, j, r, r1, rIdx, pi;
  var err_fail_to_find_center = 0;
  var err_radius_is_larget_than_artboard = 0;
  
  for(var i = 0; i < sp.length; i++){
    p = sp[i].pathPoints;

    // find out the center of the circle to draw
    arr1 = perpendicularBisector(p[0].anchor, p[2].anchor);
    
    if(p.length==3){ // in case triangle
      arr2 = perpendicularBisector(p[1].anchor, p[2].anchor);
    } else {
      arr2 = perpendicularBisector(p[1].anchor, p[3].anchor);
    }
    
    o = intersection(arr1, arr2);
    if(o.length < 1){
      err_fail_to_find_center = 1;
      continue;
    }

    // find out the radius of the circle to draw
    r = dist(p[0].anchor, o);
    r1 = dist(p[1].anchor, o);
    if(r >= r1){
      rIdx = 0;
    } else {
      rIdx = 1;
      r = r1;
    }
    
    // do not draw if the radius is larger than the artboard
    with(activeDocument){
      if(r==0 || r>Math.max(width, height)){
        err_radius_is_larget_than_artboard = 1;
        continue;
      }
    }

    // draw a circle
    pi = activeDocument.activeLayer.pathItems.ellipse(o[1] + r, o[0] - r, r * 2, r * 2);
    with(pi){
      filled = false;
      stroked = true;
      strokeColor = sp[i].stroked ? sp[i].strokeColor : col;
      strokeWidth = sp[i].strokeWidth || 1;
    }
  }

  if(err_fail_to_find_center == 1)
    alert("Some circles hadn't been drawn because of fails in calculation.");
  
  if(err_radius_is_larget_than_artboard == 1)
    alert("Some circles hadn't been drawn because of too large diameters.");
}

// ------------------------------------------------
function perpendicularBisector(p1, p2){
  var mp = getMidPnt(p1, p2);
  var arr = defline([ mp[0] - (p1[1] - mp[1]), mp[1] + (p1[0] - mp[0]) ],
                    [ mp[0] - (p2[1] - mp[1]), mp[1] + (p2[0] - mp[0]) ]);
  return arr;
}

// ------------------------------------------------
function getMidPnt(p1, p2){
  return [ (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 ];
}

// ------------------------------------------------
function dist(arr1, arr2) {
  return Math.sqrt(Math.pow(arr1[0] - arr2[0], 2)
                   + Math.pow(arr1[1] - arr2[1], 2));
}

// -----------------------------------------------
function defline(p1, p2){
  var a = p1[1] - p2[1];
  var b = p1[0] - p2[0];
  return [a, -b, b * p1[1] - a * p1[0]];
}

// -----------------------------------------------
function intersection(p, q){
  var d = p[0] * q[1] - p[1] * q[0];
  if(d == 0) return [];
  return [ (q[2] * p[1] - p[2] * q[1]) / d,
           (p[2] * q[0] - q[2] * p[0]) / d ];
}

// -----------------------------------------------
function getGray(){
  var col = new GrayColor();
  col.gray = 100;
  if(ver10){
    var col2 = new Color();
    col2.gray = col;
    return col2;
  }
  return col;
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

// ----------------------------------------------
function activateEditableLayer(pi){
  var lay = activeDocument.activeLayer;
  if(lay.locked || !lay.visible) activeDocument.activeLayer = pi.layer;
}
