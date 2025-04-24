const quizQuestions = [
  { title: "Is your main goal to reduce itching, reduce flaking, or both?", options: ["Itchy", "Flaky", "Both"] },
  { title: "Do you prefer to avoid topical steroids?*", options: ["Yes", "No"] },
  { title: "Do you prefer water or oil based products for your hair?", options: ["Water-based", "Oil-based"] },
];

let userAnswers = [];

let currentQuestionIndex = 0;
const totalQuestions = quizQuestions.length;

function saveAnswer(option) {
  console.log('saveAnswer')
  console.log('option:', option)
  userAnswers[currentQuestionIndex] = option; 

}

function toggleSteroidInfo(isVisible) {
  // return
  // Find the element by the selector .quiz-question fieldset
  const element = document.querySelector('.quiz-question fieldset');

  if (!element) {
    console.error('Element .quiz-question fieldset not found!');
    return;
  }

  // Add or remove the d-none class depending on the isVisible value
  if (isVisible) {
    element.classList.remove('d-none'); // Make the element visible
  } else {
    element.classList.add('d-none'); // Hide the element
  }
}


const foundProducts = [];

const selectionStatus = {
    selectedIds: [], 
    isSubscribed: false 
};

function updateSelectionStatus() {
    const bundleRadio = document.querySelector('#add-bundle');
    const shampooRadio = document.querySelector('#add-only-shampoo');
    const serumRadio = document.querySelector('#add-only-scalp-serum');
    const subscribeCheckbox = document.querySelector('#subscribe-save');

    selectionStatus.isSubscribed = subscribeCheckbox ? subscribeCheckbox.checked : false;

    if (bundleRadio && bundleRadio.checked) {
        // const shampooValue = shampooRadio ? shampooRadio.value : null;
        // const serumValue = serumRadio ? serumRadio.value : null;
        // selectionStatus.selectedIds = [shampooValue, serumValue].filter(Boolean); 
      
        const shampooValue = shampooRadio ? shampooRadio.value : null;
        const serumValue = serumRadio ? serumRadio.value : null;
  
        selectionStatus.selectedIds = [
            shampooValue ? { shampoo: shampooValue } : null,
            serumValue ? { scalp_serum: serumValue } : null
        ].filter(Boolean);
    } else if (shampooRadio && shampooRadio.checked) {
        // const shampooValue = shampooRadio ? shampooRadio.value : null;
        // selectionStatus.selectedIds = shampooValue ? [shampooValue] : [];

        const shampooValue = shampooRadio ? shampooRadio.value : null;
  
        selectionStatus.selectedIds = shampooValue ? [{ shampoo: shampooValue }] : [];
    } else if (serumRadio && serumRadio.checked) {
        // const serumValue = serumRadio ? serumRadio.value : null;
        // selectionStatus.selectedIds = serumValue ? [serumValue] : [];

        const serumValue = serumRadio ? serumRadio.value : null;
  
        selectionStatus.selectedIds = serumValue ? [{ scalp_serum: serumValue }] : [];
    } else {
        selectionStatus.selectedIds = []; 
    }
    applySubscriptionDiscount();
    console.log('Updated Selection Status:', selectionStatus);
}

document.querySelectorAll('.customn-add-to-cart-block input[type="radio"], #subscribe-save')
    .forEach(element => {
        element.addEventListener('change', updateSelectionStatus);
    });

// updateSelectionStatus();



function selectPurchasePlan(radioButton) {
    console.log('selectPurchasePlan:', radioButton)
    if (radioButton) {
        radioButton.checked = true; 
        const parentContainer = radioButton.closest('.sls-option-container');
        if (parentContainer) {
            const label = parentContainer.querySelector('.sls-custom-radio');
            console.log("label::::", label);
            if (label) {
                setTimeout(() => {
                  label.click(); 
                  console.log('Clicked on label for the selected option');
                }, 500);
            } else {
                console.error('Label not found');
            }
        } else {
            console.error('Parent container not found for the radio button');
        }
    } else {
        console.error('Radio button not found');
    }
}

