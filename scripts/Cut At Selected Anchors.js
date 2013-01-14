// Cut At Selected Anchors

// cuts selected puthes at each selected anchor


// JavaScript Script for Adobe Illustrator CS3
// Tested with Adobe Illustrator CS3 13.0.3, Windows XP SP2 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Copyright(c) 2009 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// 2005-09-25 release on the web (with Japanese comments)
// 2009-05-23 English version

main();
function main(){
  var sp = [];
  getPathItemsInSelection(2, sp);
  if(sp.length<1) return;

  var j, k, p;
  var first_anchor_selected, idxs, ary, ancs;

  for(var i=0; i<sp.length; i++){
    p = sp[i].pathPoints;
    idxs = [[0]];
    first_anchor_selected = isSelected(p[0]);
    
    for(j = 1; j < p.length; j++){
      idxs[idxs.length - 1].push(j);
      if(isSelected(p[j])) idxs.push([j]);
    }
    if(idxs.length < 2 && !(first_anchor_selected && sp[i].closed)) continue;
    
    // adjust the array (closed path)
    if(sp[i].closed){
      if(first_anchor_selected){
        idxs[idxs.length - 1].push(0);
      } else {
        ary = idxs.shift();
        idxs[idxs.length - 1] = idxs[idxs.length - 1].concat( ary );
      }
    }

    // duplicate the path and apply the data of the array
    for(j = 0; j < idxs.length; j++){
      ary = idxs[j];
      ancs = [];
      
      for(k=ary.length - 1; k >= 0; k--) ancs.unshift(p[ary[k]].anchor);
      
      with(sp[i].duplicate()){
        closed = false;
        setEntirePath(ancs);
        
        for(k = pathPoints.length - 1; k >= 0; k--){
          with(pathPoints[k]){
            rightDirection = p[ary[k]].rightDirection;
            leftDirection  = p[ary[k]].leftDirection;
            pointType      = p[ary[k]].pointType;
          }
        }
      }
    }
    sp[i].remove(); // remove the original path
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

// --------------------------------------
function isSelected(p){
  return p.selected == PathPointSelection.ANCHORPOINT;
}
