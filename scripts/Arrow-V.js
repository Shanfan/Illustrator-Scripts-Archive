// Arrow

// draws arrow for each selected end (anchor) of the
// selected pathes.

// The visible peaks of arrows exactly locate at each visible end
// of the selected pathes.

// The end of pathes are trimmed in order to avoid sticking out from the head of the arrow.

// The path with projection end cap is modified to but end cap.


// JavaScript Script for Adobe Illustrator CS3
// Tested with Adobe Illustrator CS3 13.0.3, Windows XP SP2 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Copyright(c) 2009 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// 2005-03-19 release on the web (with Japanese comments)
// 2009-05-23 Engilsh version

var arrow = {};
// settings ===============================
arrow.fill   = false;     // fill inside the head of the arrow with stroke color. true/false
arrow.length = 3.8;
arrow.width  = 3.6;
arrow.limit  = 1.5;       // use stroke width for enlargement factor of arrow head
                          // if the stroke width is greater than this value,
// ====================================

var mpi = Math.PI;
var hpi = mpi / 2;

main();
function main(){
  var pathes = [];
  getPathItemsInSelection(1, pathes);
  if(pathes.length<1) return;

  arrow.width /= 2;
  arrow.angle = Math.atan2( arrow.width, arrow.length);

  var i;
  var p, z, q, t;
  var other_side_has_handle;
  var this_size_has_handle;
  var show_projection_endcap_alert = false;

  for(i = 0; i < pathes.length; i++){
    if(!(pathes[i].stroked) || pathes[i].closed) continue;

    if( pathes[i].strokeCap == StrokeCap.PROJECTINGENDCAP ){
      pathes[i].strokeCap = StrokeCap.BUTTENDCAP;
      show_projection_endcap_alert = true;
    }
    
    p = pathes[i].pathPoints;
    z = p.length - 1;
    
    // eachlen : define the head length of the arrow according to the stroke width
    arrow.eachlen = (Math.max(pathes[i].strokeWidth, arrow.limit)) * arrow.length;
    
    // offset : define the distance for moving anchor point in order to 
    //          the end of the path doesn't run off the head of the arrow
    if( arrow.fill ){
      arrow.offset = arrow.eachlen * 0.8;
    } else if( pathes[i].strokeCap == StrokeCap.ROUNDENDCAP ){
      arrow.offset = 0;
    } else {
      arrow.offset = pathes[i].strokeWidth / (2 * Math.cos(hpi - arrow.angle));
    }

    // beginning side
    if(isSelected(p[0])){
      q = def4Pnts(p[0], p[1]);
      other_side_has_handle = arrNeq(q[2], q[3]);
      this_size_has_handle  = arrNeq(q[0], q[1]);
      
      t = drawArrow(pathes[i], p[0], q, q[0], 1);
      
      with(p[0]){  // define new location of anchor and handle
        if( other_side_has_handle || this_size_has_handle ){
          rightDirection = defHan(t, q, 1);
        } else {
          rightDirection = anchor;
        }
        
        leftDirection  = anchor;
      }
      if( other_side_has_handle ) p[1].leftDirection = adjHan(q[3], q[2], 1 - t);
    }
    
    // end side
    if(isSelected(p[z])){
      q = def4Pnts(p[z - 1], p[z]);
      other_side_has_handle = arrNeq(q[0], q[1]);
      this_size_has_handle  = arrNeq(q[2], q[3]);
      
      t = drawArrow(pathes[i], p[z], q, q[3], -1);
      
      with(p[z]){
        rightDirection = anchor;
        
        if( other_side_has_handle || this_size_has_handle ){
          leftDirection = defHan(t, q, 0);
        } else {
          leftDirection = anchor;
        }
      }
      if( other_side_has_handle ) p[z - 1].rightDirection = adjHan(q[0], q[1], t);
    }
  }
  redraw();

  if( show_projection_endcap_alert ){
    alert("NOTICE: The pathes with PROJECTION end cap\n"
          + "  were modified to BUT end cap.\n"
          + "  Please undo if it's an unwanted result.");
  }
}
// --------------------------------------
function def4Pnts(p1, p2){
  return [p1.anchor, p1.rightDirection, p2.leftDirection, p2.anchor]
}
// --------------------------------------
// draw the arrow
function drawArrow(line, ppt, q, anc, sn){
  var t0, newanc;
  
  if( arrow.offset > 0 ){
    t0 = getT4Len(q, arrow.offset * sn);
    newanc = bezier(q, t0);
  } else {
    if( sn > 0 ){
      t0 = 0;
      newanc = q[0];
    } else {
      t0 = 1;
      newanc = q[3];
    }
  }
  
  var pi = line.duplicate();

  with(pi){
    if(arrow.fill){
      closed = true;
      filled = true;
      fillColor = strokeColor;
      stroked = false;
    } else {
      filled = false;
      anc = newanc;
      strokeDashes = [];
      
      if( line.strokeCap == StrokeCap.ROUNDENDCAP ){
        strokeJoin = StrokeJoin.ROUNDENDJOIN;
      } else {
        strokeJoin = StrokeJoin.MITERENDJOIN;
      }
    }
    
    var t = getRad(anc, bezier(q, getT4Len(q, arrow.eachlen * sn * Math.cos(arrow.angle))));
    var p = pathPoints;
    
    for(var i = p.length - 1; i > 1; i--) p[i].remove();
    
    p[0].anchor = getPnt(anc, t - arrow.angle, arrow.eachlen);    fixDir(p[0]);
    p[1].anchor = anc;                                            fixDir(p[1]);
    p.add();
    p[2].anchor = getPnt(anc, t + arrow.angle, arrow.eachlen);    fixDir(p[2]);
  }
  ppt.anchor = newanc;
  return t0;
}

