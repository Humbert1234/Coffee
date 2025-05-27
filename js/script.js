document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (document.querySelector(targetId)) {
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile Navigation Toggle
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav ul');

    if (mobileNavToggle && mainNav) {
        mobileNavToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });

        // Close mobile nav when a link is clicked
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
            });
        });
    }

    // Contact Form Validation (on Contact Page)
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('form-message');

    if (contactForm && formMessage) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            let isValid = true;
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const message = document.getElementById('message');

            if (name.value.trim() === '') {
                showFormMessage('Please enter your name.', 'error');
                isValid = false;
                name.focus();
                return;
            }

            if (email.value.trim() === '' || !isValidEmail(email.value)) {
                showFormMessage('Please enter a valid email address.', 'error');
                isValid = false;
                email.focus();
                return;
            }

            if (message.value.trim() === '') {
                showFormMessage('Please enter your message.', 'error');
                isValid = false;
                message.focus();
                return;
            }

            if (isValid) {
                console.log('Form Submitted:', {
                    name: name.value,
                    email: email.value,
                    phone: document.getElementById('phone')?.value || 'N/A',
                    message: message.value
                });

                showFormMessage('Your message has been sent successfully!', 'success');
                contactForm.reset();
            }
        });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showFormMessage(msg, type) {
        formMessage.textContent = msg;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }

    // Optional: Add an observer for loading animations
    const sections = document.querySelectorAll('main section');
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 1s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, options);

    sections.forEach(section => {
        // Only apply if the section isn't already visible (e.g., if you're navigating to it)
        if (section.style.opacity !== '1') {
            section.style.opacity = '0';
            observer.observe(section);
        }
    });

    // --- JAVASCRIPT FOR MENU PAGE (CART FUNCTIONALITY) ---
    const menuItemsGrid = document.querySelector('.menu-items-grid');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartItemCount = document.getElementById('cart-item-count');
    const orderTotalSpan = document.getElementById('order-total');
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const emptyCartMessage = document.querySelector('.empty-cart-message');

    // Modal elements
    const orderConfirmationModal = document.getElementById('order-confirmation-modal');
    const closeModalButton = document.querySelector('.modal .close-button');
    const confirmedOrderItems = document.getElementById('confirmed-order-items');
    const orderTotalModalSpan = document.getElementById('order-total-modal');
    const startNewOrderBtn = document.getElementById('start-new-order-btn');

    let cart = JSON.parse(localStorage.getItem('coffeeCart')) || []; // Load cart from local storage

    // Always hide the modal on page load
    if (orderConfirmationModal) {
        orderConfirmationModal.style.display = 'none';
    }

    // Function to save cart to local storage
    function saveCart() {
        localStorage.setItem('coffeeCart', JSON.stringify(cart));
    }

    // Function to update cart display (main cart, item counts, total, and menu item buttons)
    function updateCartDisplay() {
        cartItemsList.innerHTML = ''; // Clear current cart display
        let totalItemsInCart = 0;
        let orderTotalPrice = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            confirmOrderBtn.disabled = true;
        } else {
            emptyCartMessage.style.display = 'none';
            confirmOrderBtn.disabled = false;
        }

        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            const itemTotalPrice = item.price * item.quantity;
            orderTotalPrice += itemTotalPrice;
            totalItemsInCart += item.quantity;

            // Ensure image path is correct. Assuming images are in 'images/'
            const itemImageSrc = item.image;

            cartItemElement.innerHTML = `
                <div class="cart-item-details">
                    <img src="${itemImageSrc}" alt="${item.name}">
                    <div class="cart-item-info">
                        <span>${item.name}</span><br>
                        <span class="item-quantity-text">${item.quantity}x</span> @ <span class="item-price-per-unit">$${item.price.toFixed(2)}</span>
                    </div>
                </div>
                <span class="cart-item-total">$${itemTotalPrice.toFixed(2)}</span>
                <button class="remove-item-btn" data-id="${item.id}"><i class="fas fa-times-circle"></i></button>
            `;
            cartItemsList.appendChild(cartItemElement);
        });

        cartItemCount.textContent = totalItemsInCart;
        orderTotalSpan.textContent = `$${orderTotalPrice.toFixed(2)}`;

        // Update quantity controls on menu items (this is the crucial part for the image effect)
        menuItemsGrid.querySelectorAll('.menu-item').forEach(menuItemEl => {
            const itemId = menuItemEl.dataset.id;
            const cartItem = cart.find(item => item.id === itemId);
            const addToCartBtn = menuItemEl.querySelector('.add-to-cart-btn');
            const quantityControls = menuItemEl.querySelector('.quantity-controls');
            const quantitySpan = menuItemEl.querySelector('.quantity-controls .quantity');

            // Only proceed if all necessary elements exist for this menu item
            if (addToCartBtn && quantityControls && quantitySpan) {
                if (cartItem && cartItem.quantity > 0) {
                    addToCartBtn.classList.add('hidden'); // Hide "Add to Cart"
                    quantityControls.classList.remove('hidden'); // Show quantity controls
                    quantitySpan.textContent = cartItem.quantity;
                } else {
                    addToCartBtn.classList.remove('hidden'); // Show "Add to Cart"
                    quantityControls.classList.add('hidden'); // Hide quantity controls
                    quantitySpan.textContent = '0'; // Reset quantity display
                }
            }
        });

        saveCart(); // Save cart state after every update
    }

    // Add to Cart / Quantity Controls Event Listener
    if (menuItemsGrid) { // Ensure menuItemsGrid exists (only on menu.html)
        menuItemsGrid.addEventListener('click', (e) => {
            const menuItemEl = e.target.closest('.menu-item');
            if (!menuItemEl) return; // Not a menu item click

            const itemId = menuItemEl.dataset.id;
            const itemName = menuItemEl.dataset.name;
            const itemPrice = parseFloat(menuItemEl.dataset.price);
            const itemImage = menuItemEl.querySelector('img')?.src; // Get image src from the item's img tag

            // Get specific controls for this menu item
            const addToCartBtn = menuItemEl.querySelector('.add-to-cart-btn');
            const quantityControls = menuItemEl.querySelector('.quantity-controls');
            const quantitySpan = menuItemEl.querySelector('.quantity-controls .quantity');

            if (e.target.closest('.add-to-cart-btn')) {
                const existingItem = cart.find(item => item.id === itemId);
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    cart.push({
                        id: itemId,
                        name: itemName,
                        price: itemPrice,
                        quantity: 1,
                        image: itemImage // Store the image source
                    });
                }
                updateCartDisplay();
            } else if (e.target.closest('.plus-btn')) {
                const existingItem = cart.find(item => item.id === itemId);
                if (existingItem) {
                    existingItem.quantity++;
                    updateCartDisplay();
                }
            } else if (e.target.closest('.minus-btn')) {
                const existingItem = cart.find(item => item.id === itemId);
                if (existingItem) {
                    existingItem.quantity--;
                    if (existingItem.quantity <= 0) {
                        cart = cart.filter(item => item.id !== itemId);
                    }
                    updateCartDisplay();
                }
            }
        });
    }


    // Remove item from cart directly from cart summary
    if (cartItemsList) {
        cartItemsList.addEventListener('click', (e) => {
            if (e.target.closest('.remove-item-btn')) {
                const itemIdToRemove = e.target.closest('.remove-item-btn').dataset.id;
                cart = cart.filter(item => item.id !== itemIdToRemove);
                updateCartDisplay();
            }
        });
    }

    // Menu Item Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (filterButtons.length > 0 && menuItemsGrid) { // Ensure menuItemsGrid exists
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const category = button.dataset.category;

                menuItemsGrid.querySelectorAll('.menu-item').forEach(item => {
                    if (category === 'all' || item.dataset.category === category) {
                        item.style.display = 'flex'; // Show item
                    } else {
                        item.style.display = 'none'; // Hide item
                    }
                });
            });
        });
    }

    // Confirm Order Button
    if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                displayOrderConfirmation();
                generateAndDownloadReceipt();
                orderConfirmationModal.style.display = 'flex'; // Show the modal
            }
        });
    }

    // Modal Close Button
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            orderConfirmationModal.style.display = 'none'; // Hide the modal
        });
    }

    // Close modal if clicked outside of modal content
    if (orderConfirmationModal) {
        orderConfirmationModal.addEventListener('click', (e) => {
            if (e.target === orderConfirmationModal) {
                orderConfirmationModal.style.display = 'none';
            }
        });
    }

    // Display Order Confirmation details in modal
    function displayOrderConfirmation() {
        confirmedOrderItems.innerHTML = ''; // Clear previous items
        let modalTotalPrice = 0;

        cart.forEach(item => {
            const confirmedItemEl = document.createElement('div');
            confirmedItemEl.classList.add('confirmed-item');
            const itemTotalPrice = item.price * item.quantity;
            modalTotalPrice += itemTotalPrice;

            const itemImageSrc = item.image; // Use stored image path

            confirmedItemEl.innerHTML = `
                <div class="confirmed-item-details">
                    <img src="${itemImageSrc}" alt="${item.name}">
                    <div class="confirmed-item-info">
                        <span>${item.name}</span><br>
                        <span class="item-quantity-text">${item.quantity}x</span> @ $${item.price.toFixed(2)}
                    </div>
                </div>
                <span>$${itemTotalPrice.toFixed(2)}</span>
            `;
            confirmedOrderItems.appendChild(confirmedItemEl);
        });
        orderTotalModalSpan.textContent = `$${modalTotalPrice.toFixed(2)}`;
    }

    // Start New Order Button
    if (startNewOrderBtn) {
        startNewOrderBtn.addEventListener('click', () => {
            cart = []; // Clear the cart
            saveCart(); // Save empty cart to local storage
            updateCartDisplay(); // Update the cart summary on the menu page and reset menu item buttons
            orderConfirmationModal.style.display = 'none'; // Hide the modal
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        });
    }

    // Function to generate and download receipt
    function generateAndDownloadReceipt() {
        const date = new Date().toLocaleString();
        let total = 0;

        // Create receipt content
        let receiptContent = `
==========================================
            COFFEE SHOP RECEIPT
==========================================
Date: ${date}
------------------------------------------
Items:
`;

        // Add each item to the receipt
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            receiptContent += `
${item.name}
${item.quantity}x @ $${item.price.toFixed(2)} = $${itemTotal.toFixed(2)}
------------------------------------------`;
        });

        // Add total and footer
        receiptContent += `
------------------------------------------
Total: $${total.toFixed(2)}
==========================================
Thank you for your order!
We hope you enjoy your coffee!
==========================================`;

        // Create and download the file
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `coffee-shop-receipt-${date.replace(/[/\\:]/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    // Initial load: update cart display when the page loads
    updateCartDisplay();
});