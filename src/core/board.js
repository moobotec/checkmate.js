import { Piece, PieceType,ColorTypeTostring, UnicodeToLetter, Color } from './piece.js';
import { Move, MoveType } from './move.js';
import { Actions } from './actions-engine.js';
import { Rules } from './rules-engine.js';
import { Notations } from './notation-engine.js';
import { Ui } from './ui-engine.js';
import { Utils } from './utils.js';
import { Evaluation } from './evaluation-engine.js';

export class Board {
  constructor( onMove = null,initializeUI = true) {
    this.grid = Array(64).fill(null); // Échiquier de 8x8 cases
    this.pieces = []; // Liste des pièces sur l'échiquier
    this.onMove = onMove; // Callback pour les clics sur les cases
    this.isNumberBoard = false,
    this.indicatorBoard = 'left'; // left,right
    this.orientationBoard = Color.BLANC;
    this.selectedPiece = null; // Pièce actuellement sélectionnée
    this.currentTurnColor = Color.BLANC;
    this.currentPgnNotation = null;
    this.pgnNotation = null;
    this.movesHistory = null;
    this.fullMoveCount = 1;
    this.halfMoveCount = 0;
    this.priseEnPassant = '-';
    this.castlingRights = 'KQkq';
    this.priseEnPassantPieces = null;
    this.capturedPieces = {
      white: [], // Liste des pièces capturées par les Blancs
      black: []  // Liste des pièces capturées par les Noirs
    };
    this.positionHistoryMap = {};
    this.positionHistory = [];
    this.halfMoveHistory = [];
    this.redoStack = [];
    this.event = 'Event checkmate.js';
    this.site = 'checkmate.js';
    this.date = `${new Date().toISOString().slice(0, 10)}`;
    this.round = "-";
    this.playerB = Utils.generateRandomNames(1, 10)[0];
    this.playerN = Utils.generateRandomNames(1, 10)[0];
    this.draggedPiece = null;
    this.ghostPiece = null;
    this.ghostPosition = null;
    this.offsetX = 0;
    this.offsetY = 0;
    this.currentCellIndex = 0;
    
    if (initializeUI == true)
    {
      Ui.initializeBoardEventListeners(this);
      Ui.initializeBoutonBoardEventListeners(this);
    }

    Evaluation.initEvaluationTables();
  }

  // Initialisation de l'échiquier avec les pièces de départ
  initBoard() {
    this.pieces = [];
    this.currentPgnNotation = [];
    this.pgnNotation = [];
    this.movesHistory = [];
    this.fullMoveCount = 1;
    this.halfMoveCount = 0;
    this.priseEnPassant = '-';
    this.castlingRights = 'KQkq';
    this.priseEnPassantPieces = null;
    this.selectedPiece = null;
    this.currentTurnColor = Color.BLANC;
    this.capturedPieces = {
      white: [], // Liste des pièces capturées par les Blancs
      black: []  // Liste des pièces capturées par les Noirs
    };
    this.positionHistoryMap = {};
    this.positionHistory = [];
    this.halfMoveHistory = [];
    this.redoStack = [];
    this.draggedPiece = null;
    this.ghostPiece = null;
    this.ghostPosition = null;
    this.offsetX = 0;
    this.offsetY = 0;
    this.currentCellIndex = 0;

    const sideBlanc = [
      PieceType.TOUR, PieceType.CHEVAL, PieceType.FOU,
      PieceType.REINE, PieceType.ROI, PieceType.FOU,
      PieceType.CHEVAL, PieceType.TOUR
    ];

    /*const sideBlanc = [
      PieceType.TOUR,  null, null,
      null, PieceType.ROI, null,
      null, PieceType.TOUR
    ];*/

    const sideNoir = [
      PieceType.TOUR, PieceType.CHEVAL, PieceType.FOU,
      PieceType.ROI, PieceType.REINE, PieceType.FOU,
      PieceType.CHEVAL, PieceType.TOUR
    ];

    /*const sideNoir = [
      PieceType.ROI,PieceType.REINE
    ];*/

    // Ajouter les pièces blanches
    sideBlanc.forEach((type, index) => {
      if (type != null)
        this.pieces.push(new Piece(type, index, Color.BLANC, index % 2 === 1 ? Color.BLANC : Color.NOIR));
    });

    for (let i = 8; i < 16; i++) {
      this.pieces.push(new Piece(PieceType.PION, i, Color.BLANC, i % 2 === 0 ? Color.BLANC : Color.NOIR));
    }

    // Ajouter les pièces noires
    sideNoir.forEach((type, index) => {
      const position = 63 - index;
      if (type != null)
        this.pieces.push(new Piece(type, position, Color.NOIR, position % 2 === 0 ? Color.BLANC : Color.NOIR));
    });

    for (let i = 48; i < 56; i++) {
      this.pieces.push(new Piece(PieceType.PION, i, Color.NOIR, i % 2 === 1 ? Color.BLANC : Color.NOIR));
    }

    // Mettre à jour la grille avec les pièces
    this.updateGrid();

    if (this.onMove)
    {
      const { score, positionScore, pieceScore  } = Evaluation.evaluate(this);

      const caseInfo = {
          fen: this.getNotationFen(Color.BLANC),
          pgn: '',
          updatePgn: true,
          fullMoveCount : this.fullMoveCount,
          halfMoveCount  : this.halfMoveCount,
          hasWhiteCastlingRights: (this.castlingRights.includes('Q') || this.castlingRights.includes('K')),
          hasBlackCastlingRights: (this.castlingRights.includes('q') || this.castlingRights.includes('k')),
          priseEnPassant : this.priseEnPassant,
          isCanRequestDraw : false,
          isDraw : false,
          isCheckWhite : false, 
          isCheckBlack : false, 
          isCheckmate : false,
          score : score,
          positionScore : positionScore,
          pieceScore : pieceScore
      };
      this.onMove(caseInfo); // Exécuter la callback avec les infos de la case
    }
  }

