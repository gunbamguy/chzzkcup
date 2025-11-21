
// js/state.js

const state = {
    teams: [
        { id: 0, players: { top: null, mid: null, bot: null, sup: null } },
        { id: 1, players: { top: null, mid: null, bot: null, sup: null } },
        { id: 2, players: { top: null, mid: null, bot: null, sup: null } },
        { id: 3, players: { top: null, mid: null, bot: null, sup: null } },
        { id: 4, players: { top: null, mid: null, bot: null, sup: null } }
    ],
    usedPlayers: new Set(),
    currentPosition: 'top',
    selectedPlayer: null,
    isEditMode: false,
    selectedTeam: null,
    originalPlayersPanelParent: null,

    // 스네이크 드래프트 관련
    draftMode: false, // true = 드래프트 진행 중, false = 드래프트 시작 전
    draftStarted: false, // 드래프트 시작 여부
    currentDraftTeam: 0, // 현재 드래프트 차례인 팀
    draftRound: 1, // 현재 라운드 (1~4)
    draftHistory: [], // 드래프트 기록 [{round, pick, team, player, position}]
    positionOrder: ['top', 'mid', 'bot', 'sup'], // 포지션별 드래프트 순서
    teamOrder: [0, 1, 2, 3, 4] // 팀 드래프트 순서
};

// 스네이크 드래프트 순서 계산 함수
function getDraftOrder(round) {
    const order = [...state.teamOrder];
    // 짝수 라운드는 역순
    return round % 2 === 0 ? order.reverse() : order;
}

// 다음 드래프트 차례로 이동
function advanceDraft() {
    const currentRound = state.draftRound;
    const draftOrder = getDraftOrder(currentRound);
    const currentIndex = draftOrder.indexOf(state.currentDraftTeam);

    if (currentIndex < draftOrder.length - 1) {
        // 같은 라운드 내에서 다음 팀
        state.currentDraftTeam = draftOrder[currentIndex + 1];
    } else {
        // 다음 라운드로
        if (state.draftRound < 4) {
            state.draftRound++;
            state.currentDraftTeam = getDraftOrder(state.draftRound)[0];
            state.currentPosition = state.positionOrder[state.draftRound - 1];
        } else {
            // 드래프트 완료
            state.draftMode = false;
            console.log('드래프트 완료!');
        }
    }
}

// 드래프트 초기화
function resetDraft() {
    state.draftMode = false;
    state.draftStarted = false;
    state.currentDraftTeam = state.teamOrder[0];
    state.draftRound = 1;
    state.draftHistory = [];
    state.currentPosition = state.positionOrder[0];
}

// 드래프트 시작
function startDraft() {
    state.draftMode = true;
    state.draftStarted = true;
    state.currentDraftTeam = state.teamOrder[0];
    state.draftRound = 1;
    state.currentPosition = state.positionOrder[0];
}

// 팀 순서 랜덤화
function randomizeTeamOrder() {
    const shuffled = [...state.teamOrder];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    state.teamOrder = shuffled;
    state.currentDraftTeam = shuffled[0];
}
