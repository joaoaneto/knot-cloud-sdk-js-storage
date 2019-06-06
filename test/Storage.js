import chai from 'chai';
import spies from 'chai-spies';
import nock from 'nock';
import chaiAsPromised from 'chai-as-promised';

import Storage from 'Storage';
import dataList from './data';

chai.use(chaiAsPromised);
chai.use(spies);
const expect = chai.expect;

const settings = { hostname: 'data.knot.cloud', id: '5770d58c-a25c-40bc-ac1d-8613002be539', token: 'cff126c40a47438a33e8451c87a4199fddbdbb40', protocol: 'https' };
const url = 'https://data.knot.cloud:443';

function mockRequest({ endpoint, query, responseCode, responseBody }) {
  nock(url)
  .get(endpoint)
  .query(query)
  .reply(responseCode, responseBody);
}

describe('Storage', () => {
  describe('constructor', () => {
    describe('when constructed without hostname', () => {
      it('should throw an exception', () => {
        expect(() => new Storage({ port: 80, protocol: 'http' }))
          .to.throw();
      });
    });

    describe('when constructed without uuid and token', () => {
      it('should throw an exception', () => {
        expect(() => new Storage({ hostname: 'data.knot.cloud', port: 80, protocol: 'http' }))
          .to.throw();
      });
    });
  });

  describe('listData', () => {
    describe('with empty query', () => {
      it('should return an array of data objects returned by the server', async () => {
        const storage = new Storage(settings);
        mockRequest({ endpoint: '/data', responseCode: 200, responseBody: dataList });

        const response = await storage.listData();

        expect(response).to.deep.equal(dataList);
      });
    });

    describe('with date interval query', () => {
      it('should build a valid query string', async () => {
        const storage = new Storage(settings);
        const expectedQuery = { startDate: '2019-03-18T14:42:03.192Z' };
        mockRequest({ endpoint: '/data', query: expectedQuery, responseCode: 200 });

        await storage.listData(expectedQuery);

        // nock library validates the request by intercepting NodeJS HTTP request and verifying its properties
      });
    });

    describe('with take and skip query', () => {
      it('should build a valid query string', async () => {
        const storage = new Storage(settings);
        const expectedQuery = { skip: 3, take: 2 };
        mockRequest({ endpoint: '/data', query: expectedQuery, responseCode: 200 });

        await storage.listData(expectedQuery);

        // nock library validates the request by intercepting NodeJS HTTP request and verifying its properties
      });
   });

    describe('with order and orderBy query', () => {
      it('should build a valid query string', async () => {
        const storage = new Storage(settings);
        const expectedQuery = { order: -1, orderBy: 'timestamp' };
        mockRequest({ endpoint: '/data', query: expectedQuery, responseCode: 200 });

        await storage.listData(expectedQuery);

        // nock library validates the request by intercepting NodeJS HTTP request and verifying its properties
      });
    });

    describe('when an error happens', () => {
      it('should pass error to client', async () => {
        const storage = new Storage(settings);
        mockRequest({ endpoint: '/data', responseCode: 500 });

          try {
            await storage.listData();
          } catch (err) {
            expect(err).to.be.an.instanceof(Error);
          }
      });
    });
  });

  describe('listDataByDevice', () => {
    const deviceId = '0643ca1462f94b79';

    describe('when deviceId isn\'t provided', () => {
      it('should throw an exception', async () => {
        const storage = new Storage(settings);
        expect(storage.listDataByDevice())
          .to.eventually.be.rejected;
      });
    });

    describe('with empty query', () => {
      it('should return an array of data objects returned by the server', async () => {
        const storage = new Storage(settings);
        mockRequest({ endpoint: `/data/${deviceId}`, responseCode: 200, responseBody: dataList })

        const response = await storage.listDataByDevice(deviceId);

        expect(response).to.deep.equal(dataList);
      });
    });

    describe('with date interval query', () => {
      it('should build a valid query string', async () => {
        const storage = new Storage(settings);
        const expectedQuery = { startDate: '2019-03-18T14:42:03.192Z' };
        mockRequest({ endpoint: `/data/${deviceId}`, query: expectedQuery, responseCode: 200 });

        await storage.listDataByDevice(deviceId, expectedQuery);

        // nock library validates the request by intercepting NodeJS HTTP request and verifying its properties
      });
    });

    describe('with take and skip query', () => {
      it('should build a valid query string', async () => {
        const storage = new Storage(settings);
        const expectedQuery = { skip: 3, take: 2 };
        mockRequest({ endpoint: `/data/${deviceId}`, query: expectedQuery, responseCode: 200 });

        await storage.listDataByDevice(deviceId, expectedQuery);

        // nock library validates the request by intercepting NodeJS HTTP request and verifying its properties
      });
    });

    describe('with order and orderBy query', () => {
      it('should build a valid query string', async () => {
        const storage = new Storage(settings);
        const expectedQuery = { order: -1, orderBy: 'timestamp' };
        mockRequest({ endpoint: `/data/${deviceId}`, query: expectedQuery, responseCode: 200 });

        await storage.listDataByDevice(deviceId, expectedQuery);

        // nock library validates the request by intercepting NodeJS HTTP request and verifying its properties
      });
    });

    describe('when an error happens', () => {
      it('should pass error to client', async () => {
        const storage = new Storage(settings);
        mockRequest({ endpoint: `/data/${deviceId}`, responseCode: 500 });

          try {
            await storage.listDataByDevice(deviceId);
          } catch (err) {
            expect(err).to.be.an.instanceof(Error);
          }
      });
    });
  })
});
