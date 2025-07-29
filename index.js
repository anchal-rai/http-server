// a fully function http server

//Final Task: Full-featured HTTP server with compression, file support, and a Response class

// Importing required core modules
const net = require("net");  
const path=require('path');                       // To create a TCP server
const { readFile, writeFile } = require("fs/promises");  // To read/write files using promises
const zlib = require("zlib");                       // To perform gzip compression
const { promisify } = require("util");              // To convert callback functions to promises

// Promisify gzip for async/await usage
const gzipAsync = promisify(zlib.gzip);

// End of line sequence used in HTTP (important for separating lines)
const EOF = '\r\n';

// A dictionary of status codes to readable text (used in status line)
const headerText = {
    200: 'OK',
    201: 'Created',
    404: 'Not Found',
    500: 'Internal Server Error'
};

// Simple console log for debugging purposes
console.log("Logs from your program will appear here!");


// -----------------------
// Response Class
// -----------------------

class Response {
    // Constructor initializes the status code, headers, and response content/body
    constructor(statusCode = 200, headers = {}, content) {
        this.statusCode = statusCode;
        this.headers = headers;
        this.content = content;
    }

    // send() writes the full HTTP response to the socket
    send = (socket) => {
        // Writing status line (like "HTTP/1.1 200 OK")
        socket.write(`HTTP/1.1 ${this.statusCode} ${headerText[this.statusCode]}${EOF}`);

        // Writing headers one by one (e.g., Content-Type: text/plain)
        for (const [key, value] of Object.entries(this.headers)) {
            socket.write(`${key}: ${value} ${EOF}`);
        }

        // Write empty line to signal end of headers and start of body
        socket.write(EOF);

        // If response has content (body), write it
        if (this.content)
            socket.write(this.content);

        //close the commection after sending the response
       socket.end();
        // Indicate that the connection should be closed
        
    }
}


// -----------------------
// TCP Server Setup
// -----------------------

const server = net.createServer((socket) => {

    // Event listener: when client sends data
    socket.on("data", async (data) => {
        try {
            const response = await handleConnection(data);
            response.send(socket);
        } catch (err) {
            console.error("Server error:", err.message);
            const response = new Response(500, {}, "Internal Server Error");
            response.send(socket);
        }
    });
    
    // Event listener: if socket is closed
    socket.on("close", () => {
        socket.end(); // make sure connection ends cleanly
    });
});


// -----------------------
// Request Handler Function
// -----------------------

async function handleConnection(data) {
    console.log("Received data from client...");
    const request = data.toString();          // Convert Buffer to string (raw HTTP request)
    const lines = request.split("\r\n");      // Split request into individual lines

    // First line is the request line: GET /path HTTP/1.1
    const [method, url, httpVersion] = lines[0].split(" ");

    const headers = {};
    // Parse headers: loop starts from line 1 until we hit a blank line
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i] || lines[i].trim() === '') break;
        const [name, value] = lines[i].split(":");
        if (name && value) {
            headers[name] = value.trim();
        }
    }

    // Assume the last line is the body (works for small content — simple POST body)
    const body=request.split("\r\n\r\n")[1] || ''; // Get body after headers

    console.log(headers); // Print parsed headers for debugging

    const responseHeader = {};

    // If client asked to close the connection
    if (headers['Connection'] && headers['Connection'] === 'close')
        responseHeader['Connection'] = 'close';

    // Handle root path or index.html
    if (url === '/' || url === '/index.html') {
        const content='200 OK';
        responseHeader['Content-Type'] = 'text/plain';
        responseHeader['Content-Length'] = content.length;
        return new Response(200, responseHeader,content);
    }

    // Handle echo route: /echo/hello should return "hello"
    else if (url.includes('/echo/')) {
        let content = url.substring(6);  // remove "/echo/" from path
        return await echoResponse(content, headers, responseHeader);
    }

    // Handle /user-agent: respond with the User-Agent string
    else if (url.includes('/user-agent')) {
        let content = headers['User-Agent'];
        responseHeader['Content-Type'] = 'text/plain';
        responseHeader['Content-Length'] = content.length;
        return new Response(200, responseHeader, content);
    }

    // Handle file routes: GET and POST to /files/filename.txt
    else if (url.includes('/files/')) {
        let fileName = url.substring(7); // remove '/files/' from path
        if (method === 'GET') {
            return await readFileResponse(fileName, responseHeader);
        } else if (method === 'POST') {
            return await writeFileResponse(fileName, body, responseHeader);
        }
    }

    // If route is not handled, return 404 Not Found
    return new Response(404, responseHeader, "Not Found");
}


// -----------------------
// Route Handlers
// -----------------------

// Handles gzip compression for /echo/ path
async function echoResponse(rawContent, headers, responseHeader) {
    let encoding = headers['Accept-Encoding'];
    if (encoding && encoding.includes('gzip')) {
        try {
            const compressedContent = await gzipAsync(rawContent);
            responseHeader['Content-Encoding'] = 'gzip';
            responseHeader['Content-Type'] = 'text/plain';
            responseHeader['Content-Length'] = compressedContent.length;
            return new Response(200, responseHeader, compressedContent);
        } catch (err) {
            return new Response(500, responseHeader);
        }
    } else {
        responseHeader['Content-Type'] = 'text/plain';
        responseHeader['Content-Length'] = rawContent.length;
        return new Response(200, responseHeader, rawContent);
    }
}


// Handles reading files for GET /files/filename
async function readFileResponse(fileName, responseHeader) {
    // Get directory from --directory flag or default to "."
    const dirIndex = process.argv.indexOf("--directory");
    const baseDirectory = dirIndex !== -1 ? process.argv[dirIndex + 1] : ".";

    const filePath = path.join(baseDirectory , fileName);

    try {
        const content = await readFile(filePath);
        responseHeader['Content-Type'] = 'application/octet-stream';
        responseHeader['Content-Length'] = content.length;
        return new Response(200, responseHeader, content);
    } catch (err) {
        return new Response(404, responseHeader, "File not found");
    }
}


// Handles writing files for POST /files/filename
async function writeFileResponse(fileName, content, responseHeader) {
    const dirIndex = process.argv.indexOf("--directory");
    const baseDirectory = dirIndex !== -1 ? process.argv[dirIndex + 1] : ".";

    const filePath = path.join(baseDirectory, fileName);

    try {
        await writeFile(filePath, content, 'utf-8');
        return new Response(201, responseHeader,"201 Created"); // 201 Created
    } catch (err) {
        return new Response(500, responseHeader, "Write failed");
    }
}



// Start the server and listen on port 4221
const PORT=4221;
server.listen(PORT,"localhost", () => { 
    console.log(`Server is running at http://localhost:${PORT}`);
});
