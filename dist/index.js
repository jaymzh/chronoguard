/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 34:
/***/ ((module) => {

"use strict";
module.exports = require("@actions/core");

/***/ }),

/***/ 791:
/***/ ((module) => {

"use strict";
module.exports = require("@actions/glob");

/***/ }),

/***/ 896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// index.js
const core = __nccwpck_require__(34)
const glob = __nccwpck_require__(791)
const fs = __nccwpck_require__(896)

function normalizeDate(str) {
    return str.replace(/-/g, '')
}

function hasIssue(line) {
    return /(issue:\d+|#\d+|https?:\/\/[^\s]+\/issues\/\d+)/.test(line)
}

async function run() {
    try {
        const failOnMalformedTags = core.getInput('fail_on_malformed_tags') === 'true'
        const verbose = core.getInput('verbose') === 'true'
        const filesInput = (core.getInput('files') || '')
            .split(',')
            .map(f => f.trim())
            .filter(Boolean)
        const globInput = core.getInput('glob')
        const requireIssue = core.getInput('require_issue') === 'true'

        let files = [...filesInput]

        if (globInput) {
            const globber = await glob.create(globInput)
            for await (const file of globber.globGenerator()) {
                files.push(file)
            }
        }

        files = [...new Set(files)]

        if (files.length === 0) {
            core.info('No files to scan')
            return
        }

        const today = new Date()
        const todayStr = today.toISOString().slice(0,10).replace(/-/g, '')

        let failed = false

        for (const file of files) {
            if (verbose) {
                console.log("Processing file:", file)
            }
            const content = fs.readFileSync(file, 'utf8')
            const lines = content.split('\n')

            lines.forEach((line, idx) => {
                let lineIsCandidate = false
                if (line.includes('fail-after') || line.includes('warn-after')) {
                    lineIsCandidate = true
                    if (verbose) {
                        console.log('Found candidate line:', file, idx+1, line)
                    }
                }
                const failMatch = line.match(/fail-after:(\d{4}-?\d{2}-?\d{2}|\d{8})/)
                const warnMatch = line.match(/warn-after:(\d{4}-?\d{2}-?\d{2}|\d{8})/)
                if (!failMatch && !warnMatch) {
                    if (lineIsCandidate) {
                        const msg = "Found chronoguard tags, but didn't parse a date. Probably malformed tag!"
                        if (failOnMalformedTags) {
                            core.error(msg)
                            failed = true
                        } else {
                            console.warn(msg)
                        }
                    }
                    return
                }

                if (requireIssue && !hasIssue(line)) {
                    core.error(`Missing issue reference at ${file}:${idx+1} -> ${line}`)
                    failed = true
                }

                if (failMatch) {
                    const dateStr = normalizeDate(failMatch[1])
                    if (todayStr > dateStr) {
                        core.error(`Expired fail-after (${dateStr}) at ${file}:${idx+1} -> ${line}`)
                        failed = true
                    } else {
                        core.info(`OK fail-after (${dateStr}) at ${file}:${idx+1}`)
                    }
                }

                if (warnMatch) {
                    const dateStr = normalizeDate(warnMatch[1])
                    if (todayStr > dateStr) {
                        core.warning(`Past warn-after (${dateStr}) at ${file}:${idx+1} -> ${line}`)
                    } else {
                        core.info(`OK warn-after (${dateStr}) at ${file}:${idx+1}`)
                    }
                }
            })
        }

        if (failed) {
            core.setFailed('Found expired or invalid fail-after entries')
        }

    } catch (err) {
        core.setFailed(err.message)
    }
}

run()

module.exports = __webpack_exports__;
/******/ })()
;