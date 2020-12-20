svgNS = "http://www.w3.org/2000/svg";
var mainCanvas;
var drawingCanvas;
var canvasRect;
var currentColorWindow;
var submitButton;
var judgedLevels;
var sandbox;
var strokeWeight = 18;
var pinkColor = "FF8AE8";
var redColor = "D60000";
var orangeColor = "F79000";
var yellowColor = "FBE615";
var greenColor = "0F883C";
var tealColor = "00E0E0";
var blueColor = "001AC4";
var purpleColor = "7030A0";
var brownColor = "664023";
var blackColor = "000000";

function CookieManager() {

};
CookieManager.setCookie = function(cname, cvalue) {
    var exdays = 365;
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};
CookieManager.getCookie = function(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};


function outerHTML(el) {
    var outer = document.createElement('div');
    outer.appendChild(el.cloneNode(true));
    return outer.innerHTML;
}

function setSvgAttributes(el) {
    el.setAttribute("version", "1.1");
    el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    el.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
}

function validateSvg(imgname, callbackFn) {
    if (imgname == null) {
        imgname = 'sandbox.png';
    }
    setSvgAttributes(mainCanvas);
    var xml = outerHTML(mainCanvas);
    var svgimage = svgToImage(xml);
    svgimage.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = svgimage.width;
        canvas.height = svgimage.height;
        var context = canvas.getContext('2d');
        context.drawImage(svgimage, 0, 0);
        var svgimgdata = context.getImageData(0, 0, canvas.width, canvas.height);

        var goalimage = new Image();
        goalimage.src = imgname;
        goalimage.onload = function() {
            var canvas2 = document.createElement('canvas');
            canvas2.width = goalimage.width;
            canvas2.height = goalimage.height;
            var context2 = canvas2.getContext('2d');
            context2.drawImage(goalimage, 0, 0);
            var goalImgdata = context2.getImageData(0, 0, canvas.width, canvas.height);
            validateSvgData(svgimgdata, goalImgdata, callbackFn);
        }
    }
}

function validateSvgData(svgimgdata, goalImgdata, callbackFn) {
    var colors = ["FFFFFF", pinkColor, redColor, orangeColor, yellowColor, greenColor, tealColor, blueColor, purpleColor, brownColor, blackColor]
    function getPixel(img, x, y) {
        var i = y * img.width * 4 + x * 4;
        if (img.data[i+3] == 0) {
            return "FFFFFF";
        }
        return rgbToHex(img.data[i], img.data[i+1], img.data[i+2]);
    }
    function get9Pixels(img, x, y) {
        var drs = [-5, 0, 5];
        var pixels = [];
        drs.forEach(function(dx) {
            drs.forEach(function(dy) {
                if (0 <= x + dx && x + dx < img.width && 0 <= y + dy && y + dy < img.height) {
                    pixels.push(getPixel(img, x+dx, y+dy));
                }
            });
        });
        return pixels;
    }
    function hasError(x, y) {
        var svgcolor = getPixel(svgimgdata, x, y);
        var goalcolor = getPixel(goalImgdata, x, y);
        if (colors.includes(goalcolor) && goalcolor != svgcolor) {
            if (goalcolor == "FFFFFF") {
                if (colors.includes(svgcolor)) {
                    return !get9Pixels(svgimgdata, x, y).includes(goalcolor);
                }
                else {
                    return false;
                }
            }
            else {
                return !get9Pixels(svgimgdata, x, y).includes(goalcolor);
            }
        }
        return false;
    }
    errors = [];
    for (var y = 0; y < goalImgdata.height; y++) {
        for (var x = 0; x < goalImgdata.width; x++) {
            var point = {};
            point.x = x;
            point.y = y;
            if (hasError(x, y)) {
                errors.push(point);
            }
        }
    }
    errors = sparsify(errors);
    if (callbackFn) {
        callbackFn(errors);
    }
}

function pointIsNotNear(p, L) {
    var d = 40;
    for (var i = 0; i < L.length; i++) {
        var p2 = L[i];
        var dx = p.x - p2.x;
        var dy = p.y - p2.y;
        if (dx * dx + dy * dy < d * d) {
            return false;
        }
    }
    return true;
}

function sparsify(errors) {
    var newErrors = [];
    shuffle(errors);
    errors.forEach(function(p) {
        if (pointIsNotNear(p, newErrors)) {
            newErrors.push(p);
        }
    });
    return newErrors;
}

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  
  function rgbToHex(r, g, b) {
    var res = "" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    return res.toUpperCase();
  }

function svgToImage(xml) {
    var image = new Image();
    image.src = 'data:image/svg+xml;base64,' + window.btoa(xml);
    return image;
}


function closeCompletionPopup() {
    document.getElementById('level-completion-popup').classList.add('popup-hidden');
    mainCanvas.classList.add('canvas-active');
    drawingCanvas.canvasActive = true;
}

function nextLevel() {
    var currentLevelNum = judgedLevels.indexOf(drawingCanvas.level);
    var nextLevelNum = (currentLevelNum + 1) % judgedLevels.length;
    judgedLevels[nextLevelNum].selectLevel();
}

function selectSandbox() {
    sandbox.selectLevel();
}

function clearCanvas() {
    if (!drawingCanvas.canvasActive) return;
    clearFeedbackMarks();
    drawingCanvas.strokes.forEach(function(stroke) {
        stroke.remove();
    });
    drawingCanvas.strokes = [];
    drawingCanvas.currentlyDrawing = false;
    drawingCanvas.showingFeedback = false;
    undoManager.clear();
    mainToolbar.tools.forEach(function(tool) {
        tool.usageCnt = 0;
        tool.usagePattern = "";
    })
    updateCounter();
}

function clearFeedbackMarks() {
    strokeCounter.classList.remove('stroke-counter-excessive');
    while (drawingCanvas.feedbackMarks.length > 0){
        mark = drawingCanvas.feedbackMarks.pop();
        mark.remove();
    }
}

function StateSnapshot(strokes, currentTool) {
    this.strokes = strokes;
    this.currentTool = currentTool;
    this.cnts = [];
    this.pats = [];
    mainToolbar.tools.forEach(function(tool) {
        this.cnts.push(tool.usageCnt);
        this.pats.push(tool.usagePattern);
    }.bind(this));
}

function updateCounter(){
    if (drawingCanvas.level.maxStrokes <= 0) {
        strokeCounter.innerHTML = "" + drawingCanvas.strokes.length;
    } else {
        strokeCounter.innerHTML = "" + drawingCanvas.strokes.length + "/" + drawingCanvas.level.maxStrokes;
    }
    if (drawingCanvas.level.maxStrokes < 0) {
        submitButton.classList.remove('active-submit-button');
        submitButton.classList.add('inactive-submit-button');
        strokeCounter.classList.remove('stroke-counter-excessive');
    } else if (drawingCanvas.strokes.length <= drawingCanvas.level.maxStrokes){
        submitButton.classList.remove('inactive-submit-button');
        submitButton.classList.add('active-submit-button');
        strokeCounter.classList.remove('stroke-counter-excessive');
    } else {
        submitButton.classList.remove('active-submit-button');
        submitButton.classList.add('inactive-submit-button');
        strokeCounter.classList.add('stroke-counter-excessive');
    }

    if (drawingCanvas.strokes.length == 1 && drawingCanvas.level.maxStrokes <= 0) {
        strokeLabel.innerHTML = "Stroke";
    } else {
        strokeLabel.innerHTML = "Strokes";
    }
}

function submitDrawing() {
    if (!drawingCanvas.canvasActive) return;
    if (drawingCanvas.level.maxStrokes >= 0 
        && drawingCanvas.strokes.length > drawingCanvas.level.maxStrokes) return;
    clearFeedbackMarks();
    if (drawingCanvas.level.maxStrokes == -1) return;
    point = buttonToCanvasPoint(submitButton);
    drawUnliftableIfDown(point.x, point.y);
    validateSvg(drawingCanvas.level.goalImg, function (errors) {
        if (errors.length == 0){
            CookieManager.setCookie(drawingCanvas.level, "complete");
            drawingCanvas.level.button.classList.add("completed-level");
            allDone = checkCompletion();
            // We don't currently do anything if all levels have been completed
            thereAreMoreLevels = judgedLevels.indexOf(drawingCanvas.level) < (judgedLevels.length - 1);
            if (thereAreMoreLevels) {
                levelPopup = document.getElementById('level-completion-popup');
                levelPopup.classList.remove('final-popup');
                levelPopup.classList.remove('popup-hidden');
                levelPopup.innerHTML = '<div class="popup-button" id="popup-close-button" onclick="closeCompletionPopup()">X</div><div id="well-done">Well done!</div><div id="popup-next-button" onclick="nextLevel()"></div>';
                mainCanvas.classList.remove('canvas-active');
                drawingCanvas.canvasActive = false;
            } else {
                levelPopup = document.getElementById('level-completion-popup');
                levelPopup.classList.add('final-popup');
                levelPopup.classList.remove('popup-hidden');
                levelPopup.innerHTML = '<div class="popup-button" id="popup-close-button" onclick="closeCompletionPopup()">X</div><div id="well-done-final">Well done!</div><div id="final-message">That\'s the last level for now, but you can keep doodling in our free-draw sandbox.</div><div id="popup-sandbox-button" onclick="selectSandbox()"></div>';
                mainCanvas.classList.remove('canvas-active');
                drawingCanvas.canvasActive = false;
            }
        } 
        showErrors(errors);
    });
}

