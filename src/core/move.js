export const MoveType = {
  INVALID: 0,
  NORMAL: 1,
  CAPTURE: 2,
  CASTLING_Q: 3,
  CASTLING_K: 4,
  PROMOTION: 5,
  PROMOTION_CAPTURE: 6,
  ENPASSANT: 7
};

export const MoveTypeToString = {
  0: 'invalide',
  1: 'normal',
  2: 'capture',
  3: 'castling_queen',
  4: 'castling_king',
  5: 'promotion',
  6: 'promotion_capture',
  7: 'en_passant'
};

export class Move {
  constructor(pieceId, origin, destination, options = {}) {
      this.pieceId = pieceId; // ID de la pièce qui effectue le mouvement
      this.origin = origin; // Position de départ
      this.destination = destination; // Position d'arrivée

      // Options supplémentaires pour enrichir les informations sur le mouvement
      this.type = options.type || MoveType.NORMAL; 
      this.promotedTo = options.promotedTo || null; // Si c'est une promotion, type de la pièce promue
      this.idCapturedPiece = options.idCapturedPiece || null; // Référence à la pièce capturée, si applicable
      this.isCheck = options.isCheck || false; // Indique si le mouvement met le roi adverse en échec
      this.isCheckmate = options.isCheckmate || false; // Indique si le mouvement met le roi adverse en échec et mat
      this.isStalemate = options.isStalemate || false; // Indique si le mouvement met le roi adverse en pat
      this.isMaterialInsufficient = options.isMaterialInsufficient || false; // Indique que la partie ne peut pas être gagné
      this.timestamp = options.timestamp || Date.now(); // Horodatage du mouvement
  }

  // Met à jour la position d'origine
  setOrigin(origin) {
    this.origin = origin;
  }

  // Met à jour la position de destination
  setDestination(destination) {
    this.destination = destination;
  }

  // Met à jour l'identifiant de la pièce
  setPieceId(pieceId) {
    this.pieceId = pieceId;
  }

  // Méthodes pour simplifier les vérifications
  isCapture() {
      return (this.type === MoveType.CAPTURE || this.type === MoveType.PROMOTION_CAPTURE || MoveType.ENPASSANT) && this.idCapturedPiece !== null;
  }

  isPromotion() {
      return (this.type === MoveType.PROMOTION || this.type === MoveType.PROMOTION_CAPTURE) && this.promotedTo !== null;
  }

  isCapturePromotion() {
      return isCapture() && isPromotion() ;
  }

  isCastlingQueenMove() {
      return this.type === MoveType.CASTLING_Q;
  }

  isCastlingKingMove() {
      return this.type === MoveType.CASTLING_K;
  }

  isEnPassantMove() {
      return this.type === MoveType.ENPASSANT;
  }

  // Génère un résumé du mouvement sous forme de texte
  getMoveSummary() {
      return `Mouvement :
Piece ID: ${this.pieceId}
Origin: ${this.origin}
Destination: ${this.destination}
Type: ${MoveTypeToString[this.type]}
Grand Roque: ${this.isCastlingQueenMove() ? 'Oui' : 'Non'}
Petit Roque: ${this.isCastlingKingMove() ? 'Oui' : 'Non'}
En Passant: ${this.isEnPassantMove() ? 'Oui' : 'Non'}
Promotion: ${this.isPromotion() ? this.promotedTo : 'None'}
Capture: ${this.isCapture() ? 'Oui' : 'Non'}
Echec: ${this.isCheck ? 'Oui' : 'Non'}
Echec et mat: ${this.isCheckmate ? 'Oui' : 'Non'}
Pat: ${this.isStalemate ? 'Oui' : 'Non'}
Matériel Insuffisant: ${this.isMaterialInsufficient ? 'Oui' : 'Non'}
Timestamp: ${new Date(this.timestamp).toISOString()}`;
  }
}
