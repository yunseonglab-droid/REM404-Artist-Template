import { siteConfig } from "./site-config.js";

document.title = document.title.replace("ART ARCHIVE", siteConfig.brand);

document.querySelectorAll("[data-site-brand]").forEach((element) => {
  element.textContent = siteConfig.brand;
});

document.querySelectorAll("[data-site-version]").forEach((element) => {
  element.textContent = siteConfig.version;
});