function handleBundlePurchase(selectedIds, isSubscribed) {
  console.log('Processing bundle purchase for IDs:', selectedIds);
  console.log('isSubscribed:', isSubscribed);

  // Find the container for available products
  const container = document.querySelector('.bndlr-inner-products-container .bndlr-mnm-available-products');
  if (!container) {
      console.error('Products container not found.');
      return;
  }

  const optionToSelect = userAnswers[2].split('-')[0]; // Extract the desired variant from userAnswers

  // Find products matching the IDs in selectedIds
  const foundProducts = selectedIds.map(product => {
      const productId = Object.values(product)[0];

      console.log('container:', container)
      console.log('productId:', productId);
    
      const productElement = container.querySelector(`.bndlr-product.bndlr-mix-and-match[data-product-id="${productId}"]`);
      if (productElement) {
          console.log("***")
          console.log("***:", productElement)
          console.log("***")
          return productElement;
      } else {
          console.warn(`Product with ID ${productId} not found in the container.`);
          return null; // Return null if the product is not found
      }
  }).filter(Boolean); // Filter out null values from the array

  // console.log('Found products:', foundProducts);

  // Process each found product
  foundProducts.forEach(productElement => {
      const addToBundleButton = productElement.querySelector('.bndlr-add-to-bundle');
    
      if (addToBundleButton) {
          addToBundleButton.click();
      } else {
          console.warn('Add to bundle button not found for product:', productElement);
      }
  });

  setTimeout(() => {
    const purchaseButtonsContainer = document.querySelector('.bndlr-inner-products-container .bndlr-mnm-second-container .bndlr-mnm-add-to-cart-wrapper');
    console.log('purchaseButtonsContainer:::::', purchaseButtonsContainer)
    
    if (isSubscribed) {
        // Find the container and select the radio button for subscription
        const subscriptionRadioButton = purchaseButtonsContainer.querySelector('.sls-purchase-options-container .sls-option-container input[type="radio"][data-type="subscription"]');
        
        selectPurchasePlan(subscriptionRadioButton);
    } else {
        // Find the container and select the radio button for one-time purchase
        const oneTimeRadioButton = purchaseButtonsContainer.querySelector('.sls-purchase-options-container .sls-option-container input[type="radio"][data-type="one_time"]');
        
        selectPurchasePlan(oneTimeRadioButton);
    }
  }, 500);
  
  const addToCartButton = document.querySelector('.bndlr-add-bundle-to-cart');
  if (addToCartButton) {
    console.log('Found the addToCartButton:', addToCartButton);
    if (!addToCartButton.classList.contains('bndlr-hidden')) {
      // alert('BundlePurchase')
      setTimeout(() => {
        addToCartButton.click(); // Trigger click on the next button
        console.log('addToCartButton clicked.'); 
      }, 1200);       
    }
  } else {
      console.warn('addToCartButton not found inside the product element.');
  }
}


function handleSinglePurchase(selectedId, isSubscribed) {
    console.log('Processing single purchase for ID:', selectedId);
    console.log('isSubscribed:', isSubscribed);

    // Find the container for single item purchases
    const container = document.querySelector('.one-item-buy-button-wrapper');
    if (!container) {
        console.error('Single item buy button container not found.');
        return;
    }

    // Get the product type and its ID
    const [productType] = Object.keys(selectedId);
    const productId = selectedId[productType];
  
    // Construct the dynamic selector for the product using the selected ID
    const productSelector = `.buy-product-${productId}`;
    console.log('Looking for product with selector:', productSelector);

    const optionToSelect = userAnswers[2].split('-')[0].toLowerCase(); // Extract the desired variant from userAnswers
    console.log('Option to select:', optionToSelect);
  
    // Find the product element within the container
    const productElement = container.querySelector(productSelector);
    if (productElement) {
        console.log('Found product element:', productElement);
        
        // Additional logic for subscription handling
        if (isSubscribed) {
            console.log('User is subscribed. Additional logic can be added here.');
            
            // Find the radio input for Subscribe option
            const subscribeRadioInput = productElement.querySelector('input[type="radio"][data-type="subscription"]');
            console.log('subscribeRadioInput:', subscribeRadioInput);
            if (subscribeRadioInput) {
                // If not checked, trigger the click event
                if (!subscribeRadioInput.checked) {
                    console.log('Subscribe option is not checked. Triggering click event...');
                    subscribeRadioInput.click();
                } else {
                    console.log('Subscribe option is already checked.');
                }
            } else {
                console.warn('Subscribe radio input not found.');
            }
        } else {
            console.log('User selected One-time purchase option.');
            
            // Find the radio input for One-time purchase option
            const oneTimeRadioInput = productElement.querySelector('input[type="radio"][data-type="one_time"]');
            if (oneTimeRadioInput) {
                // If not checked, trigger the click event
                if (!oneTimeRadioInput.checked) {
                    console.log('One-time purchase option is not checked. Triggering click event...');
                    oneTimeRadioInput.click();
                } else {
                    console.log('One-time purchase option is already checked.');
                }
            } else {
                console.warn('One-time purchase radio input not found.');
            }
        }
    } else {
        console.warn(`Product with selector "${productSelector}" not found in the container.`);
        return
    }
    const nextButton = productElement.querySelector('.product-form__buttons button');
    if (nextButton) {
        console.log('Found the next button:', nextButton);
        nextButton.click(); // Trigger click on the next button
        console.log('Next button clicked.');
    } else {
        console.warn('Next button not found inside the product element.');
    }
}


