import { Board } from './core/Board.js'
import { Color } from './core/piece.js';

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
            <div class="col-md-6">
                <div id="boardContainer"></div>
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
            <div class="col-md-6 pt-2">
                <div class="center" >
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <div style="display:flex; align-items: center;">
                            <div class="text-center pt-0" style="font-size: 20px;">♙</div>
                            <i class="fas fa-user-alt fa-sm"></i><small  id="nameUserWhite" class="px-2"></small>
                        </div>
                        <div id="capturedByWhite" style="font-size: 20px;"></div>
                        <span id="timeWhite" class="badge bg-info text-light" style="border-radius: 10px; padding: 5px 10px;"><i class="far fa-clock"></i> 00:00</span>
                    </div>
                    <textarea id="moveHistory" readonly rows="17" class="bg-light border-2"></textarea>
                    <div class="d-flex justify-content-between align-items-center">
                        <div style="display: flex; align-items: center;">
                            <div class="text-center pt-0" style="font-size: 20px;">♟</div>
                            <i class="fas fa-user-alt fa-sm"></i><small id="nameUserBlack" class="px-2"></small>
                        </div>
                        <div id="capturedByBlack" style="font-size: 20px;"></div>
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
        </div>
            `;
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

        function updateButtonStates(redoStack, movesHistory) {
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
        }

        // Initialisation de l'échiquier
        function initializeBoard($element) {

            $element.html(generateBoardHtml()); // Injecter le HTML dans l'élément

            updateProgressBadge('badgeHalfMoves',0, 100,' &#189; <i class="px-1 fas fa-chess-pawn sliding"></i>');

            board = new Board((caseInfo) => {
                document.getElementById('moveHistory').innerHTML = `${caseInfo.pgn}`;
                document.getElementById('moveHistory').scrollTop = document.getElementById('moveHistory').scrollHeight; // Scroll automatique
    
                const { capturedByWhite, capturedByBlack } = board.getCapturedPieces(true); // Utilise la version plate des pièces
    
                // Fonction utilitaire pour afficher les pièces capturées
                const formatCapturedPieces = (pieces) => {
                    if (Array.isArray(pieces)) {
                        // Si les pièces sont sous forme de tableau plat
                        return '[' + pieces.map(piece => piece.getUnicode()).join(' ') + ']';
                    } else {
                        // Si les pièces sont regroupées par type (objet)
                        return Object.entries(pieces)
                                .map(([type, piecesOfType]) => {
                                    const pieceUnicode = piecesOfType[0]?.getUnicode() || ''; // Prend uniquement le symbole de la première pièce
                                    const count = piecesOfType.length;
                                    return count > 1
                                        ? ` ${pieceUnicode} x <small>${count}</small> ` // Affiche le nombre si plus d'une pièce
                                        : ` ${pieceUnicode} `; // Sinon, affiche uniquement le symbole
                                })
                                .join(' , ');
                    }
                };
            
                // Mettre à jour les conteneurs
                const capturedByBlackContainer = document.getElementById('capturedByBlack');
                const capturedByWhiteContainer = document.getElementById('capturedByWhite');
    
                capturedByBlackContainer.innerHTML = formatCapturedPieces(capturedByBlack);
                capturedByWhiteContainer.innerHTML = formatCapturedPieces(capturedByWhite);
                
                const turnContainer = document.getElementById('turn');
    
                if (caseInfo.isCheckmate == false)
                {
                    if (caseInfo.isDraw == true)
                    {
                        turnContainer.innerHTML = `La partie est nulle.`;
                    }
                    else
                    {
                        turnContainer.innerHTML = ` ${board.currentTurnColor === Color.BLANC ? 'Les blancs jouent.' : 'Les noirs jouent.'}`;
                    }
                    
                }
                else{
                    turnContainer.innerHTML = ` ${board.currentTurnColor === Color.BLANC ? 'Les noirs ont gagné.' : 'Les blancs ont gagné.'}`;
                }
    
                $('#badgeTotalMoves').html(caseInfo.fullMoveCount + ' <i class="fas fa-chess-pawn sliding"></i>');
    
                updateProgressBadge('badgeHalfMoves',caseInfo.halfMoveCount, 100,' &#189; <i class="px-1 fas fa-chess-pawn sliding"></i>'); 
    
                if (caseInfo.isDraw == true)
                {
                    $('#badgeDrawStatus').fadeIn(400); // 400ms pour l'animation
                }
                
                if (caseInfo.isCanRequestDraw == true)
                {
                    $('#badgeCanRequestDraw').fadeIn(400); // 400ms pour l'animation
                }
                else{
                    $('#badgeCanRequestDraw').fadeOut(400); // 400ms pour l'animation
                }
    
                if (caseInfo.hasWhiteCastlingRights == true)
                {
                    $('#badgeWhiteCastling').fadeIn(400);
                }
                else{
                    $('#badgeWhiteCastling').fadeOut(400);
                }
    
                if (caseInfo.hasBlackCastlingRights == true)
                {
                    $('#badgeBlackCastling').fadeIn(400);
                }
                else{
                    $('#badgeBlackCastling').fadeOut(400);
                }
    
                if (caseInfo.isCheckmate == false)
                {
                    $('#badgeCheckmateWhiteStatus').fadeOut(400); // 400ms pour l'animation
                    $('#badgeCheckmateBlackStatus').fadeOut(400); // 400ms pour l'animation
    
                    if (caseInfo.isCheckWhite == true)
                    {
                        $('#badgeCheckWhiteStatus').fadeIn(400); // 400ms pour l'animation
                    }
                    else{
                        $('#badgeCheckWhiteStatus').fadeOut(400); // 400ms pour l'animation
                    }
                    if (caseInfo.isCheckBlack == true)
                    {
                        $('#badgeCheckBlackStatus').fadeIn(400); // 400ms pour l'animation
                    }
                    else{
                        $('#badgeCheckBlackStatus').fadeOut(400); // 400ms pour l'animation
                    }
                }
                else{
                    $('#badgeCheckWhiteStatus').fadeOut(400); // 400ms pour l'animation
                    $('#badgeCheckBlackStatus').fadeOut(400); // 400ms pour l'animation
    
                    if ( board.currentTurnColor === Color.BLANC )
                    {
                        $('#badgeCheckmateWhiteStatus').fadeIn(400); // 400ms pour l'animation
                    }
                    else
                    {
                        $('#badgeCheckmateBlackStatus').fadeIn(400); // 400ms pour l'animation
                    }
                }
    
                if ( board.currentTurnColor === Color.BLANC )
                {
                    if(caseInfo.priseEnPassant != '-')
                    {
                        $('#badgeCapturedByWhite').fadeIn(400); // 400ms pour l'animation
                        $('#badgeCapturedByWhite').html(`<div class="crown-light"><i class="px-1 fas fa-chess-pawn"></i>${caseInfo.priseEnPassant}</div>`);
                    }
                    else{
                        $('#badgeCapturedByBlack').html(`<div class="crown-dark"><i class="fas fa-chess-pawn"></i></div>`);
                        $('#badgeCapturedByBlack').fadeOut(400); // 400ms pour l'animation
                    }
                }
                else
                {
                    if(caseInfo.priseEnPassant != '-')
                    {
                        $('#badgeCapturedByBlack').fadeIn(400); // 400ms pour l'animation
                        $('#badgeCapturedByBlack').html(`<div class="crown-dark"><i class="px-1 fas fa-chess-pawn"></i>${caseInfo.priseEnPassant}</div>`);
                    }
                    else{
                        $('#badgeCapturedByWhite').html(`<div class="crown-light"><i class="fas fa-chess-pawn"></i></div>`);
                        $('#badgeCapturedByWhite').fadeOut(400); // 400ms pour l'animation
                    }
                }
                updateButtonStates();
            });
    
            board.initBoard();
            board.updateBoardDisplay();
    
            $('#nameUserWhite').html(board.playerB);
            $('#nameUserBlack').html(board.playerN);

        }

        return this.each(function() {
            initializeBoard($(this));
        });
    };

    $.fn.checkmatBuilder.version = '0.0.1'; // Version actuelle de la bibliothèque
    $.fn.checkmatBuilder.title = 'checkmat.js'; // Titre de la bibliothèque
    $.fn.checkmatBuilder.description = 'Bibliothèque interactive pour gérer et afficher un échiquier en utilisant jQuery avec des fonctionnalités intégrées comme les mouvements, les badges de progression, et les pièces capturées.'; // Description

})(jQuery);