  // Mettre à jour la grille avec les pièces
  updateGrid() {
    this.grid.fill(null);
    this.pieces.forEach(piece => {
      if ( piece.isActive )
        this.grid[piece.position] = piece ;
    });
  }

  cloneWithoutUI() {
      const newBoard = new Board(null,false);
      newBoard.pieces = this.pieces.map(piece => piece.clone());
      return newBoard;
  }

   // Méthode pour retirer une pièce (par exemple, pour simuler un mouvement)
  removePiece(piece) {
      const index = this.pieces.indexOf(piece);
      if (index !== -1) {
          this.pieces.splice(index, 1); // Supprime la pièce de la liste
      }
  }

  getLastPositionHistory()
  {
      const lastElement = this.positionHistory[this.positionHistory.length - 1];
      return lastElement;
  }

  removeLastPositionHistory() {
      const lastPosition = this.positionHistory.pop(); 
      // Incrémenter le compteur pour la position actuelle
      if (this.positionHistoryMap[lastPosition] == 1) {
          this.positionHistoryMap[lastPosition] = null;
      } else {
          this.positionHistoryMap[lastPosition]--;
      }
  }

  savePositionHistory(currentPosition) {
      // Incrémenter le compteur pour la position actuelle
      if (!this.positionHistoryMap[currentPosition]) {
          this.positionHistoryMap[currentPosition] = 1;
      } else {
          this.positionHistoryMap[currentPosition]++;
      }
      this.positionHistory.push(currentPosition);
  }

  // Vérifier si une case est occupée
  isOccupied(position) {
    return this.grid[position] !== null;
  }

  isOccupiedBySameColor(position, color) {
    const piece = this.grid[position]; // Récupère la pièce à la position donnée
    return piece !== null && piece.color === color; // Vérifie si la pièce est de la même couleur
  }

  // Obtenir la pièce à une position donnée
  getPieceAt(position) {
    const piece = this.grid[position];
    return (piece != null && piece.isActive == true) ? piece : null;
  }

  getPieceById(id) {
    if (typeof id === 'undefined' || id === null) {
        throw new Error("L'ID fourni est invalide.");
    }
    const piece = this.pieces.find(piece => piece.id === id);
    if (!piece) {
        throw new Error(`Aucune pièce trouvée avec l'ID : ${id}`);
    }
    return piece;
  }

  getKingByColor(color) {
    // Trouver la position du roi de la couleur donnée
    const king = this.pieces.find(piece => piece.type === PieceType.ROI && piece.color === color && piece.isActive);
    if (!king) {
        console.warn(`Roi introuvable pour la couleur ${color === Color.BLANC ? "blanc" : "noir"}`);
        return;
    }
    return king;
  }

  getIneligibleRooksForCastling(color) {
    return this.pieces.filter(piece => 
      piece.type === PieceType.TOUR &&
      piece.color === color &&
      (!piece.isActive || piece.movesCount > 0)
    );
  }

  getCapturedPieces(groupByType = false) {
      // Si groupByType est faux, on retourne les pièces capturées comme tableau
      if (!groupByType) {
          const capturedByWhite = this.pieces.filter(piece => !piece.isActive && piece.color === Color.NOIR);
          const capturedByBlack = this.pieces.filter(piece => !piece.isActive && piece.color === Color.BLANC);
          return { capturedByWhite, capturedByBlack };
      }

      // Sinon, on regroupe les pièces capturées par type
      const groupByTypeFunction = (pieces) => {
          return pieces.reduce((group, piece) => {
              (group[piece.type] = group[piece.type] || []).push(piece);
              return group;
          }, {});
      };

      const capturedByWhite = this.pieces.filter(piece => !piece.isActive && piece.color === Color.NOIR);
      const capturedByBlack = this.pieces.filter(piece => !piece.isActive && piece.color === Color.BLANC);

      return {
          capturedByWhite: groupByTypeFunction(capturedByWhite),
          capturedByBlack: groupByTypeFunction(capturedByBlack)
      };
  }

  async actionPieceIfValidById(id, destination, type, promotedTo = null) {

    const piece = this.getPieceById(id);
    if (!piece) {
        throw new Error(`Aucune pièce trouvée avec l'id ${id}`);
    }
    return await this.actionPieceIfValid(piece,destination,type,promotedTo,false);
  }

  async actionPieceIfValidByOrigin(origin, destination, type, promotedTo = null) {

    const piece = this.getPieceAt(origin);
    if (!piece) {
        throw new Error(`Aucune pièce trouvée à la position ${origin}`);
    }
    return await this.actionPieceIfValid(piece,destination,type,promotedTo,true);
  }

  async actionPieceIfValid(piece, destination, type, promotedTo = null, updatePgnNotation = true) {
  
    const move = await Actions.performMove(this,piece,destination,type,promotedTo);

    if (type != MoveType.CASTLING_K && type != MoveType.CASTLING_Q)
    {
      // Vérifier si le roi est en échec après ce déplacement
      const kingColor = piece.color;
      const isInCheck = Rules.isKingInCheck(this,kingColor);

      // Annuler le déplacement si le roi reste en échec
      if (isInCheck) {
          Actions.performUnmove(this,move);
          throw new Error(`Déplacement invalide : le roi ${kingColor === Color.BLANC ? "blanc" : "noir"} reste en échec.`);
      }
    }

    console.log(move.getMoveSummary());

    // Mettre à jour la grille
    this.updateBoardDisplay();

    this.priseEnPassant = '-';
    this.priseEnPassantPieces  = null;

    if (type != MoveType.ENPASSANT)
    {
      const priseEnPassant = Rules.canBeCapturedEnPassant(this,destination);
      if (priseEnPassant != null)
      {
        const destCol = String.fromCharCode(97 + (priseEnPassant.capturePosition % 8)); // Colonne d'origine (a-h)
        const destRow = Math.floor(priseEnPassant.capturePosition / 8) + 1 ; // 1-8
        this.priseEnPassant = `${destCol}${destRow}`;
        this.priseEnPassantPieces = priseEnPassant;
      }
    }

    const opponentColor = this.currentTurnColor === Color.BLANC ? Color.NOIR : Color.BLANC;
        
    this.incrementHalfMove(piece.type,move.isCapture());

    this.updateCastlingRights();

    this.makeMoveHistory(move,updatePgnNotation);
    this.movesHistory.push(move);

    console.log('makeMoveHistory');

    const currentFen = this.getNotationFen(opponentColor);
    const currentPgn = this.getMoveHistory();
    const {score, positionScore, pieceScore} = Evaluation.evaluate(this);

    const movement = {
        pgn : currentPgn,
        fen : currentFen,
        fullMoveCount : this.fullMoveCount,
        halfMoveCount  : this.halfMoveCount,
        hasWhiteCastlingRights: (this.castlingRights.includes('Q') || this.castlingRights.includes('K')),
        hasBlackCastlingRights: (this.castlingRights.includes('q') || this.castlingRights.includes('k')),
        priseEnPassant : this.priseEnPassant,
        isCanRequestDraw : Rules.checkFiftyMoveRule(this) || Rules.checkThreefoldRepetition(this,currentFen) ,
        isDraw :  move.isStalemate || move.isMaterialInsufficient || Rules.checkFivefoldRepetition(this,currentFen) ,
        isCheck : move.isCheck,
        isCheckmate : move.isCheckmate,
        score : score,
        positionScore : positionScore,
        pieceScore : pieceScore,
    };
    
    this.currentTurnColor = opponentColor ;

    return movement;
  }

