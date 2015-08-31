$(function() {

    // Game mode/state change ----------------------------------------------------------------------------------------------------------
    function modeChange(modeTear, modeBuild) {
        $("body").off();
        modeTear();
        modeBuild();
    }

    function buildTitle() {
        $(".title-screen").delay(500).fadeIn(500);
        startLoop();
        $(window).on("keydown click", titlePress);
    }

    function tearTitle() {
        $(".title-screen").fadeOut(500);
        start_text.stop();
    }

    function buildMenu() {
        $(".menu-screen").delay(500).fadeIn(500);
    }

    function tearMenu() {
        $(".menu-screen").fadeOut(500);
    }

    function buildGame() {
        $(".game-screen").delay(500).fadeIn(500);
    }

    function tearGame() {
        $(".game-screen").fadeOut(500);
    }

    // Title functions ----------------------------------------------------------------------------------------------------------
    function titlePress() {
        modeChange(tearTitle, buildMenu);
    }

    var start_text = $(".title-container p");
    function startLoop() {
        start_text.animate({opacity:'-=0.7'}, 900);
        start_text.animate({opacity:'+=1'}, 900, startLoop);
    }
    buildTitle();

});