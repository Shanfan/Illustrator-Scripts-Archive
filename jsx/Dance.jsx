// Dance

// adds a new layer and draws dancing people on it.

// ### notice
// The dancers are made with various width of lines.
// So please be careful about the setting of Scale Tool
// when you want to scale them.


// 2005.01.17  ver.0.1
// 2005.01.18  ver.0.11 adjust some value
// 2006.03.30  now works on ai10
// 2010.05.31  modify to work with CS5

// JavaScript Script for Adobe Illustrator CS
// Tested with Adobe Illustrator CS 11.0.1, Windows 2000 SP4 (Japanese version).
// This script provided "as is" without warranty of any kind.
// Free to use and distribute.

// Copyright(c) 2005 SATO Hiroyuki
// http://park12.wakwak.com/~shp/lc/et/en_aics_script.html

var mpi = 3.14159265; // PI
var hpi = mpi/2;
var wpi = mpi*2;
var ver10 = version.indexOf('10') == 0;

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

dance();

g_origin.restore();

function dance(){
  // Settings ============================================
  
  var x = 0.4; // rate to specify dancer's size
  var repeat_time = 40; // number of dancers
  
  // =====================================================
  if(documents.length<1) return;
  with(activeDocument.activeLayer){
    if(locked || !visible){
      alert("Please select an unlocked and visible layer,\nthen run this script again.");
      return;
    }
  }

  var len_w = x * 80; // width of area for each dancer
  var leh_h = x * 80; // height..
  
  with(activeDocument){
    layers.add();
    var origin = [len_w, height - leh_h]; // origin
    var max_width = Math.max(width - len_w,
                             len_w * 6); // fold width
  }

  for (var k=0; k < repeat_time; k++) {
    drawMan(origin,x);
    origin[0] += len_w*2;
    if (origin[0] >= max_width) {
      origin = [len_w, origin[1]-leh_h*2]; // fold line
    }
  }
}

