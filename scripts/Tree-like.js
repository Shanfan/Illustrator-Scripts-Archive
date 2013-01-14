// Tree-like

// draws a tree-like shape at the center of the artboard

// ### notice
// The tree is made with various width of lines.
// So please be careful about the setting of Scale Tool
// when you want to scale it.

// 2005.01.12
// 2006.07.19 clean the code, change the variable names to english.
//            Maybe there is still room for a rearrangement to the parameters.
// 2010-05-31 modify to work with cs5

// JavaScript Script for Adobe Illustrator CS
// by SATO Hiroyuki  http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

// == Settings =====================================

var grow = 2; // rate for growing
var bend = 2; // rate for bending
var branch = 4; // rate for branching

var thickness = 16; // starting value of the thickness of the trunk(branch)
var minThickness = 0.5; // minimum value of the thickness of the branches
var rate = 0.7; // rate for the thickness of the next branch

var trial = 500; // trail count to grow branches

// =============================================

// define a growth unit for thickness of a branch
function def_growLen(thickness, minThickness) {
  return Math.max(Math.sqrt(thickness*2), minThickness*3);
}

// define a trial count for thickness of a branch
function def_branchTimes(thickness){ return Math.max(thickness*3, 20); }

// define maximum bending angle
function def_eda_kakudo(growLen){ return Math.PI / growLen / 2; }

var ver10 = version.indexOf('10') == 0;
var ver15_or_later = parseFloat(version.substr(0, 2)) >= 15;

// ---------------------------------------------------------
// A fix for the change of the document origin in CS5,
// and for the multi-artboard in CS4 or later.
// This function locates the active artboard's origin on the
// bottom left at first, and restores it at the end.
//
// USAGE:
// var g_origin = Origin();
// ... (do something in legacy style)
// g_origin.restore();

function Origin(){
    this.ver15_or_later = (parseFloat(version.substr(0, 2)) >= 15); // CS5 or later
    this.ver14 = (version.substr(0, 2) == "14"); // CS4
    
    if(this.ver15_or_later){
        this.saved_coord_system = app.coordinateSystem;
        app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

        var idx  = app.activeDocument.artboards.getActiveArtboardIndex();
        this.ab  = app.activeDocument.artboards[idx];
        
        var o   = this.ab.rulerOrigin;
        var r   = this.ab.artboardRect;
        this.saved_origin = [o[0], o[1]];
        this.ab.rulerOrigin = [0, r[1] - r[3]];
        
    } else if(this.ver14){
        var o = app.activeDocument.rulerOrigin;
        this.saved_origin = [o[0], o[1]];
        app.activeDocument.rulerOrigin = [0, 0];
    }

    this.restore = function(){
        if(this.ver15_or_later){
            this.ab.rulerOrigin = this.saved_origin;
            app.coordinateSystem = this.saved_coord_system;
            
        } else if(this.ver14){
            app.activeDocument.rulerOrigin = this.saved_origin;
        }
    };
        
    return this;
}
// ---------------------------------------------------------
var g_origin = Origin();

makeTree();

g_origin.restore();
// =============================================
function makeTree(){
  if (documents.length<1) return;
  var lay = activeDocument.activeLayer;
  if(lay.locked || !lay.visible){
    alert("Please unlock and show the active layer."); return;
  }

  var branchTimes = def_branchTimes(thickness);
  var growLen = def_growLen(thickness, minThickness);

  bend  += grow; branch += bend; grow /= branch; bend /= branch;

  // values for the position of the branches
  var branchLocs = [1,-1,0,-0.5,0.5];

  // =============================================
  var gr = lay.groupItems.add();
  var branches = [];
  branches.push( [[0,0], [0,growLen], thickness]);

  var b, x, y, reserve, c, i, j, r, t, v;
  var newBranches, total, togglekey;

  for(var k=0; k<=trial; k++){
    if (branches.length<1) break;
    
    b = branches.shift();
    thickness = b.pop();
    x = b[1][0];
    y = b[1][1];
    reserve = 0;
    c = 1;

    // define the growing length anew
    branchTimes = def_branchTimes(thickness);
    growLen = def_growLen(thickness, minThickness);

    // grow/bend a branch until it branches
    for(j=0; j <= branchTimes; j++){
      r = Math.random();

      if (r < grow){
        reserve += growLen;
        
      } else if (r < bend){
        t = getRad(b[c-1],b[c]) + (Math.random()-0.5) * def_eda_kakudo(growLen);
        v = pointForAngle(t, growLen + reserve);
        // restrain the branch from turning to lower direction
        if (b[c][1] < b[c-1][1]) v[1] *= -0.5;
        x += v[0];
        y += v[1];
        reserve = 0;
        c++;
        b.push([x, y]);

      } else { // branch
        if (c < 5) continue; // doesn't branch if it's short yet
        break;
      }
    }

    // the following is a branching procedure
    if (thickness <= minThickness) continue;
    
    // define the thickness of branches to grow at random and make an array
    newBranches = [];
    total = 0;
    while(total < thickness){
      // define the thickness of the branch
      r = Math.random() * (thickness-minThickness) * rate + minThickness;
      total += r;
      newBranches.push(r);
    }
    newBranches.sort();
    newBranches.reverse(); // assign a place from thicker value

    t = Math.atan2(b[c][0] - b[c-1][0],
                   b[c-1][1] - b[c][1]); // angle of the parent branch

    for(i=0; i<newBranches.length; i++) {
      togglekey = branchLocs[i%(branchLocs.length)];
      v = pointForAngle(t, (thickness - newBranches[i])/2*togglekey);
      branches.push( [b[c-1],
                      [b[c][0] + v[0], b[c][1] + v[1]],
                      newBranches[i]]);
    }

    // draw
    if (b.length > 3) {
      with(lay.pathItems.add()){
        setEntirePath(b);
        filled = false;
        stroked = true;
        strokeWidth = thickness;
        strokeCap = StrokeCap.BUTTENDCAP;
        strokeJoin = StrokeJoin.ROUNDENDJOIN;
        if(ver10){
          moveToBeginning(gr);
        } else {
          move(gr, ElementPlacement.PLACEATBEGINNING);
        }
      }
    }
  }

  // translate group to the center of the artboard
  if(gr.pathItems.length>0){
      gr.translate(activeDocument.width/2, activeDocument.height/2);
  } else { gr.remove(); }
}

// ----------------------------------------------
function pointForAngle(t, m){
  return [Math.cos(t)*m, Math.sin(t)*m];
}
// ----------------------------------------------
function getRad(p1, p2) {
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
}
// ------------------------------------------------
function normalize(p, o){
  var d = dist(p,o);
  return d==0 ? [0,0] : [(p[0]-o[0])/d, (p[1]-o[1])/d];
}
// ----------------------------------------------
// return the distance between p1 and p2
function dist(p1, p2) {
  return Math.sqrt(Math.pow(p1[0] - p2[0],2) + Math.pow(p1[1] - p2[1],2));
}
// ----------------------------------------------

