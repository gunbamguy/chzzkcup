// js/dragDrop.js

function setupDragAndDrop() {
    // 슬롯 영역에서 팀 드롭 방지
    preventTeamDropOnSlots();

    // 전체 컨테이너에서 잘못된 드롭 방지
    preventInvalidTeamDrops();

    const teams = document.querySelectorAll('.team');

    teams.forEach(team => {
        // 기존 이벤트 리스너 제거를 위해 복제
        const newTeam = team.cloneNode(true);
        team.parentNode.replaceChild(newTeam, team);
    });

    const newTeams = document.querySelectorAll('.team');

    newTeams.forEach(team => {
        team.addEventListener('dragstart', (e) => {
            // 순서 변경 모드일 때만 드래그 허용
            if (state.isOrderEditMode) {
                team.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', team.dataset.team);
                e.dataTransfer.setData('application/team-reorder', 'true');
            } else if (state.isEditMode) {
                // 기존 편집 모드 (사용 안함)
                e.preventDefault();
            } else {
                e.preventDefault();
            }
        });

        team.addEventListener('dragend', (e) => {
            team.classList.remove('dragging');
            clearDragOverStyles();
        });

        team.addEventListener('dragover', (e) => {
            if (!state.isOrderEditMode) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            const draggingTeam = document.querySelector('.team.dragging');
            if (draggingTeam && draggingTeam !== team) {
                // 드래그 중인 팀이 현재 팀 위로 올라왔을 때 시각적 효과
                // 실제 이동은 drop에서 처리하거나, 여기서 실시간으로 처리할 수도 있음
                // 여기서는 간단하게 drop에서 처리
            }
        });

        team.addEventListener('drop', (e) => {
            if (!state.isOrderEditMode) return;
            e.preventDefault();

            const draggingTeam = document.querySelector('.team.dragging');
            if (draggingTeam && draggingTeam !== team) {
                // DOM에서 위치 교환 (insertBefore 사용)
                const container = document.querySelector('.teams-container');
                const allTeams = Array.from(container.querySelectorAll('.team'));
                const fromIndex = allTeams.indexOf(draggingTeam);
                const toIndex = allTeams.indexOf(team);

                if (fromIndex < toIndex) {
                    // 아래로 이동: target의 다음 형제 앞에 삽입
                    container.insertBefore(draggingTeam, team.nextSibling);
                } else {
                    // 위로 이동: target 앞에 삽입
                    container.insertBefore(draggingTeam, team);
                }

                // 순서 저장
                saveTeamOrderFromDOM();
            }
        });

        const myTeamBtn = team.querySelector('.my-team-btn');
        if (myTeamBtn) {
            myTeamBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const teamId = parseInt(myTeamBtn.dataset.team);
                selectMyTeam(teamId);
            });
        }
    });
}

// 슬롯 영역에서 팀 드롭 방지
function preventTeamDropOnSlots() {
    document.querySelectorAll('.position-slot').forEach(slot => {
        // 기존 이벤트 리스너 제거
        const newSlot = slot.cloneNode(true);
        slot.parentNode.replaceChild(newSlot, slot);

        // 드래그오버 방지
        newSlot.addEventListener('dragover', (e) => {
            if (state.isEditMode && e.dataTransfer.types.includes('application/team-drag')) {
                // 팀 드래그 중인 경우에만 방지
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'none';
            }
        });

        // 드롭 방지
        newSlot.addEventListener('drop', (e) => {
            if (state.isEditMode && e.dataTransfer.types.includes('application/team-drag')) {
                // 팀 드래그 중인 경우에만 방지
                e.preventDefault();
                e.stopPropagation();
                console.log('슬롯 영역에는 팀을 드롭할 수 없습니다.');
                return false;
            }
        });
    });
}

// 전체 컨테이너에서 잘못된 드롭 방지
function preventInvalidTeamDrops() {
    const container = document.querySelector('.container');
    if (container) {
        container.addEventListener('dragover', (e) => {
            if (state.isEditMode && e.dataTransfer.types.includes('application/team-drag')) {
                // 팀 영역이 아닌 곳에서는 드롭 방지
                if (!e.target.closest('.team')) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'none';
                }
            }
        });

        container.addEventListener('drop', (e) => {
            if (state.isEditMode && e.dataTransfer.types.includes('application/team-drag')) {
                // 팀 영역이 아닌 곳에서는 드롭 방지
                if (!e.target.closest('.team')) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('팀은 다른 팀 위에서만 교체할 수 있습니다.');
                    return false;
                }
            }
        });
    }
}

function clearDragOverStyles() {
    document.querySelectorAll('.team').forEach(team => {
        team.classList.remove('drag-over');
    });
}

