$(function() {

    // GAME MODE/STATE CHANGE
    // ----------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------
    function modeChange(tearMode, buildMode) {
        $(window, "*").off();
        tearMode(buildMode);
    }

    function buildTitle() {
        $(".title-screen").fadeIn(500, function() {
            $(window).on("keydown click", titlePress);
        });
        stop_loop = false;
        titleTextLoop();
    }

    function tearTitle(callback) {
        $(".title-screen").fadeOut(500, function() {
            callback();
        });
        stop_loop = true;
        title_text.stop(true, true);
    }

    function buildMenu() {
        $(".menu-screen").fadeIn(500, function() {
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

    function tearMenu(callback) {
        $(".menu-screen").fadeOut(500, function() {
            callback();
        });
    }

    function buildGame() {
        loadGameMap1();
        $(".game-screen").fadeIn(500, function() {
            $(window).on("keydown", moveListener);
            $(window).on("keydown", fireListener);
        });
    }

    function tearGame(callback) {
        $(".game-screen").fadeOut(500, function() {
            callback();
        });
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
    var canvas = new fabric.Canvas('canvas', {
        selection: false
    });

    canvas.setHeight(1000);
    canvas.setWidth(2000);
    canvas.allowTouchScrolling = true;
    canvas.renderAll();

    fabric.Canvas.prototype.getElementsByType = function(type) {
        var objectList = [],
            objects = this.getObjects();

        for (var i = 0, len = this.size(); i < len; i++) {
            if (objects[i].type && objects[i].type === type) {
                objectList.push(objects[i]);
            }
        }

        return objectList;
    };

    // Physics
    // ----------------------------------------------------------------------------------------------------------
    var FRAME_RATE = 120;
    var GAME_SPEED = 1;
    var GAME_TIME_UNIT = (60 / FRAME_RATE) * GAME_SPEED;

    var current_angle = function() {
        var $aim = $(".aim");
        return Number($aim.text().substring(0, $aim.text().length - 1))
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
    fabric.Object.prototype.colRadius = function() {
        return this.radius;
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
        },

        colRadius: function() {
            return this.item(1).radius;
        }
    });

    var TURRET_LENGTH = 30,
        turret_cos = function(angle) {
            return TURRET_LENGTH * (Math.cos(DEGREE_IN_RADIANS * angle));
        },
        turret_sin = function(angle) {
            return TURRET_LENGTH * (Math.sin(DEGREE_IN_RADIANS * angle));
        };

    var p1_perimeter = new fabric.Circle({radius: TURRET_LENGTH, opacity: 0, originX: "center", originY: "center"});
    var p1_body = new playerBody({radius: 20, fill: "blue", originX: "center", originY: "center"});
    var p1_turret = new playerTurret([0, 0, turret_cos(0), turret_sin(0)],
            {fill: "white", stroke: "white", strokeWidth: 2, originX: "center", originY: "center"});
    var player_1 = new Player([p1_perimeter, p1_body, p1_turret], {radius: 30, velocityX: 0, velocityY: 0, mass: 0});

    var p2_perimeter = new fabric.Circle({radius: TURRET_LENGTH, opacity: 0, originX: "center", originY: "center"});
    var p2_body = new playerBody({radius: 20, fill: "red", originX: "center", originY: "center"});
    var p2_turret = new playerTurret([0, 0, turret_cos(180), turret_sin(180)],
            {fill: "white", stroke: "white", strokeWidth: 2, originX: "center", originY: "center"});
    var player_2 = new Player([p2_perimeter, p2_body, p2_turret], {radius: 30, velocityX: 0, velocityY: 0, mass: 0});

    var player_indicator = new fabric.Triangle({width: 10, height: 6, fill: "#fff", top: -35, angle: 180, originX: "center", originY: "center"});
    function indicatorHover() {
        player_indicator.animate("top", -30, {
            duration: 400,
            onComplete: function() {
                player_indicator.animate("top", -40, {
                    duration: 400,
                    onComplete: function() {
                        indicatorHover();
                    }
                });
            }
        });
    }
    indicatorHover();

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
            return new Shot({radius: 2, fill: 'yellow', left: player_turret[0], top: player_turret[1], velocityX: 0, velocityY: 0, mass: 1, damage: 35})
        },
        "NO-GRAVITY SHOT": function(player_turret) {
            return new noGravityShot({radius: 2, fill: 'red', left: player_turret[0], top: player_turret[1], velocityX: 0, velocityY: 0, mass: 1, damage: 20})
        },
        "ANTI-GRAVITY SHOT": function(player_turret) {
            return new antiGravityShot({radius: 2, fill: 'green', left: player_turret[0], top: player_turret[1], velocityX: 0, velocityY: 0, mass: 1, damage:35})
        }
    };
    var shot;
    var selected_shot;
    function addShot(selected_shot, player) {
        var player_turret = [player.realX() + player.item(2).x2, player.realY() + player.item(2).y2];
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

    // Stars


    // Object interactions and relations
    canvas.add(player_1, player_2);
    var objects_in_universe = [player_1, player_2];

    function distanceBetween(object1, object2) {
        var dx = (object1.realX()) - (object2.realX()), dy = (object1.realY()) - (object2.realY());
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    }

    function updateVelocity(object) {
        var g_forces = object.calculateGForce(objects_in_universe);
        object.velocityX = object.velocityX + (g_forces[0] * GAME_TIME_UNIT);
        object.velocityY = object.velocityY + (g_forces[1] * GAME_TIME_UNIT);
    }

    function updatePosition(object) {
        object.set({left: object.left + object.velocityX * GAME_TIME_UNIT, top: object.top + object.velocityY * GAME_TIME_UNIT});
    }

    var objects_to_remove = [];

    function checkCollision(object) {
        var other_objects = $.grep(objects_in_universe, function(o, i) {
            return o != object;
        });
        for (var index in other_objects) {
            var opposing_obj = other_objects[index];
            var distance = distanceBetween(opposing_obj, object);
            if ((opposing_obj.colRadius() + object.colRadius()) > distance) {
                if (object.type == "Shot") {
                    objects_to_remove.push(object);
                    if (opposing_obj.type == "Player") {
                        var health;
                        if (opposing_obj == player_1) {
                            health = document.getElementById("p1-health");
                        } else {
                            health = document.getElementById("p2-health");
                        }
                        health.value = health.value - object.damage;
                        if (health.value <= 0) {
                            endGame(opposing_obj);
                        }
                    }
                }
            }
        }
    }

    function checkOutOfBounds(object) {
        if (object.realX() <= -200 || object.realY() <= -200) {
            objects_in_universe.splice($.inArray(object, objects_in_universe), 1);
            canvas.remove(object);
        }
    }

    function animateLoop() {
        for (var index in objects_in_universe) {
            var object = objects_in_universe[index];
            checkCollision(object);
            checkOutOfBounds(object);
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

    // GAME UI
    // ----------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------
    function paramHover() {
        $(".param-button").hover(function() {
            if (allow_param) {
                $(this).stop().animate({backgroundColor: "#414141"}, 150)
            }
            $(this).stop().animate({backgroundColor: "#414141"}, 150)
        }, function() {
            if (allow_param) {
                $(this).stop().animate({backgroundColor: "#1f1f1f"}, 150)
            }
        });
    }
    var allow_param = true;

    var aimChange;

    function setAim(player) {
        if (allow_param) {
            var $aim = $(".aim"), aim, keyPressed = false;
            $aim.stop().animate({"font-size": 30}, 200);
            $(".aim-button").animate({"width": 100, backgroundColor: "#414141"}, 200).off();
            setTimeout(function() {
                $(window).on("click", confirmAim).on("keydown", function(e) {
                    var key = e.keyCode || e.charCode;
                    if (key == 13) {
                        confirmAim();
                    }
                });
            }, 50);

            aimChange = function(event) {
                aim = current_angle();
                if (event.type == "mousewheel" || event.type == "DOMMouseScroll") {
                    if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                        $aim.text(((aim + 1) % 360) + "˚");
                    }
                    else {
                        if (aim - 1 < 0) {
                            aim = 360;
                        }
                        $aim.text(((aim - 1) % 360)  + "˚");
                    }
                    player.item(2).set({x2: turret_cos(current_angle()), y2: turret_sin(current_angle())});
                    keyPressed = false;
                } else {
                    var key = event.keyCode || event.charCode;
                    if ((key >= 48 || key >= 48) && (key <= 57 || key <= 48)) {
                        if (keyPressed == false) {
                            aim = 0;
                            keyPressed = true;
                        } else {
                            aim = current_angle();
                        }
                        if (((aim * 10) + (key - 48)) <= 360) {
                            $aim.text((aim * 10) + (key - 48) + "˚");
                        } else {
                            $aim.text("360˚");
                        }
                    } else if (key == 38) {
                        $aim.text(((aim + 1) % 360) + "˚");
                    } else if (key == 40) {
                        if (aim - 1 < 0) {
                            aim = 360;
                        }
                        $aim.text(((aim - 1) % 360)  + "˚");
                    }
                    player.item(2).set({x2: turret_cos(current_angle()), y2: turret_sin(current_angle())});
                }
            };
            allow_fire = false;
            allow_end = false;
            $(".fire-button").off();
            $(window).on("mousewheel DOMMouseScroll keydown", aimChange);
        }
    }

    function confirmAim() {
        var $aim = $(".aim");
        $aim.stop().animate({"font-size": 14}, 200);
        $(window).off("click", confirmAim).off("mousewheel DOMMouseScroll keydown", aimChange);
        $(".aim-button").on("click", function()
            {setAim(current_player);
        }).stop().animate({"width": 35, backgroundColor: "#1f1f1f"}, 150, paramHover);
        $(".fire-button").on('click', function() {
            selected_shot = $(".shot-button").text();
            fire(selected_shot, current_player);
        });
        current_player.set({aim: current_angle()});
        allow_fire = true;
        allow_end = true;
    }

    var powerChange;

    function setPower() {
        if (allow_param) {
            var $power = $(".power"), power, keyPressed = false;
            $power.stop().animate({"font-size": 30}, 200);
            $(".power-button").animate({"width": 100, backgroundColor: "#414141"}, 200).off();
            setTimeout(function() {
                $(window).on("click", confirmPower).on("keydown", function(e) {
                    var key = e.keyCode || e.charCode;
                    if (key == 13) {
                        confirmPower();
                    }
                });
            }, 50);
            powerChange = function(event) {
                power = Number($power.text());
                if (event.type == "mousewheel" || event.type == "DOMMouseScroll") {
                    if ((event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) && (power + 1) <= 100) {
                        $power.text(power + 1);
                    } else if (power > 1) {
                        $power.text(power - 1);
                    }
                    keyPressed = false;
                } else {
                    var key = event.keyCode || event.charCode;
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
                        if (power < 100) {
                            $power.text(power + 1);
                        }
                    } else if (key == 40) {
                        if (power > 1) {
                            $power.text(power - 1);
                        }
                    }
                }
            };
            allow_fire = false;
            allow_end = false;
            $(".fire-button").off();
            $(window).on("mousewheel DOMMouseScroll keydown", powerChange);
        }
    }

    function confirmPower() {
        var $power = $(".power");
        $power.stop().animate({"font-size": 14}, 200);
        $(window).off("click", confirmPower).off("mousewheel DOMMouseScroll keydown", powerChange);
        $(".power-button").on("click", setPower).stop().animate({"width": 35, backgroundColor: "#1f1f1f"}, 150, paramHover);
        $(".fire-button").on('click', function() {
            selected_shot = $(".shot-button").text();
            fire(selected_shot, current_player);
        });
        current_player.set({power: $power.text()});
        allow_fire = true;
        allow_end = true;
    }

    var allow_fire = true;

    function fire(selected_shot, player) {
        if (player.actionPoints >= 3 && allow_fire) {
            addShot(selected_shot, player);
            shot.set({left: shot.left - shot.radius, top: shot.top - shot.radius});
            canvas.add(shot);
            power = Number($(".power").text());
            angle = current_angle();
            shot.velocityX = Math.cos(DEGREE_IN_RADIANS * angle) * ((power / 10));
            shot.velocityY = Math.sin(DEGREE_IN_RADIANS * angle) * ((power / 10));
            objects_in_universe.push(shot);
            spendAP(player, 3);
        }
    }

    function fireListener(e) {
        var key = e.keyCode || e.charCode;
        if (key == 32) {
            selected_shot = $(".shot-button").text();
            fire(selected_shot, current_player);
        }
    }

    function selectShot() {
        $(".shot-button").css({display: "none"});
        $(".shot-selection").css({display: "block"});
        $(".fire-move-container").css({margin: "0 auto"});
        $(".f-m-btn-container").css({paddingTop: "50px"});
        $(".shot-option").on("click", function() {
            $(".shot-button").text($(this).text()).css({display: "block"});
            $(".shot-selection").css({display: "none"});
            $(".fire-move-container").css({margin: "20px auto 0"});
            $(".f-m-btn-container").css({paddingTop: "0"});
            $(this).appendTo(".shot-selection");
            $(".shot-option").off();
        });
    }

    function setMove(player) {
        if (player.actionPoints > 0) {
            var player_body = player.item(1);
            var move_limit = new fabric.Circle({radius: player_body.radius, left: player.realX(), top: player.realY(), opacity: 0.5, fill: "#2C4379", stroke: "#00FFFE", strokeWidth: 1, originX: "center", originY: "center"});
            var move_phantom = new fabric.Group([
                fabric.util.object.clone(player.item(0)),
                fabric.util.object.clone(player.item(1)),
                fabric.util.object.clone(player.item(2))], {radius: TURRET_LENGTH, left: player.left, top: player.top});
            var pnts_to_be_rmvd = 0;

            function removeMoveLimit() {
                move_limit.animate("radius", player_body.radius, {
                    duration: 300,
                    onComplete: function () {
                        canvas.remove(move_limit);
                    }
                });
                move_limit.animate("opacity", 0, {
                    duration: 300
                });
                canvas.remove(move_phantom);
            }
            function confirmMove() {
                removeMoveLimit();
                player.set({left: move_phantom.left, top: move_phantom.top});
                rebindSetMove();
                spendAP(player, pnts_to_be_rmvd);
            }
            function cancelMove(e) {
                function confirmCancel() {
                    $to_be_removed.removeClass("to-be-removed").addClass("available");
                    removeMoveLimit();
                    rebindSetMove();
                    assessAP(player);
                }
                var $to_be_removed = $(".to-be-removed");
                if (e.type == "keydown") {
                    var key = e.keyCode || e.charCode;
                    if (key == 27 || key == 77) {
                        confirmCancel();
                    }
                } else {
                    confirmCancel();
                }
            }
            function setMoveCursor(options) {
                if ($.inArray(move_phantom, canvas.getObjects()) == -1) {
                    canvas.add(move_phantom);
                }
                var dx = (options.e.clientX - move_limit.left), dy = (options.e.clientY - move_limit.top);
                var distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                if (distance + player_body.radius <= move_limit.radius) {
                    move_phantom.set({left: options.e.clientX - move_phantom.radius, top: options.e.clientY - move_phantom.radius});
                } else {
                    var cursor_angle = Math.atan2(dy, dx);
                    var x = ((move_limit.radius - player_body.radius) * Math.cos(cursor_angle)) + move_limit.left - move_phantom.radius, y = ((move_limit.radius - player_body.radius) * Math.sin(cursor_angle)) + move_limit.top - move_phantom.radius;
                    move_phantom.set({left: x, top: y});
                }
                distance = distanceBetween(move_phantom, player);
                var n = 0;
                $(".to-be-removed").removeClass("to-be-removed").addClass("available");
                $($(".available").get().reverse()).each(function() {
                    if (n < ((distance) / 50)) {
                        $(this).removeClass("available").addClass("to-be-removed");
                        n++;
                        pnts_to_be_rmvd = n;
                    }
                });
            }
            function rebindSetMove() {
                allow_fire = true;
                allow_param = true;
                allow_end = true;
                $(".fire-button").removeClass("button-disabled");
                $(".end-button").removeClass("button-disabled");
                canvas.off("mouse:down", confirmMove).off("mouse:move", setMoveCursor);
                $(".game-ui").off();
                $(".move-button").off().on("click", function() {
                    setMove(current_player);
                });
                $(window).off("keydown", cancelMove).on("keydown", moveListener);
            }
            function activateSetMove(player) {
                allow_fire = false;
                allow_param = false;
                allow_end = false;
                $(".fire-button").addClass("button-disabled");
                $(".end-button").addClass("button-disabled");
                canvas.on("mouse:down", confirmMove).on("mouse:move", setMoveCursor);
                $(".game-ui").on("mousemove", function() {
                    canvas.remove(move_phantom);
                    $(".to-be-removed").removeClass("to-be-removed").addClass("available");
                });
                $(".move-button").off().on("click", cancelMove);
                $(window).off("keydown", moveListener).on("keydown", cancelMove);
                move_phantom.item(1).set("opacity", 0.5);
                move_phantom.item(2).set("opacity", 0.5);
                canvas.add(move_limit);
                move_limit.moveTo(canvas.getObjects().indexOf(player));
                move_limit.animate("radius", 50 + (player.actionPoints * 50) - player.radius, {
                    duration: 300
                });
            }
            activateSetMove(player);
        }
    }

    function moveListener(e) {
        var key = e.keyCode || e.charCode;
        if (key == 77) {
            setMove(current_player);
        }
    }

    function spendAP(player, pnts_to_be_rmvd) {
        player.set({actionPoints: player.actionPoints - pnts_to_be_rmvd});
        var n = 1;
        $(".to-be-removed").removeClass("to-be-removed").addClass("available");
        $($(".available").get().reverse()).each(function() {
            if (n <= pnts_to_be_rmvd) {
                $(this).removeClass("available");
                n++;
            }
        });
        assessAP(player)
    }

    function assessAP(player) {
        var ap = player.actionPoints, n = 1;
        var fire_button = $(".fire-button");
        if (ap == 0) {
            endTurn();
            return;
        } else if (ap < 3) {
            if (fire_button.hasClass("button-disabled") == false) {
                fire_button.toggleClass("button-disabled");
            }
        } else if (fire_button.hasClass("button-disabled") == true) {
            fire_button.toggleClass("button-disabled");
        }
        $($(".action-point").get()).each(function() {
            $(this).removeClass("available to-be-removed");
            if (n <= ap) {
                $(this).addClass("available");
                n++;
            }
        });
    }

    // Turns and new games
    var current_player;

    function resetGame() {
        $(".game-over").css({display: "none"});
        var planets = canvas.getElementsByType("Planet");
        var shots = canvas.getElementsByType("Shot");
        for (var i = 0; i < planets.length; i++) {
            canvas.remove(planets[i]);
            objects_in_universe.splice($.inArray(planets[i], objects_in_universe), 1);
        }
        for (var i = 0; i < shots.length; i++) {
            canvas.remove(shots[i]);
            objects_in_universe.splice($.inArray(shots[i], objects_in_universe), 1);
        }
        player_1.set({actionPoints: 0, aim: 0, power: 50});
        player_2.set({actionPoints: 0, aim: 180, power: 50});
        p1_turret.set({x2: turret_cos(0), y2: turret_sin(0)});
        p2_turret.set({x2: turret_cos(180), y2: turret_sin(180)});
        var p1_health = document.getElementById("p1-health");
        var p2_health = document.getElementById("p2-health");
        p1_health.value = 100;
        p2_health.value = 100;
    }

    function loadGameMap1() {
        resetGame();

        player_1.set({left: 100, top: 400});
        player_2.set({left: 1800, top: 400});

        var planet_1 = new Planet({radius: 150, left: 800, top: 320, selectable: false, velocityX: 0, velocityY: 0, mass: 100000});
        planet_1.setGradient('fill', {
            x1: 0,
            y1: -planet_1.width / 2,
            x2: 0,
            y2: planet_1.width / 2,
            colorStops: {
                0: "green",
                0.7: "green",
                1: "blue"
            }
        });

        canvas.add(planet_1);
        objects_in_universe.push(planet_1);

        if (current_player) {
            current_player.remove(player_indicator);
        }

        var first_player = Math.floor((Math.random() * 2) + 1);
        if (first_player == 1) {
            current_player = player_1;
        } else {
            current_player = player_2;
        }
        current_player.set({actionPoints: 8});
        current_player.add(player_indicator);
        $(".aim").text(current_player.aim + "˚");
        $(".power").text(current_player.power);
        assessAP(current_player);
    }

    var allow_end = true;

    function endTurn() {
        if (allow_end) {
            current_player.remove(player_indicator);
            if (current_player == player_1) {
                current_player = player_2;
            } else {
                current_player = player_1;
            }
            if (current_player.actionPoints + 8 <= 20) {
                current_player.set({actionPoints: current_player.actionPoints + 8});
            } else {
                current_player.set({actionPoints: 20});
            }
            $(".aim").text(current_player.aim + "˚");
            $(".power").text(current_player.power);
            assessAP(current_player);
            current_player.add(player_indicator);
        }
    }

    function endGame(loser) {
        if (loser == player_1) {
            $(".winner").text("Player 2 wins!");
        } else {
            $(".winner").text("Player 1 wins!");
        }
        $(".game-over").css({display: "block"});
    }

    $(".fire-button").on('click', function() {
        selected_shot = $(".shot-button").text();
        fire(selected_shot, current_player);
    });
    $(".aim-button").on("click", function() {
        setAim(current_player);
    });
    $(".power-button").on("click", setPower);
    $(".shot-button").on("click", selectShot);
    $(".move-button").on("click", function() {
        setMove(current_player);
    });
    $(".end-button").on("click", function() {
        endTurn();
    });
    $(".back-title-btn").on("click", function() {
        modeChange(tearGame, buildTitle);
    });
    $(".play-again-btn").on("click", function() {
        modeChange(tearGame, buildGame);
    });

//    Draggable.create(".canvas-container", {
//        type: "scroll",
//        zIndexBoost: false,
//        dragClickables: true
//    });

    paramHover();

    modeChange(tearTitle, buildGame);
    animateLoop();
});