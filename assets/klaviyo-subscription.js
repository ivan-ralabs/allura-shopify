/*!
 * Klaviyo Subscribe (https://github.com/estrattonbailey/klaviyo-subscribe)
 * @license MIT
 */
function klaviyoSubscribe(listID, email, phoneObj = {}, customProperties = {}) {
  const phone_number = phoneObj?.phone_number || '';
  
  const profileAttributes = {
    email: email,
    anonymous_id: document.cookie
      .split('; ')
      .find(row => row.startsWith('_kla_id='))
      ?.split('=')[1] || undefined,
    properties: customProperties
  };

  // Додаємо phone_number тільки якщо він валідний для США (починається з +1 та має 11 цифр)
  if (phone_number.match(/^\+1\d{10}$/)) {
    profileAttributes.phone_number = phone_number;
  }

  const options = {
    method: 'POST',
    headers: {
      revision: '2024-06-15',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      data: {
        type: 'subscription',
        attributes: {
          profile: {
            data: {
              type: 'profile',
              attributes: profileAttributes
            }
          }
        },
        relationships: {
          list: {
            data: {
              type: 'list',
              id: listID
            }
          }
        }
      }
    })
  };

  fetch('https://a.klaviyo.com/client/subscriptions/?company_id=WihcYh', options)
  .then(response => {
    if (response.status === 200 || response.status === 202) {
      console.log('✅ Subscription accepted');

      window.dispatchEvent(new CustomEvent('klaviyo:subscribed', {
        detail: {
          email: email,
          listID: listID
        }
      }));
    } else {
      console.warn('⚠️ Unexpected status:', response.status);
    }

    return response.text();
  })
  .catch(err => console.error(err));
}