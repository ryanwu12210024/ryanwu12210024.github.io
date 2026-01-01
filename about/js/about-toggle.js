function togglePersonalSection() {
    const section = document.getElementById('personal-section');
    const toggleText = document.getElementById('toggle-text');
    const toggleIcon = document.getElementById('toggle-icon');
    const isHidden = section.classList.contains('max-h-0');
    
    if (isHidden) {
        section.classList.remove('max-h-0', 'opacity-0');
        section.classList.add('max-h-[2000px]', 'opacity-100');
        toggleText.textContent = '🔼 Show less';
        toggleIcon.style.transform = 'rotate(180deg)';
    } else {
        section.classList.add('max-h-0', 'opacity-0');
        section.classList.remove('max-h-[2000px]', 'opacity-100');
        toggleText.textContent = '🔽 Learn more about me';
        toggleIcon.style.transform = 'rotate(0deg)';
    }
}