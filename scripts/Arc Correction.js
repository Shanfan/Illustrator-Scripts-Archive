// Arc Correction

// corrects free-hand drawn arc-like pathes in the selection.
// To use, select the pathes and run this script.


// JavaScript Script for Adobe Illustrator CS3
// Tested with Adobe Illustrator CS3 13.0.3, Windows XP SP2 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Copyright(c) 2009 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// 2008-12-02 release on the web (with Japanese comments)
// 2009-05-23 English version

// ----------------------------------------------
function main(){
  // targets are the open-pathes with 2 or more anchors
  var pathes = [];
  getPathItemsInSelection(1, pathes);
  if(pathes.length < 1){
    //alert("pathes.length < 1");
    return;
  }
  
  var pathes2 = [];
  for(var i = 0; i < pathes.length; i++){
    if(convertToArc(pathes[i])){
      pathes2.push(pathes[i]);
    }
  }
  
  // select converted pathes
  if(pathes2.length > 0){
    activeDocument.selection = pathes2;
  }
}

// ----------------------------------------------
function convertToArc(pi){
  var p = pi.pathPoints;
  var a0 = p[0].anchor;
  var a3 = p[p.length - 1].anchor;

  // find out slope "s" of the line(L) drawn to connect
  // the both ends of the path.
  // then, find out tangent points(P) on each segments
  // of the line which has slope "s", and distance "d"
  // between the line(L) and the point(P).
  // then, find out max "d" in all segments.
  var s = slope(a0, a3);
  
  var line = defline2(a0, a3);
  
  var b, ts, j, d;
  var d_max = 0;
  var d_max_pnt;
  var tangent_pnt;
  for(var i = 0; i < p.length - 1; i++){
    b = new Bezier(p, i, i + 1);

    if(s == null){
      ts = b.getTangentV();
    } else if(s == 0){
      ts = b.getTangentH();
    } else {
      ts = tBySlope(b, s, 0.0001);
    }

    for(j=0; j<ts.length; j++){
      if(ts[j] < 0){ // value = -1 if there's no appropriate solution
        continue;
      }
      tangent_pnt = b.pnt(ts[j])
      d = distPntLine2(tangent_pnt, line );
      if(Math.abs(d) > Math.abs(d_max)){
        d_max = d;
        d_max_pnt = tangent_pnt;
      }
    }
  }
  d = Math.abs(d_max);
  if(d==0){
    //alert("d==0");
    return false;
  }

  // the sign of distance
  d_sign = (d_max < 0 ? -1 : 1);
  if(a3[0] - a0[0] > 0){
    d_sign *= -1;
  }

  // Arc are drawn to contact a tangent of max "d".
  // Tangency point of arc and the tangent is 
  // the intersection point of (the tangent) and
  // (perpendicular bisector of the line drawn to connect
  // both ends of the path)
  var tangent = lineBySlope(s, d_max_pnt);
  var tp = getIntersection(perpendicularBisector(a0, a3), tangent);
  
  if(tp.length == 0){
    //alert("tp.length==0");
    return false;
  }

  var line1 = perpendicularBisector(a0, tp);
  var line2 = perpendicularBisector(a3, tp);
  var o = getIntersection(line1, line2);
  if(o.length == 0){
    //alert("o.length==0");
    return false;
  }

  var hpi = Math.PI / 2.0;
  var t = getRad(a0, a3);  // angle of the line
  if(t != -hpi && t % hpi == 0){
    d_sign *= -1;
  }
  var to0 = getRad(o, a0) - d_sign * hpi; // angle of handle at beginning side
  var to3 = getRad(o, a3) + d_sign * hpi; // ... at ending side

  var r = dist(tp, o); // radius
  var alpha = getRad2(a0, o, a3); // center angle of the arc
  if(distPntLine2(o, line) * d_max > 0){
    alpha = Math.PI * 2 - alpha;
  }
  alpha /= 2;

  var sin_alpha = Math.sin(alpha); // verify if it suite for denominator(!=0)
  if(isNaN(sin_alpha)){
    //alert("invalid value: sin_alpha=" + sin_alpha);
    return false;
  }

  var han; // length of the handle
  if(sin_alpha == 0){
    han = 4 * (Math.sqrt(2) - 1) / 3 * r;
  } else if(alpha <= hpi / 2.0){
    // angle <= 90 degree : draw arc with 2 anchors
    han = r * 4 * (1 - Math.cos(alpha)) / (3 * sin_alpha);
  } else if(alpha <= hpi){
    // angle <= 180 degree : 3 anchors
    han = r * 4 * (1 - Math.cos(alpha/2.0)) / (3 * Math.sin(alpha / 2.0));
  } else {
    // angle > 180 degree : 5 anchors
    han = r * 4 * (1 - Math.cos(alpha/4.0)) / (3 * Math.sin(alpha / 4.0));
  }
    
  var a1 = [Math.cos(to0) * han + a0[0],
            Math.sin(to0) * han + a0[1]]; // loc of handle at beginning side
  var a2 = [Math.cos(to3) * han + a3[0],
            Math.sin(to3) * han + a3[1]]; // ... at ending side

    // -------------
  if(alpha <= hpi / 2.0){
    while(p.length > 2){ p[p.length - 1].remove(); }
    setPathPoint(p[0], a0, a0, a1);
    setPathPoint(p[1], a3, a2, a3);
    
    // -------------
  } else if(alpha <= hpi){
    while(p.length > 3){ p[p.length - 1].remove(); }
    while(p.length < 3){ p.add(); }

    setPathPoint(p[0], a0, a0, a1);
    setPathPoint(p[1], tp,
                 [Math.cos(t + Math.PI) * han + tp[0],
                  Math.sin(t + Math.PI) * han + tp[1]],
                 [Math.cos(t) * han + tp[0],
                          Math.sin(t) * han + tp[1]]);
    setPathPoint(p[2], a3, a2, a3);

    // -------------
  } else {
    while(p.length > 5){ p[p.length - 1].remove(); }
    while(p.length < 5){ p.add(); }

    setPathPoint(p[0], a0, a0, a1);
    setPathPoint(p[2], tp,
                 [Math.cos(t + Math.PI) * han + tp[0],
                  Math.sin(t + Math.PI) * han + tp[1]],
                 [Math.cos(t) * han + tp[0],
                  Math.sin(t) * han + tp[1]]);
    setPathPoint(p[4], a3, a2, a3);

    p[1].anchor = rotPnt(tp, o, d_sign * alpha / 2.0);
    p[3].anchor = rotPnt(tp, o, -d_sign * alpha / 2.0);

    han *= d_sign;
    
    with(p[1]){
      var t1 = getRad(o, anchor) - hpi;
      rightDirection = [Math.cos(t1) * han + anchor[0],
                        Math.sin(t1) * han + anchor[1]];
      leftDirection = [Math.cos(t1 + Math.PI) * han + anchor[0],
                       Math.sin(t1 + Math.PI) * han + anchor[1]];
    }
    with(p[3]){
      t1 = getRad(o, anchor) - hpi;
      rightDirection = [Math.cos(t1) * han + anchor[0],
                        Math.sin(t1) * han + anchor[1]];
      leftDirection = [Math.cos(t1 + Math.PI) * han + anchor[0],
                       Math.sin(t1 + Math.PI) * han + anchor[1]];
    }
  }
  return true;
}