  async setMoveByIndexTable(index) {
    let mouvement = null;
    let count = Math.abs(this.currentCellIndex - index);
    if (this.currentCellIndex < index)
    {
        while (count > 0) {
            mouvement = await this.redoLastMove();
            count--;
        }
    }
    else if (this.currentCellIndex > index)
    {
        while (count > 0) {
            mouvement = this.undoLastMove();
            count--;
        }
    }
    return mouvement;
}

  async restoreLastPosition() {
      if (this.redoStack.length === 0) {
          throw new Error("Aucun mouvement à rétablir.");
      }
      let mouvement = null;
      while (this.redoStack.length > 0) {
        mouvement = await this.redoLastMove();
      }
      return mouvement;
  }

  async redoLastMove() {
      if (this.redoStack.length === 0) {
          throw new Error("Aucun mouvement à rétablir.");
      }
      // Récupérer le dernier mouvement annulé
      const moveToRedo = this.redoStack.pop();
      // Extraire les informations du mouvement
      const destination = moveToRedo.destination;
      const type = moveToRedo.type;
      const promotedTo = (moveToRedo.promotedTo !== null)? this._getPieceTypeFromFEN(moveToRedo.promotedTo.toLowerCase()) : null;
      let mouvement = null;
      try {
          mouvement = await this.actionPieceIfValidById(moveToRedo.pieceId, destination, type, promotedTo , false);
      } catch (error) {
          // Si une erreur se produit, remettre le mouvement dans la pile redo
          this.redoStack.push(moveToRedo);
          throw new Error(`Erreur lors du rétablissement du mouvement : ${error.message}`);
      }
      return mouvement;
  }

  resetToInitialPosition() {
      if (this.movesHistory.length === 0) {
          throw new Error("L'échiquier est déjà dans sa position initiale.");
      }
      let mouvement = null;
      while (this.movesHistory.length > 0) {
          mouvement =  this.undoLastMove();
      }
      return mouvement;
  }

  undoLastMove() {
      if (this.movesHistory.length === 0) {
          throw new Error("Aucun mouvement à annuler.");
      }

      const lastMove = this.movesHistory.pop(); // Récupérer le dernier mouvement
      Actions.performUnmove(this, lastMove); // Annuler le mouvement

      this.updateBoardDisplay(); // Mettre à jour l'affichage
      this.removeLastPositionHistory();
      this.restoreHalfMove();

      this.priseEnPassant = '-';
      this.priseEnPassantPieces  = null;
  
      if (lastMove.type == MoveType.ENPASSANT)
      {
        const othermove = this.movesHistory[this.movesHistory.length -1];
        const priseEnPassant = Rules.canBeCapturedEnPassant(this,othermove.destination);
        if (priseEnPassant != null)
        {
          const destCol = String.fromCharCode(97 + (priseEnPassant.capturePosition % 8)); // Colonne d'origine (a-h)
          const destRow = Math.floor(priseEnPassant.capturePosition / 8) + 1 ; // 1-8
          this.priseEnPassant = `${destCol}${destRow}`;
          this.priseEnPassantPieces = priseEnPassant;
        }
      }

      // Revenir au tour précédent
      const opponentColor = this.currentTurnColor === Color.BLANC ? Color.NOIR : Color.BLANC;

      this.redoStack.push(lastMove); // Ajouter le mouvement annulé à redoStack
    
      this.removeMoveHistory();

      console.log(lastMove.getMoveSummary());

      this.updateCastlingRights();
  
      const currentPgn = this.getMoveHistory();
      const currentFen = this.getLastPositionHistory();
      const { score, positionScore, pieceScore  } = Evaluation.evaluate(this);
      const state = Rules.stateBoard(this);

      const movement = {
          pgn : currentPgn,
          fen : currentFen,
          fullMoveCount : this.fullMoveCount,
          halfMoveCount  : this.halfMoveCount,
          hasWhiteCastlingRights: (this.castlingRights.includes('Q') || this.castlingRights.includes('K')),
          hasBlackCastlingRights: (this.castlingRights.includes('q') || this.castlingRights.includes('k')),
          priseEnPassant : this.priseEnPassant,
          isCanRequestDraw : Rules.checkFiftyMoveRule(this) || Rules.checkThreefoldRepetition(this,currentFen) ,
          isDraw :  state.isStalemate || state.isMaterialInsufficient || Rules.checkFivefoldRepetition(this,currentFen) ,
          isCheck : state.isCheck,
          isCheckmate : state.isCheckmate,
          score : score,
          positionScore : positionScore,
          pieceScore : pieceScore,
      };
      
      this.currentTurnColor = opponentColor ;
      return movement;
  }

