// Retrieve login information from local storage
const username = localStorage.getItem('username');
const email = localStorage.getItem('email');
const password = localStorage.getItem('password');

// Display Login info
document.getElementById('username').textContent = username || email;

//logout
const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', function () {
  window.location.href = 'index.html';
});

//To the grpah
const graphbtn = document.getElementById('graph-btn');
graphbtn.addEventListener('click', function () {
  window.location.href = 'graph.html';
});

// ----------------------------------

const url = 'https://01.kood.tech/api/auth/signin';

const info = username + ':' + password;
const credentials = btoa(info);

// JWT
fetch(url, {
  method: 'POST',
  headers: {
    Authorization: 'Basic ' + credentials,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({}),
})
  .then((response) => response.json())
  .then((data) => {
    const jwt = data;
    console.log(jwt);

    //----------------------------

    // Send API REQUEST
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`, // Ajouter le JWT dans l'en-tête d'autorisation
      },
      body: JSON.stringify({
        query: `
        {
          user{
                    auditRatio
                    firstName
                    lastName
                    campus
                    email
                    attrs
                    xps {
                      event {
                        id
                      }
                      amount
                      path
                      
                    }
                  }
          xp_total: transaction_aggregate(where: {type: {_eq: "xp"}, eventId: {_eq: 20}}) {
              aggregate {
                sum {
                  amount
                }
              }
            }
          }
        `,
      }),
    };

    // variable to store the JSON response
    let dt;

    // Send request to API
    fetch('https://01.kood.tech/api/graphql-engine/v1/graphql', requestOptions)
      .then((response) => response.json())
      .then((json) => {
        dt = json;
        processData(dt);
      })
      .catch((error) => console.log(error));

    function processData(data) {
      // Lets set data we got
      const name = data.data.user[0].firstName;
      const lastName = data.data.user[0].lastName;
      const campus = data.data.user[0].campus;
      const email = data.data.user[0].email;

      const xps = data.data.user[0].xps.filter((item) => !item.path.includes('piscine'));

      // Calculate xp without piscine to match on our profile
      let totalAmount = 0;

      for (let i = 0; i < xps.length; i++) {
        let amount = xps[i].amount;
        totalAmount += amount;
      }

      console.log(data.data.xp_total.aggregate.sum.amount);
      document.getElementById('xp').textContent = Math.round(totalAmount / 1000) + ' kB';

      const tel = data.data.user[0].attrs.Phone;
      const addresse = data.data.user[0].attrs.addressStreet;
      const city = data.data.user[0].attrs.addressCity;

      let ratio = data.data.user[0].auditRatio;

      const theImage = data.data.user[0].attrs.image;
      // Check if theImage is valid or not. If not, use a default image
      const validImage = theImage || '../img/profile.png';

      const image = document.createElement('img');
      image.setAttribute('src', validImage);
      image.classList.add('responsive-img');
      image.style.border = '4px solid white';

      // add the image
      const header = document.querySelector('.header');
      const user_info = header.querySelector('.banner');
      user_info.insertBefore(image, user_info.firstChild);

      // Print info
      document.getElementById('lastname').textContent = lastName;
      document.getElementById('name').textContent = name;
      document.getElementById('campus').textContent = campus;
      document.getElementById('email').textContent = email;
      document.getElementById('tel').textContent = tel;
      document.getElementById('addresse').textContent = addresse;
      document.getElementById('city').textContent = city;

      ratio = parseFloat(ratio.toFixed(1));
      document.getElementById('ratio').textContent = ratio;
    }

    //- -----------------------------------------------------------
  })

  .catch((error) => console.error(error));
