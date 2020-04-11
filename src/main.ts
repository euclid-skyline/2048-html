
let MAX_LEN = 4;
let grid: number[][] = createGrid();    // Create Grid and initilize with 0 
let pgrid: number[][] = createGrid();   // for undo operation
let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let gameContinued = true;      // Monitor Game continued after reaching 2048
let gameOvered = false;         // Monitor Game over
let first = true;
let score = 0;
let pscore = 0;
// let allowedDirection: boolean[] = [true, true, true, true];
// let index: number = -1;

function init() {
    
    setupApp();
    drawCanvas();    
}

function setupApp(): void {
    canvas =  <HTMLCanvasElement> document.getElementById("canvas2D");
    context = canvas.getContext("2d") as CanvasRenderingContext2D;
    let size = Math.min(window.innerWidth, window.innerHeight);
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;
    canvas.width = size;
    canvas.height = size;
    // call external setup() function

    // Register keyboard listener
    window.addEventListener("keydown", onKeyPressed);
}

function drawCanvas(): void {
    // call external draw() function
    
    startNewGame();
}

window.onload = () => {
    init()
}

function getRandomIntInclusive(min: number, max = 0): number {
    let [a, b] = max < min ? [max, min]: [min, max];    // Use destruction to swap variables if necessary

    a = Math.ceil(a);
    b = Math.floor(b);

    //The maximum is inclusive and the minimum is inclusive 
    return Math.floor(Math.random() * (b - a + 1)) + a; 
}

function getRandom(list: any[]): any {
    return list[ Math.floor(Math.random() * list.length) ];
}


function createGrid(n=0): number[][] {
    let result: number[][]= [];         // or use new Array(MAX_LEN)
    for (let i = 0; i < MAX_LEN; i++) {           // i is row
        result[i]= new Array(MAX_LEN);
        for (let j = 0; j < MAX_LEN; j++) {
            result[i][j]=n;  
        }
    }
    return result;
}

function copyGrid(x: number[][]): number[][] {
    return x.map(rr => rr.map(cc => cc));
}

function fillGrid(x: number[][], n = 0) { 
    for (let i =0; i < x.length; i++) {
        for (let j = 0; j < x[i].length; j++) {
            x[i][j] = n;
        }
    }
}

type tile = {r: number, c: number, val?: number};

function addRandomTile():void {
    let emptyTiles: {r: number, c: number}[] = [];
    
    for (let i = 0; i < grid.length; i++) {           // i is row
        for (let j = 0; j < grid[i].length; j++) {       // j is column 
            if (grid[i][j] == 0) {
                emptyTiles.push({r: i, c: j});
            }
        }
    }
    // console.log(emptyTiles);
    let selectedTile: tile = getRandom(emptyTiles);
    // console.log(selectedTile);
    // grid[selectedTile.r][selectedTile.c] = Math.random() < 0.8 ? 256: 512; // Fast test
    grid[selectedTile.r][selectedTile.c] = Math.random() < 0.8 ? 2: 4;
    // console.table(grid);
}

function onKeyPressed(event: KeyboardEvent) {
    let filpped = false;
    let rotated = false;
    let changed = false;
    let undoed = false;
    
    // let preIndex: number = index;
    let cgrid = copyGrid(grid);     // Get copy from grid before changes
    let cscore = score;     // Get copy from score before changes

    if ( gameContinued && !gameOvered) {

        switch (event.keyCode) {
            case 37:   // Left Arrow Pressed
            case 65: {  // a letter
                // Do nothing
                // index = 0;
                break;
            }
            case 39:   // Right Arrow Pressed
            case 83: {  // s letter
                // index = 1;
                filpGrid(grid);
                filpped = true;
                break;
            } 
            case 38:   // Up Arrow Pressed
            case 87: {   // w letter
                // index = 2;
                grid = rotateGrid(grid);
                rotated = true;
                break;
            }  
            case 40:   // Down Arrow Pressed
            case 90: {  // z letter
                // index = 3;
                grid = rotateGrid(grid);
                rotated = true;
                filpGrid(grid);
                filpped = true;
                break;
            } 
            case 85: {   //  U letter for undo last step
                undoed = true;
                
                grid = copyGrid(pgrid)
                score = pscore;
                
                changed = true;
                break;
            }
        }
        if ( !undoed ) {
            let past = copyGrid(grid);
            for (let i = 0; i < grid.length; i++) {
                grid[i] = slideLeft(grid[i]);
                bindLeft(grid[i]);
                grid[i] = slideLeft(grid[i]);
            }

            if ( !compare(past, grid)) {
                addRandomTile(); 
                changed = true;    
            }
            if (filpped) {
                filpGrid(grid);
            }
            if (rotated) {
                grid = rotateGrid(grid);
            }    
        }
        if ( changed ) {
            drawTiles();
            displayScore();

            // if (preIndex != -1) {
            //     allowedDirection[preIndex] = true;
            // } 
            if ( !undoed) {
                pgrid = copyGrid(cgrid);    // Get copy of previous state of the grid
                pscore = cscore;    // Get copy of previous state of the score
            }
        }
        // else {
        //     allowedDirection[index] = false;
        // }

        if( isGameWon() && first) {
            console.log("YOU WIN");
            gameContinued = confirm("YOU WIN!\nDo you want to continue?");
            first = false;    
        }

        if ( isGameOver() ) {
            console.log("GAME OVER");
            alert("GAME OVER");
            gameOvered = true;
            
        }
    }
}
  
