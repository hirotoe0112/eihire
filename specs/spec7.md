## 概要
バグの修正を行います。

## 機能要件
以下のバグを修正します。
- Uncaught TypeError: Cannot read properties of undefined (reading 'width')
    at BatimorphicPuzzle.createPuzzlePieces (script.js:138:65)
    at BatimorphicPuzzle.createPuzzle (script.js:121:14)
    at BatimorphicPuzzle.startGame (script.js:44:14)
    at HTMLButtonElement.<anonymous> (script.js:28:55)Understand this error
- script.js:98 Uncaught TypeError: Cannot set properties of undefined (setting 'width')
    at BatimorphicPuzzle.adjustPuzzleSize (script.js:98:35)
    at img.onload (script.js:72:18)