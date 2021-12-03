var stage, loader, map, man;
const step = 64;

function init() {
    let canvas = document.getElementById("gameCanvas")
    map = [];
    let h = canvas.height / step;
    let w = canvas.width / step;
    console.log(h,w);
    for (let i = 0; i < w; i++) {
        map[i] = [];
        for (let j = 0; j < h; j++) {
            map[i][j] = 0;
        }
    }
    stage = new createjs.StageGL("gameCanvas");
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener("tick", stage);

    let background = new createjs.Shape();
    background.graphics.beginRadialGradientFill(["#A9A9A9", "#B22222", "#800000"], [0, 0.6, 1], canvas.width / 2, canvas.height / 2, 10, canvas.width / 2, canvas.height / 2, 800)
        .drawRect(0, 0, canvas.width, canvas.height);
    background.x = 0;
    background.y = 0;
    background.name = "background";
    background.cache(0, 0, canvas.width, canvas.height);

    stage.addChild(background);

    stage.update();

    var manifest = [
        {"src": "man.png", "id": "man"},
        {"src": "wall.png", "id": "wall"},
        {"src": "enemy.png", "id": "enemy"},
        {"src": "man_right.png", "id": "man_right"},
        {"src": "man_left.png", "id": "man_left"},
        {"src": "man_up.png", "id": "man_up"},
        {"src": "man_down.png", "id": "man_down"},
    ];

    loader = new createjs.LoadQueue(true);
    loader.addEventListener("complete", handleComplete);
    loader.loadManifest(manifest, true, "./img/");

}

function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        default:
            return 0;
    }
}

function handleComplete() {
    createWall();
    createEnemy(10);
    createMan();
    window.onkeydown=handleMove;
}
function handleMove(event){
    console.log("press");
    let keyMap = {
        "37": "left",
        "38": "up",
        "39": "right",
        "40": "down"
    };
    if (keyMap[event.keyCode]) {
        console.log("press");
        event.preventDefault();
        if (keyMap[event.keyCode] === "left") {
            manMove(-1, 0).then(()=>{
                man.image=loader.getResult("man_left");
            });
        } else if (keyMap[event.keyCode] === "right") {
            manMove(1, 0).then(man.image=loader.getResult("man_right"));
        } else if (keyMap[event.keyCode] === "up") {
            manMove(0, -1).then(man.image=loader.getResult("man_up"));
        } else if (keyMap[event.keyCode] === "down") {
            manMove(0, 1).then(man.image=loader.getResult("man_down"));
        }
    }
}
// $(document).keydown(function (ev) {
//     let keyMap = {
//         "37": "left",
//         "38": "up",
//         "39": "right",
//         "40": "down"
//     };
//     if (keyMap[ev.keyCode]) {
//         console.log("press");
//         ev.preventDefault();
//         if (keyMap[ev.keyCode] === "left") {
//             manMove(-1, 0);
//         } else if (keyMap[ev.keyCode] === "right") {
//             manMove(1, 0);
//         } else if (keyMap[ev.keyCode] === "up") {
//             manMove(0, -1);
//         } else if (keyMap[ev.keyCode] === "down") {
//             manMove(0, 1);
//         }
//     }
// });

async function manMove(x, y) {
    //console.log(x, y)
    let x_index = calIndex(man.x);
    let y_index = calIndex(man.y);
    if (map[x_index + x][y_index + y] === 0) {
        map[x_index][y_index] = 0;
        map[x_index + x][y_index + y] = 1;
        createjs.Tween.get(man, {override: false}).to({
            x: calPos(x_index + x),
            y: calPos(y_index + y),
        }, 0, createjs.Ease.getPowOut(2));
    } else {
        console.log("碰撞",man.x,man.y,x_index,y_index);
    }
}

function calPos(p) {
    return p * step;
}

function calIndex(p) {
    return p / step;
}

function createEnemy(n) {
    let enemy = [];
    for (let i = 0; i < n; i++) {
        let x = randomNum(1, 14);
        let y = randomNum(1, 14);
        console.log("enemy",x,y)
        while (map[x][y] === 1) {
            x = randomNum(1, 14);
            y = randomNum(1, 14);
        }
        let temp = new createjs.Bitmap(loader.getResult("enemy"));
        enemy.push(temp);
        temp.x = calPos(x);
        temp.y = calPos(y);
        stage.addChild(temp);
        map[x][y] = 1;
    }
    stage.update();
}

function createWall() {
    let canvas = document.getElementById("gameCanvas");
    let wall = [];
    let h = canvas.height / step;
    console.log(h);
    let w = canvas.width / step;
    for (let i = 0; i < w; i++) {
        let temp = new createjs.Bitmap(loader.getResult("wall"));
        temp.x = calPos(i);
        temp.y = calPos(0);
        wall.push(temp);
    }

    for (let i = 0; i < w; i++) {
        let temp = new createjs.Bitmap(loader.getResult("wall"));
        temp.x = calPos(i);
        temp.y = calPos(h - 1);
        wall.push(temp);
    }

    for (let i = 1; i < h - 1; i++) {
        let temp = new createjs.Bitmap(loader.getResult("wall"));
        temp.x = calPos(0);
        temp.y = calPos(i);
        wall.push(temp);
    }

    for (let i = 1; i < h - 1; i++) {
        let temp = new createjs.Bitmap(loader.getResult("wall"));
        temp.x = calPos(w - 1);
        temp.y = calPos(i);
        wall.push(temp);
    }

    for (let i = 0; i < wall.length; i++) {
        stage.addChild(wall[i]);
        map[calIndex(wall[i].x)][calIndex(wall[i].y)] = 1;
    }
    stage.update();
}


function createMan() {
    man = new createjs.Bitmap(loader.getResult("man"));
    man.x = calPos(1);
    man.y = calPos(1);
    stage.addChild(man);
    map[calIndex(man.x)][calIndex(man.y)] = 1;
    stage.update();
}