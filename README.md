Tetris engine js module.

Module allows users to effortlessly implement Tetris game (both mechanics and adjustable graphics) in their website.

The main object <Game> (which is supposed to be imported from the engine module) constructor expects one argument:<br>
Index of stylesheet game will interact with.<br>


Game object has two main methods to start working with:<br>
.addMatrixDefault(<br>
  shapesInLine, - defines number of Tetris blocks randomised in advance<br>
  speed, - interval between game steps (in miliseconds)<br>
  height, - number of pixels in game matrix height<br>
  width, - number of pixels in game matrix width<br>
  targetElement, - DOM element matrix is supposed to be added inside<br>
  resultCallbackFunctions = {<br>
    shapeDroppedFunction, - function invoked every time user drops shape down. It takes current amount of shapes dropped as an argument<br>
    shapeMovedDownFunction, - function invoked every time shape moves down. It takes current amount of shape movements down as an argument<br>
    shapeMovedRightFunction, - function invoked every time user moves shape right. It takes current amount of shape movements right as an argument<br>
    shapeMovedLeftFunction, - function invoked every time user moves shape left. It takes current amount of shape movements left as an argument<br>
    shapeRotatedFunction, - function invoked every time user rotates shape. It takes current amount of shape rotations as an argument<br>
    rowRemovedFunction, - function invoked every time full row disappears. It takes current amount of rows removed as an argument<br>
    gameOverFunction - function invoked when game ends. It takes current amount of rows removed as an argument<br>
  },<br>
  callbackFunctions = {<br>
    shapeMovedFunction, - function invoked every time user or game moves the shape<br>
    shapeDroppedFunction, - function invoked every time user drops shape down<br>
    shapeRotatedFunction, - function invoked every time user rotates shape<br>
    rowDroppedFunction - function invoked every time full row disappears<br>
  }<br>
)<br>

game.addMatrixDefault creates new game board with associated index.<br>
game.generateMatrixDefault(index = 0) adds already created board to your HTML file and rules to CSS rules to stylesheet of index specified in Game constructor.<br>
*index = number of already created game boards, so it is 0 for the first one*<br>


and:<br>
.addMatrixCustom(<br>
  shapesInLine, - defines number of Tetris blocks randomised in advance<br>
  speed, - interval between game steps (in miliseconds)<br>
  height, - number of pixels in game matrix height<br>
  width, - number of pixels in game matrix width<br>
  idInHTML, - id of created element in HTML<br>
  targetElement, - DOM element matrix was added inside<br>
  pixelClasses = {<br>
    pixelClassALL, - name of CSS class created in stylesheet. It will be assigned to all game pixels<br>
    pixelClassOFF, - name of CSS class created in stylesheet. It will be assigned to pixels not included in any block<br>
    pixelClassON, - name of CSS class created in stylesheet. It will be assigned to pixels included in currently active block<br>
    pixelClassDED, - name of CSS class created in stylesheet. It will be assigned to already dropped pixels<br>
  },<br>
  resultCallbackFunctions = {<br>
    shapeDroppedFunction, - function invoked every time user drops shape down. It takes current amount of shapes dropped as an argument<br>
    shapeMovedDownFunction, - function invoked every time shape moves down. It takes current amount of shape movements down as an argument<br>
    shapeMovedRightFunction, - function invoked every time user moves shape right. It takes current amount of shape movements right as an argument<br>
    shapeMovedLeftFunction, - function invoked every time user moves shape left. It takes current amount of shape movements left as an argument<br>
    shapeRotatedFunction, - function invoked every time user rotates shape. It takes current amount of shape rotations as an argument<br>
    rowRemovedFunction, - function invoked every time full row disappears. It takes current amount of rows removed as an argument<br>
    gameOverFunction - function invoked when game ends. It takes current amount of rows removed as an argument<br>
  },<br>
  callbackFunctions = {<br>
    shapeMovedFunction, - function invoked every time user or game moves the shape<br>
    shapeDroppedFunction, - function invoked every time user drops shape down<br>
    shapeRotatedFunction, - function invoked every time user rotates shape<br>
    rowDroppedFunction - function invoked every time full row disappears<br>
  }<br>
)<br>

game.addMatrixCustom creates new game board with associated index.<br>
You need to remember this kind of board has to be added to HTML and styled in CSS completely manually!<br>
It is completely customizable in terms of styling while retaining functionality of the game!<br>
*index = number of already created game boards, so it is 0 for the first one*<br>


*Game boards can be created dynamically, depending on enviromental changes, one instance of the Game can handle up to <I don't even know how many games><br>
running simultanously*


To control games we also use Game methods:<br>
.start(index = 0) - starts game on specified game board<br>
.moveRight(index = 0) - moves active shape right on specified game board<br>
.moveLeft(index = 0) - moves active shape left on specified game board<br>
.drop(index = 0) - drops active shape all the way down on specified game board<br>
.rotate(index = 0) - rotates active shape on specified game board<br>
.pause(index = 0 - pauses game on specified game board<br>
.resume(index = 0) - resumes game on specified game board<br>

*Notice that all index arguments are assigned 0 by default so if You are going to use only one game board You can invoke above methods without passing any arguments*

*Enough writing for now. Thank You*
