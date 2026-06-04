const tabs = document.querySelectorAll(".tab");

const links = document.querySelectorAll("nav a");
      links.forEach((link) => {
        link.addEventListener("click", () => {
          // deactivate all links and hide all tabs
          links.forEach((l) => l.classList.remove("active"));
          tabs.forEach((t) => t.style.display = "none");

          // activate the clicked link and show the corresponding tab
          link.classList.add("active");
          const correspondingTab = document.getElementById("tab-"+link.innerHTML);
          if (correspondingTab) {
            correspondingTab.style.display = "flex";
          }
          else{
            console.warn("No corresponding tab found for link: " + link.innerHTML + ". Make sure there is a tab with id 'tab-" + link.innerHTML + "'.");
          }
        });
      });
