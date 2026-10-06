class HeaderComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header>
                <h1 class="name">Kristopher Manalo</h1>
                <div class="navbar">
                    <a href="index.html">Home</a>
                    <div class="dropdown">
                        <button class="dropbtn">
                            Misc<i class="fa fa-caret-down"></i>
                        </button>
                        <div class="dropdown-content">
                            <a href="Xenogears/main.html">Xenogears</a>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }
}
customElements.define('main-header', HeaderComponent);
