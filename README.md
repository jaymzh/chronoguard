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

## Require issues

Want to require an issue or a ticket? We can do that too! Set `require_issue`
on `chronoguard` and it will fail if it sees a `fail-after` which doesn't
include an `issue:...`.

If the issue is in #123 format or a URL, then it will linkify the issue in
it's output.

## Warn, but don't fail

OK, we can do that too. use `warn-after` instead of `fail-after`.
