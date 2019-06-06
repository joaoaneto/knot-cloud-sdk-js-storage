import axios from 'axios';
import url from 'url';
import httpSignature from 'http-signature';
import uuid from 'uuid';

function throwError(message) {
  const error = new Error(message);
  throw error;
}

function extractSettings({
  hostname, port, protocol, id, token, pathname,
}) {
  const defaultProtocol = 'https';
  const defaultPort = 443;

  if (!hostname) {
    throwError('A hostname should be provided');
  }
  if (!id || !token) {
    throwError('Both id and token should be provided');
  }

  return {
    hostname,
    port: !port ? defaultPort : port,
    protocol: !protocol ? defaultProtocol : protocol,
    id,
    token,
    pathname: pathname || '',
  };
}

function buildUri(protocol, hostname, port, pathname, query) {
  return url.format({
    protocol, hostname, port, pathname, query,
  });
}

function mapDataToStorage(data) {
  return {
    devices: ['*'],
    topic: 'data',
    payload: data,
  };
}

function createRoute(id) {
  const route = [
    {
      from: id,
      to: uuid.v4,
      type: 'broadcast.sent',
    },
  ];

  return JSON.stringify(route);
}

function generateSignatureHeaders(privateKey) {
  const signer = httpSignature.createSigner({
    keyId: 'knot-cloud-storage-sdk',
    key: Buffer.from(privateKey, 'base64').toString('ascii'),
    algorithm: 'rsa-sha256',
  });
  const date = signer.writeDateHeader();

  return new Promise((resolve, reject) => {
    signer.sign(async (err, authz) => {
      if (err) {
        reject(err);
        return;
      }

      const headers = {
        authorization: authz,
        date: date.toString(),
      };

      resolve(headers);
    });
  });
}

class Storage {
  constructor(options) {
    this.options = extractSettings(options);
  }

  async saveData(privateKey, id, data) {
    if (!privateKey) {
      throwError('A base64 privateKey should be provided');
    }

    const headers = await generateSignatureHeaders(privateKey);
    headers['x-meshblu-route'] = createRoute(id);

    const uri = buildUri(
      this.options.protocol,
      this.options.hostname,
      this.options.port,
      '/data',
    );

    await axios.post(uri, mapDataToStorage(data), { headers });
  }

  async listData(query) {
    const uri = buildUri(
      this.options.protocol,
      this.options.hostname,
      this.options.port,
      `${this.options.pathname}/data`,
      query,
    );
    const headers = {
      auth_id: this.options.id,
      auth_token: this.options.token,
    };

    const response = await axios.get(uri, { headers });
    return response.data;
  }

  async listDataByDevice(id, query) {
    if (!id) {
      throwError('A device ID should be provided');
    }

    const uri = buildUri(
      this.options.protocol,
      this.options.hostname,
      this.options.port,
      `/data/${id}`,
      query,
    );
    const headers = {
      auth_id: this.options.id,
      auth_token: this.options.token,
    };

    const response = await axios.get(uri, { headers });
    return response.data;
  }

  async listDataBySensor(deviceId, sensorId, query) {
    if (!deviceId || sensorId === undefined) {
      throwError('Both device ID and sensor ID should be provided');
    }

    const uri = buildUri(
      this.options.protocol,
      this.options.hostname,
      this.options.port,
      `/data/${deviceId}/sensor/${sensorId}`,
      query,
    );
    const headers = {
      auth_id: this.options.id,
      auth_token: this.options.token,
    };

    const response = await axios.get(uri, { headers });
    return response.data;
  }
}

export default Storage;
