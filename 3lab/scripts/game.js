"use strict";
 
//описание классов шашечной логики
//поля
class Field {
    #className;
    #type;

    constructor(className, type) {
        this.#className = className;
        this.#type = type;
    }

    getClassName() {
        return this.#className;
    }

    getType() {
        return this.#type;
    }
}
//фигуры
class Piece extends Field {
    #imgSrc;
    #pieceColor;

    constructor(className, type, imgSrc, pieceColor) {
        super(className, type);
        this.#imgSrc = imgSrc;
        this.#pieceColor = pieceColor;
    }

    getImgSrc() {
        return this.#imgSrc;
    }

    getPieceColor() {
        return this.#pieceColor;
    }
}
//ходы
class Move {
    #fromFieldId;
    #toFieldId;
    #type;
    #movedPiece;

    constructor(fromFieldId, toFieldId, type, movedPiece) {
        this.#fromFieldId = fromFieldId;
        this.#toFieldId = toFieldId;
        this.#type = type;
        this.#movedPiece = movedPiece;
    }

    getFromFieldId() {
        return this.#fromFieldId;
    }

    getToFieldId() {
        return this.#toFieldId;
    }

    getType() {
        return this.#type;
    }

    getMovedPiece() {
        return this.#movedPiece;
    }
}
//захваты
class Capture extends Move {
    #capturedPieceId;
    #capturedPiece;

    constructor(
        fromFieldId,
        toFieldId,
        type,
        movedPiece,
        capturedPieceId,
        capturedPiece
    ) {
        super(fromFieldId, toFieldId, type, movedPiece);
        this.#capturedPieceId = capturedPieceId;
        this.#capturedPiece = capturedPiece;
    }

    getCapturedPieceId() {
        return this.#capturedPieceId;
    }

    getCapturedPiece() {
        return this.#capturedPiece;
    }
}

//инициализация шахматной доски фигур и карактеристики
// типы полей:светлое темное
const LIGHT = "light";
const DARK = "dark";

// field/типы фигур: пешка дамка
const FIELD = "field";
const PAWN = "pawn";
const KING = "king";

// piece image sources
const WHITE_PAWN_SRC = "image/whitePiece.png"
const BLACK_PAWN_SRC = "image/blackPiece.png"

const WHITE_KING_SRC = "image/whiteKing.png"
const BLACK_KING_SRC = "image/blackKing.png"

// цвета фигур
const WHITE = "white";
const BLACK = "black";

// создание обьекта для светлого и темного поля
const LIGHT_FIELD = new Field(
    LIGHT,
    FIELD
);
const DARK_FIELD = new Field(
    DARK,
    FIELD,
);
//создание обьектов фигур 
const WHITE_PAWN = new Piece(
    DARK, //только по черным мы ходим и располагаемся  
    PAWN,
    WHITE_PAWN_SRC, //imgSrc путь короче к картинке
    WHITE
);
const BLACK_PAWN = new Piece(
    DARK,
    PAWN,
    BLACK_PAWN_SRC,
    BLACK
);

const WHITE_KING = new Piece(
    DARK,
    KING,
    WHITE_KING_SRC,
    WHITE
);
const BLACK_KING = new Piece(
    DARK,
    KING,
    BLACK_KING_SRC,
    BLACK
);

// типы ходов: обычный и захват
const MOVE = "move";
const CAPTURE = "capture";

// создание обьекта доски типа board
const board = new Board();
// возвращает объект, представляющий шахматную доску
function Board() {
    //вложенная функция возвращающая обьект вертикальную колоку с ячейками 1-8 на доске
    const Column = function() {
        return {
            1: null,
            2: null,
            3: null,
            4: null,
            5: null,
            6: null,
            7: null,
            8: null
        };
    };

    // a <-> 1
    // ...
    // h <-> 8
    return {
        a: new Column(),
        b: new Column(),
        c: new Column(),
        d: new Column(),
        e: new Column(),
        f: new Column(),
        g: new Column(),
        h: new Column()
    };
}
//переменные состояния игры в шашки:
//хранение идентификатора выбранной фигуры
let selectedPieceId;

//отслеживания текущего хода (чей ход: белых или черных)
//значение может быть'white' или 'black'.
let turn;

//для хранения ходов и захватов для выбранной фигуры
let possibleMoves;
let possibleCaptures;

//отслеживания истории сделанных ходов и захватов
// Может быть от 0 до 1 движения за ход 
let moveHistory;
// Может быть от 0 до n захватов за ход
let captureHistory;

//отслеживание текущего номера хода в партии
let currentTurnNumber;

