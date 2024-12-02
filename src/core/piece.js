import { Rules } from './rules-engine.js';

// Définition des types et constantes
export const PieceType = {
  PION: 0,
  TOUR: 1,
  CHEVAL: 2,
  FOU: 3,
  ROI: 4,
  REINE: 5
};

export const Color = {
  BLANC: 0,
  NOIR: 1
};

export const PieceTypeToString = {
  0: 'pawn',
  1: 'rook',
  2: 'knight',
  3: 'bishop',
  4: 'king',
  5: 'queen'
};

export const ColorTypeTostring = {
  0: 'white',
  1: 'black'
};

export const PieceValue = {
  PION: 1000,
  TOUR: 7000,
  CHEVAL: 5000,
  FOU: 3000,
  ROI: 1,
  REINE: 10000
};

// Codes Unicode pour les pièces
export const UnicodePieces = {
  white: { //BLANC
    pawn: '♙',
    rook: '♖',
    knight: '♘',
    bishop: '♗',
    king: '♔',
    queen: '♕'
  },
  black: { //NOIR
    pawn: '♟',
    rook: '♜',
    knight: '♞',
    bishop: '♝',
    king: '♚',
    queen: '♛'
  }
};

function uuidShort() {
  return 'xxxxxxxx'.replace(/x/g, function () {
    const r = (Math.random() * 16) | 0;
    return r.toString(16);
  });
}

// Classe `Piece`
export class Piece {
  constructor(type, position, color, colorCase , isActive = true) {
    this.id = uuidShort();
    this.type = type; // Type de la pièce (PION, TOUR, etc.)
    this.isPromoted = false;
    this.position = position; // Position actuelle sur l'échiquier
    this.color = color; // Couleur de la pièce (BLANC, NOIR)
    this.isActive = isActive; // Statut de la pièce (1: actif, 0: mangé)
    this.initialColorPosition = colorCase; // Couleur de la case au départ
    this.initialPosition = position; // Position initiale pour certaines règles (ex: pion)
    this.movesCount = 0; // Nombre de déplacements
    this.value = this.getValue(); // Valeur de la pièce pour l'évaluation

    this.unicode = UnicodePieces[ColorTypeTostring[color]][PieceTypeToString[type]]; // Code Unicode de la pièce
  }

  // Méthode pour cloner une pièce
  clone() {
      let piece = new Piece(this.type, this.initialPosition , this.color, this.initialColorPosition , this.isActive);
      piece.id = this.id;
      piece.isPromoted = this.isPromoted;
      piece.movesCount = this.movesCount;
      piece.position = this.position;
      return piece;
  }

  // Méthodes
  getValue() {
    switch (this.type) {
      case PieceType.PION:
        return PieceValue.PION;
      case PieceType.TOUR:
        return PieceValue.TOUR;
      case PieceType.CHEVAL:
        return PieceValue.CHEVAL;
      case PieceType.FOU:
        return PieceValue.FOU;
      case PieceType.ROI:
        return PieceValue.ROI;
      case PieceType.REINE:
        return PieceValue.REINE;
      default:
        return 0;
    }
  }

  promotedTo(type) {
    this.isPromoted = true;
    this.type = type;
    this.unicode = UnicodePieces[ColorTypeTostring[this.color]][PieceTypeToString[this.type]];
    this.value = this.getValue();
    this.movesCount = 0;
  }

  incrementMoves() {
    this.movesCount++;
  }

  decrementMoves() {
    if (this.movesCount > 0) this.movesCount--;
  }

  reset() {
    if (this.isPromoted == true)
    {
      this.type = PieceType.PION;
      this.unicode = UnicodePieces[ColorTypeTostring[this.color]][PieceTypeToString[PieceType.PION]];
    }
    this.value = this.getValue();
    this.isPromoted = false;
    this.isActive = true;
    this.position = this.initialPosition;
    this.movesCount = 0;
  }

  // Récupère le caractère Unicode de la pièce
  getUnicode() {
    return this.unicode;
  }

