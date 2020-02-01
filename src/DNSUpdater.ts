import axios, {AxiosResponse} from 'axios';
import betterLogging from "better-logging";

export class DNSUpdater {
    private readonly options: { [key: string]: any; };
    readonly baseUri: string = 'https://api.cloudflare.com/client/v4';
    readonly getIpUri: string = 'https://canihazip.com/s';
    private myIp: string;

    constructor(options: { [key: string]: string; }) {
        betterLogging(console);
        this.options = options;
        axios.defaults.headers = {
            'Content-Type': 'application/json',
            'X-Auth-Key': this.options.key,
            'X-Auth-Email': this.options.email,
        };
        this.getActualIp();
    }

    getActualIp() {
        axios.get(this.getIpUri, {headers: {}}).then((res: AxiosResponse) => {
            this.myIp = res.data;
        });
    };

    run() {
        this.options.domains.forEach((domain: string) => {
            const zones: Promise<any> = this.listZones();
            zones.then((zonesList: { [key: string]: any }) => {
                zonesList.result.forEach((zone: { [key: string]: any }) => {
                    if (zone.name === domain) {
                        const dnsRecords: Promise<any> = this.listDNSRecords(zone.id);
                        dnsRecords.then((recordList: { [key: string]: any }) => {
                            recordList.result.forEach((record: { [key: string]: any }) => {
                                if (this.options.dns_record_types.includes(record.type) && record.name === domain) {
                                    this.updateDNS(zone.id, record)
                                }
                            })
                        })
                    }
                })
            });
        })
    };

    listZones = async () => {
        const res = await axios.get(this.baseUri + '/zones');
        return res.data;
    };

    listDNSRecords = async (identifier: string) => {
        const res = await axios.get(this.baseUri + `/zones/${identifier}/dns_records`);
        return res.data;
    };

    updateDNS(zoneIdentifier: string, dnsRecord: { [key: string]: any }) {
        const body: { [key: string]: any } = {
            'type': dnsRecord.type,
            'name': dnsRecord.name,
            'content': this.myIp,
            'ttl': 1,
            'proxied': true
        };
        console.info(`Updating records for ${dnsRecord.name}`);
        axios.put(this.baseUri + `/zones/${zoneIdentifier}/dns_records/${dnsRecord.id}`, body).then(res => {
            if (res.status === 200) {
                console.info("Record updated")
            } else {
                console.error(res.data.errors)
            }
        });
    }
}