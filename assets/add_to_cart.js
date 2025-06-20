function testingBundler (e) {
  console.log(e.type, JSON.parse(JSON.stringify(arguments)));
}
// This event will be fired whenever the Bundler app is loaded
document.addEventListener('bundler:loaded', testingBundler);
// This event will be fired whenever a bundle widget is rendered
document.addEventListener('bundler:bundle_widget_created', testingBundler);



// This event will be fired when the cart values are recalculated
var event = new CustomEvent("bundler:total_cart_values", {
  detail: {
    total_amount_original: originalAmount,
    total_amount_discounted: discountedAmount,
    discount_amount: discountAmount,
    original_cart_object: originalCartData,
  },
});
document.dispatchEvent(event);

document.addEventListener(
    'click',
    (event) => {
        console.log('Click event captured:', event);
        console.log('Target element:', event.target);
    },
    true // Режим перехоплення
);

window.bndlr.updateCartDiscounts();

window.bndlr.getCheckoutInfo(
    function(data) {
        console.log(data);
        if (typeof data !== 'undefined' && typeof data.can_apply_discount !== 'undefined' && data.can_apply_discount === true) {
            // Do your magic with the discount
        } else {
            // Discount can't be applied
        }
        
        // Data object in this callback will contain properties
        // can_apply_discount: Boolean	<-- whether the app has any discount to apply or not
        // code: String 				<-- discount code, if applicable (the merchant must turn on the option to apply discounts with discount codes in Bundler > General Settings > Apply discounts).
        // items: Array[], 				<-- items with detailed pricing and discount info
        // status_code: Integer, 		<-- status code, 200 means OK, 201 means that the draft order is not yet ready
        // url: String 					<-- URL to which the customer would get redirected to get a discount. If a discount code is used, then it will contain a discount code, if a draft order is used then a link to the draft order will be here.
    }
);

// document.addEventListener('DOMContentLoaded', function() {
//     if (window.location.pathname.includes('/cart')) {
//       alert(3)
//         // Блокуємо відкриття CartDrawer на сторінці корзини
//         const cartIcon = document.querySelector('#cart-icon-bubble');
        
//         if (cartIcon) {
//           alert(4)
//             cartIcon.addEventListener('click', function(event) {
//                 event.preventDefault(); // Скасовуємо стандартну поведінку
//                 console.log('CartDrawer open is blocked on the cart page.');
//             });
//         }
//     }
// });

