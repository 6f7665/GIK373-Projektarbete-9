document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("nav");
  if (!nav) return;

  fetch("sitemap.xml")
    .then(response => {
      if (!response.ok) throw new Error("Kunde inte hämta sitemap.xml");
      return response.text();
    })
    .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
    .then(data => {
      const urls = Array.from(data.querySelectorAll("url > loc"));
      const ul = document.createElement("ul");

      const items = urls.map(loc => {
        const url = new URL(loc.textContent);
        const path = url.pathname.replace(/\/$/, "");
        const filename = path.split("/").pop();
        const label = filename === "index.html"
          ? "Hem"
          : filename === "kontakt.html"
            ? "Kontakt"
            : decodeURIComponent(filename.replace(".html", "").replace(/-/g, " "));
        
        return {
          href: url.pathname,
          label: label.charAt(0).toUpperCase() + label.slice(1),
          order: filename === "index.html" ? -1 : filename === "kontakt.html" ? 1 : 0
        };
      });

      // Sortera: index.html först, kontakt.html sist, andra i mitten
      items.sort((a, b) => a.order - b.order);

      items.forEach(item => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = item.href;
        a.textContent = item.label;
        li.appendChild(a);
        ul.appendChild(li);
      });

      nav.appendChild(ul);
    })
    .catch(error => {
      console.error("Fel vid hämtning/generering av navigering:", error);
    });
});
