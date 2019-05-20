customElements.define('my-menu-button', class extends HTMLElement {
    static get observedAttributes(){
        return ['href'];
    }
    constructor(){
        super();
        this.attachShadow({mode: 'open'}).innerHTML = `
<style>
  a {
    background: aliceblue;
    border-radius: 3px;
    padding: 1px 3px;
    color: darkblue;
    font-size: 0.96em;
    border: 1px solid lightsteelblue;
  }
</style>
<a>ShadowDOM: <slot></slot></a>
`;
    }
    attributeChangedCallback(name, oldValue, newValue){
        const anchor = this.shadowRoot.querySelector('a');
        if(newValue === null){
            anchor.removeAttribute('href');
        } else {
            anchor.setAttribute('href', newValue);
        }
    }
});
