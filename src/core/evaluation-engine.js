import { Color , PieceTypeToString } from './piece.js';

export const Evaluation = {
    MAX_EVAL: 100000,
    MIN_EVAL: -100000,
    pieceSquareTables: {
        pawn: [
            0,  0,  0,  0,  0,  0,  0,  0,
            5, 10, 10,-20,-20, 10, 10,  5,
            5, -5,-10,  0,  0,-10, -5,  5,
            0,  0,  0, 20, 20,  0,  0,  0,
            5,  5, 10, 25, 25, 10,  5,  5,
            10, 10, 20, 30, 30, 20, 10, 10,
            50, 50, 50, 50, 50, 50, 50, 50,
            0,  0,  0,  0,  0,  0,  0,  0
        ],
        knight: [
            -50,-40,-30,-30,-30,-30,-40,-50,
            -40,-20,  0,  5,  5,  0,-20,-40,
            -30,  5, 10, 15, 15, 10,  5,-30,
            -30,  0, 15, 20, 20, 15,  0,-30,
            -30,  5, 15, 20, 20, 15,  5,-30,
            -30,  0, 10, 15, 15, 10,  0,-30,
            -40,-20,  0,  0,  0,  0,-20,-40,
            -50,-40,-30,-30,-30,-30,-40,-50
        ],
        bishop: [
            -20,-10,-10,-10,-10,-10,-10,-20,
            -10,  5,  0,  0,  0,  0,  5,-10,
            -10, 10, 10, 10, 10, 10, 10,-10,
            -10,  0, 10, 10, 10, 10,  0,-10,
            -10,  5,  5, 10, 10,  5,  5,-10,
            -10,  0,  5, 10, 10,  5,  0,-10,
            -10,  0,  0,  0,  0,  0,  0,-10,
            -20,-10,-10,-10,-10,-10,-10,-20
        ],
        rook: [
            0,  0,  5, 10, 10,  5,  0,  0,
            -5,  0,  0,  0,  0,  0,  0, -5,
            -5,  0,  0,  0,  0,  0,  0, -5,
            -5,  0,  0,  0,  0,  0,  0, -5,
            -5,  0,  0,  0,  0,  0,  0, -5,
            -5,  0,  0,  0,  0,  0,  0, -5,
            5, 10, 10, 10, 10, 10, 10,  5,
            0,  0,  0,  0,  0,  0,  0,  0
        ],
        queen: [
            -20,-10,-10, -5, -5,-10,-10,-20,
            -10,  0,  5,  0,  0,  0,  0,-10,
            -10,  5,  5,  5,  5,  5,  0,-10,
            0,  0,  5,  5,  5,  5,  0, -5,
            -5,  0,  5,  5,  5,  5,  0, -5,
            -10,  0,  5,  5,  5,  5,  0,-10,
            -10,  0,  0,  0,  0,  0,  0,-10,
            -20,-10,-10, -5, -5,-10,-10,-20
        ],
        king: [
            20, 30, 10,  0,  0, 10, 30, 20,
            20, 20,  0,  0,  0,  0, 20, 20,
            -10,-20,-20,-20,-20,-20,-20,-10,
            -20,-30,-30,-40,-40,-30,-30,-20,
            -30,-40,-40,-50,-50,-40,-40,-30,
            -30,-40,-40,-50,-50,-40,-40,-30,
            -30,-40,-40,-50,-50,-40,-40,-30,
            -30,-40,-40,-50,-50,-40,-40,-30
        ]
    },
    initEvaluationTables() {
        const reverseTable = table => table.slice().reverse();
        this.pieceSquareTables.pawnBlack = reverseTable(this.pieceSquareTables.pawn);
        this.pieceSquareTables.knightBlack = reverseTable(this.pieceSquareTables.knight);
        this.pieceSquareTables.bishopBlack = reverseTable(this.pieceSquareTables.bishop);
        this.pieceSquareTables.rookBlack = reverseTable(this.pieceSquareTables.rook);
        this.pieceSquareTables.queenBlack = reverseTable(this.pieceSquareTables.queen);
        this.pieceSquareTables.kingBlack = reverseTable(this.pieceSquareTables.king);
    },
    evaluate(board,isDraw = false,isCheckMatWhite = false,isCheckMatBlack = false) {

        if (isDraw) return 0;
        else if (isCheckMatWhite) return MAX_EVAL;
        else if (isCheckMatBlack) return MIN_EVAL;

        let evalScoreB = 0;
        let evalScoreN = 0;
        let pstValueScoreB = 0;
        let pstValueScoreN = 0;
        let pieceScoreB = 0;
        let pieceScoreN = 0;

        board.pieces
        .filter(piece => piece.isActive) // Filtre uniquement les pièces actives
        .forEach(piece => {
            const { type, color, position, value } = piece;
            const pstValue =
                color === Color.BLANC
                    ? this.pieceSquareTables[PieceTypeToString[type]][position]
                    : this.pieceSquareTables[`${PieceTypeToString[type]}Black`][position];
            
            if (color === Color.BLANC ) {
                evalScoreB += value + pstValue;
                pstValueScoreB += pstValue;
                pieceScoreB += value;
            }
            else{
                evalScoreN -= value + pstValue;
                pstValueScoreN -= pstValue;
                pieceScoreN -= value;
            }
        });

        let score = evalScoreB + evalScoreN; 
        let positionScore = pstValueScoreB + pstValueScoreN;
        let pieceScore = pieceScoreB + pieceScoreN;

        let MIN_BOARD = -6515;
        let MAX_BOARD = 6515;

        score = ((score - MIN_BOARD) / (MAX_BOARD - MIN_BOARD));

        MIN_BOARD = -515;
        MAX_BOARD = 515;
     
        positionScore = ((positionScore - MIN_BOARD) / (MAX_BOARD - MIN_BOARD));

        MIN_BOARD = -6000;
        MAX_BOARD = 6000;
     
        pieceScore = ((pieceScore - MIN_BOARD) / (MAX_BOARD - MIN_BOARD));

        return { score, positionScore, pieceScore };
    }
};
