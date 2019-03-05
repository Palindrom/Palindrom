import Palindrom from '../../src/palindrom';
import moxios from 'moxios';
import assert from 'assert';

describe('Palindrom', () => {
  describe('#ignore by defineProperty', () => {
    beforeEach(() => {
      moxios.install();
    });
    afterEach(() => {
      moxios.uninstall();
    });
    it('Should not send patches for non-enumerable properties', function(
      done
    ) {
      moxios.stubRequest('http://localhost/testURL', {
        status: 200,
        location: 'http://localhost/testURL/patch-server',
        headers: { contentType: 'application/json' },
        responseText: '{"hello": "world"}'
      });
      const palindrom = new Palindrom({
        remoteUrl: 'http://localhost/testURL'
      });

      palindrom.addEventListener('state-reset', ev => {
        const obj = ev.detail;
          assert(moxios.requests.count() === 1);
          // a change that emits a patch
          obj.newProp = 'name';

          // wait for ajax
          setTimeout(() => {
            assert(moxios.requests.count() === 2);

            // a change that does not emit
            Object.defineProperty(obj, 'ignored', {
              enumerable: false,
              value: {
                child: 1
              }
            });

            // a change that does not emit
            obj.ignored.child = 2;

            // wait for ajax
            setTimeout(() => {
              // no further requests
              assert(moxios.requests.count() === 2);
              done();
            }, 1);
          }, 1);
        })
    });
  });
});
