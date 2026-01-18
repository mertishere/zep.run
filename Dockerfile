FROM oven/bun:1 AS build

WORKDIR /usr/src/app
COPY . .

RUN bun install
RUN bunx prisma generate
RUN bun run build


FROM oven/bun:1 AS runtime

WORKDIR /usr/src/app

RUN apt-get update && \
	apt-get install -y ca-certificates curl gnupg && \
	curl -sLf https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key \
	| gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg && \
	echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] \
	https://packages.doppler.com/public/cli/deb/debian any-version main" \
	> /etc/apt/sources.list.d/doppler.list && \
	apt-get update && \
	apt-get install -y doppler && \
	rm -rf /var/lib/apt/lists/*


COPY --from=build /usr/src/app ./

USER bun
EXPOSE 8080

ENTRYPOINT ["doppler", "run", "--", "bun", "run", "start"]