  // Génère une notation FEN pour cette pièce
  getFENNotation() {
    const fenMap = {
      [PieceType.PION]: "P",
      [PieceType.TOUR]: "R",
      [PieceType.CHEVAL]: "N",
      [PieceType.FOU]: "B",
      [PieceType.ROI]: "K",
      [PieceType.REINE]: "Q"
    };
    return this.color === Color.BLANC
      ? fenMap[this.type]
      : fenMap[this.type].toLowerCase();
  }

  getSummary() {
    return `Id: ${this.id}, Type: ${this.type}, Position: ${this.position}, Couleur: ${this.color}, Couleur case départ: ${this.initialColorPosition}, Unicode: ${this.unicode}`;
  }

  // Valider le déplacement en fonction du type de pièce
  isValidMove(board,destination) {
    const rowStart = Math.floor(this.position / 8);
    const colStart = this.position % 8;
    const rowEnd = Math.floor(destination / 8);
    const colEnd = destination % 8;

    const rowDiff = rowEnd - rowStart;
    const colDiff = colEnd - colStart;
    
    switch (this.type) {
      case PieceType.PION:
        return this.validatePawnMove(board,rowDiff, colDiff, destination);
      case PieceType.TOUR:
        return this.validateRookMove(board,rowDiff, colDiff, destination);
      case PieceType.CHEVAL:
        return this.validateKnightMove(rowDiff, colDiff );
      case PieceType.FOU:
        return this.validateBishopMove(board,rowDiff, colDiff, destination);
      case PieceType.REINE:
        return this.validateQueenMove(board,rowDiff, colDiff, destination);
      case PieceType.ROI:
        return this.validateKingMove(board,rowDiff, colDiff,destination);
      default:
        return false;
    }
  }

  // Validation du mouvement d'un pion
  validatePawnMove(board,rowDiff, colDiff, destination) {
      const direction = this.color === Color.NOIR ? -1 : 1; // Sens du déplacement
      const startRow = this.color === Color.NOIR ? 6 : 1; // Ligne de départ

      const absColDiff = Math.abs(colDiff);
      const isCapture = absColDiff === 1 && rowDiff === direction; // Capture diagonale

      // Interdire les déplacements vers l'arrière
      if (rowDiff !== direction && !(rowDiff === 2 * direction && Math.floor(this.position / 8) === startRow)) {
          return false; // Le pion ne peut reculer ni avancer de manière invalide
      }

      // Déplacement simple
      if (absColDiff === 0 && rowDiff === direction && !board.isOccupied(destination)) {
          return true;
      }

      // Déplacement initial (deux cases)
      if (
          absColDiff === 0 &&
          rowDiff === 2 * direction &&
          Math.floor(this.position / 8) === startRow &&
          !board.isOccupied(destination) &&
          !board.isOccupied(this.position + 8 * direction)
      ) {
          return true;
      }

      // Capture diagonale
      if (isCapture && board.isOccupied(destination)) {
          return true;
      }
      return false; // Mouvement invalide
  }


  /*###|-|---|---|---|---|---|---|---|---|#####
    ###| | A | B | C | D | E | F | G | H |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|8|   |   |   | x |   |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|7|   |   |   | x |   |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|6|   |   |   | x |   |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|5|   |   |   | x |   |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|4| x | x | x | R | x | x | x | x |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|3|   |   |   | x |   |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|2|   |   |   | x |   |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|1|   |   |   | x |   |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####*/
  // Validation du mouvement d'une tour
  validateRookMove(board,rowDiff, colDiff, destination) {
    // La tour se déplace uniquement en ligne droite (horizontale ou verticale)
    if (rowDiff !== 0 && colDiff !== 0 ) return false;

    // Vérification des déplacements horizontaux
    if (rowDiff === 0) {
        const step = colDiff > 0 ? 1 : -1; // Avancer à droite (1) ou à gauche (-1)
        let current = this.position + step;

        // Parcourir les cases entre la position actuelle et la destination
        while (current !== destination) {
            if (board.isOccupied(current)) return false; // Obstacle détecté
            current += step;
        }
    }

    // Vérification des déplacements verticaux
    if (colDiff === 0) {

        const step = rowDiff > 0 ? 8 : -8; // Monter (-8) ou descendre (+8)
        let current = this.position + step;

        // Parcourir les cases entre la position actuelle et la destination
        while (current !== destination) {
            if (board.isOccupied(current)) return false; // Obstacle détecté
            current += step;
        }
    }

    return true; // Aucun obstacle trouvé, mouvement valide
}

