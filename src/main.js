const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const level1 = document.getElementById("level1");
const level2 = document.getElementById("level2");

let numberOfCells;
let numberOfBombs;
let arrayOfStates;
let cellSize;
let isGameOver;
let isGameClear;
let level;

class Status {
    constructor(col, row, mine = true, bomb = false, flag = false) {
        this.col = col;
        this.row = row;
        this.x = col * cellSize;
        this.y = row * cellSize;
        this.w = cellSize;
        this.h = cellSize;
        this.mine = mine;
        this.bomb = bomb;
        this.flag = flag;
        this.count = 0;
    }

    show(ctx) {
        if (isGameOver) {
            if (this.bomb) {
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(this.x, this.y, this.w, this.h);
            }
        } else {
            if (this.flag) {
                ctx.fillStyle = "#0000ff";
                ctx.fillRect(this.x, this.y, this.w, this.h);
            } else if (this.mine) {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(this.x, this.y, this.w, this.h);
            } else if (this.bomb) {
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(this.x, this.y, this.w, this.h);
            } else {
                ctx.fillStyle = "#cccccc";
                ctx.fillRect(this.x, this.y, this.w, this.h);
                if (this.count > 0) {
                    ctx.fillStyle = "black";
                    if (level == 1) {
                        ctx.font = "48px serif";
                        ctx.fillText(`${this.count}`, this.x + 20, this.y + 50);
                    } else {
                        ctx.font = "24px serif";
                        ctx.fillText(`${this.count}`, this.x + 12, this.y + 27);
                    }
                }
            }
            // デバッグ用
            // if (this.bomb) {
            //     ctx.fillStyle = "#ff0000";
            //     ctx.fillRect(this.x, this.y, this.w, this.h);
            // }
        }

        ctx.strokeStyle = "black";
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    }

    leftClicked(ctx) {
        if (isGameOver || isGameClear) {
            return;
        }

        if (this.flag) {
            return;
        }

        if (this.bomb) {
            isGameOver = true;
            alert("Game over");
            draw();
            return;
        }

        if (this.mine) {
            this.mine = false;
        }

        if (this.count > 0) {
            draw();
        } else {
            openZero(this.col, this.row);
            draw();
        }

        clearCheck();
    }

    rightClicked(ctx) {
        if (isGameOver || isGameClear) {
            return;
        }

        if (this.mine) {
            this.flag = !this.flag;
        }

        draw();
    }

    collision(point) {
        return (this.x <= point.x && point.x <= this.x + this.w) && (this.y <= point.y && point.y <= this.y + this.h);
    }
}

function init() {
    arrayOfStates = [];
    cellSize = canvas.width / numberOfCells;
    isGameOver = false;
    isGameClear = false;

    for (let row = 0; row < numberOfCells; row++) {
        const tmp = [];
        for (let col = 0; col < numberOfCells; col++) {
            tmp.push(new Status(col, row));
        }
        arrayOfStates.push(tmp);
    }
}

// 爆弾配置
function bombPlacement() {
    let n = 0;
    while (n < numberOfBombs) {
        let row = Math.floor(Math.random() * numberOfCells);
        let col = Math.floor(Math.random() * numberOfCells);
        if (!arrayOfStates[row][col].bomb) {
            arrayOfStates[row][col].bomb = true;
            n++;
        }
    }
}

// 付近の爆弾数
function bombsAroundCount(_x, _y) {
    let n = 0;
    for (let y = -1; y < 2; y++) {
        for (let x = -1; x < 2; x++) {
            if (x === 0 && y === 0) {
                continue;
            }

            let x2 = _x + x;
            let y2 = _y + y;

            if (x2 < 0 || x2 >= numberOfCells || y2 < 0 || y2 >= numberOfCells) {
                continue;
            }

            if (arrayOfStates[y2][x2].bomb) {
                n++;
            }
        }
    }
    return n;
}

// 爆弾数
function bombsCount() {
    for (let row = 0; row < numberOfCells; row++) {
        for (let col = 0; col < numberOfCells; col++) {
            arrayOfStates[row][col].count = bombsAroundCount(col, row);
            if (arrayOfStates[row][col].bomb) {
                arrayOfStates[row][col].count = -1;
            }
        }
    }
}

// 0の時に周りを探索
function openZero(_x, _y) {
    for (let y = -1; y < 2; y++) {
        for (let x = -1; x < 2; x++) {
            if (x === 0 && y === 0) {
                continue;
            }

            let x2 = _x + x;
            let y2 = _y + y;

            if (x2 < 0 || x2 >= numberOfCells || y2 < 0 || y2 >= numberOfCells) {
                continue;
            }

            if (arrayOfStates[y2][x2].mine && !arrayOfStates[y2][x2].bomb) {
                arrayOfStates[y2][x2].mine = false;
                if (arrayOfStates[y2][x2].count === 0) {
                    openZero(x2, y2);
                }
            }
        }
    }
}

function draw() {
    for (let row = 0; row < numberOfCells; row++) {
        for (let col = 0; col < numberOfCells; col++) {
            arrayOfStates[row][col].show(ctx);
        }
    }
}

function clearCheck() {
    let n = 0;
    for (let row = 0; row < numberOfCells; row++) {
        for (let col = 0; col < numberOfCells; col++) {
            if (arrayOfStates[row][col].mine) {
                n++;
            }
        }
    }

    if (n === numberOfBombs) {
        isGameClear = true;
        alert("Game clear");
    }
}

canvas.addEventListener("click", e => {
    if (!arrayOfStates) {
        return;
    }
    // マウスの座標をCanvas内の座標とあわせる
    const rect = canvas.getBoundingClientRect();
    const point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    for (const v1 of arrayOfStates) {
        for (const v2 of v1) {
            if (v2.collision(point)) {
                v2.leftClicked(ctx);
            }
        }
    }
});

canvas.addEventListener("contextmenu", e => {
    if (!arrayOfStates) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    for (const v1 of arrayOfStates) {
        for (const v2 of v1) {
            if (v2.collision(point)) {
                v2.rightClicked(ctx);
            }
        }
    }
});

canvas.oncontextmenu = function (e) {
    e.preventDefault();
};

function main() {
    init();
    bombPlacement();
    bombsCount();
    draw();
}

level1.addEventListener("click", () => {
    numberOfCells = 9;
    numberOfBombs = 10;
    level = 1;
    main();
})

level2.addEventListener("click", () => {
    numberOfCells = 16;
    numberOfBombs = 40;
    level = 2;
    main();
})
