// Join Reasonably

// joins the open pathes in the selection together with reasonable order


// JavaScript Script for Adobe Illustrator CS3
// Tested with Adobe Illustrator CS3 13.0.3, Windows XP SP2 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Copyright(c) 2009 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// 2004-11-28 release on the web (with Japanese comments)
// 2009-05-23 English version

var conf ={};
// Settings ==================================

conf.close  = true;     // make close path. true/false

conf.torelance   = 0.5;  // merge the ends to connect within this distance (unit:point)

conf.hanLen = 0.33; // ratio of handle length to connected line

conf.dontAddRevHan = 120; // don't create handle if the angle of the polygonal line drawn through
                          // both connecting end and a handle is greater or equal than
                          // this value. ( 0 - 180 )
                          // set 0 to ignore this setting.

// ========================================
var mpi = Math.PI;
var hpi = mpi / 2; // half PI
conf.dontAddRevHan *= mpi / 180;

main();
function main(){
  var s = [];
  getPathItemsInSelection(1, s);
  if(s.length < 2) return; // it needs at least 2 pathes

  var i;
  for(i = 0; i < s.length; i++){
    readjustAnchors(s[i], conf.torelance);
  }

  var pi = s.shift(); // pick up the first path.
                      // then, connect the rest of pathes to this.
                      // so, properties of the result path is same as this path.
  var p  = pi.pathPoints;
  var z = p.length - 1;

  var pinfo = {};
  var i, p2, z2;
  
  while(s.length > 0){
    pinfo.child = null;
    
    for(i = 0; i < s.length; i++){
      p2 = s[i].pathPoints;
      z2 = p2.length - 1;
      cmpLen(pinfo, p, p2, i, 0, 0);
      cmpLen(pinfo, p, p2, i, 0, z2);
      cmpLen(pinfo, p, p2, i, z, 0);
      cmpLen(pinfo, p, p2, i, z, z2);
      if(! pinfo.d) break;
    }
    s.splice( pinfo.cIdx, 1 );
    if(pinfo.pPntIdx == 0) pireverse(pi);
    if(pinfo.cPntIdx > 0)  pireverse(pinfo.child);
    pijoin(pi, pinfo.child);
    z = p.length - 1;
  }

  if(conf.close){
    adjustHandleLen( p[z], p[0]);
    pi.closed = true;
  }
  readjustAnchors(pi);
}
// ------------------------------------------------
function cmpLen(pinfo, p, p2, i, idx1, idx2){
  var d = dist2( p[idx1].anchor, p2[idx2].anchor);
  if(!pinfo.child || d < pinfo.d){
    pinfo.d = d;               // distance
    pinfo.child = p2.parent;   // PathItem
    pinfo.cIdx = i;            // child index in extracted selection
    pinfo.pPntIdx = idx1;      // pathPoints index of parent
    pinfo.cPntIdx = idx2;      // pathPoints index of child
  }
}
// ------------------------------------------------
// adjust the length of handle
function adjustHandleLen(p1, p2){
  var d = dist(p1.anchor, p2.anchor);
  
  if(d == 0){ // distance is 0
    p2.leftDirection = p1.leftDirection;
    p1.remove();
    
  } else if(d < conf.torelance){
    var pnt = [ (p1.anchor[0] + p2.anchor[0]) / 2,
                (p1.anchor[1] + p2.anchor[1]) / 2 ];
    p2.rightDirection = [ p2.rightDirection[0] + (pnt[0] - p2.anchor[0]),
                          p2.rightDirection[1] + (pnt[1] - p2.anchor[1]) ];
    p2.leftDirection =  [ p1.leftDirection[0] + (pnt[0] - p1.anchor[0]),
                          p1.leftDirection[1] + (pnt[1] - p1.anchor[1]) ];
    p2.anchor = pnt;
    p1.remove();
    
  } else if(conf.hanLen > 0){
    d *= conf.hanLen;
    var d2 = d * d;
    if(!arrEq(p1.anchor, p1.rightDirection)){
      if(conf.dontAddRevHan
         && getRad2(p2.anchor, p1.anchor, p1.rightDirection) > conf.dontAddRevHan){
        p1.rightDirection = p1.anchor;
      } else if(dist2(p1.anchor, p1.rightDirection) > d2){
        p1.rightDirection = getPnt(p1.anchor, getRad(p1.anchor, p1.rightDirection), d);
      }
    }
    if(!arrEq(p2.anchor, p2.leftDirection)){
      if(conf.dontAddRevHan
         && getRad2(p1.anchor, p2.anchor, p2.leftDirection) > conf.dontAddRevHan){
        p2.leftDirection = p2.anchor;
      } else if(dist2(p2.anchor, p2.leftDirection) > d2){
        p2.leftDirection = getPnt(p2.anchor, getRad(p2.anchor, p2.leftDirection), d);
      }
    }
    
  } else {
    p1.rightDirection = p1.anchor;
    p2.leftDirection  = p2.anchor;
  }
}
// ----------------------------------------------
// return angle of the line drawn from "p1" [x,y] to "p2" [x,y]
function getRad(p1, p2) {
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
}
// ----------------------------------------------
// return angle of the polygonal line drawn through "p1" [x,y], "o" [x,y], "p2" [x,y]
// ( 0 - Math.PI)
function getRad2(p1, o, p2){
  var v1 = normalize(p1,o);
  var v2 = normalize(p2,o);
  return Math.acos(v1[0]*v2[0]+v1[1]*v2[1]);
}
// ------------------------------------------------
function normalize(p, o){
  var d = dist(p,o);
  return d==0 ? [0,0] : [(p[0]-o[0])/d, (p[1]-o[1])/d];
}
// ------------------------------------------------
// return distance between "p1" [x, y] and "p2" [x, y]
function dist(p1, p2) {
  return Math.sqrt(Math.pow(p1[0] - p2[0],2) + Math.pow(p1[1] - p2[1],2));
}
// ------------------------------------------------
// return square of distance
function dist2(p1, p2) {
  return Math.pow(p1[0] - p2[0],2) + Math.pow(p1[1] - p2[1],2);
}
// ------------------------------------------------
// return true if all the values in arrays "arr1" and "arr2" is same
function arrEq(arr1,arr2) {
  for(var i=0; i<arr1.length; i++) if(arr1[i] != arr2[i]) return false;
  return true;
}
// ------------------------------------------------
// reverse the order of pathPoints in PathItem "pi"
function pireverse(pi){
  var p = pi.pathPoints;
  var arr = [];
  
  for (var i=0; i<p.length; i++) {
    with(p[i]) arr.unshift( [anchor, rightDirection, leftDirection, pointType] );
  }

  for (i=0; i<arr.length; i++) {
    with(p[i]){
      anchor         = arr[i][0];
      leftDirection  = arr[i][1];
      rightDirection = arr[i][2];
      pointType      = arr[i][3];
    }
  }
}
// -----------------------------------------
// join the 1st anchor of PathItem "pi2"
// and the last anchor of PathItem "pi1"
function pijoin(pi1, pi2){
  var p1 = pi1.pathPoints;
  var p2 = pi2.pathPoints;
  adjustHandleLen(p1[p1.length-1], p2[0]);
  var pp1;
  for(var i=0; i<p2.length; i++){
    pp1 = p1.add();
    with(pp1){
      anchor         = p2[i].anchor;
      rightDirection = p2[i].rightDirection;
      leftDirection  = p2[i].leftDirection;
      pointType      = p2[i].pointType;
    }
  }
  pi2.remove();
}

// ----------------------------------------------
function getPnt(pnt, rad, dis){
  return [pnt[0] + Math.cos(rad) * dis,
          pnt[1] + Math.sin(rad) * dis];
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
       && !s[i].closed
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
// --------------------------------------
function readjustAnchors(pi, torelance){
  var p = pi.pathPoints;
  // Settings ==========================

  var minDist = torelance;
  minDist *= minDist;
  
  // ===================================
  if(p.length<2) return 1;
  var i;

  if(p.parent.closed){
    for(i=p.length-1;i>=1;i--){
      if(dist2(p[0].anchor, p[i].anchor) < minDist){
        p[0].leftDirection = p[i].leftDirection;
        p[i].remove();
      } else { break; }
    }
  }
  for(i=p.length-1;i>=1;i--){
    if(dist2(p[i].anchor, p[i-1].anchor) < minDist){
      p[i-1].rightDirection = p[i].rightDirection;
      p[i].remove();
    }
  }
  return p.length;
}