  /*###|-|---|---|---|---|---|---|---|---|#####
    ###| | A | B | C | D | E | F | G | H |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|8|   |   |   |   |   |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|7|   |   |   |   |   |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|6|   |   | x |   | x |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|5|   | x |   |   |   | x |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|4|   |   |   | N |   |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|3|   | x |   |   |   | x |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|2|   |   | x |   | x |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|1|   |   |   |   |   |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####*/
  // Validation du mouvement d'un cavalier
  validateKnightMove(rowDiff, colDiff ) {
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);
    return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2) ;
  }

  /*###|-|---|---|---|---|---|---|---|---|#####
    ###| | A | B | C | D | E | F | G | H |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|8|   |   |   |   |   |   |   | x |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|7| x |   |   |   |   |   | x |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|6|   | x |   |   |   | x |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|5|   |   | x |   | x |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|4|   |   |   | B |   |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|3|   |   | x |   | x |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|2|   | x |   |   |   | x |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|1| x |   |   |   |   |   | x |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####*/
  // Validation du mouvement d'un fou
  validateBishopMove(board,rowDiff, colDiff, destination) {
      // Vérifie si le déplacement est bien une diagonale
      if (Math.abs(rowDiff) !== Math.abs(colDiff)) return false;

      // Détermine la direction (step) selon la diagonale
      let step;
      if (rowDiff > 0 && colDiff > 0) {
          step = 9; // Bas-droite
      } else if (rowDiff > 0 && colDiff < 0) {
          step = 7; // Bas-gauche
      } else if (rowDiff < 0 && colDiff > 0) {
          step = -7; // Haut-droite
      } else if (rowDiff < 0 && colDiff < 0) {
          step = -9; // Haut-gauche
      }

      // Vérifie chaque case sur le chemin
      let current = this.position + step;
      while (current !== destination) {
          if (board.isOccupied(current)) return false; // Obstacle détecté
          current += step; // Avance dans la diagonale
      }

      return true; // Déplacement valide si aucune case n'est occupée
  }


  /*###|-|---|---|---|---|---|---|---|---|#####
    ###| | A | B | C | D | E | F | G | H |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|8|   |   |   | x |   |   |   | x |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|7| x |   |   | x |   |   | x |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|6|   | x |   | x |   | x |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|5|   |   | x | x | x |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|4| x | x | x | Q | x | x | x | x |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|3|   |   | x | x | x |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|2|   | x |   | x |   | x |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|1| x |   |   | x |   |   | x |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####*/
  // Validation du mouvement d'une reine
  validateQueenMove(board,rowDiff, colDiff,destination) {
    return (
      this.validateRookMove(board, rowDiff, colDiff, destination ) ||
      this.validateBishopMove(board, rowDiff, colDiff, destination)
    );
  }

  /*###|-|---|---|---|---|---|---|---|---|#####
    ###| | A | B | C | D | E | F | G | H |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|8| r |   | x | x | r | x | x | r |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|7|   |   |   |   |   |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|6|   |   |   |   |   |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|5|   |   | x | x | x |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|4|   |   | x | K | x |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|3|   |   | x | x | x |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|2|   |   |   |   |   |   |   |   |#####
    ###|-|---|---|---|---|---|---|---|---|#####
    ###|1| R |   | x | x | R | x | x | R |#####
    ###|-|---|---|---|---|---|---|---|---|#####*/
  // Validation du mouvement d'un roi
  validateKingMove(board,rowDiff, colDiff, destination) {
      const absRowDiff = Math.abs(rowDiff);
      const absColDiff = Math.abs(colDiff);

      // Déplacement normal du roi (1 case dans n'importe quelle direction)
      if (absRowDiff <= 1 && absColDiff <= 1) {
          return true;
      }
      // Logique pour le roque
      if (rowDiff === 0 && absColDiff === 2) {
          // Vérifier si le roque est possible
          return Rules.isCastlingAllowed(board,this,destination);
      }
      return false;
  }

}