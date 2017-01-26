(function (Oskari,$) {

    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = ".solsol {width : 100%;height: 100%;min-width: 512px;min-height: 480px;position: relative;left: 0;top: 0; border:1pt solid navy; border-radius: 5pt; background-color: rgba(250,250,250,0.7); }" +
        ".solsol_card {position: absolute;width: 57px;height: 83px;background-image: url('https://nls-jajuko.github.io/svg-cards-2.0-scaledDown.png');box-shadow: 0px 3px 4px rgba(0, 0, 0, 0.80);}";
    document.body.appendChild(css);



    /**
     * @class Oskari.poc.yuilibrary.leaflet.Flyout
     */
    Oskari.clazz.define('Oskari.games.bundle.solsol.Flyout',

        /**
         * @method create called automatically on construction
         * @static
         *
         * Always extend this class, never use as is.
         */
        function (instance, player) {
            this.player = player;
            this.instance = instance;
            this.container = null;
            this.template = null;
            this.state = null;

        }, {
            getName: function () {
                return 'Oskari.games.bundle.solsol.Flyout';
            },
            setEl: function (el, width, height) {
                this.container = el[0];

            },
            startPlugin: function () {

                this.templates = {
                    game: $('<div class="solsol"></div>'),
                    toolbar: $('<div class="solsol_toolbar"><button class="solsol_btn_play" style="display:none"/><button class="solsol_btn_pause" /><button class="solsol_btn_new" /></div>')
                };

                this.setup();

            },
            stopPlugin: function () {

            },
            getTitle: function () {
                return "Solitaire";
            },
            getDescription: function () {},
            getOptions: function () {

            },
            setState: function (state) {
                this.state = state;

            },
            setup: function () {
                var me = this;
                var sandbox = me.instance.getSandbox();
                var elContainer = $(me.container);
                elContainer.empty();

                /* hackzone begin */
                //elContainer.parent().css("backgroundColor", "transparent");
                //elContainer.parent().parent().css("backgroundColor", "transparent");

                /*elContainer.parent().addClass("solsol_wrapper")*/
                elContainer.parent().parent().addClass("solsol_wrapper");

                /* hackzone end */

                var elGame = $(me.templates.game).clone();
                var elToolbar = $(me.templates.toolbar).clone();

                var me = this;
                elToolbar.children('.solsol_btn_play').click(function () {
                    me.player.solStart();
                    elToolbar.children('.solsol_btn_play').hide();
                    elToolbar.children('.solsol_btn_pause').show();
                });
                elToolbar.children('.solsol_btn_pause').click(function () {
                    me.player.solStart();
                    elToolbar.children('.solsol_btn_pause').hide();
                    elToolbar.children('.solsol_btn_play').show();
                });
                elToolbar.children('.solsol_btn_new').click(function () {
                    me.player.solNewGame();
                });

                $(me.container).append(elGame);
                $(me.container).append(elToolbar);

                this.player.startup(elGame.get()[0]);

            }
        }, {
            'protocol': ['Oskari.userinterface.Flyout']
        });

    /*
     ** SolitairePlayer GPL (C) jjk
     ** Depends JQuery for drop zone visualisation drag drop and and animation
     *  This is 'read-only' version that plays the game without user interaction...
     ** $ UI dependency dropped for now - may be resumed
     */
    /**
     * @todo remove $ deps
     */

    Oskari.clazz.define("Oskari.mapframework.solsol.SolSolPlayer", function () {
        this.dropZoneMoves = [];
        this.sol = null;

        this.timer = null;
        this.alerted = -1;
        this.paused = true;
        this.stepper = 0;
        this.el = null;
        this.dlg = {
            'success': null,
            'failure': null
        };
        this.cards = {};
    }, {

        getCardDiv: function (cardId) {
            return this.cards[cardId];
        },
        calcCardPos: function (c, s) {
            var off = 16;
            // 0-6 == game
            // 7 == deal
            // 8 == deck
            // 9-12 == finals for club, diamond, heart, spade
            if (s < 7) {
                return {
                    lpos: off + s * 64 + s,
                    tpos: off + 128 + c * 24
                };
            } else if (s == 7) {
                return {
                    lpos: off + 1 * 64,
                    tpos: off + c
                };

            } else if (s == 8) {
                return {
                    lpos: off + 0 * 64,
                    tpos: off
                };

            } else {
                return {
                    lpos: off + 3 * 64 + (s - 9) * 64 + s,
                    tpos: off + c
                };

            }

        },
        createCardDiv: function (cardId, cardNum) {
            var cd = document.createElement('div');
            cd.id = cardId;
            cd.setAttribute('cardNum', cardNum);
            cd.className = 'solsol_card';

            return cd;
        },
        toHtml: function (container) {
            var sol = this.sol;
            var state = sol.getRoState();

            var s = 8;
            for (var c = 0; c < 52; c++) {

                var stacksS = state.stacks.elementAt(s);
                var sv = stacksS.elementAt(c);
                if (sv < 0) {
                    var bgpos = (2 * -57.15384) + "px " + (4 * -83) + "px";
                } else if (s == 8) {
                    var bgpos = (2 * -57.15384) + "px " + (4 * -83) + "px";
                    var pos = this.calcCardPos(c, s);
                    var cardId = 'card_' + sv;
                    var cd = this.cards[cardId];
                    if (!cd) {
                        cd = this.createCardDiv(cardId, sv);
                        container.appendChild(cd);
                        this.cards[cd.id] = cd;
                    }
                    cd.style.left = pos.lpos + "px";
                    cd.style.top = pos.tpos + "px";
                    cd.style.zIndex = 2400 + c;
                    cd.style.backgroundPosition = bgpos;
                } else if (c <= state.firstHidden.elementAt(s)) {
                    var bgpos = (2 * -57.15384) + "px " + (4 * -83) + "px";
                    var pos = this.calcCardPos(c, s);
                    var cardId = 'card_' + sv;
                    var cd = this.cards[cardId];
                    if (!cd) {
                        cd = this.createCardDiv(cardId, sv);
                        container.appendChild(cd);
                        this.cards[cd.id] = cd;
                    }
                    cd.style.left = pos.lpos + "px";
                    cd.style.top = pos.tpos + "px";
                    cd.style.zIndex = 2400 + c;
                    cd.style.backgroundPosition = bgpos;
                } else {
                    var suite = Math.floor(sv / 16);
                    var card = Math.floor(sv % 16);
                    var bgpos = (card * -57.15384) + "px " + (suite * -83) + "px";
                    var pos = this.calcCardPos(c, s);
                    var cardId = 'card_' + sv;
                    var cd = this.cards[cardId];
                    if (!cd) {
                        cd = this.createCardDiv(cardId, sv);
                        container.appendChild(cd);
                        this.cards[cd.id] = cd;
                    }
                    cd.style.left = pos.lpos + "px";
                    cd.style.top = pos.tpos + "px";
                    cd.style.zIndex = 2400 + c;
                    cd.style.backgroundPosition = bgpos;
                }

            }
        },
        render: function (container) {
            this.toHtml(container);

            var sol = this.sol;

            var state = sol.getRoState();

            //                for( var c =0; c < 24; c++) {
            //for(var s = 0 ; s < 16 ; s++ )
            var s = 8;
            for (var c = 0; c < 52; c++) {
                {
                    var stacksS = state.stacks.elementAt(s);
                    var sv = stacksS.elementAt(c);
                    if (sv < 0)
                        continue;

                    var cardId = "card_" + sv;
                    var cardDiv = this.getCardDiv(cardId);

                    /*$(cardDiv).draggable('destroy');*/

                    if (c <= state.firstHidden.elementAt(s)) {

                    } else {
                        var self = this;
                        var sol = this.sol;
                        /*$(cardDiv).draggable({revert: true,
					start : function(event, ui) {
					self.resetDropZoneMoves();
					sol.prepareMovesForCard(Number(ui.helper.attr('cardNum')), self.dropZoneMoves);
					self.visualiseDropZones(self.dropZoneMoves);
					},
					zIndex : 2800

					});*/
                        //.draggable('enable');

                    }
                }
            }
        },
        renderMove: function (m, anim) {

            for (var n = 0; n < 24; n++) {
                var sv = m.cards.elementAt(n);
                if (sv == -1)
                    break;

                var cardId = "card_" + sv;
                var cardDiv = this.getCardDiv(cardId);

                var pos = this.calcCardPos(m.toPos + n, m.toStack);
                cardDiv.style.zIndex = 2500 + m.toPos + n;

                var card = Math.floor(sv % 16);
                var suite = Math.floor(sv / 16);
                if (m.toStack == 7 || (m.toStack < 7 && m.toPos == m.toStack)) {
                    var bgpos = (card * -57.15384) + "px " + (suite * -83) + "px";
                    cardDiv.style.backgroundPosition = bgpos;
                    /*$(cardDiv).draggable('destroy');*/
                    /*$(cardDiv).draggable({
					cardNum : $(cardDiv).attr('cardNum'),
					helper : 'clone',
					start : function(event, ui) {
						self.resetDropZoneMoves();
						sol.prepareMovesForCard(Number(ui.helper.attr('cardNum')), self.dropZoneMoves);
						self.visualiseDropZones(self.dropZoneMoves);
					},
					zIndex : 2700
				});*/
                }
                if (anim)
                    $(cardDiv).animate({
                        left: pos.lpos,
                        top: pos.tpos
                    }, 'slow');
                else {
                    cardDiv.style.top = pos.tpos;
                    cardDiv.style.left = pos.lpos;

                }
            }
            if (m.unfold != -1) {
                var n = m.unfold;
                var cardId = "card_" + n;
                var cardDiv = this.getCardDiv(cardId);
                var card = Math.floor(m.unfold % 16);
                var suite = Math.floor(m.unfold / 16);
                if (m.fromStack != 8) {
                    var bgpos = (card * -57.15384) + "px " + (suite * -83) + "px";
                    cardDiv.style.backgroundPosition = bgpos;
                }
                var self = this;
                var sol = this.sol;
                /*$(cardDiv).draggable('destroy');*/
                /*$(cardDiv).draggable({
				cardNum : $(cardDiv).attr('cardNum'),
				helper : 'clone',
				start : function(event, ui) {
					self.resetDropZoneMoves();
					sol.prepareMovesForCard(Number(ui.helper.attr('cardNum')), self.dropZoneMoves);
					self.visualiseDropZones(self.dropZoneMoves);
				},
				zIndex : 2700
			});*/
            } else {
                /*$(cardDiv).draggable('destroy');*/
            }
        },
        applyDropZoneMove: function (cardNum, toStack, toPos) {

            console.log("applyDropZoneMove", cardNum, toStack, toPos);
            var sol = this.sol;
            for (var n = 0, len = this.dropZoneMoves.length; n < len; n++) {
                var m = this.dropZoneMoves[n];
                if (!(m.toStack == toStack && m.toPos == toPos && m.cards.elementAt(0) == cardNum))
                    continue;

                console.log("applyDropZoneMove", "step", m, this.dropZoneMoves, m);
                sol.m = m;

                this.step(false);

                break;

            }
        },
        resetDropZoneMoves: function () {

            var m = this.dropZoneMoves.shift();
            while (m != null) {
                m.destroy();
                delete m;
                m = this.dropZoneMoves.shift();
            }
        },
        clearDropZones: function () {
            var el = this.el;
            /*		$(".solsol_dropzone").remove();
            		$(".solsol_dropzone").droppable('destroy');*/

        },
        visualiseDropZones: function (moves) {
            var self = this;
            var sol = this.sol;
            var el = this.el;
            this.clearDropZones();
            for (var n = 0; n < moves.length; n++) {
                var m = moves[n];
                var pos = this.calcCardPos(m.toPos, m.toStack);
                if (m.toStack != 7) {
                    /*var dropable = $("<div id='droppable' toStack='" + m.toStack + "' toPos='" + m.toPos + "' class='solsol_dropzone' style='z-index:" + (2700 + m.toPos + 1) + "; left:" + (pos.lpos) + "px; top:" + (pos.tpos) + "px;'></div>");
				$(el).append(dropable);
				dropable.droppable({
					accept : '.solsol_card',
					hoverClass : 'solsol_state_active',
					drop : function(event, ui) {
						$(this).addClass('solsol_state_highlight');
						self.applyDropZoneMove(Number(ui.helper.attr('cardNum')), Number($(this).attr('toStack')), Number($(this).attr('toPos')));
					}
				})*/
                } else {
                    /*var dropable = $("<div id='droppable' toStack='" + m.toStack + "' toPos='" + m.toPos + "' class='solsol_dropzone' style='z-index:" + (2700 + m.toPos + 1) + "; left:" + (pos.lpos) + "px; top:" + (pos.tpos + 24) + "px;'></div>");
				$(el).append(dropable);
				dropable.droppable({
					accept : '.solsol_card',
					hoverClass : 'solsol_state_active',
					drop : function(event, ui) {
						$(this).addClass('solsol_state_highlight');
						self.applyDropZoneMove(Number(ui.helper.attr('cardNum')), Number($(this).attr('toStack')), Number($(this).attr('toPos')));
					}
				})*/
                }

            }

        },
        step: function (anim) {
            var sol = this.sol;

            var m = sol.getMove();

            if (m.ok) {
                sol.applyMove(m);
                this.renderMove(m, anim);
            } else if (sol.detectSuccess(m) != 1 && sol.getRoState().state >= 1) {
                this.paused = true;
                this.alerted = 10;
                //$(this.dlg['failure']).dialog('open');
                this.report({
                    state: 'failure'
                });
            }
            m = sol.stepSimulation();

            if (sol.detectSuccess(m) == 1) {
                this.paused = true;
                this.alerted = 10;
                // $(this.dlg['success']).dialog('open');
                this.report({
                    state: 'success'
                });
            }

            if (m.ok) {
                // rendataan
            }

            if (sol.getRoState().state != 0) {
                // saatais getMoves(),mutta ei saada ns. bouncerseja
                this.resetDropZoneMoves();
                sol.prepareMovesForPos(-1, -1, this.dropZoneMoves);
                this.visualiseDropZones(this.dropZoneMoves);
                //sol.getMoves());
            }

            //sol.toHtmlTable(document.getElementById('debug'));
        },
        bd: function (moves, bc, bi) {

            //debug.innerHTML = "ML: "+moves.length+" BC: "+bc+" BI: "+bi;
        },
        startup: function (el) {

            this.el = el;
            var sol = this.sol;
            //new SolSol.solitaire();
            //this.sol = sol;
            sol.bouncerDebugger = this.bd;

            sol.newGame(true);
            this.render(el);
            this.paused = false;

            var self = this;
            this.func = function () {
                    self.autoStep();
                }
                //this.prepareDialogs();

            this.timer = window.setInterval(this.func, 250);

        },
        report: function (what) {

        },
        shutdown: function () {
            if (this.timer)
                window.clearInterval(this.timer);
            var sol = this.sol;
            this.sol = null;
            sol.destroy();
            delete sol;
        },
        solNewGame: function () {
            this.paused = true;
            this.stepper = 0;
            var sol = this.sol;
            sol.state.state = -1;
            this.clearDropZones();
            sol.newGame(true);
            this.render(this.el);
        },
        solStep: function () {
            var sol = this.sol;
            sol.stepSimulation();
            this.step(true);
        },
        solStart: function () {
            this.paused = !this.paused;
        },
        solHint: function () {
            var sol = this.sol;
            this.resetDropZoneMoves();
            sol.prepareMovesForPos(-1, -1, this.dropZoneMoves);
            this.visualiseDropZones(this.dropZoneMoves);
        },
        autoStep: function () {
            var sol = this.sol;
            if (sol.state.state == 0)
                this.step(true);
            else if (!this.paused) {
                this.stepper++;
                if (this.stepper % 2 == 0)
                    this.step(true);
            } else if (this.alerted > 0) {
                this.alerted--;
                if (this.alerted == 0) {
                    /*$(this.dlg['success']).dialog('close');
				 $(this.dlg['failure']).dialog('close');*/
                    this.solNewGame();
                    this.solStart();
                }
            }
        },
       
        createAI: function () {

            function Vector(n) {
                this.arr = new Array(n);
                this.length = 0;
                this.capacity = n;
            }


            Vector.prototype = {
                add: function (o) {
                    this.arr[this.length] = o;
                    this.length++;
                },
                elementAt: function (n) {
                    return this.arr[n];
                },
                assignAt: function (n, v) {
                    this.arr[n] = v;
                },
                isEmpty: function () {
                    return this.length == 0;
                },
                size: function () {
                    return this.length;
                },
                clear: function () {
                    this.length = 0;
                    for (n = 0; n < this.capacity; n++)
                        this.arr[n] = -1;
                },
                begin: function () {
                    return 0;
                },
                end: function () {
                    return this.capacity;
                },
                fill: function (b, e, v) {
                    for (var n = b; n < e; n++)
                        this.arr[n] = v;
                },
                assignCopy: function (b, e, src) {
                    this.clear();
                    var assPos = 0;
                    for (var n = b; n < e; n++)
                        this.arr[assPos++] = src.arr[n];
                }
            };

            function DeckOfCards() {
                this.deck = new Vector(52);

                var deckIndex = 0;
                for (var suit = 0; suit < 4; suit++) {
                    for (var card = 0; card < 13; card++) {
                        this.deck.assignAt(deckIndex, suit * 16 + card);
                        deckIndex++;
                    }
                }

            }


            DeckOfCards.prototype.assignCopy = function (other) {
                this.deck.assignCopy(other.deck.begin(), other.deck.end(), other.deck);
            };

            DeckOfCards.prototype.randomShuffle = function () {
                //            	         Math.random(
                var cards = this.deck.arr;
                // prim hack
                var n = cards.length;
                // The number of items left to shuffle (loop invariant).
                while (n > 1) {
                    n--;
                    // n is now the last pertinent index
                    var k = Math.floor(Math.random() * (n + 1));
                    // 0 <= k <= n.
                    var tmp = cards[k];
                    cards[k] = cards[n];
                    cards[n] = tmp;
                }

            };

            function State() {
                this.state = -1;
                this.bouncerIndex = 0;
                this.bouncerCount = 0;
                this.stacks = new Vector(16);
                for (n = 0; n < 16; n++) {
                    var stacksN = new Vector(n == 8 ? 52 : 24);
                    this.stacks.assignAt(n, stacksN);
                    stacksN.fill(stacksN.begin(), stacksN.end(), -1);
                }
                this.firstHidden = new Vector(16);
                this.tops = new Vector(16);
                this.dealerIndex = -1;
                this.restartLooped = -1;
                this.firstHidden.fill(this.firstHidden.begin(), this.firstHidden.end(), -1);
                this.tops.fill(this.tops.begin(), this.tops.end(), -1);

            }


            State.prototype = {
                assignCopy: function (other) {
                    for (n = 0; n < 16; n++) {
                        var stacksN = other.stacks.elementAt(n);
                        this.stacks.elementAt(n).assignCopy(stacksN.begin(), stacksN.end(), stacksN);
                    }
                    this.firstHidden.assignCopy(other.firstHidden.begin(), other.firstHidden.end(), other.firstHidden);
                    this.tops.assignCopy(other.tops.begin(), other.tops.end(), other.tops);
                    this.dealerIndex = other.dealerIndex;
                    this.restartLooped = other.restartLooped;
                    this.state = other.state;
                }
            };

            function Move() {
                this.ok = false;
                this.fromStack = -1;
                this.fromPos = -1;
                this.toStack = -1;
                this.toPos = -1;
                this.cards = new Vector(24);
                this.unfold = -1;
                this.restartLooped = -1;
                this.msg = "";
                this.cards.fill(this.cards.begin(), this.cards.end(), -1);
            }


            Move.prototype = {
                destroy: function () {
                    var v = this.cards;
                    this.cards = null;
                    delete v;
                },
                assign: function (pok, pfromStack, pfromPos, ptoStack, ptoPos, punfold) {

                    this.ok = pok;
                    this.fromStack = pfromStack;
                    this.fromPos = pfromPos;
                    this.toStack = ptoStack;
                    this.toPos = ptoPos;
                    this.unfold = punfold;
                    this.restartLooped = 0;
                    this.msg = "";
                    this.cards.fill(this.cards.begin(), this.cards.end(), -1);
                },
                reset: function () {
                    this.assign(false, -1, -1, -1, -1, -1);
                },
                assignCopy: function (other) {
                    this.assign(other.ok, other.fromStack, other.fromPos, other.toStack, other.toPos, other.unfold);
                    this.restartLooped = other.restartLooped;
                    this.cards.assignCopy(other.cards.begin(), other.cards.end(), other.cards);
                    this.msg = other.msg;
                }
            };

            function Solitaire() {
                this.deck = new DeckOfCards();
                this.state = new State();
                this.ms = [];
                this.m = new Move();
                this.bouncerDebugger = function () {};
            }


            Solitaire.prototype = {
                destroy: function () {
                    var d = this.deck;
                    var s = this.state;
                    var m = this.m;
                    this.deck = null;
                    this.state = null;
                    this.m = null;
                    delete d;
                    delete s;
                    delete m;
                },
                getRoState: function () {
                    return this.state;
                },
                getRwState: function () {
                    return this.state;
                },
                newGame: function (shuffle) {
                    this.ms = [];
                    this.m.reset();

                    var cards = new DeckOfCards();
                    cards.assignCopy(this.deck);

                    if (shuffle)
                        cards.randomShuffle();

                    // reset game board
                    var state = this.getRwState();
                    state.restartLooped = -1;
                    state.bouncerCount = 0;
                    state.bouncerIndex = 0;

                    state.firstHidden.fill(state.firstHidden.begin(), state.firstHidden.end(), -2);
                    state.tops.fill(state.tops.begin(), state.tops.end(), -1);
                    for (var n = 0; n < 16; n++) {
                        var stacksN = state.stacks.elementAt(n);
                        stacksN.fill(stacksN.begin(), stacksN.end(), -1);
                    }

                    // deal cards to stacks 1-7 from cards
                    // adjust backside val to match
                    // push rest to stack 0 for redeals
                    var dealt = 0;
                    /*    for( var s = 0 ;s<7;s++) {
				var stacksS = state.stacks.elementAt(s);
				for( var c = 0 ; c <= s ; c++ ) {
				stacksS.assignAt(c, cards.deck.elementAt(dealt++));
				}
				state.firstHidden.assignAt(s,s-1);
				state.tops.assignAt(s,s);
				}
				*/
                    // pakka

                    //
                    state.dealerIndex = 0;
                    var stackd = state.stacks.elementAt(8);
                    for (; dealt < 52; dealt++) {
                        stackd.assignAt(state.dealerIndex++, cards.deck.elementAt(dealt));
                    }

                    //state.firstHidden.assignAt(8,22);
                    //state.tops.assignAt(8,23);
                    state.firstHidden.assignAt(8, 50);
                    state.tops.assignAt(8, 51);

                    state.state = 0;

                },
                applyMove: function (m) {
                    // let's move stuff

                    if (!m.ok) {
                        //window.alert("INVALID MOVE");
                        return;
                    }

                    //window.alert("F:"+m.fromStack+":"+m.fromPos+" T:"+m.toStack+":"+m.toPos);

                    var state = this.getRwState();
                    state.restartLooped = m.restartLooped;

                    var stacksf = state.stacks.elementAt(m.fromStack);
                    var stackst = state.stacks.elementAt(m.toStack);

                    // for_each
                    for (var mc = 0; mc < 24; mc++) {
                        if (m.cards.elementAt(mc) == -1)
                            break;

                        stackst.assignAt(m.toPos + mc, stacksf.elementAt(m.fromPos + mc));
                        state.tops.assignAt(m.toStack, state.tops.elementAt(m.toStack) + 1);
                        if (state.state == 0 && m.fromStack == 8) {
                            state.firstHidden.assignAt(m.toStack, state.firstHidden.elementAt(m.toStack) + 1)
                        }

                        // IF dealer deck
                        if (m.toStack == 7) {
                            state.firstHidden.assignAt(m.toStack, state.tops.elementAt(m.toStack) - 1);
                            stacksf.assignAt(m.fromPos + mc, -1);
                            state.tops.assignAt(m.fromStack, state.tops.elementAt(m.fromStack) - 1);
                        } else {

                            // and unfold next card

                            stacksf.assignAt(m.fromPos + mc, -1);
                            state.tops.assignAt(m.fromStack, state.tops.elementAt(m.fromStack) - 1);
                        }
                    }

                    if (m.unfold != -1)
                        state.firstHidden.assignAt(m.fromStack, state.firstHidden.elementAt(m.fromStack) - 1);

                },
                render: function (elm) {

                },
                detectSuccess: function (m) {
                    var sum1 = 0;
                    var state = this.getRoState();
                    for (var n = 0; n < 9; n++)
                        sum1 += state.tops.elementAt(n);

                    var sum2 = 0;

                    for (var n = 9; n < 13; n++)
                        sum2 += state.tops.elementAt(n);

                    return sum1 == -9 && sum2 == 48 ? 1 : (m.restartLooped > 0 ? -1 : 0);
                },
                getMove: function () {
                    return this.m;
                },
                /*getMoves : function() {
			 return this.ms;
			 },*/
                prepareMovesForPos: function (s, c, moves) {},
                stepSimulation: function () {

                    this.ms = [];
                    //.clear();
                    this.m.reset();
                    this.m.restartLooped = this.getRoState().restartLooped;

                    var moves = this.ms;

                    var state = this.getRwState();
                    if (state.state == 0) {
                        state.state = this.prepareMovesForDeal(moves) ? 0 : 1;
                    }

                    if (state.state == 1 || state.state == 2) {
                        this.prepareOrganiseVisibleCardsMove(moves, false);
                        this.preparePullKingsToEmptyStacksMove(moves);
                        this.preparePullCardsToFinalisationMove(moves);
                        this.preparePullCardsFromDealerDeckMove(moves);
                        this.prepareRestartDealerDeckMove(moves);
                        this.prepareOrganiseRoomForDealerDeckPull(moves);

                        if (moves.length == 0 && state.state != 2) {
                            // bouncers
                            this.prepareOrganiseVisibleCardsMove(moves, true);
                            this.bouncerDebugger(moves, state.bouncerCount, state.bouncerIndex);
                            if (state.bouncerCount > 16)
                                state.state = 2;
                            else {
                                if (moves.length > 1) {
                                    state.bouncerCount++;

                                    if (state.bouncerIndex > moves.length - 1) {
                                        state.bouncerIndex = 0;
                                    }

                                    var bouncers = moves;
                                    moves = [];
                                    moves.push(bouncers[state.bouncerIndex++]);

                                } else
                                    state.state = 2;
                            }
                        } else if (moves.length != 0 && state.state == 2)
                            state.state = 1;

                    }
                    if (moves.length != 0)
                        this.m = moves[0];
                    else
                        this.m.reset();

                    return this.m;

                },
                prepareOrganiseVisibleCardsMove: function (moves, bouncers) {
                    var move = new Move();

                    var found = false;

                    var state = this.getRoState();

                    for (var t = 0; t < 7 //&& !found
                        ; t++) {

                        var tts = state.tops.elementAt(t);

                        if (tts == -1)
                            continue;

                        var stackst = state.stacks.elementAt(t);

                        var tsuit = Math.floor(stackst.elementAt(tts) / 16);
                        var tcard = Math.floor(stackst.elementAt(tts) % 16);

                        for (var f = 0; f < 8 //&& !found
                            ; f++) {
                            if (t == f)
                                continue;

                            var fts = state.tops.elementAt(f);

                            if (fts == -1)
                                continue;

                            var ffh = state.firstHidden.elementAt(f);
                            var stacksf = state.stacks.elementAt(f);

                            for (var ffhts = ffh + 1; //!found &&
                                ffhts <= fts; ffhts++) {

                                var fsuit = Math.floor(stacksf.elementAt(ffhts) / 16);
                                var fcard = Math.floor(stacksf.elementAt(ffhts) % 16);

                                // estetään tässä turhat siirrot eeestaas
                                if (!bouncers && (ffhts > 0 && ffhts > ffh + 1)) {

                                    //int psuit = stacks[f][ffhts-1] / 16;
                                    var pcard = Math.floor(stacksf.elementAt(ffhts - 1) % 16);

                                    if (pcard == fcard + 1)
                                        continue;
                                }

                                if (tcard != fcard + 1)
                                    continue;

                                if (((tsuit == 0 && (fsuit == 1 || fsuit == 2))) || ((tsuit == 1 && (fsuit == 0 || fsuit == 3))) || ((tsuit == 2 && (fsuit == 0 || fsuit == 3))) || ((tsuit == 3 && (fsuit == 1 || fsuit == 2)))) {
                                    found = true;
                                    move.assign(true, f, ffhts, t, tts + 1);
                                    move.cards.assignCopy(ffhts, fts + 1, stacksf);
                                    move.unfold = (ffh >= 0 && ffh == ffhts - 1) ? stacksf.elementAt(ffh) : -1;
                                    if (move.ok)
                                        move.restartLooped = -1;
                                    moves.push(move);
                                    move = new Move();

                                }

                            }

                        }
                    }

                },
                preparePullKingsToEmptyStacksMove: function (moves) {

                    // luetaan tops[xx] ylös suitsin mukaisiin stackeihin
                    // HUOM! ei pullata, jos on tarpeen pidättää eri värin suitsia
                    // jotta saadaan deal stackista kentälle
                    var move = new Move();

                    var found = false;
                    var state = this.getRoState();

                    for (var t = 0; t < 7 //&& !found
                        ; t++) {

                        var tts = state.tops.elementAt(t);

                        if (tts != -1)
                            continue;

                        // löydettiin tyhjä
                        // etsitäään kungen
                        for (var f = 0; f < 8 //&& !found
                            ; f++) {

                            if (t == f)
                                continue;

                            var fts = state.tops.elementAt(f);

                            if (fts == -1 && f < 7)
                                continue;
                            var ffh = state.firstHidden.elementAt(f);

                            var stacksf = state.stacks.elementAt(f);

                            for (var ffhts = ffh + 1; //!found &&
                                ffhts <= fts; ffhts++) {

                                //int fsuit = stacks[f][ffhts] / 16;
                                var fcard = Math.floor(stacksf.elementAt(ffhts) % 16);

                                if ((ffhts > 0 || (ffhts >= 0 && f == 7)) && ffhts > ffh + 1) {

                                    //int psuit = stacks[f][ffhts-1] / 16;
                                    var pcard = Math.floor(stacksf.elementAt(ffhts - 1) % 16);

                                    if (pcard == fcard + 1)
                                        continue;
                                }

                                if (fcard != 12)
                                    continue;

                                if (ffhts == 0)
                                    continue;
                                found = true;
                                move.assign(found, f, ffhts, t, tts + 1);
                                move.cards.assignCopy(ffhts, fts + 1, stacksf);
                                move.unfold = (ffh >= 0 && ffh == ffhts - 1) ? stacksf.elementAt(ffh) : -1;
                                if (move.ok)
                                    move.restartLooped = -1;

                                moves.push(move);
                                move = new Move();
                            }

                        }

                    }
                },
                preparePullCardsToFinalisationMove: function (moves) {

                    // luetaan tops[xx] ylös suitsin mukaisiin stackeihin
                    // TBD! HUOM! HUOM! ei pullata, jos on tarpeen pidättää eri värin suitsia
                    // jotta saadaan deal stackista kentälle
                    var move = new Move();

                    var found = false;
                    var state = this.getRoState();

                    for (var t = 9; t < 13 //&& !found
                        ; t++) {

                        var tts = state.tops.elementAt(t);

                        var tsuit = 12 - t;
                        var tcard = tts != -1 ? Math.floor(state.stacks.elementAt(t).elementAt(tts) % 16) : -1;

                        for (var f = 0; f < 8 //&& !found
                            ; f++) {

                            //int ffh = firstHidden[f];
                            var fts = state.tops.elementAt(f);

                            if (fts == -1)
                                continue;

                            var stacksf = state.stacks.elementAt(f);

                            var fsuit = Math.floor(stacksf.elementAt(fts) / 16);
                            var fcard = Math.floor(stacksf.elementAt(fts) % 16);
                            var ffh = state.firstHidden.elementAt(f);

                            // ordered grouped by suit
                            if (tsuit != fsuit)
                                continue;
                            if (tcard != fcard - 1)
                                continue;

                            // TBD: postponed pull if other suit hasn't been dealt from dealers deck?
                            // BUT: when will postponed pulls execute?
                            found = true;
                            move.assign(found, f, fts, t, tts + 1);
                            move.cards.assignCopy(fts, fts + 1, stacksf);

                            move.unfold = (ffh >= 0 && ffh == fts - 1) ? stacksf.elementAt(ffh) : -1;
                            if (move.ok)
                                move.restartLooped = -1;

                            moves.push(move);
                            move = new Move();
                        }
                    }

                },
                preparePullCardsFromDealerDeckMove: function (moves) {
                    var move = new Move();
                    // 3-kerrallaan siirto tähän, jotta saadaan kortit ulos pakasta
                    // tässä tehdään näinkö ?

                    // siirretään stackista 8 stackiin 7
                    var state = this.getRoState();
                    var t = 7;
                    var tts = state.tops.elementAt(t);

                    var f = 8;
                    for (var pc = 0; pc < 1; pc++) {

                        var fts = state.tops.elementAt(f);
                        if (fts == -1)
                            continue;

                        var ffh = state.firstHidden.elementAt(f);
                        var stacksf = state.stacks.elementAt(f);

                        move.assign(true, f, fts, t, tts + 1);
                        move.cards.assignCopy(fts, fts + 1, stacksf);
                        move.unfold = (ffh >= 0 && ffh == fts - 1) ? stacksf.elementAt(ffh) : -1;
                        moves.push(move);

                    }

                },
                prepareOrganiseRoomForDealerDeckPull: function (moves) {
                    /** tähän tarvitaan vempautus, jolla saman väriset
				 kortit venkoillaan alta pois, jotta saadaan nostettua
				 toiset kortit ylös ja toiset alas jakajan pakasta

				 */
                },
                prepareRestartDealerDeckMove: function (moves) {

                },
                prepareMovesForPos: function (s, c, movesForPos) {

                    var moves = [];

                    this.prepareOrganiseVisibleCardsMove(moves, true);
                    this.preparePullKingsToEmptyStacksMove(moves);
                    this.preparePullCardsToFinalisationMove(moves);
                    this.preparePullCardsFromDealerDeckMove(moves);
                    this.prepareRestartDealerDeckMove(moves);

                    if (moves.length == 0)
                        return false;

                    if (s == -1 && c == -1) {
                        for (var n = 0; n < moves.length; n++) {
                            movesForPos.push(moves[n]);
                        }
                        return movesForPos.length > 0;
                    }

                    for (var n = 0; n < moves.length; n++) {
                        var move = moves[n];

                        if (move.fromStack == s && move.fromPos == c) {
                            movesForPos.push(move);
                        }

                    }

                    if (movesForPos.length == 0)
                        return false;

                    return true;
                },
                prepareMovesForCard: function (cnum, movesForPos) {

                    var moves = [];

                    this.prepareOrganiseVisibleCardsMove(moves, true);
                    this.preparePullKingsToEmptyStacksMove(moves);
                    this.preparePullCardsToFinalisationMove(moves);
                    this.preparePullCardsFromDealerDeckMove(moves);
                    this.prepareRestartDealerDeckMove(moves);

                    if (moves.length == 0)
                        return false;

                    for (var n = 0; n < moves.length; n++) {
                        var move = moves[n];
                        if (move.cards.elementAt(0) == cnum)
                            movesForPos.push(move);
                    }

                    if (movesForPos.length == 0)
                        return false;

                    return true;
                },
                prepareMovesForDeal: function (moves) {
                    // tehdään samanlainen kuin muut eli
                    // tutkitaan pöytää ja päätetään mihin laitetaan
                    var move = new Move();
                    var state = this.getRoState();

                    if (state.state != 0)
                        return;

                    var t = -1;
                    var tts = -1;

                    for (t = 0; t < 7; t++) {
                        tts = state.tops.elementAt(t);
                        if (tts < t)
                            break;
                    }

                    if (t == 7)
                        return false;

                    var f = 8;
                    for (var pc = 0; pc < 1; pc++) {

                        var fts = state.tops.elementAt(f);
                        if (fts == -1)
                            continue;

                        var ffh = state.firstHidden.elementAt(f);
                        var stacksf = state.stacks.elementAt(f);

                        move.assign(true, f, fts, t, tts + 1);
                        move.cards.assignCopy(fts, fts + 1, stacksf);
                        move.unfold = (ffh >= 0 && ffh == fts - 1) ? stacksf.elementAt(ffh) : -1;
                        //( tts == t-1)  ? stacksf.elementAt(ffh): -1;
                        moves.push(move);

                        return true;
                    }
                },
                toHtmlTable: function (container) {

                    var content = "";
                    content += "<table><tbody>";

                    var state = this.getRoState();

                    for (var c = 0; c < 24; c++) {
                        content += "<tr>";
                        for (var s = 0; s < 7; s++) {
                            var stacksS = state.stacks.elementAt(s);
                            var sv = stacksS.elementAt(c);
                            if (sv < 0) {
                                content += "<td width='12%' />";
                            } else if (s == 8 || c <= state.firstHidden.elementAt(s)) {
                                if (c == state.tops.elementAt(s)) {
                                    content += "<td width='12%' style='color: red;'>(" + sv + ")</td>";
                                } else {
                                    content += "<td width='12%' style='color: blue;'>(" + sv + ")</td>";
                                }
                            } else {
                                content += "<td width='12%'>" + sv + "</td>";
                            }
                        }
                        content += "</tr>";
                    }
                    content += "</tbody></table>";

                    container.innerHTML = content;

                }
            };

            //window.SolSol = { solitaire: Solitaire };

            this.sol = new Solitaire();
        }
    });

    /*
     * @class Oskari.poc.yuilibrary.leaflet.Tile
     */
    Oskari.clazz.define('Oskari.games.bundle.solsol.Tile',

        /**
         * @method create called automatically on construction
         * @static
         *
         * Always extend this class, never use as is.
         */
        function (instance, player) {
            this.instance = instance;
            this.container = null;
            this.template = null;
            this.player = player;
        }, {
            getName: function () {
                return 'Oskari.games.bundle.solsol.Tile';
            },
            setEl: function (el, width, height) {
                this.container = $(el);
            },
            startPlugin: function () {
                this.setup();
            },
            stopPlugin: function () {
                this.container.empty();
            },
            getTitle: function () {
                return "Solitaire";
            },
            getDescription: function () {},
            getOptions: function () {

            },
            setState: function (state) {
                console.log("Tile.setState", this, state);
            },
            setup: function () {
                var me = this;
                var instance = me.instance;
                var cel = this.container;
                var tpl = this.template;
                var sandbox = instance.getSandbox();
                var layers = sandbox.findAllSelectedMapLayers();

                /*var status = cel.children('.oskari-tile-status');
		 status.empty();

		 status.append('(' + layers.length + ')');*/

            }
        }, {
            'protocol': ['Oskari.userinterface.Tile']
        });

    /**
     * @class Oskari.poc.jquery.bundle.FeatureInfoBundleInstance
     *
     */
    Oskari.clazz.define("Oskari.games.bundle.solsol.SolSolBundleInstance", function () {
        this.map = null;
        this.core = null;
        this.sandbox = null;
        this.mapmodule = null;
        this.started = false;
        this.template = null;
        this.plugins = {};

        this.player = null;

        /**
         * @property injected yuilibrary property (by bundle)
         */
        this.yuilibrary = null;

    }, {
        /**
         * @static
         * @property __name
         *
         */
        __name: 'solsol',
        "getName": function () {
            return this.__name;
        },
        /**
         * @method getSandbox
         *
         */
        getSandbox: function () {
            return this.sandbox;
        },
        /**
         * @method start
         *
         * implements BundleInstance start methdod
         *
         * Note this is async as DOJO requires are resolved and
         * notified by callback
         *
         */
        "start": function () {
            var me = this;

            if (me.started)
                return;

            var player = Oskari.clazz
                .create('Oskari.mapframework.solsol.SolSolPlayer');
            player.createAI();
            this.player = player;

            me.started = true;

            var sandbox = Oskari.getSandbox();
            me.sandbox = sandbox;

            sandbox.register(me);
            for (p in me.eventHandlers) {
                sandbox.registerForEventByName(me, p);
            }

            /**
             * Let's extend UI
             */
            var request = sandbox.getRequestBuilder('userinterface.AddExtensionRequest')(this);

            sandbox.request(this, request);

            /**
             * let's load dependencies me
             */
        },
        "init": function () {
            return null;
        },
        /**
         * @method update
         *
         * implements bundle instance update method
         */
        "update": function () {

        },

        /**
         * @method onEvent
         */
        onEvent: function (event) {

            var handler = this.eventHandlers[event.getName()];
            if (!handler)
                return;

            return handler.apply(this, [event]);

        },



        /**
         * @property eventHandlers
         * @static
         *
         */
        eventHandlers: {

        },

        /**
         * @method stop
         *
         * implements bundle instance stop method
         */
        "stop": function () {
            var sandbox = this.sandbox();
            for (p in this.eventHandlers) {
                sandbox.unregisterFromEventByName(this, p);
            }
            this.player.shutdown();

            var request = sandbox.getRequestBuilder('userinterface.RemoveExtensionRequest')(this);

            sandbox.request(this, request);

            this.sandbox.unregister(this);
            this.started = false;
        },
        setSandbox: function (sandbox) {
            this.sandbox = null;
        },
        startExtension: function () {
            this.plugins['Oskari.userinterface.Flyout'] = Oskari.clazz.create('Oskari.games.bundle.solsol.Flyout', this, this.player);
            this.plugins['Oskari.userinterface.Tile'] = Oskari.clazz.create('Oskari.games.bundle.solsol.Tile', this, this.player);
        },
        stopExtension: function () {
            this.plugins['Oskari.userinterface.Flyout'] = null;
            this.plugins['Oskari.userinterface.Tile'] = null;
        },
        getTitle: function () {
            return "Solitaire";
        },
        getDescription: function () {
            return "Solitaire";
        },
        getPlugins: function () {
            return this.plugins;
        },
        /**
         * @method refresh
         *
         * (re)creates selected layers to a hardcoded DOM div
         * #leaflet This
         */
        refresh: function () {
            var me = this;

            /*this.plugins['Oskari.userinterface.Flyout'].setup();
		this.plugins['Oskari.userinterface.Tile'].setup();*/

        }
    }, {
        "protocol": ["Oskari.bundle.BundleInstance", 'Oskari.userinterface.Extension']
    });



    /**
     * @class Oskari.mapframework.bundle.SolSolBundle
     *
     */
    Oskari.clazz
        .define(
            "Oskari.games.bundle.solsol.SolSolBundle",
            /**
             * @constructor
             *
             * Bundle's constructor is called when bundle is created. At
             * this stage bundle sources have been loaded, if bundle is
             * loaded dynamically.
             *
             */
            function () {

                /*
                 * Any bundle specific classes may be declared within
                 * constructor to enable stealth mode
                 *
                 * When running within map application framework - Bundle
                 * may refer classes declared with Oskari.clazz.define() -
                 * Bundle may refer classes declared with Ext.define -
                 * Bundle may refer classes declared within OpenLayers
                 * libary
                 *
                 *
                 */
            },

            {
                /*
                 * @method create
                 *
                 * called when a bundle instance will be created
                 *
                 */
                "create": function () {

                    return Oskari.clazz
                        .create("Oskari.games.bundle.solsol.SolSolBundleInstance");
                },

                /**
                 * @method update
                 *
                 * Called by Bundle Manager to provide state information to
                 * bundle
                 *
                 */
                "update": function (manager, bundle, bi, info) {

                }

            },

            /**
             * metadata
             */
            {

                "protocol": ["Oskari.bundle.Bundle",
       "Oskari.mapframework.bundle.extension.ExtensionBundle"],
                "source": {

                    "scripts": []
                },
                "bundle": {
                    "manifest": {
                        "Bundle-Identifier": "solsol",
                        "Bundle-Name": "solsol",
                        "Bundle-Author": [{
                            "Name": "jjk",
                            "Organisation": "nls.fi",
                            "Temporal": {
                                "Start": "2009",
                                "End": "2011"
                            },
                            "Copyleft": {
                                "License": {
                                    "License-Name": "EUPL",
                                    "License-Online-Resource": "http://www.paikkatietoikkuna.fi/license"
                                }
                            }
       }],
                        "Bundle-Name-Locale": {
                            "fi": {
                                "Name": " solsol",
                                "Title": " solsol"
                            },
                            "en": {}
                        },
                        "Bundle-Version": "1.0.0",
                        "Import-Namespace": ["Oskari", "jQuery"],
                        "Import-Bundle": {}
                    }
                }
            });

    /**
     * Install this bundle by instantating the Bundle Class
     *
     */
    Oskari.bundle_manager.installBundleClass("solsol",
        "Oskari.games.bundle.solsol.SolSolBundle");
    
     Oskari.clazz
        .create(
            "Oskari.games.bundle.solsol.SolSolBundle").create().start()

    Oskari.getSandbox().postRequestByName("userinterface.UpdateExtensionRequest",
         [Oskari.getSandbox().findRegisteredModuleInstance("solsol"),"detach","solsol"]);
})(Oskari,jQuery);