function handleAddToCartClick() {
    const button = event.currentTarget;

    // Disable the button and show a spinner
    button.disabled = true;
    button.classList.add('loading');
  
    const { selectedIds } = selectionStatus;
    const { isSubscribed } = selectionStatus;

    // if (!canAddToCart(selectedIds)) {
    //     button.disabled = false;
    //     button.classList.remove('loading');
        
    //     const message = selectedIds.length > 1
    //       ? 'This bundle is already in your cart.'
    //       : 'This product is already in your cart.';
    
    //     showToast(message);
    //     return
    // }
    const foundIds = canAddToCart(selectedIds);
    if (foundIds.length > 0) {
        button.disabled = false;
        button.classList.remove('loading');
        
        let message = '';
        if (foundIds.length > 1) {
            message = 'This bundle is already in your cart.';
        } else {
            const matchedItem = selectedIds.find(item => Object.values(item).includes(String(foundIds[0])));
            const key = Object.keys(matchedItem)[0];
    
            if (key === 'shampoo') {
                message = 'Shampoo is already in your cart.';
            } else if (key === 'scalp_serum') {
                message = 'Scalp serum is already in your cart.';
            }
        }
    
        showToast(message);
        return;
    }

    setTimeout(() => {
        button.disabled = false;
        button.classList.remove('loading');
        // showQuizz();
        // window.location.reload();
    }, 1500); 
  
    if (selectedIds.length === 2) {
        console.log("BUNDLE PURCHASE")
        handleBundlePurchase(selectedIds, isSubscribed);
        
        CartStorage.addBundle(selectedIds);
    } else if (selectedIds.length === 1) {
        console.log("ONE-TIME PURCHASE")
        handleSinglePurchase(selectedIds[0], isSubscribed);
        CartStorage.addProduct(electedIds[0]);
    } else {
        console.warn('No items selected. Please select a product before adding to cart.');
    }

    updateSelectionStatus();
}

document.querySelector('#quizz-result-add-to-cart').addEventListener('click', handleAddToCartClick);


function showToast(message) {
    const toastElement = document.getElementById('validation-cart-items');
    const toastBody = toastElement.querySelector('.toast-body');
    toastBody.textContent = message; 

    const toast = new bootstrap.Toast(toastElement);

    toast.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
        console.log('Toast has been closed');
    });
}

function getFilteredProducts() {
  console.log('getFilteredProducts');
  console.log('userAnswers:', userAnswers)
  // userAnswers = [ "Itchy", "No", "Oil-based" ];
  
  const group1 = [
    userAnswers[0], 
    userAnswers[1] === "Yes" ? "no-steroids" : "steroids"
  ].map(tag => tag.toLowerCase());
  
  const group2 = [
    userAnswers[1] === "Yes" ? "no-steroids" : "steroids",
    userAnswers[2].replace("-based", "")
  ].map(tag => tag.toLowerCase()); 
  
  console.log('group1:', group1);
  console.log('group2:', group2);
  
  const products = document.querySelectorAll('.product-wrap');
  
  products.forEach(product => {
    const productTags = product.getAttribute('data-tags').split(',').map(tag => tag.toLowerCase().trim());
    // console.log('productTags:', productTags);
    
    const productType = product.getAttribute('data-product-type').toLowerCase();  
    // console.log('productType:', productType);

    if (productType === "shampoo") {
      if (group1.every(tag => productTags.includes(tag))) {
        product.style.display = 'block';  
        
        const shampooElement = document.querySelector('#add-only-shampoo');
        if (shampooElement) {
          const productId = product.getAttribute('data-product-id');
          shampooElement.value = productId;
          foundProducts.push(productId);
        }
      } else {
        product.style.display = 'none';  
      }
    } else if (productType === "scalp serum") {
      if (group2.every(tag => productTags.includes(tag))) {
        product.style.display = 'block';  
        
        const scalpSerumElement = document.querySelector('#add-only-scalp-serum');
        if (scalpSerumElement) {
          const productId = product.getAttribute('data-product-id');
          scalpSerumElement.value = productId;
          foundProducts.push(productId);
        }
      } else {
        product.style.display = 'none';  
      }
    } else {
      product.style.display = 'none';  
    }
  });
}

