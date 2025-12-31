// Initialize EmailJS with your public key (v4 syntax)
(function() {
    emailjs.init({
        publicKey: 'Ag6pfXG5NQR3EUBcE'
    });
})();

const form = document.getElementById('contact-form');

form.addEventListener('submit', handleSubmit);

async function handleSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    try {
        await emailjs.send('service_4vv1jqh', 'template_l3seqch', {
            from_name: name,
            from_email: email,
            message: message,
            to_email: 'rywu@davidson.edu'
        });

        alert(`Thank you ${name} for your message! I'll get back to you soon.`);
        
        const inputs = document.querySelectorAll('#name, #email, #message');
        inputs.forEach(input => input.value = '');
    } catch (error) {
        alert('Sorry, there was an error sending your message. Please try again.');
        console.error('EmailJS error:', error);
    }
}