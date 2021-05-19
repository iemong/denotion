all: run
fmt:
	deno fmt
run:
	deno run --allow-net --allow-read --allow-write --allow-env --allow-run --unstable index.ts