function checkCompletion() {
    var allDone = true;
    for(i = 0; i < judgedLevels.length; i++) {
        if (CookieManager.getCookie(judgedLevels[i]) != "complete") {
            allDone = false;
        }
    }
    return allDone;
}

function UndoManager() {
    this.snapshots = [];
}
UndoManager.prototype.pushCurrent = function() {
    if (drawingCanvas.currentlyDrawing) return;
    var strokesCopy = [];
    drawingCanvas.strokes.forEach(function(stroke) {
        strokesCopy.push(stroke.copy());
    })
    s = new StateSnapshot(strokesCopy, drawingCanvas.currentTool);
    this.snapshots.push(s);
}
UndoManager.prototype.undo = function() {
    if (!drawingCanvas.canvasActive) return;
    clearFeedbackMarks();
    if (this.snapshots.length == 0) return;
    s = this.snapshots.pop();
    drawingCanvas.strokes.forEach(function(s) {
        s.remove();
    });
    drawingCanvas.strokes = s.strokes;
    drawingCanvas.strokes.forEach(function(s) {
        s.show();
    });
    for (var i = 0; i < mainToolbar.tools.length; i++) {
        mainToolbar.tools[i].usageCnt = s.cnts[i];
        mainToolbar.tools[i].usagePattern = s.pats[i];
    }
    //drawingCanvas.currentTool = s.currentTool;
    point = buttonToCanvasPoint(document.getElementById('undo-button'));
    drawUnliftableIfDown(point.x, point.y);
    updateCounter();
}
UndoManager.prototype.clear = function() {
    this.snapshots = [];
}
var undoManager = new UndoManager();

function onload() {
    mainCanvas = document.getElementById("mainCanvas");
    canvasRect = mainCanvas.getBoundingClientRect();
    strokeCounter = document.getElementById("stroke-counter");
    strokeLabel = document.getElementById("stroke-label");
    currentColorWindow = document.getElementById("current-color-window");
    pinkTool = new Tool(pinkColor, PushableBrush, document.getElementById("pink-button"));
    redTool = new Tool(redColor, StickyBrush, document.getElementById("red-button"));
    orangeTool = new Tool(orangeColor, NoLeftBrush, document.getElementById("orange-button"));
    yellowTool = new Tool(yellowColor, StartDoubleRotationBrush, document.getElementById("yellow-button"));
    greenTool = new Tool(greenColor, ErasableBrush, document.getElementById("green-button"));
    tealTool = new Tool(tealColor, new ColorRotationBrush([tealColor, "FFFFFF"]), document.getElementById("teal-button"));
    blueTool = new Tool(blueColor, EraserBrush, document.getElementById("blue-button"));
    purpleTool = new Tool(purpleColor, GravityBrush, document.getElementById("purple-button"));
    brownTool = new Tool(brownColor, UnliftableBrush, document.getElementById("brown-button"));
    blackTool = new Tool(blackColor, YMirrorBrush, document.getElementById("black-button"));
    sandbox = new Level("url(levels/sandbox.png)", "", "", document.getElementById("sandbox-button"), -1, "sandbox");
    ladybug = new Level("url(levels/ladybug-guide.png)", "levels/ladybug-goal.png", "url(levels/ladybug-reference.png)", document.getElementById("ladybug-level-button"), 7, "ladybug");
    hive = new Level("url(levels/hive-guide.png)", "levels/hive-goal.png", "url(levels/hive-reference.png)", document.getElementById("hive-level-button"), 2, "hive");
    flower = new Level("url(levels/flower-guide.png)", "levels/flower-goal.png", "url(levels/flower-reference.png)", document.getElementById("flower-level-button"), 3, "flower");
    dragonfly = new Level("url(levels/dragonfly-guide.png)", "levels/dragonfly-goal.png", "url(levels/dragonfly-reference.png)", document.getElementById("dragonfly-level-button"), 3, "dragonfly");
    hummingbird = new Level("url(levels/hummingbird-guide.png)", "levels/hummingbird-goal.png", "url(levels/hummingbird-reference.png)", document.getElementById("hummingbird-level-button"), 3, "hummingbird");
    butterfly = new Level("url(levels/butterfly-guide.png)", "levels/butterfly-goal.png", "url(levels/butterfly-reference.png)", document.getElementById("butterfly-level-button"), 2, "butterfly");
    worm = new Level("url(levels/worm-guide.png)", "levels/worm-goal.png", "url(levels/worm-reference.png)", document.getElementById("worm-level-button"), 3, "worm");
    sky = new Level("url(levels/sky-guide.png)", "levels/sky-goal.png", "url(levels/sky-reference.png)", document.getElementById("sky-level-button"), 4, "sky");
    spider = new Level("url(levels/spider-guide.png)", "levels/spider-goal.png", "url(levels/spider-reference.png)", document.getElementById("spider-level-button"), 2, "spider");
    fish = new Level("url(levels/fish-guide.png)", "levels/fish-goal.png", "url(levels/fish-reference.png)", document.getElementById("fish-level-button"), 5, "fish");
    umbrella = new Level("url(levels/umbrella-guide.png)", "levels/umbrella-goal.png", "url(levels/umbrella-reference.png)", document.getElementById("umbrella-level-button"), 3, "umbrella");
    boat = new Level("url(levels/boat-guide.png)", "levels/boat-goal.png", "url(levels/boat-reference.png)", document.getElementById("boat-level-button"), 3, "boat");
    space = new Level("url(levels/space-guide.png)", "levels/space-goal.png", "url(levels/space-reference.png)", document.getElementById("space-level-button"), 7, "space");
    judgedLevels = [ladybug, hive, flower, hummingbird, dragonfly, butterfly, sky, worm, spider, fish, umbrella, boat, space];
    submitButton = document.getElementById("submit-button");
    mainToolbar = new Toolbar([pinkTool, redTool, orangeTool, yellowTool, greenTool, tealTool, blueTool, purpleTool, brownTool, blackTool]);
    drawingCanvas = new DrawingCanvas();
    ladybug.selectLevel();
    drawingCanvas.drawCanvas();
    blackTool.selectTool();
    mainCanvas.addEventListener('mousedown', function(e) { drawingCanvas.startStroke(e.clientX - canvasRect.left, e.clientY - canvasRect.top) }.bind(this));
    mainCanvas.addEventListener('mousemove', function(e) { drawingCanvas.moveMouse(e.clientX - canvasRect.left, e.clientY - canvasRect.top) }.bind(this));
    mainCanvas.addEventListener('mouseup', function(e) { drawingCanvas.endStroke(e.clientX - canvasRect.left, e.clientY - canvasRect.top) }.bind(this));
    mainCanvas.addEventListener('mouseleave', function(e) { drawingCanvas.endStroke(e.clientX - canvasRect.left, e.clientY - canvasRect.top) }.bind(this));
}

window.addEventListener('scroll', function(e) { canvasRect = mainCanvas.getBoundingClientRect(); });
window.addEventListener('resize', function(e) { canvasRect = mainCanvas.getBoundingClientRect(); });

function showErrors(errs) {
    errors = [];
    errs.forEach(function(error) {
       errors.push(error);
    })
    if (errors.length != 0) {
        rect = document.createElementNS(svgNS, 'rect'); //Create the rect.
        rect.setAttributeNS(null, "x", 0); //Set its attributes.
        rect.setAttributeNS(null, "y", 0);
        rect.setAttributeNS(null, "width", 640);
        rect.setAttributeNS(null, "height", 480);
        rect.setAttributeNS(null, "fill", "#ffffff");
        rect.setAttributeNS(null, "fill-opacity", "0.4");
        mainCanvas.appendChild(rect);
        drawingCanvas.feedbackMarks.push(rect);
        errors.forEach(function (errorPoint) {
            circle = document.createElementNS(svgNS, 'ellipse'); //Create the rect.
            circle.setAttributeNS(null, "rx", "20"); //Set its attributes.
            circle.setAttributeNS(null, "ry", "20");
            circle.setAttributeNS(null, "cx", "" + errorPoint.x);
            circle.setAttributeNS(null, "cy", "" + errorPoint.y);
            circle.setAttributeNS(null, "fill-opacity", "0");
            circle.setAttributeNS(null, "stroke-width", "6");
            circle.setAttributeNS(null, "stroke", "#FF1111");
            mainCanvas.appendChild(circle);
            drawingCanvas.feedbackMarks.push(circle);
        });
        drawingCanvas.showingFeedback = true;
    }
}

