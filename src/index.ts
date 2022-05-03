console.clear();
import "dotenv/config";
import http from "http";
import app from "./appConfigs";

let port = 8000;
const server = http.createServer(app);
server.listen(port);
console.log(
  `Server is listening to PORT:${port} - ${new Date().toISOString()}`
);

// import fs from "fs";
// import path from "path";
// const data: any = fs.readFileSync(path.join(__dirname,"./data.json"));
// const dataJson: any = JSON.parse(data);
// // console.log("data", Object.entries(dataJson))
// const arr:any[] = []
// Object.entries<any>(dataJson).forEach(([k,v], key) => {
//   // console.log("value", v);
//   arr.push(v)
// })
// fs.writeFileSync("books.json", JSON.stringify(arr));
// // console.log("arr", arr)
