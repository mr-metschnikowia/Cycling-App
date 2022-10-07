How to run our web application:

1. Configure computing environment:
- Ensure you have the latest version of Node (v16.14.0) installed to run JavaScript on the server. 
 
3. Configure Node:
- In your Command Prompt, navigate to the git repository and type npm install...this will install
all required packages to run out Node programme from the our package.json file!

4. Setup MongoDB server and connect:
- Follow the instructions on setting up a MongoDB server on a lab client found here: 
https://studres.cs.st-andrews.ac.uk/CS5003/Examples/W7-MongoDB/MongoDB-setup.txt 
- Now that your MongoDB server is up and running, you need to set up a tunnel, so that your 
server can communicate with the database. You can set up a tunnel with a SSH proxy configuration
by pasting the following into your Command Prompt:
ssh USER@pcX-XXX-X.cs.st-andrews.ac.uk -L PORT:localhost:PORT -N
*replace USER with your st-andrews username, X-XXX-X with the lab client you are using, and PORT
with the port that your MongoDB server is running on. 
- Enter the config-db.js file and change the password parameter to the password that you created
for your 'webuser' db user, and the port parameter to the port that your MongoDB server is running on.

5. Run the Node server:
- In the Command Prompt, navigate to the git repository, then past the following into the console:
node server.js
- The Node server is now running! :)

6. Open the web application in Firefox.
- Open Firefox and paste the following into the search bar:
http://localhost:3000
- Welcome to our web application!

Help:
- Any problems, please email: lg225@st-andrews.ac.uk