document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    document.getElementById('user-greeting').textContent = `Hello, ${username || 'Player'}!`;

    const gameConfig = {
        host: username,
        scenario: 'Forest',
        duration: 5,
        playerCount: 2,
        blockCount: 15,
        powerUps: 10,
        livesPerPlayer: 3,
        code: null,
        players: [username]
    };

    // ------------------------ Dropdown de escenario ------------------------
    const scenarioDropdown = document.getElementById('scenarioDropdown');
    const scenarioToggle = document.getElementById('scenarioToggle');
    const scenarioMenu = document.getElementById('scenarioMenu');
    const selectedScenarioImage = document.getElementById('selectedScenarioImage');
    const selectedScenarioName = document.getElementById('selectedScenarioName');

    scenarioToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        scenarioDropdown.classList.toggle('active');
    });

    document.querySelectorAll('.scenario-option').forEach(option => {
        option.addEventListener('click', () => {
            const scenario = option.dataset.scenario;
            const imgSrc = option.querySelector('img').src;
            const scenarioName = option.querySelector('.scenario-name').textContent;

            selectedScenarioImage.src = imgSrc;
            selectedScenarioName.textContent = scenarioName;
            gameConfig.scenario = scenario;

            scenarioDropdown.classList.remove('active');
            updateConfigSummary();
        });
    });

    document.addEventListener('click', () => {
        scenarioDropdown.classList.remove('active');
    });

    // ------------------------ Tabs ------------------------
    const createTab = document.getElementById('create-tab');
    const joinTab = document.getElementById('join-tab');
    const createContent = document.getElementById('create-content');
    const joinContent = document.getElementById('join-content');

    createTab.addEventListener('click', () => switchTab(createTab, createContent, joinTab, joinContent));
    joinTab.addEventListener('click', () => switchTab(joinTab, joinContent, createTab, createContent));

    const switchTab = (activeTab, activeContent, inactiveTab, inactiveContent) => {
        activeTab.classList.add('active');
        inactiveTab.classList.remove('active');
        activeContent.classList.add('active');
        inactiveContent.classList.remove('active');
        clearErrorMessages();
    };

    // ------------------------ Utils ------------------------
    const generateGameCode = () => Math.floor(10000 + Math.random() * 90000).toString();

    const updateConfigSummary = () => {
        const configDiv = document.getElementById('config-details');
        configDiv.innerHTML = `
            <strong>Host:</strong> ${gameConfig.host}<br>
            <strong>Scenario:</strong> ${gameConfig.scenario}<br>
            <strong>Duration:</strong> ${gameConfig.duration} minutes<br>
            <strong>Players:</strong> ${gameConfig.playerCount}<br>
            <strong>Blocks:</strong> ${gameConfig.blockCount}<br>
            <strong>Power-Ups:</strong> ${gameConfig.powerUps}<br>
            <strong>Lives per player:</strong> ${gameConfig.livesPerPlayer}
        `;
    };

    const clearErrorMessages = () => {
        document.getElementById('error-message').textContent = '';
        document.getElementById('join-error-message').textContent = '';
    };

    // ------------------------ Validación código de unión ------------------------
    document.getElementById('gameCodeInput').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
        clearErrorMessages();
    });

    // ------------------------ Crear partida ------------------------
    document.getElementById('createGameBtn').addEventListener('click', async () => {
        clearErrorMessages();

        const playerCount = parseInt(document.getElementById('playerCount').value);
        const blockCount = parseInt(document.getElementById('blockCount').value);
        const lives = parseInt(document.getElementById('livesCount').value);
        const powerUps = parseInt(document.getElementById('powerUps').value);

        if (playerCount < 1 || playerCount > 4) return showError('Player count must be between 1 and 4');
        if (blockCount < 1 || blockCount > 30) return showError('Block count must be between 1 and 30');
        if (lives < 1 || lives > 10) return showError('Lives must be between 1 and 10');
        if (powerUps < 0 || powerUps > 30) return showError('Power-Ups must be between 0 and 30');

        gameConfig.playerCount = playerCount;
        gameConfig.blockCount = blockCount;
        gameConfig.livesPerPlayer = lives;
        gameConfig.powerUps = powerUps;
        gameConfig.duration = parseInt(document.getElementById('gameDuration').value);
        gameConfig.code = generateGameCode();

        const spinner = document.getElementById('createSpinner');
        spinner.style.display = 'block';

        // Mock para test
        const response = {
            ok: true,
            json: async () => ({ ...gameConfig, status: 'waiting' })
        };

        if (!response.ok) return showError('Failed to create game');

        const gameData = await response.json();
        document.getElementById('game-code').textContent = gameData.code;
        document.getElementById('game-code-display').style.display = 'block';

        redirectToLobby(gameData);
        spinner.style.display = 'none';
    });

    // ------------------------ Unirse a partida ------------------------
    document.getElementById('joinGameBtn').addEventListener('click', async () => {
        const code = document.getElementById('gameCodeInput').value.trim();
        const errorEl = document.getElementById('join-error-message');
        const spinner = document.getElementById('joinSpinner');

        if (code.length !== 5) return (errorEl.textContent = 'Enter a valid 5-digit code');

        spinner.style.display = 'block';

        const response = {
            ok: true,
            json: async () => ({
                code,
                scenario: 'Forest',
                duration: 5,
                playerCount: 2,
                blockCount: 15,
                powerUps: 10,
                livesPerPlayer: 3,
                players: ['hostPlayer', username],
                host: 'hostPlayer',
                status: 'waiting'
            })
        };

        if (!response.ok) return (errorEl.textContent = 'Could not join game');

        const gameData = await response.json();
        redirectToLobby(gameData);
        spinner.style.display = 'none';
    });

    const redirectToLobby = (gameData) => {
        sessionStorage.setItem('gameConfig', JSON.stringify(gameData));
        sessionStorage.setItem('username', username);
        window.location.href = '/lobby.html';
    };

    const showError = (msg) => {
        document.getElementById('error-message').textContent = msg;
    };

    // ------------------------ Socket: ENVIAR y ESCUCHAR ------------------------
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.addEventListener('open', () => {
        console.log("Connected to WS");
    });

    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "START") {
            const playerPositions = data.positions;
            sessionStorage.setItem('playerPositions', JSON.stringify(playerPositions));
            window.location.href = "/game.html"; // Inicia juego
        }
    });

    updateConfigSummary();
});
