Prades is a tool to embed large binary objects in npm packages,
it works using S3 as store and a signing microservice in the npm registry.

We need to install private npm packages with large binaries. Npm has an internal limitation of ~250Mb for packages.
There are some solutions to distribute binaries (like node-pre-gyp) but all of them assume the packages are public.
In this scenario, AWS S3 is a good solution to distribute private binaries with signed URLs.

Prades rely on the existence of a signing request microservice in the registry server.
For example https://registry.starbreeze.com has a /-/releases endpoint that signs request
(if user is authorized) and redirects to this signed S3 url.

#### How to use
##### Configure package.json
package.json contains three relevant section for prades

where we specify details about the binary file and location
```
  "binary": {
    "file": "{package_name}/{package_version}/{node_abi}-{platform}-{arch}.tar.gz",
    "path": "bin",
    "host": "https://registry.starbreeze.com/-/releases"
  }
```
more on package.json's binary format [here](doc/package_json.md).

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
##### When publishing a package
When (after or before doesn't matter) we publish an npm package that contains large binaries,
then we have to upload the binaries to S3. 

Prades has a helper to do that through the same mechanism of signed requests.
```
./node_modules/.bin/prades publish
```

##### When installing a package
When we install a package we don't have to do anything special.
The install script in the package.json will run the prades install and it 
will download the binaries and put them in the specified target directory.
