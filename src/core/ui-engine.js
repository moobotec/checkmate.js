import { PieceType, Color, UnicodePieces, PieceTypeToString } from './piece.js';
import { Utils } from './utils.js';

// Module Ui
export const Ui = {

    highlightPossibleMoves(moves) {
        const cells = document.querySelectorAll('#boardContainer table td'); // Toutes les cellules avec `data-position`
    
        moves.forEach(move => {
            const targetCell = Array.from(cells).find(cell => parseInt(cell.dataset.position, 10) === move);
            if (targetCell) {
                targetCell.classList.add('highlight-circle'); // Ajout d'une classe CSS pour le surlignage
            } else {
                console.warn(`Cellule introuvable pour la position ${move}.`);
            }
        });
    },
    _clearHighlights(selector) {
        const highlightedCells = document.querySelectorAll(selector);
        highlightedCells.forEach(cell => cell.classList.remove(selector.replace('.', '')));
    },
    clearHighlightedMoves() {
        this._clearHighlights('.highlight-circle');
    },
    clearKingInCheckHighlight() {
        this._clearHighlights('.king-in-check');
    },
    clearSelectedSquareHighlight() {
        this._clearHighlights('.highlight-selected');
    },
    highlightKingInCheck(position) {
        const cells = document.querySelectorAll('#boardContainer table td'); // Toutes les cellules avec `data-position`
    
        const targetCell = Array.from(cells).find(cell => parseInt(cell.dataset.position, 10) === position);
        if (targetCell) {
            targetCell.classList.add('king-in-check'); // Ajout d'une classe CSS pour le surlignage
        } else {
            console.warn(`Cellule introuvable pour la position ${position}.`);
        }
    },
    highlightSelectedSquare(position) {
        const cells = document.querySelectorAll('#boardContainer table td'); // Toutes les cellules avec `data-position`
    
        const targetCell = Array.from(cells).find(cell => parseInt(cell.dataset.position, 10) === position);
        if (targetCell) {
            targetCell.classList.add('highlight-selected'); // Ajout d'une classe CSS pour le surlignage
        } else {
            console.warn(`Cellule introuvable pour la position ${position}.`);
        }
    },
    updateBoardDisplay(board) {
        const boardContainer = document.getElementById('boardContainer');
        if (!boardContainer) {
            console.error("Erreur : élément 'boardContainer' introuvable.");
            return;
        }
    
        const fragment = document.createDocumentFragment();
        fragment.appendChild(this._renderBoard(board));
        boardContainer.replaceChildren(fragment);
    },
    showPromotionMenuAsync() {
        return new Promise((resolve) => {
            // Création de l'arrière-plan bloquant
            const backdrop = document.createElement('div');
            backdrop.style.position = 'fixed';
            backdrop.style.top = '0';
            backdrop.style.left = '0';
            backdrop.style.width = '100%';
            backdrop.style.height = '100%';
            backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Arrière-plan semi-transparent
            backdrop.style.zIndex = '999'; // Derrière la modal
            document.body.appendChild(backdrop);

            // Création de la modal
            const modal = document.createElement('div');
            modal.classList.add('promotion-modal');
            modal.style.position = 'fixed';
            modal.style.top = '50%';
            modal.style.left = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.zIndex = '1000'; // Devant le backdrop
            modal.style.background = '#fff';
            modal.style.padding = '20px';
            modal.style.border = '1px solid #ccc';
            modal.style.borderRadius = '8px';

            // Titre de la modal
            const title = document.createElement('p');
            title.textContent = "Choisissez une pièce pour la promotion";
            title.style.fontSize = '18px';
            title.style.textAlign = 'center';
            title.style.marginBottom = '15px';
            modal.appendChild(title);

            // Liste des options de promotion
            const promotionOptions = [PieceType.REINE, PieceType.TOUR, PieceType.FOU, PieceType.CHEVAL];
            promotionOptions.forEach((type) => {
                const button = document.createElement('button');
                const color = this.currentTurnColor === Color.BLANC ? 'white' : 'black';
                button.innerHTML = UnicodePieces[color][PieceTypeToString[type]];
                button.style.fontSize = '24px';
                button.style.margin = '5px';
                button.style.padding = '10px';
                button.style.cursor = 'pointer';

                button.addEventListener('click', () => {
                    // Supprime la modal et le backdrop après sélection
                    document.body.removeChild(modal);
                    document.body.removeChild(backdrop);

                    // Résout la promesse avec le type sélectionné
                    resolve(type);
                });

                modal.appendChild(button);
            });

            // Ajouter la modal au document
            document.body.appendChild(modal);
        });
    },
    initializeBoardEventListeners(board) {
        const boardContainer = document.getElementById('boardContainer');
    
        if (!boardContainer) {
            console.error("Le conteneur 'boardContainer' est introuvable.");
            return;
        }
    
        // Gestionnaire pour les clics
        boardContainer.addEventListener('click', async (event) => {

            const cell = event.target.closest('td'); // Récupérer la cellule cliquée
            if (!cell || !cell.dataset.position) return; // Ignorer si ce n'est pas une cellule valide
    
            const position = parseInt(cell.dataset.position, 10); // Récupérer l'attribut `data-position`
            const movement = await board.handleSquareClick(position); // Appel logique à votre gestionnaire de clics
            if (movement) {
                if (board.onMove) {
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
                        isCheckWhite : ( board.currentTurnColor == Color.BLANC ) ? movement.isCheck : false, 
                        isCheckBlack : ( board.currentTurnColor == Color.NOIR ) ? movement.isCheck : false, 
                        isCheckmate : movement.isCheckmate,
                        score : movement.score,
                        positionScore : movement.positionScore,
                        pieceScore : movement.pieceScore
                    };
                    board.onMove(caseInfo); // Exécuter la callback avec les infos de la case

                    Ui.navigateHistoryTable(board,board.getTotalMovesCount());
                }

                board.redoStack = [];

                Ui.updateButtonStates(board);
            }
        });
    
        // Gestionnaire pour le survol
        boardContainer.addEventListener('mouseover', (event) => {
            const cell = event.target.closest('td'); // Récupérer la cellule survolée
            if (!cell || !cell.dataset.position) return; // Ignorer si ce n'est pas une cellule valide
    
            cell.style.boxShadow = 'inset 0 0 10px 3px rgba(0, 0, 255, 0.5)'; // Surbrillance temporaire
        });
    
        // Gestionnaire pour la sortie de survol
        boardContainer.addEventListener('mouseout', (event) => {
            const cell = event.target.closest('td'); // Récupérer la cellule quittée
            if (!cell || !cell.dataset.position) return; // Ignorer si ce n'est pas une cellule valide
    
            cell.style.boxShadow = 'none'; // Supprimer la surbrillance
        });

        // Étape 2 : Déplacer la pièce (mousemove)
        document.addEventListener("mousemove", async (event) => {
            if (!board.draggedPiece) return;

            if (board.ghostPosition != null)
            {
                // Créer une copie temporaire (ghostPiece)
                board.ghostPiece = board.draggedPiece.cloneNode(true);
                board.ghostPiece.style.position = "fixed";
                board.ghostPiece.style.pointerEvents = "none";
                board.ghostPiece.style.zIndex = "1000"; // Toujours au-dessus
                board.ghostPiece.style.width = `${board.draggedPiece.offsetWidth}px`;
                board.ghostPiece.style.height = `${board.draggedPiece.offsetHeight}px`;
                board.ghostPiece.style.fontSize = '24px';
                document.body.appendChild(board.ghostPiece);

                // Masquer la pièce d'origine
                board.draggedPiece.style.opacity = "0";
        
                // Suivre la souris avec la pièce temporaire
                board.ghostPiece.style.left = `${event.clientX - board.ghostPiece.offsetWidth / 2}px`;
                board.ghostPiece.style.top = `${event.clientY - board.ghostPiece.offsetHeight / 2}px`;

                board.ghostPosition = null;
            }

            // Mettre à jour la position de la copie temporaire
            board.ghostPiece.style.left = `${event.clientX - board.ghostPiece.offsetWidth / 2}px`;
            board.ghostPiece.style.top = `${event.clientY - board.ghostPiece.offsetHeight / 2}px`;
        });
        // Étape 1 : Attraper la pièce (mousedown)
        boardContainer.addEventListener("mousedown", async (event) => {

            const cell = event.target.closest('td'); // Récupérer la cellule cliquée
            if (!cell || !cell.dataset.position) return; // Ignorer si ce n'est pas une cellule valide
    
            board.ghostPosition = parseInt(cell.dataset.position, 10); // Récupérer l'attribut `data-position`
          
            const target = event.target.closest(".piece");
            if (!target) return;

            if ( board.checkColorPieceByIndex(board.ghostPosition) )
            {
                board.draggedPiece = target;
                await board.handleSquareClick(board.ghostPosition,true); // Appel logique à votre gestionnaire de clics
            }
    
        });

        // Étape 3 : Relâcher la pièce (mouseup)
        document.addEventListener("mouseup", async (event) => {

            if (!board.draggedPiece) return;
          
            // Obtenir la case cible sous la souris
            const targetCell = document.elementFromPoint(event.clientX, event.clientY)?.closest("td");

            if (targetCell && targetCell.dataset.position) {
                // Déplacer la pièce vers la nouvelle case
                const targetPosition = parseInt(targetCell.dataset.position, 10);

                const movement = await board.handleSquareClick(targetPosition); // Appel logique à votre gestionnaire de clics
                if (movement) {
                    if (board.onMove) {
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
                            isCheckWhite : ( board.currentTurnColor == Color.BLANC ) ? movement.isCheck : false, 
                            isCheckBlack : ( board.currentTurnColor == Color.NOIR ) ? movement.isCheck : false, 
                            isCheckmate : movement.isCheckmate,
                            score : movement.score,
                            positionScore : movement.positionScore,
                            pieceScore : movement.pieceScore
                        };
                        board.onMove(caseInfo); // Exécuter la callback avec les infos de la case

                        Ui.navigateHistoryTable(board,board.getTotalMovesCount());
                    }

                    board.redoStack = [];

                    Ui.updateButtonStates(board);
                }
            }

            // Nettoyer : supprimer la copie temporaire et restaurer la pièce d'origine
            if (board.ghostPiece != null )
            {
                board.ghostPiece.remove();
                board.ghostPiece = null;
            }
            board.draggedPiece.style.opacity = "1";
            board.draggedPiece = null;
        });

    },
    initializeBoutonBoardEventListeners(board) {

        window.turnBoardHandler = function () {
            board.orientationBoard = (board.orientationBoard === Color.BLANC) ? Color.NOIR : Color.BLANC;
            board.updateBoardDisplay();

            Ui.inverseBarAndValues(board,'whiteBar', 'blackBar', 'evaluationValueB', 'evaluationValueN');
            
            // Mise à jour des barres et valeurs pour le score des pièces
            Ui.inverseBarAndValues(board,'whitePieceBar', 'blackPieceBar', 'evaluationPieceValueB', 'evaluationPieceValueN');
        
            // Mise à jour des barres et valeurs pour le score de position
            Ui.inverseBarAndValues(board,'whiteBarSquare', 'blackBarSquare', 'evaluationSquareValueB', 'evaluationSquareValueN');

        };

        window.loadGameHandler = function () {
            const fileInput = document.getElementById('fileInput');
            fileInput.click(); // Ouvre la boîte de dialogue pour choisir un fichier
        }

        window.downloadPGNGameHandler = function () {
            board.downloadPGN();
        };

        window.downloadFENGameHandler = function () {
            board.downloadFEN();
        };
        
        window.resetGameHandler = function () {

            board.initBoard();

            board.event = 'Event checkmate.js';
            board.site = 'checkmate.js';
            board.date = `${new Date().toISOString().slice(0, 10)}`;
            board.round = "-";
            board.playerB = Utils.generateRandomNames(1, 10)[0];
            board.playerN = Utils.generateRandomNames(1, 10)[0];

            board.updateBoardDisplay();

            $('#nameUserWhite').html(board.playerB);
            $('#nameUserBlack').html(board.playerN);
        };

        window.resetMoveHandler = function ()  {
            const movement = board.resetToInitialPosition();

            if (movement.isCheck) {
                const king = board.getKingByColor(board.currentTurnColor);
                Ui.highlightKingInCheck(king.position);
            }

            if (movement) {
                if (board.onMove) {
                    const caseInfo = {
                        fen: movement.fen,
                        pgn: movement.pgn,
                        updatePgn: false,
                        fullMoveCount : movement.fullMoveCount, 
                        halfMoveCount  : movement.halfMoveCount, 
                        hasWhiteCastlingRights: movement.hasWhiteCastlingRights, 
                        hasBlackCastlingRights: movement.hasBlackCastlingRights, 
                        priseEnPassant : movement.priseEnPassant, 
                        isCanRequestDraw : movement.isCanRequestDraw, 
                        isDraw : movement.isDraw, 
                        isCheckWhite : ( board.currentTurnColor == Color.BLANC ) ? movement.isCheck : false, 
                        isCheckBlack : ( board.currentTurnColor == Color.NOIR ) ? movement.isCheck : false, 
                        isCheckmate : movement.isCheckmate,
                        score : movement.score,
                        positionScore : movement.positionScore,
                        pieceScore : movement.pieceScore
                    };
                    board.onMove(caseInfo); // Exécuter la callback avec les infos de la case

                    Ui.navigateHistoryTable(board,0);
                } 
            }

        };

        window.lastMoveHandler = async function ()  {
            const movement = await board.restoreLastPosition();

            if (movement.isCheck) {
                const king = board.getKingByColor(board.currentTurnColor);
                Ui.highlightKingInCheck(king.position);
            }

            if (movement) {
                if (board.onMove) {
                    const caseInfo = {
                        fen: movement.fen,
                        pgn: movement.pgn,
                        updatePgn: false,
                        fullMoveCount : movement.fullMoveCount, 
                        halfMoveCount  : movement.halfMoveCount, 
                        hasWhiteCastlingRights: movement.hasWhiteCastlingRights, 
                        hasBlackCastlingRights: movement.hasBlackCastlingRights, 
                        priseEnPassant : movement.priseEnPassant, 
                        isCanRequestDraw : movement.isCanRequestDraw, 
                        isDraw : movement.isDraw, 
                        isCheckWhite : ( board.currentTurnColor == Color.BLANC ) ? movement.isCheck : false, 
                        isCheckBlack : ( board.currentTurnColor == Color.NOIR ) ? movement.isCheck : false, 
                        isCheckmate : movement.isCheckmate,
                        score : movement.score,
                        positionScore : movement.positionScore,
                        pieceScore : movement.pieceScore
                    };
                    board.onMove(caseInfo); // Exécuter la callback avec les infos de la case

                    Ui.navigateHistoryTable(board,board.getTotalMovesCount());
                }
            }

        };
        
        window.redoMoveHandler = async function ()  {
            const movement = await board.redoLastMove();

            if (movement.isCheck) {
                const king = board.getKingByColor(board.currentTurnColor);
                Ui.highlightKingInCheck(king.position);
            }

            if (movement) {
                if (board.onMove) {
                    const caseInfo = {
                        fen: movement.fen,
                        pgn: movement.pgn,
                        updatePgn: false,
                        fullMoveCount : movement.fullMoveCount, 
                        halfMoveCount  : movement.halfMoveCount, 
                        hasWhiteCastlingRights: movement.hasWhiteCastlingRights, 
                        hasBlackCastlingRights: movement.hasBlackCastlingRights, 
                        priseEnPassant : movement.priseEnPassant, 
                        isCanRequestDraw : movement.isCanRequestDraw, 
                        isDraw : movement.isDraw, 
                        isCheckWhite : ( board.currentTurnColor == Color.BLANC ) ? movement.isCheck : false, 
                        isCheckBlack : ( board.currentTurnColor == Color.NOIR ) ? movement.isCheck : false, 
                        isCheckmate : movement.isCheckmate,
                        score : movement.score,
                        positionScore : movement.positionScore,
                        pieceScore : movement.pieceScore
                    };
                    board.onMove(caseInfo); // Exécuter la callback avec les infos de la case

                    Ui.navigateHistoryTable(board,board.currentCellIndex + 1);
                }
            }
        };

        window.undoMoveHandler = function () {
            const movement = board.undoLastMove();

            if (movement.isCheck) {
                const king = board.getKingByColor(board.currentTurnColor);
                Ui.highlightKingInCheck(king.position);
            }

            if (movement) {
                if (board.onMove) {
                    const caseInfo = {
                        fen: movement.fen,
                        pgn: movement.pgn,
                        updatePgn: false,
                        fullMoveCount : movement.fullMoveCount, 
                        halfMoveCount  : movement.halfMoveCount, 
                        hasWhiteCastlingRights: movement.hasWhiteCastlingRights, 
                        hasBlackCastlingRights: movement.hasBlackCastlingRights, 
                        priseEnPassant : movement.priseEnPassant, 
                        isCanRequestDraw : movement.isCanRequestDraw, 
                        isDraw : movement.isDraw, 
                        isCheckWhite : ( board.currentTurnColor == Color.BLANC ) ? movement.isCheck : false, 
                        isCheckBlack : ( board.currentTurnColor == Color.NOIR ) ? movement.isCheck : false, 
                        isCheckmate : movement.isCheckmate,
                        score : movement.score,
                        positionScore : movement.positionScore,
                        pieceScore : movement.pieceScore
                    };
                    board.onMove(caseInfo); // Exécuter la callback avec les infos de la case

                    Ui.navigateHistoryTable(board,board.currentCellIndex - 1);
                }
            }
        };

        // Liste des IDs des boutons
        const buttonIds = [
            "startGame",
            "resetGame",
            "requestDrawGame",
            "resetMove",
            "undoMove",
            "redoMove",
            "lastMove",
            "configureGame",
            "questionGame",
            "turnBoard",
            "loadGame",
            "downloadFENGame",
            "downloadPGNGame"
        ];

        // Création des fonctions et ajout des gestionnaires d'événements
        buttonIds.forEach(buttonId => {
            // Créer une fonction pour chaque bouton
            if (typeof window[buttonId + "Handler"] !== "function") {
                // Créer une fonction si elle n'existe pas
                window[buttonId + "Handler"] = function () {
                    console.log(`Function for button ${buttonId}: Not implemented`);
                };
            }

            // Ajouter un gestionnaire d'événement si le bouton existe dans le DOM
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener("click", window[buttonId + "Handler"]);
            } else {
                console.warn(`Button with ID ${buttonId} not found in the DOM.`);
            }
        });

        document.getElementById('fileInput').addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                try {
                    await board.loadFile(file, board); // Charger le fichier et appliquer les données à l'échiquier
                } catch (error) {
                    console.error("Erreur lors du chargement du fichier :", error.message);
                }
            }
        });

    },
    _renderBoard(board) {
    
        const table = document.createElement('table');
        table.classList.add('table', 'chess-board');
        table.style.width = '100%';
        table.style.maxWidth = '500px';
        table.style.margin = '20px auto';
    
        const isWhiteBottom = board.orientationBoard === Color.BLANC;
    
        if (board.indicatorBoard === 'right')
        {
          // Ajout des colonnes en haut
          const topRow = document.createElement('tr');
          const emptyCornerTop = document.createElement('td');
          emptyCornerTop.style.backgroundColor = '#fff'; // Coin vide
          emptyCornerTop.style.border = 'none';
          topRow.appendChild(emptyCornerTop);
    
          for (let col = 0; col < 8; col++) {
              const colLabel = document.createElement('td');
              colLabel.style.textAlign = 'center';
              colLabel.style.fontWeight = 'bold';
              colLabel.style.fontSize = '16px';
              colLabel.style.backgroundColor = '#fff';
              colLabel.style.border = 'none'; // Pas de bordure
              colLabel.textContent = String.fromCharCode(97 + (isWhiteBottom ? col : 7 - col)); // a-h ou h-a
              topRow.appendChild(colLabel);
          }
          const emptyCornerTop2 = document.createElement('td'); // Coin vide droit
          emptyCornerTop2.style.backgroundColor = '#fff';
          emptyCornerTop2.style.border = 'none';
          topRow.appendChild(emptyCornerTop2);
    
          table.appendChild(topRow);
        }
    
        // Ajouter les rangées avec numéros sur le côté
        for (let row = 0; row < 8; row++) {
            const actualRow = isWhiteBottom ? 7 - row : row; // Inverser les rangées si nécessaire
            const tr = document.createElement('tr');
    
            // Ajouter le numéro de la ligne (gauche)
            const rowLabelLeft = document.createElement('td');
            rowLabelLeft.style.backgroundColor = '#fff';
            rowLabelLeft.style.fontSize = '16px';
            rowLabelLeft.style.border = 'none'; // Pas de bordure
    
            // Ajout d'un div pour gérer le style de marge
            const leftDiv = document.createElement('div');
            leftDiv.style.textAlign = 'right'; // Alignement à droite
            leftDiv.style.fontWeight = 'bold';
            leftDiv.style.border = 'none'; // Pas de bordure
            leftDiv.textContent = (board.indicatorBoard === 'right') ? isWhiteBottom ? 8 - row : row + 1 : ''; // 8, 7, ...
            rowLabelLeft.appendChild(leftDiv);
            tr.appendChild(rowLabelLeft);
    
            // Ajouter les cases de l'échiquier
            for (let col = 0; col < 8; col++) {
                const actualCol = isWhiteBottom ? col : 7 - col; // Inverser les colonnes si nécessaire
                const td = document.createElement('td');
                const isWhiteSquare = (actualRow + actualCol) % 2 === 1;
                const index = actualRow * 8 + actualCol; 

                td.style.width = '50px';
                td.style.height = '50px';
                td.style.textAlign = 'center';
                td.style.verticalAlign = 'middle';
                td.style.cursor = 'pointer';
                td.dataset.position = index; // Ajout d'un identifiant unique pour chaque case
                td.style.backgroundColor = isWhiteSquare ? '#eee' : '#777';
                
                const piece = board.getPieceAt(index);
                if (!board.isNumberBoard)
                {
                  //<div class="piece" data-position="0" style="top: 0px; left: 0px;"></div>
                  const container = document.createElement('div');
                  container.classList.add('piece');
                  container.style.top = '0px';
                  container.style.left = '0px';

                  const pieceElement = document.createElement('div');
                  pieceElement.innerHTML = piece ? piece.getUnicode() : '&nbsp;';
                  container.appendChild(pieceElement);

                  td.appendChild(container);
                }
                else
                {
                  // Contenu principal : pièce et numéro de case
                  const container = document.createElement('div');
                  container.style.position = 'relative';
                  container.style.width = '100%';
                  container.style.height = '100%';
                  container.style.display = 'flex';
                  container.style.flexDirection = 'column';
                  container.style.justifyContent = 'center';
                  container.style.alignItems = 'center';
    
                  // Ajouter la pièce (ou laisser vide si aucune pièce n'est présente)
                  const pieceElement = document.createElement('div');
                  pieceElement.innerHTML = piece ? piece.getUnicode() : '&nbsp;';
                  pieceElement.style.fontSize = '24px'; // Taille normale pour la pièce
                  container.appendChild(pieceElement);
    
                  // Ajouter le numéro de la case en petit
                  const indexElement = document.createElement('span');
                  indexElement.textContent = index; // Affiche l'index de la case
                  indexElement.style.fontSize = '10px'; // Très petit texte
                  indexElement.style.color = 'rgba(0, 0, 0, 0.6)'; // Couleur discrète
                  container.appendChild(indexElement);
                  td.appendChild(container);
                }
              tr.appendChild(td);
            }
    
            // Ajouter le numéro de la ligne (droite)
            const rowLabelRight = document.createElement('td');
            rowLabelRight.style.backgroundColor = '#fff';
            rowLabelRight.style.fontSize = '16px';
            rowLabelRight.style.border = 'none'; // Pas de bordure
    
            // Ajout d'un div pour gérer le style de marge
            const rightDiv = document.createElement('div');
            rightDiv.style.textAlign = 'left'; // Alignement à gauche
            rightDiv.style.fontWeight = 'bold';
            rightDiv.textContent = (board.indicatorBoard === 'left') ?  isWhiteBottom ? 8 - row : row + 1 : ''; // 8, 7, ...
            rightDiv.style.border = 'none'; // Pas de bordure
            rowLabelRight.appendChild(rightDiv);
            tr.appendChild(rowLabelRight);
    
            table.appendChild(tr);
        }
    
        if (board.indicatorBoard === 'left')
        {
          // Ajout des colonnes en bas
          const bottomRow = document.createElement('tr');
          const emptyCornerBottom = document.createElement('td');
          emptyCornerBottom.style.backgroundColor = '#fff'; // Coin vide gauche
          emptyCornerBottom.style.border = 'none';
          bottomRow.appendChild(emptyCornerBottom);
    
          for (let col = 0; col < 8; col++) {
              const colLabel = document.createElement('td');
              colLabel.style.textAlign = 'center';
              colLabel.style.fontWeight = 'bold';
              colLabel.style.fontSize = '16px';
              colLabel.style.backgroundColor = '#fff';
              colLabel.style.border = 'none'; // Pas de bordure
              colLabel.textContent = String.fromCharCode(97 + (isWhiteBottom ? col : 7 - col));
              bottomRow.appendChild(colLabel);
          }
          const emptyCornerBottom2 = document.createElement('td'); // Coin vide droit
          emptyCornerBottom2.style.backgroundColor = '#fff';
          emptyCornerBottom2.style.border = 'none';
          bottomRow.appendChild(emptyCornerBottom2);
    
          table.appendChild(bottomRow);
        }

        return table;
    },

    scrollToIndex(board) {
        const container = document.getElementById('moveHistoryContainer'); // Le conteneur avec scroll
        const table =  document.getElementById('moveHistoryTable');
        const rows = table.querySelectorAll('tbody tr'); // Toutes les lignes du tableau
    
        const rowIndex = Math.floor((board.currentCellIndex - 1) / 2); // Ligne correspondante
        const targetRow = rows[rowIndex]; // Ligne sélectionnée
    
        // Calculer la position pour scroller
        const rowTop = targetRow.offsetTop; // Distance entre la ligne et le haut du conteneur
        const rowHeight = targetRow.offsetHeight; // Hauteur de la ligne
        const containerHeight = container.clientHeight; // Hauteur visible du conteneur
    
        // Centrer la ligne dans le conteneur
        const scrollPosition = rowTop - (containerHeight / 2) + (rowHeight / 2);
    
        // Appliquer le défilement
        container.scrollTo({
            top: scrollPosition,
            behavior: 'smooth' // Défilement fluide
        });
    },
    navigateHistoryTable(board, newIndex) {    
        // Limiter l'index entre 0 et 2 * nombre de lignes - 1
        const totalCells = board.pgnNotation.length * 2; // Chaque ligne a 2 cellules navigables
        if (newIndex < 0 || newIndex > totalCells) {
            console.warn('Navigation hors des limites');
            return;
        }
    
        // Mettre à jour l'index courant
        board.currentCellIndex = newIndex;
    
        // Récupérer toutes les lignes du tableau
        const table = document.getElementById('moveHistoryTable');
        const rows = table.querySelectorAll('tbody tr');
    
        // Si newIndex est 0, retirer toutes les surbrillances
        if (newIndex === 0) {
            rows.forEach(row => {
                row.cells[1].classList.remove('selected-cell'); // Colonne 1
                row.cells[2].classList.remove('selected-cell'); // Colonne 2
            });

            // Scroller vers l'index sélectionné
            this.scrollToIndex(board);

            return; // Rien d'autre à faire
        }
    
        // Calculer la ligne et la colonne à partir de l'index
        const rowIndex = Math.floor((newIndex - 1) / 2); // Ligne correspondante
        const columnIndex = (newIndex - 1) % 2 + 1; // Colonne 1 (Coup des Blancs) ou 2 (Coup des Noirs)
    
        // Récupérer la cellule correspondante
        const targetRow = rows[rowIndex];
        const targetCell = targetRow.cells[columnIndex];
    
        if (!targetCell) {
            console.warn('Cellule cible introuvable');
            return;
        }
    
        // Supprimer la surbrillance de toutes les cellules navigables
        rows.forEach(row => {
            row.cells[1].classList.remove('selected-cell'); // Colonne 1
            row.cells[2].classList.remove('selected-cell'); // Colonne 2
        });
    
        // Ajouter la surbrillance à la cellule correspondante
        targetCell.classList.add('selected-cell');
    
        // Scroller vers l'index sélectionné
        this.scrollToIndex(board);
    },
    updateButtonStates(board) {
        // Sélectionner les boutons
        const redoMoveButton = document.getElementById("redoMove");
        const undoMoveButton = document.getElementById("undoMove");
        const resetMoveButton = document.getElementById("resetMove");
        const lastMoveButton = document.getElementById("lastMove");

        // Activer ou désactiver les boutons en fonction de la taille des piles
        redoMoveButton.disabled = board.redoStack.length === 0; // Désactiver si redoStack est vide
        undoMoveButton.disabled = board.movesHistory.length === 0; // Désactiver si movesHistory est vide
        resetMoveButton.disabled = board.movesHistory.length === 0; // Désactiver si aucun historique
        lastMoveButton.disabled = board.redoStack.length === 0; // Désactiver si aucun historique
    }, 
    inverseBarAndValues(board,barWhiteId, barBlackId, valueWhiteId, valueBlackId) {
        const whiteBar = document.getElementById(barWhiteId);
        const blackBar = document.getElementById(barBlackId);

        const whiteValue = document.getElementById(valueWhiteId);
        const blackValue = document.getElementById(valueBlackId);

        const whiteHeight = whiteBar.style.height;
        const blackHeight = blackBar.style.height;
        whiteBar.style.height = blackHeight; // Inverse les hauteurs
        blackBar.style.height = whiteHeight;
       
        const whiteText = whiteValue.innerHTML;
        const blackText = blackValue.innerHTML;

        whiteValue.innerHTML = blackText;
        blackValue.innerHTML = whiteText;

        if (board.orientationBoard === Color.BLANC)
        {
            whiteBar.style.backgroundColor = "white";
            blackBar.style.backgroundColor = "black";
        }
        else{
            whiteBar.style.backgroundColor = "black";
            blackBar.style.backgroundColor = "white";
        }
    }
};