function updateQuestion(direction, questionIndex) {
  // console.log('updateQuestion');
  // console.log('direction:', direction);
  // console.log('questionIndex:', questionIndex);

  disableNextButton();

  // Getting the correct question by index.
  const question = quizQuestions[questionIndex];

  // Updating the title with the question.
  const questionTitle = document.createElement('h2');
  questionTitle.textContent = question.title;

  // Creating a new container for the step with a unique id.
  const form = document.getElementById('quiz-form');
  const stepDiv = document.createElement('div');
  const currentStepId = `step-${questionIndex}`;
  stepDiv.id = currentStepId;
  stepDiv.classList.add('quiz-step');

  // Adding a title for the step.
  stepDiv.appendChild(questionTitle);

  // Creating answer options for the current question.
  question.options.forEach((option) => {
      const label = document.createElement('label');

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `answer-${questionIndex}`;  // A unique name for each question.
      input.value = option;

      const customRadio = document.createElement('span');
      customRadio.classList.add('custom-radio');

      label.appendChild(input);
      label.appendChild(customRadio);
      label.innerHTML += ` ${option}`;

      stepDiv.appendChild(label);
  });

  // debugger
  console.log('currentQuestionIndex:', currentQuestionIndex)
  // Call toggleSteroidInfo based on the option value
  if ( currentQuestionIndex == 1 ) {
    toggleSteroidInfo(true); // Show the steroid information
  } else {
    toggleSteroidInfo(false); // Hide the steroid information
  }
  
  // Handling for the 'next' direction.
  if (direction === 'next' && questionIndex > 0) {
      const previousStep = document.getElementById(`step-${questionIndex - 1}`);
      if (previousStep) {
          previousStep.style.display = 'none'; // Hiding the previous step.
      }
  }

  // Handling for the 'previous' direction.
  if (direction === 'previous') {
      const currentStep = document.getElementById(`step-${questionIndex}`);
      const previousStep = document.getElementById(`step-${questionIndex + 1}`);
      console.log('currentStep:', currentStep)
      console.log('previousStep:', previousStep)
      if (currentStep) {
          currentStep.style.display = 'block'; // Hiding the current step.
          enableNextButton()
      }

      if (previousStep) {
          previousStep.remove();
      }
  }

  // Add a new step to the form only if the direction is 'next'.
  if (direction === 'next') {
      form.appendChild(stepDiv);
  }

  // Add an event handler for selection change.
  const inputs = stepDiv.querySelectorAll('input[type="radio"]');
  inputs.forEach((input) => {
      input.addEventListener('change', (event) => {
          // Getting the selected option
          const selectedOption = event.target.value;
  
          // Saving the answer
          saveAnswer(selectedOption);
  
          // Calling the function to activate the 'Next' button if there is a selection
          enableNextButton(event);
      }, { capture: true });
  });

  // Updating progress.
  const progressPercentage = (questionIndex + 1) / totalQuestions * 100;
  const progressBar = document.getElementById('progress-bar');
  progressBar.style.width = `${progressPercentage}%`;

  document.getElementById('progress-text').textContent = `${questionIndex + 1}/${totalQuestions}`;

  const nextButton = document.getElementById('next-button');
  if (currentQuestionIndex === totalQuestions - 1) {
    nextButton.innerHTML = 'Show Result';
  } else {
    nextButton.innerHTML = 'Next <i class="bi bi-caret-right-fill"></i>';
  }
}

function processProductPrice(productPrice) {
  console.log('productPrice:', productPrice)
  // Remove the dollar sign and trim any whitespace
  const priceWithoutDollar = productPrice.replace('$', '').trim();

  // Convert the string to a float number
  const priceInUSD = parseFloat(priceWithoutDollar);

  // Convert the price to cents (multiply by 100)
  const priceInCents = Math.round(priceInUSD * 100);

  // Calculate 10% discount
  const priceAfterDiscountInCents = priceInCents * 0.9;

  // // Convert back to float and format with two decimals
  // const finalPrice = (priceAfterDiscountInCents / 100).toFixed(2);

  // return parseFloat(finalPrice); // Return the final price as a float
  return priceAfterDiscountInCents
}

