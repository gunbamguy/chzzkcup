
// js/config.js

const PLAYERS = {
    top: ['김뿡.gif', '룩삼.gif', '얍얍.gif', '운타라.gif', '한동숙.gif'],
    mid: ['랄로.gif', '앰비션.gif', '인섹.gif', '트롤야.gif', '피닉스박.gif'],
    bot: ['괴물쥐.gif', '따효니.gif', '러너.gif', '명예훈장.gif', '삼식.gif'],
    sup: ['던.gif', '소풍왔니.gif', '순당무.gif', '인간젤리.gif', '푸린.gif']
};

const POSITION_NAMES = {
    top: '탑',
    mid: '미드',
    bot: '원딜',
    sup: '서포터'
};

function getPlayerName(filename) {
    return filename.replace('.gif', '');
}
