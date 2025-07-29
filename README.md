# 🧠 Node.js Raw TCP HTTP Server

A fully functional HTTP server built using the Node.js `net` module (TCP sockets), not `http`.

---

## 🚀 Features

- Built with raw TCP sockets (no `http` module!)
- Handles routes like `/`, `/echo/`, `/user-agent`, `/files/`
- Supports `gzip` compression
- Supports `Connection: keep-alive` and `close`
- Supports `GET` and `POST` file handling

---

## 📦 Folder Structure

http-server/
├── index.js # Server logic
├── files/ # Used for file read/write
├── README.md
└── .gitignore

## 🛠 Prerequisites

- ✅ Node.js installed: [https://nodejs.org](https://nodejs.org)
- ✅ PowerShell (Windows) or a terminal (Linux/Mac)
- ✅ `files/` directory created manually before starting the server

---

## 📦 How to Run the Server

```powershell
npm install
npm start
This runs: node index.js --directory ./files

Server starts on http://localhost:4221

🧪 How to Test
⚠️ PowerShell Users:
Use curl.exe instead of curl to avoid conflicts with the built-in PowerShell alias.

1️⃣ Root GET Request
powershell
Copy code
curl.exe http://localhost:4221/
Returns: 200 OK

2️⃣ Echo Route
powershell
Copy code
curl.exe http://localhost:4221/echo/hello
Returns: hello

3️⃣ GZIP Echo
powershell
Copy code
curl.exe --header "Accept-Encoding: gzip" http://localhost:4221/echo/hello --output hello.gz
Then decompress the file:

powershell
Copy code
Expand-Archive -Path hello.gz -DestinationPath . 
 # Or use 7-Zip manually

4️⃣ User-Agent Route
powershell
Copy code
curl.exe http://localhost:4221/user-agent
Returns your User-Agent string (like curl/7.x.x)

5️⃣ File Upload via POST
powershell
Copy code
curl.exe -X POST "http://localhost:4221/files/test.txt" --data "This is my file content"
Creates a file test.txt in the files/ folder.

6️⃣ File Download via GET
powershell
Copy code
curl.exe "http://localhost:4221/files/test.txt"
Returns: This is my file content

📂 What is the --directory Flag?
The server supports a flag to specify where files will be stored:

bash
Copy code
node index.js --directory ./files
You can change ./files to any path.

📚 Features Used
Feature	Module
TCP Server	net
File I/O	fs/promises
Compression	zlib
Async Support	promisify
Response Class	Custom OOP

# TESTING THE HTTP-SERVER

1> Open a terminal using ctrl+` run command 'npm start' 
2> Open another terminal and run command .\test-server.ps1

