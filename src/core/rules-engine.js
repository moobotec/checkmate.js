/**
 * Module `rules.js`
 * Gère la validation des mouvements et des règles spécifiques au jeu d'échecs.
 */

import { PieceType, Color } from './piece.js';

// Module Rules
export const Rules = {
  
    isValidMove(board,piecePosition, destination) {
        const piece = board.getPieceAt(piecePosition);
        if (!piece) {
            throw new Error('Aucune pièce à cette position.');
        }

        // Vérifie si la destination est occupée par une pièce de la même couleur
        if (board.isOccupiedBySameColor(destination, piece.color)) {
            throw new Error(`La case ${destination} est occupée par une pièce de la même couleur.`);
        }

        // Vérifie si la destination est en dehors de l'échiquier
        if (destination < 0 || destination >= 64) {
            throw new Error(`Destination hors de l’échiquier.'`);
        }
        
        // Vérifier si la destination est valide pour cette pièce
        return piece.isValidMove(board,destination);
    },
    isCapturePiece(board,targetPosition, attackingColor) {
        const targetPiece = board.getPieceAt(targetPosition);
  
        if (!targetPiece) {
          console.log(`Aucune pièce trouvée à la position ${targetPosition}`);
          return false; // Aucune pièce trouvée à la position
        }
  
        if (targetPiece.color === attackingColor) {
          console.log(`Impossible de capturer une pièce alliée.`);
          return false; //Impossible de capturer une pièce alliée.
        }
  
        // Vérifier si la pièce est protégée par des pièces alliées (ennemies pour l'attaquant)
        const defendingPieces = board.pieces.filter(
            piece => piece.color === targetPiece.color && piece.isActive
        );
  
        console.log(`Pièce attaquée ${targetPiece.getUnicode()} , defendue par ${defendingPieces.length}`);
  
        for (const piece of defendingPieces) {
            try {
                // Si une pièce alliée peut atteindre la position, elle protège la pièce
                if (piece.isValidMove(board,targetPosition)) {
                    console.log(`La pièce attaquée ${targetPiece.getUnicode()} est protégée par une autre ${piece.getUnicode()}`);
                    return false; // La pièce est protégée
                }
            } catch {
                // Ignorer les mouvements invalides
                continue;
            }
        }
        // Si aucune pièce ne protège la cible, elle peut être capturée
        return true;
    },

    /**
     * Vérifie si un pion peut être capturé en passant.
     * @param {number} position - Position du pion qui pourrait être capturé.
     * @returns {object|null} - Retourne les informations sur la capture en passant ou null si non applicable.
     */
    canBeCapturedEnPassant(board,position) {
        const targetPawn = board.getPieceAt(position);

        if (!targetPawn || targetPawn.type !== PieceType.PION) {
            return null; // La pièce n'est pas un pion
        }

        // Vérifier si le pion a avancé de 2 cases lors de son dernier mouvement
        if (Math.abs(targetPawn.position - targetPawn.initialPosition) !== 16 || targetPawn.movesCount !== 1 ) {
            return null; // Le pion n'a pas avancé de 2 cases
        }

        const direction = targetPawn.color === Color.BLANC ? -1 : 1; // Direction opposée
        const row = Math.floor(position / 8);
        const col = position % 8;

        // Trouver les pions adverses à gauche et à droite
        const potentialAttackers = [
            col > 0 ? board.getPieceAt((row * 8) + (col - 1)) : null, // Pion à gauche
            col < 7 ? board.getPieceAt((row * 8) + (col + 1)) : null  // Pion à droite
        ];

        // Vérifier si un pion adverse peut capturer en passant
        const validAttackers = potentialAttackers.filter(p =>
            p &&
            p.type === PieceType.PION &&
            p.color !== targetPawn.color && // Doit être un pion adverse
            Math.abs(Math.floor(p.position / 8) - row) === 0 // Même rangée
        );

        if (validAttackers.length > 0) {
            return validAttackers.map(attacker => ({
                attackingPawn: attacker,
                targetPawn: targetPawn,
                capturePosition: position + 8 * direction // Case où le pion cible sera capturé
            }))[0];
        }

        return null; // Aucun pion ne peut capturer en passant
    },

    isPiecePinned(board, piece) {
        // Trouver la position du roi de la même couleur que la pièce
        const king = board.getKingByColor(piece.color);
        const kingPosition = king.position;
    
        // Vérifier si la pièce est alignée avec le roi (ligne, colonne, ou diagonale)
        if (!this.isAligned(piece.position, kingPosition)) {
            return false; // La pièce n'est pas clouée si elle n'est pas alignée avec le roi
        }
    
        // Simuler un déplacement temporaire de la pièce (la retirer du plateau)
        const tempBoard = board.cloneWithoutUI();
        tempBoard.removePiece(piece);
    
        // Vérifier si le roi est en échec après avoir retiré la pièce
        return this.isKingInCheck(tempBoard, piece.color);
    },

    isAligned(pos1, pos2) {
        const row1 = Math.floor(pos1 / 8);
        const col1 = pos1 % 8;
        const row2 = Math.floor(pos2 / 8);
        const col2 = pos2 % 8;
    
        // Vérifier alignement horizontal, vertical, ou diagonal
        return row1 === row2 || col1 === col2 || Math.abs(row1 - row2) === Math.abs(col1 - col2);
    },
  
    isKingInCheck(board,color) {
        // Trouver la position du roi de la couleur donnée
        const king = board.getKingByColor(color);
        const kingPosition = king.position;
        
        // Vérifier toutes les pièces adverses
        const opponentPieces = board.pieces.filter(piece => piece.color !== color && piece.isActive);

        for (const piece of opponentPieces) {
            try {
                // Si une pièce adverse peut se déplacer sur la position du roi, le roi est en échec
                if (piece.isValidMove(board,kingPosition)) {
                    return true; // En échec
                }
            } catch (error) {
                // Ignorer les erreurs dues à des mouvements invalides
                continue;
            }
        }
  
        return false; // Pas en échec
    },
  
    isKingInCheckAtPosition(board,position, color) {
        // Simuler la position du roi à la case donnée
        const king = board.pieces.find(piece => piece.type === PieceType.ROI && piece.color === color);
        if (king) {
            const originalKingPosition = king.position;
            king.position = position; // Simuler le déplacement
  
            // Vérifier si le roi est attaqué à cette position
            const isInCheck = this.isKingInCheck(board,color);
  
            // Réinitialiser la position du roi
            king.position = originalKingPosition;
            return isInCheck;
        }
        return false; // Par défaut, pas en échec si aucune pièce n'est trouvée
    },
    isKingCheckmate(board,color) {
        // Vérifie d'abord si le roi est en échec
        if (!this.isKingInCheck(board,color)) {
            return false; // Si le roi n'est pas en échec, il ne peut pas être en échec et mat
        }
  
        // Parcourir toutes les pièces de la couleur donnée
        const alliedPieces = board.pieces.filter(piece => piece.color === color && piece.isActive);
        for (const piece of alliedPieces) {
            const originalPosition = piece.position;
  
            // Vérifier toutes les positions possibles de l'échiquier (0 à 63)
            for (let destination = 0; destination < 64; destination++) {
                try {
                    // Si un mouvement est valide et retire le roi de l'échec, ce n'est pas un échec et mat
                    if (this.isValidMove(board,originalPosition,destination)) {
  
                          // Simuler le déplacement
                          const targetPiece = board.getPieceAt(destination);
                          piece.position = destination;
                          piece.incrementMoves();
                          if (targetPiece) targetPiece.isActive = false;
                          board.updateGrid();
    
                          // Vérifier si le roi est toujours en échec
                          const isStillInCheck = this.isKingInCheck(board,color);
                         
                          // Annuler le déplacement
                          piece.position = originalPosition;
                          piece.decrementMoves();
                          if (targetPiece) targetPiece.isActive = true;
                          board.updateGrid();

                        // Si le roi n'est plus en échec après ce déplacement
                        if (!isStillInCheck) {
                            return false; // Ce n'est pas un échec et mat
                        }
                    }
                } catch {
                    // Ignorer les mouvements invalides
                    continue;
                }
            }
        }
        // Si aucun mouvement ne peut retirer le roi de l'échec
        return true;
    },
    /**
     * Détecte si la position actuelle est un pat.
     * @param {Board} board - L'état actuel de l'échiquier.
     * @param {number} color - La couleur au trait (Color.BLANC ou Color.NOIR).
     * @returns {boolean} - `true` si la position est un pat, `false` sinon.
     */
    isStalemate(board, color) {
        // Vérifier si le roi n'est pas en échec
        if (this.isKingInCheck(board, color)) {
            return false; // Pas un pat si le roi est en échec
        }

        // Parcourir toutes les pièces actives de la couleur
        const activePieces = board.pieces.filter(piece => piece.color === color && piece.isActive);
        for (const piece of activePieces) {
            const originalPosition = piece.position;

            // Parcourir toutes les cases de l'échiquier
            for (let destination = 0; destination < 64; destination++) {
                try {
                    // Vérifier si le mouvement est valide
                    if (this.isValidMove(board, originalPosition, destination)) {
                        /*const isStillSafe  = Actions.simulateMove(board,piece, destination, destination , () => {
                            return !this.isKingInCheck(board,color);
                        });*/


                        const targetPiece = board.getPieceAt(destination);
                          piece.position = destination;
                          piece.incrementMoves();
                          if (targetPiece) targetPiece.isActive = false;
                          board.updateGrid();
    
                          // Vérifier si le roi est toujours en échec
                          const isStillSafe = !this.isKingInCheck(board,color);
                         
                          // Annuler le déplacement
                          piece.position = originalPosition;
                          piece.decrementMoves();
                          if (targetPiece) targetPiece.isActive = true;
                          board.updateGrid();

                        if (isStillSafe) {
                            return false; // Pas un pat si un mouvement légal existe
                        }
                    }
                } catch {
                    // Ignorer les erreurs dues à des mouvements invalides
                    continue;
                }
            }
        }
        // Si aucune pièce ne peut effectuer de mouvement légal
        return true;
    },
    isPawnPromotion(pawn, destination) {
        if (pawn.type !== PieceType.PION) {
            throw new Error("Seul un pion peut être promu.");
        }
        const lastRow = pawn.color === Color.BLANC ? 7 : 0;
        const destinationRow = Math.floor(destination / 8);
        // Vérifie si le pion atteint la dernière rangée
        if (destinationRow === lastRow) {
            return true;
        }
        return false;
    },
    // Vérifie si le roque est possible en examinant directement le roi et la tour associés
    isCastlingAllowed(board,king,destination) {
        // Identifier la direction du roque
        const isKingSide = destination > king.position; // Petit roque (vers droite)
        // Vérifier la position initiale du roi
        if (king.movesCount > 0) {
            return false; // Le roi a déjà bougé
        }
        // Identifier la position de la tour associée
        const rookPosition = isKingSide ? king.position + 3 : king.position - 4;
        const rook = board.getPieceAt(rookPosition);

        // Vérifier si une tour est présente à la position attendue
        if (!rook || rook.type !== PieceType.TOUR || rook.color !== king.color || rook.movesCount > 0) {
            return false; // Pas de tour valide pour le roque
        }
        // Vérifier que les cases intermédiaires sont libres et non en échec
        const step = isKingSide ? 1 : -1;
        let current = king.position + step;
        while (current !== destination) {
            if (board.isOccupied(current)) {
                return false; // Une case est occupée ou en échec
            }
            current += step;
        }
        // Vérifier que les cases traversées et la destination ne sont pas attaquées
        current = king.position; // Repartir de la position du roi
        while (current !== destination + step) { // Inclut la destination
            if (Rules.isKingInCheckAtPosition(board,current, king.color)) {
                return false; // Une case est attaquée
            }
            current += step;
        }
        return true; // Toutes les conditions du roque sont remplies
    },
    checkFiftyMoveRule(board)
    {
        return (board.halfMoveCount > 100)
    },
    checkThreefoldRepetition(board,currentPosition) {
        // Vérifier si la position s'est répétée au moins 3 fois
        return board.positionHistoryMap[currentPosition] >= 3;
    },
    checkFivefoldRepetition(board,currentPosition) {
        // Vérifier si la position s'est répétée au moins 5 fois
        return board.positionHistoryMap[currentPosition] >= 5;
    },
    stateBoard(board)
    {
        let isCheck = false;
        let isCheckmate = false;
        let isStalemate = false;
        const opponentColor = board.currentTurnColor === Color.BLANC ? Color.NOIR : Color.BLANC;
        let isMaterialInsufficient = !this.hasEnoughPiecesForCheckmate(board,opponentColor) && !this.hasEnoughPiecesForCheckmate(board,board.currentTurnColor);
        if (!isMaterialInsufficient)
        {
            isCheck = this.isKingInCheck(board,opponentColor);
            if (isCheck) {
                isCheckmate = this.isKingCheckmate(board,opponentColor);
            }
            else{
                isStalemate = this.isStalemate(board, opponentColor);
            }
        }
        return {isCheck,isCheckmate,isStalemate,isMaterialInsufficient};
    },
    /**
     * Vérifie si une couleur a assez de pièces pour mettre en échec et mat.
     * @param {Board} board - L'état actuel de l'échiquier.
     * @param {number} color - La couleur (Color.BLANC ou Color.NOIR) à vérifier.
     * @returns {boolean} - `true` si assez de pièces pour un potentiel mat, `false` sinon.
     */
    hasEnoughPiecesForCheckmate(board, color) {

        // Obtenir toutes les pièces actives de la couleur
        const activePieces = board.pieces.filter(piece => piece.color === color && piece.isActive);

        // Si le roi est seul, impossible de mettre en échec et mat
        if (activePieces.length <= 1) {
            return false;
        }

        // Vérifier si les pièces restantes ont la capacité théorique d'échec et mat
        const containsQueenOrRook = activePieces.some(piece => 
            piece.type === PieceType.REINE || piece.type === PieceType.TOUR
        );
        if (containsQueenOrRook) {
            return true; // Une reine ou une tour suffit pour un mat potentiel
        }

        // Vérifier si le joueur a deux fous ou un fou et un cheval
        const bishopCount = activePieces.filter(piece => piece.type === PieceType.FOU).length;
        const knightCount = activePieces.filter(piece => piece.type === PieceType.CHEVAL).length;

        if (bishopCount >= 2 || (bishopCount >= 1 && knightCount >= 1)) {
            return true; // Deux fous ou un fou et un cheval peuvent suffire
        }

        // Si aucune combinaison gagnante n'est possible
        return false;
    }

};
