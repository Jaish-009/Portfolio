// --- Blueprint Network Animation ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particlesArray;

// Function to set up the canvas dimensions and initialize particles
function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
}

// Particle class to create individual points
class Particle {
    constructor(x, y, directionX, directionY, size) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = 'rgba(59, 130, 246, 0.5)'; // A cool blue color
    }
    // Method to draw a particle on the canvas
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    // Method to update particle's position and handle wall collision
    update() {
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
    }
}

// Function to create an array of particles
function initParticles() {
    particlesArray = [];
    const numberOfParticles = (canvas.height * canvas.width) / 12000;
    for (let i = 0; i < numberOfParticles; i++) {
        const size = (Math.random() * 1.5) + 1;
        const x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        const y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        const directionX = (Math.random() * 0.4) - 0.2;
        const directionY = (Math.random() * 0.4) - 0.2;
        particlesArray.push(new Particle(x, y, directionX, directionY, size));
    }
}

// Function to draw lines between nearby particles
function connectParticles() {
    const connectDistance = 120;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            const dx = particlesArray[a].x - particlesArray[b].x;
            const dy = particlesArray[a].y - particlesArray[b].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectDistance) {
                const opacity = 1 - (distance / connectDistance);
                ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`; // A nice purple
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

// Animation loop to clear, update, and draw each frame
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connectParticles();
}

// Event listener to resize the canvas when the window is resized
window.addEventListener('resize', setupCanvas);

// Initial setup and start of the animation
setupCanvas();
animate();


// --- Existing Portfolio JS ---

// Sticky Header on Scroll
const header = document.getElementById('header');
window.onscroll = function() {
    if (window.scrollY > 50) {
        header.classList.add('bg-gray-900/80', 'backdrop-blur-sm', 'shadow-lg');
    } else {
        header.classList.remove('bg-gray-900/80', 'backdrop-blur-sm', 'shadow-lg');
    }
};

// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Close mobile menu when a link is clicked
const mobileMenuLinks = mobileMenu.querySelectorAll('a');
mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// Project Filtering Logic
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const filter = button.dataset.filter;
        projectCards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.style.display = 'flex'; // Use flex for project cards
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// AI Insight Modal Logic
const modal = document.getElementById('ai-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalContent = document.getElementById('ai-modal-content');
const insightBtns = document.querySelectorAll('.ai-insight-btn');

const apiKey = ""; // API key will be injected by the environment
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

// Function to call the Gemini API with exponential backoff for retries
async function generateContentWithBackoff(prompt) {
    let retries = 3;
    let delay = 1000;
    while (retries > 0) {
        try {
            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
            };
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];
            if (candidate && candidate.content?.parts?.[0]?.text) {
                return candidate.content.parts[0].text;
            } else {
                throw new Error("Invalid response structure from API.");
            }
        } catch (error) {
            console.error("API call failed:", error);
            retries--;
            if (retries === 0) {
                return "Sorry, I couldn't generate insights for this project at the moment. Please try again later.";
            }
            await new Promise(res => setTimeout(res, delay));
            delay *= 2;
        }
    }
}

// Add click listeners to all "Get AI Insights" buttons
insightBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const card = e.target.closest('.project-card');
        const title = card.querySelector('.project-title').innerText;
        const description = card.querySelector('.project-description').innerText;

        modal.classList.remove('hidden');
        modalContent.innerHTML = '<div class="flex justify-center items-center h-48"><div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div></div>';

        const prompt = `As a tech recruiter, analyze the following project and provide a brief, insightful summary for another recruiter. Highlight the key skills demonstrated, potential challenges overcome, and the business value or impact of the project. Format the output in Markdown.

        **Project Title:** ${title}
        **Project Description:** ${description}`;

        const aiResponse = await generateContentWithBackoff(prompt);
        
        // Simple Markdown to HTML conversion
        let htmlResponse = aiResponse
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^(#{1,6})\s*(.*)/gm, (match, hashes, content) => `<h${hashes.length} class="text-xl font-bold mt-4 mb-2">${content}</h${hashes.length}>`)
            .replace(/\n/g, '<br>');

        modalContent.innerHTML = htmlResponse;
    });
});

// Event listener to close the modal
closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Event listener to close the modal by clicking outside of it
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});
