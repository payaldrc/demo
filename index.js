const express = require('express')
const request = require('request')
const md5 = require('md5')
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

// *check webpage http://localhost:4000/
// Enter email,wesite address or company name

app.get('/', (req, res) => {
    //res.send('Welcome and Enter an email address or website');
    res.send(`
    <html>
      <body>
        <form method="post" action="/submit">
          <label for="text">Enter an email address or website:</label>
          <input type="text" name="text" id="text">
          <button type="submit">Submit</button>
        </form>
      </body>
    </html>
  `)
});

app.post('/submit', (req, res) => {
    var text=req.body.text;
    console.log(text);
    const emailRegex =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // Check if the text is an email
  
    if (emailRegex.test(text)) {
        const emailHash = md5(text.toLowerCase())
        const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}`
        res.send(`
          <html>
            <body>
              <h1>Email: ${text}</h1>
              <img src="${gravatarUrl}" alt="Gravatar">
            </body>
          </html>
        `)
      }
    else if (text) {
    
        console.log(text);
       
        let query = '';
        // Check if input text is a website URL
        if (text.startsWith('http://') || text.startsWith('https://')) {
         // query = `domain:${new URL(text).hostname}`;
          const domain = new URL(text).hostname
          console.log(domain);
          var clearbitUrl = `https://logo.clearbit.com/${domain}`
          request(clearbitUrl, (error, response) => {
            if (!error && response.statusCode === 200) {
              res.send(`
                <html>
                  <body>
                    <h1>Website: ${text}</h1>
                   
                    <img src="${clearbitUrl}" alt="Clearbit Logo">
                  </body>
                </html>
              `)
            }
             else {
              res.send(`
                <html>
                  <body>
                    <h1>Error: Unable to retrieve logo for ${text}</h1>
                  </body>
                </html>
              `)
            }
          })
        // Check if input text is a domain name
        } else if (text.includes('.')) {
            var clearbitUrl = `https://logo.clearbit.com/${text}`;
            request(clearbitUrl, (error, response) => {
                if (!error && response.statusCode === 200) {
                  res.send(`
                    <html>
                      <body>
                        <h1>Website: ${text}</h1>
                        <img src="${clearbitUrl}" alt="Clearbit Logo">
                      </body>
                    </html>
                 `)
                }
         
                 else {
                  res.send(`
                    <html>
                      <body>
                        <h1>Error: Unable to retrieve logo for ${text}</h1>
                      </body>
                    </html>
                  `)
                }
              })
            
        // Assume input text is a company name
        } else {
            var clearbitUrl = `https://autocomplete.clearbit.com/v1/companies/suggest?query=${text}`;
            
        request(clearbitUrl, (error, response) => {
          if (!error && response.statusCode === 200) {
            fetch(clearbitUrl)
              .then(response => response.json())
              .then(data => {
                if(data.length>0){
                const html = `
                  <html>
                    <body>
                      <h1>Results for: ${text}</h1>
                      <ul>
                        ${data.map(company => `
                          <li>
                            <img src="${company.logo}" alt="${company.name} logo" style="max-width: 100px;">
                            <div>
                              <h2>${company.name}</h2>
                              <p>${company.domain}</p>
                            </div>
                          </li>
                        `).join('')}
                      </ul>
                    </body>
                  </html>
                `;
                res.send(html);}else{res.send("Enter Proper name:")}
              })
              .catch(error => console.error(error));
          }
        });
            
        }

        //const clearbitUrl = `https://autocomplete.clearbit.com/v1/companies/suggest?query=${query}`;
      
      
      }
      
});


app.listen(4000, () => {
    console.log('Server started on port 4000')
  })