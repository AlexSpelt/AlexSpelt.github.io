class DialogueCharacter {
    constructor() {
        this.xPos = -0;
        this.dialogue = [];
        this.shouldClickInterupt = false;
        let character = new Image();
        character.src = "./assets/images/popupCharacter.png";
        this.dialogueCharacterImage = character;
    }
    drawCharacter(ctx, canvas) {
        ctx.textAlign = "left";
        ctx.font = "18px Arial";
        ctx.fillStyle = 'black';
        ctx.drawImage(this.dialogueCharacterImage, canvas.width / 4.5 - this.xPos, canvas.height / 9, 800, 800);
        if (this.dialogue[0] !== undefined) {
            this.dialogue[0].split("\n").forEach((msg, index) => {
                ctx.fillText(msg, canvas.width / 4.4 - this.xPos, canvas.height / 6 + (index * 20));
            });
        }
    }
    showCharacter() {
        console.log('show character');
        GameTime.stopTimer();
        this.xPos = -2000;
        const animation = setInterval(() => {
            if (this.xPos >= 0) {
                console.log('done with showing');
                clearInterval(animation);
            }
            this.xPos += 64;
        }, 5);
    }
    hideCharacter() {
        console.log('hide character');
        GameTime.startTimer();
        this.xPos = 0;
        const animation = setInterval(() => {
            if (this.xPos <= -2000) {
                console.log('done with hiding');
                clearInterval(animation);
            }
            this.xPos += -64;
        }, 5);
    }
    createDialogue(dialogue) {
        if (this.dialogue.length == 0) {
            this.dialogue = dialogue;
            this.showCharacter();
        }
        this.dialogue.concat(dialogue);
    }
    nextDialogueHandler(input) {
        if (input instanceof UserInput)
            input = input.GetMousePressed();
        if (input) {
            if (this.dialogue.length == 1)
                this.hideCharacter();
            if (this.dialogue.length >= 1) {
                this.shouldClickInterupt = true;
                this.dialogue.shift();
            }
            if (this.dialogue.length >= 0) {
                if (this.shouldClickInterupt)
                    input = { xPos: -1, yPos: -1 };
                this.shouldClickInterupt = false;
            }
        }
        return input;
    }
}
class Game {
    constructor(canvasId) {
        this.loop = () => {
            this.currentScreen.listen(this.input);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.currentScreen.draw(this.ctx);
            this.currentScreen.adjust(this);
            if (!(this.currentScreen instanceof EndScoreScreen ||
                this.currentScreen instanceof IntroScreen ||
                this.currentScreen instanceof LostScreen)) {
                if (GameTime.returnTime() <= 0) {
                    this.switchScreen(new LostScreen(this));
                }
                GameTime.drawTimer(this);
            }
            requestAnimationFrame(this.loop);
        };
        this.canvas = canvasId;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext("2d");
        this.input = new UserInput();
        GameTime.setTime(420);
        this.currentScreen = new IntroScreen(this);
        GameTime.setTimerPos(true, true);
        this.loop();
    }
    switchScreen(newScreen) {
        if (newScreen === null) {
            throw new Error("newScreen cannot be null");
        }
        if (newScreen !== this.currentScreen) {
            this.currentScreen = newScreen;
        }
    }
}
let init = () => {
    const Asteroids = new Game(document.getElementById("canvas"));
};
window.addEventListener("load", init);
class GameScreen {
    constructor(game) {
        this.game = game;
    }
    listen(input) {
    }
    adjust(game) {
    }
    draw(ctx) {
    }
}
class GameTime {
    static setTime(time) {
        GameTime.time = time;
    }
    static startTimer() {
        GameTime.timer = setInterval(() => GameTime.time--, 1000);
    }
    static stopTimer() {
        clearInterval(GameTime.timer);
    }
    static returnTime() {
        return GameTime.time;
    }
    static returnTimeFormatted() {
        let min = Math.floor(GameTime.time / 60);
        let sec = GameTime.time % 60;
        if (sec < 10)
            sec = "0" + sec;
        return `${min}:${sec}`;
    }
    static removeTime(time) {
        GameTime.time = GameTime.time - time;
    }
    static setTimerPos(top, right) {
        this.drawTop = top;
        this.drawRight = right;
    }
    static drawTimer(game) {
        const xPosRect = this.drawRight ? game.canvas.width - 100 : 0;
        const yPosRect = this.drawTop ? 0 : game.canvas.height - 75;
        const xPosText = this.drawRight ? game.canvas.width - 25 : 80;
        const yPosText = this.drawTop ? 50 : game.canvas.height - 25;
        game.ctx.textAlign = 'right';
        game.ctx.textBaseline = 'bottom';
        game.ctx.strokeStyle = 'rgba(0,255,0,1)';
        game.ctx.font = '30px Arial';
        game.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        game.ctx.fillRect(xPosRect, yPosRect, 100, 75);
        game.ctx.fillStyle = 'rgba(0,255,0,1)';
        game.ctx.fillText(GameTime.returnTimeFormatted(), xPosText, yPosText);
        game.ctx.rect(xPosRect, yPosRect, 100, 75);
        game.ctx.stroke();
    }
}
GameTime.drawTop = true;
GameTime.drawRight = true;
class UIButton {
    constructor(xStart, yStart, width, height) {
        this.xStart = xStart;
        this.yStart = yStart;
        this.width = width;
        this.height = height;
    }
    checkIfPressed(ClickPos) {
        return ClickPos.xPos > this.xStart &&
            ClickPos.xPos < this.xStart + this.width &&
            ClickPos.yPos > this.yStart &&
            ClickPos.yPos < this.yStart + this.height;
    }
    drawDebugButton(ctx) {
        ctx.fillStyle = "rgba(255,0,0,0.5)";
        ctx.fillRect(this.xStart, this.yStart, this.width, this.height);
    }
}
class UserInput {
    constructor() {
        this.holdButton = false;
        this.buttonDown = false;
        this.mouseDown = (ev) => {
            this.buttonDown = true;
        };
        this.mouseUp = (ev) => {
            this.buttonDown = false;
            this.holdButton = false;
        };
        this.mouseMove = (ev) => {
            this.position = { xPos: ev.clientX, yPos: ev.clientY };
        };
        window.addEventListener("mousedown", this.mouseDown);
        window.addEventListener("mouseup", this.mouseUp);
        window.addEventListener("mousemove", this.mouseMove);
    }
    GetMousePressed() {
        if (!this.holdButton) {
            this.holdButton = true;
            return this.mouseUp ? this.position : null;
        }
        else {
            return null;
        }
    }
}
class ChatScreen extends GameScreen {
    constructor(game) {
        super(game);
        this.chats = [
            {
                chatName: 'Cindy',
                chatMessages: [
                    { message: 'Hoi, hoe gaat het met jou?', self: true },
                    { message: 'Hey, goed. Wie is dit?', self: false },
                    { message: 'Ik ben Gerard, en wie ben jij?', self: true, groomerDetail: 1 },
                    { message: 'Cindy, maar wat moet je met mijn nummer?', self: false }
                ]
            },
            {
                chatName: 'Abby',
                chatMessages: [
                    { message: 'Ga je nu nog die foto\'s doorsturen?', self: true },
                    { message: 'Nee, ik heb dat al vaker gestuurd?', self: false },
                    { message: 'Alsjeblieft?', self: true },
                    { message: '< U bent geblokkeerd >', self: false }
                ]
            },
            {
                chatName: 'Tessa',
                chatMessages: [
                    { message: 'He! doe is ff normaal met mijn vriendin!', self: false },
                    { message: 'Wat bedoel je, ben je de vriendin van Cindy ofzo?', self: true, groomerDetail: 1 },
                    { message: 'Ja, laat haar met rust ofzo!', self: false },
                    { message: 'Gek!', self: false }
                ]
            },
            {
                chatName: 'Piet',
                chatMessages: [
                    { message: 'He, gozer', self: true },
                    { message: 'Vanavond bij mij chillen?', self: true },
                    { message: 'Ja is goed, kan je je adres nog eens door sturen?', self: false },
                    { message: 'Steenstraat 69', self: true, groomerDetail: 1 },
                    { message: 'Oké tot vanavond', self: false }
                ]
            }
        ];
        this.currentChat = 0;
        this.hints = 0;
        this.selectChatBtns = [];
        this.chatBtns = [];
        GameTime.setTimerPos(true, true);
        this.dialogueCharacter = new DialogueCharacter();
        this.chats.forEach((_, index) => {
            this.selectChatBtns.push(new UIButton(this.game.canvas.width * 0.1, (100 * (index)), this.game.canvas.width * 0.2, 100));
        });
        document.getElementById('body').style.backgroundImage = 'url("./assets/images/bg.png")';
        this.createChatButtons();
        this.chats.forEach((Chat) => {
            Chat.chatMessages.forEach((msg) => {
                if (msg.groomerDetail)
                    this.hints++;
            });
        });
        this.dialogueCharacter.createDialogue([
            'Je hebt de chat app gevonden. Je gaat nu zoeken\nnaar info die kan helpen met het vinden van\nde dader en het slachtoffer. Klik op de berichten\ndie belangrijk bewijs zijn. Linksonder staat het\naantal bewijsstukken die je nog moet verzamelen.\nBij een fout antwoord gaat er 30 seconden van je\ntijd af.\n\nVeel succes!'
        ]);
    }
    draw(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.game.canvas.width * 0.1, 0, this.game.canvas.width * 0.2, this.game.canvas.height);
        ctx.fillRect(this.game.canvas.width * 0.3, 0, this.game.canvas.width * 0.6, 50);
        ctx.fillStyle = "rgba(240, 240, 240, 0.8)";
        ctx.fillRect(this.game.canvas.width * 0.3, 50, this.game.canvas.width * 0.6, this.game.canvas.height);
        ctx.fillStyle = '';
        this.chats.forEach((User, index) => {
            ctx.strokeStyle = "#afafaf";
            ctx.strokeRect(this.game.canvas.width * 0.1, (100 * (index)), this.game.canvas.width * 0.2, 100);
            if (index === this.currentChat) {
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(this.game.canvas.width * 0.1, (100 * (index)), this.game.canvas.width * 0.2, 100);
            }
            ctx.fillStyle = "black";
            ctx.textAlign = "left";
            ctx.font = "26px Arial";
            ctx.fillText(User.chatName, this.game.canvas.width * 0.1 + 10, (100 * (index + 1) - 60));
            ctx.fillStyle = "darkgray";
            ctx.font = "18px Arial";
            ctx.fillText(User.chatMessages[0].message.substr(0, 30) + (User.chatMessages[0].message.length > 30 ? '...' : ''), this.game.canvas.width * 0.1 + 10, (100 * (index + 1) - 30));
        });
        ctx.fillStyle = "black";
        ctx.strokeRect(this.game.canvas.width * 0.1, this.game.canvas.height - 50, this.game.canvas.width * 0.2, 50);
        ctx.fillText(`Bewijsstukken over: ${this.hints}`, this.game.canvas.width * 0.1 + 15, this.game.canvas.height - 15);
        ctx.fillStyle = "black";
        ctx.font = "26px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(this.chats[this.currentChat].chatName, this.game.canvas.width * 0.3 + 10, 25);
        ctx.font = "16px Arial";
        ctx.textBaseline = "top";
        this.chats[this.currentChat].chatMessages.forEach((ChatMessage, index) => {
            if (ChatMessage.self) {
                ctx.fillStyle = 'lightgreen';
                ctx.fillRect(this.game.canvas.width * 0.9 - 390, (50 * index) + 60, 380, 40);
                ctx.fillStyle = 'black';
                ctx.fillText(ChatMessage.message, this.game.canvas.width * 0.9 - 385, (50 * index) + 64);
            }
            else {
                ctx.fillStyle = 'white';
                ctx.fillRect(this.game.canvas.width * 0.3 + 30, (50 * index) + 60, 380, 40);
                ctx.fillStyle = 'black';
                ctx.fillText(ChatMessage.message, this.game.canvas.width * 0.3 + 35, (50 * index) + 64);
            }
        });
        this.dialogueCharacter.drawCharacter(ctx, this.game.canvas);
    }
    listen(input) {
        let isPressed = input.GetMousePressed();
        isPressed = this.dialogueCharacter.nextDialogueHandler(isPressed);
        if (isPressed) {
            this.selectChatBtns.forEach((selectBtn, index) => {
                if (selectBtn.checkIfPressed(isPressed)) {
                    this.currentChat = index;
                    this.createChatButtons();
                }
            });
            this.chatBtns.forEach((Btn, index) => {
                if (Btn.checkIfPressed(isPressed))
                    if (this.chats[this.currentChat].chatMessages[index]) {
                        if (this.chats[this.currentChat].chatMessages[index].groomerDetail === 1) {
                            this.dialogueCharacter.createDialogue(['Je hebt een bewijsstuk gevonden!']);
                            this.chats[this.currentChat].chatMessages[index].groomerDetail = 2;
                            this.hints--;
                        }
                        else if (this.chats[this.currentChat].chatMessages[index].groomerDetail === 2) {
                            this.dialogueCharacter.createDialogue(['Je hebt hier al op gedrukt!']);
                        }
                        else {
                            this.dialogueCharacter.createDialogue(['Dit is helaas geen waardevolle info.']);
                            this.chats[this.currentChat].chatMessages[index].groomerDetail = 2;
                            GameTime.removeTime(30);
                        }
                        if (this.hints === 0) {
                            this.nextScreen = true;
                        }
                    }
            });
        }
    }
    createChatButtons() {
        this.chatBtns = [];
        this.chats[this.currentChat].chatMessages.forEach((ChatMessage, index) => {
            if (ChatMessage.self) {
                this.chatBtns.push(new UIButton(this.game.canvas.width * 0.9 - 390, (50 * index) + 60, 380, 40));
            }
            else {
                this.chatBtns.push(new UIButton(this.game.canvas.width * 0.3 + 30, (50 * index) + 60, 380, 40));
            }
        });
    }
    adjust(game) {
        if (this.nextScreen)
            game.switchScreen(new EndScoreScreen(game));
    }
}
class DeepFakeScreen extends GameScreen {
    constructor(game) {
        super(game);
        this.deepFakeList = [
            {
                differenceButton1: {
                    height: 0.05,
                    width: 0.1,
                    x: 0.34,
                    y: 0.42,
                },
                differenceButton2: {
                    height: 0.2,
                    width: 0.1,
                    x: 0.12,
                    y: 0.38,
                },
                imageUrlFake: "./assets/images/original3.png",
                imageUrlOriginal: "./assets/images/deepfake3.png"
            },
            {
                differenceButton1: {
                    height: 0.07,
                    width: 0.1,
                    x: 0.3,
                    y: 0.45,
                },
                differenceButton2: {
                    height: 0.07,
                    width: 0.2,
                    x: 0.44,
                    y: 0.88,
                },
                imageUrlFake: "./assets/images/original.png",
                imageUrlOriginal: "./assets/images/deepfake.png"
            },
            {
                differenceButton1: {
                    height: 0.07,
                    width: 0.1,
                    x: 0.57,
                    y: 0.4,
                },
                differenceButton2: {
                    height: 0.07,
                    width: 0.2,
                    x: 0.3,
                    y: 0.35,
                },
                imageUrlFake: "./assets/images/original2.png",
                imageUrlOriginal: "./assets/images/deepfake2.png"
            },
        ];
        this.currentDeepFake = -1;
        this.difference1 = 0;
        this.difference2 = 0;
        this.paddingTop = this.game.canvas.height * 0.10;
        this.paddingBottom = this.game.canvas.height * 0.05;
        GameTime.setTimerPos(true, true);
        this.setNewDeepFake();
        document.getElementById('body').style.backgroundImage = "url('https://live.staticflickr.com/684/32192716655_b94c77c8c3_b.jpg')";
        this.dialogueCharacter = new DialogueCharacter();
        this.dialogueCharacter.createDialogue([
            'De verdachte maakt gebruik van deepfake foto\'s\nDit zijn foto’s gemaakt door\nkunstmatige intelligentie.\nDeze gebruikt hij om net te doen alsof hij iemand\nanders is.\nZoek hierin de verschillen.\nVeel succes!'
        ]);
    }
    setNewDeepFake() {
        this.currentDeepFake++;
        if (this.currentDeepFake < this.deepFakeList.length) {
            this.difference1 = 0;
            this.difference2 = 0;
        }
        else {
            this.nextScreen = true;
            return;
        }
        let imageoriginal = new Image();
        imageoriginal.src = this.deepFakeList[this.currentDeepFake].imageUrlOriginal;
        this.original = imageoriginal;
        let imageDeepfake = new Image();
        imageDeepfake.src = this.deepFakeList[this.currentDeepFake].imageUrlFake;
        this.deepFakeImage = imageDeepfake;
        this.dY = this.paddingTop;
        this.dW = this.game.canvas.width / 10 * 3.5;
        this.dH = this.game.canvas.height * this.game.canvas.width / this.game.canvas.height / 2;
        this.dxOriginal = this.game.canvas.width / 10 * 1;
        this.dxDeepFake = this.game.canvas.width / 2 + this.game.canvas.width / 10 * 0.5;
        if (this.game.canvas.height - this.dH - this.paddingTop - this.paddingBottom < 1)
            this.dH = this.game.canvas.height - this.paddingBottom - this.paddingTop;
        this.differenceButton1 = new UIButton(this.dxDeepFake + (this.dW * this.deepFakeList[this.currentDeepFake].differenceButton1.x), this.dY + (this.dH * this.deepFakeList[this.currentDeepFake].differenceButton1.y), this.dW * this.deepFakeList[this.currentDeepFake].differenceButton1.width, this.dH * this.deepFakeList[this.currentDeepFake].differenceButton1.height);
        this.differenceButton2 = new UIButton(this.dxDeepFake + (this.dW * this.deepFakeList[this.currentDeepFake].differenceButton2.x), this.dY + (this.dH * this.deepFakeList[this.currentDeepFake].differenceButton2.y), this.dW * this.deepFakeList[this.currentDeepFake].differenceButton2.width, this.dH * this.deepFakeList[this.currentDeepFake].differenceButton2.height);
    }
    draw(ctx) {
        this.game.ctx.drawImage(this.original, this.dxOriginal, this.dY, this.dW, this.dH);
        this.game.ctx.drawImage(this.deepFakeImage, this.dxDeepFake, this.dY, this.dW, this.dH);
        if (this.difference1 === 1) {
            this.differenceButton1.drawDebugButton(ctx);
        }
        if (this.difference2 === 1) {
            this.differenceButton2.drawDebugButton(ctx);
        }
        this.dialogueCharacter.drawCharacter(ctx, this.game.canvas);
    }
    checkdifference() {
        if (this.difference1 === 1 && this.difference2 === 1) {
            this.setNewDeepFake();
            console.log("goed");
        }
    }
    listen(input) {
        let isPressed = input.GetMousePressed();
        isPressed = this.dialogueCharacter.nextDialogueHandler(isPressed);
        if (isPressed) {
            if (this.differenceButton1.checkIfPressed(isPressed)) {
                console.log("inderdaad1");
                this.difference1 = 1;
                this.checkdifference();
            }
            else if (this.differenceButton2.checkIfPressed(isPressed)) {
                console.log("inderdaad2");
                this.difference2 = 1;
                this.checkdifference();
            }
            else
                GameTime.removeTime(5);
        }
    }
    adjust(game) {
        if (this.nextScreen)
            game.switchScreen(new ChatScreen(game));
    }
}
class EndScoreScreen extends GameScreen {
    constructor(game) {
        super(game);
        this.highScoreList = [];
        document.getElementById('body').style.backgroundImage = "url('./assets/images/Groomer_arrest.png')";
        this.dialogueCharacter = new DialogueCharacter();
        this.dialogueCharacter.createDialogue([
            'Gefeliciteerd! je hebt gewonnen.',
            'De dader is opgepakt. Dit is je score.'
        ]);
        GameTime.stopTimer();
        this.setHighScore(Game.username, GameTime.returnTime()).then(() => {
            this.getHighScores().then((res) => {
                this.highScoreList = res;
            }).catch((res) => {
                this.highScoreList = res;
            });
        }).catch(() => {
            console.error('failed to store highscore, server may be down...');
        });
    }
    draw(ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.strokeStyle = 'rgba(0,255,0,1)';
        ctx.fillRect(this.game.canvas.width / 2 - 250, 65, 500, 50);
        ctx.strokeRect(this.game.canvas.width / 2 - 250, 65, 500, 50);
        ctx.textAlign = "center";
        ctx.font = "30px Arial";
        ctx.textBaseline = "middle";
        ctx.fillStyle = 'rgba(0,255,0,1)';
        ctx.fillText('Je score is: ' + GameTime.returnTime(), this.game.canvas.width / 2, 90);
        if (this.highScoreList.length > 0)
            this.highScoreList.forEach((highscore, index) => {
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.strokeStyle = 'rgba(0,255,0,1)';
                ctx.fillRect(this.game.canvas.width / 2 - 250, 150 + (54 * index), 500, 50);
                ctx.strokeRect(this.game.canvas.width / 2 - 250, 150 + (54 * index), 500, 50);
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = 'rgba(0,255,0,1)';
                ctx.fillText(highscore.Name + ' : ' + highscore.Score, this.game.canvas.width / 2, 180 + (54 * index));
            });
        this.dialogueCharacter.drawCharacter(ctx, this.game.canvas);
        GameTime.stopTimer();
    }
    listen(input) {
        this.dialogueCharacter.nextDialogueHandler(input);
    }
    getHighScores() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.withCredentials = false;
            xhr.addEventListener("readystatechange", function () {
                if (this.readyState === 4) {
                    try {
                        resolve(JSON.parse(this.responseText));
                    }
                    catch (err) {
                        reject([{ HighScoreID: null, Name: 'error', Score: 0 }]);
                    }
                }
            });
            xhr.open("GET", "https://alexspelt.nl:81/api/groomerGame/HighScoresList");
            xhr.send();
        });
    }
    setHighScore(name, score) {
        return new Promise((resolve, reject) => {
            let data = `name=${name}&score=${score}`;
            const xhr = new XMLHttpRequest();
            xhr.withCredentials = false;
            xhr.addEventListener("readystatechange", function () {
                if (this.readyState === 4) {
                    const returnMsg = JSON.parse(this.responseText);
                    if (returnMsg.err) {
                        reject();
                    }
                    else {
                        resolve();
                    }
                }
            });
            xhr.open("POST", "https://alexspelt.nl:81/api/groomerGame/NewHighscore");
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(data);
        });
    }
}
class FakeProfileScreen extends GameScreen {
    constructor(game) {
        super(game);
        this.profiles = [
            {
                profileImage: "./assets/images/profile-pics/boy1.png",
                fake: true,
                textLine1: "Ik ben een vrolijke, 15-jarige jongen, op zoek naar",
                textLine2: "nieuwe vrienden. Ik deel graag foto's met anderen.",
                wrongAnswerExplanation: "Nep profielen hebben vaak de foto van een\nbijzonder mooi of beroemd persoon."
            },
            {
                profileImage: "./assets/images/profile-pics/girl1.png",
                fake: false,
                textLine1: "Hoi! Mijn naam is Emily, 11 jaar, en ik wil graag",
                textLine2: "kennis maken met andere meisjes.",
                textLine3: "Ik houd van paardrijden, tekenen en Disney",
                wrongAnswerExplanation: "Ze laat haar echte gezicht zien,\nde woordkeuze past bij wat een 11-jarige\nzou zeggen.\nOok haar hobby's passen bij\nwat een 11-jarige zou doen."
            },
            {
                profileImage: "./assets/images/profile-pics/boy2.png",
                fake: false,
                textLine1: "Ik ben een 42 jarige man. Mijn interesses",
                textLine2: "zijn auto's, computers en voetbal.",
                wrongAnswerExplanation: "Zijn hobby's komen overeen met wat een man\nvan zijn leeftijd zou doen.\nAangezien computers één van zijn\nhobby's zijn is het ook logisch dat hij een\nplaatje heeft wat lijkt op een game karakter.\nOok zouden jongeren een oudere\nvolwassene minder zoeken."
            },
            {
                profileImage: "./assets/images/profile-pics/FPBlankProfilePic.png",
                fake: true,
                textLine1: "Ik ben Jake, 17 jaar, en ik houd van volleybal.",
                textLine2: "Ik wil graag contact met meiden van mijn leeftijd.",
                wrongAnswerExplanation: "Je kan niet zien wie hij is, daarom kan je beter\nhet zekere voor het onzekere nemen."
            },
            {
                profileImage: "./assets/images/profile-pics/girl2.png",
                fake: true,
                textLine1: "Mijn naam is Jard, ik houd van paarden.",
                textLine2: "Ik zoek andere meiden om mee te kletsen.",
                textLine3: "Ik hou van foto's delen met anderen. ;)",
                wrongAnswerExplanation: "Jard is een jongensnaam wat al vreemd is,\nmaar het wordt nog vreemder:\nZij wil ook dat andere meisjes hun foto's delen\nen je kan niet zien wie ze is.\nEr zijn dus genoeg redenen om aan te nemen dat\nde foto's erg gevoelig kunnen zijn."
            }
        ];
        this.currentProfile = -1;
        GameTime.setTimerPos(true, true);
        document.getElementById('body').style.backgroundImage = "";
        document.getElementById('body').style.backgroundColor = "#404040";
        this.setNewProfile();
        let topNavImg = new Image();
        topNavImg.src = "./assets/images/FPTopNav.png";
        this.topNavImage = topNavImg;
        let logoImg = new Image();
        logoImg.src = "./assets/images/FPlogo.png";
        this.logoImage = logoImg;
        let searchBarImg = new Image();
        searchBarImg.src = "./assets/images/FPSearchBar.png";
        this.searchBarImage = searchBarImg;
        let profilePicLineImg = new Image();
        profilePicLineImg.src = "./assets/images/FPProfilePicLine.png";
        this.profilePicLineImage = profilePicLineImg;
        this.realButton = new UIButton(this.game.canvas.width / 2 - 298, this.game.canvas.height / 2 + 200, 298, 149);
        this.fakeButton = new UIButton(this.game.canvas.width / 2, this.game.canvas.height / 2 + 200, 298, 149);
        this.nextLevelButton = new UIButton(game.canvas.width / 2 - 298, game.canvas.height / 2, 596, 149);
        this.showNextLevelButton = false;
        this.dialogueCharacter = new DialogueCharacter();
        this.dialogueCharacter.createDialogue([
            "Je hebt de social media profielen van de dader\ngevonden. Zoek uit of ze hem zelf beschrijven,\nof dat ze gemaakt zijn om jongeren te misleiden.\nElk fout antwoord kost 10 seconden van je tijd.\n\nVeel succes!"
        ]);
    }
    draw(ctx) {
        ctx.drawImage(this.topNavImage, 0, 0, this.game.canvas.width, 74);
        ctx.drawImage(this.logoImage, 10, 10, 54, 54);
        ctx.drawImage(this.searchBarImage, this.game.canvas.width - 650, 10);
        if (!this.showNextLevelButton) {
            ctx.drawImage(this.profilePicImage, this.game.canvas.width / 2 - 48, this.game.canvas.height / 2 - 248, 96, 96);
            ctx.drawImage(this.profilePicLineImage, this.game.canvas.width / 2 - 50, this.game.canvas.height / 2 - 250, 100, 100);
            ctx.fillStyle = 'rgba(64,64,64,1)';
            ctx.lineWidth = 4;
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.fillRect(this.game.canvas.width / 2 - 275, this.game.canvas.height / 2 - 86.5, 550, 173);
            ctx.strokeRect(this.game.canvas.width / 2 - 275, this.game.canvas.height / 2 - 86.5, 550, 173);
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(0,255,0,1)';
            ctx.fillRect(this.game.canvas.width / 2 - 298, this.game.canvas.height / 2 + 200, 298, 149);
            ctx.strokeRect(this.game.canvas.width / 2 - 298, this.game.canvas.height / 2 + 200, 298, 149);
            ctx.fillRect(this.game.canvas.width / 2, this.game.canvas.height / 2 + 200, 298, 149);
            ctx.strokeRect(this.game.canvas.width / 2, this.game.canvas.height / 2 + 200, 298, 149);
            ctx.fillStyle = 'rgba(0,255,0,1)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Echt', this.game.canvas.width / 2 - 149, this.game.canvas.height / 2 + 275);
            ctx.fillText('Nep', this.game.canvas.width / 2 + 149, this.game.canvas.height / 2 + 275);
            ctx.textAlign = "center";
            ctx.font = "20px Arial";
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillStyle = 'rgba(255,255,255,1)';
            ctx.fillText(this.profiles[this.currentProfile].textLine1, this.game.canvas.width / 2, this.game.canvas.height / 2 - 15);
            if (this.profiles[this.currentProfile].textLine2 !== undefined)
                ctx.fillText(this.profiles[this.currentProfile].textLine2, this.game.canvas.width / 2, this.game.canvas.height / 2 + 15);
            if (this.profiles[this.currentProfile].textLine3 !== undefined)
                ctx.fillText(this.profiles[this.currentProfile].textLine3, this.game.canvas.width / 2, this.game.canvas.height / 2 + 45);
        }
        if (this.showNextLevelButton) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(this.game.canvas.width / 2 - 298, this.game.canvas.height / 2, 596, 149);
            ctx.strokeRect(this.game.canvas.width / 2 - 298, this.game.canvas.height / 2, 596, 149);
            ctx.fillStyle = 'rgba(0,255,0,1)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Volgend level', this.game.canvas.width / 2, this.game.canvas.height / 2 + 75);
        }
        this.dialogueCharacter.drawCharacter(ctx, this.game.canvas);
    }
    listen(input) {
        let isPressed = input.GetMousePressed();
        isPressed = this.dialogueCharacter.nextDialogueHandler(isPressed);
        if (isPressed) {
            if (!this.showNextLevelButton && this.fakeButton.checkIfPressed(isPressed)) {
                if (this.profiles[this.currentProfile].fake) {
                    this.dialogueCharacter.createDialogue([
                        "Dat antwoord was correct!"
                    ]);
                    this.setNewProfile();
                }
                else {
                    this.dialogueCharacter.createDialogue([
                        "Dat antwoord was helaas fout. Dat kost je\n10 seconden! Probeer het opnieuw!\n\n" + this.profiles[this.currentProfile].wrongAnswerExplanation
                    ]);
                    GameTime.removeTime(10);
                }
            }
            if (!this.showNextLevelButton && this.realButton.checkIfPressed(isPressed)) {
                if (!this.profiles[this.currentProfile].fake) {
                    this.dialogueCharacter.createDialogue([
                        "Dat antwoord was correct!"
                    ]);
                    this.setNewProfile();
                }
                else {
                    this.dialogueCharacter.createDialogue([
                        "Dat antwoord was helaas fout. Dat kost je\n10 seconden! Probeer het opnieuw!\n\n" + this.profiles[this.currentProfile].wrongAnswerExplanation
                    ]);
                    GameTime.removeTime(10);
                }
            }
            if (this.nextLevelButton.checkIfPressed(isPressed)) {
                if (this.showNextLevelButton) {
                    this.nextScreen = true;
                }
            }
        }
    }
    setNewProfile() {
        if (!(this.currentProfile < this.profiles.length - 1)) {
            this.showNextLevelButton = true;
            return;
        }
        else {
            this.currentProfile++;
        }
        let profilePicImg = new Image();
        profilePicImg.src = this.profiles[this.currentProfile].profileImage;
        this.profilePicImage = profilePicImg;
    }
    adjust(game) {
        if (this.nextScreen)
            game.switchScreen(new DeepFakeScreen(game));
    }
}
class HackGroomerScreen extends GameScreen {
    constructor(game) {
        super(game);
        this.grid = 10;
        this.buttonSize = 50;
        this.gridButton = [];
        this.dialogueCharacter = new DialogueCharacter();
        this.abc = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        this.password = ['deepfake', 'hacking', 'wifi', 'internet', 'computer', 'games', 'socialmedia'];
        this.charactersFound = [];
        GameTime.setTimerPos(true, true);
        this.dialogueCharacter = new DialogueCharacter();
        this.dialogueCharacter.createDialogue([
            'Je werkt voor de overheid om verdachten op te\nsporen. Je hebt informatie gehad over een oudere\nman die het op een 14-jarig meisje heeft gemunt.\nHet is aan jou om de juiste informatie te vinden.',
            'Je gaat nu eerst de computer van de verdachte\nhacken. Probeer letters te vinden die het\nwachtwoord kan bevatten, totdat je het volledige\nwachtwoord hebt. Elke fout kost 3 seconden van\nje tijd.\n\nVeel success!',
        ]);
        this.currentPassword = this.password[Math.floor(Math.random() * (this.password.length - 1))];
        this.startPoint = {
            xPos: (game.canvas.width - (this.buttonSize * this.grid)) / 2,
            yPos: 100
        };
        this.randomizeString();
        for (let y = 0; y < this.grid; y++) {
            this.gridButton[y] = [];
            for (let x = 0; x < this.grid; x++) {
                this.gridButton[y][x] = new UIButton(this.startPoint.xPos + (x * this.buttonSize), this.startPoint.yPos + (y * this.buttonSize), this.buttonSize, this.buttonSize);
            }
        }
    }
    draw(ctx) {
        const barHeight = 50;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.strokeStyle = 'rgba(0,255,0,1)';
        ctx.fillRect(this.startPoint.xPos, this.startPoint.yPos - 70, (this.grid * this.buttonSize), barHeight);
        ctx.strokeRect(this.startPoint.xPos, this.startPoint.yPos - 70, (this.grid * this.buttonSize), barHeight);
        ctx.fillStyle = 'rgba(0,255,0,1)';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillText(this.getPassword(), this.startPoint.xPos + 10, this.startPoint.yPos - 70 + (barHeight / 2));
        let count = 0;
        for (let y = 0; y < this.grid; y++) {
            for (let x = 0; x < this.grid; x++) {
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.strokeStyle = 'rgba(0,255,0,1)';
                ctx.fillRect(this.startPoint.xPos + (x * this.buttonSize), this.startPoint.yPos + (y * this.buttonSize), this.buttonSize, this.buttonSize);
                ctx.strokeRect(this.startPoint.xPos + (x * this.buttonSize), this.startPoint.yPos + (y * this.buttonSize), this.buttonSize, this.buttonSize);
                ctx.fillStyle = 'rgba(0,255,0,1)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.abc[count], this.startPoint.xPos + (x * this.buttonSize) + (this.buttonSize / 2), this.startPoint.yPos + (y * this.buttonSize) + (this.buttonSize / 2));
                if (this.abc.length - 1 == count)
                    count = 0;
                else
                    count++;
            }
        }
        this.dialogueCharacter.drawCharacter(ctx, this.game.canvas);
    }
    getPassword() {
        let dissectPassword = this.currentPassword.split("");
        dissectPassword = dissectPassword.map((passChar) => {
            for (let i = 0; i < this.charactersFound.length; i++) {
                if (passChar === this.charactersFound[i]) {
                    return passChar;
                }
            }
            return '*';
        });
        return dissectPassword.join('');
    }
    randomizeString() {
        for (let i = 0; i < 50; i++) {
            let firstRandomizer = Math.round((this.abc.length - 1) * Math.random());
            let secondRandomizer = Math.round((this.abc.length - 1) * Math.random());
            let temp = this.abc[firstRandomizer];
            this.abc[firstRandomizer] = this.abc[secondRandomizer];
            this.abc[secondRandomizer] = temp;
        }
    }
    listen(input) {
        let isPressed = input.GetMousePressed();
        isPressed = this.dialogueCharacter.nextDialogueHandler(isPressed);
        let count = 0;
        if (isPressed) {
            for (let y = 0; y < this.grid; y++) {
                for (let x = 0; x < this.grid; x++) {
                    if (this.gridButton[y][x].checkIfPressed(isPressed)) {
                        let isDuplicate = false;
                        let isCharacterFound = false;
                        if (this.charactersFound.length > 0)
                            this.charactersFound.forEach((Char) => {
                                if (this.abc[count] === Char) {
                                    isDuplicate = true;
                                    return;
                                }
                            });
                        for (let i = 0; i < this.currentPassword.length; i++) {
                            console.log(this.currentPassword[i], this.abc[count]);
                            if (this.currentPassword[i] === this.abc[count]) {
                                isCharacterFound = true;
                            }
                        }
                        if (!isDuplicate) {
                            this.charactersFound.push(this.abc[count]);
                        }
                        else
                            this.dialogueCharacter.createDialogue(['Deze letter heb je al ingevuld!']);
                        if (!isCharacterFound) {
                            this.dialogueCharacter.createDialogue(['Dit klopt niet, dit kost je -3 seconden!']);
                            GameTime.removeTime(3);
                        }
                        return;
                    }
                    if (this.abc.length - 1 == count)
                        count = 0;
                    else
                        count++;
                }
            }
        }
    }
    adjust(game) {
        if (this.getPassword() == this.currentPassword) {
            game.switchScreen(new FakeProfileScreen(game));
        }
    }
}
class IntroScreen extends GameScreen {
    constructor(game) {
        super(game);
        document.getElementById('body').style.backgroundImage = "url('./assets/images/bg.png')";
        this.startButton = new UIButton(this.game.canvas.width / 2 - 100, this.game.canvas.height - 100, 200, 50);
    }
    draw(ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.strokeStyle = 'rgba(0,255,0,1)';
        ctx.fillRect(this.game.canvas.width / 2 - 100, this.game.canvas.height - 100, 200, 50);
        ctx.strokeRect(this.game.canvas.width / 2 - 100, this.game.canvas.height - 100, 200, 50);
        ctx.fillRect(this.game.canvas.width / 2 - 250, 65, 500, 50);
        ctx.strokeRect(this.game.canvas.width / 2 - 250, 65, 500, 50);
        ctx.textAlign = "center";
        ctx.font = "30px Arial";
        ctx.fillStyle = 'rgba(0,255,0,1)';
        ctx.fillText("Start game", this.game.canvas.width / 2, this.game.canvas.height - 65);
        ctx.fillText("Druk op start om het spel te starten", this.game.canvas.width / 2, 100);
    }
    listen(input) {
        const isPressed = input.GetMousePressed();
        if (isPressed) {
            if (this.startButton.checkIfPressed(isPressed)) {
                this.nextScreen = true;
                GameTime.startTimer();
            }
        }
    }
    adjust(game) {
        if (this.nextScreen) {
            const input = document.getElementById('username');
            if (input.value !== "") {
                input.style.display = "none";
                Game.username = input.value;
                game.switchScreen(new HackGroomerScreen(game));
            }
            else
                this.nextScreen = false;
        }
    }
}
class LostScreen extends GameScreen {
    constructor(game) {
        super(game);
        document.getElementById('body').style.backgroundImage = "";
        document.getElementById('body').style.backgroundImage = "url('./assets/images/GameOver.png')";
        this.dialogueCharacter = new DialogueCharacter();
        this.dialogueCharacter.createDialogue([
            'He! jammer joh.',
            'Je hebt de dader niet te pakken.',
            'Nu ben je ontslagen.',
            'Dan moet je maar doorwerken.'
        ]);
    }
    draw(ctx) {
        this.dialogueCharacter.drawCharacter(ctx, this.game.canvas);
    }
    listen(input) {
        this.dialogueCharacter.nextDialogueHandler(input);
    }
}
//# sourceMappingURL=app.js.map