document.addEventListener('DOMContentLoaded', () => {
    const gameData = JSON.parse(sessionStorage.getItem('gameConfig'));
    const username = sessionStorage.getItem('username');

    if (!gameData || !username) {
        alert('No se encontraron datos del juego. Redirigiendo a la página principal.');
        window.location.href = '/';
        return;
    }

    // Mostrar info del juego
    document.getElementById('scenario-display').textContent = gameData.scenario;
    document.getElementById('player-count').textContent = gameData.playerCount;
    document.getElementById('duration').textContent = gameData.duration;
    document.getElementById('block-count').textContent = gameData.blockCount;
    document.getElementById('lives-count').textContent = gameData.livesPerPlayer;
    document.getElementById('game-title').textContent = `Game ${gameData.code} Lobby`;

    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';
    gameData.players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player === gameData.host ? `${player} (Host)` : player;
        playersList.appendChild(li);
    });

    if (username === gameData.host) {
        const startBtn = document.getElementById('startBattleBtn');
        startBtn.style.display = 'block';
        startBtn.addEventListener('click', () => {
            startBattle(gameData);
        });
    }

    const socket = new SockJS("/bomberman-ws");
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
        stompClient.subscribe(`/topic/game/${gameData.code}`, (msg) => {
            const data = JSON.parse(msg.body);
            console.log("Iniciando juego:", data);
            localStorage.setItem("gameCode", data.code);
            localStorage.setItem("players", JSON.stringify(data.players));
            window.location.href = `/play?code=${data.code}&user=${username}`;
        });
    });

    const startBattle = (config) => {
        const spinner = document.getElementById('loadingSpinner');
        const startBtn = document.getElementById('startBattleBtn');
        startBtn.style.display = 'none';
        spinner.style.display = 'block';
        document.getElementById('game-status').textContent = 'Iniciando partida...';

        // Simulación de generación de mapa
        const gameMap = new BombermanMap({
            size: 15,
            blockCount: config.blockCount,
            playerCount: config.playerCount,
            powerUpPercentage: 0.1
        }).generate();

        gameMap.printToConsole();

        // ✅ Enviar al backend para que notifique a todos
        stompClient.send("/app/start", {}, JSON.stringify({ gameCode: config.code }));
    };
});

class BombermanMap {
    constructor(config) {
        this.size = config.size || 15;
        this.blockCount = config.blockCount || 30;
        this.playerCount = config.playerCount || 2;
        this.powerUpPercentage = config.powerUpPercentage || 0.1;
        this.map = Array(this.size).fill().map(() => Array(this.size).fill(' '));
    }

    generate() {
        this.addBorders();
        this.addFixedBlocks();
        this.addDestructibleBlocks();
        this.addPlayers();
        this.addPowerUps();
        return this;
    }

    addBorders() {
        for (let i = 0; i < this.size; i++) {
            this.map[0][i] = 'X';
            this.map[this.size - 1][i] = 'X';
            this.map[i][0] = 'X';
            this.map[i][this.size - 1] = 'X';
        }
    }

    addFixedBlocks() {
        for (let i = 2; i < this.size - 2; i += 2) {
            for (let j = 2; j < this.size - 2; j += 2) {
                this.map[i][j] = 'X';
            }
        }
    }

    addDestructibleBlocks() {
        let placed = 0;
        const max = Math.min(this.blockCount, 100);
        while (placed < max) {
            const x = this.getRandomPosition();
            const y = this.getRandomPosition();
            if (this.map[y][x] === ' ') {
                this.map[y][x] = '#';
                placed++;
            }
        }
    }

    addPlayers() {
        const positions = [
            [1, 1],
            [1, this.size - 2],
            [this.size - 2, 1],
            [this.size - 2, this.size - 2]
        ];
        for (let i = 0; i < Math.min(this.playerCount, 4); i++) {
            const [x, y] = positions[i];
            this.map[y][x] = 'P';
        }
    }

    addPowerUps() {
        const total = Math.floor(this.blockCount * this.powerUpPercentage);
        let placed = 0;
        while (placed < total) {
            const x = this.getRandomPosition();
            const y = this.getRandomPosition();
            if (this.map[y][x] === '#') {
                this.map[y][x] = '!';
                placed++;
            }
        }
    }

    getRandomPosition() {
        return Math.floor(Math.random() * (this.size - 2)) + 1;
    }

    printToConsole() {
        const legend = "Leyenda: X - Indestructible | # - Destructible | ! - PowerUp | P - Jugador";
        console.log(legend);
        console.log("=".repeat(legend.length));
        this.map.forEach(row => console.log(row.join(' ')));
        console.log(`\nTamaño: ${this.size}x${this.size}`);
        console.log(`Bloques destructibles: ${this.blockCount}`);
        console.log(`Jugadores: ${this.playerCount}`);
        console.log(`Power-ups: ${Math.floor(this.blockCount * this.powerUpPercentage)}`);
    }

    getMap() {
        return this.map;
    }
}

