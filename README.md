# node-generate-release
Generate a release for a project following semver using nodejs and gitflow

Current Version: 0.1.4


Usage
-----

First, install generate-release globally.

    npm install -g generate-release

Navigate to your project and execute `generate-release`.

Thats it!

What does it do?
----------------

Assumptions:

- You work on, and are currently on the develop branch
- Your stable branch is master
- Your tags are named without anything special. e.g 0.0.0


This is the default process.

1. Verify the working directory is clean
1. Reads Current version from package.json file and generates the new version
1. Fetchs from origin
1. Rebases origin/develop into develop
1. Resets master to origin/master
1. Starts a git-flow release named the new version number
1. Changes the version number in your README.md file and package.json file
1. Commits the changes to the README.md and package.json file
1. Run the git-flow finish release command
1. Pushes master, develop, and tags to origin

Many aspects of this process can be changes using the options below.

Options
--------

run `generate-release --help` to see this as well.

    -r --readme           Path to README.md file. Default: ./README.md
    -p --package          Path to package.json file. Default: ./package.json
    -c --current-version  Current Version. Default: read from package.json
    -t --release-type     Release Type: patch, minor, major. Default: prompt
    -n --no-confirm       Do not ask for confirmation. Default: prompt for confirmation
    -l --skip-git-pull    Do not pull from origin and rebase master and dev. Default: Do pull
    -s --skip-git-push    Do not push to origin when complete. Default: Do push


Roadmap
-------

- Write tests
- Code coverage for tests
- Change remote (not origin)
- Allow for custom hook (like running gulp or grunt during release to prepare assets)
- Ability to define arbitrary files to replace version in (like source code files, other MD's, etc)
- Use and parse a .release file to parse defaults (instead of using cli switches)
- Implement an API to use inside node applications (why? because all the cool kids are doing it)
- Custom release message
