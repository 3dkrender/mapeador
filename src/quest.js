/**
 * Los mapas se crean en Tiled con capas que serán interpretadas por grupos
 * 
 * Ground: Todas las capas de background (suelo)
 * Over: Todas las capas por encima del nivel del jugador (ToDo)
 * Block: Capas de bloqueo (ToDo)
 * Events: Capas con eventos (ToDo)
 * 
 * Animaciones: Capas con tiles animados. (ToDo)
 */
class Quest extends Phaser.Scene {
    constructor() {
        super('Quest');
    }
    init() {
        let Quest = this;
        /**
         * Para la primera versión del programa voy a utilizar un objeto que contiene la 
         * información del mapa. 
         * En una futura versión trataremos de extraer de forma automátizada toda esta
         * información directamente del json exportado por Tiled
         * 
         * Se incluye la inforación de las capas referidas al diseño del mapa: Ground y Over.
         */
        Quest.mapa = {
            "key": "mazmorra",
            "file": "mazmorra.json",
            "inicio": {         // Posición inicial de Player
                "x": 100,
                "y": 725
            },
            "spritesheets": [{      // Array con los spritesheets utilizados en el mapa
                "key": "suelos",
                "file": "suelos.png",
                "width": 32,
                "height": 32
            },
        {
            "key": "Anim_Infernus_Lightsources_5",
            "file": "Anim_Infernus_Lightsources_5.png",
            "width": 64,
            "height": 64
        }],
            "Ground": [{            // Array con las capas de "suelo" {nombre de capa, [spritesheets empleados]}
                "key": "suelo1",
                "sheets": [
                    "suelos"
                ]
            },
            {
                "key": "suelo2",
                "sheets": [
                    "suelos"
                ]
            },
            {
                "key": "suelo3",
                "sheets": [
                    "suelos"
                ]
            },
            {
                "key": "suelo4",
                "sheets": [
                    "suelos"
                ]
            }
            ],
            "Block": [
                {
                    "key": "bloqueo",
                    "sheets": [
                        "suelos"
                    ]
                }
            ],
            "Animaciones": [{
                "key": "animacion",
                "sheets": [
                    "Anim_Infernus_Lightsources_5"
                ]
            }
            ]
        }
    }
    preload() {
        let Quest = this;
        // Cargar mapa y tilesets
        Quest.load.tilemapTiledJSON(Quest.mapa.key, `assets/mapas/${Quest.mapa.key}/${Quest.mapa.file}`);
        Quest.mapa.spritesheets.forEach((sprites) => {
            Quest.load.spritesheet(sprites.key, `assets/mapas/tilesets/${sprites.file}`, {
                frameWidth: sprites.width,
                frameHeight: sprites.height
            });
        });
        /**
         * Brujita es un personaje creado con la herramienta freeware "Character Maker Software"
         * https://www.dropbox.com/s/4g9jn0i91d89ohc/Character_Creator.zip?dl=0
         * 
         * Se incluye un "player" en el proyecto para testear el mapa
         */
        Quest.load.spritesheet('brujitaWalk', 'assets/brujita.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        Quest.load.spritesheet('brujita_idle', 'assets/brujita_idle1.png', {
            frameHeight: 128,
            frameWidth: 128
        });
    }
    create() {
        let Quest = this;
        Quest.bgSheets = [];
        Quest.bgLayers = [];
        Quest.Animaciones = [];
        Quest.animaLayers = [];
        Quest.bloqueo = [];
        Quest.bloqueoLayers = [];
        // Crear mapa
        Quest.tileMap = Quest.make.tilemap({
            key: Quest.mapa.key
        });

        // Cargar tilesets para las capas de suelo
        Quest.mapa.Ground.forEach((layer) => {
            layer.sheets.forEach((sheet) => {
                if (Quest.bgSheets.every(x => x.name != sheet)) // No cargar tilesets ya cargados
                    Quest.bgSheets.push(Quest.tileMap.addTilesetImage(sheet));
            });
        });
        // Cargar tilesets para capas de bloqueo
        Quest.mapa.Block.forEach((layer) => {
            layer.sheets.forEach((sheet) => {
                Quest.bloqueo.push(Quest.tileMap.addTilesetImage(sheet));
            });
        });
        // cargar tilesets para las capas de animación
        Quest.mapa.Animaciones.forEach((layer) => {
            layer.sheets.forEach((sheet) => {
                Quest.Animaciones.push(Quest.tileMap.addTilesetImage(sheet));
            });
        });

        // Generar las capas estáticas del suelo
        Quest.mapa.Ground.forEach((layer) => {
            Quest.bgLayers.push(Quest.tileMap.createStaticLayer(layer.key, Quest.bgSheets, 0, 0));
        });
        // Generar capa estática de bloqueo
        Quest.mapa.Block.forEach((layer) => {
            Quest.bloqueoLayers.push(Quest.tileMap.createStaticLayer(layer.key, Quest.bloqueo, 0, 0));
        });
        // Generar capas dinámicas para animaciones
        Quest.mapa.Animaciones.forEach((layer) => {
            Quest.animaLayers.push(Quest.tileMap.createDynamicLayer(layer.key, Quest.Animaciones, 0, 0));
        });
        // Parsear animaciones
        Quest.parseAnimaciones(Quest.tileMap);

        /**
         * Contenido extra para ilustrar el ejemplo
         */
        // Añadimos el personaje
        Quest.animaBrujita();
        Quest.player = Quest.add.sprite(400, 300, 'idleF', 0).play('idleF');
        Quest.physics.add.existing(Quest.player);
        Quest.physics.world.bounds.setTo(0, 0, Quest.tileMap.widthInPixels, Quest.tileMap.heightInPixels);
        Quest.player.body.setCollideWorldBounds(true);

        /**
         * Activar bloqueos para el personaje
         * 
         * El personaje escogido para este ejemplo tiene mucho espacio lateral en cada frame de su spritesheet
         * por lo que los bloqueos pueden resultar no muy realistas.
         * 
         * En la capa de bloqueo podemos pintar con cualquier tile por donde queremos activar los bloqueos.
         */
        Quest.bloqueoLayers.forEach((layer) => {
            layer.setVisible(false);              // Ocultamos la capa. Por eso da igual con qué pintemos los bloqueos
            layer.setCollisionByExclusion([-1]);  // Cualquier valor en la capa que sea diferente de '-1' bloquea  
            Quest.physics.add.collider(Quest.player, layer);    // Activamos el collider
        });

        // Actilet cámara de seguimiento
        Quest.cameras.main.startFollow(Quest.player, true);
        Quest.cameras.main.setBounds(0, 0, Quest.tileMap.widthInPixels, Quest.tileMap.heightInPixels);

        // Actilet cursores
        Quest.cursors = Quest.input.keyboard.createCursorKeys();

        console.log(Quest.tileMap)
    }

    /**
     * La función update() se emplea básicamente para mover el Player; no afecta al 
     * sistema de mapeado
     */
    update() {
        let Quest = this;
        Quest.velocidad = 150;
        let key = null;
        if (Quest.cursors.left.isDown) {
            key = Quest.player.anims.getCurrentKey();
            if (key != 'walkL') Quest.player.anims.stop(key);
            if (!Quest.player.anims.isPlaying) {
                Quest.player.anims.play('walkL');
            }
            Quest.player.body.setVelocityX(-Quest.velocidad);
            Quest.direccion = 'left';
        } else if (Quest.cursors.right.isDown) {
            key = Quest.player.anims.getCurrentKey();
            if (key != 'walkR') Quest.player.anims.stop(key);
            if (!Quest.player.anims.isPlaying) {
                Quest.player.anims.play('walkR');
            }
            Quest.player.body.setVelocityX(Quest.velocidad);
            Quest.direccion = 'right';
        } else if (Quest.cursors.up.isDown) {
            key = Quest.player.anims.getCurrentKey();
            if (key != 'walkU') Quest.player.anims.stop(key);
            if (!Quest.player.anims.isPlaying) {
                Quest.player.anims.play('walkU');
            }
            Quest.player.body.setVelocityY(-Quest.velocidad);
            Quest.direccion = 'up';
        } else if (Quest.cursors.down.isDown) {
            key = Quest.player.anims.getCurrentKey();
            if (key != 'walkD') Quest.player.anims.stop(key);
            if (!Quest.player.anims.isPlaying) {
                Quest.player.anims.play('walkD');
            }
            Quest.player.body.setVelocityY(Quest.velocidad);
            Quest.direccion = 'down';
        } else {
            Quest.player.body.setVelocity(0);
            key = Quest.player.anims.getCurrentKey();
            if (key == 'walkL' || key == 'walkR' || key == 'walkU' || key == 'walkD') {
                Quest.player.anims.stop(key);
                switch (Quest.direccion) {
                    case 'left':
                        Quest.player.anims.play('idleL');
                        break;
                    case 'right':
                        Quest.player.anims.play('idleR');
                        break;
                    case 'down':
                        Quest.player.anims.play('idleF');
                        break;
                    case 'up':
                        Quest.player.anims.play('idleB');
                        break;
                }
            }
        }
    }

    animaBrujita() {
        let Quest = this;
        Quest.anims.create({
            key: "walkR",
            frames: Quest.anims.generateFrameNames('brujitaWalk', {
                frames: [16, 17, 18, 19, 20, 21, 22, 23]
            }),
            frameRate: 15,
            repeat: -1
        });
        Quest.anims.create({
            key: "walkL",
            frames: Quest.anims.generateFrameNames('brujitaWalk', {
                frames: [8, 9, 10, 11, 12, 13, 14, 15]
            }),
            frameRate: 15,
            repeat: -1
        });
        Quest.anims.create({
            key: "walkD",
            frames: Quest.anims.generateFrameNames('brujitaWalk', {
                frames: [0, 1, 2, 3, 4, 5, 6, 7]
            }),
            frameRate: 15,
            repeat: -1
        });
        Quest.anims.create({
            key: "walkU",
            frames: Quest.anims.generateFrameNames('brujitaWalk', {
                frames: [24, 25, 26, 27, 28, 29, 30, 31]
            }),
            frameRate: 15,
            repeat: -1
        });
        Quest.anims.create({
            key: "idleF",
            frames: Quest.anims.generateFrameNames('brujita_idle', {
                frames: [0, 1, 2]
            }),
            frameRate: 5,
            repeat: -1
        });
        Quest.anims.create({
            key: "idleL",
            frames: Quest.anims.generateFrameNames('brujita_idle', {
                frames: [3, 4, 5]
            }),
            frameRate: 5,
            repeat: -1
        });
        Quest.anims.create({
            key: "idleR",
            frames: Quest.anims.generateFrameNames('brujita_idle', {
                frames: [6, 7, 8]
            }),
            frameRate: 5,
            repeat: -1
        });
        Quest.anims.create({
            key: "idleB",
            frames: Quest.anims.generateFrameNames('brujita_idle', {
                frames: [9, 10, 11]
            }),
            frameRate: 5,
            repeat: -1
        });

    }
    parseAnimaciones(mapa) {
        let Quest = this;
        Quest.tilesAnimados = Quest.getTilesAnimados(mapa);
        Quest.activaAnimaciones(Quest.tilesAnimados);
    }
    /**
     * 
     * @param {Phaser.tilemap} mapa 
     * 
     * Este proceso busca los tilesets que incluyen la clave "animation" y extrae 
     * en un array los tiles afectados por la animación y cómo animarlos
     */
    getTilesAnimados(mapa) {
        let Quest = this;
        let tilesAnimados = [];
        mapa.tilesets.forEach((tileset) => {
            /**
             * Bucle para recorrer todos los tilesets del mapa
             */
            let tileData = tileset.tileData;
            Object.keys(tileData).forEach((index) => {
                /**
                 * Bucle para buscar animaciones entre las claves de datos
                 */
                index = parseInt(index);
                if (tileData[index].hasOwnProperty("animation")) {
                    /**
                     * Extraer la información de los tiles de la animación de los datos de tilesets
                     * 
                     * Estas animaciones están creadas desde Tiled
                     */
                    let datosTilesAnimacion = {
                        index: index + tileset.firstgid, // Posición global del tile animado
                        frames: [],         // array con los frames de la animación
                        tiles: [],          // array con las posiciones del mapa afectadas por la animación
                        rate: 1,            // Modificador de velocidad para la animación
                    };
                    tileData[index].animation.forEach((datosFrame) => {
                        /**
                         * lectura de los frames de la animación
                         * 
                         * firstgid es el índice inicial de cada capa teniendo en cuenta todos
                         * los tiles de cada capa anterior. Si tuviéramos 3 capas de
                         * 500 tiles cada capa, el firstgid de estas 3 capas sería:
                         * capa 0: firstgid = 0
                         * capa 1: firstgid = 500
                         * capa 2: firstgid = 1000
                         * 
                         * animation: Array, contiene la información de los frames de la animación:
                         * duración del frame y posición del frame dentro de su propio spritesheet
                         * 
                         * Si tenemos este ejemplo en el mapa:
                         * *****************************************
                         * tilesets: Array(2)
                         *  0: (tileset sin animaciones...)
                         *  1: (tileset con animaciones...)
                         *      name: "Anim_Infernus_Lightsources_5"
                         *      firstgid: 3601
                         *      tileWidth: 64
                         *      tileHeight: 64
                         *      tileData:
                         *          0:
                         *              animation: Array(3)
                         *                  0: {duration: 150, tileid: 0}
                         *                  1: {duration: 150, tileid: 1}
                         *                  2: {duration: 150, tileid: 2}
                         * ********************************************
                         * El resultado sería:
                         * datosTilesAnimacion.frames = [
                         *      { duration: 150, tileid: 3601},
                         *      { duration: 150, tileid: 3602},
                         *      { duration: 150, tileid: 3603}
                         *  ]
                         */

                        let frame = {
                            duration: datosFrame.duration,
                            tileid: datosFrame.tileid + tileset.firstgid
                        };
                        datosTilesAnimacion.frames.push(frame);
                    });
                    /**
                     * El siguiente paso es localizar los tiles de las animaciones dentro de
                     * las capas dinámicas del mapa para su posicionamiento.
                     */
                    Quest.tileMap.layers.forEach((layer) => {
                        let tiles = [];
                        if (layer.tilemapLayer.type === "DynamicTilemapLayer") {
                            layer.data.forEach((fila) => {
                                fila.forEach((tile) => {
                                    if ((tile.index - tileset.firstgid) === index) {
                                        tiles.push(tile);
                                    }
                                });
                            });
                        }
                        if (tiles.length > 0) {
                            datosTilesAnimacion.tiles.push(tiles);
                        }
                    });


                    tilesAnimados.push(datosTilesAnimacion);
                }
            });
        });
        return tilesAnimados;
    }
    /**
     * 
     * @param {Array} tilesAnimados Array de animaciones creadas con Tiled
     * 
     * [ { index, frame [ {duracion, tileid} ] } ]
     * 
     * Hay que recorrer la capa de animaciones buscando los índices de las animaciones. 
     * Tiled marca cada tile no-animado con "-1" y el tile animado con el índice de la animación
     */
    activaAnimaciones(tilesAnimados) {
        let Quest = this;
        let c = 0;
        let framesAnim = [];
        // localizar tileset de la animación
        tilesAnimados.forEach((animacion) => {
            /**
             * Hay que localizar el tileset al que pertenecen los tiles de la animación
             */
            for (c = 0; c < Quest.tileMap.tilesets.length; c++) {
                if (animacion.index >= Quest.tileMap.tilesets[c].firstgid) {
                    Quest.tileset = Quest.tileMap.tilesets[c];
                } else {
                    break;
                }
            }
            /**
             * Ahora se puede obtener la posición absoluta de cada frame dentro del tileset
             */
            animacion.frames.forEach((frame) => {
                framesAnim.push(frame.tileid - Quest.tileset.firstgid);
            });
            /**
             * Generar las animaciones. Se emplea el propio número de index (parseado a texto)
             * como nombre de la animación.
             * Ahora se ve la necesidad de conocer el nombre del tileset donde están los frames
             */
            Quest.clave = animacion.index.toString();
            Quest.anims.create({
                key: Quest.clave,
                frames: Quest.anims.generateFrameNames(Quest.tileset.name, {
                    frames: framesAnim
                }),
                frameRate: 15,
                repeat: -1
            });
            // Activar animaciones en el mapa
            framesAnim = [];
            animacion.tiles.forEach((tipoAnimacion) => {
                tipoAnimacion.forEach((ocurrencia) => {
                    Quest.add.sprite(ocurrencia.pixelX,
                        ocurrencia.pixelY,
                        Quest.tileset.name,
                        ocurrencia.index - Quest.tileset.firstgid)
                        .play(Quest.clave)
                        .setOrigin(0);
                });
            });
        });
    }
}
export default Quest;