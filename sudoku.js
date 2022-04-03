var grid;
var digits;
var hints;
var order = [];
var puzzle = [];
var active = "one";
var mode = "pick";

function emptyGrid() {
    grid = [];
    for (var i = 0; i < 81; i++) {
        grid[i] = 0;
    }
}

function getHints() {
    hints = [];
    for (var i = 0; i < 81; i++) {
        hints[i] = new Array();
        for (var j = 0; j < 9; j++) {
            hints[i][j] = 0;
        }
    }
}

function getDigits() {
    var ordered = [];
    digits = [];

    for (var i = 1; i <= 9; i++) {
        ordered.push(i);
    }

    while (ordered.length > 0) {
        var i = Math.floor(Math.random() * ordered.length);
        digits.push(ordered[i]);
        ordered.splice(i, 1);
    }
}

function isFull() {
    for (var i = 0; i < 81; i++) {
        if (grid[i] === 0) {
            return false;
        }
    }
    return true;
}

function generateGrid() {
    fillFirstBox();
    fillSecondBox();
    finishBox(2);
    fillFirstColumn();
    fillLeast();
}

function fill(spot, n) {
    grid[spot] = n;
    //updateHints(spot);
    order.push(spot);
}

function fillFirstBox() {
    getDigits();
    for (var row = 0; row < 3; row++) {
        for (var col = 0; col < 3; col++) {
            var n = digits[digits.length - 1];
            fill(row * 9 + col, n);
            digits.pop();
        }
    }
}

function fillSecondBox() {
    getDigits();
    digits = digits.filter(function(el) { return isSafe(3, el); });
    for (var i = 0; i < 3; i++) {
        fill(i + 3, digits.pop());
    }

    fillThreeRow(12, 21);
    fillThreeRow(21, 12);

    finishBox(1);
}

function fillThreeRow(allow, block) {
    getDigits();
    var j = digits.length - 1;
    while (j >= 0) {
        if (!isSafe(allow, digits[j]) || isSafe(block, digits[j])) {
            digits.splice(j, 1);
        }
        j--;
    }
    for (var i = 0; i < digits.length; i++) {
        fill(allow + i, digits[i]);
    }
}

function fillFirstColumn() {
    getDigits();
    digits = digits.filter(function(el) { return isSafe(27, el); });
    for (var i = 0; i < digits.length; i++) {
        fill(27 + i * 9, digits[i]);
    }
}

function fillLeftColumns() {
    fillThreeColumn(28, 55);
    fillThreeColumn(55, 28);
    fillThreeColumn(29, 56);
    fillThreeColumn(56, 29);
    finishBox(3);
    finishBox(6);
}

function fillThreeColumn(allow, block) {
    getDigits();
    var j = digits.length - 1;
    while (j >= 0) {
        if (!isSafe(allow, digits[j]) || isSafe(block, digits[j])) {
            digits.splice(j, 1);
        }
        j--;
    }
    for (var i = 0; i < digits.length; i++) {
        fill(allow + i * 9, digits[i]);
    }
}

function finishBox(box) {
    var begin = Math.floor(box / 3) * 27 + Math.floor(box % 3) * 3;
    for (var row = 0; row < 3; row++) {
        for (var col = 0; col < 3; col++) {
            var spot = begin + row * 9 + col;
            if (grid[spot] === 0) {
                getDigits();
                var i = digits.length - 1;
                while (i >= 0) {
                    if (!isSafe(spot, digits[i])) {
                        digits.splice(i, 1);
                    }
                    i--;
                }
                fill(spot, digits.pop());
            }
        }
    }
}

function fillLeast() {
    for (var h = 0; h < 48; h++) {
        var least = 10;
        var spot = 0;
        for (var i = 0; i < 81; i++) {
            if (grid[i] === 0) {
                var candidates = countCandidates(i);
                if (candidates < least) {
                    least = candidates;
                    spot = i;
                }
            }
        }
        getDigits();
        digits = digits.filter(function(el) { return isSafe(spot, el); });
        if (digits.length > 0) {
            fill(spot, digits.pop());
        } else { // here is where I would backtrack
        }
    }
}

function countCandidates(spot) {
    var candidates = 0;
    for (var i = 0; i < 9; i++) {
        if (hints[spot][i] !== 0) {
            candidates++;
        }
    }
    return candidates;
}

function isSafe(i, digit) {
    return checkRow(i, digit) && checkColumn(i, digit) && checkBox(i, digit);
}

function checkRow(i, digit) {
    var row = Math.floor(i / 9);
    for (var col = 0; col < 9; col++) {
        if (grid[row * 9 + col] === digit) {
            return false;
        }
    }
    return true;
}

function checkColumn(i, digit) {
    var col = i % 9;

    for (var row = 0; row < 9; row++) {
        if (grid[row * 9 + col] === digit) {
            return false;
        }
    }
    return true;
}

function checkBox(i, digit) {
    var begin = Math.floor(i / 27) * 27 + Math.floor((i % 9) / 3) * 3;
    for (var row = 0; row < 3; row++) {
        for (var col = 0; col < 3; col++) {
            if (grid[begin + (row * 9) + col] === digit) {
                return false;
            }
        }
    }
    return true;
}

function getBox(n) {
    return Math.floor(n / 27) * 3 + Math.floor(n % 9 / 3);
}

