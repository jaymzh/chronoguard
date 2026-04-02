# Rolling a release

## Version bump

* Update CHANGELOG.md
* Update package.json to bump the version
* Force a build: `rm dist/index.js && make`
* Commit/PR/Merge

## Tag the release

```bash
version='x.y.z'
git tag -a v${version?} -m "version ${version?}" -s
git push origin --tags
```
