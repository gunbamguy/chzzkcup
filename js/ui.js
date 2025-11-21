// js/ui.js

function renderPlayers() {
    // 모든 포지션별로 선수 렌더링
    const positions = ['top', 'mid', 'bot', 'sup'];

    positions.forEach(position => {
        const container = document.getElementById(`${position}Players`);
        if (!container) return;

        container.innerHTML = '';

        PLAYERS[position].forEach((player, index) => {
            const playerCard = document.createElement('div');
            const playerId = `${position}_${player}`;
            const isUsed = state.usedPlayers.has(playerId);

            playerCard.className = `player-card ${isUsed ? 'used' : ''}`;
            playerCard.draggable = !isUsed;
            playerCard.innerHTML = `
                <img src="${position}/${player}" alt="선수">
                <h4>${getPlayerName(player)}</h4>
            `;

            if (!isUsed) {
                playerCard.addEventListener('dragstart', (e) => {
                    playerCard.classList.add('dragging');
                    e.dataTransfer.setData('application/json', JSON.stringify({
                        id: playerId,
                        file: player,
                        position: position
                    }));
                });

                playerCard.addEventListener('dragend', () => {
                    playerCard.classList.remove('dragging');
                });

                playerCard.addEventListener('click', () => {
                    selectPlayer(playerCard, playerId, player, position);
                });
            }

            container.appendChild(playerCard);
        });
    });
}

function updateSlot(slot, player) {
    const positionSlot = slot.closest('.position-slot');

    const playerContainer = document.createElement('div');
    playerContainer.className = 'player-container';

    const img = document.createElement('img');
    img.src = `${player.position}/${player.file}`;
    img.className = 'player-img';
    img.alt = '선수';

    const nameLabel = document.createElement('div');
    nameLabel.className = 'player-name-label';
    nameLabel.textContent = getPlayerName(player.file);

    img.addEventListener('click', () => {
        removePlayer(positionSlot, player);
    });

    playerContainer.appendChild(img);
    playerContainer.appendChild(nameLabel);

    slot.remove();
    positionSlot.appendChild(playerContainer);
}

function restoreUI(gameData) {
    // 드래프트 시스템에서는 포인트/점수 시스템 불필요

    // state.teams가 배열인지 확인
    if (!Array.isArray(state.teams)) {
        console.error('state.teams가 배열이 아닙니다:', typeof state.teams, state.teams);
        // 객체인 경우 배열로 변환
        if (typeof state.teams === 'object' && state.teams !== null) {
            const teamsArray = [];
            Object.keys(state.teams).forEach(key => {
                const teamIndex = parseInt(key);
                const team = state.teams[key];

                if (!team || typeof team !== 'object') {
                    console.warn(`변환 중 팀 ${teamIndex}이 유효하지 않습니다. 기본값으로 초기화합니다.`);
                    teamsArray[teamIndex] = { id: teamIndex, players: { top: null, mid: null, bot: null, sup: null } };
                } else {
                    // players가 없으면 기본값 설정
                    if (!team.players || typeof team.players !== 'object') {
                        team.players = { top: null, mid: null, bot: null, sup: null };
                    }
                    teamsArray[teamIndex] = team;
                }
            });
            state.teams = teamsArray;
            console.log('restoreUI에서 state.teams를 배열로 변환했습니다.');
        } else {
            console.error('state.teams를 복구할 수 없습니다. 기본값으로 초기화합니다.');
            return;
        }
    }

    state.teams.forEach((team, teamId) => {
        // team 객체가 유효한지 확인
        if (!team || typeof team !== 'object') {
            console.warn(`팀 ${teamId}이 유효하지 않습니다:`, team);
            return; // 이 팀은 건너뛰기
        }

        // team.players가 유효한지 확인
        if (!team.players || typeof team.players !== 'object') {
            console.warn(`팀 ${teamId}의 players가 유효하지 않습니다:`, team.players);
            return; // 이 팀은 건너뛰기
        }

        Object.keys(team.players).forEach(position => {
            const player = team.players[position];
            if (player) {
                const slot = document.querySelector(`[data-team="${teamId}"] .position-slot.${position}`);
                if (slot) {
                    const emptySlot = slot.querySelector('.empty-slot');
                    if (emptySlot) {
                        updateSlot(emptySlot, {
                            file: player.file,
                            position: position,
                            id: player.id
                        });
                    }
                }
            }
        });
    });

    renderPlayers();
}

function highlightActivePositions(position) {
    // 더 이상 포지션별 하이라이트 불필요 (모든 포지션 동시 표시)
}

// 팀 편집 모드 제거됨 - 드래프트 시작 전에만 팀 순서 랜덤 가능

function selectMyTeam(teamId) {
    // 이미 선택된 팀을 다시 클릭하면 선택 해제
    if (state.selectedTeam === teamId) {
        state.selectedTeam = null;
        document.querySelectorAll('.team').forEach(team => {
            team.classList.remove('my-team');
        });
        document.querySelectorAll('.my-team-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        console.log('내 팀 선택 해제');
    } else {
        state.selectedTeam = teamId;

        // 모든 팀에서 my-team 클래스 제거
        document.querySelectorAll('.team').forEach(team => {
            team.classList.remove('my-team');
            if (parseInt(team.dataset.team) === teamId) {
                team.classList.add('my-team');
            }
        });

        // 버튼 상태 업데이트
        document.querySelectorAll('.my-team-btn').forEach(btn => {
            if (parseInt(btn.dataset.team) === teamId) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });

        console.log(`내 팀 선택: ${teamId}`);
    }
}

// 슬롯머신에서 추첨된 선수의 포지션으로 자동 전환
function switchToPosition(position) {
    // 현재 포지션 상태 업데이트
    state.currentPosition = position;

    // 해당 포지션의 탭 버튼을 활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.position === position) {
            btn.classList.add('active');
        }
    });

    // 해당 포지션을 하이라이트
    highlightActivePositions(position);

    // 선수 목록을 해당 포지션으로 업데이트
    renderPlayers();

    console.log(`포지션이 ${POSITION_NAMES[position]}로 전환되었습니다.`);
}