//BEGIN BRUSH DEFINTIONS

function NormalBrush() {}
//what the brush does when the user first begins drawing
NormalBrush.onStart = function(mouseX, mouseY, currentStroke) {
    currentStroke.path.setAttributeNS(null, "d", "M " + mouseX + " " + mouseY + " L " + mouseX + " " + mouseY);
    currentStroke.path.setAttributeNS(null, "stroke", currentStroke.color);
}
//what the brush does when the user moves the mouse
NormalBrush.onDraw = function(mouseX, mouseY, currentStroke) {
    currentPath = currentStroke.path.getAttributeNS(null, "d");
    newPath = currentPath + " L " + mouseX + " " + mouseY;
    currentStroke.path.setAttributeNS(null, "d", newPath);
}
//for brushes that do something when the user lifts them up
NormalBrush.onEnd = function(mouseX, mouseY, currentStroke) {}
//onStrokeStarts is for brushes that change once per subsequent stroke
NormalBrush.onStrokeStarts  = function(mouseX, mouseY, currentStroke) {}
//onStrokes is for brushes that change with every subsequent stroke movement
NormalBrush.onStrokes  = function(mouseX, mouseY, currentStroke) {}
NormalBrush.onNonStrokeMove = function(mouseX, mouseY, currentStroke) {}


function YMirrorBrush() {}
//what the brush does when the user first begins drawing
YMirrorBrush.onStart = function(mouseX, mouseY, currentStroke) {
    currentStroke.path.setAttributeNS(null, "d", "M " + mouseX + " " + (canvasRect.height - mouseY) 
                                        + " L " + mouseX + " " + (canvasRect.height - mouseY));
    currentStroke.path.setAttributeNS(null, "stroke", currentStroke.color);
}
//what the brush does when the user moves the mouse
YMirrorBrush.onDraw = function(mouseX, mouseY, currentStroke) {
    currentPath = currentStroke.path.getAttributeNS(null, "d");
    newPath = currentPath + " L " + mouseX + " " + (canvasRect.height - mouseY);
    currentStroke.path.setAttributeNS(null, "d", newPath);
}
//for brushes that do something when the user lifts them up
YMirrorBrush.onEnd = function(mouseX, mouseY, currentStroke) {}
//onStrokeStarts is for brushes that change once per subsequent stroke
YMirrorBrush.onStrokeStarts  = function(mouseX, mouseY, currentStroke) {}
//onStrokes is for brushes that change with every subsequent stroke movement
YMirrorBrush.onStrokes  = function(mouseX, mouseY, currentStroke) {}
YMirrorBrush.onNonStrokeMove = function(mouseX, mouseY, currentStroke) {}


function XMirrorBrush() {}
//what the brush does when the user first begins drawing
XMirrorBrush.onStart = function(mouseX, mouseY, currentStroke) {
    currentStroke.path.setAttributeNS(null, "d", "M " + (canvasRect.width- mouseX) + " " + mouseY
                                     + " L " + (canvasRect.width- mouseX) + " " + mouseY);
    currentStroke.path.setAttributeNS(null, "stroke", currentStroke.color);
}
//what the brush does when the user moves the mouse
XMirrorBrush.onDraw = function(mouseX, mouseY, currentStroke) {
    currentPath = currentStroke.path.getAttributeNS(null, "d");
    newPath = currentPath + " L " + (canvasRect.width- mouseX) + " " + mouseY;
    currentStroke.path.setAttributeNS(null, "d", newPath);
}
//for brushes that do something when the user lifts them up
XMirrorBrush.onEnd = function(mouseX, mouseY, currentStroke) {}
//onStrokeStarts is for brushes that change once per subsequent stroke
XMirrorBrush.onStrokeStarts  = function(mouseX, mouseY, currentStroke) {}
//onStrokes is for brushes that change with every subsequent stroke movement
XMirrorBrush.onStrokes  = function(mouseX, mouseY, currentStroke) {}
XMirrorBrush.onNonStrokeMove = function(mouseX, mouseY, currentStroke) {}


function CenterRotationBrush() {}
//what the brush does when the user first begins drawing
CenterRotationBrush.onStart = function(mouseX, mouseY, currentStroke) {
    centerX = canvasRect.width / 2;
    centerY = canvasRect.height / 2;
    currentStroke.path.setAttributeNS(null, "d", "M " + ((2 * centerX) - mouseX) + " " + ((2 * centerY) - mouseY)
                                      + " L " + ((2 * centerX) - mouseX) + " " + ((2 * centerY) - mouseY));
    currentStroke.path.setAttributeNS(null, "stroke", currentStroke.color);
}
//what the brush does when the user moves the mouse
CenterRotationBrush.onDraw = function(mouseX, mouseY, currentStroke) {
    centerX = canvasRect.width / 2;
    centerY = canvasRect.height / 2;
    currentPath = currentStroke.path.getAttributeNS(null, "d");
    newPath = currentPath + " L " + ((2 * centerX) - mouseX) + " " + ((2 * centerY) - mouseY);
    currentStroke.path.setAttributeNS(null, "d", newPath);
}
//for brushes that do something when the user lifts them up
CenterRotationBrush.onEnd = function(mouseX, mouseY, currentStroke) {}
//onStrokeStarts is for brushes that change once per subsequent stroke
CenterRotationBrush.onStrokeStarts  = function(mouseX, mouseY, currentStroke) {}
//onStrokes is for brushes that change with every subsequent stroke movement
CenterRotationBrush.onStrokes  = function(mouseX, mouseY, currentStroke) {}
CenterRotationBrush.onNonStrokeMove = function(mouseX, mouseY, currentStroke) {}


function StartRotationBrush() {}
//what the brush does when the user first begins drawing
StartRotationBrush.onStart = function(mouseX, mouseY, currentStroke) {
    this.startX = mouseX;
    this.startY = mouseY;
    currentStroke.path.setAttributeNS(null, "d", "M " + mouseX + " " + mouseY + " L " + mouseX + " " + mouseY);
    currentStroke.path.setAttributeNS(null, "stroke", currentStroke.color);
}
//what the brush does when the user moves the mouse
StartRotationBrush.onDraw = function(mouseX, mouseY, currentStroke) {
    currentPath = currentStroke.path.getAttributeNS(null, "d");
    newPath = currentPath + " L " + ((2 * this.startX) - mouseX) + " " + ((2 * this.startY) - mouseY);
    currentStroke.path.setAttributeNS(null, "d", newPath);
}
//for brushes that do something when the user lifts them up
StartRotationBrush.onEnd = function(mouseX, mouseY, currentStroke) {}
//onStrokeStarts is for brushes that change once per subsequent stroke
StartRotationBrush.onStrokeStarts  = function(mouseX, mouseY, currentStroke) {}
//onStrokes is for brushes that change with every subsequent stroke movement
StartRotationBrush.onStrokes  = function(mouseX, mouseY, currentStroke) {}
StartRotationBrush.onNonStrokeMove = function(mouseX, mouseY, currentStroke) {}


function StartDoubleRotationBrush() {}
//what the brush does when the user first begins drawing
StartDoubleRotationBrush.onStart = function(mouseX, mouseY, currentStroke) {
    this.startX = mouseX;
    this.startY = mouseY;
    currentStroke.points = ["" + mouseX + " " + mouseY,
                            "" + mouseX + " " + mouseY]
    currentStroke.path.setAttributeNS(null, "d", "M " + currentStroke.points.join(" L "));
    currentStroke.path.setAttributeNS(null, "stroke", currentStroke.color);
}
//what the brush does when the user moves the mouse
StartDoubleRotationBrush.onDraw = function(mouseX, mouseY, currentStroke) {
    currentStroke.points.push("" + mouseX + " " + mouseY);
    currentStroke.points.unshift("" + ((2 * this.startX) - mouseX) + " " + ((2 * this.startY) - mouseY));
    currentStroke.path.setAttributeNS(null, "d", "M " + currentStroke.points.join(" L "));
}
//for brushes that do something when the user lifts them up
StartDoubleRotationBrush.onEnd = function(mouseX, mouseY, currentStroke) {}
//onStrokeStarts is for brushes that change once per subsequent stroke
StartDoubleRotationBrush.onStrokeStarts  = function(mouseX, mouseY, currentStroke) {}
//onStrokes is for brushes that change with every subsequent stroke movement
StartDoubleRotationBrush.onStrokes  = function(mouseX, mouseY, currentStroke) {}
StartDoubleRotationBrush.onNonStrokeMove = function(mouseX, mouseY, currentStroke) {}


