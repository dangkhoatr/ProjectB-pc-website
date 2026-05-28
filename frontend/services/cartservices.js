const CartService = {

    getCart() {

        return JSON.parse(
            localStorage.getItem("cart")
        ) || [];

    },

    saveCart(cart) {

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

        this.updateCount();
    },

    add(product) {

        let cart = this.getCart();

        cart.push(product);

        this.saveCart(cart);

    },

    remove(index) {

        let cart = this.getCart();

        cart.splice(index, 1);

        this.saveCart(cart);

    },

    clear() {

        localStorage.removeItem(
            "cart"
        );

        this.updateCount();
    },

    getCount() {

        return this.getCart().length;
    },

    updateCount() {

        const el =
            document.getElementById(
                "headerCartCount"
            );

        if (el) {
            el.innerText =
                this.getCount();
        }

    }

};