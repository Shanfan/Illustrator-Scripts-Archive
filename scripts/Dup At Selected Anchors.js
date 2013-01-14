// Dup At Selected Anchors

// duplicates the foreground object in the selection
// at the locations of rest of every selected anchor points.


// JavaScript Script for Adobe Illustrator CS3
// Tested with Adobe Illustrator CS3 13.0.3, Windows XP SP2 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Copyright(c) 2009 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// 2005-01-14 release on the web (with Japanese comments)
// 2009-05-23 English version

main();
function main(){
  if(documents.length < 1) return;
  
  var s = activeDocument.selection;
  if(!(s instanceof Array) || s.length < 2) return;

  var tgt_item = s[0]; // target object to duplicate
  
  // define the location where to locate at the rest of anchors.
  // if the target is a PathItem and only 1 anchor selected,
  // duplicate to locate this anchor at the rest of anchors.
  var tgt_point = [];

  // check whether only 1 anchor point is selected
  var i;
  if(tgt_item.typename == "PathItem"){
    var p = tgt_item.pathPoints;
    
    for(i = 0; i < p.length; i++){
      if(isSelected(p[i])){
        if(tgt_point.length < 1){
          tgt_point = p[i].anchor;
        } else { // means 2 or more anchors are selected
          tgt_point = [];
          break;
        }
      }
    }
  }
  
  if(tgt_point.length < 1){ // means 2 or more anchors are selected
    // find out the center of the target
    var vb = tgt_item.visibleBounds; // left, top, right, bottom
    tgt_point = [(vb[0] + vb[2]) / 2, (vb[1] + vb[3]) / 2];
  }
  
  var pathes = [];
  extractPathes(s.slice(1), 0, pathes);
  var j;
  
  for(i = 0; i < pathes.length; i++){
    p = pathes[i].pathPoints;
    
    for(var j=0; j < p.length; j++){
      if(isSelected(p[j])){
        tgt_item.duplicate().translate(p[j].anchor[0] - tgt_point[0],
                                       p[j].anchor[1] - tgt_point[1]);
      }
    }
  }
}

// -----------------------------------------------
function isSelected(p){
  return p.selected == PathPointSelection.ANCHORPOINT;
}

// --------------------------------------
function extractPathes(s, pp_length_limit, pathes){
  for(var i = 0; i < s.length; i++){
    if(s[i].typename == "PathItem"
       && ! s[i].guides
       && ! s[i].clipping){
      
      if(pp_length_limit > 0
         && s[i].pathPoints.length <= pp_length_limit) continue;
      pathes.push( s[i] );
      
    } else if(s[i].typename == "GroupItem"){
      extractPathes( s[i].pageItems, pp_length_limit, pathes);
      
    } else if(s[i].typename == "CompoundPathItem"){
      extractPathes( s[i].pathItems, pp_length_limit, pathes);
    }
  }
}
