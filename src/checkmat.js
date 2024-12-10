import { Board } from './core/board.js'
import { Color } from './core/piece.js';
import { Ui } from './core/ui-engine.js';

(function($) {
    $.fn.checkmatBuilder = function(options) {
        const defaults = { };

        const settings = $.extend({}, defaults, options);

        let board = null; // Déclarez la variable board ici pour la rendre accessible

        // Générer le HTML de l'échiquier et les contrôles
        function generateBoardHtml() {
            return `<div class="row">
            <div class="d-flex justify-content-center align-items-center p-1">
                <div class="text-center" style="font-size: 16px;">
                    <span id="turn" class="badge bg-success text-light" 
                        style="width: 150px; display: inline-block; text-align: center; border-radius: 10px; padding: 5px 10px;">
                    </span>
                </div>
            </div>
            <div class="d-flex align-items-center justify-content-center flex-wrap" style="gap: 10px; font-size: 16px;">
                <span id="badgeTotalMoves" class="badge text-dark" 
                    style="width: 60px; display: inline-block; text-align: center; border-radius: 10px; padding: 5px 10px;background-color: rgba(13, 110, 253, 0.3);">
                    <i class="fas fa-chess-pawn sliding"></i>
                </span>
                <div id="badgeHalfMoves" class="badge-progress bg-light text-dark border"></div>
                <span id="badgeWhiteCastling" class="badge bg-secondary text-light" 
                    style="display: none; text-align: center; border-radius: 10px; padding: 5px 10px;">
                    <i class="crown-light fas fa-crown"></i><i class="crown-light fas fa-home"></i>
                </span>
                <span id="badgeBlackCastling" class="badge bg-secondary text-light" 
                    style="display: none; text-align: center; border-radius: 10px; padding: 5px 10px;">
                    <i class="crown-dark fas fa-crown"></i><i class="crown-dark fas fa-home"></i>
                </span>
                <span id="badgeCapturedByWhite" class="badge bg-primary text-light" 
                    style="display: none; text-align: center; border-radius: 10px; padding: 5px 10px;">
                    <div class="crown-light"><i class="fas fa-chess-pawn"></i></div>
                </span>
                <span id="badgeCapturedByBlack" class="badge bg-primary text-light" 
                    style="display: none; text-align: center; border-radius: 10px; padding: 5px 10px;">
                    <div class="crown-dark"><i class="fas fa-chess-pawn"></i></div>
                </span>
                <span id="badgeCheckWhiteStatus" class="badge bg-danger text-light" 
                    style="display: none; text-align: center; border-radius: 10px; padding: 5px 10px;">
                    <i class="crown-light fas fa-crown"></i>
                </span>
                <span id="badgeCheckmateWhiteStatus" class="badge bg-danger text-light" 
                    style="display: none; text-align: center; border-radius: 10px; padding: 5px 10px;">
                    <i class="crown-light fas fa-crown"></i><i class="crown-light fas fa-crown"></i>
                </span>
                <span id="badgeCheckBlackStatus" class="badge bg-danger text-light" 
                    style="display: none; text-align: center; border-radius: 10px; padding: 5px 10px;">
                    <i class="crown-dark fas fa-crown"></i>
                </span>
                <span id="badgeCheckmateBlackStatus" class="badge bg-danger text-light" 
                    style="display: none; text-align: center; border-radius: 10px; padding: 5px 10px;">
                    <i class="crown-dark fas fa-crown"></i><i class="crown-dark fas fa-crown"></i>
                </span>
                <span id="badgeDrawStatus" class="badge bg-danger text-light" 
                    style="display: none; text-align: center; border-radius: 10px; padding: 5px 10px;">
                    <i class="fas fa-crown text-light"></i> <i class="fas fa-crown text-dark"></i>
                </span>
                <span id="badgeCanRequestDraw" class="badge bg-warning text-light" 
                    style="display: none; text-align: center; border-radius: 10px; padding: 5px 10px;">
                    <i class="fas fa-handshake"></i>
                </span>
            </div>
            <div class="col-md-1 d-flex justify-content-end align-items-center">
                <div class="row">
                    <div class="col-4 m-0">
                        <i class="fas fa-trophy"></i>
                        <span id="evaluationValueN" style=" font-size: 8px;">0%</span>
                        <div id="evaluationBar">
                            <div id="blackBar"></div>
                            <div id="whiteBar"></div>
                        </div>
                        <span id="evaluationValueB" style=" font-size: 8px;">0%</span>
                    </div>
                    <div class="col-4 m-0">
                        <i class="fas fa-chess"></i>
                        <span  id="evaluationPieceValueN" style=" font-size: 8px;">0%</span>
                        <div id="evaluationBar">
                            <div id="blackPieceBar"></div>
                            <div id="whitePieceBar"></div>
                        </div>
                        <span id="evaluationPieceValueB" style=" font-size: 8px;">0%</span>
                    </div>
                    <div class="col-4 m-0 " >
                        <i class="fas fa-chess-board"></i>
                        <span  id="evaluationSquareValueN" style="font-size: 8px;">0%</span>
                        <div id="evaluationBar">
                            <div id="blackBarSquare"></div>
                            <div id="whiteBarSquare"></div>
                        </div>
                        <span  id="evaluationSquareValueB" style="font-size: 8px;">0%</span>
                    </div>
                </div>
            </div>
            <div class="col-md-6" >
                <div id="boardContainer"></div> <!-- Conteneur pour l'échiquier -->
                <div class="row my-3">
                    <div class="col text-center">
                        <button id="startGame" class="btn custom-btn btn-success btn-sm mx-1" title="Démarrer la partie">
                            <i class="fas fa-play-circle"></i>
                        </button>
                        <button id="resetGame" class="btn custom-btn btn-success btn-sm mx-1" title="Réinitialiser la partie">
                            <i class="fas fa-redo-alt"></i>
                        </button>
                        <button id="requestDrawGame" class="btn custom-btn btn-outline-success btn-sm mx-1" title="Demander le nulle">
                            <i class="fas fa-handshake"></i>
                        </button>
                        <button id="resetMove" class="btn custom-btn btn-outline-primary btn-sm mx-1" title="Revenir au premier coup">
                            <i class="fas fa-fast-backward"></i>
                        </button>
                        <button id="undoMove" class="btn custom-btn btn-outline-primary btn-sm mx-1" title="Annuler le dernier coup">
                            <i class="fas fa-step-backward"></i>
                        </button>
                        <button id="redoMove" class="btn custom-btn btn-outline-primary btn-sm mx-1" title="Rejouer le coup annulé">
                            <i class="fas fa-step-forward"></i>
                        </button>
                        <button id="lastMove" class="btn custom-btn btn-outline-primary btn-sm mx-1" title="Revenir au dernier coup">
                            <i class="fas fa-fast-forward"></i>
                        </button>
                        <button id="configureGame" class="btn custom-btn btn-secondary btn-sm mx-1" title="Configurer la partie">
                            <i class="fas fa-cogs"></i>
                        </button>
                        <button id="questionGame" class="btn custom-btn btn-secondary btn-sm mx-1" title="Si vous vous posez des questions !">
                            <i class="fas fa-question"></i>
                        </button>
                        <button id="turnBoard" class="btn custom-btn btn-outline-success btn-sm mx-1" title="Tourner l'échiquier">
                            <i class="fas fa-sync"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-md-5 pt-2">
                <div class="center" >
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <div style="display:flex; align-items: center;">
                            <div class="text-center pt-0" style="font-size: 20px;">♙</div>
                            <i class="fas fa-user-alt fa-sm"></i><small  id="nameUserWhite" class="px-2"></small>
                        </div>
                        <div id="capturedByWhite" style="font-size: 16px;"></div>
                        <span id="timeWhite" class="badge bg-info text-light" style="border-radius: 10px; padding: 5px 10px;"><i class="far fa-clock"></i> 00:00</span>
                    </div>
                    <div id="moveHistoryContainer" style="height: 400px; overflow-y: auto;">
                     <table id="moveHistoryTable" class="table table-striped bg-light border">
                        <thead>
                            <tr>
                                <th scope="col">N°</th>
                                <th scope="col">Blanc</th>
                                <th scope="col">Noir</th>
                                <th scope="col">Commentaire</th>
                                <th scope="col">Ouverture</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div style="display: flex; align-items: center;">
                            <div class="text-center pt-0" style="font-size: 20px;">♟</div>
                            <i class="fas fa-user-alt fa-sm"></i><small id="nameUserBlack" class="px-2"></small>
                        </div>
                        <div id="capturedByBlack" style="font-size: 16px;"></div>
                        <span id="timeBlack" class="badge bg-info text-light" style="border-radius: 10px; padding: 5px 10px;"><i class="far fa-clock"></i> 00:00</span>
                    </div>
                </div>
                <div class="row my-3">
                    <div class="col text-center">
                        <button id="loadGame" style="font-size: 12px;" class="btn btn-success btn-sm mx-1" title="Téléverser une partie">
                            <i class="fas fa-upload"></i>
                        </button>
                        <input type="file" id="fileInput" accept=".pgn,.fen" style="display: none;" />
                        <button id="downloadFENGame" style="font-size: 12px;" class="btn btn-primary btn-sm mx-1" title="Télécharger la partie">
                            <i class="fas fa-download"></i> FEN
                        </button>
                        <button id="downloadPGNGame" style="font-size: 12px;" class="btn btn-primary btn-sm mx-1" title="Télécharger la partie">
                            <i class="fas fa-download"></i> PGN
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        }

        // Initialisation de l'échiquier
        function initializeBoard($element) {

            $element.html(generateBoardHtml()); // Injecter le HTML dans l'élément

            updateProgressBadge('badgeHalfMoves', 0, 100, '&#189; <i class="px-1 fas fa-chess-pawn sliding"></i>');

            board = new Board((caseInfo) => {
                if (caseInfo.updatePgn)
                    updateMoveHistory(caseInfo.pgn);

                updateCapturedPieces();
                updateTurnDisplay(caseInfo);
                updateBadges(caseInfo);
                updateEvaluationBar(board,caseInfo.score, caseInfo.positionScore, caseInfo.pieceScore);
                Ui.updateButtonStates(board);
            });

            function updateEvaluationBar(board,score, positionScore, pieceScore) {
                console.log(score, positionScore, pieceScore);
            
                // Fonction utilitaire pour mettre à jour une barre et ses valeurs
                function updateBarAndValues(board, percentage, barWhiteId, barBlackId, valueWhiteId, valueBlackId) {

                    const percentageWhite = percentage * 100;
                    const percentageBlack = 100 - percentageWhite;
            
                    const whiteBar = document.getElementById(barWhiteId);
                    const blackBar = document.getElementById(barBlackId);
            
                    whiteBar.style.height = `${percentageWhite}%`;
                    blackBar.style.height = `${percentageBlack}%`;
            
                    const whiteValue = document.getElementById(valueWhiteId);
                    const blackValue = document.getElementById(valueBlackId);
            
                    whiteValue.innerHTML = `${Math.round(percentageWhite)}%`;
                    blackValue.innerHTML = `${Math.round(percentageBlack)}%`;

                    if (board.orientationBoard === Color.NOIR)
                    {
                        const whiteHeight = whiteBar.style.height;
                        const blackHeight = blackBar.style.height;
                        whiteBar.style.height = whiteHeight; // Inverse les hauteurs
                        blackBar.style.height = blackHeight;

                        const whiteText = whiteValue.innerHTML;
                        const blackText = blackValue.innerHTML;

                        whiteValue.innerHTML = blackText;
                        blackValue.innerHTML = whiteText;
                    }
                }
            
                // Mise à jour des barres et valeurs pour le score global
                updateBarAndValues(board,score, 'whiteBar', 'blackBar', 'evaluationValueB', 'evaluationValueN');
            
                // Mise à jour des barres et valeurs pour le score des pièces
                updateBarAndValues(board,pieceScore, 'whitePieceBar', 'blackPieceBar', 'evaluationPieceValueB', 'evaluationPieceValueN');
            
                // Mise à jour des barres et valeurs pour le score de position
                updateBarAndValues(board,positionScore, 'whiteBarSquare', 'blackBarSquare', 'evaluationSquareValueB', 'evaluationSquareValueN');
            }

            function updateProgressBadge(id,currentMove, totalMoves, prefix) {
                const progressBadge = document.getElementById(id);
                if (!progressBadge) {
                    console.error("L'élément 'progressBadge' est introuvable !");
                    return;
                }
                const percentage = (currentMove / totalMoves) * 100;
                // Met à jour la largeur du pseudo-élément (progression)
                progressBadge.style.setProperty('--progress-width', `${percentage}%`);
    
                // Met à jour le texte
                progressBadge.innerHTML = `${currentMove} ${prefix}`;
            }

            function updateMoveHistory(pgn, comments = "", opening = "") {
                const moveHistoryTableBody = document.querySelector('#moveHistoryTable tbody');
            
                // Réinitialiser la table
                moveHistoryTableBody.innerHTML = '';
            
                // Convertir le PGN en mouvements individuels
                const moves = pgn.split('\n').map(move => {
                    const [numero ,whiteMove, blackMove] = move.split(' ');
                    return {numero, whiteMove, blackMove, comments, opening };
                });
            
                // Ajouter les lignes
                moves.forEach(({ numero , whiteMove, blackMove, comments, opening }) => {
                    if (numero !== "" && whiteMove !== "")
                    {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${numero || ''}</td>
                            <td>${whiteMove || ''}</td>
                            <td>${blackMove || ''}</td>
                            <td>${comments}</td>
                            <td>${opening}</td>
                        `;

                          // Appliquer la classe pointer-cell aux colonnes 1 et 2
                        const cells = row.querySelectorAll('td');
                        if (cells[1]) cells[1].classList.add('pointer-cell'); // Colonne 1
                        if (cells[2]) cells[2].classList.add('pointer-cell'); // Colonne 2

                        moveHistoryTableBody.appendChild(row);
                    }
                });
            
                // Scroller automatiquement vers le bas de la table pour les nouveaux mouvements
                const moveHistoryContainer = document.getElementById('moveHistoryContainer');
                moveHistoryContainer.scrollTop = moveHistoryContainer.scrollHeight;
            }


            // Fonction utilitaire : Met à jour les pièces capturées
            function updateCapturedPieces() {
                const { capturedByWhite, capturedByBlack } = board.getCapturedPieces(true);

                const capturedByBlackContainer = document.getElementById('capturedByBlack');
                const capturedByWhiteContainer = document.getElementById('capturedByWhite');

                capturedByBlackContainer.innerHTML = formatCapturedPieces(capturedByBlack);
                capturedByWhiteContainer.innerHTML = formatCapturedPieces(capturedByWhite);
            }

            // Fonction utilitaire : Formatte les pièces capturées
            function formatCapturedPieces(pieces) {
                if (Array.isArray(pieces)) {
                    return `[${pieces.map(piece => piece.getUnicode()).join(' ')}]`;
                } else {
                    return Object.entries(pieces)
                        .map(([type, piecesOfType]) => {
                            const pieceUnicode = piecesOfType[0]?.getUnicode() || '';
                            const count = piecesOfType.length;
                            return count > 1
                                ? ` ${pieceUnicode} x <small>${count}</small> `
                                : ` ${pieceUnicode} `;
                        })
                        .join(' , ');
                }
            }

            // Fonction utilitaire : Met à jour l'affichage du tour
            function updateTurnDisplay(caseInfo) {
                const turnContainer = document.getElementById('turn');
                if (caseInfo.isCheckmate) {
                    turnContainer.innerHTML = `${board.currentTurnColor === Color.BLANC ? 'Les noirs ont gagné.' : 'Les blancs ont gagné.'}`;
                } else if (caseInfo.isDraw) {
                    turnContainer.innerHTML = `La partie est nulle.`;
                } else {
                    turnContainer.innerHTML = `${board.currentTurnColor === Color.BLANC ? 'Les blancs jouent.' : 'Les noirs jouent.'}`;
                }
            }

            // Fonction utilitaire : Met à jour les badges
            function updateBadges(caseInfo) {
                const badges = [
                    { id: 'badgeTotalMoves', value: `${caseInfo.fullMoveCount} <i class="fas fa-chess-pawn sliding"></i>` },
                    { id: 'badgeHalfMoves', value: caseInfo.halfMoveCount, max: 100, icon: '&#189; <i class="px-1 fas fa-chess-pawn sliding"></i>' },
                ];

                badges.forEach(({ id, value, max, icon }) => {
                    if (value !== undefined) {
                        updateProgressBadge(id, value, max || 0, icon || '');
                    }
                });

                toggleBadge('badgeDrawStatus', caseInfo.isDraw);
                toggleBadge('badgeCanRequestDraw', caseInfo.isCanRequestDraw);
                toggleBadge('badgeWhiteCastling', caseInfo.hasWhiteCastlingRights);
                toggleBadge('badgeBlackCastling', caseInfo.hasBlackCastlingRights);
                toggleCheckBadges(caseInfo);
            }

            // Fonction utilitaire : Active ou désactive un badge
            function toggleBadge(id, condition) {
                if (condition) {
                    $(`#${id}`).fadeIn(400);
                } else {
                    $(`#${id}`).fadeOut(400);
                }
            }

            // Fonction utilitaire : Gère les badges de mise en échec et d'échec et mat
            function toggleCheckBadges(caseInfo) {
                const isWhiteTurn = board.currentTurnColor === Color.BLANC;
                toggleBadge('badgeCheckWhiteStatus', !caseInfo.isCheckmate && caseInfo.isCheckWhite);
                toggleBadge('badgeCheckBlackStatus', !caseInfo.isCheckmate && caseInfo.isCheckBlack);
                toggleBadge('badgeCheckmateWhiteStatus', caseInfo.isCheckmate && isWhiteTurn);
                toggleBadge('badgeCheckmateBlackStatus', caseInfo.isCheckmate && !isWhiteTurn);
            }

            board.initBoard();
            
            //board.loadFEN('rnbq1bn1/pppppppp/8/3k4/2r5/3K4/PPPPPPPP/RNBQ1BNR w - - 0 1');
            //board.loadFEN('rnbq1bn1/pppppppp/8/3k4/2r5/1B1K4/PPPPPPPP/RN1Q1BNR w - - 0 1');
            //board.loadFEN('4r1k1/p1p2pp1/1q1p3p/1P3P2/1P6/2n1Q3/PB4PP/4R1K1 w - - 0 1');
            
            board.updateBoardDisplay();

            $('#nameUserWhite').html(board.playerB);
            $('#nameUserBlack').html(board.playerN);

            return board;
        }

        // Fonction pour gérer la sélection des cellules
        function handleCellSelection(board) {
            const table = document.getElementById('moveHistoryTable');

            // Ajout d'un événement 'click' sur les cellules
            table.addEventListener('click', async (event) => {
                const target = event.target;
        
                // Vérifie si l'élément cliqué est une cellule de tableau
                if (target.tagName === 'TD') {
                    // Identifier l'index de la colonne
                    const columnIndex = target.cellIndex; // Index basé sur la colonne
                    
                    if (columnIndex === 1 || columnIndex === 2 && target.textContent !== "" ) { // Colonne 2 ou 3

                        const table = document.getElementById('moveHistoryTable'); // Le tableau contenant les cellules
                        const rows = Array.from(table.querySelectorAll('tbody tr')); // Toutes les lignes du tableau
                        const row = target.parentElement; // La ligne de la cellule
                        const rowIndex = rows.indexOf(row);

                        const selectedCellIndex = rowIndex * 2 + (columnIndex - 1); // -1 car index navigable commence à 1
                        const movement = await board.setMoveByIndexTable(selectedCellIndex+1);
                        board.currentCellIndex = selectedCellIndex+1;

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
                            }
                        }

                        // Supprime la surbrillance des autres cellules
                        const selectedCells = table.querySelectorAll('.selected-cell');
                        selectedCells.forEach(cell => cell.classList.remove('selected-cell'));
        
                        // Applique la classe de surbrillance à la cellule cliquée
                        target.classList.add('selected-cell');
                    }
                }
            });
        }

        return this.each(function() {
            const board = initializeBoard($(this));
            handleCellSelection(board);
        });
    };

    $.fn.checkmatBuilder.version = '0.0.2'; // Version actuelle de la bibliothèque
    $.fn.checkmatBuilder.title = 'checkmat.js'; // Titre de la bibliothèque
    $.fn.checkmatBuilder.description = 'Bibliothèque interactive pour gérer et afficher un échiquier en utilisant jQuery avec des fonctionnalités intégrées comme les mouvements, les badges de progression, et les pièces capturées.'; // Description

})(jQuery);