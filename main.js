const generateBtn = document.getElementById('generate');
const numbersContainer = document.getElementById('numbers');
const themeToggle = document.getElementById('checkbox');
const body = document.body;

// Function to set theme
const setTheme = (theme) => {
    body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.checked = theme === 'dark';
};

// Event listener for the toggle switch
themeToggle.addEventListener('change', () => {
    const newTheme = themeToggle.checked ? 'dark' : 'light';
    setTheme(newTheme);
});

// Check for saved theme on page load
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);


generateBtn.addEventListener('click', () => {
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    numbersContainer.innerHTML = '';
    for (const number of numbers) {
        const numberEl = document.createElement('div');
        numberEl.classList.add('number');
        numberEl.textContent = number;
        numbersContainer.appendChild(numberEl);
    }
});