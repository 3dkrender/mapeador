class Quest extends Phaser.Scene {
    constructor() {
        super('Quest');
    }

    init() {
        var Quest = this;

        Quest.mapa = {
            "key": "mazmorra",
            "file": "mazmorra.json",
            "inicio": {
                "x": 100,
                "y": 725
            },
            "spritesheets": [{
                "key": "suelos",
                "file": "suelos.png",
                "width": 32,
                "height": 32
            }],
            "Ground": [{
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
            ]
        }
    }
    preload() {
        var Quest = this;
        // Cargar mapa y tilesets
        Quest.load.tilemapTiledJSON(Quest.mapa.key, `assets/mapas/${Quest.mapa.key}/${Quest.mapa.file}`);
        Quest.mapa.spritesheets.forEach((sprites) => {
            Quest.load.spritesheet(sprites.key, `assets/mapas/tilesets/${sprites.file}`, {
                frameWidth: sprites.width,
                frameHeight: sprites.height
            });
        });
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
        var Quest = this;
        Quest.bgSheets = [];
        Quest.bgLayers = [];
        Quest.tileMap = Quest.make.tilemap({
            key: Quest.mapa.key
        });
        Quest.mapa.Ground.forEach((layer) => {
            layer.sheets.forEach((sheet) => {
                if (Quest.bgSheets.every(x => x.name != sheet))
                    Quest.bgSheets.push(Quest.tileMap.addTilesetImage(sheet));
            });
        });
        Quest.mapa.Ground.forEach((layer) => {
            Quest.bgLayers.push(Quest.tileMap.createStaticLayer(layer.key, Quest.bgSheets, 0, 0));
        });

        // Añadimos el personaje
        Quest.animaBrujita();
        Quest.player = Quest.add.sprite(400, 300, 'idleF', 0).play('idleF');
        Quest.physics.add.existing(Quest.player);
        Quest.physics.world.bounds.setTo(0, 0, Quest.tileMap.widthInPixels, Quest.tileMap.heightInPixels);
        Quest.player.body.setCollideWorldBounds(true);

        // Activar cámara de seguimiento
        Quest.cameras.main.startFollow(Quest.player, true);

        // Activar cursores
        Quest.cursors = Quest.input.keyboard.createCursorKeys();
    }

    update() {
        var Quest = this;
        Quest.velocidad = 150;
        var key = null;
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
        var Quest = this;
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
    parseMap() {
        var Quest = this;
    }
}
export default Quest;