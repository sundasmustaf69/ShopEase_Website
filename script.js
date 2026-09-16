/* =========================================================
   ShopEase — Main JavaScript
   Cart + Search + Filters + Favorites + Countdown + UI
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* ================= CART ================= */

    const CART_KEY = "shopEaseCart";

    function getCart() {
        try {
            const saved = JSON.parse(localStorage.getItem(CART_KEY));
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.error("Cart loading error:", error);
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function updateCartCount() {
        const counter = document.getElementById("cart-count");
        if (!counter) return;

        const cart = getCart();

        const total = cart.reduce((sum, item) => {
            return sum + (Number(item.quantity) || 1);
        }, 0);

        counter.textContent = total;
    }

    function getProductFromButton(button) {

        const nameFromData = button.dataset.name;
        const priceFromData = Number(button.dataset.price);
        const imageFromData = button.dataset.image;

        if (nameFromData && priceFromData > 0) {
            return {
                name: nameFromData,
                price: priceFromData,
                image: imageFromData || "",
                quantity: 1
            };
        }

        /* Supports your existing category pages
           where buttons don't have data-* attributes. */

        const card = button.closest(".card");

        if (!card) return null;

        const nameElement = card.querySelector("h3");
        const priceElement = card.querySelector(".price");
        const imageElement = card.querySelector("img");

        if (!nameElement || !priceElement) return null;

        const price = Number(
            priceElement.textContent.replace(/[^0-9]/g, "")
        );

        if (!price || price <= 0) return null;

        return {
            name: nameElement.textContent.trim(),
            price: price,
            image: imageElement ? imageElement.getAttribute("src") : "",
            quantity: 1
        };
    }

    function addToCart(button) {

        const product = getProductFromButton(button);

        if (!product || !product.name || !product.price) {
            console.error("Product information is missing.");
            showToast("Could not add this product.");
            return;
        }

        const cart = getCart();

        const existing = cart.find(
            item => item.name === product.name
        );

        if (existing) {
            existing.quantity = (Number(existing.quantity) || 1) + 1;
        } else {
            cart.push(product);
        }

        saveCart(cart);
        updateCartCount();

        showToast(`${product.name} added to your bag ♡`);
    }

    document.querySelectorAll(".cart-btn").forEach(button => {
        button.addEventListener("click", function () {
            addToCart(this);
        });
    });

    updateCartCount();


    /* ================= CART BUTTON ================= */

    const cartButton = document.getElementById("cartButton");

    if (cartButton) {

        cartButton.addEventListener("click", () => {

            const path = window.location.pathname;

            if (path.includes("/pages/")) {
                window.location.href = "../cart.html";
            } else {
                window.location.href = "cart.html";
            }

        });

    }


    /* ================= TOAST ================= */

    function showToast(message) {

        const oldToast = document.querySelector(".shop-toast");

        if (oldToast) {
            oldToast.remove();
        }

        const toast = document.createElement("div");

        toast.className = "shop-toast";

        toast.innerHTML = `
            <span>✓</span>
            <p>${escapeHTML(message)}</p>
        `;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add("show");
        });

        setTimeout(() => {

            toast.classList.remove("show");

            setTimeout(() => {
                toast.remove();
            }, 300);

        }, 2400);
    }


    function escapeHTML(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    /* ================= SEARCH ================= */

    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchBtn");
    const productCards = [...document.querySelectorAll(".product-card")];

    let currentFilter = "all";

    function applyProductFilters() {

        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        productCards.forEach(card => {

            const name =
                (card.dataset.name || "").toLowerCase();

            const category =
                (card.dataset.category || "").toLowerCase();

            const text =
                card.textContent.toLowerCase();

            const matchesSearch =
                !searchTerm ||
                name.includes(searchTerm) ||
                category.includes(searchTerm) ||
                text.includes(searchTerm);

            const matchesFilter =
                currentFilter === "all" ||
                category === currentFilter;

            card.style.display =
                matchesSearch && matchesFilter
                    ? ""
                    : "none";
        });

    }

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyProductFilters
        );

        searchInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {
                    event.preventDefault();
                    applyProductFilters();
                }

            }
        );

    }

    if (searchButton) {
        searchButton.addEventListener(
            "click",
            applyProductFilters
        );
    }


    /* ================= FILTER BUTTONS ================= */

    const filterButtons =
        document.querySelectorAll(".filter-btn");

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            currentFilter =
                button.dataset.filter || "all";

            applyProductFilters();

            const productSection =
                document.getElementById("products");

            if (
                productSection &&
                window.innerWidth < 700
            ) {
                productSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        });

    });


    /* ================= FAVORITES ================= */

    const wishlistKey = "shopEaseWishlist";

    function getWishlist() {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(wishlistKey)
                );

            return Array.isArray(saved)
                ? saved
                : [];

        } catch {
            return [];
        }

    }

    function saveWishlist(items) {
        localStorage.setItem(
            wishlistKey,
            JSON.stringify(items)
        );
    }

    document
        .querySelectorAll(".quick-view")
        .forEach(button => {

            button.addEventListener("click", () => {

                const card =
                    button.closest(".product-card");

                if (!card) return;

                const name =
                    card.dataset.name || "Product";

                let wishlist = getWishlist();

                const exists =
                    wishlist.includes(name);

                if (exists) {

                    wishlist =
                        wishlist.filter(
                            item => item !== name
                        );

                    button.classList.remove("active");
                    button.textContent = "♡";

                    showToast(
                        `${name} removed from favorites`
                    );

                } else {

                    wishlist.push(name);

                    button.classList.add("active");
                    button.textContent = "♥";

                    showToast(
                        `${name} added to favorites ♡`
                    );
                }

                saveWishlist(wishlist);

            });

        });


    /* ================= COUNTDOWN ================= */

    const days = document.getElementById("days");
    const hours = document.getElementById("hours");
    const minutes = document.getElementById("minutes");
    const seconds = document.getElementById("seconds");

    function getOfferEnd() {

        const key = "shopEaseOfferEnd";
        const saved = Number(
            localStorage.getItem(key)
        );

        if (saved && saved > Date.now()) {
            return saved;
        }

        const end =
            Date.now() +
            (3 * 24 * 60 * 60 * 1000);

        localStorage.setItem(key, end);

        return end;
    }

    const offerEnd = getOfferEnd();

    function updateCountdown() {

        const remaining =
            offerEnd - Date.now();

        if (remaining <= 0) {

            if (days) days.textContent = "00";
            if (hours) hours.textContent = "00";
            if (minutes) minutes.textContent = "00";
            if (seconds) seconds.textContent = "00";

            return;
        }

        const d =
            Math.floor(
                remaining /
                (1000 * 60 * 60 * 24)
            );

        const h =
            Math.floor(
                (remaining /
                    (1000 * 60 * 60)) % 24
            );

        const m =
            Math.floor(
                (remaining /
                    (1000 * 60)) % 60
            );

        const s =
            Math.floor(
                (remaining / 1000) % 60
            );

        if (days) {
            days.textContent =
                String(d).padStart(2, "0");
        }

        if (hours) {
            hours.textContent =
                String(h).padStart(2, "0");
        }

        if (minutes) {
            minutes.textContent =
                String(m).padStart(2, "0");
        }

        if (seconds) {
            seconds.textContent =
                String(s).padStart(2, "0");
        }

    }

    updateCountdown();
    setInterval(updateCountdown, 1000);


    /* ================= NEWSLETTER ================= */

    const newsletterForm =
        document.getElementById("newsletterForm");

    const newsletterEmail =
        document.getElementById("newsletterEmail");

    const newsletterMessage =
        document.getElementById("newsletterMessage");

    if (newsletterForm) {

        newsletterForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const email =
                    newsletterEmail.value.trim();

                if (!email) {

                    newsletterMessage.textContent =
                        "Please enter your email.";

                    return;
                }

                const valid =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                        .test(email);

                if (!valid) {

                    newsletterMessage.textContent =
                        "Please enter a valid email.";

                    return;
                }

                newsletterMessage.textContent =
                    "You're on the list — welcome ♡";

                newsletterEmail.value = "";

            }
        );

    }


    /* ================= SEARCH PANEL ================= */

    const searchToggle =
        document.getElementById("searchToggle");

    const searchPanel =
        document.getElementById("searchPanel");

    const closeSearch =
        document.getElementById("closeSearch");

    const globalSearch =
        document.getElementById("globalSearch");

    if (searchToggle && searchPanel) {

        searchToggle.addEventListener(
            "click",
            () => {

                searchPanel.classList.add("show");

                setTimeout(() => {
                    if (globalSearch) {
                        globalSearch.focus();
                    }
                }, 100);

            }
        );

    }

    if (closeSearch && searchPanel) {

        closeSearch.addEventListener(
            "click",
            () => {
                searchPanel.classList.remove("show");
            }
        );

    }

    if (searchPanel) {

        searchPanel.addEventListener(
            "click",
            event => {

                if (event.target === searchPanel) {
                    searchPanel.classList.remove("show");
                }

            }
        );

    }

    if (globalSearch) {

        globalSearch.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    const value =
                        globalSearch.value
                            .trim()
                            .toLowerCase();

                    if (searchInput) {
                        searchInput.value = value;
                        currentFilter = "all";

                        filterButtons.forEach(btn => {
                            btn.classList.remove("active");
                        });

                        const allButton =
                            document.querySelector(
                                '.filter-btn[data-filter="all"]'
                            );

                        if (allButton) {
                            allButton.classList.add("active");
                        }

                        applyProductFilters();
                    }

                    searchPanel.classList.remove("show");

                    const products =
                        document.getElementById("products");

                    if (products) {
                        products.scrollIntoView({
                            behavior: "smooth"
                        });
                    }

                }

            }
        );

    }


    /* ================= MOBILE MENU ================= */

    const menuButton =
        document.getElementById("menuButton");

    const mobileMenu =
        document.getElementById("mobileMenu");

    if (menuButton && mobileMenu) {

        menuButton.addEventListener(
            "click",
            () => {

                mobileMenu.classList.toggle("show");
                document.body.classList.toggle(
                    "menu-open"
                );

            }
        );

        mobileMenu
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        mobileMenu.classList.remove("show");
                        document.body.classList.remove(
                            "menu-open"
                        );

                    }
                );

            });

    }


    /* ================= NAVBAR SCROLL ================= */

    const navbar =
        document.getElementById("navbar");

    function handleScroll() {

        if (navbar) {

            navbar.classList.toggle(
                "scrolled",
                window.scrollY > 25
            );

        }

        const backToTop =
            document.getElementById("backToTop");

        if (backToTop) {

            backToTop.classList.toggle(
                "show",
                window.scrollY > 500
            );

        }

        updateActiveNavigation();

    }

    window.addEventListener(
        "scroll",
        handleScroll,
        { passive: true }
    );


    /* ================= ACTIVE NAV ================= */

    const navLinks =
        document.querySelectorAll(".nav-links a");

    function updateActiveNavigation() {

        const sections = [
            "home",
            "categories",
            "products",
            "offers",
            "about"
        ];

        let current = "home";

        sections.forEach(id => {

            const section =
                document.getElementById(id);

            if (!section) return;

            if (
                window.scrollY >=
                section.offsetTop - 160
            ) {
                current = id;
            }

        });

        navLinks.forEach(link => {

            const target =
                link.getAttribute("href");

            link.classList.toggle(
                "active",
                target === `#${current}`
            );

        });

    }

    handleScroll();


    /* ================= BACK TO TOP ================= */

    const backToTop =
        document.getElementById("backToTop");

    if (backToTop) {

        backToTop.addEventListener(
            "click",
            () => {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    /* ================= ESCAPE KEY ================= */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") return;

            if (searchPanel) {
                searchPanel.classList.remove("show");
            }

            if (mobileMenu) {
                mobileMenu.classList.remove("show");
            }

            document.body.classList.remove(
                "menu-open"
            );

        }
    );


    console.log(
        "ShopEase initialized successfully."
    );

});