function ColorRotationBrush(colors) {
    this.colors = colors;
}
//what the brush does when the user first begins drawing
ColorRotationBrush.prototype.onStart = function(mouseX, mouseY, currentStroke) {
    currentStroke.path.setAttributeNS(null, "d", "M " + mouseX + " " + mouseY + " L " + mouseX + " " + mouseY);
    currentStroke.path.setAttributeNS(null, "stroke", "#" + this.colors[0]);
    currentStroke.color = "#" + this.colors[0];
    currentStroke.colorNum = 0;
}
//what the brush does when the user moves the mouse
ColorRotationBrush.prototype.onDraw = function(mouseX, mouseY, currentStroke) {
    currentPath = currentStroke.path.getAttributeNS(null, "d");
    newPath = currentPath + " L " + mouseX + " " + mouseY;
    currentStroke.path.setAttributeNS(null, "d", newPath);
}
//for brushes that do something when the user lifts them up
ColorRotationBrush.prototype.onEnd = function(mouseX, mouseY, currentStroke) {}
//onStrokeStarts is for brushes that change once per subsequent stroke
ColorRotationBrush.prototype.onStrokeStarts  = function(mouseX, mouseY, currentStroke) {
    newNum = (currentStroke.colorNum + 1) % this.colors.length;
    currentStroke.colorNum = newNum;
    currentStroke.path.setAttributeNS(null, "stroke", "#" + this.colors[currentStroke.colorNum]);
    currentStroke.color = "#" + this.colors[currentStroke.colorNum];
}
//onStrokes is for brushes that change with every subsequent stroke movement
ColorRotationBrush.prototype.onStrokes  = function(mouseX, mouseY, currentStroke) {}
ColorRotationBrush.prototype.onNonStrokeMove = function(mouseX, mouseY, currentStroke) {}


function ErasableBrush() {}
//what the brush does when the user first begins drawing
ErasableBrush.onStart = function(mouseX, mouseY, currentStroke) {
    currentStroke.points = ["" + mouseX + " " + mouseY,
                            "" + mouseX + " " + mouseY]
    currentStroke.path.setAttributeNS(null, "d", "M " + currentStroke.points.join(" L "));
    currentStroke.path.setAttributeNS(null, "stroke", currentStroke.color);
}
//what the brush does when the user moves the mouse
ErasableBrush.onDraw = function(mouseX, mouseY, currentStroke) {
    currentStroke.points.push("" + mouseX + " " + mouseY);
    currentStroke.path.setAttributeNS(null, "d", "M " + currentStroke.points.join(" L "));
}
//for brushes that do something when the user lifts them up
ErasableBrush.onEnd = function(mouseX, mouseY, currentStroke) {
    currentStroke.eraseNow = false;
}
//onStrokeStarts is for brushes that change once per subsequent stroke
ErasableBrush.onStrokeStarts  = function(mouseX, mouseY, currentStroke) {}
//onStrokes is for brushes that change with every subsequent stroke movement
ErasableBrush.onStrokes  = function(mouseX, mouseY, currentStroke) {
    newStroke = drawingCanvas.strokes[drawingCanvas.strokes.length - 1];
    newStrokePathParts = newStroke.path.getAttributeNS(null, "d").split(" ");
    if (newStrokePathParts.length < 6) {
        return;
    }
    newX = parseFloat(newStrokePathParts[newStrokePathParts.length - 2]);
    newY = parseFloat(newStrokePathParts[newStrokePathParts.length - 1]);
    prevX = parseFloat(newStrokePathParts[newStrokePathParts.length - 5]);
    prevY = parseFloat(newStrokePathParts[newStrokePathParts.length - 4]);
    drawnDist = Math.sqrt(((newX-prevX)*(newX-prevX)) + ((newY-prevY)*(newY-prevY)));
    erasedDist = 0.0;

    currentPointStrings = currentStroke.points[0].split(" ");
    currentPoint = [parseFloat(currentPointStrings[0]), parseFloat(currentPointStrings[1])];
    while (erasedDist <= drawnDist) {
        if (currentStroke.points.length <= 1){
            currentStroke.path.setAttributeNS(null, "d", "");
            currentStroke.path.remove();
            return;
        }
        nextPointStrings = currentStroke.points[1].split(" ");
        nextPoint = [parseFloat(nextPointStrings[0]), parseFloat(nextPointStrings[1])];
        nextDist = Math.sqrt(((nextPoint[0]-currentPoint[0])*(nextPoint[0]-currentPoint[0]))
                     + ((nextPoint[1]-currentPoint[1])*(nextPoint[1]-currentPoint[1])));
        if (nextDist <= drawnDist - erasedDist) {
            currentPoint = nextPoint;
            currentStroke.points.shift();
            erasedDist += nextDist;
        } else {
            distToErase = drawnDist - erasedDist;
            percentToErase = (1.0*distToErase)/nextDist;
            updatedX = currentPoint[0] + (percentToErase * (nextPoint[0]-currentPoint[0]));
            updatedY = currentPoint[1] + (percentToErase * (nextPoint[1]-currentPoint[1]));
            currentStroke.points[0] = updatedX + " " + updatedY;
            break;
        }
    }
    currentStroke.path.setAttributeNS(null, "d", "M " + currentStroke.points.join(" L "));
}
ErasableBrush.onNonStrokeMove = function(mouseX, mouseY, currentStroke) {}


function DelayedBrush() {}
//what the brush does when the user first begins drawing
DelayedBrush.onStart = function(mouseX, mouseY, currentStroke) {
    currentStroke.pointsQueued = ["" + mouseX + " " + mouseY,
                                  "" + mouseX + " " + mouseY]
    currentStroke.path.setAttributeNS(null, "d", "");
    currentStroke.path.setAttributeNS(null, "stroke", currentStroke.color);
}
//what the brush does when the user moves the mouse
DelayedBrush.onDraw = function(mouseX, mouseY, currentStroke) {
    currentStroke.pointsQueued.push("" + mouseX + " " + mouseY);
}
//for brushes that do something when the user lifts them up
DelayedBrush.onEnd = function(mouseX, mouseY, currentStroke) {}
//onStrokeStarts is for brushes that change once per subsequent stroke
DelayedBrush.onStrokeStarts  = function(mouseX, mouseY, currentStroke) {}
//onStrokes is for brushes that change with every subsequent stroke movement
DelayedBrush.onStrokes  = function(mouseX, mouseY, currentStroke) {
    if (currentStroke.pointsQueued.length > 0){
        newPoint = currentStroke.pointsQueued.shift();
        currentPath = currentStroke.path.getAttributeNS(null, "d");
        if (currentPath == ""){
            newPath = "M " + newPoint;
            currentStroke.path.setAttributeNS(null, "d", newPath);
        } else {
            newPath = currentPath + " L " + newPoint;
            currentStroke.path.setAttributeNS(null, "d", newPath);
        }
    }
}
DelayedBrush.onNonStrokeMove = function(mouseX, mouseY, currentStroke) {}


