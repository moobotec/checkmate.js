import { MoveType , Move } from './move.js';
import { Piece , Color ,PieceType , ColorTypeTostring } from './piece.js';
import { Rules } from './rules-engine.js';
import { Ui } from './ui-engine.js';

export const Actions = {
  /**
   * Effectue un mouvement sur l'échiquier.
   * @param {Board} board - L'état actuel de l'échiquier.
   * @param {Piece} piece - La pièce à déplacer.
   * @param {number} destination - La position de destination (0 à 63).
   * @param {string} type - Le type de mouvement (normal, capture, promotion, etc.).
   */
  async performMove(board, piece, destination, type = MoveType.NORMAL) {
    const origin = piece.position;
    let capturedPiece = null;
    let promotedTo = null;
    // Gérer les mouvements selon leur type
    switch (type) {
      case MoveType.NORMAL:
        this._movePiece(board, piece, origin, destination);
        break;

      case MoveType.PROMOTION:
        this._movePiece(board, piece, origin, destination);
        board.updateBoardDisplay(); // Mettre à jour l'affichage

        promotedTo = await this._promotePawn(piece);
        break;

      case MoveType.CAPTURE:
        capturedPiece = this._capturePiece(board, destination);
        this._movePiece(board, piece, origin, destination);
        break;

      case MoveType.PROMOTION_CAPTURE:
        capturedPiece = this._capturePiece(board, destination);
        this._movePiece(board, piece, origin, destination);
        board.updateBoardDisplay(); // Mettre à jour l'affichage

        promotedTo = await this._promotePawn(piece);
        break;

      case MoveType.CASTLING_Q:
      case MoveType.CASTLING_K:
        this._performCastling(board, piece, origin, destination);
        break;

      case MoveType.ENPASSANT:
        capturedPiece = this._performEnPassant(board, piece, origin ,destination);
        break;

      default:
        throw new Error(`Type de mouvement inconnu : ${type}`);
    }

    // Mettre à jour le compteur des mouvements de la pièce
    piece.incrementMoves();

    const state = Rules.stateBoard(board);

    const move = new Move(piece.id, origin, destination, {
        type: type,
        idCapturedPiece: (capturedPiece != null) ? capturedPiece.id : null,
        promotedTo: promotedTo,
        isCheck: state.isCheck,
        isCheckmate: state.isCheckmate,
        isStalemate: state.isStalemate,
        isMaterialInsufficient: state.isMaterialInsufficient
    });

    return move;
  },
  performUnmove(board, move) {
    let piece = board.getPieceById(move.pieceId);
    const destination  = move.origin;
    const origin = move.destination;
    const type = move.type;

    // Gérer les mouvements selon leur type
    switch (type) {
        case MoveType.NORMAL:
          this._movePiece(board, piece, origin, destination);
        break;

        case MoveType.CAPTURE:
          this._movePiece(board, piece, origin, destination);
          this._uncapturePiece(board, move.idCapturedPiece);
        break;

        case MoveType.ENPASSANT:
          this._unperformEnPassant(board,piece,move.idCapturedPiece,origin,destination);
        break;

        case MoveType.PROMOTION_CAPTURE:
          this._movePiece(board, piece, origin, destination);
          this._uncapturePiece(board, move.idCapturedPiece);
          piece.reset();
          piece.position = destination;
        break;

        case MoveType.PROMOTION:
          this._movePiece(board, piece, origin, destination);
          piece.reset();
          piece.position = destination;
        break;

        case MoveType.CASTLING_Q:
        case MoveType.CASTLING_K:
          this._unperformCastling(board, piece, origin, destination);
        break;

        default:
        throw new Error(`Type de mouvement inconnu : ${type}`);
    }

    // Mettre à jour le compteur des mouvements de la pièce
    piece.decrementMoves();

  },
  simulateMove(board,piece, destination, targetPosition, callback) {
      // Sauvegarder les données d'origine
      const originalPosition = piece.position;
      const targetPiece = board.getPieceAt(targetPosition);

      // Simuler le mouvement
      piece.position = destination; // Déplacer la pièce
      if (targetPiece) targetPiece.isActive = false; // Simuler la capture
      board.updateGrid(); // Mettre à jour la grille après le mouvement

      // Appeler la logique spécifique via le callback
      const result = callback();

      // Restaurer les données d'origine
      piece.position = originalPosition; // Rétablir la position d'origine
      if (targetPiece) targetPiece.isActive = true; // Restaurer la pièce capturée
      board.updateGrid(); // Restaurer la grille

      // Retourner le résultat du callback
      return result;
  },
  /**
   * Déplace une pièce sans capture.
   */
  _movePiece(board, piece, origin, destination) {
    board.grid[origin] = null;
    board.grid[destination] = piece;
    piece.position = destination;
  },

  /**
   * Capture une pièce et met à jour l'état.
   */
  _capturePiece(board, destination) {
    const target = board.getPieceAt(destination);
    if (!target) {
      throw new Error('Aucune pièce à capturer à cette position.'+destination);
    }
    // Marquer la pièce comme capturée
    target.isActive = false;
    board.capturedPieces[ColorTypeTostring[target.color]].push(target);
    return target;
  },

  /**
   * 
   */
  _uncapturePiece(board, id) {
    const target = board.getPieceById(id);
    if (!target) {
      throw new Error('Aucune pièce de capturer avec cette id.'+id);
    }
    // Marquer la pièce comme non capturée
    target.isActive = true;

    // La repositionnné sur la grille
    board.grid[target.position] = target;

    board.capturedPieces[ColorTypeTostring[target.color]] = board.capturedPieces[ColorTypeTostring[target.color]].filter(piece => piece !== target);
    return target;
  },

  /**
   * Gère la promotion d'un pion.
   */
  async _promotePawn(pawn) {
    const chosenPieceType = await Ui.showPromotionMenuAsync();          
    // Mise à jour de la pièce promue
    pawn.promotedTo(chosenPieceType);
    return pawn.getFENNotation();
  },

  /**
   * Gère le roque.
   */
  _performCastling(board, king, origin, destination) {
    const rookOrigin = destination > origin ? origin + 3 : origin - 4;
    const rookDestination = destination > origin ? origin + 1 : origin - 1;
    const rook = board.getPieceAt(rookOrigin);
    if (!rook) {
        throw new Error('Aucune tour à cette endroit.'+rookOrigin);
      }
    // Déplacer le roi
    this._movePiece(board, king, origin, destination);
    
    // Déplacer la tour
    this._movePiece(board, rook, rookOrigin, rookDestination);
    rook.incrementMoves();
  },

    /**
   * Gère le roque.
   */
  _unperformCastling(board, king, origin, destination) {
    const rookDestination = destination > origin ? origin -2 : origin + 1;
    const rookOrigin = destination > origin ? origin + 1 : origin - 1;

    const rook = board.getPieceAt(rookOrigin);
    if (!rook) {
        throw new Error('Aucune tour à cette endroit.'+rookOrigin);
    }
    // Déplacer le roi
    this._movePiece(board, king, origin, destination);
    
    // Déplacer la tour
    this._movePiece(board, rook, rookOrigin, rookDestination);
    rook.decrementMoves();
  },

  /**
   * Gère la prise en passant.
   */
  _performEnPassant(board, pawn, origin, destination) {

    const targetPosition = destination + (pawn.color === Color.BLANC ? -8 : 8);
    const target = board.getPieceAt(targetPosition);

    if (!target || target.type !== PieceType.PION) {
      throw new Error('Aucune prise en passant possible.');
    }

    // Capturer le pion adverse en passant
    this._capturePiece(board, targetPosition);
    this._movePiece(board, pawn, origin, destination);

    return target;
  },

  /**
   * Gère l'annulation de la prise en passant.
   */
  _unperformEnPassant(board, pawn, targetid, origin, destination) {

    const target = board.getPieceById(targetid);
    if (!target || target.type !== PieceType.PION) {
      throw new Error('Aucune prise en passant possible.');
    }
    this._movePiece(board, pawn, origin, destination);
    this._uncapturePiece(board, targetid);

    return target;
  },

};