  updateBoardDisplay() {
    Ui.updateBoardDisplay(this);
  }

  downloadFEN() {
      // Obtenir la notation FEN actuelle
      const fen = this.getNotationFen(this.currentTurnColor);

      // Créer un fichier Blob contenant la notation FEN
      const blob = new Blob([fen], { type: 'text/plain' });

      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'chess_position.fen'; // Nom du fichier

      // Simuler un clic sur le lien pour déclencher le téléchargement
      link.click();

      // Libérer l'URL de l'objet après utilisation
      URL.revokeObjectURL(link.href);
  }


  getNotationFen(color) 
  {
    const fen = Notations.generateFEN(this,
        color,
        this.castlingRights, // Roques possibles (à adapter dynamiquement si nécessaire)
        this.priseEnPassant, // Prise en passant (à calculer dynamiquement)
        this.halfMoveCount, // Demi-coups (à incrémenter si pas de capture ou de mouvement de pion)
        this.fullMoveCount // Nombre de coups complets
    );

    this.savePositionHistory(fen);

    return fen;
  }

  removeMoveHistory()
  {
    if (this.currentTurnColor == Color.BLANC) {
      // Coup des blancs, commencer un nouveau tour
      const composition = this.currentPgnNotation[this.currentPgnNotation.length - 1].split('. ');
      this.currentPgnNotation[this.currentPgnNotation.length - 1] = `${composition[0]}. ${composition[1].split(' ')[0]}`
        if (this.fullMoveCount > 1) this.fullMoveCount--; 
    } else {
        this.currentPgnNotation.pop();
        // Coup des noirs, ajouter à la fin du dernier tour
    }
    return this.currentPgnNotation.join('\n'); // Historique complet
  }

  makeMoveHistory(move,updatePgnNotation = true) 
  {
    if (typeof move === 'undefined' || move === null || !(move instanceof Move))
      return;

    const moveNotation = Notations.generatePGNNotation(this,move);

    if (this.currentTurnColor === Color.BLANC) {
        // Coup des blancs, commencer un nouveau tour
        this.currentPgnNotation.push(`${this.fullMoveCount}. ${moveNotation}`);
    } else {
        // Coup des noirs, ajouter à la fin du dernier tour
        this.currentPgnNotation[this.currentPgnNotation.length - 1] += ` ${moveNotation}`;
        this.fullMoveCount++; // Incrémenter après le coup des noirs
    }

    if( updatePgnNotation )
        this.pgnNotation = this.currentPgnNotation.slice();

    return this.currentPgnNotation.join('\n'); // Historique complet
  }

  getMoveHistory() 
  {
    return this.pgnNotation.join('\n'); // Historique complet
  }

  downloadPGN() {
    if (!this.currentPgnNotation || this.currentPgnNotation.length === 0) {
        console.warn("Aucune notation PGN disponible pour téléchargement.");
        return;
    }

    // Déterminer le résultat de la partie
    let result = "*"; // Par défaut : partie incomplète

    if (Rules.isKingCheckmate(this,Color.NOIR)) {
        result = "1-0"; // Victoire des Blancs
    } else if (Rules.isKingCheckmate(this,Color.BLANC)) {
        result = "0-1"; // Victoire des Noirs
    } else if (Rules.isStalemate(this, Color.BLANC) || Rules.isStalemate(this, Color.NOIR)) {
        result = "1/2-1/2"; // Match nul (pat)
    } else if (this.movesHistory.length === 0 && this.redoStack.length === 0) {
        result = "*"; // Partie non commencée
    }

        // Générer le contenu PGN complet
    const header = `[Event "${this.event}"]\n[Site "${this.site}"]\n[Date "${this.date}"]\n[Round "${this.round}"]\n[White "${this.playerB}"]\n[Black "${this.playerN}"]\n[Result "${result}"]\n`; 
    
    // Fonction pour remplacer les caractères Unicode par des lettres
    const replaceUnicodeWithLetters = (notation, mapping) => {
        return notation.map(move => {
            let updatedMove = move;
            for (const [unicode, letter] of Object.entries(mapping)) {
                updatedMove = updatedMove.replace(new RegExp(unicode, 'g'), letter.toUpperCase());
            }
            return updatedMove;
        });
    };

    const updatedPgnNotation = replaceUnicodeWithLetters(this.currentPgnNotation, UnicodeToLetter);

    const formattedPgn = updatedPgnNotation.reduce((acc, move, index) => {
        if ((index + 1) % 6 === 0) {
            // Ajout d'un saut de ligne sans espace
            return acc + move + '\n';
        }
        return acc + move + ' ';
    }, '');

    const pgnContent = `${header}${formattedPgn.trim()}`;

    // Créer un fichier Blob contenant la notation PGN
    const blob = new Blob([pgnContent], { type: 'text/plain' });

    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chess_game.pgn'; // Nom du fichier

    // Simuler un clic sur le lien pour déclencher le téléchargement
    link.click();

    // Libérer l'URL de l'objet après utilisation
    URL.revokeObjectURL(link.href);
  }

  incrementHalfMove(type, isCapturePiece) {
      this.halfMoveHistory.push(this.halfMoveCount);
      // Réinitialiser le compteur si un pion est déplacé ou une capture effectuée
      if ( type === PieceType.PION || isCapturePiece) {
          this.halfMoveCount = 0;
      } else {
          this.halfMoveCount++; // Sinon, incrémenter le compteur
      }
  }

  restoreHalfMove() {
    this.halfMoveCount = this.halfMoveHistory.pop();
  }

