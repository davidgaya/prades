Prades is a tool to embed large binary objects in npm packages,
it works using S3 as store and a signing microservice in the npm registry.

We need to install private npm packages with large binaries. Npm has an internal limitation of ~250Mb for packages.
There are some solutions to distribute binaries (like node-pre-gyp) but all of them assume the packages are public.
In this scenario, AWS S3 is a good solution to distribute private binaries with signed URLs.

Prades rely on the existence of a signing request microservice in the registry server.
For example https://registry-node.starbreeze.com has a /-/releases endpoint that signs request
(if user is authorized) and redirects to this signed S3 url.

### How to use
#### Configure package.json
package.json contains three relevant section for prades

where we specify details about the binary file and location
```
  "binary": {
    "file": "{package_name}/{package_version}/{node_abi}-{platform}-{arch}.tar.gz",
    "path": "bin",
    "host": "https://registry-node.starbreeze.com/-/releases"
  }
```
more on package.json's binary format options below.

the dependency to prades
```
  "dependencies": {
    "@sb/prades": "*"
  }
```
the instruction to run a prades install when installing the package
```
  "scripts": {
    "install": "prades install"
  }
```
#### When publishing a package
When (after or before doesn't matter) we publish an npm package that contains large binaries,
then we have to upload the binaries to S3. 

Prades has a helper to do that through the same mechanism of signed requests.
```
./node_modules/.bin/prades publish
```

#### When installing a package
When we install a package we don't have to do anything special.
The install script in the package.json will run the prades install and it 
will download the binaries and put them in the specified target directory.


### package.json options
#### Matching rules for path option
The **path** package.json inside the **binary** section allows specifying what files
have to be included in the binary tarball.
It is often impractical to specify all source filepaths individually, so prades supports filename expansion. 

Prades uses [grunt](http://gruntjs.com/configuring-tasks#globbing-patterns) file blobbing and matching.
Check grunt globbing patterns documentation for exhaustive info.

This options accepts either comma separated globbing patterns or an array of globbing patterns.
Paths matching patterns that begin with ! will be excluded from the returned array.
Patterns are processed in order, so inclusion and exclusion order is significant.

While this isn't a comprehensive tutorial on globbing patterns, know that in a filepath:

\* matches any number of characters, but not /
? matches a single character, but not /
** matches any number of characters, including /, as long as it's the only thing in a path part
{} allows for a comma-separated list of "or" expressions
! at the beginning of a pattern will negate the match


#### .gitignore and .npmignore
Prades honors .gitignore or .npmignore files. .npmignore takes precedence, if it exists .gitignore is not used.


#### os and cpu options
There are two optional 'os' and 'cpu' properties in the binary section of the package.json
that allow customizing the behavior for different platforms.

publish:

* works if there is no os or cpu
* works if the os and cpu are enabled
* gives an error if the os is NOT enabled
* gives an error if the cpu is NOT enabled

install:

* installs if there is no os or cpu
* installs if the os and cpu are enabled
* skips install if the os in NOT enabled
* skips install if the cpu in NOT enabled

example:
```
 "binary": {
   "file": "{package_name}/{package_version}/{platform}-{arch}.tar.gz",
   "path": "bin",
   "host": "https://registry-node.starbreeze.com/-/releases",
   "os": ["win32"],
   "cpu": ["x64"]
 }
```
#####  os
 The host operating system is determined by process.platform
 You can specify which operating systems prades binaries will be installed on:
``` "os" : [ "darwin", "linux" ]```

##### cpu
 The cpu architecture is determined by process.arch
 If your code only runs on certain cpu architectures, you can specify which ones.
 ```"cpu" : [ "x64", "ia32" ]```

### Relation with npm publish

If npm package is not published

* prades can publish binaries

If npm package is published

* prades cannot publish binaries
* prades can force publish binaries ('-f, --force' option)
* prades cannot unpublish binaries
* prades can force unpublish binaries ('-f, --force' option)

### prades info
Running ```prades info``` provides information about the published status.

If nothing is published

* it shows nothing is published

If npm package is published, but no prades binary is

* it shows npm info

If prades binary packages are published, but npm is not published

* shows prades info (information about published binaries), example:
```
[ { file: 'sb/prades_test_1/0.0.1/node_46-darwin-x64.tar.gz',
    last_modified: '2016-05-12T01:38:50.000Z',
    size: 373,
    md5: '030dd2b937ba1d1e9b51c6cb1b060c7c' },
  { file: 'sb/prades_test_1/0.0.1/node_46-win32-x64.tar.gz',
    last_modified: '2016-05-13T09:08:10.000Z',
    size: 340,
    md5: '10519f392dc80b5f45ba797803c8dd2f' },
  { file: 'sb/prades_test_1/0.0.1/node_47-linux-x64.tar.gz',
    last_modified: '2016-10-20T20:02:26.000Z',
    size: 375,
    md5: '9ead89ddc369fd683f06d46879ea40ef' } ]
```
