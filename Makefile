all: run lint
lint:
	deno lint index.ts
fmt:
	deno fmt
watch:
	deno run --watch --allow-net --allow-read --allow-write --allow-env --allow-run --unstable index.ts
run:
	deno run --allow-net --allow-read --allow-write --allow-env --allow-run --unstable index.ts
