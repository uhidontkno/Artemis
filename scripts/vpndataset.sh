echo Removing stale files...

rm -f /tmp/bl.filtering.txt
rm -f /tmp/bl.final.txt
rm -f ./components/vpn_ips.txt

echo Downloading datasets...

# Download ipv4 datasets
curl -o /tmp/bl.ipv4_dataset1.txt https://raw.githubusercontent.com/X4BNet/lists_vpn/main/ipv4.txt          2> /dev/null >/dev/null
curl -o /tmp/bl.ipv4_dataset2.txt https://raw.githubusercontent.com/youngjun-chang/VPNs/master/vpn-ipv4.txt 2> /dev/null >/dev/null

# Download interesting FireHOL datasets
 ## FireHOL Generic
 curl -o /tmp/bl.firehol.datacenters.txt https://iplists.firehol.org/files/datacenters.netset               2> /dev/null >/dev/null
 curl -o /tmp/bl.filehol.proxylists.txt  https://iplists.firehol.org/files/proxylists.ipset                 2> /dev/null >/dev/null

 ## FireHOL Tor
 curl -o /tmp/bl.firehol.tor_exits.txt   https://iplists.firehol.org/files/tor_exits.ipset                  2> /dev/null >/dev/null
 curl -o /tmp/bl.firehol.dm_tor.txt      https://iplists.firehol.org/files/dm_tor.ipset                     2> /dev/null >/dev/null
 curl -o /tmp/bl.firehol.et_tor.txt      https://iplists.firehol.org/files/et_tor.ipset                     2> /dev/null >/dev/null

 ## FireHOL open proxies
 curl -o /tmp/bl.filehol.socks.txt       https://iplists.firehol.org/files/socks_proxy.ipset                2> /dev/null >/dev/null
 curl -o /tmp/bl.filehol.ssl.txt         https://iplists.firehol.org/files/sslproxies.ipset                 2> /dev/null >/dev/null

# Download ipv6 dataset
curl -o /tmp/bl.ipv6_dataset.txt https://raw.githubusercontent.com/youngjun-chang/VPNs/master/vpn-ipv6.txt  2> /dev/null >/dev/null

echo Downloaded dataset! Combining files...

pattern="bl.*\.txt$"
files=()

for file in /tmp/*; do
    if [[ "$file" =~ $pattern ]]; then
        # echo $file
        files+=("$file")
    fi
done

echo Found files, combining...

if [ ${#files[@]} -eq 0 ]; then
    echo "PANIC: REGEX DIDNT MATCH ANYTHING"
    exit 1
fi


for file in "${files[@]}"; do
    cat $file >> /tmp/bl.filtering.txt
done

echo Combined files! Filtering...
grep -v '^#' "/tmp/bl.filtering.txt" | sort -u > "/tmp/bl.final.txt"

echo Cleaning up...

mv /tmp/bl.final.txt ./components/vpn_ips.txt
rm -rf /tmp/bl.*

echo Finished!