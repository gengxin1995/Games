var board = new Array();    //每个格子的数字
var score = 0;
var has_conflicted = new Array();   //解决连续消除的标记
var startx = 0; //移动端触摸屏幕时开始点的x坐标
var starty = 0;
var endx = 0;
var endy = 0;
var success_string = 'Success';
var gameover_string = 'GameOver';

$(document).ready(function () {
    //做自适应处理
    prepare_for_mobile();
    new_game();
});

function new_game() {
    //初始化棋盘
    init();
    //在随机两个格子生成数字
    generate_one_number();
    generate_one_number();
}

//初始化
function init() {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            var grid_cell = $('#grid_cell_' + i + '_' + j);
            grid_cell.css({
                'top': get_pos_top(i, j),
                'left': get_pos_left(i, j)
            })
        }
    }
    for (var i = 0; i < 4; i++) {
        board[i] = new Array();
        has_conflicted[i] = new Array();
        for (var j = 0; j < 4; j++) {
            board[i][j] = 0;
            has_conflicted[i][j] = false;
        }
    }
    update_board_view();
    score = 0;
    update_score(score);
}

//更新棋局
function update_board_view() {
    $('.number_cell').remove();
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            $('#grid_container').append('<div class="number_cell" id="number_cell_' + i + '_' + j + '"></div>');
            var number_cell = $('#number_cell_' + i + '_' + j);
            if (board[i][j] === 0) {
                number_cell.css({
                    'width': '0px',
                    'height': '0px',
                    'top': get_pos_top(i, j) + cell_side_length / 2,
                    'left': get_pos_left(i, j) + cell_side_length / 2
                });
            } else {
                number_cell.css({
                    'width': cell_side_length,
                    'height': cell_side_length,
                    'top': get_pos_top(i, j),
                    'left': get_pos_left(i, j),
                    'background-color': get_number_background_color(board[i][j]),
                    'color': get_number_color(board[i][j])
                }).text(board[i][j]);
            }
            has_conflicted[i][j] = false;
        }
    }
    $('.number_cell').css({
        'line-height': cell_side_length + 'px',
        'font-size': 0.6 * cell_side_length + 'px'
    })
}

//随机在一个格子生成数字
function generate_one_number() {
    if (nospace(board)) {
        return false;
    }

    //随机一个位置
    var randx = parseInt(Math.floor(Math.random() * 4));
    var randy = parseInt(Math.floor(Math.random() * 4));
    var time = 0;
    while (time < 50) {
        if (board[randx][randy] === 0){
            break;
        }
        randx = parseInt(Math.floor(Math.random() * 4));
        randy = parseInt(Math.floor(Math.random() * 4));
        time++;
    }
    if (time === 50) {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (board[i][j] === 0) {
                    randx = i;
                    randy = j;
                }
            }
        }
    }
    //随机一个数字
    var rand_number = Math.random() < 0.5 ? 2 : 4;
    //在随机位置显示随机数字
    board[randx][randy] = rand_number;
    show_number_with_animation(randx, randy, rand_number);
    return true;
}

//监听键盘的上下左右移动
$(document).keydown(function (e) {
    if ($('#score').text() === success_string) {
        new_game();
        return;
    }
    switch (e.keyCode) {
        case 37:    //left
            e.preventDefault();
            if (move_left()) {
                setTimeout('generate_one_number()', 210);
                setTimeout('is_gameover()', 300);
            }
            break;
        case 38:    //up
            e.preventDefault();
            if (move_up()) {
                setTimeout('generate_one_number()', 210);
                setTimeout('is_gameover()', 300);
            }
            break;
        case 39:   //right
            e.preventDefault();
            if (move_right()) {
                setTimeout('generate_one_number()', 210);
                setTimeout('is_gameover()', 300);
            }
            break;
        case 40:    //down
            e.preventDefault();
            if (move_down()) {
                setTimeout('generate_one_number()', 210);
                setTimeout('is_gameover()', 300);
            }
            break;
        default:
            break;
    }
})

//监听移动设备的触摸开始
document.addEventListener('touchstart', function (e) {
    startx = e.touches[0].pageX;
    starty = e.touches[0].pageY;
})

//监听移动设备的触摸移动
document.addEventListener('touchmove', function (e) {
    e.preventDefault();
})

