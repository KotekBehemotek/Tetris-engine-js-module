class Game {
    #matrices = new Map;
    #lastMatrixID = -1;
    #stylesheetIndex;
    #defaultShapes = [
        [
            [1, 1],
            [1, 1]
        ],
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ],
        [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1]
        ],
        [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0]
        ],
        [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
    ]
    #defaultPixelsCSS = {
        pixelALL: {
            height: {
                value: 80,
                unit: '%'
            },
            width: {
                value: 80,
                unit: '%'
            },
            margin: 'auto'
        },
        pixelON: {
            backgroundColor: 'red'
        },
        pixelOFF: {
            backgroundColor: 'black'
        },
        pixelDED: {
            backgroundColor: 'aquamarine'
        }
    };

    constructor(stylesheetIndex = 0) {
        this.#stylesheetIndex = stylesheetIndex;
    }

    get styleSheetIndex() {
        return this.#stylesheetIndex;
    }

    get matrices() {
        return this.#matrices;
    }

    getResults(index = 0) {
        return this.#matrices.get(index).results;
    }

    addMatrixCustom(
        shapesInLine,
        speed,
        height,
        width,
        idInHTML,
        targetElement,
        pixelClasses,
        resultCallbackFunctions,
        callbackFunctions
    ) {
        const matrixID = this.#lastMatrixID + 1;

        if (idInHTML !== null) {
            this.#matrices.set(matrixID, new MatrixCustom(
                matrixID,
                this.#defaultShapes,
                shapesInLine,
                speed,
                height,
                width,
                idInHTML,
                targetElement,
                pixelClasses,
                resultCallbackFunctions,
                callbackFunctions
            ));
        } else {
            throw new Error('matrix of type \'provided\' has to have idInHTML provided. Matrix was not created');
        }

        this.#lastMatrixID++;
    }

    addMatrixDefault(
        shapesInLine,
        speed,
        height,
        width,
        targetElement,
        resultCallbackFunctions,
        callbackFunctions
    ) {
        const matrixID = this.#lastMatrixID + 1;

        this.#matrices.set(matrixID, new MatrixDefault(
            matrixID,
            this.#defaultShapes,
            shapesInLine,
            speed,
            height,
            width,
            targetElement,
            resultCallbackFunctions,
            callbackFunctions
        ));

        this.#lastMatrixID++;
    }

    generateMatrixDefault(index = 0) {
        const matrix = this.#matrices.get(index),
            defaultCSS = {
                height: {
                    value: 100,
                    unit: '%'
                },
                aspectRatio: `${matrix.width} / ${matrix.height}`,
                borderColor: 'aquamarine',
                borderWidth: {
                    value: 2,
                    unit: 'px'
                },
                borderStyle: 'solid',
                display: 'grid',
                gridTemplateColumns: `repeat(${matrix.width} , 1fr)`,
                gridTemplateRows: `repeat(${matrix.height} , 1fr)`
            };

        if (Object.getPrototypeOf(matrix).constructor.name === 'MatrixDefault') {
            matrix.elementInHTML.setAttribute('id', matrix.idInHTML);
            matrix.elementInHTML.style.cssText = this.#styleToString(defaultCSS);
            matrix.targetElement.appendChild(matrix.elementInHTML);
            this.#addPixelClasses(index);
        } else {
            throw new Error('cannot generate HTML Element of non HTML Matrix');
        }
    }

    start(index = 0) {
        const matrix = this.#matrices.get(index);

        if (!matrix.gameOn) {
            matrix.gameOn = true;
            matrix.setupShapeLine();
            matrix.setShapePosition();

            if (matrix.searchForFailure()) {
                this.stop(index);
            } else {
                matrix.refreshPixelsAll();
                matrix.refreshMatrixFragment(1);
                matrix.refreshPixelsAll();
                this.#runGameStep(index);
            }
        } else {
            throw new Error(`Matrix number: ${index} is already on. Game wasn't started`);
        }
    }

    #runGameStep(index) {
        const matrix = this.#matrices.get(index);

        if (matrix.gameOn) {
            matrix.timeoutID = setTimeout(() => {
                if (matrix.searchForCollisionDown()) {
                    matrix.refreshMatrixFragment(0);
                    matrix.shapesLine[0].moveDown();
                    matrix.incrementShapeMovementsDown();
                    matrix.resultShapeMovedDownFunction?.(matrix.results.shapeMovementsDown);

                    if (!matrix.controlsFrozen) {
                        matrix.shapeMovedFunction?.();
                    }
                } else {
                    matrix.refreshMatrixFragment(2);

                    if (matrix.pendingDrop) {
                        matrix.unDropShape();
                    }

                    {
                        let i = matrix.checkIfFullRow();

                        if (i > 0) {
                            matrix.rowDroppedFunction?.();
                            while (i > 0) {
                                matrix.moveRowsDown(i);
                                matrix.incrementRowsRemoved();
                                matrix.resultRowRemovedFunction?.(matrix.results.rowsRemoved);
                                i = matrix.checkIfFullRow();
                            }
                        }
                    }

                    matrix.replaceShape();
                    matrix.setShapePosition();

                    if (matrix.searchForFailure()) {
                        this.stop(index);
                    } else {
                        matrix.refreshPixelsAll();
                    }

                    matrix.shapeDroppedFunction?.();
                }

                matrix.refreshMatrixFragment(1);
                matrix.refreshPixelsFragment();
                this.#runGameStep(index);
            }, matrix.speed);
        }
    }

    moveRight(index = 0) {
        const matrix = this.#matrices.get(index);

        if (!matrix.controlsFrozen) {
            if (matrix.searchForCollisionRight()) {
                matrix.refreshMatrixFragment(0);
                matrix.shapesLine[0].moveRight();
                matrix.refreshMatrixFragment(1);
                matrix.refreshPixelsFragment();
                matrix.incrementShapeMovementsRight();
                matrix.resultShapeMovedRightFunction?.(matrix.results.shapeMovementsRight);
                matrix.shapeMovedFunction?.();
            }
        }
    }

    moveLeft(index = 0) {
        const matrix = this.#matrices.get(index);

        if (!matrix.controlsFrozen) {
            if (matrix.searchForCollisionLeft()) {
                matrix.refreshMatrixFragment(0);
                matrix.shapesLine[0].moveLeft();
                matrix.refreshMatrixFragment(1);
                matrix.refreshPixelsFragment();
                matrix.incrementShapeMovementsLeft();
                matrix.resultShapeMovedLeftFunction?.(matrix.results.shapeMovementsLeft);
                matrix.shapeMovedFunction?.();
            }
        }
    }

    drop(index = 0) {
        const matrix = this.#matrices.get(index);

        if (!matrix.controlsFrozen) {
            matrix.resetClock();
            matrix.dropShape();
            matrix.incrementShapesDropped();
            matrix.resultShapeDroppedFunction?.(matrix.results.shapesDropped);
            this.#runGameStep(index);
        }
    }

    rotate(index = 0) {
        const matrix = this.#matrices.get(index);

        if (!matrix.controlsFrozen) {
            if (matrix.searchForCollisionAround()) {
                matrix.refreshMatrixFragment(0);
                matrix.rotateShape();
                matrix.refreshMatrixFragment(1);
                matrix.refreshPixelsFragment();
                matrix.incrementShapeRotations();
                matrix.resultShapeRotatedFunction?.(matrix.results.shapeRotations);
            }
        }
    }

    pause(index = 0) {
        const matrix = this.#matrices.get(index);

        matrix.resetClock();
        matrix.paused = true;
        matrix.controlsFrozen = true;
    }

    resume(index = 0) {
        const matrix = this.#matrices.get(index);

        this.#runGameStep(index);
        matrix.paused = false;
        matrix.controlsFrozen = false;
    }

    stop(index = 0) {
        const matrix = this.#matrices.get(index);

        if (matrix.controlsFrozen) {
            matrix.controlsFrozen = false;
        }
        if (matrix.pendingDrop) {
            matrix.pendingDrop = false;
        }

        matrix.gameOn = false;
        matrix.paused = false;
        matrix.resetClock();
        matrix.resetResults();

        matrix.playEndingAnimation();

        setTimeout(() => {
            this.resetMatrix(index);
            matrix.resultGameOverFunction?.(matrix.results.rowsRemoved);
        }, matrix.speed / 140 * matrix.width * matrix.height * 2);
    }

    registerNewShape(newShape, index = 0) {
        if (this.#validateShape(newShape)) {
            if (typeof newShape[0][0] === 'number') {
                this.#matrices.get(index).registerNewShape(newShape);
            } else {
                throw new Error('several shapes should be registered separately and were not registered');
            }
        } else {
            throw new Error('shape does not have a proper structure, therefore was not registered');
        }
    }

    replaceShapes(newShapes, index = 0) {
        if (this.#validateShape(newShapes)) {
            if (Array.isArray(newShapes[0][0])) {
                this.#matrices.get(index).replaceShapes(newShapes);
            } else {
                throw new Error('to replace entire shapes array with single shape wrap it in another array. Replacement was not performed');
            }
        } else {
            throw new Error('shapes do not have a proper structure, therefore were not registered');
        }
    }

    registerDefaultShape(newDefaultShape) {
        if (this.#validateShape(newDefaultShape)) {
            if (typeof newDefaultShape[0][0] === 'number') {
                this.#defaultShapes.push(newDefaultShape);
            } else {
                throw new Error('several shapes should be registered separately and were not registered');
            }
        } else {
            throw new Error('shape does not have a proper structure, therefore was not registered');
        }
    }

    replaceDefaultShapes(newDefaultShapes) {
        if (this.#validateShape(newDefaultShapes)) {
            if (Array.isArray(newDefaultShapes[0][0])) {
                this.#defaultShapes = newDefaultShapes;
            } else {
                throw new Error('to replace entire shapes array with single shape wrap it in another array. Replacement was not performed');
            }
        } else {
            throw new Error('shapes do not have a proper structure, therefore were not registered');
        }
    }

    resetMatrix(index = 0) {
        const matrix = this.#matrices.get(index);
        matrix.resetShapesLine();
        matrix.resetGameField();

        if (matrix instanceof MatrixDefault) {
            matrix.resetPixelClasses();
        }
    }

    removeMatrix(index = 0) {
        const matrix = this.#matrices.get(index),
            matrixInHTML = matrix.elementInHTML;

        matrix.targetElement.removeChild(matrixInHTML);

        if (matrix instanceof MatrixDefault) {
            this.#removePixelClasses(index);
        }
    }

    #styleToString(inputObject) {
        function computeValidCSS(inputText) {
            let replacedText = null;

            for (let i = 0, l = inputText.length; i < l; i++) {
                const currentChar = inputText[i];

                if (/[A-Z]/.test(currentChar)) {
                    replacedText = inputText.replace(currentChar, '-' + currentChar.toLowerCase());

                    if (!/[A-Z]/.test(replacedText)) {
                        return replacedText;
                    }
                }
            }

            return computeValidCSS(replacedText);
        }

        const styleEntries = Object.entries(inputObject);
        const qualifiedCSSDelimiter = ': ';
        const qualifiedCSSLineFeed = ';\n';
        let styleText = '';

        for (let i = 0, l = styleEntries.length; i < l; i++) {
            const currentEntry = styleEntries[i];
            const currentKey = currentEntry[0];
            const currentValue = currentEntry[1];

            if (typeof currentValue === 'object') {
                if (CSS.supports(currentKey, currentValue.value + currentValue.unit)) {
                    styleText += currentKey + qualifiedCSSDelimiter + currentValue.value + currentValue.unit + qualifiedCSSLineFeed;
                } else {
                    styleText += computeValidCSS(currentKey) + qualifiedCSSDelimiter + currentValue.value + currentValue.unit + qualifiedCSSLineFeed;
                }
            } else {
                if (CSS.supports(currentKey, currentValue)) {
                    styleText += currentKey + qualifiedCSSDelimiter + currentValue + qualifiedCSSLineFeed;
                } else {
                    styleText += computeValidCSS(currentKey) + qualifiedCSSDelimiter + currentValue + qualifiedCSSLineFeed;
                }
            }
        }

        return styleText;
    }

    #addPixelClasses(index = 0) {
        const matrix = this.#matrices.get(index),
            selectedStylesheet = document.styleSheets[this.styleSheetIndex],
            ruleEntries = Object.entries(this.#defaultPixelsCSS);

        for (let i = 0, l = ruleEntries.length; i < l; i++) {
            const currentEntry = ruleEntries[i];

            matrix.pixelRulesIndexes.push(selectedStylesheet.insertRule(
                `.${currentEntry[0]}_${matrix.index} {\n
                    ${this.#styleToString(currentEntry[1])}
                    \n}`
            ));
        }
    }

    #removePixelClasses(index = 0) {
        const matrix = this.#matrices.get(index),
            selectedStylesheet = document.styleSheets[this.styleSheetIndex],
            pixelRulesIndexes = matrix.pixelRulesIndexes;

        for (let i = 0, l = pixelRulesIndexes.length; i < l; i++) {
            selectedStylesheet.deleteRule(pixelRulesIndexes[i]);
        }
    }

    #validateShape(shape) {
        let iterator = 0;

        function innerLoop(shape) {
            if (Array.isArray(shape)) {
                let verify = true;
                iterator++;

                for (let i = 0, l = shape.length; i < l; i++) {
                    const shapeIndex = shape[i];

                    if (Array.isArray(shapeIndex)) {
                        verify = true === innerLoop(shapeIndex);
                    } else if (typeof shapeIndex !== 'number') {
                        return false;
                    }
                }

                return verify;
            }
        }

        return innerLoop(shape);
    }
}

