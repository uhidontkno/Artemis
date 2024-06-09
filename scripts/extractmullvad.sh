curl -s https://mullvad.net/en/servers | sed -n '/const data = /h; ${x;s/.*const data = //;s/];.*/];/p;}' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' > /tmp/mullvad.txt
grep -oE "\b([0-9]{1,3}\.){3}[0-9]{1,3}\b" /tmp/mullvad.txt
grep -oE "\b([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b" /tmp/mullvad.txt
