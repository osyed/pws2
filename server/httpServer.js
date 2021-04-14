const handler = require("serve-handler");
const http = require("http");

const requestListener = (request, response) => {
  // You pass two more arguments for config and middleware
  // More details here: https://github.com/vercel/serve-handler#options
  response.setHeader("Access-Control-Allow-Origin", "*");
  //   response.setHeader(
  //     "Access-Control-Allow-Methods",
  //     "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  //   );
  response.setHeader("Access-Control-Allow-Methods", "GET");

  response.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  response.setHeader("Access-Control-Allow-Credentials", true);
  return handler(request, response, {
    public: "./downloads",
  });
};

const server = http.createServer(requestListener);

var port = process.argv.slice(2)[0];
if (!port) {
  port = 3031;
}

server.listen(port, () => {
  console.log("Running at http://localhost:" + port);
});
