# node-generate-release
Generate a release for a project following semver using nodejs and gitflow

Current Version: 0.2.1


Usage
-----

First, install generate-release globally.

    npm install -g generate-release

Navigate to your project and execute `generate-release`.

That's it!

What does it do?
----------------

This is the default process.

1. Verify the working directory is clean
1. Reads git-flow settings from repo config file
1. Reads Current version from package.json file and generates the new version
1. Fetches from origin
1. Rebases origin/develop into develop
1. Resets master to origin/master
1. Starts a git-flow release named the new version number
1. Changes the version number in your README.md file and package.json file
1. Commits the changes to the README.md and package.json file
1. Runs all `pre_commit_commands`, if any of those commands fail, the release is canceled and 
    everything is reset.
1. Run the git-flow finish release command
1. Pushes master, develop, and tags to origin
1. Run all `post_commit_commands`. These commands can fail without affecting the release

Many aspects of this process can be changed using the options below.

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
    -d --release-file     Path to your .release.json file. Default: ./.release.json

Release File
------------

By default, the following options can be set in a `.release.json` file. The following
is an example with all files set.

      {
          "readme_file_location": "./README.md",
          "package_file_location": "./package.json",
          "no_confirm": false,
          "skip_git_pull": false,
          "skip_git_push": false,
          "pre_commit_commands": [],
          "post_commit_commands": [],
          "additional_files_to_commit": []
      }
      
The `additional_files_to_commit` use [node-glob](https://github.com/isaacs/node-glob). See the
documentation located there on how to format those options

Building Assets and Running Tests
--------------------------------

If you wish to build assets or run tests before finishing the release automatically, you can use
`pre_commit_commands`. This assumes you have an npm script set called `build-assets`,
your tests are run via `npm test`, and all your built assets are in `./build/`.

.release.json

    {
        "pre_commit_commands": [
            "npm run-script build-assets",
            "npm test"
        ],
        "additional_files_to_commit": [
            "./build/**/*"
        ]
    }

With that set, assets will be built, tests run, and all the built assets committed in the 
release.

Roadmap
-------

- Write tests
- Code coverage for tests
- Change remote (not origin)
- ~~Allow for custom hook (like running gulp or grunt during release to prepare assets)~~
- Ability to define arbitrary files to replace version in (like source code files, other MD's, etc)
- ~~Use and parse a .release file to parse defaults (instead of using cli switches)~~
- Implement an API to use inside node applications (why? because all the cool kids are doing it)
- Custom release message
- ~~Read git-flow configuration from .git folder~~
