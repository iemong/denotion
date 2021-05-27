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

  const myMap = new Map<string, string>();

  Array.from(notes).forEach(($note) => {
    const $anchor = ($note as Element).querySelector(".o-textNote__link");
    const $title = ($note as Element).querySelector(".o-textNote__title > a");
    const link = $anchor?.getAttribute("href") || "";
    myMap.set(
      $title?.textContent.trim() || "",
      /^https:\/\//.test(link) ? link : `https://note.com${link}`,
    );
  });

  console.log(myMap);

  const databaseResponse = await fetch(
    `https://api.notion.com/v1/databases/${config().DATABASE_ID}/query`,
    {
      method: "post",
      headers: new Headers({
        "Authorization": `Bearer ${config().API_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2021-05-13",
      }),
      body: JSON.stringify({
        "page_size": 100,
      }),
    },
  );
  const database = await databaseResponse.json();
  const urlList = database.results.map((d: any) => d.properties.URL.url);
  console.log(urlList);

  // TODO 1秒間に3回までしかリクエストできないらしいから、時間をずらす
  const fetchers = Array.from(myMap.values()).map((k) => {
    if (urlList.includes(myMap.get(k))) return;
    return fetch("https://api.notion.com/v1/pages", {
      method: "post",
      headers: new Headers({
        "Authorization": `Bearer ${config().API_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2021-05-13",
      }),
      body: JSON.stringify({
        "parent": { "database_id": config().DATABASE_ID },
        "properties": {
          "Name": {
            "title": [
              {
                "text": {
                  "content": k,
                },
              },
            ],
          },
          "URL": {
            "url": myMap.get(k),
          },
        },
      }),
    });
  }).filter((fetcher) => !!fetcher);
  await Promise.all(fetchers).then((a) => {
    console.log(a);
  });
} catch (e) {
  console.error(e);
}
