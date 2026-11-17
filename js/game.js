const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let saveData = JSON.parse(localStorage.getItem('cizGecTR_save')) || {
    money: 0,
    ownedCars: ['sahin'],
    selectedCar: 'sahin',
    ownedNeons: ['none'],
    selectedNeon: 'none',
    upgrades: {
        engine: 0,
        inkMax: 0,
        inkRegen: 0,
        income: 0,
        magnet: 0,
        grip: 0
    },
    quests: INITIAL_QUESTS,
    lastDailyClaim: 0
};

if (!saveData.quests) saveData.quests = INITIAL_QUESTS;
if (!saveData.ownedNeons) saveData.ownedNeons = ['none'];
if (!saveData.selectedNeon) saveData.selectedNeon = 'none';

function saveGame() {
    localStorage.setItem('cizGecTR_save', JSON.stringify(saveData));
    updateHUD();
}

let isPlaying = false;
let currentMap = MAPS[0];
let cameraX = 0;
let runDistance = 0;
let runEarned = 0;

let car = {
    x: 150,
    y: 200,
    vx: 0,
    vy: 0,
    width: 64,
    height: 28,
    angle: 0,
    onGround: false,
    cumulativeRotation: 0
};

let platforms = [];
let coins = [];
let drawnLines = [];
let currentStroke = null;
let isDrawing = false;

let ink = 100;
let maxInk = 100;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function getCarStats() {
    const baseCar = CARS.find(c => c.id === saveData.selectedCar) || CARS[0];
    return {
        ...baseCar,
        finalSpeed: (baseCar.speed + saveData.upgrades.engine * 0.35) * currentMap.speedMult,
        finalClimb: baseCar.climbPower + (saveData.upgrades.grip * 0.06) + (saveData.upgrades.engine * 0.03),
        finalMaxInk: 280 + baseCar.inkBonus + (saveData.upgrades.inkMax * 65),
        finalInkRegen: 0.45 + (saveData.upgrades.inkRegen * 0.14),
        finalMoneyMult: baseCar.moneyBonus * currentMap.moneyMult * (1 + saveData.upgrades.income * 0.25),
        magnetRange: 45 + (saveData.upgrades.magnet * 35)
    };
}

function checkDailyRewardStatus() {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const dailyBox = document.getElementById('daily-reward-box');
    if (now - (saveData.lastDailyClaim || 0) > oneDay) {
        dailyBox.classList.remove('hidden');
    } else {
        dailyBox.classList.add('hidden');
    }
}

document.getElementById('btn-claim-daily').onclick = () => {
    saveData.lastDailyClaim = Date.now();
    addMoney(1000);
    SoundFX.playBuy();
    document.getElementById('daily-reward-box').classList.add('hidden');
    saveGame();
    showPopup("🎁 Günlük Ödül: +1.000 ₺ Alındı!");
};

function initRun() {
    const mapIdx = parseInt(document.getElementById('select-map').value);
    currentMap = MAPS[mapIdx];
    document.getElementById('map-name').innerText = currentMap.name;

    const stats = getCarStats();
    maxInk = stats.finalMaxInk;
    ink = maxInk;

    car = {
        x: 150,
        y: canvas.height * 0.5,
        vx: 0,
        vy: 0,
        width: 64,
        height: 28,
        angle: 0,
        onGround: false,
        cumulativeRotation: 0
    };

    cameraX = 0;
    runDistance = 0;
    runEarned = 0;
    platforms = [];
    coins = [];
    drawnLines = [];

    platforms.push({
        x: -100,
        y: canvas.height * 0.65,
        width: 750,
        passed: true
    });

    generateWorldAhead();
    isPlaying = true;
    document.getElementById('overlay-screen').classList.add('hidden');
    document.getElementById('run-summary').classList.add('hidden');
    document.getElementById('btn-summary-garage').classList.add('hidden');
}

