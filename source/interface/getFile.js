const joinURL = require("url-join");
const responseHandlers = require("../response.js");
const { encodePath, prepareRequestOptions, request } = require("../request.js");

function getFileContentsBuffer(filePath, options) {
    return makeFileRequest(filePath, options).then(function(res) {
        return typeof res.buffer === "function" ? res.buffer() : res.arrayBuffer();
    });
}

function getFileContentsString(filePath, options) {
    return makeFileRequest(filePath, options).then(function(res) {
        return res.text();
    });
}

function makeFileRequest(filePath, options) {
    const requestOptions = {
        url: joinURL(options.remoteURL, encodePath(filePath)),
        method: "GET"
    };
    prepareRequestOptions(requestOptions, options);
    return request(requestOptions).then(responseHandlers.handleResponseCode);
}

function getFileLink(filePath, options) {
    let url = joinURL(options.remoteURL, encodePath(filePath));
    const protocol = /^https:/i.test(url) ? "https" : "http";
    if (options.headers && options.headers.Authorization) {
        if (/^Basic /i.test(options.headers.Authorization) === false) {
            throw new Error("Failed retrieving download link: Invalid authorisation method");
        }
        const authPart = options.headers.Authorization.replace(/^Basic /i, "").trim();
        const authContents = Buffer.from(authPart, "base64").toString("utf8");
        url = url.replace(/^https?:\/\//, `${protocol}://${authContents}@`);
    }
    return url;
}

module.exports = {
    getFileContentsBuffer,
    getFileContentsString,
    getFileLink
};
