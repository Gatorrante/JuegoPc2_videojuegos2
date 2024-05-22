var juego = new Phaser.Game(370, 768, Phaser.CANVAS, "bloque_juego");
var teclaDerecha;
var teclaIzquierda;
var teclaArriba;
var teclaAbajo;
var fondo;
var carro;
var cursores;
var enemigos;
var balas;
var gasolinas;
var timer;
var timerGasolina;
var puntos = 0;
var enemigosDerrotados = 0;
var vidas = 3;
var textoPuntos;
var textoVidas;
var enemigosObjetivo = 2; // Establecer la cantidad de enemigos a derrotar
var velocidadPersonaje = 5;

// Variables para configurar el spawn de enemigos
var velocidadSpawn = 3000; // tiempo en milisegundos
var cantidadEnemigosSpawn = 1; // cantidad de enemigos por spawn

var Juego = {
    preload: function () {
        juego.load.image("bg", "img/bg2.png");
        for (let i = 1; i <= 6; i++) {
            juego.load.spritesheet(
                "personaje" + i,
                "img/personaje" + i + ".png",
                48,
                58
            );
        }
        juego.load.spritesheet("carroMalo", "img/ENEMIGOS.png", 48, 48);
        juego.load.image("gasolina", "img/gas.png");
        juego.load.image("bala", "img/laser.png");
        juego.load.audio("disparo", "audio/laser.mp3");
        juego.load.audio("explosion", "audio/explosion.mp3");
        juego.load.audio("audio", "audio/audio.mp3");
    },

    create: function () {
        fondo = juego.add.tileSprite(0, 0, 370, 768, "bg");

        // Asegurarse de convertir el índice a número y manejar el índice correctamente
        // Asegurarse de que el índice del personaje se convierte correctamente de string a número
        var personajeSeleccionado =
            parseInt(localStorage.getItem("personajeSeleccionado")) || 0;

        // Crear el sprite del personaje con el índice correcto
        carro = juego.add.sprite(
            100,
            600,
            "personaje" + (personajeSeleccionado + 1)
        ); // Asegúrate de que los nombres de los recursos son correctos
        carro.animations.add("movi", [0, 1, 2], 10, true);
        carro.animations.add("izquierda", [3, 4, 5], 10, true);
        carro.animations.add("derecha", [6, 7, 8], 10, true);
        carro.anchor.setTo(0.5);
        juego.physics.enable(carro, Phaser.Physics.ARCADE);
        console.log(
            "Índice del personaje seleccionado: ",
            personajeSeleccionado
        );

        botonDisparo = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        enemigos = juego.add.group();
        enemigos.enableBody = true;
        enemigos.physicsBodyType = Phaser.Physics.ARCADE;
        enemigos.createMultiple(20, "carroMalo");
        enemigos.setAll("anchor.x", 0.5);
        enemigos.setAll("anchor.y", 0.5);
        enemigos.setAll("outOfBoundsKill", true);
        enemigos.setAll("checkWorldBounds", true);

        balas = juego.add.group();
        balas.enableBody = true;
        balas.physicsBodyType = Phaser.Physics.ARCADE;
        balas.createMultiple(20, "bala");
        balas.setAll("anchor.x", 1.5);
        balas.setAll("anchor.y", 1.5);
        balas.setAll("outOfBoundsKill", true);
        balas.setAll("checkWorldBounds", true);

        gasolinas = juego.add.group();
        gasolinas.enableBody = true;
        gasolinas.physicsBodyType = Phaser.Physics.ARCADE;
        gasolinas.createMultiple(20, "gasolina");
        gasolinas.setAll("anchor.x", 0.5);
        gasolinas.setAll("anchor.y", 0.5);
        gasolinas.setAll("outOfBoundsKill", true);
        gasolinas.setAll("checkWorldBounds", true);

        timer = juego.time.events.loop(1500, this.crearCarroMalo, this);
        timerGasolina = juego.time.events.loop(2000, this.crearGasolina, this);

        teclaDerecha = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        teclaIzquierda = juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        teclaArriba = juego.input.keyboard.addKey(Phaser.Keyboard.UP);
        teclaAbajo = juego.input.keyboard.addKey(Phaser.Keyboard.DOWN);

        botonDisparo = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        textoPuntos = juego.add.text(20, 20, "Puntos: 0", {
            font: "14px Arial",
            fill: "#fff",
        });
        textoVidas = juego.add.text(20, 40, "Vidas: 3", {
            font: "14px Arial",
            fill: "#fff",
        });
        // Timer para crear enemigos más rápidamente y en mayor cantidad
        timer = juego.time.events.loop(
            velocidadSpawn,
            this.crearCarroMalo,
            this
        );
        var audio = juego.add.audio("audio");
        audio.play();
    },

    update: function () {
        fondo.tilePosition.y += 3;

        var moving = false; // Rastreo de movimiento del personaje

        // Movimiento horizontal del personaje principal
        if (teclaDerecha.isDown && carro.x < juego.width - carro.width) {
            carro.animations.play("derecha");
            carro.x += velocidadPersonaje;
            moving = true; // Está en movimiento
        } else if (teclaIzquierda.isDown && carro.x > 0) {
            carro.animations.play("izquierda");
            carro.x -= velocidadPersonaje;
            moving = true; // Está en movimiento
        }

        // Movimiento vertical del personaje principal
        if (teclaArriba.isDown && carro.y > 0) {
            carro.y -= velocidadPersonaje;
            if (!moving) {
                // Solo reproducir animación de movi si no se mueve horizontalmente
                carro.animations.play("movi");
            }
        } else if (teclaAbajo.isDown && carro.y < juego.height - carro.height) {
            carro.y += velocidadPersonaje;
            if (!moving) {
                // Solo reproducir animación de movi si no se mueve horizontalmente
                carro.animations.play("movi");
            }
        }

        // Si no se están presionando teclas de movimiento, reproducir animación de movi
        if (
            !teclaDerecha.isDown &&
            !teclaIzquierda.isDown &&
            !teclaArriba.isDown &&
            !teclaAbajo.isDown
        ) {
            carro.animations.play("movi");
        }
        // if (juego.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        //     this.disparar();
        // }

        juego.physics.arcade.overlap(
            balas,
            enemigos,
            this.explosion,
            null,
            this
        );
        juego.physics.arcade.overlap(carro, enemigos, this.choque, null, this);
        juego.physics.arcade.overlap(
            carro,
            gasolinas,
            this.recogerGasolina,
            null,
            this
        );
        juego.physics.arcade.overlap(
            balas,
            enemigos,
            this.explosion,
            null,
            this
        );
        juego.physics.arcade.overlap(carro, enemigos, this.choque, null, this);
        juego.physics.arcade.overlap(
            carro,
            gasolinas,
            this.recogerGasolina,
            null,
            this
        );

        // Comprobar colisión con el borde superior para avanzar de nivel
        if (carro.y <= 0) {
            this.iniciarFadeoutnextLevel("nivel2.html");
        }
    },

    disparar: function () {
        var bala = balas.getFirstExists(false);
        if (bala) {
            bala.reset(
                carro.x + carro.width / 2 - bala.width / 2,
                carro.y - bala.height
            );

            bala.body.velocity.y = -300;
            tiempoBala = juego.time.now + 100;
            const sonido_disparo = juego.sound.add("disparo");
            sonido_disparo.play();
        }
    },

    explosion: function (bala, enemigo) {
        bala.kill();
        enemigo.kill();
        juego.sound.play("explosion");
        puntos += 100;
        enemigosDerrotados++;
        textoPuntos.text = "Puntos: " + puntos;
        if (enemigosDerrotados >= enemigosObjetivo) {
            this.iniciarFadeoutnextLevel("nivel2.html"); // Ajusta la URL según necesidad
        }
    },

    choque: function (carro, enemigo) {
        enemigo.kill();
        vidas--;
        textoVidas.text = "Vidas: " + vidas;
        if (vidas === 0) {
            this.iniciarFadeOutGameOver("index.html");
        }
    },

    recogerGasolina: function (carro, gasolina) {
        gasolina.kill();
        puntos += 150;
        textoPuntos.text = "Puntos: " + puntos;
    },

    crearCarroMalo: function () {
        for (var i = 0; i < cantidadEnemigosSpawn; i++) {
            var posicion = Math.floor(Math.random() * juego.width);
            var enemigo = enemigos.getFirstDead();
            if (enemigo) {
                enemigo.reset(posicion, 0);
                enemigo.body.velocity.y = 200;
            }
        }
    },

    crearGasolina: function () {
        var posicion = Math.floor(Math.random() * 3) + 1;
        var gasolina = gasolinas.getFirstDead();
        gasolina.reset(posicion * 73, 0);
        gasolina.body.velocity.y = 200;
        gasolina.anchor.setTo(0.5);
    },

    iniciarFadeoutnextLevel: function () {
        var fadeOutSprite = juego.add.sprite(0, 0, "bg");
        fadeOutSprite.width = juego.width;
        fadeOutSprite.height = juego.height;
        fadeOutSprite.alpha = 0;

        var text = juego.add.text(
            juego.world.centerX,
            juego.world.centerY,
            "Llegaste a tiempo",
            {
                font: "40px Arial",
                fill: "#ffffff",
            }
        );
        text.anchor.setTo(0.5, 0.5);

        var fadeOutTween = juego.add
            .tween(fadeOutSprite)
            .to({ alpha: 1 }, 1500, Phaser.Easing.Linear.None, true); //parametros: (objetivo, duración, tipo de animación, autoiniciar)

        // Crear temporizador para actualizar el texto del contador
        var counter = 3;
        var interval = setInterval(function () {
            counter--;
            if (counter >= 0) {
                text.setText("Nivel 2 en " + counter);
            } else {
                text.setText(""); // Borra el texto cuando el contador llega a 0
                clearInterval(interval);
            }
        }, 1000); // Cambia cada 500 ms

        fadeOutTween.onComplete.add(function () {
            window.location.href = "nivel2.html"; // Asegúrate de que esta URL es correcta
        }, this);
    },

    iniciarFadeOutGameOver: function (targetUrl) {
        var fadeOutSprite = juego.add.sprite(0, 0, "bg");
        fadeOutSprite.width = juego.width;
        fadeOutSprite.height = juego.height;
        fadeOutSprite.alpha = 0;

        var text = juego.add.text(
            juego.world.centerX,
            juego.world.centerY,
            "No llegaras a tiempo",
            {
                font: "40px Arial",
                fill: "#ffffff",
            }
        );
        text.anchor.setTo(0.5, 0.5);

        var fadeOutTween = juego.add
            .tween(fadeOutSprite)
            .to({ alpha: 1 }, 1500, Phaser.Easing.Linear.None, true); // parametros

        var counter = 2;
        var interval = setInterval(function () {
            counter--;
            if (counter >= 0) {
                text.setText("Game over");
            }
        }, 1000); // Cambia cada 500 ms

        fadeOutTween.onComplete.add(function () {
            window.location.href = targetUrl; // redirigir a la portada
        }, this);
    },
};

juego.state.add("principal", Juego);
juego.state.start("principal");
