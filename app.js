/* reveal elements as screen is scrolled */
function reveal() {
  var reveals = document.querySelectorAll(".reveal");

  for (var i = 0; i < reveals.length; i++) {
    var windowHeight = window.innerHeight;
    var elementTop = reveals[i].getBoundingClientRect().top;
    var elementVisible = 150;

    if (elementTop < windowHeight - elementVisible) {
      reveals[i].classList.add("active");
    } else {
      reveals[i].classList.remove("active");
    }
  }
}

window.addEventListener("scroll", reveal);

/* show hamburger menu */
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", mobileMenu);

function mobileMenu() {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
}

/* close hamburger menu on item click */
const navLink = document.querySelectorAll(".nav-link");

navLink.forEach((n) => {
  n.addEventListener("click", closeMenu);
});

function closeMenu() {
  hamburger.classList.remove("active");
  navMenu.classList.remove("active");
}

/* dark mode */
const colorModeButton = document.querySelector(".color-mode");
colorModeButton.addEventListener("click", colorMode);

function colorMode() {
  var element = document.body;
  var navBar = document.querySelector(".navbar");
  element.classList.toggle("dark-mode");
  navBar.classList.toggle("dark-mode");
  navMenu.classList.toggle("dark-mode");
  hamburger.classList.toggle("dark-mode");
}

function scrollToSection(section) {
  window.scrollTo({
    top: document.querySelector(section).offsetTop,
    behavior: 'smooth'
  });
}
