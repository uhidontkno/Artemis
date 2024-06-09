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

 ## FireHOL open proxies
 curl -o /tmp/bl.filehol.socks.txt       https://iplists.firehol.org/files/socks_proxy.ipset                2> /dev/null >/dev/null
 curl -o /tmp/bl.filehol.ssl.txt         https://iplists.firehol.org/files/sslproxies.ipset                 2> /dev/null >/dev/null

# Download ipv6 dataset
curl -o /tmp/bl.ipv6_dataset.txt https://raw.githubusercontent.com/youngjun-chang/VPNs/master/vpn-ipv6.txt  2> /dev/null >/dev/null

# Download TOR dataset
curl -o /tmp/bl.tor_nodes.txt https://www.dan.me.uk/torlist/?full 2> /dev/null >/dev/null

# Download Cloudflare IPs
curl -o /tmp/bl.cf-ipv4.txt https://www.cloudflare.com/ips-v4/#   2> /dev/null >/dev/null
curl -o /tmp/bl.cf-ipv6.txt https://www.cloudflare.com/ips-v6/#   2> /dev/null >/dev/null

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
