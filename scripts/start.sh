while :; bun run bot/index.ts; echo "Bot crashed! Restarting..."; sleep 1; done &
while :; bun run server/index.ts; echo "Server crashed! Restarting..."; sleep 1; done &