initialLayout();
// функция для начальной установки шахматной доски 
//устанавливает начальное распределение фигур на доске
function initialLayout() {
    for (let row = 8; row >= 1; --row) {
        let isDarkField = row % 2 === 1; //является ли поле темным?

        let field; //определяется от текущего row 

        switch (row) {
            case 8:
            case 7:
            case 6:
                field = BLACK_PAWN;
                break;
            
            case 5:
            case 4:
                field = DARK_FIELD;
                break;
            
            case 3:
            case 2:
            case 1:
                field = WHITE_PAWN;
                break;
        }

        for (const columnChar of "abcdefgh") {
            const id = columnChar + row;

            board[columnChar][row] = isDarkField ? field : LIGHT_FIELD; //тернатрный оператор условие ? выр1 : выр2

            setFieldHTML(id, board[columnChar][row]);

            removeStyle(id);
            
            isDarkField = !isDarkField; //чередования цвета полей в шашечной доске
        }
    }

    resetOtherBoardState(); // действия по сбросу состояния доски
}
// установку фигур на шахматной доске в соответствии с конкретным распределением для примера1
function example1Layout() {
    for (let row = 8; row >= 1; --row) {
        let isDarkField = row % 2 === 1;

        for (const columnChar of "abcdefgh") {
            const id = columnChar + row;

            /*Пример1:
            Белые: f4,h4
            Черные: b8, c1(дамка), c5, c7, e7, h6
            */

            let field;

            switch (id) {
                case "f4":
                case "h4":
                    field = WHITE_PAWN;
                    break;
            
                case "b8":
                case "c5":
                case "c7":    
                case "e7":
                case "h6":    
                    field = BLACK_PAWN;
                    break;
            
                case "c1":
                    field = BLACK_KING;
                    break;

                default:
                    field = isDarkField ? DARK_FIELD : LIGHT_FIELD; //цвет поля черный 
                    break;
            }

            board[columnChar][row] = field;

            setFieldHTML(id, field);
            
            removeStyle(id);

            isDarkField = !isDarkField;
        }
    }

    resetOtherBoardState();
}
//обновление html элементов ячеек в соответствии с field 
function setFieldHTML(id, field) {
    const tdElement = document.getElementById(id);

    const imgElement = tdElement.firstElementChild;

    imgElement.setAttribute("class", field.getClassName)
    if (field instanceof Piece) {
        imgElement.setAttribute("src", field.getImgSrc());
    }
    else {
        imgElement.removeAttribute("src")
    }
}
//удаление стилей css
function removeStyle(id) {
    document.getElementById(id).removeAttribute("style");
}
//сброс состояния шашечной доски и связанных переменных к начальным значениям
//отсутствие фигуры, след ход белых, текущий ход, новые пустые массивы
function resetOtherBoardState() {
    selectedPieceId = null;

    turn = WHITE;

    displayTurn();

    possibleCaptures = new Array();
    possibleMoves = new Array();
    
    captureHistory = new Array();
    moveHistory = null;

    currentTurnNumber = 1; //начало партии

    document.getElementById("history").value = "";
}
// отображения текущего игрового хода в интерфейсе
function displayTurn() {
    const turnText = (turn === WHITE) ? "Ход белых" : "Ход чёрных";

    document.getElementById("turn").setAttribute("class", turn);
    document.getElementById("turn").textContent = turnText;
}
//обрабатывает событие клика по ячейке на шахматной доске
//выбирать и отменять выбор фигур и обрабатывать возможные ходы или захваты на шахматной доске
function handleFieldClick(td) {
    const id = td.id;

    const field = board[id[0]][id[1]];

    if (selectedPieceId === null) {
        const fieldCanBeSelected = () => { //может ли поле быть выбрано
            if (!(field instanceof Piece))
                return false;

            if (field.getPieceColor() !== turn)
                return false;

            if (moveHistory !== null)
                return false;

            if (captureHistory.length > 0) {
                const lastCapture 
                    = captureHistory[captureHistory.length - 1];

                if (lastCapture.getToFieldId() !== id)
                    return false;

                if (getPossibleCaptures(id, field).length === 0)
                    return false;
            }

            return true;
        };

        if (fieldCanBeSelected()) { 
            selectField(id, field); //установка выделения
        }
    }
    else {  
        const fieldIsPossibleMoveOrCapture = () => {
            const isMove = possibleMoves.some(move => move.getToFieldId() === id );
    
            const isCapture = possibleCaptures.some(capture => capture.getToFieldId() === id);
    
            return isMove || isCapture
        };

        if (id === selectedPieceId) {
            unselectField(id); //снятие выделения
        }
        else if (fieldIsPossibleMoveOrCapture()) { //поле может быть целью возможного хода или захвата
            //makeMoveOrCapture(id); // realize in next iteration
        }
    }
}
// динамическое изменение цвета фона элемента
function setCSSColor(id, color) {
    const td = document.getElementById(id);

    td.style.backgroundColor = color;
}
//выделение выбранной фигуры, определяет возможные ходы и захваты для этой фигуры,
// устанавливает цвет фона соответствующих полей в зависимости от возможных действий (захват или ход), и возвращает, (если фигура может только захватывать, но в текущей ситуации захватов нет)
function selectField(id, piece) {
    selectedPieceId = id;

    setCSSColor(id, "yellow");

    // Надо смотреть могут ли другие шашки рубить,
    // если хоть одна может, то надо разрешить выбранной шашке
    // только рубить

    const canOnlyCapture = canOtherPiecesCaptureExcept(id);

    possibleCaptures = getPossibleCaptures(id, piece);

    const anyCaptures = possibleCaptures.length > 0;

    //если можно только захватывать и нет возможных захватов, и наоборот; установка цветов
    if (canOnlyCapture && !anyCaptures)
        return;  

    if (!anyCaptures)
        possibleMoves = getPossibleMoves(id, piece); 

    const moveColor = anyCaptures ? "red" : "green";    

    const moves = anyCaptures ? possibleCaptures : possibleMoves;

    for (const move of moves)
        setCSSColor(move.getToFieldId(), moveColor);
}
//противоположно предыдущей функции отмена выбора, выделения и стиля, чистить массивы
function unselectField(id) {
    const anyCaptures = possibleCaptures.length > 0;

    const moves = anyCaptures ? possibleCaptures : possibleMoves; //массив действий:либо захваты либо ходы

    for (const move of moves)
        removeStyle(move.getToFieldId());

    if (anyCaptures)
        possibleCaptures = new Array();
    else
        possibleMoves = new Array();

    removeStyle(id);

    selectedPieceId = null;
}
//проверка могут ли другие фигуры  кроме exceptId захватывать фигуры на доске
function canOtherPiecesCaptureExcept(exceptId) {
    for (let row = 8; row >= 1; --row) {
        for (const columnChar of "abcdefgh") {
            const id = columnChar + row;

            if (id === exceptId)
                continue;

            const field = board[columnChar][row];

            if (field instanceof Piece 
                    && field.getPieceColor() === turn 
                    && getPossibleCaptures(id, field).length > 0) {
                return true;
            }
        }
    }

    return false;
}
 //кординирующая и направляющая функция, расчитывающая возможные ходы и тип фигуры
