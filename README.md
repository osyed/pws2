# Password Storage

A web app for storing passwords; but actually just a file of notes; they could be passwords or anything else.

The notes file is encrypted in the browser and saved on the Google Drive with file name `use.txt`. That file will be placed under the top level folder named `pws` and under that, with subfolder which name will be according to the user's store key. So the file path will be `pws/<store_key>/use.txt` .

## Running the web app

### Prerequisites

First of all, you need to enable Google Drive API for the client.

1. Go to [console.developers.google.com](https://console.developers.google.com)
2. Create a project.
3. Use the menu to go **APIs ands Services** option and then to _Dashboard_
4. Add **Google Drive API** using the _Enable APIs and Services_ button on the top bar
5. On **Credentials** create a credential using the _Create Credentials_ button on the top bar
   - Create API key for Web application.
   - Create OAuth 2.0 Client ID for Web application ( you need to fill up information of your app for OAuth consent screen and besure to add your domain ( localhost:3000 / https://www.domain.com ) under `Authorized JavaScript origins`).

### Run the app

1. First go to the path `pws/app`.
2. In the code of `pws/app/bundle.js`, Search <CLIENT_ID> and <API_KEY> variables and enter their values respectively from **Credentials** created on Google Developer Console.
   ```javascript
   // Client ID and API key from the Developer Console
   var CLIENT_ID = "";
   var API_KEY = "";
   ```
3. It should be working fine when running the app with path `pws/app`.

## Running Downloader and Web Server

In order to back up your files, you can use `pws/server` for downloading your files as well as for web server of your downloaded files.

**Go to the path `pws/server` and Run command**

```shell
npm install or yarn
```

In order to run downloader, first we need to deploy API to get the file list under Google Drive folder. Instead of using **Google Drive API**, which would need to setup credentials for the script, here we use **Google Apps Script** as web service for getting access of Google Drive.

### Deploy web app in google apps script

1. Go to [https://script.google.com/create](https://script.google.com/create)
2. Use code from `pws/server/google_apps_script.gs` file and save it on `Code.gs`.
3. First test the script with **Run** button to give your account access in executing the script.
4. Click the **Deploy** button on the top bar. Select type as `web app`, set your email on `Executed as` and change `Who has access` to _Anyone_ and _Deploy_ it.
5. Copy the web app url and paste that link as value of variable `script_url` of `pws/server/downloader.js` in the repo.
   ```javascript
   // This script_url is the web app deployed on google apps script.
   // The code used is in google_apps_script.gs file.
   const script_url = "";
   ```

### Run the downloader script

1. Enter the google drive `pws` folder links in urls.txt file line by line
2. Run command
   ```shell
   node downloader.js
   ```

### Run the downloader script in cron job

```shell
1 * * * * (cd /home/*/pws/server; [node_path] downloader.js )
```

If you are using nvm,

```shell
1 * * * * (cd /home/*/pws/server; ~/.nvm/*/bin/node downloader.js )
```

### Running Web Server

In order to restore your backup files of the web app, you need to run web server of your downloaded files.

1. For HTTP,
   ```shell
   node httpServer.js
   ```
2. For HTTPS,

   You need to create SSL certificate to serve HTTPS Server.
   Add the _key.pem_ and _cert.pem_ files of created SSL certificates under the `pws/server`.

   ```shell
   node httpsServer.js
   ```
