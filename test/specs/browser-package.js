import chai from 'chai';
const { expect } = chai;

/** only run DOM tests in browsers */
let envIt = (typeof window === 'undefined')? xit : it;
if (typeof window === 'undefined') {
    const chaiIt = it;
}
describe('Palindrom', () => {
    const it = envIt;
    describe('package loaded to browser using clasic `script src="../dist/palindrom-dom.min.js"`', function() {
        it('Should expose PalindromDOM to window', (done) => {
            const scriptElement = document.createElement('script');
            scriptElement.src = "../dist/palindrom-dom.min.js";
            scriptElement.onload = () => {
                expect(window, 'window.PalindromDOM').to.have.property('PalindromDOM').that.is.a('function');;
                done();
            }
            document.head.appendChild(scriptElement);
        });
    });
});