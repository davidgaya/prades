 Add optional 'os' and 'cpu' properties in the binary section of the package.json.

*  prades publish should give error if you are trying to publish a binary for an ignored platform.
*  prades install should do nothing (maybe only info message) if it is an ignored platform.

example:
```
 "binary": {
   "file": "{package_name}/{package_version}/{platform}-{arch}.tar.gz",
   "path": "bin",
   "host": "https://registry.starbreeze.com/-/releases",
   "os": ["win32"],
   "cpu": ["x64"]
 }
```
###  os
 The host operating system is determined by process.platform
 You can specify which operating systems prades binaries will be installed on:
``` "os" : [ "darwin", "linux" ]```

### cpu
 The cpu architecture is determined by process.arch
 If your code only runs on certain cpu architectures, you can specify which ones.
 ```"cpu" : [ "x64", "ia32" ]```
 