import { DOMParser, Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

try {
  const res = await fetch("https://note.com/kiyoshidainagon/likes");

  const text = await res.text();

  const doc = new DOMParser().parseFromString(
    text,
    "text/html",
  );

  if (!doc) throw new Error("no document.");

  const notes = doc.querySelectorAll(".o-textNote");

  const linkList = Array.from(notes).map(($note) => {
    const $anchor = ($note as Element).querySelector(".o-textNote__link");
    return $anchor?.getAttribute("href");
  });
  console.log(linkList);
} catch (e) {
  console.error(e);
}
