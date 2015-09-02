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

    var frame_rate = 60;
    function resizeCanvas() {
        canvas.setHeight(window.innerHeight);
        canvas.setWidth(window.innerWidth);
        canvas.renderAll();
    }
    resizeCanvas();

    var ball = new fabric.Circle({radius: 20, fill: '#FF5354', left: 50, top: 50, selectable: false, dx: 4, dy: 3});

    function moveTo(x, y) {
        ball.set({left: x, top: y});
    }
    function changeDirectionIfNecessary(x, y) {
        if (x < 0 || x > canvas.width - ball.width) {
            ball.dx = -ball.dx;
        }
        if (y < 0 || y > canvas.height - ball.height) {
            ball.dy = -ball.dy;
        }
    }
    function draw(x, y) {
        moveTo(x, y);
        canvas.renderAll();
        setTimeout(function () {
            changeDirectionIfNecessary(x, y);
            draw(x + ball.dx * (60/frame_rate), y + ball.dy * (60/frame_rate));
        }, 1000 / frame_rate);
    }

    canvas.add(ball);

    canvas.on('mouse:down', function(options) {
        draw(0, 0);
    });

    buildTitle();
});