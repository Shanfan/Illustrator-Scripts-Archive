// Remove Anchors

// removes selected anchor points


// JavaScript Script for Adobe Illustrator CS3
// Tested with Adobe Illustrator CS3 13.0.3, Windows XP SP2 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Copyright(c) 2005-2009 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// 2005-02-15 release on the web (with Japanese comments)
// 2009-05-23 English version

main();
function main(){
  if(documents.length < 1) return;
  
  var s = activeDocument.selection;
  if(!(s instanceof Array) || s.length < 1) return;

  var paths = [];
  extractPaths(s, 0, paths);

  var p, j;
  for(var i = paths.length - 1; i >= 0; i--){
    p = paths[i].pathPoints;
    for(j = p.length - 1; j >= 0; j--){
      if(isSelected(p[j])){
        if(p.length < 2) break;
        p[j].remove();
      }
    }
    if(p.length < 2 && isSelected(p[0])) paths[i].remove();
  }
  redraw();
}

// ----------------------------------------------
function isSelected(p){ // PathPoint
  return p.selected == PathPointSelection.ANCHORPOINT;
}

// --------------------------------------
function extractPaths(s, pp_length_limit, paths){
  for(var i = 0; i < s.length; i++){
    if(s[i].typename == "PathItem"){
      
      if(pp_length_limit > 0
         && s[i].pathPoints.length <= pp_length_limit) continue;
      paths.push( s[i] );
      
    } else if(s[i].typename == "GroupItem"){
      extractPaths( s[i].pageItems, pp_length_limit, paths);
      
    } else if(s[i].typename == "CompoundPathItem"){
      extractPaths( s[i].pathItems, pp_length_limit, paths);
    }
  }
}
