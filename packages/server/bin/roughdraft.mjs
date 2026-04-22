#!/usr/bin/env node

import { createServer } from "../dist/index.js";

const port = parseInt(process.env.PORT || "3000", 10);
createServer(port);
