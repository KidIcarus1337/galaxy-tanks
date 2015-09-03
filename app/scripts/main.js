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

    // Title ----------------------------------------------------------------------------------------------------------
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

    // Menu ----------------------------------------------------------------------------------------------------------
    function menuPress() {
        modeChange(tearMenu, buildGame);
    }

    // Canvas ----------------------------------------------------------------------------------------------------------
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

    var ball = new fabric.Circle({radius: 20, fill: '#FF5354', left: 50, top: 50, selectable: false});
    var angle;
    var degreeInRadians = 2*Math.PI/360;
    var realX = 0, realY = 0;

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

//    var ball_x = realX, ball_y = realY;

    function draw(power, x, y) {
        if (stopBallBool != true) {
            power = Number($(".power").text());
            moveTo(x, y);
            canvas.renderAll();
            setTimeout(function () {
                changeDirectionIfNecessary(x, y);
                draw(power, x + ball.dx * ((power * 7)/frame_rate), y + ball.dy * ((power * 7)/frame_rate));
            }, 1000 / frame_rate);
        } else {
            $(".fire-button").on('click', fire).off("click", stopBall);

        }
    }

    canvas.add(ball);

    var stopBall;
    var stopBallBool;

    function fire() {
        angle = Number($(".aim").text().substring(0, $(".aim").text().length - 1));

        realX = realX + Math.cos(degreeInRadians * angle);
        realY = realY + Math.sin(degreeInRadians * angle);
        console.log(ball.dx, realX);
        if (ball.dx == undefined || ball.dy == undefined) {
            ball.set({dx: realX, dy: realY});
            console.log("blah");
        }


        stopBallBool = false;
        var power = Number($(".power").text());
        draw(power, realX, realY);
        $(".fire-button").off();
        stopBall = function() {
            stopBallBool = true;
        };
        setTimeout(function() {
            $(".fire-button").on("click", stopBall);
        }, 50);
    }

    $(".fire-button").on('click', fire);

    // Game UI ----------------------------------------------------------------------------------------------------------
    function paramHover() {
        $(".param-button").hover(function() {
            $(this).stop().animate({backgroundColor: "#414141"}, 150)
        }, function() {
            $(this).stop().animate({backgroundColor: "#1f1f1f"}, 150)
        });
    }

    var aimKeyPress;
    var aimWheel;

    function setAim() {
        $(".aim").stop().animate({"font-size": 30}, 200);
        $(".aim-button").animate({"width": 100, backgroundColor: "#414141"}, 200).off();
        setTimeout(function() {
            $(window).on("click", confirmAim);
        }, 50);
        var keyPressed = false;
        aimKeyPress = function(e) {
            key = e.keyCode || e.charCode;
            var aim;
            if ((key >= 48 || key >= 48) && (key <= 57 || key <= 48)) {
                if (keyPressed == false) {
                    aim = 0;
                    keyPressed = true;
                } else {
                    aim = Number($(".aim").text().substring(0, $(".aim").text().length - 1));
                }
                if (((aim * 10) + (key - 48)) <= 360) {
                    $(".aim").text((aim * 10) + (key - 48) + "˚");
                }
            } else if (key == 38) {
                aim = Number($(".aim").text().substring(0, $(".aim").text().length - 1));
                $(".aim").text(aim + 1  + "˚");
            } else if (key == 40) {
                aim = Number($(".aim").text().substring(0, $(".aim").text().length - 1));
                $(".aim").text(aim - 1  + "˚");
            }
        };
        aimWheel = function(event) {
            var aim = Number($(".aim").text().substring(0, $(".aim").text().length - 1));
            if ((event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) && (aim + 1) <= 360) {
                $(".aim").text(aim + 1  + "˚");
            }
            else if ((aim + 1) >= 2) {
                $(".aim").text(aim - 1  + "˚");
            }
            keyPressed = false;
        };
        $(window)
            .on('mousewheel DOMMouseScroll', aimWheel)
            .on("keydown", aimKeyPress);
    }

    function confirmAim() {
        $(".aim").stop().animate({"font-size": 14}, 200);
        $(window).off("click", confirmAim).off("mousewheel DOMMouseScroll", aimWheel).off("keydown", aimKeyPress);
        $(".aim-button").on("click", setAim).stop().animate({"width": 35, backgroundColor: "#1f1f1f"}, 150, paramHover);
    }

    var powerKeyPress;
    var powerWheel;

    function setPower() {
        $(".power").stop().animate({"font-size": 30}, 200);
        $(".power-button").animate({"width": 100, backgroundColor: "#414141"}, 200).off();
        setTimeout(function() {
            $(window).on("click", confirmPower);
        }, 50);
        var keyPressed = false;
        powerKeyPress = function(e) {
            key = e.keyCode || e.charCode;
            var power;
            if ((key >= 48 || key >= 48) && (key <= 57 || key <= 48)) {
                if (keyPressed == false) {
                    power = 0;
                    keyPressed = true;
                } else {
                    power = Number($(".power").text());
                }
                if (((power * 10) + (key - 48)) <= 100) {
                    $(".power").text((power * 10) + (key - 48));
                }
            } else if (key == 38) {
                power = Number($(".power").text());
                $(".power").text(power + 1);
            } else if (key == 40) {
                power = Number($(".power").text());
                $(".power").text(power - 1);
            }
        };
        powerWheel = function(event) {
            var power = Number($(".power").text());
            if ((event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) && (power + 1) <= 100) {
                $(".power").text(power + 1);
            }
            else if ((power + 1) >= 3) {
                $(".power").text(power - 1);
            }
            keyPressed = false;
        };
        $(window)
            .on('mousewheel DOMMouseScroll', powerWheel)
            .on("keydown", powerKeyPress)
    }

    function confirmPower() {
        $(".power").stop().animate({"font-size": 14}, 200);
        $(window).off("click", confirmPower).off("mousewheel DOMMouseScroll", powerWheel).off("keydown", powerKeyPress);
        $(".power-button").on("click", setPower).stop().animate({"width": 35, backgroundColor: "#1f1f1f"}, 150, paramHover);
    }

    $(".aim-button").on("click", setAim);
    $(".power-button").on("click", setPower);
    paramHover();




    modeChange(tearTitle, buildGame);
});