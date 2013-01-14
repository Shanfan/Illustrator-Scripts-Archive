// Adjust Dashes

// adjusts the lengths of dashes and gaps of dashed lines
// in order to the length of the path is divisible by
// total length of dashes and gaps


// JavaScript Script for Adobe Illustrator CS3
// Tested with Adobe Illustrator CS3 13.0.3, Windows XP SP2 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Copyright(c) 2005-2009 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// 2005-03-15
// 2009-05-23 some refinements

main();
function main(){
  var s = [];
  getPathItemsInSelection(1, s);
  if(s.length < 1) return;

  var sd;
  var dashLen;
  var strokeLen;
  var rest;
  var incr;
  var dashes_count;
  var j,p,k;
  
  for(var i in s){
    sd = s[i].strokeDashes;
    if(sd.length < 1) continue;

    dashLen = 0;
    for(j in sd) dashLen += sd[j];
    if(dashLen == 0) continue;

    // gets the length of the path
    strokeLen = 0;
    p = s[i].pathPoints;
    for(j = 0; j < p.length; j++){
      k = parseIdx(p, j + 1);
      if(k < 0) break;
      
      strokeLen += getLength([p[j].anchor,        p[j].rightDirection,
                              p[k].leftDirection, p[k].anchor]);
    }
    if(sd[0] > 0) strokeLen += 0.2; // adds a bit of margin
    if(strokeLen <= dashLen) continue;
    
    // Basically widen each interval.
    // When the rest is longer than half of dashLen, shorten them.
    if(sd.length == 1){
      if(s[i].closed){
        rest = strokeLen % (dashLen * 2);
        if(rest == 0) continue;
        dashes_count = Math.round(strokeLen / (dashLen * 2));
        dashes_count *= 2;
      } else {
        rest = strokeLen % (dashLen * 2);
        if(rest == dashLen) continue;
        rest -= dashLen;
        dashes_count = Math.round(strokeLen / dashLen);
        if(dashes_count % 2 == 0) dashes_count += 1;
      }
    } else {
      rest = strokeLen % dashLen;
      if(rest == 0) continue;
      dashes_count = Math.round(strokeLen / dashLen);
    }
    
    incr = strokeLen / (dashes_count * dashLen);

    // rounds to four decimal places
    for(j in sd) sd[j] = fixedTo(sd[j] * incr, 4) - 0;
    
    s[i].strokeDashOffset = 0;
    s[i].strokeDashes = sd;
  }
}

// ----------------------------------------------
// It seems that the function "toFixed" is not available in AI10
function fixedTo(n, k){
  var arr = ((n - 0) + "").split('.');
  if(arr.length < 2 || k <= 0) return arr[0];
  if(arr[1].length > k){
//    arr[1] = ((arr[1].substr(0,k)-0)+(arr[1].charAt(k)>'4' ? 1 : 0))+"";
    arr[1] = arr[1].substr(0, k);
    if(arr[1].length > k){
      arr[0] = (arr[0] - 0 + 1) + "";
      arr[1] = arr[1].substr(1);
    }
  }
  arr[1] = arr[1].replace(/0+$/,'');
  return arr[1]=='' ? arr[0] : arr.join('.');
}

// ------------------------------------------------
// return the length of the bezier curve segment.
// q = [Q0[x,y],Q1,Q2,Q3]
function getLength(q){
  h = 1 / 128;
  var hh = h * 2;
  var m = [q[3][0] - q[0][0] + 3 * (q[1][0] - q[2][0]),
           q[0][0] - 2 * q[1][0] + q[2][0],
           q[1][0] - q[0][0]];
  var n = [q[3][1] - q[0][1] + 3 * (q[1][1] - q[2][1]),
           q[0][1] - 2 * q[1][1] + q[2][1],
           q[1][1] - q[0][1]];
  var k = [ m[0] * m[0] + n[0] * n[0],
            4 * (m[0] * m[1] + n[0] * n[1]),
            2 * ((m[0] * m[2] + n[0] * n[2]) + 2 * (m[1] * m[1] + n[1] * n[1])),
            4 * (m[1] * m[2] + n[1] * n[2]), m[2] * m[2] + n[2] * n[2] ];
  var fc = function(t, k){
    return Math.sqrt(t * (t * (t * (t * k[0] + k[1]) + k[2]) + k[3]) + k[4]) || 0 };
  var sm = (fc(0, k) - fc(1, k)) / 2;
  for(var t = h; t < 1; t += hh) sm += 2 * fc(t, k) + fc(t + h, k);
  return sm * hh;
}

// -----------------------------------------------
function parseIdx(p, n){ // PathPoints, number for index
  var len = p.length;
  if(p.parent.closed){
    return n >= 0 ? n % len : len - Math.abs(n % len);
  } else {
    return (n < 0 || n > len-1) ? -1 : n;
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