//监听移动设备的触摸结束
document.addEventListener('touchend', function (e) {
    endx = e.touches[0].pageX;
    endy = e.touches[0].pageY;

    var deltax = endx - startx;
    var deltay = endy - starty;
    if (Math.abs(deltax) < 0.3 * document_width && Math.abs(deltay) < 0.3 * document_width) {
        return;
    }
    if ($('#score').text() === success_string) {
        new_game();
        return;
    }
    //x
    if (Math.abs(deltax) > Math.abs(deltay)) {
        if (deltax > 0) {   //move right
            if (move_right()) {
                setTimeout('generate_one_number()', 210);
                setTimeout('is_gameover()', 300);
            }
        } else {    //move left
            if (move_left()) {
                setTimeout('generate_one_number()', 210);
                setTimeout('is_gameover()', 300);
            }
        }
    } else {    //y
        if (deltay > 0) {   //move down
            if (move_down()) {
                setTimeout('generate_one_number()', 210);
                setTimeout('is_gameover()', 300);
            }
        } else {    //move up
            if (move_up()) {
                setTimeout('generate_one_number()', 210);
                setTimeout('is_gameover()', 300);
            }
        }
    }
})

function move_left() {
    if (!can_move_left(board)) {
        return false;
    }
    //move left
    for (var i = 0; i < 4; i++) {
        for (var j = 1; j < 4; j++) {
            if (board[i][j] !== 0) {
                for (var k = 0; k < j; k++) {
                    if (board[i][k] === 0 && no_block_horizontal(i, k, j, board)) {
                        show_move_animation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        break;
                    } else if (board[i][k] === board[i][j] && no_block_horizontal(i, k, j, board) && !has_conflicted[i][k]){
                        show_move_animation(i, j, i, k);
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        score += board[i][k];
                        update_score(score);
                        has_conflicted[i][k] = true;
                        break;
                    }
                }
            }
        }
    }
    setTimeout('update_board_view()', 200);
    return true;
}

function move_right() {
    if (!can_move_right(board)) {
        return false;
    }
    //move right
    for (var i = 0; i < 4; i++) {
        for (var j = 2; j >= 0; j--) {
            if (board[i][j] !== 0) {
                for (var k = 3; k > j; k--) {
                    if (board[i][k] === 0 && no_block_horizontal(i, j, k, board)) {
                        show_move_animation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        break;
                    } else if (board[i][k] === board[i][j] && no_block_horizontal(i, j, k, board) && !has_conflicted[i][k]) {
                        show_move_animation(i, j, i, k);
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        score += board[i][k];
                        update_score(score);
                        has_conflicted[i][k] = true;
                        break;
                    }
                }
            }
        }
    }
    setTimeout('update_board_view()', 200);
    return true;
}

function move_up() {
    if (!can_move_up(board)) {
        return false;
    }
    //move up
    for (var j = 0; j < 4; j++) {
        for (var i = 1; i < 4; i++) {
            if (board[i][j] !== 0) {
                for (var k = 0; k < i; k++) {
                    if (board[k][j] === 0 && no_block_vertical(j, k, i, board)) {
                        show_move_animation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        break;
                    } else if (board[k][j] === board[i][j] && no_block_vertical(j, k, i, board) && !has_conflicted[k][j]) {
                        show_move_animation(i, j, k, j);
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        score += board[k][j];
                        update_score(score);
                        has_conflicted[k][j] = true;
                        break;
                    }
                }
            }
        }
    }
    setTimeout('update_board_view()', 200);
    return true;
}

function move_down() {
    if (!can_move_down(board)) {
        return false;
    }
    //move down
    for (var j = 0; j < 4; j++) {
        for (var i = 2; i >=0; i--) {
            if (board[i][j] !== 0) {
                for (var k = 3; k > i; k--) {
                    if (board[k][j] === 0 && no_block_vertical(j, i, k, board)) {
                        show_move_animation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        break;
                    } else if (board[k][j] === board[i][j] && no_block_vertical(j, i, k, board) && !has_conflicted[k][j]) {
                        show_move_animation(i, j, k, j);
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        score += board[k][j];
                        update_score(score);
                        has_conflicted[k][j] = true;
                        break;
                    }
                }
            }
        }
    }
    setTimeout('update_board_view()', 200);
    return true;
}

function is_gameover() {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (board[i][j] === 2048) {
                update_score(success_string);
                return;
            }
        }
    }
    if (nospace(board) && nomove(board)) {
        gameover();
    }
}

function gameover() {
    update_score(gameover_string);
}

//自适应处理
function prepare_for_mobile() {
    if (document_width > 500) {
         grid_container_width = 500;
         cell_side_length = 100;
         cell_space = 20;
    }
    $('#grid_container').css({
        'width': grid_container_width - 2 * cell_space,
        'height': grid_container_width - 2 * cell_space,
        'padding': cell_space,
        'border-radius': 0.02 * grid_container_width
    })
    $('.grid_cell').css({
        'width': cell_side_length,
        'height': cell_side_length,
        'border-radius': 0.02 * grid_container_width
    })
}








