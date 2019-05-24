function viewMap(options) {
    var vm = this;
    var paper, root;
    var mapData;
    var scaleBigNum = 1.25;
    var scaleSmallNum = 0.8;
    var totalScaleNum = 1; //累计缩放
    var lastdx = 0; //最后一次拖拽发生的位移
    var lastdy = 0;
    var totaldx = 0; //累计拖拽发生的位移
    var totaldy = 0;
    var mapId = "map";
    var width = 800;
    var height = 500;
    if (options) {
        if (options.mapId) {
            mapId = options.mapId;
        }
        if (options.width) {
            width = options.width;
        }
        if (options.height) {
            height = options.height;
        }
    }
    document.getElementById(mapId).style.width = width + "px";
    document.getElementById(mapId).style.height = height + "px";

    this.init = function (_mapData) {
        if (paper != null) {
            paper.clear();
            paper.remove();
            paper = null;
        }
        paper = Raphael(mapId, width, height);
        mapData = _mapData;
        window.onmousewheel = this.addMousewheelEvent;
        if (document.addEventListener) {
            document.addEventListener('DOMMouseScroll', this.addMousewheelEvent, false);
        }
        root = paper.image(mapData.bgImage, 0, 0, mapData.width, mapData.height);
        this.addMouseDragEvent(root);
        this.createMap();
        //根据地图的大小进行缩放
        var scaleWidthRange = width / mapData.width;
        var scaleHeightRange = height / mapData.height;
        var scaleRange = (scaleWidthRange < scaleHeightRange) ? scaleWidthRange : scaleHeightRange;
        this.triggerMousewheelEvent(scaleRange);
    }

    this.createMap = function () {
        for (var i = 0; i < mapData.areas.length; i++) {
            var area = mapData.areas[i];
            this.createPath(area);
        }
    }

    this.createPath = function (area) {
        var pathData = [];
        var points = area.points;
        for (var i = 0; i < points.length; i++) {
            var c = ((i == 0) ? "M" : "L");
            var x = points[i][0];
            var y = points[i][1];
            pathData.push([c, x, y]);
        }
        pathData.push(["Z"]);
        var path = paper.path(pathData);
        path.attr({
            "fill": "#ddd",
            "fill-opacity": 0.2
        });
        this.addMouseHoverEvent(path);
        this.addMouseClickEvent(path, area);
    }

    this.addMousewheelEvent = function (e) {
        e = e || window.event;
        var scale = e.wheelDelta || detail;
        if (scale > 0) { // ↑
            vm.triggerMousewheelEvent(scaleBigNum);
        } else if (scale < 0) {
            vm.triggerMousewheelEvent(scaleSmallNum);
        }
    }

    this.addMouseClickEvent = function (el, area) {
        el.click(function (e) {
            if (options && options.onClick) {
                options.onClick(area.name);
            }
        });
    }

    this.addMouseDragEvent = function (el) {
        el.drag(function (dx, dy, x, y, e) {
            //onmove
            vm.triggerMouseDragEvent(dx - lastdx, dy - lastdy);
            lastdx = dx;
            lastdy = dy;
        }, function (x, y, e) {
            //onstart
            lastdx = 0;
            lastdy = 0;
        }, function (e) {
            //onend
        });
    }

    this.addMouseHoverEvent = function (el) {
        el.hover(function () {
            el.attr({
                "fill": "#5bc0de",
                "fill-opacity": 0.6
            });
        }, function () {
            el.attr({
                "fill": "#ddd",
                "fill-opacity": 0.2
            });
        });
    }

    this.triggerMousewheelEvent = function (scaleNum) {
        totalScaleNum *= scaleNum;
        var str = "...s" + scaleNum + "," + scaleNum + "," + totaldx + "," + totaldy;
        paper.forEach(function (el) {
            el.transform(str);
        });
    }

    this.triggerMouseDragEvent = function (relativedx, relativedy) {
        relativedx /= totalScaleNum;
        relativedy /= totalScaleNum;
        totaldx -= relativedx;
        totaldy -= relativedy;
        paper.forEach(function (el) {
            var str = "...t" + relativedx + "," + relativedy;
            el.transform(str);
        });
    }

}