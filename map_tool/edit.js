var winWidth = window.innerWidth,
    winHeight = window.innerHeight,
    paperX, paperY, paperW, paperH;
var paper, root;
var drawing = false;
var mapData = {}; //地图数据
var curArea = {}; //当前区域
var tempPath; //当前path
//
var scaleBigNum = 1.25;
var scaleSmallNum = 0.8;
var totalScaleNum = 1; //累计缩放
var lastdx = 0; //最后一次拖拽发生的位移
var lastdy = 0;
var totaldx = 0; //累计拖拽发生的位移
var totaldy = 0;
var transformData = []; //缩放和位移数值顺序集合

function initConfig() {
    document.getElementById("container").style.height = winHeight + "px";
    paperX = parseFloat(winWidth / 6) + 4;
    paperY = 50;
    paperW = winWidth - paperX;
    paperH = winHeight - paperY;

    window.onmousewheel = mousewheelEvent;
    if (document.addEventListener) {
        document.addEventListener('DOMMouseScroll', mousewheelEvent, false);
    }
}

function newMap() {
    var val = prompt("地图名称");
    if (val) {
        mapData = {
            name: val,
            width: paperW,
            height: paperH,
            bgImage: "paper.jpg",
            areas: []
        };
        createPaper();
        writeToLog();
    }
}

function setBGImage() {
    var val = prompt("背景图片", "henan.jpg");
    if (val) {
        var img = new Image();
        img.src = val;
        img.onload = function () {
            mapData.bgImage = val;
            mapData.width = img.width;
            mapData.height = img.height;　　　　
            root.attr({
                "src": val,
                "width": img.width,
                "height": img.height
            });
            writeToLog();
        }
    }
}

function newArea() {
    var val = prompt("区域名称");
    if (val) {
        drawing = true;
        curArea.name = val;
        curArea.points = [];
        mapData.areas.push(curArea);
        writeToLog();
    }
}

function saveArea() {
    resetTransformPois();
    clearTransformData();
    writeToLog();
    loadMap();
    localStorage.setItem("mapData", JSON.stringify(mapData));
    drawing = false;
}

function clearTransformData() {
    lastdx = 0;
    lastdy = 0;
    totaldx = 0;
    totaldy = 0;
    totalScaleNum = 1;
    transformData = [];
}

function loadMap() {
    mapData = JSON.parse(document.getElementById("item-log").value);
    createPaper();
    for (var i = 0; i < mapData.areas.length; i++) {
        var area = mapData.areas[i];
        curArea.points = [];
        for (var j = 0; j < area.points.length; j++) {
            var x = area.points[j][0];
            var y = area.points[j][1];
            var circle = createCircle(x, y);
            addMouseEvent(circle, "circle");
            curArea.points.push([x, y]);
        }
        createPath();
    }
}

function writeToLog() {
    document.getElementById("item-log").value = JSON.stringify(mapData, null, 4);
}

function previewMap() {
    window.open("preview.html");
}

function createPaper() {
    curArea = {};
    if (paper != null) {
        paper.clear();
        paper.remove();
        paper = null;
    }
    paper = Raphael(paperX, paperY, paperW, paperH);
    root = paper.image(mapData.bgImage, 0, 0, mapData.width, mapData.height);
    addMouseEvent(root, "root");
}

function mousewheelEvent(e) {
    e = e || window.event;
    var scale = e.wheelDelta || detail;
    if (scale > 0) { // ↑
        zoomPaper(scaleBigNum);
    } else if (scale < 0) {
        zoomPaper(scaleSmallNum);
    }
}

function zoomPaper(scaleNum) {
    if (!drawing) {
        totalScaleNum *= scaleNum;
        transformData.push({
            type: "s",
            scaleNum: scaleNum
        });
        var str = "...s" + scaleNum + "," + scaleNum + "," + totaldx + "," + totaldy;
        paper.forEach(function (el) {
            el.transform(str);
        });
    }
}

//relativedx：相对上次偏移距离
function dragPaper(relativedx, relativedy) {
    if (!drawing) {
        transformData.push({
            type: "t",
            relativedx: relativedx,
            relativedy: relativedy
        });

        relativedx = relativedx / totalScaleNum;
        relativedy = relativedy / totalScaleNum;
        totaldx -= relativedx;
        totaldy -= relativedy;
        paper.forEach(function (el) {
            var str = "...t" + relativedx + "," + relativedy;
            el.transform(str);
        });
    }
}

function addMouseEvent(el, dype) {
    el.click(function (ev) {
        var poi = {};
        if (dype == "root") {
            poi.x = ev.offsedx || ev.layerX;
            poi.y = ev.offsedy || ev.layerY;
        } else if (dype == "circle") {
            poi.x = el.attrs.cx;
            poi.y = el.attrs.cy;
        } else if (dype == "path") {
            poi.x = ev.offsedx || ev.layerX;
            poi.y = ev.offsedy || ev.layerY;
        }
        callbackClick(poi);
    });
    if (dype == "circle") {
        el.hover(function () {
            el.attr({
                "r": 8
            });
        }, function () {
            el.attr({
                "r": 3
            });
        });
    } else if (dype == "path") {
        el.hover(function () {
            el.attr({
                "stroke-width": 6
            });
        }, function () {
            el.attr({
                "stroke-width": 1
            });
        });
    } else if (dype == "root") {
        root.drag(function (dx, dy, x, y, e) { //onmove
            dragPaper(dx - lastdx, dy - lastdy);
            lastdx = dx;
            lastdy = dy;
        }, function (x, y, e) { //onstart
            lastdx = 0;
            lastdy = 0;
        }, function (e) { //onend
        });
    }
}

function callbackClick(poi) {
    if (!curArea.name) {
        //alert("先创建区域");
        return false;
    }
    var x = poi.x;
    var y = poi.y;
    var circle = createCircle(x, y);
    addMouseEvent(circle, "circle");
    curArea.points.push([x, y]);
    createTemplatePath();
    writeToLog();
}

function createCircle(x, y) {
    var circle = paper.circle(x, y, 3);
    circle.attr({
        "stroke-width": 0,
        "fill": "#000"
    });
    return circle;
}

function createTemplatePath() {
    var pathData = [];
    var points = curArea.points;
    for (var i = 0; i < points.length; i++) {
        var c = ((i == 0) ? "M" : "L");
        var x = parseInt(points[i][0]);
        var y = parseInt(points[i][1]);
        pathData.push([c, x, y]);
    }
    if (tempPath != null) {
        tempPath.remove();
    };
    tempPath = paper.path(pathData);
    tempPath.attr({
        "stroke": "#ca2fa8"
    });
}

function createPath() {
    var pathData = [];
    var points = curArea.points;
    for (var i = 0; i < points.length; i++) {
        var c = ((i == 0) ? "M" : "L");
        var x = points[i][0];
        var y = points[i][1];
        pathData.push([c, x, y]);
    }
    pathData.push(["Z"]);
    paper.path(pathData);
}

function resetTransformPois() {
    var points = [];
    for (var i = 0; i < curArea.points.length; i++) {
        points.push(getOriginalPoi(curArea.points[i]));
    }
    curArea.points = points;
}

function getOriginalPoi(poi) {
    for (var i = transformData.length - 1; i >= 0; i--) {
        var type = transformData[i].type;
        if (type == "s") {
            poi[0] /= transformData[i].scaleNum;
            poi[1] /= transformData[i].scaleNum;
        } else if (type == "t") {
            poi[0] -= transformData[i].relativedx;
            poi[1] -= transformData[i].relativedy;
        }
    }
    return poi;
}
initConfig();