function EraserBrush() {} //IN PROGRESS
//what the brush does when the user first begins drawing
EraserBrush.onStart = function(mouseX, mouseY, currentStroke) {
    currentStroke.path.setAttributeNS(null, "d", "M " + mouseX + " " + mouseY + " L " + mouseX + " " + mouseY);
    currentStroke.path.setAttributeNS(null, "stroke", currentStroke.color);
    currentStroke.eraseNow = false;
}
//what the brush does when the user moves the mouse
EraserBrush.onDraw = function(mouseX, mouseY, currentStroke) {
    currentPath = currentStroke.path.getAttributeNS(null, "d");
    newPath = currentPath + " L " + mouseX + " " + mouseY;
    currentStroke.path.setAttributeNS(null, "d", newPath);

    newStrokePathParts = currentStroke.path.getAttributeNS(null, "d").split(" ");
    if (newStrokePathParts.length < 6) {
        return;
    }
    for (i = 0; i < drawingCanvas.strokes.length - 1; i++) {
        testStroke = drawingCanvas.strokes[i];
        //in some cases, we don't erase normally
        if (testStroke.brush == ErasableBrush && 
            (testStroke.path.getAttributeNS(null, "d") != "")) {
            //The erasable stroke will erase itself
            break;
        }
        if (!((testStroke.brush == DelayedBrush && testStroke.pointsQueued.length > 0) ||
            (testStroke.path.getAttributeNS(null, "d") == "")||
            (testStroke.brush == StartDoubleRotationBrush))){
            //testStroke basically becomes erasable brush
            newX = parseFloat(newStrokePathParts[newStrokePathParts.length - 2]);
            newY = parseFloat(newStrokePathParts[newStrokePathParts.length - 1]);
            prevX = parseFloat(newStrokePathParts[newStrokePathParts.length - 5]);
            prevY = parseFloat(newStrokePathParts[newStrokePathParts.length - 4]);
            drawnDist = Math.sqrt(((newX-prevX)*(newX-prevX)) + ((newY-prevY)*(newY-prevY)));
            erasedDist = 0.0;

            testPoints = testStroke.path.getAttributeNS(null, "d").substring(2).split(" L ");
            pointStrings = testPoints[0].split(" ");
            currentPoint = [parseFloat(pointStrings[0]), parseFloat(pointStrings[1])];
            while (erasedDist <= drawnDist) {
                if (testPoints.length <= 1){
                    testStroke.path.setAttributeNS(null, "d", "");
                    testStroke.path.remove();
                    return;
                }
                nextPointStrings = testPoints[1].split(" ");
                nextPoint = [parseFloat(nextPointStrings[0]), parseFloat(nextPointStrings[1])];
                nextDist = Math.sqrt(((nextPoint[0]-currentPoint[0])*(nextPoint[0]-currentPoint[0]))
                     + ((nextPoint[1]-currentPoint[1])*(nextPoint[1]-currentPoint[1])));
                if (nextDist <= drawnDist - erasedDist) {
                    currentPoint = nextPoint;
                    testPoints.shift();
                    erasedDist += nextDist;
                } else {
                    distToErase = drawnDist - erasedDist;
                    percentToErase = (1.0*distToErase)/nextDist;
                    updatedX = currentPoint[0] + (percentToErase * (nextPoint[0]-currentPoint[0]));
                    updatedY = currentPoint[1] + (percentToErase * (nextPoint[1]-currentPoint[1]));
                    testPoints[0] = updatedX + " " + updatedY;
                    break;
                }  
            }
            testStroke.path.setAttributeNS(null, "d", "M " + testPoints.join(" L "));
            break;
        }
        if ((testStroke.path.getAttributeNS(null, "d") != "") && 
            testStroke.brush == StartDoubleRotationBrush) {
            // handle the start double rotation brush separately
            testPath = testStroke.path.getAttributeNS(null, "d");
            pathHalves = testPath.split(" M ");
            if (pathHalves.length <= 1) {
            //it hasn't been split yet; split it
                pathParts = testPath.split(" ");
                if (pathParts.length < 6) {
                    testStroke.path.setAttributeNS(null, "d", "");
                    testStroke.path.remove();
                    break;
                }
                pathMid = Math.ceil(pathParts.length / 6) * 3;
                firstPathParts = pathParts.slice(0, pathMid);
                secondPathParts = pathParts.slice(pathMid + 1, pathParts.length);
                newFullPath = firstPathParts.join(" ") + " M " + secondPathParts.join(" ");
                testStroke.path.setAttributeNS(null, "d", newFullPath);
            } else {
            //reduce both halves
                firstPathPoints = pathHalves[0].substring(2).split(" L ");
                secondPathPoints = pathHalves[1].split(" L ");
                if (firstPathPoints.length < 2) {
                    testStroke.path.setAttributeNS(null, "d", "");
                    testStroke.path.remove();
                    break;
                }

                newX = parseFloat(newStrokePathParts[newStrokePathParts.length - 2]);
                newY = parseFloat(newStrokePathParts[newStrokePathParts.length - 1]);
                prevX = parseFloat(newStrokePathParts[newStrokePathParts.length - 5]);
                prevY = parseFloat(newStrokePathParts[newStrokePathParts.length - 4]);
                drawnDist = Math.sqrt(((newX-prevX)*(newX-prevX)) + ((newY-prevY)*(newY-prevY)));
                erasedDist = 0.0;

                pointStrings1 = firstPathPoints[firstPathPoints.length - 1].split(" ");
                pointStrings2 = secondPathPoints[0].split(" ");
                currentPoint1 = [parseFloat(pointStrings1[0]), parseFloat(pointStrings1[1])];
                currentPoint2 = [parseFloat(pointStrings2[0]), parseFloat(pointStrings2[1])];
                while (erasedDist <= drawnDist) {
                    if (firstPathPoints.length <= 1){
                        testStroke.path.setAttributeNS(null, "d", "");
                        testStroke.path.remove();
                        return;
                    }
                    nextPointStrings1 = firstPathPoints[firstPathPoints.length - 2].split(" ");
                    nextPoint1 = [parseFloat(nextPointStrings1[0]), parseFloat(nextPointStrings1[1])];
                    nextDist = Math.sqrt(((nextPoint1[0]-currentPoint1[0])*(nextPoint1[0]-currentPoint1[0]))
                     + ((nextPoint1[1]-currentPoint1[1])*(nextPoint1[1]-currentPoint1[1])));
                    if (nextDist <= drawnDist - erasedDist) {
                        nextPointStrings2 = secondPathPoints[1].split(" ");
                        nextPoint2 = [parseFloat(nextPointStrings2[0]), parseFloat(nextPointStrings2[1])];

                        currentPoint1 = nextPoint1;
                        currentPoint2 = nextPoint2;

                        firstPathPoints.pop();
                        secondPathPoints.shift();
                        erasedDist += nextDist;
                    } else {
                        nextPointStrings2 = secondPathPoints[1].split(" ");
                        nextPoint2 = [parseFloat(nextPointStrings2[0]), parseFloat(nextPointStrings2[1])];

                        distToErase = drawnDist - erasedDist;
                        percentToErase = (1.0*distToErase)/nextDist;

                        updatedX1 = currentPoint1[0] + (percentToErase * (nextPoint1[0]-currentPoint1[0]));
                        updatedY1 = currentPoint1[1] + (percentToErase * (nextPoint1[1]-currentPoint1[1]));
                        updatedX2 = currentPoint2[0] + (percentToErase * (nextPoint2[0]-currentPoint2[0]));
                        updatedY2 = currentPoint2[1] + (percentToErase * (nextPoint2[1]-currentPoint2[1]));

                        firstPathPoints[firstPathPoints.length - 1] = updatedX1 + " " + updatedY1;
                        secondPathPoints[0] = updatedX2 + " " + updatedY2;
                        break;
                    }  
                }
                newFullPath = "M " + firstPathPoints.join(" L ") + " M " + secondPathPoints.join(" L ");
                testStroke.path.setAttributeNS(null, "d", newFullPath);
            }
            break;
        }
    }
}
//for brushes that do something when the user lifts them up
EraserBrush.onEnd = function(mouseX, mouseY, currentStroke) {}
//onStrokeStarts is for brushes that change once per subsequent stroke
EraserBrush.onStrokeStarts  = function(mouseX, mouseY, currentStroke) {}
//onStrokes is for brushes that change with every subsequent stroke movement
EraserBrush.onStrokes  = function(mouseX, mouseY, currentStroke) {}
EraserBrush.onNonStrokeMove = function(mouseX, mouseY, currentStroke) {}


function GravityBrush() {}
//what the brush does when the user first begins drawing
GravityBrush.onStart = function(mouseX, mouseY, currentStroke) {
    currentStroke.path.setAttributeNS(null, "d", "M " + mouseX + " " + mouseY + " L " + mouseX + " " + mouseY);
    currentStroke.path.setAttributeNS(null, "stroke", currentStroke.color);
}
//what the brush does when the user moves the mouse
GravityBrush.onDraw = function(mouseX, mouseY, currentStroke) {
    currentPath = currentStroke.path.getAttributeNS(null, "d");
    newPath = currentPath + " L " + mouseX + " " + mouseY;
    currentStroke.path.setAttributeNS(null, "d", newPath);
}
//for brushes that do something when the user lifts them up
GravityBrush.onEnd = function(mouseX, mouseY, currentStroke) {
    currentStroke.velocity = 1;
    touchingFloor = false;
    currentPath = currentStroke.path.getAttributeNS(null, "d");
    pathParts = currentPath.split(" ");
    for (i = 2; i < pathParts.length; i+=3){
        pathY = parseFloat(pathParts[i]);
        if (pathY + (strokeWeight/2) >= canvasRect.height) {
            touchingFloor = true;
        }
    }
    if (!touchingFloor) {
        currentStroke.gravityInterval = setInterval(function() {
            applyGravity(currentStroke);
        }, 10);
    }
}
//onStrokeStarts is for brushes that change once per subsequent stroke
GravityBrush.onStrokeStarts  = function(mouseX, mouseY, currentStroke) {}
//onStrokes is for brushes that change with every subsequent stroke movement
GravityBrush.onStrokes  = function(mouseX, mouseY, currentStroke) {}
GravityBrush.onNonStrokeMove = function(mouseX, mouseY, currentStroke) {}


function applyGravity(currentStroke) {
    touchingFloor = false;
    maxSubtract = 0;
    currentPath = currentStroke.path.getAttributeNS(null, "d");
    pathParts = currentPath.split(" ");
    for (i = 2; i < pathParts.length; i+=3){
        pathY = parseFloat(pathParts[i]);
        newY = pathY + currentStroke.velocity;
        if (newY >= canvasRect.height) {
            touchingFloor = true;
            if (newY - canvasRect.height + (strokeWeight/2)> maxSubtract) {
                maxSubtract = newY - canvasRect.height + (strokeWeight/2);
            }
        }
        pathParts[i] = "" + newY;
    }
    currentStroke.path.setAttributeNS(null, "d", pathParts.join(" "));
    if (touchingFloor){
        for (i = 2; i < pathParts.length; i+=3){
            pathY = parseFloat(pathParts[i]);
            newY = pathY - maxSubtract;
            pathParts[i] = "" + newY;
        }
        currentStroke.path.setAttributeNS(null, "d", pathParts.join(" "));
        clearInterval(currentStroke.gravityInterval);
        currentStroke.gravityInterval = null;
        return;
    }
    currentStroke.velocity = Math.min(currentStroke.velocity + 0.6, 80);
}