function drawMan(origin, x){
  // define colors ===================================
 
  var col_top    = setCol("K25","orange1","K100","K100","kinari1");
  var col_bottom = setCol("K75","K100","denim1","khaki1");
  var col_hada   = setCol("hada2","brown1");
  var col_shoes  = setCol("K100");

  // make arrays ===================================
  var gi = activeDocument.activeLayer.groupItems.add();
  var arr = [];

  // make arrays for body
  // upper body
  var arr_body1 = [setPnt(origin, hpi, [8*x,11,13])];
  var t = getAngle(origin, arr_body1[0]);
  arr_body1.push(setPnt(origin, t, [35*x, 2, 6]));
  
  var arr_body1_rdir = [setPnt(arr_body1[0], t, [20*x, 4]), null];
  t = getAngle(arr_body1[1], origin);
  var arr_body1_ldir = [null, setPnt(arr_body1[1], t, [20*x, 12])];
  // 
  t = getAngle(origin, arr_body1[0]);
  var arr_body2 = [setPnt(origin, t, [8*x,12]),
                   setPnt(origin, t, [12*x,12])];

  // make arrays for legs
  var leg_width = 20; // leg width
  var kotsuban_length = 10;
  if(leg_width>15) kotsuban_length -= (leg_width - 15)/2;
  leg_width *= x;
  kotsuban_length *= x;
  
  t = getAngle(origin, arr_body2[1]);
  var arr_bottom = [setPnt(arr_body2[1], t, [kotsuban_length,8])];
  arr_bottom.push(setPnt(arr_bottom[0], t, [35*x,7,13]));
  var t2 = getAngle(arr_bottom[0], arr_bottom[1]);
  arr_bottom.push(setPnt(arr_bottom[1], t2, [37*x,12,18]));
  arr_bottom.reverse();
  arr_bottom.push(setPnt(arr_body2[1], t, [kotsuban_length,0]));
  arr_bottom.push(setPnt(arr_bottom[3], t, [35*x,11,17]));
  t = getAngle(arr_bottom[3], arr_bottom[4]);
  arr_bottom.push(setPnt(arr_bottom[4], t, [37*x,6,12]));

  // make an array for shoulder
  var shoulderLen = 13 *x;
  var armLen1 = 14 *x; // length of sleeve
  var armLen2 = 11 *x;
  
  var shoulder_width = 14;
  var arm_offset = 0;
  if(shoulder_width>10){
    arm_offset = (shoulder_width -10)/2;
    t = getAngle(arr_body1[1], origin);
    arr = [arr_body1[1][0] - Math.cos(t) * arm_offset*x,
           arr_body1[1][1] - Math.sin(t) * arm_offset*x];
    arm_offset = (arm_offset-0.5)*x;
  } else { arr = arr_body1[1]; }
  shoulder_width *= x;
  
  t = getAngle(arr_body1[1], origin);
  var arr_shoulder = [arr,
                      setPnt(arr, t, [shoulderLen,8.5])];
  arr_shoulder.push(setPnt(arr_shoulder[1], t, [armLen1,5,14]));
  arr_shoulder.reverse();
  arr_shoulder.push(setPnt(arr, t, [shoulderLen,15.5]));
  arr_shoulder.push(setPnt(arr_shoulder[3], t, [armLen1,10,19]));
  
  // make arrays for arms
  var handLen = 14 *x;
  var armLen3 = 18 *x;
  // right arm
  t = getAngle(arr_shoulder[1], arr_shoulder[0]);
  if(arm_offset>0){
    arr = setPnt(arr_shoulder[0], t, [arm_offset,8]);
  } else {
    arr = arr_shoulder[0];
  }
  var arr_arm1 = [arr, setPnt(arr, t, [armLen2,12])];
  t = getAngle(arr_arm1[0], arr_arm1[1]);
  arr_arm1.push(setPnt(arr_arm1[1], t, [armLen3,12,18]));
  t = getAngle(arr_arm1[1], arr_arm1[2]);
  arr_arm1.push(setPnt(arr_arm1[2], t, [handLen,11,13]));
  var arr_arm1_rdir = new Array(4);
  arr_arm1_rdir[2] = (setPnt(arr_arm1[2], t, [handLen/3,12]));
  t = getAngle(arr_arm1[2], arr_arm1[3]);
  var arr_arm1_ldir = new Array(3);
  arr_arm1_ldir.push(setPnt(arr_arm1[3], t, [handLen/2,3,5]));
  // left arm
  t = getAngle(arr_shoulder[3], arr_shoulder[4]);
  if(arm_offset>0){
    arr = setPnt(arr_shoulder[4], t, [arm_offset,0]);
  } else {
    arr = arr_shoulder[4];
  }
  var arr_arm2 = [arr, setPnt(arr, t, [armLen2,12])];
  t = getAngle(arr_arm2[0], arr_arm2[1]);
  arr_arm2.push(setPnt(arr_arm2[1], t, [armLen3, 6,12]));
  t = getAngle(arr_arm2[1], arr_arm2[2]);
  arr_arm2.push(setPnt(arr_arm2[2], t, [handLen,11,13]));
  var arr_arm2_rdir = new Array(4);
  arr_arm2_rdir[2] = (setPnt(arr_arm2[2], t, [handLen/3,12]));
  t = getAngle(arr_arm2[2], arr_arm2[3]);
  var arr_arm2_ldir = new Array(3);
  arr_arm2_ldir.push(setPnt(arr_arm2[3], t, [handLen/2,3,5]));

  // make arrays for neck
  t = getAngle(arr_body1[1], origin);
  arr = [arr_body1[1][0] + Math.cos(t) * 4 *x,
         arr_body1[1][1] + Math.sin(t) * 4 *x];
  var arr_neck = [arr,
                  setPnt(arr, t, [11*x,3,5])];
  
  // make arrays for shoes
  var footLen = 16 *x;
  // right leg
  t = getAngle(arr_bottom[1], arr_bottom[0]);
  var arr_foot1 = [arr_bottom[1], arr_bottom[0],
                   setPnt(arr_bottom[0], t, [footLen,8,11])];
  // left leg
  t = getAngle(arr_bottom[4], arr_bottom[5]);
  var arr_foot2 = [arr_bottom[4], arr_bottom[5],
                   setPnt(arr_bottom[5], t, [footLen,13,16])];

  // draw ====================================
  drawline(arr_body2, gi, 30*x, col_bottom, 0);
  drawline(arr_foot1, gi, 9*x, col_shoes, 1);
  drawline(arr_foot2, gi, 9*x, col_shoes, 1);
  drawline(arr_bottom, gi, leg_width, col_bottom, 0);
  
  drawline(arr_body1, gi, 30*x, col_top, 0, arr_body1_rdir, arr_body1_ldir);
  drawline(arr_shoulder, gi, shoulder_width, col_top, 0);
  drawline(arr_arm1, gi, 8*x, col_hada, 0, arr_arm1_rdir, arr_arm1_ldir);
  drawline(arr_arm2, gi, 8*x, col_hada, 0, arr_arm2_rdir, arr_arm2_ldir);
  // hands
  drawline([arr_arm1[3], arr_arm1[3]], gi, 8*x, col_hada, 1);
  drawline([arr_arm2[3], arr_arm2[3]], gi, 8*x, col_hada, 1);
  
  drawline(arr_neck, gi, 12*x, col_hada, 1);
  drawline([arr_neck[1], arr_neck[1]], gi, 24*x, col_hada, 1); // head
}

