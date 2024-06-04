echo "
while [ true ]; do
bun run bot/index.ts
sleep 1
done " | bash &

echo "
while [ true ]; do
bun run server/index.ts
sleep 1
done " | bash &