function StickyBrush() {}
//what the brush does when the user first begins drawing
StickyBrush.onStart = function(mouseX, mouseY, currentStroke) {
    currentStroke.points = ["" + mouseX + " " + mouseY,
                            "" + mouseX + " " + mouseY]
    currentStroke.path.setAttributeNS(null, "d", "M " + currentStroke.points.join(" L "));
    currentStroke.path.setAttributeNS(null, "stroke", currentStroke.color);
    currentStroke.sticking = false;
    currentStroke.endX = 0;
    currentStroke.endY = 0;
}
//what the brush does when the user moves the mouse
StickyBrush.onDraw = function(mouseX, mouseY, currentStroke) {
    currentStroke.points.push("" + mouseX + " " + mouseY);
    currentStroke.path.setAttributeNS(null, "d", "M " + currentStroke.points.join(" L "));
}
//for brushes that do something when the user lifts them up
StickyBrush.onEnd = function(mouseX, mouseY, currentStroke) {
    currentStroke.endX = mouseX;
    currentStroke.endY = mouseY;
    currentStroke.sticking = true;
}
//onStrokeStarts is for brushes that change once per subsequent stroke
StickyBrush.onStrokeStarts  = function(mouseX, mouseY, currentStroke) {
    currentStroke.sticking = false;
}
//onStrokes is for brushes that change with every subsequent stroke movement
StickyBrush.onStrokes  = function(mouseX, mouseY, currentStroke) {}
StickyBrush.onNonStrokeMove = function(mouseX, mouseY, currentStroke) {
    if (currentStroke.sticking){
        newPoints = [];
        for (i = 0; i < currentStroke.points.length; i++){
            point = currentStroke.points[i];
            pointParts = point.split(" ");
            x = parseFloat(pointParts[0]);
            y = parseFloat(pointParts[1]);
            newPoints.push("" + (mouseX + x - currentStroke.endX) + " " + (mouseY + y - currentStroke.endY));
        }
    currentStroke.path.setAttributeNS(null, "d", "M " + newPoints.join(" L "));
    }
}


function DominatingBrush() {} //TODO: Address Cycling Color Brush
//what the brush does when the user first begins drawing
DominatingBrush.onStart = function(mouseX, mouseY, currentStroke) {
    currentStroke.path.setAttributeNS(null, "d", "M " + mouseX + " " + mouseY + " L " + mouseX + " " + mouseY);
    currentStroke.path.setAttributeNS(null, "stroke", currentStroke.color);
}
//what the brush does when the user moves the mouse
DominatingBrush.onDraw = function(mouseX, mouseY, currentStroke) {
    currentPath = currentStroke.path.getAttributeNS(null, "d");
    newPath = currentPath + " L " + mouseX + " " + mouseY;
    currentStroke.path.setAttributeNS(null, "d", newPath);
}
//for brushes that do something when the user lifts them up
DominatingBrush.onEnd = function(mouseX, mouseY, currentStroke) {
    for (i = 0; i < drawingCanvas.strokes.length; i++) {
        testStroke = drawingCanvas.strokes[i];
        testStroke.path.setAttributeNS(null, "stroke", currentStroke.color);
    }
}
//onStrokeStarts is for brushes that change once per subsequent stroke
DominatingBrush.onStrokeStarts  = function(mouseX, mouseY, currentStroke) {}
//onStrokes is for brushes that change with every subsequent stroke movement
DominatingBrush.onStrokes  = function(mouseX, mouseY, currentStroke) {}
DominatingBrush.onNonStrokeMove = function(mouseX, mouseY, currentStroke) {}


function buttonToCanvasPoint(button) {
    buttonX = button.getBoundingClientRect().left + (button.getBoundingClientRect().width / 2) + window.scrollX - canvasRect.left;
    buttonY = button.getBoundingClientRect().top + (button.getBoundingClientRect().height / 2) + window.scrollY - canvasRect.top;
    return {
        x: buttonX,
        y: buttonY
    }
}

function pointTouchingEdge(x, y) {
    var w = canvasRect.width;
    var h = canvasRect.height;
    var r = strokeWeight / 2;
    var res = (x <= r || x >= w - r || y <= r || y >= h - r);
    return res;
}

function UnliftableBrush() {}
//what the brush does when the user first begins drawing
UnliftableBrush.onStart = function(mouseX, mouseY, currentStroke) {
    currentStroke.path.setAttributeNS(null, "d", "M " + mouseX + " " + mouseY + " L " + mouseX + " " + mouseY);
    currentStroke.path.setAttributeNS(null, "stroke", currentStroke.color);
    currentStroke.down = true;
}
//what the brush does when the user moves the mouse
UnliftableBrush.onDraw = function(mouseX, mouseY, currentStroke) {
    currentPath = currentStroke.path.getAttributeNS(null, "d");
    newPath = currentPath + " L " + mouseX + " " + mouseY;
    currentStroke.path.setAttributeNS(null, "d", newPath);
    currentStroke.touchingEdge = pointTouchingEdge(mouseX, mouseY);
}
//for brushes that do something when the user lifts them up
UnliftableBrush.onEnd = function(mouseX, mouseY, currentStroke) {}
//onStrokeStarts is for brushes that change once per subsequent stroke
UnliftableBrush.onStrokeStarts  = function(mouseX, mouseY, currentStroke) {
    currentStroke.down = false;
}
//onStrokes is for brushes that change with every subsequent stroke movement
UnliftableBrush.onStrokes  = function(mouseX, mouseY, currentStroke) {}
UnliftableBrush.onNonStrokeMove = function(mouseX, mouseY, currentStroke) {
    if (currentStroke.down){
        currentPath = currentStroke.path.getAttributeNS(null, "d");
        newPath = currentPath + " L " + mouseX + " " + mouseY;
        currentStroke.path.setAttributeNS(null, "d", newPath);
        currentStroke.touchingEdge = pointTouchingEdge(mouseX, mouseY);
    }
}


function drawUnliftableIfDown(x, y){
    if (drawingCanvas.canvasActive && drawingCanvas.strokes.length > 0 && 
            drawingCanvas.strokes[drawingCanvas.strokes.length - 1].brush == UnliftableBrush &&
            drawingCanvas.strokes[drawingCanvas.strokes.length - 1].down &&
            !drawingCanvas.strokes[drawingCanvas.strokes.length - 1].touchingEdge){
        lastPath = drawingCanvas.strokes[drawingCanvas.strokes.length - 1].path.getAttributeNS(null, "d");
        newPath = lastPath + " L " + x + " " + y;
        drawingCanvas.strokes[drawingCanvas.strokes.length - 1].path.setAttributeNS(null, "d", newPath);
    }
}

function NoLeftBrush() {}
//what the brush does when the user first begins drawing
NoLeftBrush.onStart = function(mouseX, mouseY, currentStroke) {
    currentStroke.path.setAttributeNS(null, "d", "M " + mouseX + " " + mouseY + " L " + mouseX + " " + mouseY);
    currentStroke.path.setAttributeNS(null, "stroke", currentStroke.color);
    currentStroke.lastX = mouseX;
}
//what the brush does when the user moves the mouse
NoLeftBrush.onDraw = function(mouseX, mouseY, currentStroke) {
    currentPath = currentStroke.path.getAttributeNS(null, "d");
    newX = mouseX;
    if (mouseX <= currentStroke.lastX) {
        newX = currentStroke.lastX;
    }
    newPath = currentPath + " L " + newX + " " + mouseY;
    currentStroke.path.setAttributeNS(null, "d", newPath);
    currentStroke.lastX = newX;
}
//for brushes that do something when the user lifts them up
NoLeftBrush.onEnd = function(mouseX, mouseY, currentStroke) {}
//onStrokeStarts is for brushes that change once per subsequent stroke
NoLeftBrush.onStrokeStarts  = function(mouseX, mouseY, currentStroke) {}
//onStrokes is for brushes that change with every subsequent stroke movement
NoLeftBrush.onStrokes  = function(mouseX, mouseY, currentStroke) {}
NoLeftBrush.onNonStrokeMove = function(mouseX, mouseY, currentStroke) {}


function dist2D(x1, y1, x2, y2) {
    hDist = x2 - x1;
    vDist = y2 - y1;
    cSquared = (hDist * hDist) + (vDist * vDist);
    return Math.sqrt(cSquared);
}