  updateCastlingRights() 
  {
      this.castlingRights = '';
      const kingB = this.getKingByColor(Color.BLANC);
      const kingN = this.getKingByColor(Color.NOIR);
     
      if( kingB.movesCount == 0) this.castlingRights += 'KQ';
      if( kingN.movesCount == 0) this.castlingRights += 'kq';

      const castleB = this.getIneligibleRooksForCastling(Color.BLANC);
      if (castleB.length > 0)
      {
        castleB.forEach(castle => {
          if (castle.initialPosition === 0) this.castlingRights = this.castlingRights.replace('Q', ''); // Grand roque blanc
          if (castle.initialPosition === 7) this.castlingRights = this.castlingRights.replace('K', ''); // Petit roque blanc
        });
      }

      const castleN = this.getIneligibleRooksForCastling(Color.NOIR);
      if (castleN.length > 0)
      {
        castleN.forEach(castle => {
          if (castle.initialPosition === 56) this.castlingRights = this.castlingRights.replace('q', ''); // Grand roque noir
          if (castle.initialPosition === 63) this.castlingRights = this.castlingRights.replace('k', ''); // Petit roque noir
        });
      }

      // Si aucun droit n'est disponible, remplacer par '-'
      if (this.castlingRights === '') {
          this.castlingRights = '-';
      }
  }
    
  determineMoveType(selectedPiece, destination, priseEnPassant, priseEnPassantPieces) {
      const origin = selectedPiece.index;
      const attacker = selectedPiece.piece;
      const targetPiece = this.getPieceAt(destination);

      if (!Rules.isValidMove(this, origin, destination)) {

          // Prise en passant
          if (priseEnPassant !== '-' && priseEnPassantPieces != null && attacker.id === priseEnPassantPieces.attackingPawn.id) {
              return MoveType.ENPASSANT;
          }

          // Si le mouvement n'est pas valide
          return MoveType.INVALID;
      }

      // Déplacement avec potentiel capture
      if (targetPiece) {
          return this.determineCaptureType(attacker, destination);
      }

      // Déplacement normal
      return this.determineNonCaptureType(attacker, origin, destination);
  }

  determineCaptureType(attacker, destination) {
      const { type, color } = attacker;

      // Les rois ne peuvent pas capturer si le mouvement n'est pas valide
      if (type === PieceType.ROI && !Rules.isCapturePiece(this, destination, color)) {
          return MoveType.INVALID;
      }

      // Promotion d'un pion avec capture
      if (type === PieceType.PION && Rules.isPawnPromotion(attacker, destination)) {
          return MoveType.PROMOTION_CAPTURE;
      }

      // Capture normale
      return MoveType.CAPTURE;
  }

  determineNonCaptureType(attacker, origin, destination) {
      const { type } = attacker;

      // Roque
      if (type === PieceType.ROI && Math.abs(destination - origin) === 2) {
          return destination > origin ? MoveType.CASTLING_K : MoveType.CASTLING_Q;
      }

      // Promotion d'un pion
      if (type === PieceType.PION && Rules.isPawnPromotion(attacker, destination)) {
          return MoveType.PROMOTION;
      }

      // Déplacement normal
      return MoveType.NORMAL;
  }

  getPossibleMoves(piecePosition) {
      const piece = this.getPieceAt(piecePosition);
      if (!piece) {
          throw new Error('Aucune pièce à cette position.');
      }

      const possibleMoves = [];
      const kingColor = piece.color;

      // Parcourir toutes les cases de l'échiquier
      for (let destination = 0; destination < 64; destination++) {
          try {
              // Vérifier si le mouvement est valide
              if (Rules.isValidMove(this,piecePosition, destination)) {
                  Actions.simulateMove(this,piece, destination, destination , () => {
                      if (!Rules.isKingInCheck(this, kingColor)) {
                          possibleMoves.push(destination); // Ajouter le mouvement valide
                      }
                  });
              }
          } catch {
              // Ignorer les mouvements invalides
              continue;
          }
      }

      // Ajouter la prise en passant si applicable
      if (this.priseEnPassant !== '-' && this.priseEnPassantPieces !== null) {
          const capturePosition = this.priseEnPassantPieces.capturePosition;
          Actions.simulateMove(this,piece, capturePosition, this.priseEnPassantPieces.targetPawn.position , () => {
            if (!Rules.isKingInCheck(this, kingColor)) {
                possibleMoves.push(capturePosition); // Ajouter le mouvement valide
            }
          });
      }
      return possibleMoves;
  }
    // Méthode auxiliaire pour obtenir les cases adjacentes
  _getAdjacentSquares(position) {
        const adjacentSquares = [];
        const row = Math.floor(position / 8);
        const col = position % 8;

        // Parcourir les cases adjacentes
        for (let dRow = -1; dRow <= 1; dRow++) {
            for (let dCol = -1; dCol <= 1; dCol++) {
                if (dRow === 0 && dCol === 0) continue; // Ignorer la case actuelle
                const newRow = row + dRow;
                const newCol = col + dCol;

                // Vérifier si la case est dans les limites de l'échiquier
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    adjacentSquares.push(newRow * 8 + newCol);
                }
            }
        }