function getPossibleMoves(id, piece) {
    const column = id.charCodeAt(0) - "a".charCodeAt(0) + 1;
    const row = Number(id[1]);

    switch (piece.getType()) {
        case PAWN:
            return getPossibleMovesForPawn(id, column, row);

        case KING:
            return getPossibleMovesForKing(id, column, row);
    }
}
//(массив) возможные ходы для пешки
function getPossibleMovesForPawn(id, column, row) {
    const moves = new Array();

    const checkMoveAndPush = (toColumn, toRow) => {
        if (isValidMoveField(toColumn, toRow))
            pushMove(id, toColumn, toRow, moves);
    };

    // Обход по часовой стрелке от левого верхнего направления

    if (turn === WHITE) {
        checkMoveAndPush(column - 1, row + 1);
        checkMoveAndPush(column + 1, row + 1);
    }
    else {
        checkMoveAndPush(column + 1, row - 1);
        checkMoveAndPush(column - 1, row - 1);
    }

    return moves;
}
//(массив) возможные ходы для дамки
function getPossibleMovesForKing(id, column, row) {
    const moves = new Array();

    const checkMoveAndPush = (cOp, rOp) => { //изменение колонки или строки
        for (
                let toC = cOp(column),
                    toR = rOp(row);

                isValidMoveField(toC, toR);

                toC = cOp(toC),
                toR = rOp(toR)
        ) {
            pushMove(id, toC, toR, moves);
        }
    };

    // Обход по часовой стрелке от левого верхнего направления
    // Идём от дамки к краю

    checkMoveAndPush(c => c - 1, r => r + 1);
    checkMoveAndPush(c => c + 1, r => r + 1);
    checkMoveAndPush(c => c + 1, r => r - 1);
    checkMoveAndPush(c => c - 1, r => r - 1);

    return moves;
}
//кординирующая и направляющая функция, расчитывающая возможные захваты и тип фигуры
function getPossibleCaptures(id, piece) {
    const column = id.charCodeAt(0) - "a".charCodeAt(0) + 1;
    const row = Number(id[1]);

    switch (piece.getType()) {
        case PAWN:
            return getPossibleCapturesForPawn(id, column, row);

        case KING:
            return getPossibleCapturesForKing(id, column, row);
    }
}
//(массив) возможные захваты для пешки
function getPossibleCapturesForPawn(id, column, row) {
    const captures = new Array();

    const checkCaptureAndPush = (cOp, rOp) => {
        const captureC = cOp(column);
        const captureR = rOp(row);

        const toC = cOp(captureC);
        const toR = rOp(captureR);

        if (isValidCaptureField(captureC, captureR) && isValidMoveField(toC, toR)) { //функции захвата и координаты конечного поля
            pushCapture(   //являются ли поля допустимыми для захвата
                id,
                toC,
                toR,
                captureC,
                captureR,
                captures
            );
        }
    }

    // Обход по часовой стрелке от левого верхнего направления

    checkCaptureAndPush(c => c - 1, r => r + 1);
    checkCaptureAndPush(c => c + 1, r => r + 1);
    checkCaptureAndPush(c => c + 1, r => r - 1);
    checkCaptureAndPush(c => c - 1, r => r - 1);

    return captures;
}
//(массив) возможные захваты для дамки
function getPossibleCapturesForKing(id, column, row) {
    const captures = new Array();

    const checkCaptureAndPush = (cOp, rOp) => {
        let captureC = cOp(column);
        let captureR = rOp(row);

        while (isValidMoveField(captureC, captureR)) {
            captureC = cOp(captureC);
            captureR = rOp(captureR);
        }
//двойной цикл, который идет в направлении от дамки до края доски,
//ища первую допустимую позицию для захвата. 
        if (isValidCaptureField(captureC, captureR)) {
            for (
                    let toC = cOp(captureC),
                        toR = rOp(captureR);

                    isValidMoveField(toC, toR);

                    toC = cOp(toC),
                    toR = rOp(toR)
            ) {
                pushCapture(
                    id,
                    toC,
                    toR,
                    captureC,
                    captureR,
                    captures
                );
            }
        }
    };

    // Обход по часовой стрелке от левого верхнего направления
    // Идём от дамки к краю

    checkCaptureAndPush(c => c - 1, r => r + 1);
    checkCaptureAndPush(c => c + 1, r => r + 1);
    checkCaptureAndPush(c => c + 1, r => r - 1);
    checkCaptureAndPush(c => c - 1, r => r - 1);

    return captures;
}
//является ли поле допустимым для хода?
function isValidMoveField(column, row) {
    const isField = (column, row) => {
        const columnChar = columnNumberToChar(column);

        return board[columnChar][row].getType() === FIELD; //тут true
    };

    return isValidIndex(column)
            && isValidIndex(row)
            && isField(column, row);
}
//преобразует числовой индекс колонки в символьное представление
function columnNumberToChar(columnNumber) {
    return String.fromCharCode(
        "a".charCodeAt(0) + columnNumber - 1
    );
}
//проверка допустимости индекса для использования
function isValidIndex(index) {
    return 1 <= index && index <= 8;
}
//является ли поле допустимым для захвата?
function isValidCaptureField(column, row) {
    const isEnemyPiece = (column, row) => {
        const columnChar = columnNumberToChar(column);

        const field = board[columnChar][row];

        return field instanceof Piece 
                && field.getPieceColor() !== turn; //true если выполняются условия явл ли поле фигурой противоп цвета
    };

    return isValidIndex(column)
            && isValidIndex(row)
            && isEnemyPiece(column, row);
}
//добавление хода в массив (инф о возможном ходе)
function pushMove(fromId, toColumn, toRow, moves) {
    const toColumnChar = columnNumberToChar(toColumn);

    moves.push(
        new Move(  
            fromId, //начальное поле
            toColumnChar + toRow, //конечное поле
            MOVE, //тип хода
            board[fromId[0]][fromId[1]], //фигура которая совершает ход
        )
    );
}
//добавление инф о возможном захвате в массив
function pushCapture(
        fromId,
        toColumn,
        toRow,
        captureColumn,
        captureRow,
        captures
) {
    const toColumnChar = columnNumberToChar(toColumn);
//преобразования числовых индексов колонок в символьные представления
    const captureColumnChar 
            = columnNumberToChar(captureColumn);

    captures.push(
        new Capture(
            fromId, //начальное поле
            toColumnChar + toRow, //конечное поле
            CAPTURE, //тип захвата
            board[fromId[0]][fromId[1]], //фигура которая совершает захват
            captureColumnChar + captureRow, //захваченное поле
            board[captureColumnChar][captureRow] //захваченная фигура
        )
    );
}