function pointToLineNearest(x1, y1, x2, y2, px, py) {
    xGap = px - x1;
    yGap = py - y1;
    xSpan = x2 - x1;
    ySpan = y2 - y1;

    dotProd = (xGap * xSpan) + (yGap * ySpan);
    lengthSquare = (xSpan*xSpan) + (ySpan * ySpan);

    param = -1;
    if (lengthSquare > 0) {
        param = dotProd / lengthSquare;
    }

    nearestX = 0;
    nearestY = 0;

    if (param < 0) {
        nearestX = x1;
        nearestY = y1;
    } else if (param > 1) {
        nearestX = x2;
        nearestY = y2;
    } else {
        nearestX = x1 + (param * xSpan);
        nearestY = y1 + (param * ySpan);
    }

    return [nearestX, nearestY];
}

function pointWithinStroke(x, y, pathParts){
    for (i = 4; i < pathParts.length; i+=3) {
        myNewX = parseFloat(pathParts[i]);
        myNewY = parseFloat(pathParts[i+1]);
        myOldX = parseFloat(pathParts[i-3]);
        myOldY = parseFloat(pathParts[i-2]);
        brushOldNearest = pointToLineNearest(myOldX, myOldY, myNewX, myNewY, x, y);
        if (dist2D(brushOldNearest[0], brushOldNearest[1], x, y) < strokeWeight) {
            return true;
        }
    }
    return false;
}

function getCollisionPoint(brushOldX, brushOldY, brushNewX, brushNewY, myOldX, myOldY, myNewX, myNewY){
    brushVector = [brushNewX - brushOldX, brushNewY - brushOldY];
    brushDist = dist2D(brushOldX, brushOldY, brushNewX, brushNewY);

    collisionPoint = [null, null];
        
    testSol1 = 2;
    // Find the collision point with myOld point, if it exists
    oldA = (brushVector[0] * brushVector[0]) + (brushVector[1] * brushVector[1]);
    oldB = 2 * (brushVector[0]*(brushOldX - myOldX) + brushVector[1]*(brushOldY - myOldY));
    oldC = (brushOldX-myOldX)*(brushOldX-myOldX) + (brushOldY-myOldY)*(brushOldY-myOldY) - (strokeWeight * strokeWeight / 4);
    oldRadical = (oldB * oldB) - 4*oldA*oldC;
    if (oldRadical > 0 && oldA != 0) {
        sol = (-1.0*oldB - Math.sqrt(oldRadical))/(2.0*oldA);
        if (sol >= 0 && sol <= 1) {
            testSol1 = sol;
        }
    }
    testSol2 = 2;
    // Find the collision point with myNew point, if it exists
    newA = (brushVector[0] * brushVector[0]) + (brushVector[1] * brushVector[1]);
    newB = 2 * (brushVector[0]*(brushOldX - myNewX) + brushVector[1]*(brushOldY - myNewY));
    newC = (brushOldX-myNewX)*(brushOldX-myNewX) + (brushOldY-myNewY)*(brushOldY-myNewY) - (strokeWeight * strokeWeight);
    newRadical = (newB *newB) - 4*newA*newC;
    if (newRadical > 0 && newA != 0) {
        sol = (-1.0*newB - Math.sqrt(newRadical))/(2.0*newA);
        if (sol >= 0 && sol <= 1) {
            testSol2 = sol;
        }
    }
    testSol3 = 2;
    // Find the collision point with the line, if it exists
    flipSign = ((myNewX - myOldX)*(brushOldY - myOldY) - (myNewY - myOldY)*(brushOldX - myOldX) > 0) ? -1 : 1;
    mySegmentLength = dist2D(myOldX, myOldY, myNewX, myNewY);
    transformX = ((myNewY - myOldY)/(mySegmentLength * 1.0)) * flipSign;
    transformY = ((myNewX - myOldX)/(mySegmentLength * 1.0)) * flipSign * -1;
    // Move the line closer to the brushOld point
    adjX1 = myOldX + (transformX*strokeWeight);
    adjY1 = myOldY + (transformY*strokeWeight);
    adjX2 = myNewX + (transformX*strokeWeight);
    adjY2 = myNewY + (transformY*strokeWeight);
    denom = ((adjY2 - adjY1)*(brushNewX - brushOldX)) - ((adjX2 - adjX1)*(brushNewY - brushOldY));
    if (denom != 0) {
        percentA = ((adjX2 - adjX1)*(brushOldY - adjY1) - (adjY2 - adjY1)*(brushOldX-adjX1))/(denom*1.0);
        percentB = ((brushNewX - brushOldX)*(brushOldY - adjY1) - (brushNewY - brushOldY)*(brushOldX - adjX1))/(denom*1.0);
        epsilon = strokeWeight/(brushDist*2.0);
        if (percentA >= (0-epsilon) && percentA <= 1 && percentB >= 0 && percentB <= 1) {
            //if the intersection point is within both strokes
            // we must check that the brush is not drawing away
            denom2 = ((myNewY - myOldY)*(brushNewX - brushOldX)) - ((myNewX - myOldX)*(brushNewY - brushOldY));
            percentC = ((myNewX - myOldX)*(brushOldY - myOldY) - (myNewY - myOldY)*(brushOldX-myOldX))/(denom2*1.0);
            if (percentC > 0){
                testSol3 = percentA;
            }
        }
    }
    minSol = Math.min(testSol1, testSol2, testSol3);
    if (minSol <= 1) {
        collisionPoint[0] = (minSol * brushVector[0]) + brushOldX;
        collisionPoint[1] = (minSol * brushVector[1]) + brushOldY;
    }

    return collisionPoint;
}

function getPushVector(brushOldX, brushOldY, brushNewX, brushNewY, pathParts){
    pushVector = [0,0];
    for (i = 4; i < pathParts.length; i+=3) {
        myNewX = parseFloat(pathParts[i]);
        myNewY = parseFloat(pathParts[i+1]);
        myOldX = parseFloat(pathParts[i-3]);
        myOldY = parseFloat(pathParts[i-2]);

        collisionPoint = getCollisionPoint(brushOldX, brushOldY, brushNewX, brushNewY, myOldX, myOldY, myNewX, myNewY)

        if (collisionPoint[0] != null) {
            testPushVector = [brushNewX - collisionPoint[0], brushNewY - collisionPoint[1]];
            roundedX = (testPushVector[0] < 0) ? Math.floor(testPushVector[0] * 2)/2.0 : Math.ceil(testPushVector[0] * 2)/2.0;
            roundedY = (testPushVector[1] < 0) ? Math.floor(testPushVector[1] * 2)/2.0 : Math.ceil(testPushVector[1] * 2)/2.0;
            if (Math.abs(roundedX) > Math.abs(pushVector[0]) || 
                Math.abs(roundedY) > Math.abs(pushVector[1])) {
                pushVector[0] = roundedX;
                pushVector[1] = roundedY;
            }
        }
    }
    return pushVector;
}

function PushableBrush() {}
//what the brush does when the user first begins drawing
PushableBrush.onStart = function(mouseX, mouseY, currentStroke) {
    currentStroke.path.setAttributeNS(null, "d", "M " + mouseX + " " + mouseY + " L " + mouseX + " " + mouseY);
    currentStroke.path.setAttributeNS(null, "stroke", currentStroke.color);
}
//what the brush does when the user moves the mouse
PushableBrush.onDraw = function(mouseX, mouseY, currentStroke) {
    currentPath = currentStroke.path.getAttributeNS(null, "d");
    newPath = currentPath + " L " + mouseX + " " + mouseY;
    currentStroke.path.setAttributeNS(null, "d", newPath);
}
//for brushes that do something when the user lifts them up
PushableBrush.onEnd = function(mouseX, mouseY, currentStroke) {}
//onStrokeStarts is for brushes that change once per subsequent stroke
PushableBrush.onStrokeStarts  = function(mouseX, mouseY, currentStroke) {
//onStrokes is for brushes that change with every subsequent stroke movement
    currentStroke.prevX = mouseX;
    currentStroke.prevY = mouseY;
    pathParts = currentStroke.path.getAttributeNS(null, "d").split(" ");
    if (!pointWithinStroke(mouseX, mouseY, pathParts)) return;
    pushVector = [0,0];
    foundGoodVector = false;
    bestDistSquared = -1;
    unitVectors = [/* N */ [0, -1], /* NNE */ [0.3826, -0.9239],
                   /* NE */ [0.7071, -0.7071], /* NEE */ [0.9239, -0.3826],
                   /* E */ [1, 0], /* SEE */ [0.9239, 0.3826],
                   /* SE */ [0.7071, 0.7071], /* SSE */ [0.3826, 0.9239],
                   /* S */ [0, 1], /* SSW */ [-0.3826, 0.9239],
                   /* SW */ [-0.7071, 0.7071], /* SWW */ [-0.9239, 0.3826],
                   /* W */ [-1, 0], /* NWW */ [-0.9239, -0.3826],
                   /* NW */ [-0.7071, -0.7071], /* NNW */ [-0.3826, -0.9239]];

    testDist = 1.0;
    while (!foundGoodVector) {
        for (var i = 0; i < 16; i++) {
            testX = mouseX + (testDist * unitVectors[i][0]);
            testY = mouseY + (testDist * unitVectors[i][1]);
            if (pointWithinStroke(testX, testY, pathParts)) {
                continue;
            }
            testPushVector = getPushVector(testX, testY, mouseX, mouseY, pathParts);
            distSquared = (testPushVector[0]*testPushVector[0] + testPushVector[1]*testPushVector[1]);
            if (!foundGoodVector || distSquared < bestDistSquared) {
                foundGoodVector = true;
                bestDistSquared = distSquared;
                pushVector = testPushVector;
            }
        }
        testDist = Math.ceil(testDist * 1.5);
    }
    for (i = 1; i < pathParts.length; i+=3) {
        pathParts[i] = "" + (parseFloat(pathParts[i]) + pushVector[0]);
        pathParts[i+1] = "" + (parseFloat(pathParts[i+1]) + pushVector[1]);
    }
    currentStroke.path.setAttributeNS(null, "d", pathParts.join(" "));
}
PushableBrush.onStrokes  = function(mouseX, mouseY, currentStroke) {
    brushOldX = currentStroke.prevX;
    brushOldY = currentStroke.prevY;
    brushNewX = mouseX;
    brushNewY = mouseY;
    currentStroke.prevX = mouseX;
    currentStroke.prevY = mouseY;
    brushDist = dist2D(brushOldX, brushOldY, brushNewX, brushNewY);
    if (brushDist <= 0) return;
    pathParts = currentStroke.path.getAttributeNS(null, "d").split(" ");
    
    pushVector = getPushVector(brushOldX, brushOldY, brushNewX, brushNewY, pathParts);

    // Actually push the pink
    for (i = 1; i < pathParts.length; i+=3) {
        pathParts[i] = "" + (parseFloat(pathParts[i]) + pushVector[0]);
        pathParts[i+1] = "" + (parseFloat(pathParts[i+1]) + pushVector[1]);
    }
    currentStroke.path.setAttributeNS(null, "d", pathParts.join(" "));
}
PushableBrush.onNonStrokeMove = function(mouseX, mouseY, currentStroke) {}

