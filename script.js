import map from './map.json' with { type: 'json' }

const canvas = document.getElementById('game');
const context = canvas.getContext("2d");

const collisionMap = [];
const enemies = [];
const coins = [];

const FPS = 30;

let failed = false;
let won = false;

class Collider {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    intersects(other) {
        return this.x <= (other.x + other.width) && (this.x + this.width) >= other.x &&
            this.y <= (other.y + other.height) && (this.y + this.height) >= other.y;
    }
}

initMap();

const player = {
    x: 40,
    y: 40,
    radius: 10,
    speed: 3
};

let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

window.addEventListener('keydown', event => {
    moveLeft = event.key == 'ArrowLeft';
    moveRight = event.key == 'ArrowRight';
    moveUp = event.key == 'ArrowUp';
    moveDown = event.key == 'ArrowDown';
});

function update() {
    let velocityX = 0;
    let velocityY = 0;

    const playerHitBox = new Collider(player.x - 5, player.y - 5, 10, 10);

    if (moveLeft) velocityX -= player.speed;
    if (moveRight) velocityX += player.speed;
    if (moveUp) velocityY -= player.speed;
    if (moveDown) velocityY += player.speed;

    collisionMap.forEach(collider => {
        if (collider.intersects(playerHitBox)) {
            if (moveLeft) velocityX += player.speed + 3;
            if (moveRight) velocityX -= player.speed + 3;
            if (moveUp) velocityY += player.speed + 3;
            if (moveDown) velocityY -= player.speed + 3;
    
            moveLeft = false;
            moveRight = false;
            moveUp = false;
            moveDown = false;
        }

        enemies.forEach(enemy => {
            if (collider.intersects(new Collider(enemy.x - 5, enemy.y - 5, 10, 10))) {
                if (enemy.dirX != 0) {
                    enemy.dirX *= -1;
                    enemy.x += 5 * enemy.dirX;
                } else if (enemy.dirY != 0) {
                    enemy.dirY *= -1;
                    enemy.y += 5 * enemy.dirY;
                }
            }
        });
    });

    coins.forEach(coin => {
        const coinHitBox = new Collider(coin.x - 5, coin.y - 5, coin.radius * 2, coin.radius * 2);
        if (coinHitBox.intersects(playerHitBox)) coin.isCollected = true;
    });
    
    failed = enemies.some(enemy => {
        const enemyHitBox = new Collider(enemy.x - 5, enemy.y - 5, 10, 10);
        return enemyHitBox.intersects(playerHitBox);
    });

    if (coins.every(coin => coin.isCollected)) won = true;

    if (won || failed) return;

    player.x += velocityX;
    player.y += velocityY;

    enemies.forEach(enemy => {
        enemy.x += enemy.dirX * 2;
        enemy.y += enemy.dirY * 2;
    })
}

function draw() {
    clearCanvas();

    drawMap();

    const circle = new Path2D();
    circle.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
    
    context.fillStyle = 'yellow';
    context.fill(circle);

    // collision draw
    // context.strokeStyle = 'blue';
    // context.strokeRect(player.x - 5, player.y - 5, 10, 10);

    // collisionMap.forEach(element => {
    //     context.strokeStyle = 'cyan';
    //     context.strokeRect(element.x, element.y, element.width, element.height);
    // });

    if (failed) {
        context.fillStyle = 'white';
        context.font = "48px Arial";
        context.textAlign = 'center'
        context.fillText("GAME OVER!", 300, 300);
    }

    if (won) {
        context.fillStyle = 'lightgreen';
        context.font = "48px Arial";
        context.textAlign = 'center'
        context.fillText("YOU WON!!!", 300, 300);
    }
}

function initMap() {
    let x = 0;
    let y = 0;
    const width = 20;
    const height = 20;

    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            x = width * col;
            y = height * row;

            switch (map[row][col]) {
                case 1:
                    collisionMap.push(new Collider(x, y, width, height));
                    break;
                case 2:
                case 3:
                    enemies.push({ x: x + 10, y: y + 10, radius: 10, dirX: map[row][col] === 2 ? 1 : 0, dirY: map[row][col] === 3 ? 1 : 0 });
                    break;
                case 4:
                    coins.push({ x: x + 10, y: y + 10, radius: 5, isCollected: false });
                    break;
            }
        }
    }
}

function drawMap() {
    let x = 0;
    let y = 0;
    const width = 20;
    const height = 20;

    
    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            x = width * col;
            y = height * row;
            
            switch (map[row][col]) {
                case 1:
                    context.fillStyle = '#4900AF';
                    context.fillRect(x, y, width, height);
                    break;
                case 4:
                    coins.forEach(coin => {
                        if (coin.isCollected) return;
                        
                        const circle = new Path2D();
                        circle.arc(coin.x, coin.y, coin.radius, 0, 2 * Math.PI);
                        
                        context.fillStyle = 'brown';
                        context.fill(circle);
                    })
                    break;
            }
        }
    }

    context.fillStyle = 'red';

    enemies.forEach(enemy => {
        const circle = new Path2D();
        circle.arc(enemy.x, enemy.y, enemy.radius, 0, 2 * Math.PI);
        context.fill(circle);

        // collision
        // context.strokeStyle = 'white';
        // context.strokeRect(enemy.x - 5, enemy.y - 5, 10, 10);
    })
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}


setInterval(update, 1000 / FPS);
setInterval(draw, 1000 / FPS);