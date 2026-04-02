// index.js
const core = require('@actions/core')
const glob = require('@actions/glob')
const fs = require('fs')

function normalizeDate(str) {
    return str.replace(/-/g, '')
}

function hasIssue(line) {
    return /(issue:\d+|#\d+|https?:\/\/[^\s]+\/issues\/\d+)/.test(line)
}

async function run() {
    try {
        const filesInput = JSON.parse(core.getInput('files') || '[]')
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
            const content = fs.readFileSync(file, 'utf8')
            const lines = content.split('\n')

            lines.forEach((line, idx) => {
                const failMatch = line.match(/fail-after:(\d{4}-?\d{2}-?\d{2}|\d{8})/)
                const warnMatch = line.match(/warn-after:(\d{4}-?\d{2}-?\d{2}|\d{8})/)

                if (!failMatch && !warnMatch) return

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