//END BRUSH DEFINTIONS

function Level(image, goalImg, referenceImg, button, maxStrokes, name) {
    this.image = image;
    this.referenceImg = referenceImg;
    this.goalImg = goalImg;
    this.button = button;
    this.button.onclick = this.selectLevel.bind(this);
    this.maxStrokes = maxStrokes;
    this.name = name;
    if (goalImg != "" && CookieManager.getCookie(this.name) == "complete") {
        this.button.classList.add("completed-level");
    }
}
Level.prototype.selectLevel = function() {
    document.getElementById('level-completion-popup').classList.add('popup-hidden');
    mainCanvas.classList.add('canvas-active');
    drawingCanvas.canvasActive = true;
    background = document.getElementById("level-background");
    background.style.backgroundImage = this.image;
    reference = document.getElementById("reference-image");
    reference.style.backgroundImage = this.referenceImg;
    instruction = document.getElementById("instruction-text");
    if (this.referenceImg != ""){
        instruction.innerHTML = "Draw this:";
        reference.style.display = "block";
        reference.style.backgroundImage = this.referenceImg;
    } else {
        instruction.innerHTML = "Draw whatever you want!";
        reference.style.display = "none";
        reference.style.backgroundImage = null;
    }
    if (drawingCanvas.level != null) {
        drawingCanvas.level.button.classList.remove('selected-level');
    }
    this.button.classList.add('selected-level');
    drawingCanvas.level = this;
    updateCounter();
    clearCanvas();
    this.button.scrollIntoView({behavior: "smooth", block: "nearest"});
}

function Stroke(color, brush) {
    this.color = color;
    this.brush = brush;
    var newPath = document.createElementNS(svgNS, 'path');
    newPath.setAttributeNS(null, "stroke-linejoin", "round");
    newPath.setAttributeNS(null, "stroke-linecap", "round");
    newPath.setAttributeNS(null, "fill", "none");
    newPath.setAttributeNS(null, "stroke-width", "" + strokeWeight);
    this.path = newPath;
}
Stroke.prototype.remove = function() {
    this.path.remove();
}
Stroke.prototype.show = function() {
    mainCanvas.appendChild(this.path);
    if (this.gravityInterval != null) {
        this.gravityInterval = setInterval(function() {
            applyGravity(this);
        }.bind(this), 10);
    }
}
Stroke.prototype.copy = function() {
    var s = new Stroke(this.color, this.brush);
    s.down = this.down;
    s.sticking = this.sticking;
    s.colorNum = this.colorNum;
    if (this.points != undefined)
        s.points = this.points.slice();
    if (this.pointsQueued != undefined)
        s.pointsQueued = this.pointsQueued.slice();
    s.eraseNow = this.eraseNow;
    s.velocity = this.velocity;
    s.endX = this.endX;
    s.endY = this.endY;
    s.lastX = this.lastX;
    s.gravityInterval = this.gravityInterval;
    s.touchingEdge = this.touchingEdge;
    
    var d = this.path.getAttributeNS(null, "d");
    var stroke = this.path.getAttributeNS(null, "stroke");
    s.path.setAttributeNS(null, "d", d);
    s.path.setAttributeNS(null, "stroke", stroke);
    return s;
}

function Tool(color, brush, button) {
    this.color = "#" + color;
    this.brush = brush;
    this.button = button;
    this.button.onclick = this.selectTool.bind(this);
    this.usageCnt = 0;
    this.usagePattern = "";
}
Tool.prototype.selectTool = function() {
    point = buttonToCanvasPoint(this.button);
    drawUnliftableIfDown(point.x, point.y);
    drawingCanvas.currentTool = this;
    currentColorWindow.style.backgroundColor = this.color;
    clearFeedbackMarks();
}


function Toolbar(tools) {
    this.tools = tools;
}

function DrawingCanvas() {
    this.strokes = [];
    this.feedbackMarks = [];
    //this.currentTool = this.toolbar.tools[0]; //start with the first tool selected
    //this.currentTool.button.classList.add('selected-tool-button');
    this.currentlyDrawing = false;
    this.showingFeedback = false;
    this.canvasActive = true;
}
DrawingCanvas.prototype.drawCanvas = function(){
    this.rect = document.createElementNS(svgNS, 'rect'); //Create the rect.
    this.rect.setAttributeNS(null, "x", 0); //Set its attributes.
    this.rect.setAttributeNS(null, "y", 0);
    this.rect.setAttributeNS(null, "width", 640);
    this.rect.setAttributeNS(null, "height", 480);
    this.rect.setAttributeNS(null, "fill", "#fff");
    this.rect.setAttributeNS(null, "pointer-events", "bounding-box");
    this.rect.setAttributeNS(null, "fill-opacity", "0");
    mainCanvas.appendChild(this.rect);
    updateCounter();
}
DrawingCanvas.prototype.startStroke = function(mouseX, mouseY){
    if (this.canvasActive) {
        clearFeedbackMarks();
        this.moveMouse(mouseX, mouseY);
        undoManager.pushCurrent();
        if (!this.currentlyDrawing){
            this.strokes.forEach(function(stroke) { stroke.brush.onStrokeStarts(mouseX, mouseY, stroke) });
            if (drawingCanvas.strokes.length >= 1 &&
                drawingCanvas.strokes[drawingCanvas.strokes.length - 1].brush == UnliftableBrush) {
                lastStroke = drawingCanvas.strokes[drawingCanvas.strokes.length - 1];
                if (lastStroke.down) {
                    lastPath = lastStroke.path.getAttributeNS(null, "d");
                    newPath = lastPath + " L " + mouseX + " " + mouseY;
                    lastStroke.path.setAttributeNS(null, "d", newPath);
                }
            }
            this.currentlyDrawing = true;
            newStroke = new Stroke(this.currentTool.color, this.currentTool.brush);
            this.currentTool.brush.onStart(mouseX, mouseY, newStroke);
            this.strokes.push(newStroke);
            this.currentTool.usageCnt++;
            this.currentTool.usagePattern += "" + this.strokes.length;
            mainCanvas.appendChild(newStroke.path);
            updateCounter();
        }
    }
}
DrawingCanvas.prototype.moveMouse = function(mouseX, mouseY){
    if (this.canvasActive) {
        if (this.currentlyDrawing) {
            this.currentTool.brush.onDraw(mouseX, mouseY, this.strokes[this.strokes.length - 1]);
            this.strokes.forEach(function(stroke) { 
                if (stroke != this.strokes[this.strokes.length - 1]) 
                    { stroke.brush.onStrokes(mouseX, mouseY, stroke) }} .bind(this));
        } else {
            this.strokes.forEach(function(stroke) { stroke.brush.onNonStrokeMove(mouseX, mouseY, stroke) });
        }
    }
}
DrawingCanvas.prototype.endStroke = function(mouseX, mouseY){
    if (this.canvasActive) {
        if (this.currentlyDrawing){
            this.currentlyDrawing = false;
            this.currentTool.brush.onEnd(mouseX, mouseY, this.strokes[this.strokes.length - 1]);
        }
    }
}

onload();