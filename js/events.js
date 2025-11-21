
// js/events.js

function setupEventListeners() {
    // 기존 이벤트 리스너 제거 후 재등록
    const randomBtn = document.getElementById('randomBtn');
    const startDraftBtn = document.getElementById('startDraftBtn');

    // 기존 이벤트 리스너 제거
    if (randomBtn) {
        randomBtn.replaceWith(randomBtn.cloneNode(true));
    }
    if (startDraftBtn) {
        startDraftBtn.replaceWith(startDraftBtn.cloneNode(true));
    }
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('empty-slot')) {
            assignPlayer(e.target);
        }
        else if (e.target.classList.contains('player-img') && !e.target.classList.contains('fixed')) {
            const slot = e.target.closest('.position-slot');
            if (!slot) return;
            const teamElement = slot.closest('.team');
            if (!teamElement) return;
            const teamId = parseInt(teamElement.dataset.team);
            if (isNaN(teamId) || !state.teams[teamId]) return;

            let position = null;
            const positionClasses = ['top', 'mid', 'bot', 'sup'];
            for (const pos of positionClasses) {
                if (slot.classList && slot.classList.contains(pos)) {
                    position = pos;
                    break;
                }
            }

            // slot이 null이거나 position이 null이면 아무 동작하지 않음
            if (!position) return;
            // state.teams[teamId]가 유효한지, players가 있는지 확인
            const team = state.teams[teamId];
            if (!team || !team.players) return;
            const player = team.players[position];
            if (player) {
                removePlayer(slot, player);
            }
        }
    });

    document.addEventListener('dragover', (e) => {
        if (e.target.classList.contains('empty-slot') ||
            e.target.closest('.position-slot')?.querySelector('.empty-slot')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();
        const targetSlot = e.target.classList.contains('empty-slot') ?
            e.target : e.target.closest('.position-slot')?.querySelector('.empty-slot');

        if (targetSlot) {
            try {
                const jsonData = e.dataTransfer.getData('application/json');
                if (jsonData) {
                    const playerData = JSON.parse(jsonData);
                    assignPlayerByDrop(targetSlot, playerData);
                }
            } catch (error) {
                console.log('드롭 데이터 파싱 실패:', error);
            }
        }
    });

    // 리셋 버튼 이벤트 리스너 (강제 재연결)
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        // 기존 버튼을 복제하여 교체 (모든 이벤트 리스너 제거 효과)
        const newResetBtn = resetBtn.cloneNode(true);
        resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);

        newResetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            resetAllTeams();
        });
        console.log('리셋 버튼 이벤트 리스너 재연결됨 (Clean)');
    }

    // 드래프트 시작 버튼 이벤트 리스너
    const startDraftBtnNew = document.getElementById('startDraftBtn');
    if (startDraftBtnNew) {
        startDraftBtnNew.removeAttribute('data-listener-added');
        if (!startDraftBtnNew.hasAttribute('data-listener-added')) {
            startDraftBtnNew.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleStartDraft();
            });
            startDraftBtnNew.setAttribute('data-listener-added', 'true');
            console.log('드래프트 시작 버튼 이벤트 리스너 연결됨');
        }
    }

    const randomBtnNew = document.getElementById('randomBtn');
    if (randomBtnNew) {
        // 기존 속성 제거하고 새로운 이벤트 리스너 추가
        randomBtnNew.removeAttribute('data-listener-added');
        if (!randomBtnNew.hasAttribute('data-listener-added')) {
            randomBtnNew.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRandomizeTeamOrder();
            });
            randomBtnNew.setAttribute('data-listener-added', 'true');
            console.log('팀 순서 랜덤 버튼 이벤트 리스너 재연결됨');
        }
    }

    // 드래프트 종료 버튼 이벤트 리스너
    const endDraftBtn = document.getElementById('endDraftBtn');
    if (endDraftBtn) {
        endDraftBtn.removeAttribute('data-listener-added');
        if (!endDraftBtn.hasAttribute('data-listener-added')) {
            endDraftBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEndDraft();
            });
            endDraftBtn.setAttribute('data-listener-added', 'true');
            console.log('드래프트 종료 버튼 이벤트 리스너 연결됨');
        }
    }

    // 순서 변경 버튼 이벤트 리스너
    const changeOrderBtn = document.getElementById('changeOrderBtn');
    if (changeOrderBtn) {
        changeOrderBtn.removeAttribute('data-listener-added');
        if (!changeOrderBtn.hasAttribute('data-listener-added')) {
            changeOrderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleOrderEditMode();
            });
            changeOrderBtn.setAttribute('data-listener-added', 'true');
            console.log('순서 변경 버튼 이벤트 리스너 연결됨');
        }
    }

    document.querySelectorAll('.my-team-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const teamId = parseInt(btn.dataset.team);
            selectMyTeam(teamId);
        });
    });

    window.addEventListener('resize', () => {
        adjustSlotMachinePositionOnResize();
    });
}

function setupTeamPointsEvents() {
    // 경매 시스템 제거로 포인트 이벤트 불필요
    // 드래프트 모드에서는 포인트 시스템 사용하지 않음
}

function setupPositionScoreEvents() {
    // 경매 시스템 제거로 점수 이벤트 불필요
    // 드래프트 모드에서는 점수 시스템 사용하지 않음
}

function handlePositionScoreChange(event) {
    // 경매 시스템 제거로 불필요
}

function reattachEventListeners() {
    setupEventListeners();
    setupDragAndDrop();
}