// ------------------------------------------------
function random2(max_, min_){
  max_ -= min_;
  return Math.random() * max_ + min_;
}

// ------------------------------------------------
function random_select(arr){
  var n = Math.floor(Math.random() * arr.length);
  return arr[n];
}

// ------------------------------------------------
function setPnt(pnt, t, arr){
  var s = arr.length>2 ? random2(arr[1], arr[2]) : arr[1];
  s = mpi * s/8 - hpi;
  return [Math.cos(s+t) * arr[0] + pnt[0],
               Math.sin(s+t) * arr[0] + pnt[1]];
}

// ------------------------------------------------
function drawline(arr, gi,swidth, col, r, rdir, ldir){
  var pi = activeDocument.pathItems.add();
  pi.setEntirePath(arr);
  var pp = pi.pathPoints;
  var i;
  if(rdir instanceof Array){
    for(i in rdir) if(rdir[i] instanceof Array) pp[i].rightDirection = rdir[i];
  }
  if(ldir instanceof Array){
    for(i in ldir) if(ldir[i] instanceof Array) pp[i].leftDirection = ldir[i];
  }
  with(pi){
    filled = false;
    stroked = true;
    strokeColor = col;
    strokeWidth = swidth;
    strokeCap = r>0 ? StrokeCap.ROUNDENDCAP : StrokeCap.BUTTENDCAP;
    strokeDashes = [];
    strokeJoin = StrokeJoin.ROUNDENDJOIN;
    if(ver10){ moveToBeginning(gi);
    } else { move(gi,ElementPlacement.PLACEATBEGINNING);
    }
  }
}

// --------------------------------------
function getAngle(arr1,arr2) {
  return Math.atan2(arr1[1] - arr2[1], arr1[0] - arr2[0]);
}

// --------------------------------------
function setCol(color_name){
  var n = arguments.length<2 ? color_name : random_select(arguments);
  var arr = [];
  switch(n){
  case "K25":    arr = [0,0,0,25,  192,192,192]; break;
  case "K50":    arr = [0,0,0,50,  128,128,128]; break;
  case "K75":    arr = [0,0,0,75,  64,64,64]; break;
  case "hada1":  arr = [4,20,30,0,  250,200,160]; break;
  case "hada2":  arr = [8,22,50,0,  230,190,110]; break;
  case "brown1": arr = [27,44,60,14,  160,110,70]; break;
  case "denim1": arr = [80,35,20,15,  50,100,130]; break;
  case "orange1": arr = [10,52,83,0,  225,115,35]; break;
  case "khaki1": arr = [30,30,70,40,  107,94,42]; break;
  case "kinari1":  arr = [0,0,18,9,  235,235,190]; break;
  case "yellow1":  arr = [0,20,94,0,  255,208,18]; break;
  default:       arr = [0,0,0,100,  0,0,0]; break;
  }
  
  var col;
  if(ver10){ var col2 = new Color(); }
  if (activeDocument.documentColorSpace == DocumentColorSpace.CMYK){
    col = new CMYKColor();
    col.cyan    = arr[0];
    col.magenta = arr[1];
    col.yellow  = arr[2];
    col.black   = arr[3];
    if(ver10){ col2.cmyk = col; }
  } else {
    col = new RGBColor();
    col.red   = arr[4];
    col.green = arr[5];
    col.blue  = arr[6];
    if(ver10){ col2.rgb = col; }
  }
  return ver10 ? col2 : col;
}