class Matrix {
    #index;
    #results = {
        shapesDropped: 0,
        shapeMovementsDown: 0,
        shapeMovementsRight: 0,
        shapeMovementsLeft: 0,
        shapeRotations: 0,
        rowsRemoved: 0
    }
    #registeredShapes;
    #shapesInLine;
    #shapesLine = [];
    #speed;
    #height;
    #width;
    #idInHTML;
    #elementInHTML;
    #targetElement;
    #gameField = [];
    #pixels = [];
    #pixelClassALL;
    #pixelClassOFF;
    #pixelClassON;
    #pixelClassDED;
    #pendingDrop = false;
    #controlsFrozen = false;
    #gameOn = false;
    #paused = false;
    #timeoutID;
    #resultShapeDroppedFunction;
    #resultShapeMovedDownFunction;
    #resultShapeMovedRightFunction;
    #resultShapeMovedLeftFunction;
    #resultShapeRotatedFunction;
    #resultRowRemovedFunction;
    #resultGameOverFunction;
    #shapeMovedFunction;
    #shapeDroppedFunction;
    #shapeRotatedFunction;
    #rowDroppedFunction;

    constructor(
        index,
        registeredShapes,
        shapesInLine = 1,
        speed = 500,
        height = 20,
        width = 10,
        targetElement = document.body,
        resultCallbackFunctions,
        callbackFunctions
    ) {
        this.#index = index;
        this.#registeredShapes = registeredShapes;
        this.#speed = speed;
        this.#height = height;
        this.#width = width;

        this.#resultShapeDroppedFunction = resultCallbackFunctions?.shapeDroppedFunction;
        this.#resultShapeMovedDownFunction = resultCallbackFunctions?.shapeMovedDownFunction;
        this.#resultShapeMovedRightFunction = resultCallbackFunctions?.shapeMovedRightFunction;
        this.#resultShapeMovedLeftFunction = resultCallbackFunctions?.shapeMovedLeftFunction;
        this.#resultShapeRotatedFunction = resultCallbackFunctions?.shapeRotatedFunction;
        this.#resultRowRemovedFunction = resultCallbackFunctions?.rowRemovedFunction;
        this.#resultGameOverFunction = resultCallbackFunctions?.gameOverFunction;
        this.#shapeMovedFunction = callbackFunctions?.shapeMovedFunction;
        this.#shapeDroppedFunction = callbackFunctions?.shapeDroppedFunction;
        this.#shapeRotatedFunction = callbackFunctions?.shapeRotatedFunction;
        this.#rowDroppedFunction = callbackFunctions?.rowDroppedFunction;

        if (typeof shapesInLine === 'number') {
            if (shapesInLine % 1 === 0) {
                if (shapesInLine > 0) {
                    this.#shapesInLine = shapesInLine;
                    this.#shapesLine = new Array(shapesInLine);
                } else {
                    throw new Error('shapesInLine has to be greater than 0')
                }
            } else {
                throw new Error('shapesInLine has to be a whole number');
            }
        } else {
            throw new Error('shapesInLine has to be a number');
        }

        if (targetElement instanceof HTMLElement) {
            this.#targetElement = targetElement;
        } else {
            throw new Error('targetElement has to be an HTML Element')
        }

        for (let i = 0, l = height; i < l; i++) {
            this.#gameField.push([]);
            this.#pixels.push(new Array(width));

            for (let j = 0, le = width; j < le; j++) {
                this.#gameField[i].push(0);
            }
        }
    }

    get index() {
        return this.#index;
    }

    get results() {
        return this.#results;
    }

    get shapesLine() {
        return this.#shapesLine;
    }

    get height() {
        return this.#height;
    }

    get width() {
        return this.#width;
    }

    get idInHTML() {
        return this.#idInHTML;
    }

    set idInHTML(idInHTML) {
        this.#idInHTML = idInHTML;
    }

    get elementInHTML() {
        return this.#elementInHTML;
    }

    set elementInHTML(elementInHTML) {
        this.#elementInHTML = elementInHTML;
    }

    get targetElement() {
        return this.#targetElement;
    }

    get speed() {
        return this.#speed;
    }

    set speed(speed) {
        this.#speed = speed;
    }

    get pixels() {
        return this.#pixels;
    }

    get pixelClassALL() {
        return this.#pixelClassALL;
    }

    set pixelClassALL(pixelClassALL) {
        this.#pixelClassALL = pixelClassALL;
    }

    set pixelClassOFF(pixelClassOFF) {
        this.#pixelClassOFF = pixelClassOFF;
    }

    set pixelClassON(pixelClassON) {
        this.#pixelClassON = pixelClassON;
    }

    set pixelClassDED(pixelCLassDED) {
        this.#pixelClassDED = pixelCLassDED;
    }

    get pendingDrop() {
        return this.#pendingDrop;
    }

    get controlsFrozen() {
        return this.#controlsFrozen;
    }

    set controlsFrozen(controlsFrozen) {
        this.#controlsFrozen = controlsFrozen;
    }

    get gameOn() {
        return this.#gameOn;
    }

    set gameOn(gameOn) {
        this.#gameOn = gameOn;
    }

    get paused() {
        return this.#paused;
    }

    set paused(paused) {
        this.#paused = paused;
    }

    set timeoutID(timeoutID) {
        this.#timeoutID = timeoutID;
    }

    get resultShapeDroppedFunction() {
        return this.#resultShapeDroppedFunction;
    }

    get resultShapeMovedDownFunction() {
        return this.#resultShapeMovedDownFunction;
    }

    get resultShapeMovedRightFunction() {
        return this.#resultShapeMovedRightFunction;
    }

    get resultShapeMovedLeftFunction() {
        return this.#resultShapeMovedLeftFunction;
    }

    get resultShapeRotatedFunction() {
        return this.#resultShapeRotatedFunction;
    }

    get resultRowRemovedFunction() {
        return this.#resultRowRemovedFunction;
    }

    get resultGameOverFunction() {
        return this.#resultGameOverFunction;
    }

    get shapeMovedFunction() {
        return this.#shapeMovedFunction;
    }

    get shapeDroppedFunction() {
        return this.#shapeDroppedFunction;
    }

    get shapeRotatedFunction() {
        return this.#shapeRotatedFunction;
    }

    get rowDroppedFunction() {
        return this.#rowDroppedFunction;
    }

    generateNewShape() {
        return new Shape(this.#registeredShapes[Math.floor(Math.random() * (this.#registeredShapes.length))]);
    }

    rotateShape() {
        if (this.searchForCollisionAround()) {
            const newPresence = [],
                shape = this.#shapesLine[0],
                currentPresence = shape.presence;

            for (let i = 0, l = shape.width; i < l; i++) {
                newPresence.push([]);
                for (let j = 0; j < l; j++) {
                    newPresence[i].push(0);
                }
            }

            for (let i = 0, l = shape.width; i < l; i++) {
                for (let j = 0, le = l; j < le; j++) {
                    newPresence[i][j] = currentPresence[shape.width - 1 - j][i];
                }
            }

            shape.presence = newPresence;
        }
    }

    dropShape() {
        this.#controlsFrozen = true;
        this.#pendingDrop = true;
        this.#speed /= 10;
    }

    unDropShape() {
        this.#controlsFrozen = false;
        this.#pendingDrop = false;
        this.#speed *= 10;
    }

    resetClock() {
        clearTimeout(this.#timeoutID);
    }

    replaceShape() {
        this.#shapesLine.shift();
        this.#shapesLine.push(this.generateNewShape());
    }

    setupShapeLine() {
        for (let i = 0, l = this.#shapesInLine; i < l; i++) {
            this.#shapesLine[i] = this.generateNewShape();
        }
    }

    resetShapesLine() {
        for (let i = 0, l = this.#shapesInLine; i < l; i++) {
            this.#shapesLine[i] = null;
        }
    }

    searchForCollisionDown() {
        const shape = this.#shapesLine[0],
            shapeLength = shape.presence.length;

        for (let i = 0, l = shapeLength; i < l; i++) {
            for (let j = 0, le = shapeLength; j < le; j++) {
                const x = shape.positionX + i,
                    y = shape.positionY + j;

                if (x >= 0 &&
                    x < this.#height &&
                    y >= 0 &&
                    y < this.#width) {
                    if (this.#gameField[x][y] === 1) {
                        if (x < this.#height - 1) {
                            if (this.#gameField[x + 1][y] === 2) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    searchForCollisionRight() {
        const shape = this.#shapesLine[0],
            shapeLength = shape.presence.length;

        for (let i = 0, l = shapeLength; i < l; i++) {
            for (let j = shapeLength - 1, le = 0; j >= le; j--) {
                const x = shape.positionX + i,
                    y = shape.positionY + j;

                if (x >= 0 &&
                    x < this.#height &&
                    y >= 0 &&
                    y < this.#width) {
                    if (this.#gameField[x][y] === 1) {
                        if (y < this.#width - 1) {
                            if (this.#gameField[x][y + 1] === 2) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    searchForCollisionLeft() {
        const shape = this.#shapesLine[0],
            shapeLength = shape.presence.length;

        for (let i = 0, l = shapeLength; i < l; i++) {
            for (let j = 0; j < l; j++) {
                const x = shape.positionX + i,
                    y = shape.positionY + j;

                if (x >= 0 &&
                    x < this.#height &&
                    y >= 0 &&
                    y < this.#width) {
                    if (this.#gameField[x][y] === 1) {
                        if (y > 0) {
                            if (this.#gameField[x][y - 1] === 2) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    searchForCollisionAround() {
        const shape = this.#shapesLine[0],
            shapeLength = shape.presence.length;

        for (let i = 0, l = shapeLength; i < l; i++) {
            for (let j = 0; j < l; j++) {
                const x = shape.positionX + i,
                    y = shape.positionY + j;

                if (x > this.#height - 1 ||
                    x < 0 ||
                    y > this.#width - 1 ||
                    y < 0 ||
                    this.#gameField[x][y] === 2) {
                    return false;
                }
            }
        }

        return true;
    }

    setShapePosition() {
        const shape = this.#shapesLine[0];
        shape.positionY = Math.floor(this.#width / 2 - shape.width / 2);
    }

    refreshMatrixFragment(stateToImplement) {
        const shape = this.#shapesLine[0];

        for (let i = 0, l = shape.presence.length; i < l; i++) {
            for (let j = 0; j < l; j++) {
                if (shape.presence[i][j] === 1) {
                    this.#gameField[i + shape.positionX][j + shape.positionY] = stateToImplement;
                }
            }
        }
    }

    refreshMatrixAll(stateToImplement) {
        for (let i = 0, l = this.#height; i < l; i++) {
            for (let j = 0, le = this.#width; j < le; j++) {
                this.#gameField[i][j] = stateToImplement;
            }
        }
    }

    refreshPixelsFragment() {
        const shape = this.#shapesLine[0];

        for (let i = -1, l = shape.presence.length; i <= l; i++) {
            for (let j = -1; j <= l; j++) {
                const x = shape.positionX + i,
                    y = shape.positionY + j;

                if (x >= 0 &&
                    x < this.#height &&
                    y >= 0 &&
                    y < this.#width) {
                    const currentPixel = this.#pixels[x][y],
                        currentPixelClassList = currentPixel.classList,
                        currentGameFieldIndex = this.#gameField[x][y];

                    switch (currentGameFieldIndex) {
                        case 0:
                            currentPixelClassList.remove(this.#pixelClassDED, this.#pixelClassON);
                            currentPixelClassList.add(this.#pixelClassOFF);
                            break;
                        case 1:
                            currentPixelClassList.remove(this.#pixelClassDED, this.#pixelClassOFF);
                            currentPixelClassList.add(this.#pixelClassON);
                            break;
                        case 2:
                            currentPixelClassList.remove(this.#pixelClassOFF, this.#pixelClassON);
                            currentPixelClassList.add(this.#pixelClassDED);
                            break;
                    }
                }
            }
        }
    }

    refreshPixelsAll() {
        for (let i = 0, l = this.#height; i < l; i++) {
            for (let j = 0, le = this.#width; j < le; j++) {
                const currentPixel = this.#pixels[i][j],
                    currentPixelClassList = currentPixel.classList,
                    currentGameFieldIndex = this.#gameField[i][j];

                switch (currentGameFieldIndex) {
                    case 0:
                        currentPixelClassList.remove(this.#pixelClassDED, this.#pixelClassON);
                        currentPixelClassList.add(this.#pixelClassOFF);
                        break;
                    case 1:
                        currentPixelClassList.remove(this.#pixelClassDED, this.#pixelClassOFF);
                        currentPixelClassList.add(this.#pixelClassON);
                        break;
                    case 2:
                        currentPixelClassList.remove(this.#pixelClassON, this.#pixelClassOFF);
                        currentPixelClassList.add(this.#pixelClassDED);
                        break;
                }
            }
        }
    }

    checkIfFullRow() {
        let foundRow = 0;

        for (let i = this.#height - 1, l = -1; i > l; i--) {
            for (let j = 0, le = this.#width; j < le; j++) {
                if (this.#gameField[i][j] !== 2) {
                    break;
                }
                if (j === le - 1) {
                    foundRow = i;
                }
            }
        }

        return foundRow;
    }

    moveRowsDown(rowIndex) {
        const gameField = this.#gameField;

        for (let i = rowIndex, l = 1; i > l; i--) {
            for (let j = 0, le = this.#width; j < le; j++) {
                gameField[i][j] = gameField[i - 1][j];
            }
        }
    }

    searchForFailure() {
        const shape = this.#shapesLine[0],
            gameField = this.#gameField;

        for (let i = 0, l = shape.presence.length; i < l; i++) {
            for (let j = 0; j < l; j++) {
                if (gameField[i][shape.positionY + j] === 2) {
                    return true;
                }
            }
        }

        return false;
    }

    registerNewShape(newShape) {
        this.#registeredShapes.push(newShape);
    }

    replaceShapes(newShapes) {
        this.#registeredShapes = newShapes;
    }

    playEndingAnimation() {
        let counter = this.#height - 1,
            counter2 = counter,
            internalCounter = 0,
            modifier = 1,
            durationSummary = 0

        const widthIsEven = !(this.#width % 2),
            widthHalf = Math.floor(this.#width / 2),
            intervalTime = this.#speed / 140,
            pixels = this.#pixels,
            intervalID = setInterval(() => {
                for (let i = widthHalf + internalCounter, l = this.#width; i < l; i++) {
                    if (counter >= 0) {
                        if (modifier === 1) {
                            pixels[counter][i].classList.add(this.#pixelClassON);
                            pixels[counter][this.#width - i - widthIsEven].classList.add(this.#pixelClassON);
                        } else {
                            pixels[counter][i].classList.add(this.#pixelClassOFF);
                            pixels[counter][i].classList.remove(this.#pixelClassON, this.#pixelClassDED)
                            pixels[counter][this.#width - i - widthIsEven].classList.add(this.#pixelClassOFF);
                            pixels[counter][this.#width - i - widthIsEven].classList.remove(this.#pixelClassON, this.#pixelClassDED);
                        }
                    }
                }

                counter--;
                internalCounter++;
                durationSummary += intervalTime;

                if (internalCounter >= widthHalf) {
                    counter2--;
                    internalCounter = 0;
                    counter = counter2;
                }

                if (counter + this.#width - 3 < 0) {
                    counter = this.#height - 1;
                    counter2 = counter;
                    internalCounter = 0;
                    if (modifier === -1) {
                        clearInterval(intervalID);
                    }
                    modifier = -1;
                }
            }, intervalTime);

        return durationSummary;
    }

    incrementShapesDropped() {
        this.#results.shapesDropped++;
    }

    incrementShapeMovementsDown() {
        this.#results.shapeMovementsDown++;
    }

    incrementShapeMovementsRight() {
        this.#results.shapeMovementsRight++;
    }

    incrementShapeMovementsLeft() {
        this.#results.shapeMovementsLeft++;
    }

    incrementShapeRotations() {
        this.#results.shapeRotations++;
    }

    incrementRowsRemoved() {
        this.#results.rowsRemoved++;
    }

    resetResults() {
        const results = this.#results;

        results.shapesDropped = 0;
        results.shapeMovementsDown = 0;
        results.shapeMovementsRight = 0;
        results.shapeMovementsLeft = 0;
        results.shapeRotations = 0;
        results.rowsRemoved = 0;
    }

    resetGameField() {
        const gameField = this.#gameField;

        for (let i = 0, l = this.#height; i < l; i++) {
            for (let j = 0, le = this.#width; j < le; j++) {
                gameField[i][j] = 0;
            }
        }
    }
}

class MatrixCustom extends Matrix {
    constructor(
        index,
        registeredShapes,
        shapesInLine,
        speed,
        height,
        width,
        idInHTML,
        targetElement,
        pixelClasses,
        resultCallbackFunctions,
        callbackFunctions
    ) {
        super(
            index,
            registeredShapes,
            shapesInLine,
            speed,
            height,
            width,
            targetElement,
            resultCallbackFunctions,
            callbackFunctions
        );

        this.pixelClassALL = pixelClasses.pixelClassALL;
        this.pixelClassOFF = pixelClasses.pixelClassOFF;
        this.pixelClassON = pixelClasses.pixelClassON;
        this.pixelClassDED = pixelClasses.pixelClassDED;

        if (document.getElementById(idInHTML) !== null) {
            this.elementInHTML = document.getElementById(idInHTML);

            for (let i = 0, l = height; i < l; i++) {
                for (let j = 0, le = width; j < le; j++) {
                    const computedID = `pixel_${i}/${j}_${this.index}`,
                        pixelElement = document.getElementById(computedID);

                    if (pixelElement !== null) {
                        pixelElement.setAttribute('class', this.pixelClassALL);
                        this.pixels[i][j] = pixelElement;
                    } else {
                        throw new Error('There is no element with required id in the document');
                    }
                }
            }
        } else {
            throw new Error('Element of provided id doesn\'t exist in the document');
        }
    }
}

class MatrixDefault extends Matrix {
    #pixelRulesIndexes = [];

    constructor(
        index,
        registeredShapes,
        shapesInLine,
        speed,
        height,
        width,
        targetElement,
        resultCallbackFunctions,
        callbackFunctions
    ) {
        super(
            index,
            registeredShapes,
            shapesInLine,
            speed,
            height,
            width,
            targetElement,
            resultCallbackFunctions,
            callbackFunctions
        );

        this.idInHTML = `matrix_${this.index}`;
        this.elementInHTML = document.createElement('div');
        this.pixelClassALL = `pixelALL_${this.index}`;
        this.pixelClassOFF = `pixelOFF_${this.index}`;
        this.pixelClassON = `pixelON_${this.index}`;
        this.pixelClassDED = `pixelDED_${this.index}`;

        for (let i = 0, l = super.height; i < l; i++) {
            for (let j = 0, le = super.width; j < le; j++) {
                const computedID = `pixel_${i}/${j}_${this.index}`;

                if (document.getElementById(computedID) === null) {
                    const pixelElement = document.createElement('div');

                    pixelElement.setAttribute('id', computedID);
                    pixelElement.setAttribute('class', this.pixelClassALL);
                    this.elementInHTML.appendChild(pixelElement);
                    this.pixels[i][j] = pixelElement;
                } else {
                    throw new Error(`Pixel id: ${computedID} is already occupied`);
                }
            }
        }
    }

    get pixelRulesIndexes() {
        return this.#pixelRulesIndexes;
    }

    resetPixelClasses() {
        const pixels = this.pixels,
            classesToRemove = [this.pixelClassOFF, this.pixelClassON, this.pixelClassDED];

        for (let i = 0, l = this.height; i < l; i++) {
            for (let j = 0, le = this.width; j < le; j++) {
                pixels[i][j].classList.remove(...classesToRemove);
            }
        }
    }
}

class Shape {
    #presence = [];
    #positionX = 0;
    #positionY = 0;
    #width;

    constructor(presence) {
        this.#presence = presence;
        this.#width = presence.length;
    }

    get presence() {
        return this.#presence;
    }

    set presence(presence) {
        this.#presence = presence;
    }

    get positionX() {
        return this.#positionX;
    }

    set positionX(positionX) {
        this.#positionX = positionX;
    }

    get positionY() {
        return this.#positionY;
    }

    set positionY(positionY) {
        this.#positionY += positionY;
    }

    get width() {
        return this.#width;
    }

    moveDown() {
        this.#positionX += 1;
    }

    moveRight() {
        this.#positionY += 1;
    }

    moveLeft() {
        this.#positionY -= 1;
    }
}

export default Game;