// Merge the Overlapped Anchors

// merges nearly overlapped anchor points.
// also reports how many anchor points had been reduced.

// USAGE: Select the path(es) and run this script.


// JavaScript Script for Adobe Illustrator CS3
// Tested with Adobe Illustrator CS3 13.0.3, Windows XP SP2 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Copyright(c) 2005-2009 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// 2005-09-16
// 2009-05-23 some refinements


// Setting ===========================

// merge the anchors when the distance between 2 points is
// within this value (in point)
var minDist = 0.05;

// report how many anchors had been reduced for
// this number of pathes in the selection. (counting from foreground)
var repo_max = 10;

// ===================================
minDist *= minDist;

var result = {};
result.before = 0;
result.after  = 0;

var pathes = [];
getPathItemsInSelection(2, pathes);

if(pathes.length > 0){
  var p, len;
  var msgs = [];
  
  for(var j = pathes.length - 1; j >= 0; j--){
    p = pathes[j].pathPoints;
    
    readjustAnchors(p, minDist, result);
    
    if(j < repo_max){
      if(result.after == 0){
        msgs.unshift( "removed\n" );
        
      } else if(result.after < result.before){
        msgs.unshift( result.before + " => " + result.after + "\n" );
        
      } else {
        msgs.unshift( " -\n" );
      }
      msgs.unshift( "PathItem # " + (j + 1) + " : ");
    }
  }

  if(pathes.length > repo_max){
    msgs.push( "\n(a log for first " + repo_max + " pathes)" );
  }
  
  alert("# the number of anchors\n      before => after\n------------------------\n" + msgs.join(""));
}

// ------------------------------------------------
function readjustAnchors(p, minDist, result){
  result.before = p.length;
  var i;
  
  if(p.parent.closed){
    for(i = p.length - 1; i >= 1; i--){
      if(dist2(p[0].anchor, p[i].anchor) < minDist){
        p[0].leftDirection = p[i].leftDirection;
        p[i].remove();
      } else {
        break;
      }
    }
  }
  
  for(i = p.length - 1; i >= 1; i--){
    if(dist2(p[i].anchor, p[i - 1].anchor) < minDist){
      p[i - 1].rightDirection = p[i].rightDirection;
      p[i].remove();
    }
  }
  
  if(p.length < 2){
    p.parent.remove();
    result.after = 0;
  } else {
    result.after = p.length;
  }
}

// ------------------------------------------------
// return the squared distance between p1=[x,y] and p2=[x,y]
function dist2(p1, p2) {
  return Math.pow(p1[0] - p2[0], 2)
       + Math.pow(p1[1] - p2[1], 2);
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
    if(s[i].typename == "PathItem"){
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
