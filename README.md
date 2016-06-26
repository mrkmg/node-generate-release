# node-generate-release
Generate a release for a project following semver using nodejs and gitflow

Current Version: 0.4.1


Usage
-----

You can either install `generate-release` globally or for a single project

__Globally__

Install package

    npm install -g generate-release

Navigate to your project and execute `generate-release`

__Locally__

    cd your/project
    npm install --save-dev generate-release
    
Then add the following to your `package.json` file:

    {
        "scripts": {
            "release": "generate-release"
        }
    }

Then you can run `npm run-script release` in order to generate a release.

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
1. Commits Files
1. Runs all `post_commit_commands`, if any of those commands fail, the release is canceled and 
     everything is reset.
1. Runs the git-flow finish release command
1. Pushes master, develop, and tags to origin
1. Runs all the `post_complete_commands`. These commands can fail without affecting the release

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
    -o --remote           Change the remote. Default: origin

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
          "post_complete_commands": [],
          "additional_files_to_commit": []
      }
      
The `additional_files_to_commit` use [node-glob](https://github.com/isaacs/node-glob). See the
documentation located there on how to format those options

Building Assets, Running Tests, and Publishing Package
--------------------------------

If you wish to build assets, run test, and/or publish your project automatically when the
release is being generated you can use the example `.release.json` file below. The
following assumptions are made:

- You have a script in your package file to build your assets named `build-assets`
- All your built assets are saved to `./build`
- You run your tests via the `npm test` command
- You publish your package via the `npm publish` command

.release.json

    {
        "pre_commit_commands": [
            "npm run-script build-assets"
        ],
        "post_commit_commands": [
            "npm test"
        ],
        "post_complete_commands": [
            "npm publish"
        ],
        "additional_files_to_commit": [
            "./build/**/*"
        ]
    }

Roadmap
-------

- Write tests **Partial**
- Code coverage for tests 
- ~~Change remote (not origin)~~
- ~~Allow for custom hook (like running gulp or grunt during release to prepare assets)~~
- Ability to define arbitrary files to replace version in (like source code files, other MD's, etc)
- ~~Use and parse a .release file to parse defaults (instead of using cli switches)~~
- Implement an API to use inside node applications (why? because all the cool kids are doing it)
- ~~Custom release message~~
- ~~Read git-flow configuration from .git folder~~