function applySubscriptionDiscount() {
  console.log('applySubscriptionDiscount');

  // Перевірка статусу підписки
  const isSubscribed = selectionStatus.isSubscribed;

  // Знайти всі елементи з класом `.price` у зазначеній структурі
  const priceElements = document.querySelectorAll('.customn-add-to-cart-block .custom-radio-item .price');
  // Пройтися по кожному елементу
  priceElements.forEach(priceElement => {
      // Отримати значення data-атрибутів
      const originalPrice = priceElement.getAttribute('data-original-price');
      const discountedPrice = priceElement.getAttribute('data-discounted-price');

      // Якщо ціни не встановлені, пропустити елемент
      if (!originalPrice || !discountedPrice) return;

      // Оновити вміст залежно від статусу підписки
      if (isSubscribed) {
          priceElement.innerHTML = `<span style="text-decoration: line-through;">$${parseFloat(originalPrice / 100).toFixed(2)}</span> $${parseFloat(discountedPrice / 100).toFixed(2)}`;
      } else {
          priceElement.textContent = `$${parseFloat(originalPrice / 100).toFixed(2)}`;
      }
  });
}
// For adding prices without considering the subscription discount 
// to the purchase method selection panel
function updatePrices() {
  console.log('updatePrices');
  const bundlePriceSpan = document.querySelector('label[for="add-bundle"].custom-label .price');
  const shampooPriceSpan = document.querySelector('label[for="add-only-shampoo"].custom-label .price');
  const serumPriceSpan = document.querySelector('label[for="add-only-scalp-serum"].custom-label .price');
  let shampooPriceCents = 0;
  let serumPriceCents = 0;
  // totals
  let totalBundlePrice = 0;
  let totalWithDiscount = 0;
  // discounts
  const bundleDiscount = 0.10;
  const discountPercentage = 25;

  // Iterate through selectedIds
  selectionStatus.selectedIds.forEach(product => {
      // Get the product type and its ID
      const [productType] = Object.keys(product);
      const productId = product[productType];
  
      // Find the corresponding element using data-product-id
      const productElement = document.querySelector(`.product-wrap[data-product-id="${productId}"]`);

      const productPrice = productElement.getAttribute('data-product-price');
      const productDiscountPrice = productElement.getAttribute('data-discount-price');
      
      if (productElement) {
        // Check if we have a subscription
        if (selectionStatus.isSubscribed) {
            // Update the appropriate price span based on the product type
            if (productType === 'shampoo' && shampooPriceSpan) {
              shampooPriceSpan.setAttribute('data-original-price', productPrice);
              shampooPriceSpan.setAttribute('data-discounted-price', productDiscountPrice); 
              
              shampooPriceSpan.innerHTML = `<span style="text-decoration: line-through;">$${(productPrice / 100).toFixed(2)}</span> $${(productDiscountPrice / 100).toFixed(2)}`;
              shampooPriceCents = productPrice;
            } else if (productType === 'scalp_serum' && serumPriceSpan) {
              serumPriceSpan.setAttribute('data-original-price', productPrice);
              serumPriceSpan.setAttribute('data-discounted-price', productDiscountPrice); 
              
              serumPriceSpan.innerHTML = `<span style="text-decoration: line-through;">$${(productPrice / 100).toFixed(2)}</span> $${(productDiscountPrice / 100).toFixed(2)}`;
              serumPriceCents = productPrice;
            }
         
        } else {
          // Update the appropriate price span based on the product type
          if (productType === 'shampoo' && shampooPriceSpan) {
              shampooPriceSpan.setAttribute('data-original-price', productPrice);
            
              shampooPriceSpan.textContent = `$${(productPrice / 100).toFixed(2)}`;
              shampooPriceCents = productPrice;
          } else if (productType === 'scalp_serum' && serumPriceSpan) {
              serumPriceSpan.setAttribute('data-original-price', productPrice);
            
              serumPriceSpan.textContent = `$${(productPrice / 100).toFixed(2)}`;
              serumPriceCents = productPrice;
          }
        }
      }
  });
  // Convert back to float and format with two decimals
  // const finalPrice = ((shampooPriceCents + serumPriceCents) / 100).toFixed(2);

  // // Update the bundle price span with the total price, adding the dollar sign
  // if (selectionStatus.isSubscribed) {
  //     if (finalPrice > 0) {
  //         bundlePriceSpan.innerHTML = `<span style="text-decoration: line-through;">$${finalPrice}</span> $${(totalWithDiscount / 100).toFixed(2)}`;
  //     }
  // } else {
  //     if (finalPrice > 0) {
  //         bundlePriceSpan.textContent = `$${finalPrice}`;
  //     }
  // }

  // Calculate total bundle price
  totalBundlePrice = parseInt(shampooPriceCents, 10) + parseInt(serumPriceCents, 10);
  // debugger
  // Apply bundle discount (10%)
  let bundlePriceAfterBundleDiscount = totalBundlePrice - (totalBundlePrice * bundleDiscount);
  
  // Apply subscription discount (25%) if subscribed
  if (selectionStatus.isSubscribed) {
      totalWithDiscount = bundlePriceAfterBundleDiscount - (bundlePriceAfterBundleDiscount * (discountPercentage / 100));
  } else {
      totalWithDiscount = bundlePriceAfterBundleDiscount;
  }
  
  // Convert back to float and format with two decimals
  const finalPrice = (bundlePriceAfterBundleDiscount / 100).toFixed(2);
  const discountedPrice = (totalWithDiscount / 100).toFixed(2);
  
  // Update the bundle price span with the total price, adding the dollar sign
  if (selectionStatus.isSubscribed) {
      if (finalPrice > 0) {
          bundlePriceSpan.setAttribute('data-original-price', bundlePriceAfterBundleDiscount);
          bundlePriceSpan.setAttribute('data-discounted-price', totalWithDiscount); 
        
          bundlePriceSpan.innerHTML = `<span style="text-decoration: line-through;">$${finalPrice}</span> $${discountedPrice}`;
      }
  } else {
      if (finalPrice > 0) {
          bundlePriceSpan.setAttribute('data-original-price', bundlePriceAfterBundleDiscount);
        
          bundlePriceSpan.textContent = `$${finalPrice}`;
      }
  }

  return
  // second working method
  if (bundlePriceSpan) {
      let totalBundlePrice = 0;
  
      // Set a timeout to execute the code after 1 second (1000ms)
      setTimeout(() => {
          // Iterate through selectedIds to find products of type 'bundle'
          selectionStatus.selectedIds.forEach(product => {
              const [productType] = Object.keys(product);
              const productId = product[productType];
  
              const productElement = document.querySelector(`.bndlr-product[data-product-id="${productId}"]`);
  
              if (productElement) {
                  const priceElement = productElement.querySelector('.bndlr-new-price');
                  // const priceUSD = priceElement ? priceElement.getAttribute('data-currency-usd') : null;
                  const priceUSD = priceElement ? priceElement.getAttribute('data-currentprice') : null;
  
                  if (priceUSD) {
                      totalBundlePrice += parseInt(priceUSD);
                  }
              }
          });
          // Update the bundle price span with the total price, adding the dollar sign
          if (totalBundlePrice > 0) {
              bundlePriceSpan.textContent = `$${(totalBundlePrice / 100).toFixed(2)}`; // Format the result with two decimals
          }
  
      }, 1000); // This will execute the code after 1 second
  }

}


