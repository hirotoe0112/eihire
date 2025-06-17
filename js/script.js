class BatimorphicPuzzle {
    constructor() {
        this.currentImage = null;
        this.puzzlePieces = [];
        this.pieceGroups = []; // Groups of connected pieces
        this.draggedPiece = null;
        this.images = window.PUZZLE_CONFIG.images;
        this.imageSize = { width: 0, height: 0 };
        this.puzzleSize = { width: 400, height: 400 }; // Initialize puzzleSize
        this.gridSize = { rows: 4, cols: 4 };
        this.pieceSize = { width: 120, height: 120 };
        this.snapThreshold = 30; // Distance threshold for snapping pieces together
        this.pieceCount = this.loadPieceCount();
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.initGlobalEvents();
    }
    
    bindEvents() {
        const startBtn = document.getElementById('start-btn');
        const galleryBtn = document.getElementById('gallery-btn');
        const settingsBtn = document.getElementById('settings-btn');
        const homeBtn = document.getElementById('home-btn');
        const restartBtn = document.getElementById('restart-btn');
        const playAgainBtn = document.getElementById('play-again-btn');
        const completionHomeBtn = document.getElementById('completion-home-btn');
        const galleryBackBtn = document.getElementById('gallery-back-btn');
        const settingsBackBtn = document.getElementById('settings-back-btn');
        const settingsSaveBtn = document.getElementById('settings-save-btn');
        const modalCloseBtn = document.getElementById('modal-close-btn');
        const imageModal = document.getElementById('image-modal');
        
        startBtn.addEventListener('click', () => this.startGame());
        galleryBtn.addEventListener('click', () => this.showGallery());
        settingsBtn.addEventListener('click', () => this.showSettings());
        homeBtn.addEventListener('click', () => this.goHome());
        restartBtn.addEventListener('click', () => this.restartGame());
        playAgainBtn.addEventListener('click', () => this.restartGame());
        completionHomeBtn.addEventListener('click', () => this.goHome());
        galleryBackBtn.addEventListener('click', () => this.goHome());
        settingsBackBtn.addEventListener('click', () => this.goHome());
        settingsSaveBtn.addEventListener('click', () => this.saveSettings());
        modalCloseBtn.addEventListener('click', () => this.closeModal());
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                this.closeModal();
            }
        });
    }

    goHome() {
        this.showScreen('start-screen');
        this.hideCompletionMessage();
    }

    showGallery() {
        this.showScreen('gallery-screen');
        this.loadGallery();
    }

    showSettings() {
        this.showScreen('settings-screen');
        this.loadSettingsUI();
    }

    loadSettingsUI() {
        const pieceCountSelect = document.getElementById('piece-count');
        pieceCountSelect.value = this.pieceCount.toString();
    }

    saveSettings() {
        const pieceCountSelect = document.getElementById('piece-count');
        this.pieceCount = parseInt(pieceCountSelect.value);
        this.savePieceCount();
        this.goHome();
    }

    loadPieceCount() {
        const saved = sessionStorage.getItem('batimorphic-piece-count');
        return saved ? parseInt(saved) : 16;
    }

    savePieceCount() {
        sessionStorage.setItem('batimorphic-piece-count', this.pieceCount.toString());
    }

    getPieceGrid(count) {
        const gridConfigs = {
            16: { rows: 4, cols: 4 },
            24: { rows: 4, cols: 6 },
            36: { rows: 6, cols: 6 },
            48: { rows: 6, cols: 8 },
            64: { rows: 8, cols: 8 }
        };
        return gridConfigs[count] || { rows: 4, cols: 4 };
    }

    initGlobalEvents() {
        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('touchmove', (e) => this.onDrag(e));
        
        document.addEventListener('mouseup', (e) => this.endDrag(e));
        document.addEventListener('touchend', (e) => this.endDrag(e));
    }
    
    startGame() {
        this.showScreen('game-screen');
        this.selectRandomImage();
    }
    
    restartGame() {
        this.showScreen('game-screen');
        this.hideCompletionMessage();
        this.selectRandomImage();
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    selectRandomImage() {
        const randomIndex = Math.floor(Math.random() * this.images.length);
        this.currentImage = this.images[randomIndex];
        this.loadImageSize();
    }

    loadImageSize() {
        const img = new Image();
        img.onload = () => {
            this.imageSize.width = img.width;
            this.imageSize.height = img.height;
            this.adjustPuzzleSize();
            this.createPuzzle(); // Call createPuzzle after image is loaded and sizes are adjusted
        };
        img.src = this.currentImage;
    }

    adjustPuzzleSize() {
        const maxSize = 600; // Increased for better visibility
        const aspectRatio = this.imageSize.width / this.imageSize.height;
        
        // Use the selected piece count to determine grid
        const gridConfig = this.getPieceGrid(this.pieceCount);
        this.gridSize.cols = gridConfig.cols;
        this.gridSize.rows = gridConfig.rows;
        
        // Adjust puzzle size based on aspect ratio
        if (aspectRatio > 1) {
            this.puzzleSize.width = maxSize;
            this.puzzleSize.height = maxSize / aspectRatio;
        } else {
            this.puzzleSize.height = maxSize;
            this.puzzleSize.width = maxSize * aspectRatio;
        }
        
        this.pieceSize.width = this.puzzleSize.width / this.gridSize.cols;
        this.pieceSize.height = this.puzzleSize.height / this.gridSize.rows;
        
        const container = document.getElementById('puzzle-container');
        container.style.width = '100%';
        container.style.height = '700px'; // Increased height for larger puzzles
        container.style.position = 'relative';
        container.style.overflow = 'visible';
    }
    
    createPuzzle() {
        const container = document.getElementById('puzzle-container');
        container.innerHTML = '';
        this.puzzlePieces = [];
        this.pieceGroups = [];
        
        this.createPuzzlePieces(container);
        this.shufflePieces();
    }
    
    createPuzzlePieces(container) {
        for (let row = 0; row < this.gridSize.rows; row++) {
            for (let col = 0; col < this.gridSize.cols; col++) {
                const piece = document.createElement('div');
                piece.className = 'puzzle-piece';
                piece.dataset.correctRow = row;
                piece.dataset.correctCol = col;
                piece.dataset.id = `${row}-${col}`;
                piece.dataset.groupId = `${row}-${col}`; // Initially each piece is its own group
                
                piece.style.width = `${this.pieceSize.width}px`;
                piece.style.height = `${this.pieceSize.height}px`;
                piece.style.backgroundImage = `url(${this.currentImage})`;
                piece.style.backgroundSize = `${this.puzzleSize.width}px ${this.puzzleSize.height}px`;
                piece.style.backgroundPosition = `${-col * this.pieceSize.width}px ${-row * this.pieceSize.height}px`;
                
                this.puzzlePieces.push(piece);
                this.pieceGroups.push([piece]); // Each piece starts as its own group
                
                this.addPieceEvents(piece);
                container.appendChild(piece);
            }
        }
    }
    
    addPieceEvents(piece) {
        piece.addEventListener('mousedown', (e) => this.startDrag(e, piece));
        piece.addEventListener('touchstart', (e) => this.startDrag(e, piece));
    }
    
    startDrag(e, piece) {
        e.preventDefault();
        this.draggedPiece = piece;
        piece.classList.add('dragging');
        
        const rect = piece.getBoundingClientRect();
        const container = document.getElementById('puzzle-container');
        const containerRect = container.getBoundingClientRect();
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        // Calculate offset from click point to piece's top-left corner
        this.dragOffset = {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
        
        // Store initial positions and relative offsets for group pieces
        this.dragGroup = this.getGroupContaining(piece);
        this.initialPositions = new Map();
        
        // Calculate the relative positions within the group based on the main piece
        const mainRow = parseInt(piece.dataset.correctRow);
        const mainCol = parseInt(piece.dataset.correctCol);
        const mainRect = piece.getBoundingClientRect();
        
        this.dragGroup.forEach(groupPiece => {
            const pieceRow = parseInt(groupPiece.dataset.correctRow);
            const pieceCol = parseInt(groupPiece.dataset.correctCol);
            
            // Calculate fixed relative offset based on grid positions
            const relativeOffsetX = (pieceCol - mainCol) * this.pieceSize.width;
            const relativeOffsetY = (pieceRow - mainRow) * this.pieceSize.height;
            
            this.initialPositions.set(groupPiece, {
                relativeOffsetX: relativeOffsetX,
                relativeOffsetY: relativeOffsetY,
                clickOffsetX: groupPiece === piece ? (clientX - mainRect.left) : (clientX - mainRect.left - relativeOffsetX),
                clickOffsetY: groupPiece === piece ? (clientY - mainRect.top) : (clientY - mainRect.top - relativeOffsetY)
            });
            
            if (groupPiece !== piece) {
                groupPiece.classList.add('dragging');
            }
        });
    }
    
    onDrag(e) {
        if (!this.draggedPiece) return;
        
        e.preventDefault();
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        
        const container = document.getElementById('puzzle-container');
        const containerRect = container.getBoundingClientRect();
        
        // Calculate the main piece position
        const mainPiecePos = this.initialPositions.get(this.draggedPiece);
        if (!mainPiecePos) return;
        
        const mainX = clientX - containerRect.left - mainPiecePos.clickOffsetX;
        const mainY = clientY - containerRect.top - mainPiecePos.clickOffsetY;
        
        // Move each piece in the group maintaining perfect relative positions
        this.dragGroup.forEach(groupPiece => {
            const piecePos = this.initialPositions.get(groupPiece);
            if (piecePos) {
                const newX = mainX + piecePos.relativeOffsetX;
                const newY = mainY + piecePos.relativeOffsetY;
                
                groupPiece.style.left = `${newX}px`;
                groupPiece.style.top = `${newY}px`;
                groupPiece.style.transform = '';
            }
        });
    }
    
    endDrag(e) {
        if (!this.draggedPiece) return;
        
        const clientX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.type === 'touchend' ? e.changedTouches[0].clientY : e.clientY;
        
        this.checkForConnections();
        
        // Remove dragging class from all pieces
        this.puzzlePieces.forEach(piece => piece.classList.remove('dragging'));
        this.draggedPiece = null;
        this.dragGroup = null;
        this.initialPositions = null;
    }
    
    
    checkForConnections() {
        const tolerance = this.snapThreshold;
        
        this.puzzlePieces.forEach(piece1 => {
            this.puzzlePieces.forEach(piece2 => {
                if (piece1 === piece2) return;
                if (this.areInSameGroup(piece1, piece2)) return;
                
                if (this.shouldConnect(piece1, piece2, tolerance)) {
                    this.connectPieces(piece1, piece2);
                }
            });
        });
        
        this.checkCompletion();
    }
    
    shouldConnect(piece1, piece2, tolerance) {
        const row1 = parseInt(piece1.dataset.correctRow);
        const col1 = parseInt(piece1.dataset.correctCol);
        const row2 = parseInt(piece2.dataset.correctRow);
        const col2 = parseInt(piece2.dataset.correctCol);
        
        // Check if pieces should be adjacent in the completed puzzle
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        
        if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) {
            return false;
        }
        
        // Check actual position proximity
        const pos1 = this.getPiecePosition(piece1);
        const pos2 = this.getPiecePosition(piece2);
        
        const expectedOffsetX = (col2 - col1) * this.pieceSize.width;
        const expectedOffsetY = (row2 - row1) * this.pieceSize.height;
        
        const actualOffsetX = pos2.x - pos1.x;
        const actualOffsetY = pos2.y - pos1.y;
        
        const distanceX = Math.abs(actualOffsetX - expectedOffsetX);
        const distanceY = Math.abs(actualOffsetY - expectedOffsetY);
        
        return distanceX < tolerance && distanceY < tolerance;
    }
    
    getPiecePosition(piece) {
        return {
            x: parseFloat(piece.style.left) || 0,
            y: parseFloat(piece.style.top) || 0
        };
    }
    
    connectPieces(piece1, piece2) {
        const group1 = this.getGroupContaining(piece1);
        const group2 = this.getGroupContaining(piece2);
        
        // Merge the groups
        const mergedGroup = [...group1, ...group2];
        
        // Remove old groups
        this.pieceGroups = this.pieceGroups.filter(group => 
            group !== group1 && group !== group2
        );
        
        // Add merged group
        this.pieceGroups.push(mergedGroup);
        
        // Snap pieces to correct relative positions
        this.snapGroupToCorrectPositions(mergedGroup, piece1);
        
        // Update group IDs
        const groupId = mergedGroup.map(p => p.dataset.id).sort().join('-');
        mergedGroup.forEach(piece => {
            piece.dataset.groupId = groupId;
        });
    }
    
    snapGroupToCorrectPositions(group, referencePiece) {
        const refPos = this.getPiecePosition(referencePiece);
        const refRow = parseInt(referencePiece.dataset.correctRow);
        const refCol = parseInt(referencePiece.dataset.correctCol);
        
        group.forEach(piece => {
            if (piece === referencePiece) return;
            
            const pieceRow = parseInt(piece.dataset.correctRow);
            const pieceCol = parseInt(piece.dataset.correctCol);
            
            const correctX = refPos.x + (pieceCol - refCol) * this.pieceSize.width;
            const correctY = refPos.y + (pieceRow - refRow) * this.pieceSize.height;
            
            piece.style.left = `${correctX}px`;
            piece.style.top = `${correctY}px`;
        });
    }
    
    getGroupContaining(piece) {
        return this.pieceGroups.find(group => group.includes(piece)) || [piece];
    }
    
    areInSameGroup(piece1, piece2) {
        const group = this.getGroupContaining(piece1);
        return group.includes(piece2);
    }
    
    shufflePieces() {
        const container = document.getElementById('puzzle-container');
        const containerRect = container.getBoundingClientRect();
        
        this.puzzlePieces.forEach(piece => {
            const randomX = Math.random() * (800 - this.pieceSize.width);
            const randomY = Math.random() * (500 - this.pieceSize.height);
            piece.style.left = `${randomX}px`;
            piece.style.top = `${randomY}px`;
        });
    }
    
    checkCompletion() {
        // Check if all pieces are in one group
        if (this.pieceGroups.length === 1 && this.pieceGroups[0].length === this.puzzlePieces.length) {
            setTimeout(() => {
                this.showCompletionMessage();
            }, 500);
        }
    }
    
    showCompletionMessage() {
        const completedImage = document.getElementById('completed-image');
        completedImage.src = this.currentImage;
        document.getElementById('completion-message').classList.remove('hidden');
    }
    
    hideCompletionMessage() {
        document.getElementById('completion-message').classList.add('hidden');
    }

    loadGallery() {
        const galleryGrid = document.getElementById('gallery-grid');
        galleryGrid.innerHTML = '';
        
        this.images.forEach((imageSrc, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            
            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = `パズル画像 ${index + 1}`;
            img.addEventListener('click', () => this.showImageModal(imageSrc));
            
            galleryItem.appendChild(img);
            galleryGrid.appendChild(galleryItem);
        });
    }

    showImageModal(imageSrc) {
        const modal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        
        modalImage.src = imageSrc;
        modal.classList.remove('hidden');
    }

    closeModal() {
        const modal = document.getElementById('image-modal');
        modal.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BatimorphicPuzzle();
});