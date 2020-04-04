import Quest from './quest.js';

const config = {
    title: "mapeador",
    version: "0.0.1",
    type: Phaser.AUTO,
    scale: {
        parent: "phaser_container",
        width: 800,
        height: 600,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: "#4834d4",
    pixelArt: true,
    physics: {
        default: "arcade",
        "arcade": {
            gravity: {
                y: 0
            },
            debug: true
        }
    },
    scene: [
        Quest
    ]
};

new Phaser.Game(config);