// ----------------------------------------------
// 
function setPathPoint(p, a, ld, rd){
  p.anchor = a;
  p.leftDirection = ld;
  p.rightDirection = rd;
}
// ----------------------------------------------
// put an ellipse at "p" [x, y] (for debug)
function markPnt(p){
  var r1 = 1.0;
  activeDocument.activeLayer.pathItems.ellipse(
    p[1] + r1,
    p[0] - r1,
    r1*2, r1*2);
}
// ----------------------------------------------
// pnt: original coodinate, origin: center for rotation
// rad: radian for rotation
// return value = coordinate of rotated point
function rotPnt(pnt, origin, rad){
  var x = pnt[0] - origin[0];
  var y = pnt[1] - origin[1];
  var c = Math.cos(rad);
  var s = Math.sin(rad);
  return [ origin[0] + x * c - y * s,
           origin[1] + x * s + y * c ];
}
// ----------------------------------------------
// return distance between p1 [x,y], p2 [x,y]
function dist(p1, p2) {
  return Math.sqrt(Math.pow(p1[0] - p2[0],2) + Math.pow(p1[1] - p2[1],2));
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
  var t = Math.abs(getRad(o, p2) - getRad(o, p1));
  return t>Math.PI ? Math.PI*2 - t : t;
}
// ----------------------------------------------
// return mid point between "p1" [x,y] and "p2" [x,y]
function midPnt(p1, p2){
  return [ (p1[0]+p2[0])/2, (p1[1]+p2[1])/2 ];
}
// ----------------------------------------------
// return [a, b, c] of ax+by+c=0
// for the line drawn through "p1" [x,y] and "p2" [x,y]
function defline(p1, p2){
  var a = p1[1] - p2[1];
  var b = p1[0] - p2[0];
  return [a, -b, b * p1[1] - a * p1[0]];
}
// -----------------------------------------------
// return [a, b, c] of ax+by+c=0 (a^2+b^2=1)
// for the line drawn through "p1" [x,y] and "p2" [x,y]
function defline2(p1, p2){
  if(p1[0] == p2[0]) return [1, 0, -p1[0]];
  if(p1[1] == p2[1]) return [0, 1, -p1[1]];
  var a = (p2[1] - p1[1]) / (p2[0] - p1[0]);
  var d = Math.sqrt(a * a + 1);
  return [a / d, -1 / d, (p1[1] - a*p1[0]) / d];
}
// -----------------------------------------------
// return distance from pnt [x, y] to line [a, b, c] (ax+by+c=0 (a^2+b^2=1))
// d = sqrt( (ax+by+c)^2/(a^2+b^2) )
function distPntLine2(pnt, line){
  return line[0] * pnt[0] + line[1] * pnt[1] + line[2];
}
// ----------------------------------------------
// return [a, b, c] of ax+by+c=0
// for perpendicular bisector of the line drawn from "p1" [x,y] to "p2" [x,y]
function perpendicularBisector(p1, p2){
  var mp = midPnt(p1, p2);
  if(p1[0] == p2[0]){
    return [0, -1, mp[1]];
  } else {
    return defline([ mp[0] - (p1[1] - mp[1]), mp[1] + (p1[0] - mp[0]) ],
                   [ mp[0] - (p2[1] - mp[1]), mp[1] + (p2[0] - mp[0]) ]);
  }
}
// ----------------------------------------------
// return intersection point [x, y]
// of line "q" [a,b,c] and "q" [a,b,c]
// return empty array [] for parallel lines
function getIntersection(p, q){
  var d = p[0] * q[1] - p[1] * q[0];
  if(d == 0) return [];
  return [ (q[2] * p[1] - p[2] * q[1]) / d,
           (p[2] * q[0] - q[2] * p[0]) / d ];
}
// ------------------------------------------------
// return [a, b, c] of ax+by+c=0
// for the line that goes througn "p" [x, y] with slope "s"
function lineBySlope(s, p){
  if(s == null){
    return [1, 0, -p[0]];
  } else {
    return [s, -1, p[1] - s * p[0]];
  }
}
// ------------------------------------------------
// return slope of the line drawn through "p1" [x,y] and "p2" [x,y]
function slope(p1, p2){
  var x = p1[0] - p2[0];
  return x == 0 ? null : (p1[1] - p2[1]) / x;
}
// ------------------------------------------------
// b: Bezier object
// k: slope of tangent
// torelance : torelance for parameter t
// return value : parameter t
function tBySlope(b, k, torelance){
  var t = equation2(3 * (b.y[0] - k * b.x[0]),
                   2 * (b.y[1] - k * b.x[1]),
                   b.y[2] - k * b.x[2]);
  if(t.length < 1) return [-1];
  var min_t = 0 - torelance;
  var max_t = 1 + torelance;
  var t0_invalid = (t[0] < min_t || t[0] > max_t);
  if(t.length > 1){
    var t1_invalid = (t[1] < min_t || t[1] > max_t);
    if (t0_invalid && t1_invalid) return [-1];
    else if (t0_invalid) return [t[1]];
    else if (t1_invalid) return [t[0]];
    else return t;
    //else return idx==0 ? Math.min(t[0],t[1]) : Math.max(t[0],t[1]);
  }
  return t0_invalid ? [-1] : [t[0]];
}
// ------------------------------------------------
// solve ax^2+bx+c=0
function equation2(a,b,c) {
  if(a == 0) return b == 0 ? [] : [-c / b];
  a *= 2;
  var d = b * b - 2 * a * c;
  if(d < 0) return [];
  var rd = Math.sqrt(d);
  if(d > 0) return [(-b + rd) / a, (-b - rd) / a];
  else return [-b / a];
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
       && !s[i].closed){ // open pathes only
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
  return [ t* (t* (this.x[0]*t + this.x[1]) + this.x[2]) + this.x[3],
           t* (t* (this.y[0]*t + this.y[1]) + this.y[2]) + this.y[3] ];
}
Bezier.prototype.pnt = Bezier_pnt;
// ----------------------------------------------
function Bezier_getTangentV(){
  var ar = []
  var ts = [];
  ts = ts.concat( equation2( 3*this.x[0], 2*this.x[1], this.x[2] ) );
  for(var i=0; i<ts.length; i++){
    if(ts[i]<=1 && ts[i]>=0) ar.push(ts[i]);
  }
  if(ar.length>2) ar.sort();
  return ar;
}
Bezier.prototype.getTangentV =Bezier_getTangentV;
// ----------------------------------------------
function Bezier_getTangentH(){
  var ar = []
  var ts = [];
  ts = ts.concat( equation2( 3*this.y[0], 2*this.y[1], this.y[2] ) );
  for(var i=0; i<ts.length; i++){
    if(ts[i]<=1 && ts[i]>=0) ar.push(ts[i]);
  }
  if(ar.length>2) ar.sort();
  return ar;
}
Bezier.prototype.getTangentH =Bezier_getTangentH;

// ------------------------------------------------
function defBezierCoefficients(q, n){
  return [-q[0][n] + 3 * (q[1][n] - q[2][n]) + q[3][n],
          3 * (q[0][n] - 2 * q[1][n] + q[2][n]),
          3 * (q[1][n] - q[0][n]),
          q[0][n]];
}
// ----------------------------------------------
main();
