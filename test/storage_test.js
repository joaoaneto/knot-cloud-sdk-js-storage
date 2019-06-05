import chai from 'chai';
import spies from 'chai-spies';
import nock from 'nock';
import Storage from 'Storage';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.use(spies);

const expect = chai.expect;

const dataList = [
  {
    from: '188824f0-28c4-475b-ab36-2505402bebcb',
    payload: {
        sensorId: 2,
        value: 234,
    },
    timestamp: '2019-03-18T12:48:05.569Z',
  },
  {
    from: '188824f0-28c4-475b-ab36-2505402bebcb',
    payload: {
        sensorId: 1,
        value: true,
    },
    timestamp: '2019-03-18T14:42:03.192Z',
  },
  {
    from: '188824f0-28c4-475b-ab36-2505402bebcb',
    payload: {
        sensorId: 1,
        value: true,
    },
    timestamp: '2019-03-18T15:30:01.192Z',
  },
  {
    from: '188824f0-28c4-475b-ab36-2505402bebcb',
    payload: {
        sensorId: 1,
        value: true,
    },
    timestamp: '2019-03-18T16:17:45.192Z',
  },
  {
    from: '188824f0-28c4-475b-ab36-2505402bebcb',
    payload: {
        sensorId: 1,
        value: true,
    },
    timestamp: '2019-03-20T02:52:00.192Z',
  },
];

describe('Storage', () => {
  describe('constructor', () => {
    describe('when constructed with http protocol', () => {
      it('should use http port (80)', () => {
        const construction = new Storage({ hostname: 'data.knot.cloud', protocol: 'http' });

        expect(construction.options.port).to.be.equal(80);
      });
    });

    describe('when constructed with https protocol', () => {
      it('should use https port (443)', () => {
        const construction = new Storage({ hostname: 'data.knot.cloud', protocol: 'https' });

        expect(construction.options.port).to.be.equal(443);
      });
    });

    describe('when constructed with http protocol and https port', () => {
      it('should throw an exception', () => {
        expect(() => new Storage({ hostname: 'data.knot.cloud', port: 80, protocol: 'https' }))
          .to.throw(Error);
      });
    });

    describe('when constructed with https protocol and http port', () => {
      it('should throw an exception', () => {
        expect(() => new Storage({ hostname: 'data.knot.cloud', port: 80, protocol: 'http' }))
          .to.throw(Error);
      });
    });

    describe('when constructed with no hostname', () => {
      it('should throw an exception', () => {
        expect(() => new Storage({ port: 80, protocol: 'http' }))
          .to.throw(Error);
      });
    });

    describe('when constructed with no port', () => {
      it('should throw an exception', () => {
        expect(() => new Storage({ hostname: 'data.knot.cloud', protocol: 'http' }))
          .to.throw(Error);
      });
    });

    describe('when constructed with no uuid and token', () => {
      it('should throw an exception', () => {
        expect(() => new Storage({ hostname: 'data.knot.cloud', port: 80, protocol: 'http' }))
          .to.throw(Error);
      });
    });
  });

  describe('listData', () => {
    let storage, query;

    describe('with empty query', () => {
      beforeEach(() => {
        storage = new Storage({ hostname: 'data.cloud', port: 443 });
        nock('https://data.cloud:443')
          .get('/data')
          .reply(200, dataList);
      });

      it('should returns an array', async () => {
        const response = await storage.listData();
        expect(response.data).to.be.an('array');
      });

      it('should returns an array of data objects', async () => {
        const response = await storage.listData();
        expect(response.data).to.deep.equal(dataList);
      });
    });

    describe('with date interval query', () => {
      let dataBetweenTimeInterval;

      beforeEach(() => {
        query = { startDate: '2019-03-18T14:42:03.192Z', finishDate: '2019-03-18T16:17:45.192Z'};
        dataBetweenTimeInterval = dataList.slice(1, 4);
        storage = new Storage({ hostname: 'data.cloud', port: 443 });
        nock('https://data.cloud:443')
          .get(`/data`)
          .query(query)
          .reply(200, dataBetweenTimeInterval);
        });

      it('should returns an array', async () => {
        const response = await storage.listData(query);
        expect(response.data).to.be.an('array');
      });

      it('should returns an array of data objects between time interval', async () => {
        const response = await storage.listData(query);
        expect(response.data).to.deep.equal(dataBetweenTimeInterval);
      });
    });

    describe('with take and skip query', () => {
      let skippedData;

      beforeEach(() => {
        query = { skip: 3, take: 2 };
        skippedData = dataList.slice(query.skip, dataList.length);
        storage = new Storage({ hostname: 'data.cloud', port: 443 });
        nock('https://data.cloud:443')
          .get('/data')
          .query(query)
          .reply(200, skippedData);
      });

      it('should returns an array', async () => {
        const response = await storage.listData(query);
        expect(response.data).to.be.an('array');
      });

      it('should returns an array of two data objects skipped by 3', async () => {
        const response = await storage.listData(query);
        expect(response.data).to.deep.equal(skippedData);
      });
    });

    describe('with order and orderBy query', () => {
      let reversedData;

      beforeEach(() => {
        query = { order: -1, orderBy: 'timestamp' };
        reversedData = dataList.reverse();
        storage = new Storage({ hostname: 'data.cloud', port: 443 });
        nock('https://data.cloud:443')
          .get('/data')
          .query(query)
          .reply(200, reversedData);
      });

      it('should returns an array', async () => {
        const response = await storage.listData(query);
        expect(response.data).to.be.an('array');
      });

      it('should returns an array of data objects descending ordered by timestamp', async () => {
        const response = await storage.listData(query);
        expect(response.data).to.deep.equal(reversedData);
      });
    });

    describe('when an error happens', () => {
      it('should pass error to client', async () => {
                storage = new Storage({ hostname: 'data.cloud', port: 443 });
        nock('https://data.cloud:443')
          .get('/data')
          .reply(500);

          try {
            await storage.listData();
          } catch (err) {
            expect(err).to.have.property('isAxiosError', true);
          }
      });
    });
  })
});