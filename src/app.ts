import {ConfigReader} from './ConfigReader'
import {DNSUpdater} from './DNSUpdater'

const configReader = new ConfigReader('dns.yml');
configReader.init();

const DNSUpdate = new DNSUpdater(configReader.config);
DNSUpdate.run();