        return adjacentSquares;
  }

  async handleSquareClick(index,reset = false) {
      try {

          if (reset == true && this.selectedPiece)
          {
            this.resetSelection();
          }

          const piece = this.getPieceAt(index);
  
          if (this._checkColorPiece(piece)) {
            // Vérifiez si une autre pièce est déjà sélectionnée
            if (this.selectedPiece && this.selectedPiece.piece.id != piece.id) {
                // Si la même pièce est cliquée, réinitialisez la sélection
                this.resetSelection();
            }
          }

          // Si une pièce est déjà sélectionnée
          if (this.selectedPiece) {
              const movement = await this.tryMovePiece(index);
              if (movement) return movement;
          }
  
          // Sinon, tenter de sélectionner une nouvelle pièce
          this.selectPiece(piece, index);
          return null;
      } catch (error) {
          this.resetSelection();
          console.error(error.message);
          return null;
      }
  }
  checkColorPieceByIndex(index) {
    const piece = this.getPieceAt(index);
    return this._checkColorPiece(piece);
  }
  _checkColorPiece(piece) {
    return (piece && piece.color === this.currentTurnColor);
  }
  resetSelection() {
      this.selectedPiece = null;
      Ui.clearSelectedSquareHighlight();
      Ui.clearHighlightedMoves();
  }
  selectPiece(piece, index) {
      if (this._checkColorPiece(piece)) {
          this.resetSelection(); // Réinitialiser l'état visuel
          this.selectedPiece = { piece, index };
          Ui.highlightSelectedSquare(index);

          const possibleMoves = this.getPossibleMoves(index);
          Ui.highlightPossibleMoves(possibleMoves);
      } else {
          this.resetSelection();
      }
  }
  async tryMovePiece(destination) {
      const typeMove = this.determineMoveType(
          this.selectedPiece,
          destination,
          this.priseEnPassant,
          this.priseEnPassantPieces
      );

      if (typeMove === MoveType.INVALID) {
          throw new Error('Déplacement invalide.');
      }

      const movement = await this.actionPieceIfValidByOrigin(this.selectedPiece.index, destination, typeMove);

      if (movement.isCheck) {
          const king = this.getKingByColor(this.currentTurnColor);
          Ui.highlightKingInCheck(king.position);
      }

      this.selectedPiece = null;
      return movement;
  }

  /**
     * Charge un fichier FEN ou PGN et met à jour l'échiquier.
     * @param {File} file - Le fichier sélectionné.
     * @param {Board} board - Instance de l'échiquier à mettre à jour.
     */
  async loadFile(file) {
    if (!file) {
        console.error("Aucun fichier sélectionné.");
        return;
    }

    const fileContent = await file.text(); // Lire le contenu du fichier
    const isFen = fileContent.trim().split(/\s+/).length <= 6; // Vérifie si le format est FEN

    try {
        if (isFen) {
            // Charger un fichier FEN
            this.loadFEN(fileContent);
        } else {
            // Charger un fichier PGN
            await this.loadPGN(fileContent);
        }
    } catch (error) {
        console.error("Erreur lors du chargement du fichier :", error.message);
    }
  }

  /**
   * Charge une position FEN et met à jour l'échiquier.
   * @param {string} fen - La chaîne FEN.
   * @param {Board} board - Instance de l'échiquier.
   */
  loadFEN(fen) {
      if (!fen || typeof fen !== 'string') {
          throw new Error("La position FEN est invalide.");
      }

      // Méthode existante pour appliquer la position FEN à l'échiquier
      this.applyFEN(fen); // Assurez-vous que `applyFEN` existe dans la classe `Board`

      this.updateBoardDisplay();

      console.log("Position FEN chargée :", fen);
  }

  applyFEN(fen) {
    if (!fen) {
        throw new Error("La chaîne FEN est vide ou invalide.");
    }

    const parts = fen.split(' ');

    if (parts.length < 4 || parts.length > 6) {
        throw new Error("La chaîne FEN est mal formée.");
    }

    const [position, turn, castling, enPassant, halfMove = 0, fullMove = 1] = parts;

    this.initBoard();

    this.grid.fill(null);
    this.pieces.forEach(piece => {
        piece.isActive = false; // Désactiver toutes les pièces
    });
    this.capturedPieces = {
        white: [],
        black: []
    };

    this.halfMoveCount = parseInt(halfMove, 10);
    this.fullMoveCount = parseInt(fullMove, 10);
    this.currentTurnColor = turn === 'w' ? Color.BLANC : Color.NOIR;
    this.castlingRights = castling;
    this.priseEnPassant = enPassant;
    this.priseEnPassantPieces = this._findEnPassantPiece(enPassant);

    // 2. Placer les pièces sur l'échiquier
    let squareIndex = 0; // Commence par la rangée 0 (Blancs en bas)

    const rows = position.split('/'); // Diviser par rangées
    if (rows.length !== 8) {
        throw new Error("La description de l'échiquier dans la FEN est incorrecte.");
    }

    for (const row of rows.reverse()) { // Traiter les rangées de bas en haut
        for (const char of row) {
            if (!isNaN(parseInt(char, 10))) {
                squareIndex += parseInt(char, 10); // Cases vides
            } else {
                const color = char === char.toUpperCase() ? Color.BLANC : Color.NOIR;
                const type = this._getPieceTypeFromFEN(char.toLowerCase());

                if (type === null || type === undefined) {
                    throw new Error(`Type de pièce invalide dans FEN : ${char}`);
                }

                if (type === -1) {
                    throw new Error(`Type de pièce invalide dans FEN : ${pion}`);
                }

                // Vérifier si une pièce correspondante existe déjà
                let piece = this.pieces.find(p => p.type === type && p.color === color && !p.isActive);
                if (!piece) {
                    // Créer une nouvelle pièce si aucune pièce inactive n'est disponible
                    piece = new Piece(
                        type,
                        squareIndex,
                        color,
                        (squareIndex + Math.floor(squareIndex / 8)) % 2 === 0 ? Color.BLANC : Color.NOIR
                    );
                    this.pieces.push(piece);
                }

                // Activer la pièce et la placer sur l'échiquier
                piece.isActive = true;
                piece.movesCount = 1;
                piece.position = squareIndex;

                squareIndex++;
            }
        }
        if (squareIndex % 8 !== 0) {
            throw new Error("La description de l'échiquier dans la FEN est incorrecte (trop de colonnes).");
        }
    }

    this.pieces.forEach(piece => {
        if (!piece.isActive) {
            this.capturedPieces[ColorTypeTostring[piece.color]].push(piece);
        }
    });

    const validCastling = /^[KQkq]+$|^-$/;
    if (!validCastling.test(castling)) {
        throw new Error("Les droits de roque dans FEN sont mal formés.");
    }

    if (this.priseEnPassant !== '-' && ( !/^[a-h][36]$/.test(this.priseEnPassant) || this.priseEnPassantPieces == null ) ) {
        throw new Error("La prise en passant dans FEN est mal formée.");
    }

    this.updateGrid();

    if (this.onMove)
    {
        const currentFen = this.getNotationFen(this.currentTurnColor);
        const { score, positionScore, pieceScore  } = Evaluation.evaluate(this);
        const state = Rules.stateBoard(this);
    
        const caseInfo = {
            fen: currentFen,
            pgn: '',
            updatePgn: true,
            fullMoveCount : this.fullMoveCount,
            halfMoveCount  : this.halfMoveCount,
            hasWhiteCastlingRights: (this.castlingRights.includes('Q') || this.castlingRights.includes('K')),
            hasBlackCastlingRights: (this.castlingRights.includes('q') || this.castlingRights.includes('k')),
            priseEnPassant : this.priseEnPassant,
            isCanRequestDraw : Rules.checkFiftyMoveRule(this) || Rules.checkThreefoldRepetition(this,currentFen) ,
            isDraw :  state.isStalemate || state.isMaterialInsufficient || Rules.checkFivefoldRepetition(this,currentFen) ,
            isCheckWhite : ( this.currentTurnColor == Color.BLANC ) ? state.isCheck : false, 
            isCheckBlack : ( this.currentTurnColor == Color.NOIR ) ? state.isCheck : false, 
            isCheckmate : state.isCheckmate,
            score : score,
            positionScore : positionScore,
            pieceScore : pieceScore
        };
        this.onMove(caseInfo); // Exécuter la callback avec les infos de la case
    }
  }

  _findEnPassantPiece(enPassant) {
    if (enPassant === "-") {
        return null; // Pas de position de prise en passant
    }

    // Convertir la position en index de grille
    const file = enPassant.charCodeAt(0) - 'a'.charCodeAt(0); // Colonne (a-h -> 0-7)
    const rank = parseInt(enPassant.charAt(1), 10) - 1; // Ligne (1-8 -> 0-7)
    const enPassantIndex = rank * 8 + file;

    // Déterminer la direction en fonction de la couleur au trait
    const direction = this.currentTurnColor === Color.BLANC ? -1 : 1;

    // La position du pion potentiel à capturer
    const capturingPionPosition = enPassantIndex + (8 * direction);

    // Vérifier si une pièce valide est présente à cette position
    const piece = this.getPieceAt(capturingPionPosition);

    if (piece && piece.type === PieceType.PION && piece.color !== this.currentTurnColor) {
        return piece; // Le pion peut être capturé en passant
    }

    return null; // Aucun pion ne peut être capturé en passant
  }

  _getPieceTypeFromFEN(pion) {
    const map = {
        'p': PieceType.PION,
        'r': PieceType.TOUR,
        'n': PieceType.CHEVAL,
        'b': PieceType.FOU,
        'q': PieceType.REINE,
        'k': PieceType.ROI
    };
    return map[pion] ?? -1;
  }

  getTotalMovesCount() {
    if (!Array.isArray(this.pgnNotation) || this.pgnNotation.length === 0) {
        return 0; // Si la notation est vide ou invalide, retourne 0
    }

    let totalMoves = 0;

    // Parcourir chaque ligne de notation PGN
    this.pgnNotation.forEach(line => {
        // Diviser la ligne en éléments, en ignorant le numéro du tour (par exemple, "1.", "2.")
        const moves = line.split(' ').filter(item => !item.includes('.'));

        // Ajouter le nombre de coups de la ligne au total
        totalMoves += moves.length;
    });

    return totalMoves;
  }

  /**
   * Charge une partie PGN et met à jour l'échiquier.
   * @param {string} pgn - La chaîne PGN.
   * @param {Board} board - Instance de l'échiquier.
   */
  async loadPGN(pgn) {
      if (!pgn || typeof pgn !== 'string') {
          throw new Error("Le fichier PGN est invalide.");
      }

      // Méthode existante pour appliquer le PGN à l'échiquier
      const contentPgn = Notations.parsePGN(pgn); // Parse les mouvements à partir du PGN
     
      this.playerB = contentPgn.metadata.White;
      this.playerN  = contentPgn.metadata.Black;
      this.event = contentPgn.metadata.Event;
      this.site = contentPgn.metadata.Site;
      this.date = contentPgn.metadata.Date;
      this.round = contentPgn.metadata.Round;

      $('#nameUserWhite').html(this.playerB);
      $('#nameUserBlack').html(this.playerN);

      await this.initializeBoardFromMoves(contentPgn.moves);

      Ui.navigateHistoryTable(this,this.getTotalMovesCount());

      console.log(contentPgn);

      console.log("Partie PGN chargée :", pgn);
  }

  async initializeBoardFromMoves(moves) {
      // Étape 1 : Réinitialiser l'échiquier à l'état initial
      this.initBoard();

      // Étape 2 : Appliquer chaque mouvement
      let currentColor = Color.BLANC; // Blanc commence toujours

      for (const move of moves) {
          // Décoder le mouvement en origine, destination et type
          const { origin, destination, type } = this.decodeMove(move, currentColor);

          // Appliquer le mouvement sur l'échiquier
          const movement = await this.actionPieceIfValidByOrigin(origin, destination, type);

          if (movement.isCheck) {
              const king = this.getKingByColor(this.currentTurnColor);
              Ui.highlightKingInCheck(king.position);
          }
  
          if (movement) {
              if (this.onMove) {

                  const { score, positionScore, pieceScore  } = Evaluation.evaluate(this);

                  const caseInfo = {
                      fen: movement.fen,
                      pgn: movement.pgn,
                      updatePgn: true,
                      fullMoveCount : movement.fullMoveCount, 
                      halfMoveCount  : movement.halfMoveCount, 
                      hasWhiteCastlingRights: movement.hasWhiteCastlingRights, 
                      hasBlackCastlingRights: movement.hasBlackCastlingRights, 
                      priseEnPassant : movement.priseEnPassant, 
                      isCanRequestDraw : movement.isCanRequestDraw, 
                      isDraw : movement.isDraw, 
                      isCheckWhite : ( this.currentTurnColor == Color.BLANC ) ? movement.isCheck : false, 
                      isCheckBlack : ( this.currentTurnColor == Color.NOIR ) ? movement.isCheck : false, 
                      isCheckmate : movement.isCheckmate,
                      score : score,
                      positionScore : positionScore,
                      pieceScore : pieceScore,
                  };
                  this.onMove(caseInfo); // Exécuter la callback avec les infos de la case
              }
          }

          // Alterner la couleur du joueur
          currentColor = currentColor === Color.BLANC ? Color.NOIR : Color.BLANC;

      }

      console.log("Initialisation des pièces terminée.");
  }

  /**
   * Décode un mouvement PGN en une origine, une destination et un type.
   * @param {string} move - Mouvement en notation PGN (ex : "e4", "Nf3").
   * @param {Color} currentColor - Couleur du joueur actuel.
   * @returns {object} - Un objet contenant l'origine, la destination et le type de mouvement.
   */
    decodeMove(move, currentColor) {
      // Gérer les cas spéciaux : roque
      if (move === "O-O") {
          const kingPosition = this.getKingByColor(currentColor).position;
          const destination = kingPosition + 2; // Petit roque
          return { origin: kingPosition, destination, type: MoveType.CASTLING_K };
      }
      if (move === "O-O-O") {
          const kingPosition = this.getKingByColor(currentColor).position;
          const destination = kingPosition - 2; // Grand roque
          return { origin: kingPosition, destination, type: MoveType.CASTLING_Q };
      }
  
      const cleanedMove = move.replace(/[+#]/g, ""); // Supprimer les symboles '+' et '#' pour le traitement

      // Identifier si le mouvement met en échec et nettoyer le mouvement
      move = move.replace("+", "");
  
      // Identifier la case de destination
      const destination = this.parseSquare(cleanedMove.slice(-2));
  
      // Gérer les prises
      if (cleanedMove.includes('x')) {
          const pieceType = this.getPieceTypeFromPGN(cleanedMove); // Identifier la pièce impliquée (par défaut PION)
          const possiblePieces = this.pieces.filter(
              (p) =>
                  p.type === pieceType &&
                  p.color === currentColor &&
                  p.isActive &&
                  p.isValidMove(this, destination) // Valider le mouvement
          );
  
          if (possiblePieces.length === 1) {
              const origin = possiblePieces[0].position;
              return { origin, destination, type: MoveType.CAPTURE };
          } else if (possiblePieces.length > 1) {
              // Désambiguïsation si plusieurs pièces peuvent capturer
              const origin = this.disambiguateMove(cleanedMove, possiblePieces);
              return { origin, destination, type: MoveType.CAPTURE };
          }
  
          throw new Error(`Impossible de décoder le mouvement : ${cleanedMove}`);
      }
  
      // Identifier le type de pièce pour les mouvements normaux
      const pieceType = this.getPieceTypeFromPGN(cleanedMove);
      const possiblePieces = this.pieces.filter(
          (p) =>
              p.type === pieceType &&
              p.color === currentColor &&
              p.isActive &&
              p.isValidMove(this, destination)
      );
  
      if (possiblePieces.length === 1) {
          const origin = possiblePieces[0].position;
          return { origin, destination, type: MoveType.NORMAL };
      } else if (possiblePieces.length > 1) {
          const origin = this.disambiguateMove(cleanedMove, possiblePieces);
          return { origin, destination, type: MoveType.NORMAL };
      }
  
      throw new Error(`Impossible de décoder le mouvement : ${cleanedMove}`);
  }

  /**
   * Convertit une case PGN (ex : "e4") en index de la grille (0-63).
   * @param {string} square - Case en notation PGN.
   * @returns {number} - Index de la grille (0-63).
   */
  parseSquare(square) {

      const isWhiteBottom = this.orientationBoard === Color.BLANC;
      const indicatorBoard  = this.indicatorBoard;

      const colChar = square[0]; // Première lettre de la case (a-h)
      const rowChar = square[1]; // Deuxième caractère de la case (1-8)
  
      // Calculer la colonne en fonction de l'orientation
      const col = colChar.charCodeAt(0) - 'a'.charCodeAt(0); // 'a' = 0, 'b' = 1, ..., 'h' = 7
      const actualCol = isWhiteBottom ? col : 7 - col;
  
      // Calculer la ligne en fonction de l'indicateur
      const row = parseInt(rowChar, 10); // Convertir le numéro de ligne en entier
      const actualRow = indicatorBoard === 'right' 
          ? (isWhiteBottom ? 8 - row : row - 1)
          : (isWhiteBottom ? row - 1 : 8 - row);
  
      // Retourner l'index de la case sur la grille (0-63)
      return actualRow * 8 + actualCol;
  }

  /**
   * Identifie le type de pièce à partir de la notation PGN.
   * @param {string} move - Mouvement en notation PGN.
   * @returns {number} - Type de la pièce (PieceType).
   */
  getPieceTypeFromPGN(move) {
      const pieceMap = {
          K: PieceType.ROI,
          Q: PieceType.REINE,
          R: PieceType.TOUR,
          B: PieceType.FOU,
          N: PieceType.CHEVAL,
      };
      return pieceMap[move[0]] || PieceType.PION; // Par défaut : pion
  }

  /**
   * Désambiguïse un mouvement PGN lorsque plusieurs pièces sont valides.
   * @param {string} move - Mouvement en notation PGN.
   * @param {Piece[]} possiblePieces - Liste des pièces possibles.
   * @returns {number} - Position d'origine de la pièce choisie.
   */
  disambiguateMove(move, possiblePieces) {

    const disambiguate = move[1]  // Désambiguïsation par colonne (ex: "b" dans "Nbd7") ou ligne

    const isColumn = /^[a-h]$/.test(disambiguate); // Vérifier si c'est une colonne
    const isRow = /^[1-8]$/.test(disambiguate); // Vérifier si c'est une ligne

    const filteredPieces = possiblePieces.filter((p) => {
        if (isColumn) {
            // Filtrer par colonne
            return p.position % 8 === disambiguate.charCodeAt(0) - 'a'.charCodeAt(0);
        } else if (isRow) {
            // Filtrer par ligne
            return Math.floor(p.position / 8) === 8 - parseInt(disambiguate, 10);
        }
        return false;
    });

    console.log('disambiguateMove',filteredPieces);

    if (filteredPieces.length === 1) {
       return filteredPieces[0].position;
    }
  }

};
