// パズル画像設定ファイル
const PUZZLE_CONFIG = {
    images: [
        'assets/images/puzzles/3.jpg',
        'assets/images/puzzles/6.jpg'
        // 新しい画像を追加する場合は、ここに追加してください
        // 例: 'assets/images/puzzles/image2.jpg',
        //     'assets/images/puzzles/image3.jpg'
    ]
};

// グローバルスコープに設定を公開
window.PUZZLE_CONFIG = PUZZLE_CONFIG;