function printGrid() {
    var str = "";
    for (var row = 0; row < 9; row++) {
        str += '<div class="row">';
        for (var col = 0; col < 9; col++) {
            str += printSquare(row * 9 + col);
        }
        str += "</div>";
    }
    $("#grid").html(str);
    colorBorders();
}

function printSquare(spot) {
    var str = "<div class=\"square\" ";
    str += "id=\"" + spot.toString() + "\"";
    if (puzzle[spot] === 0) {
        str += "style=\"color:#f54f29\"";
    }
    str += ">";
    if (grid[spot] === 0) {
        str += printHints(spot);
    } else {
        str += "<b>" + grid[spot].toString() + "</b>";
    }
    str += "</div>";

    return str;
}

function printHints(spot) {
    var str = "";

    for (var row = 0; row < 3; row++) {
        str += "<div class=\"row\">";
        for (var col = 0; col < 3; col++) {
            var n = hints[spot][row * 3 + col];
            str += "<div class=\"hint\">";
            if (n !== 0) {
                str += hints[spot][row * 3 + col].toString();
            }
            str += "</div>";
        }
        str += "</div>"
    }

    return str;
}

function updateHints(spot) {
    var n = grid[spot] - 1;
    for (var i = 0; i < 9; i++) {
        var row = Math.floor(spot / 9);
        var col = spot % 9;
        var begin = Math.floor(spot / 27) * 27 + Math.floor(spot % 9 / 3) * 3;

        for (var j = 0; j < 9; j++) {
            hints[row * 9 + j][n] = 0;
        }

        for (var j = 0; j < 9; j++) {
            hints[i * 9 + col][n] = 0;
        }

        for (var j = 0; j < 3; j++) {
            for (var k = 0; k < 3; k++) {
                hints[begin + j * 9 + k][n] = 0;
            }
        }
    }
}

function printOrder() {
    for (var i = 0; i < order.length; i++) {
        console.log(i + ": grid[" + order[i] + "] = " + grid[order[i]]);
    }
}

function colorBorders() {
    var css = "#405952 2px solid";
    for (var row = 0; row < 9; row++) {
        for (var col = 0; col < 9; col++) {
            var id = "#" + (row * 9 + col).toString();
            if (row % 3 === 0) {
                $(id).css("border-top", css);
            }
            if (row % 3 === 2) {
                $(id).css("border-bottom", css);
            }
            if (col % 3 === 0) {
                $(id).css("border-left", css);
            }
            if (col % 3 === 2) {
                $(id).css("border-right", css);
            }
        }
    }
}

function generateSolution() {
    emptyGrid();
    getHints();
    generateGrid();
    while (!isFull()) {
        emptyGrid();
        getHints();
        generateGrid();
    }
    printGrid();
}

function backTrack() {
    var next;
    if (isFull()) {
        return true;
    }
    next = getNext();
    for (var i = 1; i <= 9; i++) {
        if (isSafe(grid[next], i)) {
            grid[next] = i;
        }
        if (backTrack()) {
            return true;
        } else {
            grid[next] = 0;
        }
    }
    return false;
}

function getNext() {
    for (var i = 0; i < grid.length(); i++) {
        if (grid[i] === 0) {
            return i;
        }
    }
    return -1;
}

function createPuzzle(clues) {
    var remove = 81 - clues;
    var indices = [];

    getHints();

    for (var i = 0; i < 81; i++) {
        indices.push(i);
    }

    for (var i = 0; i < remove; i++) {
        var index = Math.floor(Math.random() * indices.length);
        grid[indices[index]] = 0;
        indices.splice(index, 1);
    }

    for (var i = 0; i < 81; i++) {
        puzzle[i] = grid[i] !== 0 ? grid[i] : 0;
    }
}

function activateButton() {
    $("#one").css("background-color", "#f54f29");
    $("#one").css("color", "#ffd393");
    $("#one").css("border-color", "#ffd393");
}

$(document).ready(function() {
    generateSolution();
    createPuzzle(32);
    printGrid();
    activateButton();
});

$(document).on("click", ".number", function() {
    var old = active;
    active = $(this).attr("id");

    if (active === old) {
        mode = mode === "pick" ? "hint" : "pick";
    } else {
        var str = "#" + old;
        var bg = mode === "pick" ? "#f54f29" : "#405952";
        $(str).css("background-color", "#ffd393");
        $(str).css("color", "#405952");
    }
    var bg = mode === "pick" ? "#f54f29" : "#405952";
    $(this).css("background-color", bg);
    $(this).css("color", "#ffd393");
    $(this).css("border-color", "#ffd393");
});

$(document).on("click", ".square", function() {
    var value;
    var n = Number($(this).attr("id"));

    if (puzzle[n] === 0) {
        switch (active) {
            case "one":
                value = 1;
                break;
            case "two":
                value = 2;
                break;
            case "three":
                value = 3;
                break;
            case "four":
                value = 4;
                break;
            case "five":
                value = 5;
                break;
            case "six":
                value = 6;
                break;
            case "seven":
                value = 7;
                break;
            case "eight":
                value = 8;
                break;
            case "nine":
                value = 9;
                break;
        } // end of switch
        if (mode === "pick") {
            grid[n] = grid[n] === value ? 0 : value;
        } else { // "hint" mode

            hints[n][value - 1] = hints[n][value - 1] === value ? 0 : value;
        }
        printGrid();
    }
});