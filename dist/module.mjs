import axios from 'axios';

class Storage {
  constructor(hostname, port) {
    this.hostname = hostname;
    this.port = port;
  }

  buildUri(endpoint) {
    return `https://${this.hostname}:${this.port}/${endpoint}`;
  }

  async listData() {
    const uri = this.buildUri('/data');
    const data = await axios.get(uri);
    return data;
  }

}

const storage = new Storage('data.cloud', 80);
console.log(storage.listData());
