// Tangents From A Point

// draws tangent lines from a selected anchor point to selected curved segments.

// This script tries to find a path with only 1 anchor selected,
// from foreground to background. And specifies the selected point
// of the path as starting point of tangents.
// "the selected curved segments" means rest of the selected pathes.

// You can use an isolated point as the starting point.
// In this case, starting isolated point is removed after drawing tangents.

// Drawn tangents have handles at ends.
// So you can move the starting side of anchor point with keeping tangency.


// JavaScript Script for Adobe Illustrator CS3
// Tested with Adobe Illustrator CS3 13.0.3, Windows XP SP2 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Copyright(c) 2006-2009 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// 2006-03-29
// 2009-05-23 some refinements

// ------------------------------------------------
var ver10 = (version.indexOf('10') == 0);

function main(){
  var s = [];
  getPathItemsInSelection(0, s);
  if(s.length < 2) return;
  
  activateEditableLayer(s[0]);
  
  // detected anchor point to be starting point
  var j, p, tgtItem, tgtIdx, tgt;
  var sw, scol;
  
  LOOP: for(var i=0; i<s.length; i++){
    if(!sw && s[i].stroked){
      sw   = s[i].strokeWidth;
      scol = s[i].strokeColor;
      if(tgt != null) break;
    }
    if(tgt != null) continue;
    
    p = s[i].pathPoints;
    tgtIdx = null;
    for(j = 0; j < p.length; j++){
      if(isSelected(p[j])){
        
        if(tgtIdx != null) continue LOOP;

        tgtIdx = j;
      }
    }
    if(tgtIdx != null){
      tgtItem = s[i];
      tgt = p[tgtIdx].anchor;
      if(s[i].stroked){
        sw   = s[i].strokeWidth;
        scol = s[i].strokeColor;
      }
      s[i] = null;
    }
  }
  if(!tgt){
    alert("Error: Fail to find a point to draw tangents from.\n"
          + "  ( This script searches a path which has only one\n"
          + "  selected anchor point, and tries to draw tangents\n"
          + "  from this point to other selected pathes. )");
    return;
  }
  if(! sw){
    sw   = 1;
    scol = col_Gray();
  }

  var n = drawTangentFromPnt(tgt, s, scol, sw);
  
  if(n > 0){
    // remove isolated point
    if (tgtItem.pathPoints.length == 1) tgtItem.remove();
  } else {
    alert("It seems that there's no tangent\n"
          + "which can draw from specified point.");
  }
}

// ------------------------------------------------
function drawTangentFromPnt(tgt, s, scol, sw){ // tgt : [x,y], s : Array of PathItems
  var conf = {};
  // settings =============================================

  // if true, tries to draw tangents to the peaks.
  conf.include_vertex = false;
  
  // ======================================================
  
  // starting point
  xx = tgt[0];
  yy = tgt[1];

  var i, k, h, bz, ar;
  var tarr = [];
  
  for(i = 0; i < s.length; i++){
    if(s[i] == null) continue;
    
    p = s[i].pathPoints;
    if(p.length<2) continue;  // ignores isolated point
    
    for(j = 0; j < p.length; j++){
      // draws lines to peaks
      if(conf.include_vertex && isSelected(p[j]) && isCorner(p,j)){
        ar = [ p[j].anchor[0] - xx,
               p[j].anchor[1] - yy ];
        if(juufuku_chosa(tgt, ar, tarr)) tarr.push(ar);
      }

      // ignores not selected segments
      k = getIdx(s[i], j + 1);
      if(k < 0) break;
      if (! sideSelection(p[j], p[k])) continue;

      // draws tangents
      bz = new Bezier(p, j, k);
      bz.mvDat(-xx, -yy);
      
      tarr = getTangent(bz, 0, tgt, tarr);
      tarr = getTangent(bz, 3, tgt, tarr);
    }
  }

  // draws tangents
  if (tarr.length > 0) {
    for(i = 0; i < tarr.length; i++){
      p = activeDocument.activeLayer.pathItems.add();

      with(p){

        setEntirePath([tgt, [tarr[i][0] + xx,
                             tarr[i][1] + yy]]);
        filled = false;
        stroked = true;
        strokeColor = scol;
        strokeWidth = sw;

        // extends handles
        pathPoints[1].leftDirection = [xx + tarr[i][0] * 0.6,
                                       yy + tarr[i][1] * 0.6];
      }
    }
  }
  return tarr.length;
}

