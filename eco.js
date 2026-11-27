// MoviLang — економіка курсів: валюта, правила, спутник і лавка. Ключ — slug курсу.
// Правила (rules) і ціни дублюються в базі (eco_rules / eco_items) — сервер рахує саме їх.
// Синхронізація: node tools/eco_seed.js > /tmp/eco.sql і виконати в Supabase.
// Поля правил: correct — монет за 100 % правильних відповідей; perfect — бонус за 90 %+; flawless — ще за 100 %;
// boss / boss_mult — за боса арки; day — день серії; streak_every / streak_bonus — бонус кожні N днів;
// review / review_cap — за повторення слів (ліміт на день); interest_pct / interest_cap — відсотки на залишок раз на тиждень;
// cashback_pct — повернення з покупок; food_xp — досвід спутнику за корм; cup — нагорода фракції-переможця місяця.
(function () {
  function N(uk, pl, en) { return {uk: uk, pl: pl, en: en}; }
  function I(id, kind, price, icon, name, extra) { var o = {id: id, kind: kind, price: price, icon: icon, name: name}; for (var k in extra || {}) o[k] = extra[k]; return o; }

  window.MOVILANG_ECO = {

    'harry-potter-1': {
      cur: {icon: '🪙', color: '#e8b93a', name: N('галеони', 'galeony', 'Galleons'), one: N('галеон', 'galeon', 'Galleon')},
      twist: {icon: '🧪', name: N('Фелікс Феліцис', 'Felix Felicis', 'Felix Felicis'), text: N('Рідке везіння дешевше, ніж деінде: наступний урок приносить подвійні галеони. А бос арки — це іспит у Гоґвортсі: +30.', 'Płynne szczęście jest tu tańsze: następna lekcja daje podwójne galeony. Boss łuku to egzamin w Hogwarcie: +30.', 'Liquid luck is cheaper here: your next lesson pays double. An arc boss is a Hogwarts exam: +30.')},
      rules: {correct: 15, perfect: 10, boss: 30, day: 5, review: 3, review_cap: 30, food_xp: 20, cup: 60},
      pet: {sp: 'owl', name: N('Совеня', 'Sówka', 'Owlet'), food: '🐭', stages: ['🥚', '🐣', '🦉', '🦉'], aura: '#ffe08a',
        talk: N('Ух-ух! Слово дня:', 'Hu-hu! Słowo dnia:', 'Hoo-hoo! Word of the day:')},
      items: [
        I('hint', 'hint', 12, '📜', N('Шпаргалка з бібліотеки', 'Ściąga z biblioteki', 'Library crib note')),
        I('timeturner', 'freeze', 50, '⏳', N('Маховик часу', 'Zmieniacz czasu', 'Time-Turner')),
        I('felix', 'boost', 45, '🧪', N('Фелікс Феліцис', 'Felix Felicis', 'Felix Felicis')),
        I('treat', 'food', 8, '🐭', N('Совині ласощі', 'Smakołyk dla sowy', 'Owl treat')),
        I('house_frame', 'frame', 120, '🛡️', N('Рамка факультету', 'Ramka domu', 'House frame'), {ring: 'conic-gradient(#c4302b,#d9a400,#3b6fd4,#2e8b57,#c4302b)'}),
        I('snitch_frame', 'frame', 210, '✨', N('Золотий снітч', 'Złoty znicz', 'Golden Snitch'), {ring: 'conic-gradient(#fff3b0,#e8b93a,#8a6a2a,#fff3b0)'}),
        I('great_hall', 'theme', 260, '🕯️', N('Велика зала', 'Wielka Sala', 'The Great Hall'), {bg: 'radial-gradient(circle at 50% 0,#4a3a6a 0,#1a1430 55%,#0c0a1a 100%)'}),
        I('forest', 'theme', 320, '🌲', N('Заборонений ліс', 'Zakazany Las', 'The Forbidden Forest'), {bg: 'radial-gradient(circle at 30% 10%,#2c4a3a 0,#0f1f18 60%,#060d0a 100%)'}),
        I('frogs', 'sticker', 30, '🐸', N('Шоколадні жаби', 'Czekoladowe żaby', 'Chocolate Frogs'), {pack: ['🐸', '🍫', '⚡', '🦉', '🧙', '🪄']}),
        I('scarf', 'outfit', 80, '🧣', N('Шарф факультету', 'Szalik domu', 'House scarf'), {svg: 'scarf', col: '#9e1b2b', col2: '#d9a400'}),
        I('hat', 'outfit', 150, '🎩', N('Чарівний капелюх', 'Magiczny kapelusz', 'Wizard hat'), {svg: 'wizard', col: '#3a2a6a', col2: '#ffd25a'})
      ]
    },

    'game-of-thrones-1': {
      cur: {icon: '🪙', color: '#d4a42a', name: N('золоті дракони', 'złote smoki', 'Gold Dragons'), one: N('золотий дракон', 'złoty smok', 'Gold Dragon')},
      twist: {icon: '🏦', name: N('Залізний банк', 'Żelazny Bank', 'The Iron Bank'), text: N('Банк Браавоса платить 5 % на залишок щотижня (до 40). Хто не витрачає — багатіє. Але ціни в Королівській Гавані вищі.', 'Bank z Braavos płaci 5% od salda co tydzień (do 40). Kto oszczędza, ten się bogaci. Ale ceny w Królewskiej Przystani są wyższe.', 'The Braavos bank pays 5% on your balance every week (up to 40). Savers get rich. But King\'s Landing prices are higher.')},
      rules: {correct: 15, perfect: 10, boss: 25, day: 5, review: 3, review_cap: 30, interest_pct: 5, interest_cap: 40, food_xp: 20, cup: 50},
      pet: {sp: 'wolf', name: N('Лютововченя', 'Wilkorzątko', 'Direwolf pup'), food: '🍖', stages: ['🐾', '🐺', '🐺', '🐺'], aura: '#cfe0f0',
        talk: N('Вуууу! Слово дня:', 'Auuu! Słowo dnia:', 'Awoo! Word of the day:')},
      items: [
        I('maester', 'hint', 14, '📖', N('Порада мейстра', 'Rada maestera', 'A maester\'s advice')),
        I('watch', 'freeze', 55, '🕯️', N('Нічна варта', 'Nocna Straż', 'The Night\'s Watch')),
        I('wildfire', 'boost', 70, '🔥', N('Дикий вогонь', 'Dziki ogień', 'Wildfire')),
        I('venison', 'food', 10, '🍖', N('Оленина', 'Dziczyzna', 'Venison')),
        I('seal_frame', 'frame', 130, '🛡️', N('Печатка дому', 'Pieczęć rodu', 'House seal'), {ring: 'conic-gradient(#4a5562,#a9c2d6,#4a5562,#e8eef5,#4a5562)'}),
        I('crown_frame', 'frame', 230, '👑', N('Корона Півночі', 'Korona Północy', 'Crown of the North'), {ring: 'conic-gradient(#e8c56a,#7a5a20,#e8c56a,#fff4c0,#e8c56a)'}),
        I('winterfell', 'theme', 280, '❄️', N('Вінтерфелл', 'Winterfell', 'Winterfell'), {bg: 'radial-gradient(circle at 50% 0,#4a5a6e 0,#1c2430 60%,#0b0f15 100%)'}),
        I('kings_landing', 'theme', 340, '🏰', N('Королівська Гавань', 'Królewska Przystań', 'King\'s Landing'), {bg: 'radial-gradient(circle at 50% 0,#7a4a24 0,#2a1a12 60%,#120a06 100%)'}),
        I('ravens', 'sticker', 35, '🐦‍⬛', N('Ворони з листами', 'Kruki z listami', 'Message ravens'), {pack: ['🐦‍⬛', '🐺', '🐉', '⚔️', '❄️', '👑']}),
        I('cloak', 'outfit', 90, '🧥', N('Хутряний плащ', 'Futrzany płaszcz', 'Fur cloak'), {svg: 'cloak', col: '#2a2a36', col2: '#cfc4b0'}),
        I('helm', 'outfit', 170, '⛑️', N('Шолом гвардійця', 'Hełm gwardzisty', 'Guard\'s helm'), {svg: 'helmet', col: '#9e1b2b'})
      ]
    },

    'friends-s1': {
      cur: {icon: '💵', color: '#7fbf6a', name: N('чайові', 'napiwki', 'tips'), one: N('чайові', 'napiwek', 'tip')},
      twist: {icon: '☕', name: N('Постійний гість', 'Stały bywalec', 'The regular'), text: N('У кав\'ярні цінують тих, хто приходить щодня: день серії дає 8 замість 5, а кожен 7-й день поспіль — ще +40.', 'W kawiarni cenią stałych gości: dzień serii daje 8 zamiast 5, a co 7. dzień z rzędu jeszcze +40.', 'The coffee house loves regulars: a streak day pays 8 instead of 5, and every 7th day in a row adds +40.')},
      rules: {correct: 15, perfect: 10, boss: 25, day: 8, streak_every: 7, streak_bonus: 40, review: 3, review_cap: 30, food_xp: 20, cup: 50},
      pet: {sp: 'monkey', name: N('Мавпочка', 'Małpka', 'Little monkey'), food: '🍌', stages: ['🍌', '🐒', '🐒', '🐵'], aura: '#ffcf8a',
        talk: N('Уу-аа! Слово дня:', 'Uu-aa! Słowo dnia:', 'Ooh-aah! Word of the day:')},
      items: [
        I('hint', 'hint', 10, '💡', N('Підказка за кавою', 'Podpowiedź przy kawie', 'A tip over coffee')),
        I('break', 'freeze', 40, '🏖️', N('«Ми були на перерві!»', '„Mieliśmy przerwę!”', '“We were on a break!”')),
        I('espresso', 'boost', 55, '☕', N('Подвійне еспресо', 'Podwójne espresso', 'Double espresso')),
        I('banana', 'food', 6, '🍌', N('Банан', 'Banan', 'Banana')),
        I('peephole', 'frame', 100, '🟨', N('Жовта рамка', 'Żółta ramka', 'Yellow frame'), {ring: 'conic-gradient(#ffd23a,#e8a820,#ffd23a)'}),
        I('purple_door', 'frame', 170, '🚪', N('Фіолетові двері', 'Fioletowe drzwi', 'Purple door'), {ring: 'conic-gradient(#8a4ad8,#4a2a8a,#8a4ad8,#c9a0ff,#8a4ad8)'}),
        I('cafe', 'theme', 240, '🛋️', N('Кав\'ярня', 'Kawiarnia', 'The coffee house'), {bg: 'radial-gradient(circle at 50% 0,#6a3a2a 0,#2a1a1a 60%,#140c0c 100%)'}),
        I('apartment', 'theme', 300, '🏠', N('Фіолетова квартира', 'Fioletowe mieszkanie', 'The purple apartment'), {bg: 'radial-gradient(circle at 50% 0,#5a3a7a 0,#24183a 60%,#100a1a 100%)'}),
        I('duck', 'sticker', 30, '🦆', N('Каченя й курча', 'Kaczka i kurczak', 'Duck and chick'), {pack: ['🦆', '🐥', '☕', '🛋️', '🦃', '🎸']}),
        I('cowboy', 'outfit', 75, '🤠', N('Ковбойський капелюх', 'Kowbojski kapelusz', 'Cowboy hat'), {svg: 'cowboy', col: '#a8642a', col2: '#5a3420'}),
        I('sweater', 'outfit', 130, '🧶', N('Святковий светр', 'Świąteczny sweter', 'Holiday sweater'), {svg: 'sweater', col: '#2f7a3a', col2: '#ffffff'})
      ]
    },

    'himym-s1': {
      cur: {icon: '☂️', color: '#ffd23a', name: N('жовті парасольки', 'żółte parasolki', 'yellow umbrellas'), one: N('парасолька', 'parasolka', 'umbrella')},
      twist: {icon: '🏆', name: N('Леген… дарно!', 'Legen… darne!', 'Legen… dary!'), text: N('Кожні 5 днів поспіль — «легендарний» бонус +30. А урок на 100 % — ще +15 зверху.', 'Co 5 dni z rzędu — „legendarny” bonus +30. A lekcja na 100% — jeszcze +15.', 'Every 5 days in a row — a “legendary” bonus +30. A 100% lesson adds another +15.')},
      rules: {correct: 15, perfect: 10, flawless: 15, boss: 25, day: 5, streak_every: 5, streak_bonus: 30, review: 3, review_cap: 30, food_xp: 20, cup: 50},
      pet: {sp: 'goat', name: N('Козеня', 'Koziołek', 'Little goat'), food: '🥬', stages: ['🌱', '🐐', '🐐', '🐐'], aura: '#ffe38a',
        talk: N('Ме-е! Слово дня:', 'Mee! Słowo dnia:', 'Maa! Word of the day:')},
      items: [
        I('hint', 'hint', 12, '📝', N('Підказка з «Плейбука»', 'Podpowiedź z poradnika', 'A playbook hint')),
        I('slap', 'freeze', 45, '🖐️', N('Відстрочка ляпаса', 'Odroczony liść', 'Slap delay')),
        I('suit_up', 'boost', 60, '👔', N('Одягни костюм!', 'Garnitur, proszę!', 'Suit up!')),
        I('greens', 'food', 8, '🥬', N('Капуста', 'Kapusta', 'Cabbage')),
        I('umbrella_frame', 'frame', 110, '☂️', N('Жовта парасолька', 'Żółta parasolka', 'Yellow umbrella'), {ring: 'conic-gradient(#ffe066,#e8a820,#ffe066)'}),
        I('horn_frame', 'frame', 190, '📯', N('Синя валторна', 'Niebieski róg', 'Blue French horn'), {ring: 'conic-gradient(#3a6ab8,#9fc0ff,#3a6ab8,#1a3a78,#3a6ab8)'}),
        I('bar', 'theme', 250, '🍻', N('Бар унизу', 'Bar na dole', 'The bar downstairs'), {bg: 'radial-gradient(circle at 50% 0,#5a3a2a 0,#22161a 60%,#100a0c 100%)'}),
        I('rooftop', 'theme', 310, '🌃', N('Дах над містом', 'Dach nad miastem', 'The rooftop'), {bg: 'radial-gradient(circle at 70% 0,#3a3a7a 0,#141a3a 60%,#080a18 100%)'}),
        I('high_five', 'sticker', 30, '🙌', N('Дай п\'ять!', 'Przybij piątkę!', 'High five!'), {pack: ['🙌', '☂️', '👔', '🍺', '📯', '🎤']}),
        I('tie', 'outfit', 70, '👔', N('Краватка', 'Krawat', 'Tie'), {svg: 'tie', col: '#2a4a8a', col2: '#ffd23a'}),
        I('crown', 'outfit', 140, '👑', N('Корона «легенди»', 'Korona legendy', 'Legend\'s crown'), {svg: 'crown', col: '#c2263a', col2: '#ffd25a'})
      ]
    },

    'vampire-diaries-1': {
      cur: {icon: '🌙', color: '#c9d6e8', name: N('місячні камені', 'kamienie księżycowe', 'moonstones'), one: N('місячний камінь', 'kamień księżycowy', 'moonstone')},
      twist: {icon: '🌕', name: N('Повня', 'Pełnia', 'Full moon'), text: N('Боси арок — це ніч повні: нагорода подвоюється (+50). Звичайні уроки дають трохи менше — місто не любить чужих.', 'Bossowie łuków to noce pełni: nagroda podwójna (+50). Zwykłe lekcje dają trochę mniej — miasto nie lubi obcych.', 'Arc bosses are full-moon nights: the reward doubles (+50). Normal lessons pay a bit less: the town distrusts strangers.')},
      rules: {correct: 12, perfect: 10, boss: 25, boss_mult: 2, day: 5, review: 3, review_cap: 30, food_xp: 20, cup: 50},
      pet: {sp: 'raven', name: N('Воронятко', 'Kruczek', 'Raven chick'), food: '🫐', stages: ['🥚', '🐦‍⬛', '🐦‍⬛', '🐦‍⬛'], aura: '#d06a7a',
        talk: N('Кар! Слово дня:', 'Kra! Słowo dnia:', 'Caw! Word of the day:')},
      items: [
        I('grimoire', 'hint', 12, '📕', N('Сторінка гримуара', 'Strona grymuaru', 'A grimoire page')),
        I('daylight', 'freeze', 50, '💍', N('Перстень денного світла', 'Pierścień dzienny', 'Daylight ring')),
        I('blood_bag', 'boost', 60, '🩸', N('Запас сил', 'Zapas sił', 'Strength reserve')),
        I('berries', 'food', 8, '🫐', N('Ягоди', 'Jagody', 'Berries')),
        I('vervain_frame', 'frame', 120, '🌿', N('Вінок вербени', 'Wianek werbeny', 'Vervain wreath'), {ring: 'conic-gradient(#4a7a4a,#a8d8a0,#4a7a4a,#2a4a2a,#4a7a4a)'}),
        I('moon_frame', 'frame', 200, '🌕', N('Кривава повня', 'Krwawa pełnia', 'Blood moon'), {ring: 'conic-gradient(#ff5a5a,#8b1e2f,#ff9a8a,#8b1e2f,#ff5a5a)'}),
        I('mansion', 'theme', 270, '🕯️', N('Маєток Сальваторе', 'Rezydencja Salvatore', 'The Salvatore mansion'), {bg: 'radial-gradient(circle at 50% 0,#4a1e24 0,#1e0c10 60%,#0c0406 100%)'}),
        I('falls', 'theme', 320, '🌊', N('Водоспад', 'Wodospad', 'The falls'), {bg: 'radial-gradient(circle at 50% 0,#2a3a4a 0,#101a22 60%,#06090c 100%)'}),
        I('crows', 'sticker', 30, '🦇', N('Нічні знаки', 'Nocne znaki', 'Night signs'), {pack: ['🦇', '🐦‍⬛', '🌙', '🩸', '🕯️', '🐺']}),
        I('scarf', 'outfit', 80, '🧣', N('Шарф', 'Szal', 'Scarf'), {svg: 'scarf', col: '#3a3a48', col2: '#8b1e2f'}),
        I('crown', 'outfit', 150, '🌹', N('Вінок із троянд', 'Wianek z róż', 'Rose crown'), {svg: 'roses', col: '#c2263a'})
      ]
    },

    'home-alone': {
      cur: {icon: '🍕', color: '#ffb84a', name: N('шматочки піци', 'kawałki pizzy', 'pizza slices'), one: N('шматочок піци', 'kawałek pizzy', 'pizza slice')},
      twist: {icon: '🪤', name: N('Комбо пасток', 'Kombo pułapek', 'Trap combo'), text: N('Тут люблять точність: урок на 90 %+ дає +15 замість +10, а заморозка серії найдешевша — сам удома, але не сам у навчанні.', 'Tu liczy się precyzja: lekcja na 90%+ daje +15 zamiast +10, a zamrożenie serii jest najtańsze.', 'Precision pays here: a 90%+ lesson gives +15 instead of +10, and a streak freeze is the cheapest of all courses.')},
      rules: {correct: 15, perfect: 15, boss: 25, day: 5, review: 3, review_cap: 30, food_xp: 20, cup: 50},
      pet: {sp: 'spider', name: N('Павучок', 'Pajączek', 'Little spider'), food: '🦗', stages: ['🥚', '🕷️', '🕷️', '🕷️'], aura: '#ffd27a',
        talk: N('Тсс… Слово дня:', 'Ćśś… Słowo dnia:', 'Psst… Word of the day:')},
      items: [
        I('note', 'hint', 10, '📝', N('Записка від мами', 'Kartka od mamy', 'A note from Mom')),
        I('lights', 'freeze', 35, '💡', N('Світло в усіх вікнах', 'Światło we wszystkich oknach', 'Lights in every window')),
        I('cheese_pizza', 'boost', 55, '🍕', N('Сирна піца', 'Pizza serowa', 'A whole cheese pizza')),
        I('cricket', 'food', 6, '🦗', N('Цвіркун', 'Świerszcz', 'Cricket')),
        I('garland_frame', 'frame', 100, '🎄', N('Гірлянда', 'Girlanda', 'Garland'), {ring: 'conic-gradient(#ff5a5a,#ffd25a,#5ad2ff,#7aff7a,#ff5a5a)'}),
        I('ornament_frame', 'frame', 170, '🎁', N('Ялинкова куля', 'Bombka', 'Ornament'), {ring: 'conic-gradient(#d23a3a,#ffd27a,#d23a3a,#2f7a3a,#d23a3a)'}),
        I('xmas_house', 'theme', 230, '🏠', N('Різдвяний дім', 'Świąteczny dom', 'Christmas house'), {bg: 'radial-gradient(circle at 50% 0,#2a3a6a 0,#121a33 60%,#080c18 100%)'}),
        I('basement', 'theme', 290, '🔥', N('Підвал із пічкою', 'Piwnica z piecem', 'The basement furnace'), {bg: 'radial-gradient(circle at 50% 100%,#7a3a1a 0,#2a1410 55%,#120806 100%)'}),
        I('traps', 'sticker', 25, '🪤', N('Пастки', 'Pułapki', 'Traps'), {pack: ['🪤', '🎄', '🍕', '😱', '🔥', '🕷️']}),
        I('beanie', 'outfit', 65, '🧢', N('Шапка', 'Czapka', 'Cap'), {svg: 'beanie', col: '#c2263a', col2: '#ffffff'}),
        I('bow', 'outfit', 120, '🎀', N('Різдвяний бант', 'Świąteczna kokarda', 'Christmas bow'), {svg: 'bow', col: '#d23a3a', col2: '#ffd25a'})
      ]
    },

    'cars': {
      cur: {icon: '🔩', color: '#ff6a3a', name: N('поршні', 'tłoki', 'pistons'), one: N('поршень', 'tłok', 'piston')},
      twist: {icon: '🏁', name: N('Піт-стоп', 'Pit stop', 'Pit stop'), text: N('Швидкість і точність: урок на 100 % — фінішний бонус +20. Але штраф за неуважність: звичайні відповіді важать трохи менше.', 'Szybkość i precyzja: lekcja na 100% — bonus na mecie +20. Zwykłe odpowiedzi ważą trochę mniej.', 'Speed and precision: a 100% lesson earns a finish-line bonus of +20. Ordinary answers weigh a bit less.')},
      rules: {correct: 13, perfect: 10, flawless: 20, boss: 25, day: 5, review: 3, review_cap: 30, food_xp: 20, cup: 50},
      pet: {sp: 'tractor', name: N('Тракторець', 'Traktorek', 'Little tractor'), food: '⛽', stages: ['🔧', '🚜', '🚜', '🚜'], aura: '#ffb84a',
        talk: N('Бррр! Слово дня:', 'Brrr! Słowo dnia:', 'Vroom! Word of the day:')},
      items: [
        I('radio', 'hint', 12, '📻', N('Підказка з боксів', 'Rada z boksu', 'Pit-crew radio')),
        I('tow', 'freeze', 50, '🪝', N('Евакуатор', 'Holownik', 'Tow truck')),
        I('nitro', 'boost', 60, '🚀', N('Нітро', 'Nitro', 'Nitro')),
        I('fuel', 'food', 8, '⛽', N('Свіже паливо', 'Świeże paliwo', 'Fresh fuel')),
        I('checker_frame', 'frame', 110, '🏁', N('Фінішна клітинка', 'Szachownica', 'Checkered'), {ring: 'repeating-conic-gradient(#fff 0 10%,#1a1416 0 20%)'}),
        I('flame_frame', 'frame', 190, '🔥', N('Полум\'я', 'Płomienie', 'Flames'), {ring: 'conic-gradient(#ffd25a,#ff6a3a,#c2263a,#ff6a3a,#ffd25a)'}),
        I('route66', 'theme', 250, '🛣️', N('Траса 66', 'Droga 66', 'Route 66'), {bg: 'linear-gradient(180deg,#2a1640 0,#7a2a2a 55%,#2a1410 100%)'}),
        I('speedway', 'theme', 310, '🏟️', N('Гоночний стадіон', 'Tor wyścigowy', 'The speedway'), {bg: 'radial-gradient(circle at 50% 0,#3a4a6a 0,#141a2a 60%,#080a12 100%)'}),
        I('stickers', 'sticker', 30, '🏎️', N('Гоночні наліпки', 'Naklejki wyścigowe', 'Racing decals'), {pack: ['🏎️', '🏁', '🔧', '🏆', '⚡', '🌵']}),
        I('cap', 'outfit', 70, '🧢', N('Кепка механіка', 'Czapka mechanika', 'Mechanic cap'), {svg: 'cap', col: '#d23a3a', col2: '#ffffff'}),
        I('trophy', 'outfit', 160, '🌿', N('Вінок чемпіона', 'Wieniec mistrza', 'Champion\'s wreath'), {svg: 'laurel', col2: '#e8c56a'})
      ]
    },

    'dune-1': {
      cur: {icon: '💧', color: '#6ac8ff', name: N('краплі води', 'krople wody', 'drops of water'), one: N('крапля води', 'kropla wody', 'drop of water')},
      twist: {icon: '🏜️', name: N('Закон пустелі', 'Prawo pustyni', 'Law of the desert'), text: N('Вода — найцінніше на Арракісі: ціни найвищі серед усіх курсів. Зате бос арки — це збір прянощів: нагорода ×2 (+60).', 'Woda to skarb Arrakis: najwyższe ceny ze wszystkich kursów. Ale boss łuku to zbiór przyprawy: nagroda ×2 (+60).', 'Water is the most precious thing on Arrakis: the highest prices of any course. But an arc boss is a spice harvest: ×2 (+60).')},
      rules: {correct: 15, perfect: 10, boss: 30, boss_mult: 2, day: 5, review: 3, review_cap: 30, food_xp: 25, cup: 70},
      pet: {sp: 'mouse', name: N('Пустельна мишка', 'Pustynna myszka', 'Desert mouse'), food: '🌵', stages: ['🌾', '🐭', '🐁', '🐁'], aura: '#ffcf7a',
        talk: N('Пі-пі! Слово дня:', 'Pi-pi! Słowo dnia:', 'Squeak! Word of the day:')},
      items: [
        I('hint', 'hint', 16, '🔮', N('Видіння', 'Wizja', 'A vision')),
        I('stillsuit', 'freeze', 65, '🥽', N('Дистикомб', 'Filtrfrak', 'Stillsuit')),
        I('spice', 'boost', 85, '✨', N('Прянощі', 'Przyprawa', 'The spice')),
        I('cactus', 'food', 10, '🌵', N('Соковитий кактус', 'Soczysty kaktus', 'Juicy cactus')),
        I('sand_frame', 'frame', 150, '🏜️', N('Пісок Арракіса', 'Piasek Arrakis', 'Sands of Arrakis'), {ring: 'conic-gradient(#f2c46a,#a8642a,#f2c46a,#5a3a1a,#f2c46a)'}),
        I('eyes_frame', 'frame', 250, '🔵', N('Очі ібада', 'Oczy ibada', 'Eyes of Ibad'), {ring: 'conic-gradient(#3a7aff,#9fd0ff,#1a3a8a,#3a7aff)'}),
        I('sietch', 'theme', 330, '🕳️', N('Січ', 'Sicz', 'The sietch'), {bg: 'radial-gradient(circle at 50% 100%,#6a4a2a 0,#2a1a10 55%,#120a06 100%)'}),
        I('deep_desert', 'theme', 400, '🌅', N('Глибока пустеля', 'Głęboka pustynia', 'The deep desert'), {bg: 'linear-gradient(180deg,#3a2a4a 0,#a8642a 60%,#3a200e 100%)'}),
        I('desert', 'sticker', 40, '🪱', N('Знаки пустелі', 'Znaki pustyni', 'Desert signs'), {pack: ['🪱', '🏜️', '💧', '🌙', '🔥', '🦅']}),
        I('scarf', 'outfit', 95, '🧣', N('Пустельна хустка', 'Pustynna chusta', 'Desert scarf'), {svg: 'scarf', col: '#c8a46a', col2: '#8a5a2a'}),
        I('goggles', 'outfit', 180, '🥽', N('Окуляри від піску', 'Gogle na piasek', 'Sand goggles'), {svg: 'goggles'})
      ]
    },

    'mentalist-1': {
      cur: {icon: '☕', color: '#e9d8b8', name: N('чашки чаю', 'filiżanki herbaty', 'cups of tea'), one: N('чашка чаю', 'filiżanka herbaty', 'cup of tea')},
      twist: {icon: '🔍', name: N('Ідеальна дедукція', 'Idealna dedukcja', 'Perfect deduction'), text: N('Менталіст не вгадує — він знає. Урок на 100 % дає +20 зверху, а підказки дорожчі: справжній детектив обходиться без них.', 'Mentalista nie zgaduje — on wie. Lekcja na 100% daje +20, a podpowiedzi są droższe.', 'The mentalist doesn\'t guess, he knows. A 100% lesson adds +20, and hints cost more: a real detective doesn\'t need them.')},
      rules: {correct: 15, perfect: 10, flawless: 20, boss: 25, day: 5, review: 3, review_cap: 30, food_xp: 20, cup: 50},
      pet: {sp: 'cat', name: N('Кошеня', 'Kociak', 'Kitten'), food: '🐟', stages: ['🧶', '🐱', '🐈', '🐈‍⬛'], aura: '#f6dcb0',
        talk: N('Мяу. Слово дня:', 'Miau. Słowo dnia:', 'Meow. Word of the day:')},
      items: [
        I('hint', 'hint', 18, '🔍', N('Зачіпка', 'Trop', 'A lead')),
        I('couch', 'freeze', 50, '🛋️', N('Диван у CBI', 'Kanapa w CBI', 'The CBI couch')),
        I('tea', 'boost', 60, '🍵', N('Ідеальний чай', 'Idealna herbata', 'The perfect tea')),
        I('fish', 'food', 8, '🐟', N('Рибка', 'Rybka', 'Fish')),
        I('case_frame', 'frame', 120, '📁', N('Справа закрита', 'Sprawa zamknięta', 'Case closed'), {ring: 'conic-gradient(#c9a26b,#8a6a40,#c9a26b,#f6dcb0,#c9a26b)'}),
        I('red_frame', 'frame', 210, '🔴', N('Червоний слід', 'Czerwony ślad', 'Red trail'), {ring: 'conic-gradient(#9e2a2b,#ff6a6a,#5a1414,#9e2a2b)'}),
        I('cbi', 'theme', 260, '🏢', N('Офіс CBI', 'Biuro CBI', 'The CBI office'), {bg: 'radial-gradient(circle at 50% 0,#4a3a2e 0,#1b1414 60%,#0c0a0a 100%)'}),
        I('attic', 'theme', 320, '🕯️', N('Горище', 'Strych', 'The attic'), {bg: 'radial-gradient(circle at 50% 0,#3a2a20 0,#140e0c 60%,#080606 100%)'}),
        I('clues', 'sticker', 35, '🃏', N('Фокуси', 'Sztuczki', 'Tricks'), {pack: ['🃏', '🔍', '☕', '🎩', '🪙', '😏']}),
        I('vest', 'outfit', 80, '🎀', N('Метелик', 'Muszka', 'Bow tie'), {svg: 'bowtie', col: '#9e2a2b'}),
        I('tophat', 'outfit', 150, '🎩', N('Капелюх фокусника', 'Kapelusz iluzjonisty', 'Magician\'s hat'), {svg: 'tophat', col: '#9e2a2b'})
      ]
    },

    'zootopia': {
      cur: {icon: '🍭', color: '#ff7ab8', name: N('лапсікли', 'łapsikle', 'pawpsicles'), one: N('лапсікл', 'łapsikl', 'pawpsicle')},
      twist: {icon: '🦊', name: N('Афера', 'Przekręt', 'The hustle'), text: N('Хитрість окупається: 15 % від кожної покупки повертається назад. Тут вигідно витрачати й оновлювати спутника.', 'Spryt się opłaca: 15% każdego zakupu wraca do ciebie. Tu warto wydawać i stroić towarzysza.', 'Being clever pays: 15% of every purchase comes back to you. Here it pays to spend and dress up your companion.')},
      rules: {correct: 15, perfect: 10, boss: 25, day: 5, review: 3, review_cap: 30, cashback_pct: 15, food_xp: 20, cup: 50},
      pet: {sp: 'sloth', name: N('Лінивець', 'Leniwiec', 'Sloth'), food: '🥕', stages: ['🌿', '🦥', '🦥', '🦥'], aura: '#9fe0a8',
        talk: N('При… віт… Слово… дня:', 'Cześ… ć… Słowo… dnia:', 'Hel… lo… Word… of the day:')},
      items: [
        I('hint', 'hint', 10, '🗺️', N('Підказка інформатора', 'Cynk od informatora', 'A tip from an informant')),
        I('dmv', 'freeze', 45, '🐌', N('Черга в ДАІ', 'Kolejka w urzędzie', 'The DMV queue')),
        I('carrot_pen', 'boost', 55, '🥕', N('Морква-диктофон', 'Marchewka-dyktafon', 'Carrot recorder pen')),
        I('carrot', 'food', 6, '🥕', N('Морквина', 'Marchewka', 'Carrot')),
        I('badge_frame', 'frame', 100, '🛡️', N('Значок ZPD', 'Odznaka ZPD', 'ZPD badge'), {ring: 'conic-gradient(#f2c94c,#2a5aa8,#f2c94c,#b8902a,#f2c94c)'}),
        I('neon_frame', 'frame', 180, '🌈', N('Неон Тундратауна', 'Neon miasta', 'City neon'), {ring: 'conic-gradient(#ff7ab8,#7ad8ff,#9fe07a,#ffd27a,#ff7ab8)'}),
        I('downtown', 'theme', 240, '🏙️', N('Центр міста', 'Centrum miasta', 'Downtown'), {bg: 'radial-gradient(circle at 50% 0,#1f7a7a 0,#0f3d4a 60%,#06181e 100%)'}),
        I('rainforest', 'theme', 300, '🌴', N('Тропічний район', 'Dzielnica deszczowa', 'Rainforest district'), {bg: 'radial-gradient(circle at 50% 0,#2f8a4a 0,#0f3a20 60%,#06180c 100%)'}),
        I('paws', 'sticker', 25, '🐾', N('Лапки', 'Łapki', 'Paws'), {pack: ['🐾', '🦊', '🐰', '🥕', '🍭', '🚓']}),
        I('shades', 'outfit', 70, '🕶️', N('Окуляри афериста', 'Okulary kombinatora', 'Hustler shades'), {svg: 'shades'}),
        I('police_cap', 'outfit', 130, '👮', N('Поліцейський кашкет', 'Czapka policyjna', 'Police cap'), {svg: 'policecap', col: '#2a5aa8', col2: '#f2c94c'})
      ]
    }
  };
})();
