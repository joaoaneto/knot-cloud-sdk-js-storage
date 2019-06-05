import axios from 'axios';
import queryString from 'query-string';

function extractSettings(options) {
  if (options.protocol !== 'http' && options.protocol !== 'https') {
    throwError('Unexpected protocol');
  }

  let { port } = options;

  if (options.protocol === 'http') port = 80;
  else if (options.protocol === 'https') port = 443;

  this.options = {
    hostname: options.hostname,
    protocol: options.protocol,
    port,
  };
}

function validateOptions(options) {

}

function throwError(message) {
  const error = new Error(message);
  throw error;
}

class Storage {
  constructor(options) {
    this.options = extractSettings(options);
  }

  buildUri(endpoint, query) {
    let uri = `https://${this.hostname}:${this.port}/${endpoint}`
    if (query) {
      uri += `?${queryString.stringify(query)}`;
    }
    return uri;
  }

  async listData(query) {
    const uri = this.buildUri('data', query);
    const headers = {
      auth_id: this.id,
      auth_token: this.token,
    };

    return axios.get(uri, headers);
  }
}

export default Storage;