// ------------------------------------------------
// searching a tangents 
function getTangent(bz, idx, tgt, tarr){
  var torelance = 0.00001;       // 
  var slopeLimit = 10000;  // 
  
  var i, s, t, fd, solution;
  var rotFlg = 1;
  var f = bz.q[idx].slice(0);

  for(i = 0; i <= 10; i++){ // limit of trial time
    s = slope(f);
    if (s == null || Math.abs(s) > slopeLimit){
      bz.xyRot();
      f.reverse();
      rotFlg *= -1;
      continue;
    }
    t = tBySlope(bz, s, idx);
    fd = bz.dv(t);
    f =  bz.pnt(t);
    solution = fd[0] == 0 ? f[1] : f[1] - fd[1] * f[0] / fd[0];
    if (Math.abs(solution) < torelance) {
      
      if(t < 0) f = bz.pnt(0);
      else if(t > 1) f = bz.pnt(1);
      
      if(rotFlg < 0){
        bz.xyRot();
        f.reverse();
        rotFlg = 1;
      }

      if(overlap_check(tgt, f, tarr)) tarr.push(f);
      
      return tarr;
    }
  }

  if(rotFlg<0) bz.xyRot();
  
  return tarr;
}
// ------------------------------------------------
// remove duplicated items
function overlap_check(tgt, f, tarr){

  // remove a tangent drawn as a point
  if(cmpDiff(tgt, f)) return false;
  
  // compare
  for(var i = 0; i < tarr.length; i++){
    if(cmpDiff(tarr[i], f)) return false;
  }
  
  return true;
}
// ------------------------------------------------
function cmpDiff(p1, p2){
  var v = 0.01;
  return (Math.abs(p1[0] - p2[0]) < v
          && Math.abs(p1[1] - p2[1]) < v);
}
// ------------------------------------------------
function slope(f){
  return f[0] == 0 ? null : f[1] / f[0];
}
// ------------------------------------------------
// 
function chk_condition_1(q, a, b, c, d){
  return ((arrEq(q[a], q[b]))
       || ((q[a][0] == q[b][0] && q[c][0] * q[d][0] < 0)
           || (q[a][1] == q[b][1] && q[c][1] * q[d][1] < 0)));
}
// ------------------------------------------------
// 
function tBySlope(bz, k, idx){
  var ts = equation2(3 * (bz.y[0] - k * bz.x[0]),
                     2 * (bz.y[1] - k * bz.x[1]),
                     bz.y[2] - k * bz.x[2]);
  if(ts.length < 1) return;
  
  var t_torelance = 0.001;
  var min_t = 0 - t_torelance;
  var max_t = 1 + t_torelance;
  
  var t0_invalid = (ts[0] < min_t || ts[0] > max_t);
  if(ts.length > 1){
    var t1_invalid = (ts[1] < min_t || ts[1] > max_t);
    
    if(t0_invalid && t1_invalid) return;
    else if(t0_invalid) return ts[1];
    else if(t1_invalid) return ts[0];
    else {
      if (idx == 0) {
        if (chk_condition_1(bz.q, 0, 1, 2, 3)) return Math.max(ts[0], ts[1]);
        else Math.min(ts[0], ts[1]);
      } else{
        if (chk_condition_1(bz.q, 2, 3, 0, 1)) Math.min(ts[0], ts[1]);
        else Math.max(ts[0], ts[1]);
      }
    }
  } else {
    return t0_invalid ? null : ts[0];
  }
}
// ------------------------------------------------
function col_Gray(){
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
// solve a quadratic equation ( ax^2+bx+c=0 )
function equation2(a, b, c) {
  if(a == 0) return b == 0 ? [] : [-c / b];
  a *= 2;

  var d = b * b - 2 * a * c;

  if(d < 0) return [];

  var rd = Math.sqrt(d);
  
  if(d>0) return [(-b + rd) / a, (-b - rd) / a];
  else return [-b / a];
}

// ------------------------------------------------
// 
function sideSelection(ps1, ps2) {
  return (ps1.selected != PathPointSelection.NOSELECTION
      && ps1.selected != PathPointSelection.LEFTDIRECTION
      && ps2.selected != PathPointSelection.NOSELECTION
      && ps2.selected != PathPointSelection.RIGHTDIRECTION);
}
// --------------------------------------
// 
function arrEq(arr1, arr2) {
  for(var i = 0; i < arr1.length; i++){
    if (arr1[i] != arr2[i]) return false;
  }
  return true;
}
// ------------------------------------------------
// 
function fixedTo(n, k){
  return ((n - 0).toFixed(k)) - 0;
}
// -----------------------------------------------
function getIdx(pi, n){ // PathItem, number for index
  var len = pi.pathPoints.length;
  if(pi.closed){
    return n >= 0 ? n % len : len - Math.abs(n % len);
  } else {
    return (n < 0 || n > len - 1) ? -1 : n;
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

// ------------------------------------------------
// 
function isCorner(p, idx){
  var pnt0 = getPntSetsAngleOfTangent(p, idx, -1);
  var pnt1 = getPntSetsAngleOfTangent(p, idx,  1);
  if(! pnt0 || ! pnt1) return true;
  if(pnt0.length < 1 || pnt1.length < 1) return false;
  var rad = getRad2(pnt0, p[idx].anchor, pnt1);
  if(rad > Math.PI - 0.1) return false;
  return true;
}
// --------------------------------------
function getRad(p1,p2) {
  return Math.atan2(p2[1] - p1[1],
                    p2[0] - p1[0]);
}
// ----------------------------------------------
// 
function getRad2(p1, o, p2){
  var v1 = normalize(p1, o);
  var v2 = normalize(p2, o);
  return Math.acos(v1[0] * v2[0] + v1[1] * v2[1]);
}
// ------------------------------------------------
function normalize(p, o){
  var d = dist(p,o);
  return d == 0 ? [0, 0] : [(p[0] - o[0]) / d,
                            (p[1] - o[1]) / d];
}
// ------------------------------------------------
// 
function dist(p1, p2) {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2)
                   + Math.pow(p1[1] - p2[1], 2));
}

// ------------------------------------------------
// 
function getPntSetsAngleOfTangent(p, idx1, dir){
  if(! dir) dir = -1;
  var idx2 = getIdx(p.parent, idx1 + dir);
  if(idx2 < 0) return null;
  var p2 = p[idx2];
  with(p[idx1]){
    if(dir < 0){
      if(arrEq(leftDirection, anchor)){
        if(arrEq(p2.anchor, anchor)) return [];
        if(arrEq(p2.anchor, p2.rightDirection)
           || arrEq(p2.rightDirection, anchor)) return p2.anchor;
        else return p2.rightDirection;
      } else {
        return leftDirection;
      }
    } else {
      if(arrEq(anchor, rightDirection)){
        if(arrEq(anchor, p2.anchor)) return [];
        if(arrEq(p2.anchor, p2.leftDirection)
           || arrEq(anchor, p2.leftDirection)) return p2.anchor;
        else return p2.leftDirection;
      } else {
        return rightDirection;
      }
    }
  }
}

// Bezier Class ================================
function Bezier(pp, idx1, idx2){
  this.p  = pp;
  this.p0 = pp[idx1];
  this.p1 = pp[idx2];
  
  this.q = [pp[idx1].anchor, pp[idx1].rightDirection,
            pp[idx2].leftDirection, pp[idx2].anchor];
  this.a0 = this.q[0];
  this.r = this.q[1];
  this.l = this.q[2];
  this.a1 = this.q[3];
  
  this.x = defBezierCoefficients(this.q, 0);
  this.y = defBezierCoefficients(this.q, 1);
  return this;
}
// --------------------------------------
function Bezier_pnt(t){
  return [ t * (t * (this.x[0] * t + this.x[1]) + this.x[2]) + this.x[3],
           t * (t * (this.y[0] * t + this.y[1]) + this.y[2]) + this.y[3] ];
}
Bezier.prototype.pnt = Bezier_pnt;
// --------------------------------------
function Bezier_dv(t){
  return [ t * (3 * this.x[0] * t + 2 * this.x[1]) + this.x[2],
           t * (3 * this.y[0] * t + 2 * this.y[1]) + this.y[2] ];
}
Bezier.prototype.dv = Bezier_dv;
// ------------------------------------------------
function Bezier_xyRot(){
  for(var i = 0; i < 4; i++) this.q[i].reverse();
  var tmp = this.y.slice(0);
  this.y = this.x.slice(0);
  this.x = tmp.slice(0);
}
Bezier.prototype.xyRot = Bezier_xyRot;
// ------------------------------------------------
function Bezier_mvDat(m,n){
  if(m||n){
    for(var i=0; i<4; i++){ this.q[i][0] += m; this.q[i][1] += n; }
  }
  this.a0 = this.q[0];  this.r = this.q[1];
  this.l = this.q[2];   this.a1 = this.q[3];
  this.x = defBezierCoefficients(this.q, 0);
  this.y = defBezierCoefficients(this.q, 1);
}
Bezier.prototype.mvDat = Bezier_mvDat;
// ------------------------------------------------
function bezierEq(q, t) {
  var u = 1 - t;
  return [u*u*u * q[0][0] + 3*u*t*(u* q[1][0] + t* q[2][0]) + t*t*t * q[3][0],
          u*u*u * q[0][1] + 3*u*t*(u* q[1][1] + t* q[2][1]) + t*t*t * q[3][1]];
}

// ------------------------------------------------
function defBezierCoefficients(q, n){
  return [-q[0][n] + 3 * (q[1][n] - q[2][n]) + q[3][n],
          3 * (q[0][n] - 2 * q[1][n] + q[2][n]),
          3 * (q[1][n] - q[0][n]),
          q[0][n]];
}
// -----------------------------------------------
// -----------------------------------------------
function isSelected(p){ // PathPoint
  return p.selected == PathPointSelection.ANCHORPOINT;
}
// ----------------------------------------------
function activateEditableLayer(pi){
  var lay = activeDocument.activeLayer;
  if(lay.locked || !lay.visible) activeDocument.activeLayer = pi.layer;
}
// --------------------------------------
main();