function swapTeams(teamId1, teamId2) {
    // 같은 팀 ID인 경우 아무것도 하지 않음
    if (teamId1 === teamId2) {
        console.log('같은 팀 ID로 교체 시도됨 - 무시함');
        return;
    }

    const team1 = document.querySelector(`[data-team="${teamId1}"]`);
    const team2 = document.querySelector(`[data-team="${teamId2}"]`);

    if (!team1 || !team2) {
        console.error('팀 요소를 찾을 수 없습니다.');
        return;
    }

    // state 데이터 존재 여부 확인
    if (!state.teams[teamId1] || !state.teams[teamId2]) {
        console.error('팀 데이터를 찾을 수 없습니다.');
        return;
    }

    console.log(`팀 교체: ${teamId1} ↔ ${teamId2}`);

    // state 데이터 교환
    const tempData = { ...state.teams[teamId1] };
    state.teams[teamId1] = { ...state.teams[teamId2] };
    state.teams[teamId2] = tempData;

    // ID 유지
    state.teams[teamId1].id = parseInt(teamId1);
    state.teams[teamId2].id = parseInt(teamId2);

    // DOM 요소 위치 교환 (더 안전한 방법)
    const parent = team1.parentNode;

    // 임시 placeholder 생성
    const placeholder = document.createElement('div');
    placeholder.style.display = 'none';

    // team1을 placeholder로 교체
    parent.insertBefore(placeholder, team1);

    // team1을 team2 위치로 이동
    parent.insertBefore(team1, team2);

    // team2를 placeholder 위치로 이동
    parent.insertBefore(team2, placeholder);

    // placeholder 제거
    placeholder.remove();

    // 각 팀의 내용을 새로운 데이터로 업데이트
    updateTeamContent(team1, state.teams[teamId1]);
    updateTeamContent(team2, state.teams[teamId2]);

    // 이벤트 리스너 재연결
    setTimeout(() => {
        if (state.selectedTeam !== null) {
            reattachEventListeners();
        } else {
            setupDragAndDrop();
        }
    }, 50);

    // 변경사항 저장
    saveToStorage();
}

// 팀 콘텐츠 안전하게 업데이트
function updateTeamContent(teamElement, teamData) {
    const teamId = teamData.id;

    // 팀 헤더 업데이트
    const teamHeader = teamElement.querySelector('.team-header h3');
    if (teamHeader) {
        teamHeader.textContent = `팀 ${teamId + 1}`;
    }

    // 내 팀 버튼 dataset 업데이트
    const myTeamBtn = teamElement.querySelector('.my-team-btn');
    if (myTeamBtn) {
        myTeamBtn.dataset.team = teamId.toString();
    }

    // 포지션 슬롯들 업데이트
    const positions = ['jgl', 'top', 'mid', 'bot', 'sup'];
    positions.forEach(position => {
        const slot = teamElement.querySelector(`.position-slot.${position}`);
        if (slot && teamData.players[position]) {
            const player = teamData.players[position];

            // 기존 내용 제거
            slot.innerHTML = '';

            if (position === 'jgl') {
                // 정글 (팀장) 슬롯
                slot.innerHTML = `
                    <img src="${position}/${player.file}" alt="정글" class="player-img fixed">
                    <div class="position-label">정글 (팀장)</div>
                    <div class="player-name-label">${getPlayerName(player.file)}</div>
                `;
            } else {
                // 다른 포지션 슬롯
                if (player.file) {
                    // 선수가 배치된 경우
                    const playerContainer = document.createElement('div');
                    playerContainer.className = 'player-container';

                    const img = document.createElement('img');
                    img.src = `${position}/${player.file}`;
                    img.alt = '선수';
                    img.className = 'player-img';

                    const nameLabel = document.createElement('div');
                    nameLabel.className = 'player-name-label';
                    nameLabel.textContent = getPlayerName(player.file);

                    playerContainer.appendChild(img);
                    playerContainer.appendChild(nameLabel);
                    slot.appendChild(playerContainer);

                    // 점수 입력 필드
                    const scoreInput = document.createElement('input');
                    scoreInput.type = 'number';
                    scoreInput.className = 'position-score';
                    scoreInput.value = player.score || '0';
                    scoreInput.min = '0';
                    scoreInput.max = '1000';
                    scoreInput.placeholder = '점수';
                    scoreInput.dataset.oldValue = player.score || '0';
                    slot.appendChild(scoreInput);
                } else {
                    // 빈 슬롯
                    slot.innerHTML = `
                        <div class="empty-slot" data-position="${position}">${POSITION_NAMES[position]}</div>
                        <input type="number" class="position-score" value="0" min="0" max="1000" placeholder="점수" data-old-value="0">
                    `;
                }
            }
        }
    });

    // 포인트 입력 필드 업데이트
    const pointsInput = teamElement.querySelector('.points-input');
    if (pointsInput) {
        pointsInput.value = teamData.points || 1000;
    }
}
