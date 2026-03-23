// --- 1. THE DATA SOURCE ---
const originalCompliments = [
    "You’re sweeter than an Oreo dipped in milk (but way more precious).",
    "I love that your taste is as refined as a KitKat Dark—not too sweet, just perfect.",
    "If you were a snack, you’d be an Eet-Sum-Mor biscuit, because I always want more of your time.",
    "I’d travel to every Food Lover’s in Cape Town just to find you the perfect brownie.",
    "You’re cooler than your favorite frozen yogurt on a hot day.",
    "You deserve all the ice cream in the world and then some.",
    "I hope your day is as satisfying as that first crunch of a salty Lays chip.",
    "You're more comforting than a box of Eet-Sum-Mors and a warm cup of tea.",
    "I love that I know the 'last resort' is Thai Sweet Chili, but you're always my first choice.",
    "You make my heart melt faster than a bowl of frozen yogurt.",
    "I love your 'all-time favorites,' but you are officially mine.",
    "You’re the 'extra' in my Eet-Sum-Mor.",
    "You are the best part of my day, every single day.",
    "I love how you always stay true to yourself.",
    "You have a way of making everyone around you feel special.",
    "I am constantly in awe of your strength.",
    "You’re not just a student; you’re a visionary.",
    "Your passion is what makes you so beautiful.",
    "The way you handle pressure is a masterclass in grace.",
    "I hope you see yourself the way I see you.",
    "You are a light that never fades.",
    "I’m so lucky to be the one you choose to share your life with.",
    "Your intelligence is one of your most attractive qualities.",
    "You make even the hardest days feel worth it.",
    "I love that I can always count on you.",
    "You are my favorite place to be.",
    "You’re doing a great job, even when you don't feel like it.",
    "I love how your mind finds beauty in the small things.",
    "You are the peace I didn't know I was looking for.",
    "I’m so proud of the way you balance everything.",
    "Your kindness is a superpower.",
    "You have a heart that matches your beautiful smile.",
    "I love how you never settle for less than your best.",
    "You are my favorite person to grow with.",
    "The world is better because you're in it.",
    "You make me want to be a better man.",
    "Your laugh is the sound of home to me.",
    "I believe in your dreams as much as you do.",
    "You are incredibly resilient.",
    "You have such a calming presence.",
    "I love the way you love.",
    "You are a rare and precious soul.",
    "Don't ever let the world change your kind heart.",
    "You are far more than enough.",
    "Your potential is literally limitless.",
    "I love seeing the world through your eyes.",
    "You are my greatest adventure.",
    "You are the definition of elegance and strength.",
    "I’m so glad we get to do life together.",
    "Your energy is absolutely magnetic.",
    "I love how you stand up for what you believe in.",
    "You are a masterpiece.",
    "I cherish every conversation we have.",
    "You are the dream I never want to wake up from.",
    "Your bravery inspires me more than you know.",
    "You are a blessing to everyone who knows you.",
    "I love the way you challenge me to think deeper.",
    "You are the most beautiful person I know, inside and out.",
    "I’m always in your corner, no matter what.",
    "You are simply unforgettable.",
    "I love your 'never-give-up' attitude.",
    "You’ve been on my mind all day."
];

