$(function() {

    // GAME MODE/STATE CHANGE
    // ----------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------
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

    // TITLE
    // ----------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------
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

    // MENU
    // ----------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------
    function menuPress() {
        modeChange(tearMenu, buildGame);
    }

    // CANVAS
    // ----------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------
    var canvas = new fabric.Canvas('canvas');

    // Resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);

    var frame_rate = 60;
    function resizeCanvas() {
        canvas.setHeight(window.innerHeight);
        canvas.setWidth(window.innerWidth);
        canvas.renderAll();
    }
    resizeCanvas();

    // Physics
    // ----------------------------------------------------------------------------------------------------------
    var angle;
    var degreeInRadians = 2*Math.PI/360;
    var gravitational_constant = 0.20;

    // Shots
    var default_shot = new fabric.Circle({radius: 10, fill: 'yellow', left: 1100, top: 150, selectable: false, velocityX: 0, velocityY: 0, mass: 1});
    var selected_shot = default_shot;

    // Planets
    var test_planet = new fabric.Circle({radius: 100, left: 900, top: 350, selectable: false, velocityX: 0, velocityY: 0, mass: 100000});

    // Stars


    test_planet.setGradient('fill', {
        x1: 0,
        y1: -test_planet.width / 2,
        x2: 0,
        y2: test_planet.width / 2,
        colorStops: {
            0: "green",
            0.7: "green",
            1: "blue"
        }
    });

    canvas.add(selected_shot, test_planet);
    var objects_in_universe = [test_planet];

    function calculateGForce(object) {
        var other_objects = $.grep(objects_in_universe, function(o, i) {
            return o != object;
        });
        var total_x_force = 0, total_y_force = 0;
        for (var index in other_objects) {
            var g_source = other_objects[index];
            var dx = (g_source.left + g_source.radius) - (object.left + object.radius), dy = (g_source.top + g_source.radius) - (object.top + object.radius);
            var hypotenuse = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
            var g_force = (gravitational_constant * g_source.mass) / Math.pow(hypotenuse, 2);
            var x_force = g_force * (dx / hypotenuse), y_force = g_force * (dy / hypotenuse);
            total_x_force += x_force;
            total_y_force += y_force;
        }
        return [total_x_force, total_y_force];
    }

    function updateVelocity(object) {
        var g_forces = calculateGForce(object);
        object.velocityX += g_forces[0];
        object.velocityY += g_forces[1];
        if (object.left + object.velocityX < 0 || object.left + object.velocityX > canvas.width - object.width) {
            object.velocityX = -object.velocityX;
        }
        if (object.top + object.velocityY < 0 || object.top + object.velocityY > canvas.height - object.height) {
            object.velocityY = -object.velocityY;
        }
    }

    function updatePosition(object) {
        object.set({left: object.left + object.velocityX, top: object.top + object.velocityY});
    }

    function animate_loop() {
        for (var index in objects_in_universe) {
            var object = objects_in_universe[index];
            updateVelocity(object);
            updatePosition(object);
        }
        setTimeout(animate_loop, 1000 / frame_rate);
        canvas.renderAll();
    }

    function fire(object) {
        var power = Number($(".power").text());
        angle = Number($(".aim").text().substring(0, $(".aim").text().length - 1));
        object.velocityX = Math.cos(degreeInRadians * angle) * ((power * 5)/frame_rate);
        object.velocityY = Math.sin(degreeInRadians * angle) * ((power * 5)/frame_rate);

        objects_in_universe.push(object);
    }

    // GAME UI
    // ----------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------
    $(".fire-button").on('click', function() {
        fire(selected_shot);
    });

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
        $(".fire-button").off();
        $(window)
            .on('mousewheel DOMMouseScroll', aimWheel)
            .on("keydown", aimKeyPress);
    }

    function confirmAim() {
        $(".aim").stop().animate({"font-size": 14}, 200);
        $(window).off("click", confirmAim).off("mousewheel DOMMouseScroll", aimWheel).off("keydown", aimKeyPress);
        $(".aim-button").on("click", setAim).stop().animate({"width": 35, backgroundColor: "#1f1f1f"}, 150, paramHover);
        $(".fire-button").on('click', function() {
            fire(selected_shot);
        });
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
        $(".fire-button").off();
        $(window)
            .on('mousewheel DOMMouseScroll', powerWheel)
            .on("keydown", powerKeyPress)
    }

    function confirmPower() {
        $(".power").stop().animate({"font-size": 14}, 200);
        $(window).off("click", confirmPower).off("mousewheel DOMMouseScroll", powerWheel).off("keydown", powerKeyPress);
        $(".power-button").on("click", setPower).stop().animate({"width": 35, backgroundColor: "#1f1f1f"}, 150, paramHover);
        $(".fire-button").on('click', function() {
            fire(selected_shot);
        });
    }

    $(".aim-button").on("click", setAim);
    $(".power-button").on("click", setPower);
    paramHover();




    modeChange(tearTitle, buildGame);
    animate_loop();
});