function generateWorldAhead() {
    let lastPlat = platforms[platforms.length - 1];
    while (lastPlat.x + lastPlat.width < cameraX + canvas.width * 2) {
        const gap = currentMap.gapMin + Math.random() * (currentMap.gapMax - currentMap.gapMin);
        const width = 260 + Math.random() * 340;
        const heightShift = (Math.random() - 0.48) * 110;
        let nextY = lastPlat.y + heightShift;
        nextY = Math.max(canvas.height * 0.35, Math.min(canvas.height * 0.82, nextY));

        const newPlat = {
            x: lastPlat.x + lastPlat.width + gap,
            y: nextY,
            width: width,
            passed: false
        };
        platforms.push(newPlat);

        const coinCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < coinCount; i++) {
            coins.push({
                x: lastPlat.x + lastPlat.width + (gap * (i + 1) / (coinCount + 1)),
                y: Math.min(lastPlat.y, nextY) - 45 - Math.sin(i) * 25,
                value: Math.round(15 * getCarStats().finalMoneyMult),
                collected: false
            });
        }

        lastPlat = newPlat;
    }

    platforms = platforms.filter(p => p.x + p.width > cameraX - 500);
    drawnLines = drawnLines.filter(l => Math.max(l.x1, l.x2) > cameraX - 500);
    coins = coins.filter(c => !c.collected && c.x > cameraX - 300);
}

function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) + cameraX,
        y: clientY - rect.top
    };
}

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('touchstart', startDraw, { passive: false });
window.addEventListener('mousemove', moveDraw);
window.addEventListener('touchmove', moveDraw, { passive: false });
window.addEventListener('mouseup', endDraw);
window.addEventListener('touchend', endDraw);

function startDraw(e) {
    if (!isPlaying || ink <= 5) return;
    if (e.cancelable) e.preventDefault();
    isDrawing = true;
    currentStroke = getPointerPos(e);
}

function moveDraw(e) {
    if (!isDrawing || !isPlaying || !currentStroke) return;
    if (e.cancelable) e.preventDefault();
    const pos = getPointerPos(e);
    const dx = pos.x - currentStroke.x;
    const dy = pos.y - currentStroke.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 8 && ink >= dist * 0.25) {
        drawnLines.push({
            x1: currentStroke.x,
            y1: currentStroke.y,
            x2: pos.x,
            y2: pos.y
        });
        ink = Math.max(0, ink - dist * 0.25);
        currentStroke = pos;
    }
}

function endDraw() {
    isDrawing = false;
    currentStroke = null;
}