// --------------------------------------
// return the angle of the line drawn from p1 to p2
function getRad(p1, p2) {
  return Math.atan2(p2[1] - p1[1],
                    p2[0] - p1[0]);
}

// -----------------------------------------------
// bezier curve calc
// return "[ x, y ]" for the bezier curve that has control points "q [q1[x,y], q2, q3, q4]"
// with parameter "t"
function bezier(q, t) {
  var u = 1 - t;
  return [u*u*u * q[0][0] + 3*u*t*(u* q[1][0] + t* q[2][0]) + t*t*t * q[3][0],
          u*u*u * q[0][1] + 3*u*t*(u* q[1][1] + t* q[2][1]) + t*t*t * q[3][1]];
}

// ------------------------------------------------
function getPnt(pnt, rad, dis){
  return [pnt[0] + Math.cos(rad) * dis,
          pnt[1] + Math.sin(rad) * dis];
}

// ------------------------------------------------
// return the coordinate of the handle which is created
// when a bezier curve "q" is divided at the point of parameter "t"
// i=1->rightDirection, i=0->leftDirection
function defHan(t, q, i){
  return [t * (t * (q[i][0] - 2 * q[i + 1][0] + q[i + 2][0]) + 2 * (q[i + 1][0] - q[i][0])) + q[i][0],
          t * (t * (q[i][1] - 2 * q[i + 1][1] + q[i + 2][1]) + 2 * (q[i + 1][1] - q[i][1])) + q[i][1]];
}

// ------------------------------------------------
// multiply the handle length of the pathPoint with "m"
function adjHan(anc, dir, m){
  return [anc[0] + (dir[0] - anc[0]) * m,
          anc[1] + (dir[1] - anc[1]) * m];
}

// ------------------------------------------------
// set the handles of pathPoint "pt"
// into same location of the anchor point
function fixDir(pt){
  pt.rightDirection = pt.anchor;
  pt.leftDirection  = pt.anchor;
}

// ------------------------------------------------
// return the bezier curve parameter "t"
// at the point which the length of the bezier curve segment
// (from the point start drawing) is "len"
// when "len" is 0, return the length of whole this segment.
function getT4Len(q, len){
  var m = [ q[3][0] - q[0][0] + 3 * (q[1][0] - q[2][0]),
            q[0][0] - 2 * q[1][0] + q[2][0],
            q[1][0] - q[0][0] ];
  var n = [ q[3][1] - q[0][1] + 3 * (q[1][1] - q[2][1]),
            q[0][1] - 2 * q[1][1] + q[2][1],
            q[1][1] - q[0][1] ];
  var k = [ m[0] * m[0] + n[0] * n[0],
            4 * (m[0] * m[1] + n[0] * n[1]),
            2 * ((m[0] * m[2] + n[0] * n[2]) + 2 * (m[1] * m[1] + n[1] * n[1])),
            4 * (m[1] * m[2] + n[1] * n[2]),
            m[2] * m[2] + n[2] * n[2] ];
  
   var fullLen = getLength(k, 1);

  if(len == 0){
    return fullLen;
    
  } else if(len < 0){
    len += fullLen;
    if(len < 0) return 0;

  } else if(len > fullLen){
    return 1;
  }
  
  var t, d;
  var t0 = 0;
  var t1 = 1;
  var torelance = 0.001;
  
  for(var h = 1; h < 30; h++){
    t = t0 + (t1 - t0) / 2;
    d = len - getLength(k, t);
    if(Math.abs(d) < torelance) break;
    else if(d < 0) t1 = t;
    else t0 = t;
  }
  return t;
}

// ------------------------------------------------
// return the length of the bezier curve
// that has coefficients "k" (specified in getT4Len)
// with the range of parameter t=0 to "t"
function getLength(k, t){
  var h = t / 128;
  var hh = h * 2;
  
  var fc = function(t, k){
    return Math.sqrt(t * (t * (t * (t * k[0] + k[1]) + k[2]) + k[3]) + k[4]) || 0;
  };
  
  var total = (fc(0, k) - fc(t, k)) / 2;
  for(var i = h; i < t; i += hh) total += 2 * fc(i, k) + fc(i + h, k);
  return total * hh;
}

// ------------------------------------------------
// return true if array "arr1" and "arr2" are different in values
function arrNeq(arr1, arr2) {
  for(var i in arr1){
    if(arr1[i] != arr2[i]) return true;
  }
  return false;
}

// -----------------------------------------------
function isSelected(p){ // PathPoint
  return p.selected == PathPointSelection.ANCHORPOINT; }

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