const originalVerses = [
    "Psalm 139:14 - I praise you because I am fearfully and wonderfully made.",
    "Proverbs 31:25 - She is clothed with strength and dignity.",
    "Philippians 4:13 - I can do all things through Christ who strengthens me.",
    "Joshua 1:9 - Be strong and courageous. Do not be afraid.",
    "Psalm 46:5 - God is within her, she will not fall.",
    "Jeremiah 29:11 - For I know the plans I have for you, plans for hope and a future.",
    "Isaiah 40:31 - But those who hope in the Lord will renew their strength.",
    "Proverbs 3:5 - Trust in the Lord with all your heart.",
    "Song of Songs 4:7 - You are altogether beautiful, my darling; there is no flaw in you.",
    "Psalm 23:1 - The Lord is my shepherd, I shall not be in want.",
    "Romans 8:31 - If God is for us, who can be against us?",
    "Matthew 11:28 - Come to me, all you who are weary, and I will give you rest.",
    "Psalm 34:18 - The Lord is close to the brokenhearted.",
    "1 Corinthians 16:14 - Do everything in love.",
    "John 14:27 - Peace I leave with you; my peace I give you.",
    "Zephaniah 3:17 - The Lord your God is in your midst; He will quiet you by His love.",
    "Psalm 121:1 - I lift up my eyes to the mountains—where does my help come from?",
    "Proverbs 4:23 - Above all else, guard your heart.",
    "2 Timothy 1:7 - For God has not given us a spirit of fear, but of power and love.",
    "Psalm 27:1 - The Lord is my light and my salvation—whom shall I fear?",
    "Exodus 14:14 - The Lord will fight for you; you need only to be still.",
    "Psalm 119:105 - Your word is a lamp for my feet, a light on my path.",
    "Romans 15:13 - May the God of hope fill you with all joy and peace.",
    "1 Peter 5:7 - Cast all your anxiety on him because he cares for you.",
    "Psalm 37:4 - Delight yourself in the Lord; he will give you the desires of your heart.",
    "Lamentations 3:22 - Because of the Lord’s great love we are not consumed.",
    "Matthew 19:26 - With man this is impossible, but with God all things are possible.",
    "Psalm 143:8 - Let the morning bring me word of your unfailing love.",
    "Isaiah 41:10 - So do not fear, for I am with you.",
    "Psalm 46:10 - Be still, and know that I am God.",
    "Hebrews 11:1 - Faith is confidence in what we hope for.",
    "Proverbs 16:3 - Commit to the Lord whatever you do.",
    "Psalm 91:4 - He will cover you with his feathers.",
    "John 15:12 - My command is this: Love each other as I have loved you.",
    "Psalm 107:1 - Give thanks to the Lord, for he is good.",
    "Romans 8:28 - God works for the good of those who love him.",
    "Psalm 138:8 - The Lord will fulfill his purpose for me.",
    "Numbers 6:24 - The Lord bless you and keep you.",
    "Proverbs 31:30 - A woman who fears the Lord is to be praised.",
    "Isaiah 43:2 - When you pass through the waters, I will be with you.",
    "1 Thessalonians 5:11 - Encourage one another and build each other up.",
    "Psalm 16:11 - You fill me with joy in your presence.",
    "Colossians 3:23 - Whatever you do, work at it with all your heart.",
    "Psalm 56:3 - When I am afraid, I put my trust in you.",
    "2 Corinthians 12:9 - My grace is sufficient for you.",
    "James 1:5 - If any of you lacks wisdom, you should ask God.",
    "Psalm 34:8 - Taste and see that the Lord is good.",
    "Ephesians 3:20 - God is able to do immeasurably more than all we ask.",
    "Proverbs 18:10 - The name of the Lord is a fortified tower.",
    "Psalm 62:6 - Truly he is my rock and my salvation.",
    "Hebrews 13:5 - Never will I leave you; never will I forsake you.",
    "Deuteronomy 31:6 - Be strong and courageous.",
    "Psalm 118:24 - The Lord has done it this very day; let us rejoice.",
    "1 John 4:19 - We love because he first loved us.",
    "Psalm 147:3 - He heals the brokenhearted and binds up their wounds.",
    "Isaiah 26:3 - You will keep in perfect peace those whose minds are steadfast.",
    "Proverbs 3:6 - In all your ways submit to him.",
    "Matthew 5:14 - You are the light of the world.",
    "Psalm 18:2 - The Lord is my rock, my fortress and my deliverer.",
    "Galatians 5:22 - But the fruit of the Spirit is love, joy, and peace.",
    "Psalm 103:1 - Praise the Lord, my soul; all my inmost being.",
    "Philippians 4:6 - Do not be anxious about anything.",
    "Song of Songs 2:10 - Rise up, my darling, my beautiful one, come with me.",
    "Psalm 30:5 - Weeping may stay for the night, but rejoicing comes in the morning.",
    "Romans 12:12 - Be joyful in hope, patient in affliction.",
    "Psalm 55:22 - Cast your cares on the Lord and he will sustain you.",
    "1 Corinthians 13:4 - Love is patient, love is kind.",
    "Micah 6:8 - To act justly and to love mercy and to walk humbly with your God.",
    "Psalm 32:8 - I will instruct you and teach you in the way you should go.",
    "Hebrews 10:24 - Consider how we may spur one another on toward love.",
    "John 16:33 - In this world you will have trouble. But take heart!",
    "Psalm 84:11 - For the Lord God is a sun and shield.",
    "Proverbs 31:10 - A wife of noble character is worth far more than rubies.",
    "Matthew 6:33 - But seek first his kingdom and his righteousness.",
    "Psalm 119:114 - You are my refuge and my shield.",
    "Mark 10:27 - With man this is impossible, but not with God.",
    "Psalm 145:18 - The Lord is near to all who call on him.",
    "Ephesians 4:32 - Be kind and compassionate to one another.",
    "Proverbs 17:17 - A friend loves at all times.",
    "Psalm 126:3 - The Lord has done great things for us.",
    "Colossians 3:14 - Put on love, which binds them all together in perfect unity.",
    "Psalm 136:1 - Give thanks to the Lord, for he is good.",
    "1 Peter 4:8 - Love each other deeply, because love covers a multitude of sins.",
    "Psalm 20:4 - May he give you the desire of your heart.",
    "Isaiah 54:10 - My unfailing love for you will not be shaken.",
    "Psalm 94:19 - Your consolation brought me joy.",
    "2 Corinthians 5:7 - For we live by faith, not by sight.",
    "Proverbs 15:1 - A gentle answer turns away wrath.",
    "Psalm 100:5 - For the Lord is good and his love endures forever.",
    "Romans 5:5 - God’s love has been poured out into our hearts.",
    "Psalm 40:1 - I waited patiently for the Lord; he turned to me.",
    "1 Chronicles 16:11 - Look to the Lord and his strength.",
    "Psalm 115:14 - May the Lord cause you to flourish.",
    "Ephesians 2:8 - For it is by grace you have been saved.",
    "Psalm 34:10 - Those who seek the Lord lack no good thing.",
    "Proverbs 31:26 - She speaks with wisdom, and faithful instruction is on her tongue.",
    "Philippians 1:6 - He who began a good work in you will carry it on.",
    "Psalm 33:22 - May your unfailing love be with us, Lord.",
    "Revelation 21:4 - He will wipe every tear from their eyes.",
    "Psalm 121:8 - The Lord will watch over your coming and going."
];

// --- 2. TRACKING ARRAYS (The "State") ---
let complimentsRemaining = [...originalCompliments];
let versesRemaining = [...originalVerses];

// Helper to shuffle an array (Fisher-Yates algorithm)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Initial shuffle
shuffle(complimentsRemaining);
shuffle(versesRemaining);

// --- 3. THE DISPLAY LOGIC ---
function showItem(type) {
    const textElement = document.getElementById('display-text');
    let selectedText = "";

    textElement.style.opacity = 0;

    setTimeout(() => {
        if (type === 'compliment') {
            // If we ran out, reset and reshuffle
            if (complimentsRemaining.length === 0) {
                complimentsRemaining = [...originalCompliments];
                shuffle(complimentsRemaining);
            }
            // "Pop" the last one off so it's removed from tracking
            selectedText = complimentsRemaining.pop();
        } else {
            // Same for verses
            if (versesRemaining.length === 0) {
                versesRemaining = [...originalVerses];
                shuffle(versesRemaining);
            }
            selectedText = versesRemaining.pop();
        }

        textElement.innerText = selectedText;
        textElement.style.opacity = 1;
        textElement.classList.add('fade-in');
        
        setTimeout(() => textElement.classList.remove('fade-in'), 500);
    }, 300);
}
