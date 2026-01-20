function toggleMenu() {
    const nav = document.getElementById('nav');
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
}

function validateForm() {
    alert('Thank you for your message. This form is for demonstration purposes only.');
    return false;
}
