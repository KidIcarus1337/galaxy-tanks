$(function() {

    // Game mode/state change ----------------------------------------------------------------------------------------------------------
    function modeChange(tearMode, buildMode) {
        $(window, "*").off();
        tearMode();
        buildMode();
    }

    function buildTitle() {
        $(".title-screen").delay(500).fadeIn(500, function() {
            $(window).on("keydown click", titlePress);
        });
        stop_loop = false;
        titleTextLoop();
    }

    function tearTitle() {
        $(".title-screen").fadeOut(500);
        stop_loop = true;
        title_text.stop(true, true);
    }

    function buildMenu() {
        $(".menu-screen").delay(500).fadeIn(500, function() {
            $(window).keyup(function(e) {
                if (e.keyCode == 27) {
                    modeChange(tearMenu, buildTitle);
                } else if (e.keyCode == 13) {
                    modeChange(tearMenu, buildGame);
                }
            });
            $(".menu-button").click(menuPress);
        });
    }

    function tearMenu() {
        $(".menu-screen").fadeOut(500);
    }

    function buildGame() {
        $(".game-screen").delay(500).fadeIn(500, function() {
//            drawStuff();
//            window.addEventListener("click", bounce);
        });
    }

    function tearGame() {
        $(".game-screen").fadeOut(500);
    }

    // Title functions ----------------------------------------------------------------------------------------------------------
    function titlePress() {
        modeChange(tearTitle, buildMenu);
    }

    var stop_loop;
    var title_text = $(".title-container p");
    function titleTextLoop() {
        title_text.animate({opacity:'0.25'}, 900, function() {
            title_text.animate({opacity:'1'}, 900, function() {
                if (stop_loop !== true) {
                    titleTextLoop();
                }
            });
        });
    }

    // Menu functions ----------------------------------------------------------------------------------------------------------
    function menuPress() {
        modeChange(tearMenu, buildGame);
    }

    // Canvas functions ----------------------------------------------------------------------------------------------------------
    var canvas = new fabric.Canvas('canvas');

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
        canvas.setHeight(window.innerHeight);
        canvas.setWidth(window.innerWidth);
        canvas.renderAll();
    }
    resizeCanvas();

    var circle1 = new fabric.Circle({radius: 20, fill: '#FF5354', left: 800, top: 300, selectable: false}),
        circle2 = new fabric.Circle({radius: 20, fill: '#761DFF', left: 100, top: 100, selectable: false}),
        circle3 = new fabric.Circle({radius: 20, fill: '#00FF03', left: 900, top: 600, selectable: false}),
        circle4 = new fabric.Circle({radius: 20, fill: '#00FFFA', left: 1500, top: 650, selectable: false}),
        circle5 = new fabric.Circle({radius: 20, fill: '#FF8C02', left: 50, top: 680, selectable: false}),
        circle6 = new fabric.Circle({radius: 20, fill: '#FF1269', left: 1200, top: 50, selectable: false}),
        circle7 = new fabric.Circle({radius: 20, fill: '#8799FF', left: 300, top: 300, selectable: false}),
        circle8 = new fabric.Circle({radius: 20, fill: '#E9FFF8', left: 450, top: 400, selectable: false}),
        circle9 = new fabric.Circle({radius: 20, fill: '#000EFF', left: 950, top: 200, selectable: false}),
        circle10 = new fabric.Circle({radius: 20, fill: '#BBFF5E', left: 600, top: 700, selectable: false});
    canvas.add(circle1, circle2, circle3, circle4, circle5, circle6, circle7, circle8, circle9, circle10);

    canvas.on('mouse:down', function(options) {
        for (var e=0; e<10; e+=1) {
            var one_of_four = Math.floor((Math.random() * 4) + 1);
            if (one_of_four == 1) {
                canvas.item(e).animate('left', (options.e.clientX - Math.floor((Math.random() * 200) + 1)), { onChange: canvas.renderAll.bind(canvas) });
                canvas.item(e).animate('top', (options.e.clientY - Math.floor((Math.random() * 200) + 1)), { onChange: canvas.renderAll.bind(canvas) });
            } else if (one_of_four == 2) {
                canvas.item(e).animate('left', (options.e.clientX + Math.floor((Math.random() * 200) + 1)), { onChange: canvas.renderAll.bind(canvas) });
                canvas.item(e).animate('top', (options.e.clientY + Math.floor((Math.random() * 200) + 1)), { onChange: canvas.renderAll.bind(canvas) });
            } else if (one_of_four == 3) {
                canvas.item(e).animate('left', (options.e.clientX + Math.floor((Math.random() * 200) + 1)), { onChange: canvas.renderAll.bind(canvas) });
                canvas.item(e).animate('top', (options.e.clientY - Math.floor((Math.random() * 200) + 1)), { onChange: canvas.renderAll.bind(canvas) });
            } else if (one_of_four == 4) {
                canvas.item(e).animate('left', (options.e.clientX - Math.floor((Math.random() * 200) + 1)), { onChange: canvas.renderAll.bind(canvas) });
                canvas.item(e).animate('top', (options.e.clientY + Math.floor((Math.random() * 200) + 1)), { onChange: canvas.renderAll.bind(canvas) });
            }
        }
    });

    buildTitle();
});