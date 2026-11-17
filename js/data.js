const MAPS = [
    {
        id: 0,
        name: "İstanbul Boğazı",
        skyTop: "#1e3a8a",
        skyBottom: "#60a5fa",
        groundColor: "#374151",
        grassColor: "#10b981",
        moneyMult: 1.0,
        gapMin: 110,
        gapMax: 220,
        speedMult: 1.0,
        friction: 0.98
    },
    {
        id: 1,
        name: "Kapadokya Vadisi",
        skyTop: "#9a3412",
        skyBottom: "#fdba74",
        groundColor: "#78350f",
        grassColor: "#d97706",
        moneyMult: 1.5,
        gapMin: 140,
        gapMax: 280,
        speedMult: 1.1,
        friction: 0.97
    },
    {
        id: 2,
        name: "Karadeniz Yaylaları",
        skyTop: "#064e3b",
        skyBottom: "#6ee7b7",
        groundColor: "#1f2937",
        grassColor: "#059669",
        moneyMult: 2.2,
        gapMin: 160,
        gapMax: 320,
        speedMult: 1.15,
        friction: 0.995 // Kaygan zemin
    },
    {
        id: 3,
        name: "Gece Otoyolu (Neon)",
        skyTop: "#090d16",
        skyBottom: "#1e1b4b",
        groundColor: "#0f172a",
        grassColor: "#ec4899",
        moneyMult: 3.0,
        gapMin: 190,
        gapMax: 380,
        speedMult: 1.35,
        friction: 0.98
    }
];

const CARS = [
    {
        id: "sahin",
        name: "Tofaş Şahin",
        price: 0,
        speed: 4.2,
        climbPower: 0.45,
        moneyBonus: 1.0,
        inkBonus: 0,
        color: "#f8fafc",
        bodyType: "sedan",
        desc: "Efsane başlangıç aracı. Hafif ve dengeli."
    },
    {
        id: "transit",
        name: "Eski Kasa Kamyonet",
        price: 1500,
        speed: 4.5,
        climbPower: 0.55,
        moneyBonus: 1.35,
        inkBonus: 30,
        color: "#3b82f6",
        bodyType: "van",
        desc: "Geniş kasası sayesinde +%35 daha fazla ₺ taşır."
    },
    {
        id: "civic",
        name: "Modifiyeli Civic",
        price: 6000,
        speed: 5.5,
        climbPower: 0.65,
        moneyBonus: 1.6,
        inkBonus: 50,
        color: "#ef4444",
        bodyType: "sport",
        desc: "Seri hızlanır, rampalardan çok iyi uçar."
    },
    {
        id: "offroad",
        name: "4x4 Arazi Canavarı",
        price: 20000,
        speed: 5.8,
        climbPower: 0.90,
        moneyBonus: 2.0,
        inkBonus: 80,
        color: "#10b981",
        bodyType: "suv",
        desc: "Dik çizilmiş çizgilere bile tırmanabilen dev tekerlekler."
    },
    {
        id: "togg",
        name: "Togg T10X",
        price: 65000,
        speed: 6.8,
        climbPower: 0.95,
        moneyBonus: 2.8,
        inkBonus: 150,
        color: "#06b6d4",
        bodyType: "suv",
        desc: "Yüksek tork, ekstra batarya mürekkebi ve 2.8x ₺ kazancı!"
    },
    {
        id: "hyper",
        name: "Hiper Spor GT",
        price: 200000,
        speed: 8.2,
        climbPower: 1.1,
        moneyBonus: 4.0,
        inkBonus: 250,
        color: "#f59e0b",
        bodyType: "sport",
        desc: "Uçurumların üzerinden süzülen en üst düzey makine."
    }
];

const UPGRADES = [
    {
        id: "engine",
        name: "Turbo Motor",
        desc: "Aracın hızını ve yokuş tırmanma gücünü artırır.",
        basePrice: 250,
        priceMult: 1.6,
        maxLevel: 15
    },
    {
        id: "inkMax",
        name: "Mürekkep Tankı",
        desc: "Tek seferde daha uzun köprüler çizebilmeni sağlar.",
        basePrice: 200,
        priceMult: 1.55,
        maxLevel: 15
    },
    {
        id: "inkRegen",
        name: "Hızlı Dolum Pompası",
        desc: "Mürekkep barının yenilenme hızını artırır.",
        basePrice: 300,
        priceMult: 1.65,
        maxLevel: 12
    },
    {
        id: "income",
        name: "Enflasyon Koruması (₺)",
        desc: "Geçilen her boşluk ve metreden kazanılan ₺ miktarını katlar.",
        basePrice: 400,
        priceMult: 1.75,
        maxLevel: 20
    },
    {
        id: "magnet",
        name: "₺ Mıknatısı",
        desc: "Yoldaki ve havadaki ₺ banknotlarını uzaktan çeker.",
        basePrice: 350,
        priceMult: 1.7,
        maxLevel: 10
    },
    {
        id: "grip",
        name: "Çelik Süspansiyon",
        desc: "Çizgi üzerindeki yol tutuşunu artırır, geri kaymayı önler.",
        basePrice: 250,
        priceMult: 1.6,
        maxLevel: 10
    }
];