function update() {
    if (!isPlaying) return;

    const stats = getCarStats();

    if (!isDrawing && ink < maxInk) {
        ink = Math.min(maxInk, ink + stats.finalInkRegen);
    }

    car.vy += 0.42;
    if (car.vx < stats.finalSpeed) {
        car.vx += 0.18;
    } else {
        car.vx *= currentMap.friction;
    }

    car.x += car.vx;
    car.y += car.vy;

    const wasOnGround = car.onGround;
    car.onGround = false;
    const wheelRadius = 11;

    for (let p of platforms) {
        if (car.x + 22 > p.x && car.x - 22 < p.x + p.width) {
            const bottomY = car.y + 14 + wheelRadius;
            if (bottomY >= p.y && bottomY <= p.y + 28 && car.vy >= 0) {
                car.y = p.y - 14 - wheelRadius;
                car.vy = 0;
                car.onGround = true;
                car.angle *= 0.8;
            }
        }
        if (!p.passed && car.x > p.x + 20) {
            p.passed = true;
            const bonus = Math.round(25 * stats.finalMoneyMult);
            addMoney(bonus);
            updateQuestProgress('q2', 1);
        }
    }

    let highestSurfaceY = null;
    let slopeAngle = 0;

    for (let l of drawnLines) {
        const minX = Math.min(l.x1, l.x2) - 10;
        const maxX = Math.max(l.x1, l.x2) + 10;

        if (car.x >= minX && car.x <= maxX) {
            const dx = l.x2 - l.x1;
            if (Math.abs(dx) < 1) continue;
            const t = Math.max(0, Math.min(1, (car.x - l.x1) / dx));
            const lineY = l.y1 + t * (l.y2 - l.y1);
            const bottomY = car.y + 14 + wheelRadius;

            if (bottomY >= lineY - 6 && bottomY <= lineY + 26 && car.vy >= -2) {
                if (highestSurfaceY === null || lineY < highestSurfaceY) {
                    highestSurfaceY = lineY;
                    slopeAngle = Math.atan2(l.y2 - l.y1, l.x2 - l.x1);
                    if (slopeAngle > Math.PI / 2) slopeAngle -= Math.PI;
                    if (slopeAngle < -Math.PI / 2) slopeAngle += Math.PI;
                }
            }
        }
    }

    if (highestSurfaceY !== null) {
        car.y = highestSurfaceY - 14 - wheelRadius;
        car.vy = 0;
        car.onGround = true;
        car.angle += (slopeAngle - car.angle) * 0.25;

        if (slopeAngle < -0.15) {
            car.vx = Math.max(1.5, car.vx - Math.abs(slopeAngle) * (1.2 - stats.finalClimb));
        } else if (slopeAngle > 0.15) {
            car.vx += Math.sin(slopeAngle) * 0.35;
        }
    } else if (!car.onGround) {
        car.angle += 0.035;
        car.cumulativeRotation += 0.035;
    }

    if (!wasOnGround && car.onGround) {
        if (Math.abs(car.cumulativeRotation) > Math.PI * 1.8) {
            const flipReward = Math.round(400 * stats.finalMoneyMult);
            addMoney(flipReward);
            showPopup(`🤸‍♂️ SÜPER TAKLA! +${flipReward} ₺`);
            SoundFX.playCoin();
            updateQuestProgress('q3', 1);
        }
        car.cumulativeRotation = 0;
    }

    for (let c of coins) {
        if (c.collected) continue;
        const dist = Math.hypot(car.x - c.x, car.y - c.y);
        if (dist < stats.magnetRange) {
            c.x += (car.x - c.x) * 0.18;
            c.y += (car.y - c.y) * 0.18;
        }
        if (dist < 38) {
            c.collected = true;
            addMoney(c.value);
            SoundFX.playCoin();
        }
    }

    cameraX = car.x - canvas.width * 0.25;
    const newDist = Math.floor((car.x - 150) / 25);
    if (newDist > runDistance) {
        const diff = newDist - runDistance;
        runDistance = newDist;
        addMoney(Math.ceil(diff * 0.5 * stats.finalMoneyMult));
        updateQuestProgress('q1', diff);
    }

    generateWorldAhead();
    updateHUD();

    if (car.y > canvas.height + 80) {
        gameOver();
    }
}

function addMoney(amount) {
    saveData.money += amount;
    runEarned += amount;
}

function showPopup(text) {
    const pop = document.getElementById('floating-popup');
    pop.innerText = text;
    pop.classList.remove('hidden');
    setTimeout(() => pop.classList.add('hidden'), 1200);
}

function updateQuestProgress(qId, amount) {
    const q = saveData.quests.find(item => item.id === qId);
    if (q && !q.completed) {
        q.progress += amount;
        if (q.progress >= q.target) {
            q.progress = q.target;
            q.completed = true;
            addMoney(q.reward);
            showPopup(`🏆 GÖREV TAMAMLANDI: +${q.reward} ₺`);
            SoundFX.playBuy();
        }
        saveGame();
    }
}

function gameOver() {
    isPlaying = false;
    SoundFX.playCrash();
    saveGame();

    document.getElementById('overlay-title').innerText = "ARABA UÇURUMA DÜŞTÜ!";
    document.getElementById('overlay-desc').innerText = "Garajdan motoru güçlendir veya yeni araç al!";
    document.getElementById('run-summary').classList.remove('hidden');
    document.getElementById('btn-summary-garage').classList.remove('hidden');
    document.getElementById('summary-dist').innerText = `${runDistance} m`;
    document.getElementById('summary-earned').innerText = `+${runEarned.toLocaleString('tr-TR')} ₺`;
    document.getElementById('btn-start').innerText = "TEKRAR DENE";
    document.getElementById('overlay-screen').classList.remove('hidden');
}

