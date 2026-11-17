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
        friction: 0.995
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
        id: "kartal",
        name: "Tofaş Kartal",
        price: 1200,
        speed: 4.4,
        climbPower: 0.50,
        moneyBonus: 1.25,
        inkBonus: 20,
        color: "#b91c1c",
        bodyType: "wagon",
        desc: "Geniş arka bagajı ile ekstra ₺ toplar."
    },
    {
        id: "dolmus",
        name: "Sarı Dolmuş",
        price: 5000,
        speed: 4.8,
        climbPower: 0.60,
        moneyBonus: 1.5,
        inkBonus: 40,
        color: "#eab308",
        bodyType: "van",
        desc: "Dur kalk ustası! Yolcu paraları cebinde."
    },
    {
        id: "transit",
        name: "Eski Kasa Kamyonet",
        price: 12000,
        speed: 5.2,
        climbPower: 0.70,
        moneyBonus: 1.8,
        inkBonus: 70,
        color: "#3b82f6",
        bodyType: "van",
        desc: "Güçlü kasa yapısı ve yüksek tırmanma."
    },
    {
        id: "civic",
        name: "Modifiyeli Civic",
        price: 28000,
        speed: 5.8,
        climbPower: 0.75,
        moneyBonus: 2.2,
        inkBonus: 100,
        color: "#ef4444",
        bodyType: "sport",
        desc: "Rampalardan fırlarken mükemmel takla bonusu."
    },
    {
        id: "togg",
        name: "Togg T10X",
        price: 85000,
        speed: 7.0,
        climbPower: 0.95,
        moneyBonus: 3.2,
        inkBonus: 180,
        color: "#06b6d4",
        bodyType: "suv",
        desc: "Yüksek tork, dev batarya ve 3.2x ₺ kazancı!"
    },
    {
        id: "hyper",
        name: "Hiper Spor GT",
        price: 250000,
        speed: 8.5,
        climbPower: 1.15,
        moneyBonus: 4.5,
        inkBonus: 300,
        color: "#f59e0b",
        bodyType: "sport",
        desc: "Uçurumlarda adeta süzülen son nokta makine."
    }
];

const NEONS = [
    { id: "none", name: "Neonsuz", price: 0, color: null },
    { id: "blue", name: "Elektrik Mavisi", price: 1500, color: "#38bdf8" },
    { id: "purple", name: "Siber Mor", price: 3000, color: "#c084fc" },
    { id: "red", name: "Kan Kırmızı", price: 5000, color: "#f87171" },
    { id: "green", name: "Kripton Yeşil", price: 7500, color: "#4ade80" },
    { id: "gold", name: "Altın Sarısı", price: 12000, color: "#facc15" },
    { id: "rgb", name: "RGB Gaming Akış", price: 25000, color: "rgb" }
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

const INITIAL_QUESTS = [
    { id: "q1", title: "İlk Sürüş", desc: "Toplam 200 metre yol kat et.", target: 200, reward: 500, progress: 0, completed: false },
    { id: "q2", title: "Köprü Ustası", desc: "10 tane boşluk/uçurum geç.", target: 10, reward: 1200, progress: 0, completed: false },
    { id: "q3", title: "Hava Akrobasisi", desc: "Toplam 3 kez havada takla at.", target: 3, reward: 2500, progress: 0, completed: false }
];