function filterSliderProducts() {
  // Extract all selected product IDs into a Set for faster lookup
  const selectedProductIds = new Set(
      selectionStatus.selectedIds.map(item => {
          const [productType] = Object.keys(item);
          return item[productType];
      })
  );

  // Find all product elements in the slider
  const products = document.querySelectorAll('.swiper-slide');

  // Filter products based on whether their ID is in the selected IDs
  products.forEach(product => {
      const productId = product.getAttribute('data-product-id');
      
      // Hide the product if it's not in the selected IDs
      if (!selectedProductIds.has(productId)) {
          product.style.display = 'none';
      } else {
          product.style.display = ''; // Ensure visible if it's in the selected IDs
      }
  });
}

function filterTabletProducts() {
  // Extract all selected product IDs into a Set for faster lookup
  const selectedProductIds = new Set(
      selectionStatus.selectedIds.map(item => {
          const [productType] = Object.keys(item);
          return item[productType];
      })
  );

  // Find all product elements in the slider
  const products = document.querySelectorAll('.product-tablet-wrap');

  // Filter products based on whether their ID is in the selected IDs
  products.forEach(product => {
      const productId = product.getAttribute('data-product-id');
      
      // Hide the product if it's not in the selected IDs
      if (!selectedProductIds.has(productId)) {
          product.style.display = 'none';
      } else {
          product.style.display = ''; // Ensure visible if it's in the selected IDs
      }
  });
}

function enableNextButton() {
  // console.log('enableNextButton')
  const nextButton = document.getElementById('next-button');
  nextButton.disabled = false;
}

function disableNextButton() {
  // console.log('disableNextButton')
  const nextButton = document.getElementById('next-button');
  nextButton.disabled = true;
}

