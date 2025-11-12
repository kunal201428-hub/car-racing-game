// MakeCode Arcade के लिए कार रेसिंग गेम
// यह गेम प्लेयर को ऊपर/नीचे/बाएँ/दाएँ नियंत्रित करने देता है
// और दूसरी कारों से टकराने से बचना होता है।

// --- स्प्राइट डिज़ाइन (Sprite Designs) ---
// ध्यान दें: आपको इन स्प्राइट डिज़ाइन को MakeCode एडिटर में मैन्युअल रूप से
// कॉपी करके 'mySprite' और 'enemyCarSprites' के लिए उपयोग करना होगा।
// मैंने नीचे एक अलग सेक्शन में स्प्राइट आर्ट कोड दिया है।

// --- 1. गेम सेटअप (Game Setup) ---
let score = 0
let playerCar: Sprite = null

// गेम शुरू होने पर (on start)
game.onStart(function () {
    // 160x120 पिक्सेल का रेसिंग ट्रैक सेट करें
    scene.setBackgroundColor(7); // गहरे हरे रंग का बैकग्राउंड (साइड घास)
    scene.setTileMap(img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `);

    // रोड टाइल (रंग 15 = सफ़ेद/रोड)
    scene.setTile(15, img`
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
    `, TileKind.Road);

    // रोड की चौड़ाई सेट करें (स्क्रीन का मध्य भाग)
    for (let x = 4; x <= 11; x++) {
        for (let y = 0; y <= 7; y++) {
            scene.setTileAt(x, y, 15);
        }
    }

    // रोड मार्किंग (सफेद रेखाएँ)
    let roadStripe = sprites.create(img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
        f f f f f f f f f f f f f f f f
    `, SpriteKind.Decorative);
    roadStripe.x = scene.screenWidth() / 2;
    roadStripe.vy = 50; // मार्किंग को नीचे की ओर मूव करें

    // प्लेयर कार (Yellow Supercar - 26738.jpg)
    playerCar = sprites.create(img`
        . . . . . . . . . . . . . . . .
        . . . . . 2 2 2 2 . . . . . . .
        . . . . 2 5 5 5 5 2 . . . . . .
        . . . 2 5 5 5 5 5 5 2 . . . . .
        . . 2 5 5 5 5 5 5 5 5 2 . . . .
        . 2 5 5 5 5 5 5 5 5 5 5 2 . . .
        2 5 5 5 5 5 5 5 5 5 5 5 5 2 . .
        2 5 9 5 5 5 5 5 5 5 9 5 5 2 . . // 9: Window (White)
        2 5 9 5 5 5 5 5 5 5 9 5 5 2 . .
        2 4 4 4 5 5 5 5 5 5 4 4 4 2 . . // 4: Red Tail Lights
        2 4 4 4 5 5 5 5 5 5 4 4 4 2 . .
        2 5 5 5 5 5 5 5 5 5 5 5 5 2 . .
        . 2 2 2 2 2 2 2 2 2 2 2 2 . . .
        . . 2 2 2 . . . . . 2 2 2 . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `, SpriteKind.Player)

    // प्लेयर कार को स्क्रीन के नीचे बीच में रखें
    playerCar.bottom = scene.screenHeight() - 5
    playerCar.setStayInScreen(true)

    // कंट्रोल सेट करें (Control setup)
    controller.moveSprite(playerCar, 75, 75) // थोड़ी धीमी गति

    // स्कोर सेट करें
    info.setScore(0)
    info.setLife(3)
})

// --- 2. दुश्मन कार बनाना (Enemy Car Generation) ---

