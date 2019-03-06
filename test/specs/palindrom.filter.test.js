import Palindrom from '../../src/palindrom';
import moxios from 'moxios';
import sinon from 'sinon';
import assert from 'assert';
import { sleep } from '../utils';

describe('Palindrom', () => {
  describe('#filterLocalChange', () => {
    beforeEach(() => {
      moxios.install();
    });
    afterEach(() => {
      moxios.uninstall();
    });
    it('Should use options.filterLocalChange function when local changes occur', async () =>
      
    {
      const spy = sinon.spy();

      moxios.stubRequest('http://localhost/testURL', {
        status: 200,
        headers: { contentType: 'application/json' },
        responseText: '{"hello": "world"}'
      });
      const palindrom = new Palindrom({
        remoteUrl: 'http://localhost/testURL',
        filterLocalChange: op => {
            spy();
            return op;
          }
        })
        palindrom.addEventListener('state-reset', ev => {
          const obj = ev.detail;
          obj.newProp = 'name';
        });
        // wait for ajax
        await sleep();
          
          
            assert(spy.calledOnce);
            
          

    });
    it('Should use options.filter function when local changes occur', async () =>
      
    {
      moxios.stubRequest('http://localhost/testURL', {
        status: 200,
        location: 'http://localhost/testURL/patch-server',
        headers: { contentType: 'application/json' },
        responseText: '{"hello": "world"}'
      });
      const palindrom = new Palindrom({
        remoteUrl: 'http://localhost/testURL',
        filterLocalChange: operation => !operation.path.startsWith('/$$') && operation
      });
      let obj;

      palindrom.addEventListener('state-reset', ev => {
        obj = ev.detail;
      });
      await sleep();
          assert(moxios.requests.count() === 1);
          // a change that passes the filter
          obj.newProp = 'name';

          // wait for ajax
          await sleep();
            assert(moxios.requests.count() === 2);

            // a change that does not pass the filter
            obj.$$ignored = 'name';

            // wait for ajax
            await sleep();
              assert(moxios.requests.count() === 2);
              
            
          
        
    });
  });
});
