function showSidebar() {
  //Store the svg as a string
  const hamburgerMenuSVG = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>`;
  const closeMenuSVG = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg>`;

  const sidebar = document.querySelector(".sidebar");
  const hamburgerMenu = document.querySelector(".hamburger__menu");

  //boolean to see if sidebar is flex or none. is true if it is flex
  const isSidebarVisible = sidebar.style.display === "flex";


  if (isSidebarVisible) {
    //if sidebar is already visible. Close it and set the X to hamburger menu
    sidebar.style.display = "none";
    hamburgerMenu.innerHTML = hamburgerMenuSVG;
  } else {
    //if sidebar is not visible. Open it and set the hamburger menu to X
    sidebar.style.display = "flex";
    hamburgerMenu.innerHTML = closeMenuSVG;
  }
}