let enemyCarSprites = [
    img`
        . . . . . . . . . . . . . . . .
        . . . . . 2 2 2 2 . . . . . . .
        . . . . 2 8 8 8 8 2 . . . . . . // 8: Grey/Silver (Futuristic - 26736.jpg)
        . . . 2 8 8 8 8 8 8 2 . . . . .
        . . 2 8 8 8 8 8 8 8 8 2 . . . .
        . 2 8 8 8 8 8 8 8 8 8 8 2 . . .
        2 8 8 8 8 8 8 8 8 8 8 8 8 2 . .
        2 8 6 8 8 8 8 8 8 8 6 8 8 2 . . // 6: Orange/Red Accents
        2 8 6 8 8 8 8 8 8 8 6 8 8 2 . .
        2 8 8 8 8 8 8 8 8 8 8 8 8 2 . .
        2 8 8 8 8 8 8 8 8 8 8 8 8 2 . .
        2 8 8 8 8 8 8 8 8 8 8 8 8 2 . .
        . 2 2 2 2 2 2 2 2 2 2 2 2 . . .
        . . 2 2 2 . . . . . 2 2 2 . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `,
    img`
        . . . . . . . . . . . . . . . .
        . . . . . 2 2 2 2 . . . . . . .
        . . . . 2 c c c c 2 . . . . . . // c: Light Grey/Silver (Sedan - 26737.jpg)
        . . . 2 c c c c c c 2 . . . . .
        . . 2 c c c c c c c c 2 . . . .
        . 2 c c c c c c c c c c 2 . . .
        2 c c c c c c c c c c c c 2 . .
        2 c 9 c c c c c c c c 9 c c 2 . // 9: Window (White)
        2 c 9 c c c c c c c c 9 c c 2 .
        2 c c c c c c c c c c c c 2 . .
        2 c c c c c c c c c c c c 2 . .
        2 c c c c c c c c c c c c 2 . .
        . 2 2 2 2 2 2 2 2 2 2 2 2 . . .
        . . 2 2 2 . . . . . 2 2 2 . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `,
    img`
        . . . . . . . . . . . . . . . .
        . . . . . 2 2 2 2 . . . . . . .
        . . . . 2 1 1 1 1 2 . . . . . . // 1: Dark Black (Sports Sedan - 26739.jpg)
        . . . 2 1 1 1 1 1 1 2 . . . . .
        . . 2 1 1 1 1 1 1 1 1 2 . . . .
        . 2 1 1 1 1 1 1 1 1 1 1 2 . . .
        2 1 1 1 1 1 1 1 1 1 1 1 1 2 . .
        2 1 9 1 1 1 1 1 1 1 9 1 1 2 . . // 9: Window (White)
        2 1 9 1 1 1 1 1 1 1 9 1 1 2 . .
        2 1 1 1 1 1 1 1 1 1 1 1 1 2 . .
        2 1 1 1 1 1 1 1 1 1 1 1 1 2 . .
        2 1 1 1 1 1 1 1 1 1 1 1 1 2 . .
        . 2 2 2 2 2 2 2 2 2 2 2 2 . . .
        . . 2 2 2 . . . . . 2 2 2 . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `
]

// हर 1 सेकंड में नई दुश्मन कार बनाएँ (Game update loop)
game.onUpdateInterval(1000, function () {
    let enemyCar: Sprite = sprites.create(
        enemyCarSprites[randint(0, enemyCarSprites.length - 1)],
        SpriteKind.Enemy
    )

    // दुश्मन कार को रोड पर किसी भी रैंडम X पोजीशन पर ऊपर से शुरू करें
    enemyCar.x = randint(playerCar.width / 2, scene.screenWidth() - playerCar.width / 2);
    enemyCar.y = 0; // स्क्रीन के बिल्कुल ऊपर

    // कार की गति सेट करें (शुरुआत में धीमी, फिर तेज़)
    enemyCar.vy = 50 + (info.score() * 0.5) // जैसे-जैसे स्कोर बढ़ेगा, गति भी बढ़ेगी

    // कार को स्क्रीन से बाहर जाने पर हटा दें (memory cleanup)
    enemyCar.setFlag(SpriteFlag.AutoDestroy, true)
})


// --- 3. स्कोर और गेम ओवर (Score and Game Over) ---

// हर 0.1 सेकंड में स्कोर बढ़ाएँ
game.onUpdateInterval(100, function () {
    if (info.life() > 0) {
        info.changeScoreBy(1)
    }
})

// टकराव होने पर (Collision detection)
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    // अगर प्लेयर कार दुश्मन कार से टकराती है

    // टकराने वाली कार को हटा दें
    otherSprite.destroy()

    // एक जीवन कम करें
    info.changeLifeBy(-1)

    // थोड़ी देर के लिए प्लेयर को अदृश्य करें ताकि मल्टीपल हिट्स से बचें
    playerCar.startEffect(effects.fire, 200)

    // अगर जीवन शून्य है, तो गेम खत्म
    if (info.life() == 0) {
        game.over(false, effects.dissolve) // गेम हारने पर
    }
})

// रोड मार्किंग को ऊपर से दोहराएँ (Visual effect for movement)
game.onUpdate(function () {
    // अगर रोड मार्किंग स्क्रीन के नीचे चली गई है, तो उसे वापस ऊपर ले आओ
    let roadStripe = sprites.allOfKind(SpriteKind.Decorative)[0]
    if (roadStripe && roadStripe.y >= 120 + roadStripe.height / 2) {
        roadStripe.y = 0 - roadStripe.height / 2;
    }
})basic.forever(function () {0
	
})