function draw() {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, currentMap.skyTop);
    grad.addColorStop(1, currentMap.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    for (let i = 0; i < 8; i++) {
        const hillX = ((i * 350 - cameraX * 0.2) % (canvas.width + 400));
        ctx.beginPath();
        ctx.moveTo(hillX - 200, canvas.height);
        ctx.lineTo(hillX + 100, canvas.height * 0.45);
        ctx.lineTo(hillX + 400, canvas.height);
        ctx.fill();
    }

    ctx.save();
    ctx.translate(-cameraX, 0);

    for (let p of platforms) {
        ctx.fillStyle = currentMap.groundColor;
        ctx.fillRect(p.x, p.y, p.width, canvas.height - p.y + 100);

        ctx.fillStyle = currentMap.grassColor;
        ctx.fillRect(p.x, p.y, p.width, 12);
    }

    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let l of drawnLines) {
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
    }
    ctx.stroke();

    for (let c of coins) {
        if (c.collected) continue;
        ctx.fillStyle = "#10b981";
        ctx.strokeStyle = "#ecfdf5";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(c.x - 16, c.y - 10, 32, 20, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("₺", c.x, c.y + 5);
    }

    drawCar();
    ctx.restore();
}

function drawCar() {
    const carData = CARS.find(c => c.id === saveData.selectedCar) || CARS[0];
    const neonData = NEONS.find(n => n.id === saveData.selectedNeon) || NEONS[0];

    ctx.save();
    ctx.translate(car.x, car.y);

    // RGB Neon Alt Taban Aydınlatması
    if (neonData.id !== 'none') {
        let neonColor = neonData.color;
        if (neonData.id === 'rgb') {
            const hue = (Date.now() / 5) % 360;
            neonColor = `hsl(${hue}, 100%, 50%)`;
        }

        ctx.shadowBlur = 22;
        ctx.shadowColor = neonColor;
        ctx.strokeStyle = neonColor;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.roundRect(-30, 16, 60, 6, 4);
        ctx.stroke();
        ctx.shadowBlur = 0; // Gölgeyi sıfırla
    }

    ctx.rotate(car.angle);

    ctx.fillStyle = carData.color;
    ctx.beginPath();
    if (carData.bodyType === "van" || carData.bodyType === "wagon") {
        ctx.roundRect(-32, -16, 64, 28, 6);
    } else if (carData.bodyType === "suv") {
        ctx.roundRect(-32, -15, 64, 26, 7);
        ctx.fillRect(-18, -24, 38, 12);
    } else {
        ctx.roundRect(-32, -10, 64, 20, 6);
        ctx.beginPath();
        ctx.moveTo(-18, -10);
        ctx.lineTo(-8, -22);
        ctx.lineTo(14, -22);
        ctx.lineTo(24, -10);
        ctx.fill();
    }
    ctx.fill();

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(-6, -19, 18, 9);

    ctx.fillStyle = "#fef08a";
    ctx.fillRect(28, -6, 5, 6);

    ctx.fillStyle = "#111827";
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 3;
    [-20, 20].forEach(wx => {
        ctx.beginPath();
        ctx.arc(wx, 14, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    });

    ctx.restore();
}

function updateHUD() {
    document.getElementById('money-display').innerText = `${Math.floor(saveData.money).toLocaleString('tr-TR')} ₺`;
    document.getElementById('distance-display').innerText = `${runDistance} m`;
    document.getElementById('ink-bar-fill').style.width = `${(ink / maxInk) * 100}%`;
    document.getElementById('garage-money-display').innerText = `${Math.floor(saveData.money).toLocaleString('tr-TR')} ₺`;
}

function renderGarage() {
    updateHUD();
    
    // 1. Arabalar Sekmesi
    const carsGrid = document.getElementById('cars-grid');
    carsGrid.innerHTML = '';
    CARS.forEach(c => {
        const owned = saveData.ownedCars.includes(c.id);
        const equipped = saveData.selectedCar === c.id;
        const canAfford = saveData.money >= c.price;

        const card = document.createElement('div');
        card.className = `item-card ${equipped ? 'selected' : ''}`;
        card.innerHTML = `
            <div>
                <div class="item-title">${c.name}</div>
                <div class="car-preview">
                    <div style="width:60px;height:22px;background:${c.color};border-radius:6px;position:relative;">
                        <div style="width:14px;height:14px;background:#111;border:2px solid #999;border-radius:50%;position:absolute;bottom:-6px;left:6px;"></div>
                        <div style="width:14px;height:14px;background:#111;border:2px solid #999;border-radius:50%;position:absolute;bottom:-6px;right:6px;"></div>
                    </div>
                </div>
                <div class="item-desc">${c.desc}</div>
                <div class="item-stats">Hız: ${c.speed} | Gelir: ${c.moneyBonus}x ₺</div>
            </div>
            <button class="action-btn ${equipped ? 'btn-equipped' : (owned ? 'btn-select' : 'btn-buy')}"
                ${!owned && !canAfford ? 'disabled' : ''}>
                ${equipped ? 'SEÇİLİ ARAÇ' : (owned ? 'ARACI SEÇ' : `SATIN AL (${c.price.toLocaleString('tr-TR')} ₺)`)}
            </button>
        `;
        card.querySelector('button').onclick = () => {
            if (equipped) return;
            if (owned) {
                saveData.selectedCar = c.id;
                SoundFX.playCoin();
            } else if (saveData.money >= c.price) {
                saveData.money -= c.price;
                saveData.ownedCars.push(c.id);
                saveData.selectedCar = c.id;
                SoundFX.playBuy();
            }
            saveGame();
            renderGarage();
        };
        carsGrid.appendChild(card);
    });

    // 2. Geliştirmeler Sekmesi
    const upgradesGrid = document.getElementById('upgrades-grid');
    upgradesGrid.innerHTML = '';
    UPGRADES.forEach(u => {
        const lvl = saveData.upgrades[u.id] || 0;
        const isMax = lvl >= u.maxLevel;
        const price = Math.round(u.basePrice * Math.pow(u.priceMult, lvl));
        const canAfford = saveData.money >= price;

        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div>
                <div class="item-title">${u.name} (Sv. ${lvl}/${u.maxLevel})</div>
                <div class="item-desc">${u.desc}</div>
            </div>
            <button class="action-btn btn-buy" ${isMax || !canAfford ? 'disabled' : ''}>
                ${isMax ? 'MAKSİMUM SEVİYE' : `GELİŞTİR (${price.toLocaleString('tr-TR')} ₺)`}
            </button>
        `;
        card.querySelector('button').onclick = () => {
            if (!isMax && saveData.money >= price) {
                saveData.money -= price;
                saveData.upgrades[u.id] = lvl + 1;
                SoundFX.playBuy();
                saveGame();
                renderGarage();
            }
        };
        upgradesGrid.appendChild(card);
    });

    // 3. RGB Neon Sekmesi
    const neonsGrid = document.getElementById('neons-grid');
    neonsGrid.innerHTML = '';
    NEONS.forEach(n => {
        const owned = saveData.ownedNeons.includes(n.id);
        const equipped = saveData.selectedNeon === n.id;
        const canAfford = saveData.money >= n.price;

        const card = document.createElement('div');
        card.className = `item-card ${equipped ? 'selected' : ''}`;
        card.innerHTML = `
            <div>
                <div class="item-title">${n.name}</div>
                <div class="car-preview">
                    <div style="width:40px;height:6px;background:${n.color === 'rgb' ? 'linear-gradient(90deg, red, green, blue)' : (n.color || '#444')};box-shadow:0 0 10px ${n.color || '#000'};border-radius:4px;"></div>
                </div>
                <div class="item-desc">Aracın altından parlayan göz alıcı alt taban aydınlatması.</div>
            </div>
            <button class="action-btn ${equipped ? 'btn-equipped' : (owned ? 'btn-select' : 'btn-buy')}"
                ${!owned && !canAfford ? 'disabled' : ''}>
                ${equipped ? 'SEÇİLİ NEON' : (owned ? 'NEONU SEÇ' : `SATIN AL (${n.price.toLocaleString('tr-TR')} ₺)`)}
            </button>
        `;
        card.querySelector('button').onclick = () => {
            if (equipped) return;
            if (owned) {
                saveData.selectedNeon = n.id;
                SoundFX.playCoin();
            } else if (saveData.money >= n.price) {
                saveData.money -= n.price;
                saveData.ownedNeons.push(n.id);
                saveData.selectedNeon = n.id;
                SoundFX.playBuy();
            }
            saveGame();
            renderGarage();
        };
        neonsGrid.appendChild(card);
    });

    // 4. Görevler Sekmesi
    const questsGrid = document.getElementById('quests-grid');
    questsGrid.innerHTML = '';
    saveData.quests.forEach(q => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div>
                <div class="item-title">${q.title}</div>
                <div class="item-desc">${q.desc}</div>
                <div class="item-stats">İlerleme: ${q.progress} / ${q.target}</div>
            </div>
            <button class="action-btn ${q.completed ? 'btn-equipped' : 'btn-select'}" disabled>
                ${q.completed ? 'TAMAMLANDI (+ ' + q.reward.toLocaleString('tr-TR') + ' ₺)' : 'ÖDÜL: ' + q.reward.toLocaleString('tr-TR') + ' ₺'}
            </button>
        `;
        questsGrid.appendChild(card);
    });
}

document.getElementById('btn-open-gacha').onclick = () => {
    const cost = 1500;
    const resEl = document.getElementById('gacha-result');
    if (saveData.money < cost) {
        resEl.innerText = "Yeterli Türk Liran yok! Biraz daha oyna.";
        return;
    }
    saveData.money -= cost;
    SoundFX.playBuy();

    const roll = Math.random();
    if (roll < 0.5) {
        const cashWin = 2000 + Math.floor(Math.random() * 3000);
        saveData.money += cashWin;
        resEl.innerText = `🎉 Şansına Büyük İkramiye Çıktı: +${cashWin.toLocaleString('tr-TR')} ₺!`;
    } else if (roll < 0.85) {
        const cashWin = 1000;
        saveData.money += cashWin;
        resEl.innerText = `🎁 Teselli İkramiyesi: +${cashWin.toLocaleString('tr-TR')} ₺ kazandın!`;
    } else {
        const lockedCars = CARS.filter(c => !saveData.ownedCars.includes(c.id));
        if (lockedCars.length > 0) {
            const luckyCar = lockedCars[Math.floor(Math.random() * lockedCars.length)];
            saveData.ownedCars.push(luckyCar.id);
            resEl.innerText = `🌟 MÜTHİŞ! Sandıktan Ücretsiz '${luckyCar.name}' Çıktı!`;
        } else {
            saveData.money += 5000;
            resEl.innerText = `🔥 Tüm arabalar zaten sende! +5.000 ₺ nakit bonus!`;
        }
    }
    saveGame();
    renderGarage();
};

document.getElementById('btn-start').onclick = initRun;
document.getElementById('btn-garage').onclick = openGarage;
document.getElementById('btn-summary-garage').onclick = openGarage;

function openGarage() {
    isPlaying = false;
    renderGarage();
    document.getElementById('garage-modal').classList.remove('hidden');
    document.getElementById('overlay-screen').classList.add('hidden');
}

document.getElementById('btn-close-garage').onclick = () => {
    document.getElementById('garage-modal').classList.add('hidden');
    document.getElementById('overlay-screen').classList.remove('hidden');
};

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    };
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

checkDailyRewardStatus();
updateHUD();
gameLoop();
