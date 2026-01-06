// ===== Estado del Juego =====
		let gameState = {
			usedCerebro: [],
			usedPincel: [],
			usedMimica: [],
			usedVentajas: [],
			usedDesventajas: []
		};

		// ===== Inicialización =====
		function initGame() {
			// Cargar estado desde localStorage
			const savedState = localStorage.getItem('peepsGameState');
			if (savedState) {
				gameState = JSON.parse(savedState);
			}
		}

		// ===== Guardar Estado =====
		function saveState() {
			localStorage.setItem('peepsGameState', JSON.stringify(gameState));
		}

		// ===== Función para voltear cartas =====
		function flipCard(type) {
			const card = document.getElementById(`card-${type}`);
			const back = document.getElementById(`back-${type}`);

			// Si la carta ya está volteada, devolverla
			if (card.classList.contains('flipped')) {
				card.classList.remove('flipped');
				return;
			}

			// Voltear la carta
			card.classList.add('flipped');

			// Obtener contenido según el tipo
			let content = '';
			switch (type) {
				case 'pregunta':
					content = getRandomItem('cerebro', 'usedCerebro', 'pregunta');
					break;
				case 'dibuja':
					content = getRandomItem('pincel', 'usedPincel', 'Dibuja');
					break;
				case 'mimica':
				const mimicaData = getRandomMimica();
				if (typeof mimicaData === 'string') {
					back.innerHTML = mimicaData;
				} else {
					document.getElementById('nombre-mimica').textContent = mimicaData.nombre;
					document.getElementById('texto-ejemplo').textContent = mimicaData.ejemplo;
					const ejemploContainer = document.getElementById('ejemplo-container');
					ejemploContainer.classList.add('hidden');
					const btnEjemplo = ejemploContainer.querySelector('.btn-ejemplo');
					if (btnEjemplo) btnEjemplo.textContent = 'Dame un ejemplo';
					saveState();
					return;
				}
				break;
				case 'ventaja':
					content = getRandomVentaja();
					break;
				case 'desventaja':
					content = getRandomDesventaja();
					break;
			}

			// Actualizar el contenido del reverso
			back.innerHTML = content;

			// Guardar estado
			saveState();
		}

		// ===== Obtener elemento aleatorio sin repetición =====
		function getRandomItem(dbKey, usedKey, categoryName) {
			const available = database[dbKey].filter((item, index) =>
				!gameState[usedKey].includes(index)
			);

			if (available.length === 0) {
				return `Todas las cartas de ${categoryName} usadas.`;
			}

			// Seleccionar uno aleatorio
			const randomItem = available[Math.floor(Math.random() * available.length)];
			const originalIndex = database[dbKey].indexOf(randomItem);

			// Marcar como usado
			gameState[usedKey].push(originalIndex);

			return randomItem;
		}

	// ===== Obtener mímica aleatoria =====
	function getRandomMimica() {
		const available = database.mimica.filter((item, index) =>
			!gameState.usedMimica.includes(index)
		);

		if (available.length === 0) {
			return 'Todas las cartas de Mímica usadas.';
		}

		const randomItem = available[Math.floor(Math.random() * available.length)];
		const originalIndex = database.mimica.indexOf(randomItem);
		gameState.usedMimica.push(originalIndex);

		return randomItem;
	}

	// ===== Obtener ventaja aleatoria =====
	function getRandomVentaja() {
		const available = database.ventajas.filter((item, index) =>
			!gameState.usedVentajas.includes(index)
		);

		if (available.length === 0) {
			return 'Todas las cartas de Ventaja usadas.';
		}

		const randomItem = available[Math.floor(Math.random() * available.length)];
		const originalIndex = database.ventajas.indexOf(randomItem);
		gameState.usedVentajas.push(originalIndex);

		return randomItem.text;
	}

	// ===== Obtener desventaja aleatoria =====
	function getRandomDesventaja() {
		const available = database.desventajas.filter((item, index) =>
			!gameState.usedDesventajas.includes(index)
		);

		if (available.length === 0) {
			return 'Todas las cartas de Desventaja usadas.';
		}

		const randomItem = available[Math.floor(Math.random() * available.length)];
		const originalIndex = database.desventajas.indexOf(randomItem);
		gameState.usedDesventajas.push(originalIndex);

		let html = randomItem.text;

		// Si tiene inmunidad, agregar botón
		if (randomItem.immunity) {
			html += `<br><button class="immunity-btn" onclick="applyImmunity('${randomItem.immunity}', '${randomItem.msgImmune}')">¿Está ${randomItem.immunity}?</button>`;
		}

		return html;
	}

	// ===== Mostrar ejemplo de mímica =====
	function mostrarEjemplo() {
		const textoEjemplo = document.getElementById('texto-ejemplo');
		const cardBack = document.getElementById('back-mimica');
		
		textoEjemplo.classList.toggle('hidden');
		
		// Añadir clase visible al card-back para permitir overflow
		if (!textoEjemplo.classList.contains('hidden')) {
			cardBack.classList.add('visible');
		} else {
			cardBack.classList.remove('visible');
		}
	}

	// ===== Aplicar inmunidad =====
	function applyImmunity(immuneName, message) {
		const back = document.getElementById('back-desventaja');
		back.innerHTML = message;
		showStatus(`${immuneName} salvó la situación!`);
	}

	// ===== Lanzar dado con animación =====
	function rollDice() {
		const btn = document.getElementById('dice-btn');

		// Evitar múltiples clics
		if (btn.classList.contains('rolling')) {
			return;
		}

		btn.classList.add('rolling');

		let counter = 0;
		const intervalTime = 50;
		const totalTime = 1000;
		const iterations = totalTime / intervalTime;

		// Animación de cambio rápido de números
		const interval = setInterval(() => {
			btn.textContent = Math.floor(Math.random() * 6) + 1;
			counter++;

			if (counter >= iterations) {
				clearInterval(interval);

				// Número final
				const finalNumber = Math.floor(Math.random() * 6) + 1;
				btn.textContent = finalNumber;

				// Remover animación de rolling y añadir impacto
				btn.classList.remove('rolling');
				btn.classList.add('impact');

				// Mostrar mensaje
				showStatus(`🎲 Sacaste un ${finalNumber}!`);

				// Voltear todas las cartas a su estado inicial
				const allCards = document.querySelectorAll('.card');
				allCards.forEach(card => {
					card.classList.remove('flipped');
				});

				// Remover impacto después de la animación
				setTimeout(() => {
					btn.classList.remove('impact');
				}, 300);
			}
		}, intervalTime);
	}

		// ===== Mostrar mensaje de estado =====
		function showStatus(message) {
			const statusMsg = document.getElementById('status-message');
			statusMsg.textContent = message;
			statusMsg.classList.add('show');

			setTimeout(() => {
				statusMsg.classList.remove('show');
			}, 3000);
		}

		// ===== Mostrar reglas =====
		function showRules() {
			document.getElementById('rules-modal').classList.add('active');
		}

		// ===== Cerrar reglas =====
		function closeRules() {
			document.getElementById('rules-modal').classList.remove('active');
		}

		// ===== Nueva partida =====
		function newGame() {
			if (confirm('¿Estás seguro de que quieres comenzar una nueva partida? Se perderá el progreso actual.')) {
				// Limpiar localStorage
				localStorage.removeItem('peepsGameState');

				// Resetear estado
				gameState = {
					usedCerebro: [],
					usedPincel: [],
					usedMimica: [],
					usedVentajas: [],
					usedDesventajas: []
				};

				// Resetear todas las cartas
				const cards = document.querySelectorAll('.card');
				cards.forEach(card => {
					card.classList.remove('flipped');
				});

// Resetar textos
				document.getElementById('back-pregunta').textContent = 'Toca para comenzar';
				document.getElementById('back-dibuja').textContent = 'Toca para comenzar';
				document.getElementById('back-ventaja').textContent = 'Toca para comenzar';
				document.getElementById('back-desventaja').textContent = 'Toca para comenzar';
				
				// Resetear mímica con estructura especial
				const nombreMimica = document.getElementById('nombre-mimica');
				const textoEjemplo = document.getElementById('texto-ejemplo');
				const ejemploContainer = document.getElementById('ejemplo-container');
				if (nombreMimica) nombreMimica.textContent = '...';
				if (textoEjemplo) textoEjemplo.textContent = '';
				if (ejemploContainer) {
					ejemploContainer.classList.add('hidden');
					const btnEjemplo = ejemploContainer.querySelector('.btn-ejemplo');
					if (btnEjemplo) btnEjemplo.textContent = 'Dame un ejemplo';
				}

				showStatus('¡Nueva partida iniciada!');
			}
		}

		// ===== Cerrar modal al hacer clic fuera =====
		document.getElementById('rules-modal').addEventListener('click', function (e) {
			if (e.target === this) {
				closeRules();
			}
		});

		// ===== Inicializar el juego al cargar =====
		initGame();
