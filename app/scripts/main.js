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

    function resizeCanvas() {
        canvas.setHeight(window.innerHeight);
        canvas.setWidth(window.innerWidth);
        canvas.renderAll();
    }
    resizeCanvas();

    // Physics
    // ----------------------------------------------------------------------------------------------------------
    var FRAME_RATE = 120;
    var GAME_SPEED = 1;
    var GAME_TIME_UNIT = (60 / FRAME_RATE) * GAME_SPEED;

    var current_angle = function() {
        return Number($(".aim").text().substring(0, $(".aim").text().length - 1))
    };
    var angle = current_angle();
    var power;
    var DEGREE_IN_RADIANS = 2*Math.PI/360;

    var GRAVITATIONAL_CONSTANT = 0.2;
    fabric.Object.prototype.realX = function() {
        return this.left + this.radius;
    };
    fabric.Object.prototype.realY = function() {
        return this.top + this.radius;
    };
    fabric.Object.prototype.calculateGForce = function(objects_in_universe) {
        var self = this;
        var other_objects = $.grep(objects_in_universe, function(o, i) {
            return o != self;
        });
        var total_x_force = 0, total_y_force = 0;
        for (var index in other_objects) {
            var g_source = other_objects[index];
            var distance = distanceBetween(g_source, this);
            // Check if any two objects ever occupy the same position at any given time so as to avoid crashing the program via dividing by zero
            if (distance == 0) {
                return [0, 0];
            }
            var dx = (g_source.realX()) - (this.realX()), dy = (g_source.realY()) - (this.realY());
            var g_force = (GRAVITATIONAL_CONSTANT * g_source.mass) / Math.pow(distance, 2);
            var x_force = g_force * (dx / distance), y_force = g_force * (dy / distance);
            total_x_force += x_force;
            total_y_force += y_force;
        }
        return [total_x_force, total_y_force];
    };

    // Players
    var playerPerimeter = fabric.util.createClass(fabric.Circle, {
        type: "playerPerimeter",

        initialize: function(options) {
            options || (options = { });
            this.callSuper('initialize', options);
        },

        _render: function(ctx) {
            this.callSuper('_render', ctx);
        }
    });
    var playerBody = fabric.util.createClass(fabric.Circle, {
        type: "playerBody",

        initialize: function(options) {
            options || (options = { });
            this.callSuper('initialize', options);
        },

        _render: function(ctx) {
            this.callSuper('_render', ctx);
        }
    });
    var playerTurret = fabric.util.createClass(fabric.Line, {
        type: "playerTurret",

        initialize: function(points, options) {
            options || (options = { });
            this.callSuper('initialize', points, options);
        },

        _render: function(ctx) {
            this.callSuper('_render', ctx);
        }
    });
    var Player = fabric.util.createClass(fabric.Group, {
        type: "Player",

        initialize: function(objects, options) {
            options || (options = { });
            this.callSuper('initialize', objects, options);
        },

        _render: function(ctx) {
            this.callSuper('_render', ctx);
        },

        calculateGForce: function() {
            return [0, 0];
        }
    });

    var TURRET_LENGTH = 30,
        turret_cos = function(angle) {
            return TURRET_LENGTH * (Math.cos(DEGREE_IN_RADIANS * angle));
        },
        turret_sin = function(angle) {
            return TURRET_LENGTH * (Math.sin(DEGREE_IN_RADIANS * angle));
        };
    var p1_group_perimeter = new fabric.Circle({radius: TURRET_LENGTH, fill: "white", selectable: false, originX: "center", originY: "center"});
    var p1_body = new playerBody({radius: 20, fill: "blue", selectable: false, originX: "center", originY: "center"});
    var p1_turret = new playerTurret([0, 0, turret_cos(current_angle()), turret_sin(current_angle())], {fill: "grey", stroke: "grey", strokeWidth: 2, selectable: false, originX: "center", originY: "center"});
    var player_1 = new Player([p1_group_perimeter, p1_body, p1_turret], {radius: 30, colRadius: 20, left: 500, top: 400, selectable: false, velocityX: 0, velocityY: 0, mass: 0});

    var p2_group_perimeter = new fabric.Circle({radius: TURRET_LENGTH, selectable: false, originX: "center", originY: "center"});
    var p2_body = new playerBody({radius: 20, fill: "red", selectable: false, originX: "center", originY: "center"});
    var p2_turret = new playerTurret([0, 0, turret_cos(current_angle()), turret_sin(current_angle())], {fill: "grey", stroke: "grey", strokeWidth: 2, selectable: false, originX: "center", originY: "center"});
    var player_2 = new Player([p2_group_perimeter, p2_body, p2_turret], {radius: 30, colRadius: 20, left: 1300, top: 400, selectable: false, velocityX: 0, velocityY: 0, mass: 0});

    // Shots
    var Shot = fabric.util.createClass(fabric.Circle, {
        type: "Shot",

        initialize: function(options) {
            options || (options = { });
            this.callSuper('initialize', options);
        },

        _render: function(ctx) {
            this.callSuper('_render', ctx);
        }
    });
    var noGravityShot = fabric.util.createClass(Shot, {
        type: "Shot",

        initialize: function(options) {
            options || (options = { });
            this.callSuper('initialize', options);
        },

        _render: function(ctx) {
            this.callSuper('_render', ctx);
        },

        calculateGForce: function() {
            return [0, 0];
        }
    });
    var antiGravityShot = fabric.util.createClass(Shot, {
        type: "Shot",

        initialize: function(options) {
            options || (options = { });
            this.callSuper('initialize', options);
        },

        _render: function(ctx) {
            this.callSuper('_render', ctx);
        },

        calculateGForce: function() {
            var total_force  = Shot.prototype.calculateGForce.call(this, objects_in_universe);
            return [-total_force[0], -total_force[1]];
        }
    });
    var shotMap = {
        "NORMAL SHOT": function(player_turret) {
            return new Shot({radius: 2, colRadius: 2, fill: 'yellow', left: player_turret[0], top: player_turret[1], selectable: false, velocityX: 0, velocityY: 0, mass: 1})
        },
        "NO-GRAVITY SHOT": function(player_turret) {
            return new noGravityShot({radius: 2, colRadius: 2, fill: 'red', left: player_turret[0], top: player_turret[1], selectable: false, velocityX: 0, velocityY: 0, mass: 1})
        },
        "ANTI-GRAVITY SHOT": function(player_turret) {
            return new antiGravityShot({radius: 2, colRadius: 2, fill: 'green', left: player_turret[0], top: player_turret[1], selectable: false, velocityX: 0, velocityY: 0, mass: 1})
        }
    };
    var shot;
    var selected_shot;
    function addShot(selected_shot) {
        var player_turret = [player_1.realX() + p1_turret.x2, player_1.realY() + p1_turret.y2];
        shot = shotMap[selected_shot](player_turret);
    }

    // Planets
    var Planet = fabric.util.createClass(fabric.Circle, {
        type: "Planet",

        initialize: function(options) {
            options || (options = { });
            this.callSuper('initialize', options);
        },

        _render: function(ctx) {
            this.callSuper('_render', ctx);
        }
    });
    var test_planet = new Planet({radius: 100, colRadius: 100, left: 900, top: 350, selectable: false, velocityX: 0, velocityY: 0, mass: 100000});
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

    // Stars


    // Object interactions and relations
    canvas.add(test_planet, player_1, player_2);
    var objects_in_universe = [test_planet, player_1, player_2];

    function distanceBetween(object1, object2) {
        var dx = (object1.realX()) - (object2.realX()), dy = (object1.realY()) - (object2.realY());
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    }

    function updateVelocity(object) {
        var g_forces = object.calculateGForce(objects_in_universe);
        object.velocityX = object.velocityX + (g_forces[0] * GAME_TIME_UNIT);
        object.velocityY = object.velocityY + (g_forces[1] * GAME_TIME_UNIT);
        if (object.left + object.velocityX < 0 || object.left + object.velocityX > canvas.width - object.width) {
            object.velocityX = -object.velocityX;
        }
        if (object.top + object.velocityY < 0 || object.top + object.velocityY > canvas.height - object.height) {
            object.velocityY = -object.velocityY;
        }
    }

    function updatePosition(object) {
        object.set({left: object.left + object.velocityX * GAME_TIME_UNIT, top: object.top + object.velocityY * GAME_TIME_UNIT});
    }

    var objects_to_remove = [];

    var damage = 0;
    function checkCollision(object) {
        var other_objects = $.grep(objects_in_universe, function(o, i) {
            return o != object;
        });
        for (var index in other_objects) {
            var opposing_obj = other_objects[index];
            var distance = distanceBetween(opposing_obj, object);
            if ((opposing_obj.colRadius + object.colRadius) > distance && object.type == "Shot" && (opposing_obj.type == "Player" || opposing_obj.type == "Planet")) {
                objects_to_remove.push(object);
                if (opposing_obj.type == "Player") {
                    damage += 1;
                    if (damage == 3) {
                        alert("GG It's like coffeezilla!")
                    }
                }
            }
        }
    }

    function animateLoop() {
        for (var index in objects_in_universe) {
            var object = objects_in_universe[index];
            checkCollision(object);
            updateVelocity(object);
            updatePosition(object);
        }
        if (objects_to_remove != []) {
            for (var i in objects_to_remove) {
                var object_to_remove = objects_to_remove[i];
                objects_in_universe.splice($.inArray(object_to_remove, objects_in_universe), 1);
                canvas.remove(object_to_remove);
            }
            objects_to_remove = [];
        }
        canvas.renderAll();
        setTimeout(animateLoop, 1000 / FRAME_RATE);
    }

    function fire(selected_shot) {
        addShot(selected_shot);
        canvas.add(shot);
        power = Number($(".power").text());
        angle = current_angle();
        shot.velocityX = Math.cos(DEGREE_IN_RADIANS * angle) * ((power / 10));
        shot.velocityY = Math.sin(DEGREE_IN_RADIANS * angle) * ((power / 10));
        objects_in_universe.push(shot);
    }

    // GAME UI
    // ----------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------
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
            $(window).on("click", confirmAim).on("keydown", function(e) {
                key = e.keyCode || e.charCode;
                if (key == 13) {
                    confirmAim();
                }
            });
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
                    aim = current_angle();
                }
                if (((aim * 10) + (key - 48)) <= 360) {
                    $(".aim").text((aim * 10) + (key - 48) + "˚");
                } else {
                    $(".aim").text("360˚");
                }
            } else if (key == 38) {
                aim = current_angle();
                $(".aim").text(aim + 1  + "˚");
            } else if (key == 40) {
                aim = current_angle();
                $(".aim").text(aim - 1  + "˚");
            }
            p1_turret.set({x2: turret_cos(current_angle()), y2: turret_sin(current_angle())});
            p1_turret.setCoords();
        };
        aimWheel = function(event) {
            var aim = current_angle();
            if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                $(".aim").text(((aim + 1) % 360) + "˚");
            }
            else {
                if (aim - 1 < 0) {
                    aim = 359;
                }
                $(".aim").text(((aim - 1) % 360)  + "˚");
            }
            p1_turret.set({x2: turret_cos(current_angle()), y2: turret_sin(current_angle())});
            p1_turret.setCoords();
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
            selected_shot = $(".shot-button").text();
            fire(selected_shot);
        });
    }

    var powerKeyPress;
    var powerWheel;

    function setPower() {
        $(".power").stop().animate({"font-size": 30}, 200);
        $(".power-button").animate({"width": 100, backgroundColor: "#414141"}, 200).off();
        setTimeout(function() {
            $(window).on("click", confirmPower).on("keydown", function(e) {
                key = e.keyCode || e.charCode;
                if (key == 13) {
                    confirmPower();
                }
            });
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
            selected_shot = $(".shot-button").text();
            fire(selected_shot);
        });
    }

    function selectShot() {
        $(".shot-button").css({display: "none"});
        $(".shot-selection").css({display: "block"});
        $(".fire-btn-container").css({margin: "30px auto 0"});
        $(".fire-button").css({marginTop: "20px"});
        $(".shot-option").on("click", function() {
            $(".shot-button").text($(this).text()).css({display: "block"});
            $(".shot-selection").css({display: "none"});
            $(".fire-btn-container").css({margin: "20px auto 0"});
            $(".fire-button").css({marginTop: "0"});
            $(this).appendTo(".shot-selection");
            $(".shot-option").off();
        })
    }

    $(".fire-button").on('click', function() {
        selected_shot = $(".shot-button").text();
        fire(selected_shot);
    });
    $(".aim-button").on("click", setAim);
    $(".power-button").on("click", setPower);
    $(".shot-button").on("click", selectShot);

    paramHover();

    modeChange(tearTitle, buildGame);
    animateLoop();
});