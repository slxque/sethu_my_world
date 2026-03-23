// Separate counters
let compIndex = 0;
let verseIndex = 0;

const complimentList = [
    "You are my favorite thought.",
    "I believe in you more than anything.",
    "You're doing so much better than you think you are.",
    "Your hard work is going to pay off, just watch.",
    "I'm so lucky I get to be the one by your side.",
    "Your smile is literally the highlight of my day.",
    "Take a deep breath—you've got this.",
    "I'm so proud of the woman you're becoming.",
    "Just a little something to match your smile."
    // Add the rest of your 50 compliments here
];

const verseList = [
    "Philippians 4:13 - I can do all things through Christ who strengthens me.",
    "Joshua 1:9 - Be strong and courageous. Do not be afraid.",
    "Psalm 139:14 - You are fearfully and wonderfully made.",
    "Song of Songs 4:7 - You are altogether beautiful, my darling.",
    "Psalm 46:5 - God is within her, she will not fall.",
    "Jeremiah 29:11 - For I know the plans I have for you.",
    "Numbers 6:24 - The Lord bless you and keep you."
    // Add the rest of your 15+ verses here
];

function showItem(type) {
    const textElement = document.getElementById('display-text');
    let selectedText = "";

    // Fade out effect
    textElement.style.opacity = 0;

    setTimeout(() => {
        if (type === 'compliments') {
            selectedText = complimentList[compIndex];
            compIndex = (compIndex + 1) % complimentList.length;
        } else {
            selectedText = verseList[verseIndex];
            verseIndex = (verseIndex + 1) % verseList.length;
        }

        textElement.innerText = selectedText;
        textElement.style.opacity = 1;
        textElement.classList.add('fade-in');

        // Remove animation class after it plays so it can play again
        setTimeout(() => textElement.classList.remove('fade-in'), 500);
    }, 300);
}