// Reverse

// reverses the order of the anchor points of each selected pathes


// JavaScript Script for Adobe Illustrator CS3
// Tested with Adobe Illustrator CS3 13.0.3, Windows XP SP2 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Copyright(c) 2004-2009 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// 2004-11-28
// 2009-05-23 some refinements. comment-out showing alert part

main();
function main(){
  var pathes = [];
  getPathItemsInSelection(1, pathes);
  if(pathes.length<1) return;

  for(var i = 0; i < pathes.length; i++){
    pireverse( pathes[i] );
  }

  /*
  // show alert when done
  var str = pathes.length == 1 ? " path" : " pathes";
  alert( pathes.length + str + " reversed" );
  */
}

// -----------------------------------------
function pireverse(pi){
  var p = pi.pathPoints;
  var ps = [];
  var i;
  
  for(i = 0; i < p.length; i++) {
    with(p[i]){
      ps.unshift([anchor, rightDirection, leftDirection, pointType]);
    }
  }
  for(i = 0; i < p.length; i++) {
    with(p[i]){
      anchor         = ps[i][0];
      leftDirection  = ps[i][1];
      rightDirection = ps[i][2];
      pointType      = ps[i][3];
    }
  }
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
