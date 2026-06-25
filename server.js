import {createReadStream} from "node:fs";
import {stat} from "node:fs/promises";
import {createServer} from "node:http";
import {extname, join, normalize, sep} from "node:path";
import {fileURLToPath} from "node:url";

const host = "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const project_root = fileURLToPath(new URL(".", import.meta.url));
const web_root = join(project_root, "web-app");
const docs_root = join(project_root, "docs");

const content_types = Object.freeze({
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml; charset=utf-8"
});

const is_safe_path = function (file_path, root_path) {
    const safe_root = normalize(root_path + sep);

    return normalize(file_path).startsWith(safe_root);
};

const resolve_request_path = function (request_url) {
    const url = new URL(request_url, `http://${host}:${port}`);
    const route = decodeURIComponent(url.pathname);

    if (route.startsWith("/docs/")) {
        return {
            file_path: join(
                project_root,
                route.endsWith("/") ? `${route}index.html` : route
            ),
            root_path: docs_root
        };
    }

    return {
        file_path: join(
            web_root,
            route === "/" ? "/index.html" : route
        ),
        root_path: web_root
    };
};

const send_file = async function (response, file_request) {
    const file_path = file_request.file_path;
    const file_stats = await stat(file_path);

    if (
        !file_stats.isFile() ||
        !is_safe_path(file_path, file_request.root_path)
    ) {
        response.writeHead(404);
        response.end("Not found");
        return;
    }

    response.writeHead(200, {
        "Content-Type": content_types[extname(file_path)] || "text/plain"
    });
    createReadStream(file_path).pipe(response);
};

const server = createServer(function (request, response) {
    send_file(response, resolve_request_path(request.url)).catch(function () {
        response.writeHead(404);
        response.end("Not found");
    });
});

server.listen(port, host, function () {
    console.log(`King's Crossing: http://${host}:${port}`);
});
