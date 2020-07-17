var ip = require('ip');
var inc = require('increment-buffer');

var version = '0.0.1';

ip.increment = function (ipAddress, step) {
    var input = ip.toBuffer(ipAddress);
    while (step) { step--; inc(input); }
    return ip.toString(input);
}

module.exports = {
    calculate: (address, netmask, netmaskSubnet) => {
        var network = ip.cidrSubnet(`${address}/${netmask}`);

        var respond = {
            status: 200,
            message: 'Ok',
            version: version,
            Network: {
                Address: address,
                Netmask: network.subnetMask,
                NetmaskLength: network.subnetMaskLength,
                Wildcard: ip.not(network.subnetMask),

                Network: `${network.networkAddress}/${network.subnetMaskLength}`,
                Broadcast: network.broadcastAddress,
                HostMin: network.firstAddress,
                HostMax: network.lastAddress,
                HostsNet: network.numHosts,
                IsPrivate: ip.isPrivate(network.networkAddress)
            }
        }

        if (netmaskSubnet !== undefined && netmask !== netmaskSubnet) {
            if (netmask < netmaskSubnet) {
                var tmpAddress, subnet;

                respond.Network.Subnet = {
                    Netmask: ip.fromPrefixLen(netmaskSubnet),
                    NetmaskLength: netmaskSubnet,
                    Wildcard: ip.not(ip.fromPrefixLen(netmaskSubnet)),
                    Items: [],
                    Hosts: 0
                }

                do {

                    subnet = ip.cidrSubnet(`${tmpAddress || network.firstAddress}/${netmaskSubnet}`);
            
                    tmpAddress = ip.increment(subnet.broadcastAddress, 1)

                    respond.Network.Subnet.Items.push({
                        Network: `${subnet.networkAddress}/${subnet.subnetMaskLength}`,
                        Broadcast: subnet.broadcastAddress,
                        HostMin: subnet.firstAddress,
                        HostMax: subnet.lastAddress,
                        HostsNet: subnet.numHosts,
                        IsPrivate: ip.isPrivate(subnet.networkAddress),
                    });

                    respond.Network.Subnet.Hosts += subnet.numHosts;
        
                } while (subnet.lastAddress !== network.lastAddress);
            } else {
                var tmpAddress, supernet;

                supernet = ip.cidrSubnet(`${tmpAddress || network.firstAddress}/${netmaskSubnet}`);
            
                tmpAddress = ip.increment(supernet.broadcastAddress, 1)

                respond.Network.Supernet = {
                    Netmask: ip.fromPrefixLen(netmaskSubnet),
                    NetmaskLength: netmaskSubnet,
                    Wildcard: ip.not(ip.fromPrefixLen(netmaskSubnet)),
                    Network: `${supernet.networkAddress}/${supernet.subnetMaskLength}`,
                    Broadcast: supernet.broadcastAddress,
                    HostMin: supernet.firstAddress,
                    HostMax: supernet.lastAddress,
                    HostsNet: supernet.numHosts,
                    IsPrivate: ip.isPrivate(supernet.networkAddress),
                }
            }
        }

        return respond;
    }
}