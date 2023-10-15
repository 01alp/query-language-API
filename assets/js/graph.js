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

// ----------------------------

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

    //----------------------

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
        user {
          transactions {
            type
            amount
            createdAt
          }
          auditRatio
          attrs
          firstName
          lastName
          campus
          email
          xps {
            event {
              endAt
              id
            }
            amount
            path
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
      const xps = data.data.user[0].xps.filter((item) => !item.path.includes('piscine')); //piscine filtered
      const tel = data.data.user[0].attrs.Phone;
      const addresse = data.data.user[0].attrs.addressStreet;
      const city = data.data.user[0].attrs.addressCity;
      const transaction = data.data.user[0].transactions;
      const xptotal = data.data.user[0].xps;

      const ratio = data.data.user[0].auditRatio;

      const theImage = data.data.user[0].attrs.image;

      const image = document.createElement('img');
      image.setAttribute('src', theImage);
      image.classList.add('responsive-img');
      image.style.border = '4px solid white';
      image.style.width = '90px';

      // add the image
      const header = document.querySelector('.header');
      const user_info = header.querySelector('.banner');
      user_info.insertBefore(image, user_info.firstChild);
      // Calculate xp
      let totalAmount = 0;

      for (let i = 0; i < xptotal.length; i++) {
        let amount = xptotal[i].amount;
        totalAmount += amount;
      }

      console.log(totalAmount);
      document.getElementById('xp').textContent = Math.round(totalAmount / 1000) + ' kB';

      // Calculate Total XP
      let total = 0;

      // console.log(filteredXps)

      for (let i = 0; i < xps.length; i++) {
        let amount = xps[i].amount;
        total += amount;
      }

      total += 70000;
      total = total / 1000;
      total = Math.round(total);
      //console.log(total)

      // FIRST GRAPHIC

      var data = [];
      xps.sort((a, b) => a.amount - b.amount); //sort by points
      for (let i = 0; i < xps.length; i++) {
        let nbm = xps[i].amount;

        let path = xps[i].path;
        let dernierSlash = path.lastIndexOf('/');

        if (dernierSlash !== -1) {
          let nouvelleChaine = path.substring(dernierSlash + 1);
          var newelem = { exercice: nouvelleChaine, points: nbm };
        }

        data.push(newelem);
        //console.log(path);
      }

      $(document).ready(function () {
        // Extract exercise names and points into separate tables
        var exercices = data.map(function (item) {
          return item.exercice;
        });

        var points = data.map(function (item) {
          return item.points;
        });

        // Create graphic
        var ct = document.getElementById('myChart1').getContext('2d');
        var myChart = new Chart(ct, {
          type: 'bar',
          data: {
            labels: exercices,
            datasets: [
              {
                label: 'Projects and XP by Points',
                data: points,
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      });

      // End of first Graphic
      //---------------------------

      // SECOND GRAPHIC

      var data3 = [];

      var date = [];

      for (let i = 0; i < transaction.length; i++) {
        const actual = transaction[i];

        let date = actual.createdAt.substring(0, 10);

        if (actual.type == 'xp') {
          data3.push(actual);
        }
      }

      // Sort in ascending order
      data3.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
      // Delete Type
      data3 = data3.map(({ type, ...rest }) => rest);
      // Rename Amount and createdAt
      data3 = data3.map(({ amount, ...rest }) => ({ xp: amount, ...rest }));
      data3 = data3.map(({ createdAt, ...rest }) => ({ date: createdAt, ...rest }));

      for (let i = 0; i < data3.length; i++) {
        const y = i - 1;

        if (i != 0) {
          const precedxp = data3[y].xp;

          const Total = precedxp + data3[i].xp;

          data3[i].xp = Total;
        }
      }

      // Clean date
      data3 = data3.map(({ xp, date }) => ({
        xp: xp,
        date: date.split('T')[0],
      }));

      $(document).ready(function () {
        // Extract dates and XP points into separate tables
        const dates = data3.map(function (item) {
          return item.date;
        });

        const xpValues = data3.map(function (item) {
          return item.xp;
        });

        // Set up SVG dimensions
        const margin = { top: 100, right: 10, bottom: 100, left: 100 },
          width = 1500 - margin.left - margin.right,
          height = 900 - margin.top - margin.bottom;

        // Append SVG element to body
        const svg = d3
          .select('#myChart')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // Set up scales
        const x = d3.scaleBand().domain(dates).range([0, width]).padding(0.1);

        const y = d3
          .scaleLinear()
          .domain([0, d3.max(xpValues)])
          .nice()
          .range([height, 0]);

        // Add X-axis
        svg
          .append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(d3.axisBottom(x).tickSize(0))
          .selectAll('text')
          .style('text-anchor', 'end')
          .attr('dx', '-.8em')
          .attr('dy', '.15em')
          .attr('transform', 'rotate(-65)');

        // Add Y-axis
        svg.append('g').attr('class', 'y axis').call(d3.axisLeft(y).ticks(5));

        // Create line generator
        const line = d3
          .line()
          .x((d, i) => x(dates[i]))
          .y((d) => y(d));

        // Append path
        svg.append('path').datum(xpValues).attr('fill', 'none').attr('stroke', 'steelblue').attr('stroke-width', 1.5).attr('d', line);
      });

      // End of second graphic
    }
    //--------------------------------------------------------
  })

  .catch((error) => console.error(error));
