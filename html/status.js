/**
 *
 */
async function load () {
  let status = await fetch("https://hyarcade.xyz/resources/serverStatus.json", {
    cache: "no-store"
  });
  status = await status.json();
  const main = document.querySelector("main");
  const mw = status.mw ? "Online" : "Inactive";
  const arc = status.arc ? "Online" : "Inactive";
  const marc = status.marc ? "Online" : "Inactive";
  const interact = status.slash ? "Online" : "Inactive";
  const db = status.database ? "Operational" : "Corrupted";
  main.innerHTML = `Hypixel status : ${status.Hypixel}\n`;
  main.innerHTML += `Mojang session servers : ${status.MSession}\n`;
  main.innerHTML += `Mojang account servers : ${status.MAcc}\n`;
  main.innerHTML += `Mojang auth servers: ${status.MAuth}\n`;
  main.innerHTML += `Mini walls bot : ${mw}\n`;
  main.innerHTML += `Arcade bot : ${arc}\n`;
  main.innerHTML += `Arcade bot - Micro : ${marc}\n`;
  main.innerHTML += `Interactions : ${interact}\n`;
  main.innerHTML += `Database : ${db}`;
}

window.addEventListener("load", load);