function navigateQuestion(direction) {
  // console.log('navigateQuestion')
  // const nextButton = document.getElementById('next-button');
  const previousButton = document.getElementById('previous-button');

  // const toastTrigger = document.getElementById('liveToastBtn')
  const toastLiveExample = document.getElementById('liveToast')
  
  if (toastLiveExample) {
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
    toastBootstrap.hide()
  }
  
  toggleSteroidInfo(false); // Hide the steroid information
  
  const selectedAnswer = document.querySelector(`input[name="answer"]:checked`);
  if (direction === 'next' && selectedAnswer) {
      // Save the response when moving forward.
      saveResults(currentQuestionIndex, selectedAnswer.value);
  }
  
  if (direction === 'next' && currentQuestionIndex < totalQuestions - 1) {
    
    currentQuestionIndex++;
    updateQuestion(direction, currentQuestionIndex); // Updating the question to the next one.
    // console.log(currentQuestionIndex)

    if (currentQuestionIndex == 0) {
      previousButton.style.display = 'none';
    } else {
      previousButton.style.display = 'inline-block';
    }
    
  } else if (direction === 'previous' && currentQuestionIndex > 0) {
      currentQuestionIndex--;
      updateQuestion(direction, currentQuestionIndex); // Updating the question to the previous one.
      if (currentQuestionIndex == 0) {
        previousButton.style.display = 'none';
      }
  } else if (currentQuestionIndex === totalQuestions - 1) {
      showResult(); // Displaying the result after the last question.
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateQuestion('next', 0); 
});

function showResult() {
  console.log('showResults')
  console.log(userAnswers)
  document.querySelector('.quiz-container').style.display = 'none'; 
  document.getElementById('result-page').style.display = 'block'; 

  getFilteredProducts();
  updateSelectionStatus();
  updatePrices();
  filterSliderProducts();
  filterTabletProducts();

  applyPurchaseParams();
} 

function applyPurchaseParams() {
    // Get the current URL and parameters
    const urlParams = new URLSearchParams(window.location.search);

    // Check if the URL contains quiz and purchase parameters
    const purchaseParam = urlParams.get("purchase");

    // Get the checkbox element by its ID
    const subscribeCheckbox = document.getElementById("subscribe-save");

    if (purchaseParam === "one_time") {
        // If parameters match, set the checkbox to checked
        subscribeCheckbox.checked = false;
        subscribeCheckbox.dispatchEvent(new Event('change'));

    } else {
        // Otherwise, unset the checkbox
        subscribeCheckbox.checked = true;
        subscribeCheckbox.dispatchEvent(new Event('change'));
    }
}

function showQuizz() {
  console.log('showQuizz')
  console.log(userAnswers)
  document.querySelector('.quiz-container').style.display = 'block'; 
  document.getElementById('result-page').style.display = 'none'; 
  document.querySelectorAll('#quiz-form .quiz-step').forEach(step => {
    step.remove(); 
  });
  document.getElementById('next-button').textContent = 'Next';
  userAnswers = [];
  currentQuestionIndex = 0;
  updateQuestion('next', 0); 
  getCartItems();
} 

function saveResults(questionIndex, answer) {
  userAnswers[questionIndex] = answer;
}

function getUserAnswers() {
  return userAnswers;
}


const CartStorage = {
  key: 'shoppingCart', // Key for storing cart data

  // Load cart data (returns an object)
  load() {
    const storedData = localStorage.getItem(this.key);
    return storedData ? JSON.parse(storedData) : { products: [], bundles: [] };
  },

  // Save cart data (products and bundles)
  save(data) {
    console.log('save');
    console.log('data:', data);
    if (!data || typeof data !== 'object') {
      throw new Error('Data must be an object containing products and bundles.');
    }
    localStorage.setItem(this.key, JSON.stringify(data));
  },

  // Add a product to the cart
  addProduct(productId) {
    const cart = this.load();
    console.log('cart:', cart);
    console.log('product id:', productId);
    if (!cart.products.includes(productId)) {
      console.log('condition true')
      cart.products.push(productId);
      this.save(cart);
    }
  },

  // Remove a product from the cart
  removeProduct(productId) {
    const cart = this.load();
    cart.products = cart.products.filter(id => id !== productId);
    this.save(cart);
  },

  // Add a bundle (type and product ID)
  addBundle(bundleProducts) {
    const cart = this.load();
  
    // Перетворюємо продукти в масив ID
    const bundle = bundleProducts.map(product => {
      const product_id = Object.values(product)[0]; // Отримуємо значення ID продукту
      return String(product_id); // Повертаємо лише ID продукту
    });
  
    // Перевіряємо, чи такий бандл вже є в кошику
    const isDuplicate = cart.bundles.some(existingBundle => 
      existingBundle.length === bundle.length && 
      existingBundle.every((product_id, index) => 
        product_id === bundle[index] // Перевірка на рівність ID продуктів
      )
    );
    console.log("632")
    console.log('bundle:', bundle)
    console.log("632")
    if (!isDuplicate) {
      cart.bundles.push(bundle); // Додаємо бандл, якщо його ще немає
      this.save(cart); // Зберігаємо оновлений кошик
    }
  },

  // Remove a bundle by type and product ID
  removeBundle(productType, productId) {
    const cart = this.load();
    cart.bundles = cart.bundles.filter(b => !(b.type === productType && b.id === productId));
    this.save(cart);
  },

  // Clear all cart data
  clear() {
    localStorage.removeItem(this.key);
  },

  // Subscribe to changes (for multi-tab syncing)
  onChange(callback) {
    window.addEventListener('storage', (event) => {
      if (event.key === this.key) {
        const newData = event.newValue ? JSON.parse(event.newValue) : { products: [], bundles: [] };
        callback(newData);
      }
    });
  }
};


