class HueBridge {
  constructor(hueApi, attributes) {
    this.hueApi = hueApi;
    this.name = attributes.name;
    this.zigbeechannel = attributes.zigbeechannel;
    this.bridgeid = attributes.bridgeid;
    this.mac = attributes.mac;
    this.dhcp = attributes.dhcp;
    this.ipaddress = attributes.ipaddress;
    this.netmask = attributes.netmask;
    this.gateway = attributes.gateway;
    this.proxyaddress = attributes.proxyaddress;
    this.proxyport = attributes.proxyport;
    this.UTC = attributes.UTC;
    this.localtime = attributes.localtime;
    this.timezone = attributes.timezone;
    this.modelid = attributes.modelid;
    this.datastoreversion = attributes.datastoreversion;
    this.swversion = attributes.swversion;
    this.apiversion = attributes.apiversion;
    this.linkbutton = attributes.linkbutton;
  }

  asJson() {
    return {
      name: this.name,
      bridgeid: this.bridgeid,
      mac: this.mac,
    };
  }
}

module.exports = HueBridge;