function filpGrid(x: number[][]) {
    for (let i = 0; i < x.length; i++) {
        x[i].reverse();
    }
}

function rotateGrid(x: number[][]) {
    let newGrid = createGrid();

    for (let i = 0; i < x.length; i++) {           // i is row
        for (let j = 0; j < x[i].length; j++) {       // j is column 
            newGrid[i][j] = x[j][i];
        }
    }
    return newGrid;
}

function compare(a: number[][], b: number[][]): boolean {
    for (let i = 0; i < MAX_LEN; i++) {           // i is row
        for (let j = 0; j < MAX_LEN; j++) {       // j is column 
            if ( a[i][j] != b[i][j]) {
                return false;
            }
        }
    } 
    return true;
}


function drawTiles () {
    let w:number = Math.floor(Math.min(context.canvas.width, context.canvas.height)/MAX_LEN);

    context.clearRect(0,0,context.canvas.width, context.canvas.height);

    for (let i = 0; i < grid.length; i++) {           // i is row
        for (let j = 0; j < grid[i].length; j++) {       // j is column 
            
            // Draw rectangles
            context.beginPath();
            context.lineWidth = 2;
            context.rect(j*w, i*w, w, w);
            context.stroke();

            // Draw text
            let val = grid[i][j];
            if (val != 0) { 

                let numLength = val.toString().length;
                numLength = numLength < 3? 2: numLength;
                let size = w/numLength
                // console.log(size.toFixed());
                context.textAlign = "center";
                context.textBaseline = "middle"; 
                context.font = context.font.replace(/\d+px/, size.toFixed()+"px");
                context.fillText(val.toFixed(), j*w + w/2, i*w + w/2); 
            }
        }
    }
}

function displayScore() {
    let p = document.getElementById("score") as HTMLParagraphElement;
    p.textContent = `Score: ${score}`;
}

function slideLeft(row: number[]) {
    let arr = row.filter(x => x);
    
    let left = MAX_LEN - arr.length;
    let zero: number[] = new Array(left).fill(0);
    arr = arr.concat(zero);

    return arr;    
}

function bindLeft(row: number[]) {
    for (let i = 0; i < row.length - 1; i++) {
        let a = row[i];
        let b = row[i+1];
        if (a == b) {
            row[i] = a + b;
            row[i+1] = 0;
            score += row[i];    // increase score by sum value of two tiles
            i++;    // pass over the next element
        }
    }
    // console.log(row);
}

// function isGameOver() {
//     return !(allowedDirection[0] || allowedDirection[1] || allowedDirection[2] || allowedDirection[3] );
// }

function isGameOver() {
    for (let i = 0; i < grid.length; i++) {           // i is row
        for (let j = 0; j < grid[i].length; j++) {       // j is column 
            if (grid[i][j] == 0) {
                return false;
            }
            if (i != grid.length - 1 && grid[i][j] == grid[i+1][j]) {
                return false;
            } 
            if (j != grid[i].length - 1 && grid[i][j] == grid[i][j+1]) {
                return false;
            }      
        }
    }
    return true;    // Game Over
}

function isGameWon() {
    for (let i = 0; i < grid.length; i++) {           // i is row
        for (let j = 0; j < grid[i].length; j++) {       // j is column 
            if (grid[i][j] == 2048)
            {
                return true;
            }
        }
    }
    return false
}

function startNewGame() {
    fillGrid(grid);
    // fillGrid(pgrid);
    score = 0;
    pscore = 0;

    // All game states need to be reset
    gameContinued = true;      // Monitor Game continued after reaching 2048
    gameOvered = false;         // Monitor Game over
    first = true;

    addRandomTile();
    addRandomTile();

    pgrid = copyGrid(grid);     // At start pgrid is copy for grid

    drawTiles();  
    displayScore(); 
}