// function canAddToCart(items) {
//   console.log('canAddToCart');
//   console.log('items:', items);
//   // getCartItems();

//   const cart = CartStorage.load();

//   function getProductIds(items) {
//     return items.map(item => Object.values(item)[0]);
//   }

//   // If the cart is empty, any product or bundle can be added.
//   if (cart.products.length === 0 && cart.bundles.length === 0) {
//     return true;
//   }

//   const ids = Array.isArray(items) ? getProductIds(items) : [items];
//   const numericIds = ids.map(id => Number(id));

//   const isInBundles = numericIds.every(id => cart.bundles.includes(id));
//   const isInProducts = numericIds.some(id => cart.products.includes(id));

//   return isInBundles 
//     ? (console.log('Items are already in a bundle'), false)
//     : isInProducts
//     ? (console.log('Some items are already in products'), false)
//     : (console.log('Items can be added to the cart'), true);
// }

function canAddToCart(items) {
  console.log('canAddToCart');
  console.log('items:', items);

  const cart = CartStorage.load();

  // Отримання ID-ів продуктів із вхідних даних
  function getProductIds(items) {
    return items.map(item => Object.values(item)[0]);
  }

  // Якщо кошик порожній, повертаємо пустий масив, бо співпадінь немає
  if (cart.products.length === 0 && cart.bundles.length === 0) {
    console.log('Cart is empty, no matches found.');
    return []; // Жодних співпадінь
  }

  const ids = Array.isArray(items) ? getProductIds(items) : [items];
  const numericIds = ids.map(id => Number(id));

  // Перевіряємо на наявність ID-ів у бандлах та продуктах
  const matchedInBundles = numericIds.filter(id => cart.bundles.includes(id));
  const matchedInProducts = numericIds.filter(id => cart.products.includes(id));

  // Повертаємо всі знайдені ID-ошки, які вже є в кошику
  const matches = [...matchedInBundles, ...matchedInProducts];
  console.log('Matched IDs:', matches);

  return matches; // Повертаємо масив знайдених ID
}


// Your JavaScript code for retrieving items from the cart
function getCartItems() {
  console.log('getCartItems')
  fetch('/cart.json')
    .then(response => response.json()) // Get cart data in JSON format
    .then(data => {
      console.log('Items in the cart:', data.items); // Log the items in the console

      const result = {
          products: [],
          bundles: []
      };
      
      data.items.forEach(item => {
          const bundlerId = item.properties["_bundler_558869"];
          
          // Якщо властивість "_bundler_558869" існує, це бандл
          if (bundlerId !== undefined && bundlerId !== null) {
              // Шукаємо, чи є вже бандл з таким ID
              const existingBundle = result.bundles.find(bundle =>
                  bundle.includes(item.product_id)  // Перевіряємо, чи є продукт у вже існуючому бандлі
              );
      
              if (existingBundle) {
                  // Якщо бандл існує, додаємо продукт до цього бандлу
                  existingBundle.push(item.product_id);
              } else {
                  // Якщо бандл не знайдений, створюємо новий бандл з цим продуктом
                  result.bundles.push([item.product_id]);  // Створюємо масив з одного продукту
              }
          } else {
              // Якщо немає властивості "_bundler_558869", додаємо продукт до одиничних
              if (!result.products.includes(item.product_id)) {
                  result.products.push(item.product_id);
              }
          }
      });
      
      // Зливаємо всі бандли в один масив без вкладених масивів
      result.bundles = result.bundles.flat();
      
      // Лог для перевірки результату
      console.log(result);
      
      CartStorage.clear();
      CartStorage.save(result);


      return data.items; // Return the list of items
    })
    .catch(error => {
      console.error('Error retrieving items from the cart:', error);
    });
}

// Call the function after the page has loaded
document.addEventListener('DOMContentLoaded', function() {
  getCartItems(); // Call the function after the page has loaded
});