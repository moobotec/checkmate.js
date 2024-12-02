import { PieceType, Color } from './piece.js';
import { Move } from './move.js';

// Module Rules
export const Notations = {

    generateFEN(board,currentTurnColor = Color.BLANC, castlingRights = 'KQkq', enPassant = '-', halfMoveClock = 0, fullMoveNumber = 1) {
        let fen = '';
        let emptyCount = 0;
  
        // Parcourir chaque rangée de l'échiquier
        for (let row = 7; row >= 0; row--) {
            for (let col = 0; col < 8; col++) {
                const position = row * 8 + col;
                const piece = board.getPieceAt(position);
  
                if (piece) {
                    if (emptyCount > 0) {
                        fen += emptyCount;
                        emptyCount = 0;
                    }
                    fen += piece.getFENNotation(); // Ajouter la notation FEN de la pièce
                } else {
                    emptyCount++;
                }
            }
            if (emptyCount > 0) {
                fen += emptyCount;
                emptyCount = 0;
            }
            if (row != 0) {
                fen += '/'; // Ajouter un séparateur entre les rangées
            }
        }
  
        // Ajouter les autres parties de la notation FEN
        fen += ` ${currentTurnColor === Color.BLANC ? 'w' : 'b'}`; // Trait
        fen += ` ${castlingRights}`; // Droits de roque
        fen += ` ${enPassant}`; // Prise en passant
        fen += ` ${halfMoveClock}`; // Demi-coups
        fen += ` ${fullMoveNumber}`; // Numéro du coup
  
        return fen;
    },
    generatePGNNotation(board,move) {
        if (typeof move === 'undefined' || move === null || !(move instanceof Move)) {
            return;
        }

        if (move.isCastlingQueenMove()) {
            return "O-O-O";
        }
        if (move.isCastlingKingMove()) {
            return "O-O";
        }

        const piece = board.getPieceById(move.pieceId);
        const origin = move.origin;
        const destination = move.destination;
        const isCapture = move.isCapture();
        const isCheckmate = move.isCheckmate;
        const isCheck = move.isCheck;
        const isPriseEnPassant = move.isEnPassantMove();
        const isPromoted = move.isPromotion();
        const promotedTo = move.promotedTo; // Type de pièce en cas de promotion
        let saveType = piece.type;

        if (isPromoted) {
            piece.type = PieceType.PION;
        }

        const pieceNotation = ( piece.type === PieceType.PION ) ? '' : piece.getUnicode(); // Pas de lettre pour les pions
        const originCol = String.fromCharCode(97 + (origin % 8)); // Colonne d'origine (a-h)
        const destCol = String.fromCharCode(97 + (destination % 8)); // Colonne de destination (a-h)
        const destRow = Math.floor(destination / 8) + 1; // Ligne de destination (1-8)

        const disambiguation = this._resolveAmbiguity(board,piece, origin, destination);

        // Capture (les pions incluent leur colonne d'origine pour les captures)
        const captureNotation = isCapture ? 'x' : '';
        const pawnCapturePrefix = piece.type === PieceType.PION && isCapture ? originCol : '';

        // Promotion
        const promotionSuffix = isPromoted ? `${promotedTo.toUpperCase()}` : '';

        // État final (échec ou mat)
        const checkMateSuffix = isCheckmate ? '#' : isCheck ? '+' : '';

        const priseEnPassantAnnotation = isPriseEnPassant ? ' e.p.' : ''

        if (isPromoted) {
            piece.type = saveType;
        }

        // Construire la notation finale
        return `${pieceNotation}${disambiguation}${pawnCapturePrefix}${captureNotation}${destCol}${destRow}${promotionSuffix}${checkMateSuffix}${priseEnPassantAnnotation}`;
    },
    _resolveAmbiguity(board, piece, origin, destination) 
    {
        if (piece.type !== PieceType.PION) {

            const otherPieces = board.pieces.filter(p =>
                p.type === piece.type &&
                p.color === piece.color &&
                p.isActive &&
                p.id !== piece.id &&
                p.isValidMove(board,destination)
            );

            if (otherPieces.length === 0) return '';

            const sameCol = otherPieces.some(p => p.position % 8 === origin % 8);
            const sameRow = otherPieces.some(p => Math.floor(p.position / 8) === Math.floor(origin / 8));

            // Désambiguïsation par priorité
            if (sameCol && sameRow) {
                // Même colonne et rangée, inclure les deux
                return `${String.fromCharCode(97 + (origin % 8))}${Math.floor(origin / 8) + 1}`;
            } else if (sameCol) {
                // Même colonne uniquement, inclure la rangée
                return `${Math.floor(origin / 8) + 1}`;
            } else if (sameRow) {
                // Même rangée uniquement, inclure la colonne
                return `${String.fromCharCode(97 + (origin % 8))}`;
            }
        }
        return ''; // Pas d'ambiguïté
    },
    /**
     * Analyse une chaîne PGN et extrait les informations.
     * @param {string} pgn - La chaîne PGN à analyser.
     * @returns {object} - Un objet contenant les métadonnées et les mouvements.
     */
    parsePGN(pgn) {
        if (!pgn || typeof pgn !== 'string') {
            throw new Error("Le fichier PGN est invalide.");
        }

        const lines = pgn.split('\n').map(line => line.trim());
        const metadata = {};
        const moves = [];

        let isMetadata = true;

        for (const line of lines) {
            // Ignorer les lignes vides
            if (!line) continue;

            if (isMetadata && line.startsWith('[')) {
                // Extraire les métadonnées de l'en-tête
                const match = line.match(/^\[(\w+)\s+"(.*)"\]$/);
                if (match) {
                    const key = match[1];
                    const value = match[2];
                    metadata[key] = value;
                }
            } else {
                isMetadata = false; // Fin des métadonnées, début des mouvements
                const tokens = line.split(/\s+/);

                for (const token of tokens) {
                    if (token.match(/^\d+\./)) {
                        // Ignorer les numéros de coups (ex : "1.", "2.")
                        continue;
                    }

                    if (token === "1-0" || token === "0-1" || token === "1/2-1/2" || token === "*") {
                        // Ignorer les résultats
                        continue;
                    }

                    // Ajouter le mouvement à la liste
                    moves.push(token);
                }
            }
        }

        return { metadata, moves };
    }

};