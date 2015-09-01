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
            $(".menu-button").click(function() {
                modeChange(tearMenu, buildGame);
            });
        });
    }

    function tearMenu() {
        $(".menu-screen").fadeOut(500);
    }

    function buildGame() {
        $(".game-screen").delay(500).fadeIn(500, function() {

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
    buildTitle();

    // Menu functions ----------------------------------------------------------------------------------------------------------
    function menuPress() {
        modeChange(tearMenu, buildGame);
    }

    // Canvas functions ----------------------------------------------------------------------------------------------------------
    var canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d');

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        /**
         * Your drawings need to be inside this function otherwise they will be reset when
         * you resize the browser window and the canvas goes will be cleared.
         */
        drawStuff();
    }
    resizeCanvas();

    function drawStuff() {
        // do your drawing stuff here
    }
});