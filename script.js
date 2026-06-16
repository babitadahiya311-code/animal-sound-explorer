const animals = [
  { name: "Cow", category: "farm", emoji: "🐮", color: "#ffcc67", fact: "Cows moo to find friends and talk to their calves.", pattern: [164, 132, 110] },
  { name: "Pig", category: "farm", emoji: "🐷", color: "#ff9ab5", fact: "Pigs use many grunts and squeals to share how they feel.", pattern: [220, 170, 220, 140] },
  { name: "Rooster", category: "farm", emoji: "🐓", color: "#ff7b54", fact: "Roosters crow to announce their territory at sunrise.", pattern: [520, 620, 740, 560] },
  { name: "Lion", category: "jungle", emoji: "🦁", color: "#f2a541", fact: "A lion roar can travel several miles across open land.", pattern: [96, 82, 68, 58] },
  { name: "Monkey", category: "jungle", emoji: "🐒", color: "#b98152", fact: "Monkeys chatter, whoop, and call to warn their troop.", pattern: [420, 530, 470, 590, 380] },
  { name: "Parrot", category: "jungle", emoji: "🦜", color: "#55c66f", fact: "Parrots copy sounds using a special voice organ called a syrinx.", pattern: [760, 930, 820, 1040] },
  { name: "Dolphin", category: "ocean", emoji: "🐬", color: "#4cc9f0", fact: "Dolphins whistle and click to communicate and echolocate.", pattern: [880, 1200, 980, 1320] },
  { name: "Whale", category: "ocean", emoji: "🐋", color: "#5b8def", fact: "Whales sing long songs that can travel through deep water.", pattern: [88, 124, 104, 78] },
  { name: "Seal", category: "ocean", emoji: "🦭", color: "#9fb8c7", fact: "Seals bark and trill on shore and underwater.", pattern: [260, 310, 230, 290] },
  { name: "Dog", category: "pets", emoji: "🐶", color: "#d49b63", fact: "Dogs bark, howl, and whine to communicate with people and dogs.", pattern: [310, 210, 310] },
  { name: "Cat", category: "pets", emoji: "🐱", color: "#f7c873", fact: "Cats meow mostly to communicate with humans.", pattern: [520, 660, 580] },
  { name: "Bird", category: "pets", emoji: "🐦", color: "#64d2ff", fact: "Pet birds chirp and sing to stay social and curious.", pattern: [900, 1100, 980, 1250] }
];

const grid = document.querySelector("#animals");
const filters = document.querySelectorAll(".filter-btn");
const scoreDisplay = document.querySelector("#score");
const mysteryButton = document.querySelector("#mysterySound");
const newRoundButton = document.querySelector("#newRound");
const guessOptions = document.querySelector("#guessOptions");
const feedback = document.querySelector("#feedback");

let audioContext;
let currentAnimal = null;
let score = 0;

function getAudioContext() {
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
}

function playAnimalSound(animal, button) {
  const context = getAudioContext();
  const now = context.currentTime;
  button?.classList.add("playing");

  animal.pattern.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = index % 2 ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.18);
    gain.gain.setValueAtTime(0.0001, now + index * 0.18);
    gain.gain.exponentialRampToValueAtTime(0.2, now + index * 0.18 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.18 + 0.16);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now + index * 0.18);
    oscillator.stop(now + index * 0.18 + 0.18);
  });

  window.setTimeout(() => button?.classList.remove("playing"), animal.pattern.length * 190);
}

function renderAnimals(category = "all") {
  const visibleAnimals = category === "all" ? animals : animals.filter((animal) => animal.category === category);
  grid.innerHTML = visibleAnimals.map((animal, index) => `
    <article class="animal-card" style="--card-color: ${animal.color}; animation-delay: ${index * 45}ms">
      <div class="animal-image" aria-hidden="true">${animal.emoji}</div>
      <span class="category-badge">${animal.category}</span>
      <h3>${animal.name}</h3>
      <p>${animal.fact}</p>
      <button class="sound-btn" type="button" data-animal="${animal.name}">🔊 Play ${animal.name}</button>
    </article>
  `).join("");
}

function startRound() {
  currentAnimal = animals[Math.floor(Math.random() * animals.length)];
  const options = new Set([currentAnimal]);
  while (options.size < 4) {
    options.add(animals[Math.floor(Math.random() * animals.length)]);
  }
  guessOptions.innerHTML = [...options]
    .sort(() => Math.random() - 0.5)
    .map((animal) => `<button class="guess-btn" type="button" data-guess="${animal.name}">${animal.emoji} ${animal.name}</button>`)
    .join("");
  feedback.className = "feedback";
  feedback.textContent = "Mystery animal selected. Play the sound, then make your guess!";
}

function handleGuess(name) {
  if (!currentAnimal) return;
  const correct = name === currentAnimal.name;
  feedback.className = `feedback ${correct ? "correct" : "incorrect"}`;
  if (correct) {
    score += 10;
    scoreDisplay.textContent = score;
    feedback.textContent = `Correct! ${currentAnimal.emoji} ${currentAnimal.name} was the mystery animal. +10 points!`;
    window.setTimeout(startRound, 1200);
  } else {
    feedback.textContent = `Try again. That sound was not ${name}.`;
  }
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    filters.forEach((filter) => filter.classList.remove("active"));
    button.classList.add("active");
    renderAnimals(button.dataset.category);
  });
});

grid.addEventListener("click", (event) => {
  const button = event.target.closest(".sound-btn");
  if (!button) return;
  const animal = animals.find((item) => item.name === button.dataset.animal);
  playAnimalSound(animal, button);
});

mysteryButton.addEventListener("click", () => {
  if (!currentAnimal) startRound();
  playAnimalSound(currentAnimal, mysteryButton);
});

newRoundButton.addEventListener("click", startRound);

guessOptions.addEventListener("click", (event) => {
  const button = event.target.closest(".guess-btn");
  if (button) handleGuess(button.dataset.guess);
});

renderAnimals();
startRound();
