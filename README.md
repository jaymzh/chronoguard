# chronoguard

A Github Actions check to mind TODOs.

Ever add something to an exclude list and think "man, that's gonna bit us?"

Well, not anymore!

Chronoguard will check for specially-crafted comments and fail after specific
dates.

For example, lets say you use the amazing
[allcheckspassed](https://github.com/wechuli/allcheckspassed) Action to have a
single "Required" check, so you don't have to constnatly update your GH Repo
Settings - but uh-oh, one of those checks is now breaking because of some
upstream problem outside of your control. Simpley add:

```yaml
...
  steps:
    - uses: wechuli/allcheckspassed@v2
      with:
        # mytest1 - upstream container disappeared - fail-after:2026-04-22
        # mytest2 - upstream container disappeared - fail-after:2026-04-22
        checks_exclude: ".*(mytest1|mytest2).*"
```

After that date, this check will start failing. How do you set it up?

```yaml
steps:
    - uses: jaymzh/chronoguard@main
      with:
        glob: ".github/workflows/*.yml"
```

## Options

You can pass a variety of options into `with`:

* `require_issue` - If true, all chronoguard lines require a `issue:...` tag as
  well. If it is in the format `#123` or a URL, will be linkified in output
* `verbse` - If true prints verbose debugging otuput
* `fail_on_malformed_tags` - If we believe there was a tag, but didn't parse a
  date, fail. Defaults to `true`, but if you set to `false`, will warn instead.

## Full example

```yaml
name: Chronoguard
on:
  pull_request:
    branches: [ main ]

jobs:
  chronoguard:
    runs-on: ubuntu-latest
    permissions:
      checks: read
      contents: read
    steps:
      - uses: actions/checkout@v6
      - uses: jaymzh/chronoguard@main
        with:
          files: .github/workflows/allchecks.yml
```
