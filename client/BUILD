load("@npm//:defs.bzl", "npm_link_all_packages")
load("@npm//client:@angular/cli/package_json.bzl", angular_cli_bin = "bin")

exports_files([
    "package.json",
    "pnpm-lock.yaml",
])

filegroup(
    name = "content",
    srcs = glob(
        [
            "**/*",
            "*",
        ],
        exclude = [
            "BUILD",
            "node_modules/**/*",
            "dist/**/*",
        ],
    ),
    visibility = ["//:__subpackages__"],
)

npm_link_all_packages(
    name = "node_modules",
)

APPLICATION_DEPS = [
   ":node_modules/@angular/animations",
    ":node_modules/@angular/common",
    ":node_modules/@angular/compiler",
    ":node_modules/@angular/core",
    ":node_modules/@angular/forms",
    ":node_modules/@angular/platform-browser",
    ":node_modules/@angular/platform-browser-dynamic",
    ":node_modules/@angular/router",
    ":node_modules/rxjs",
    ":node_modules/tslib",
    ":node_modules/zone.js",

    ":node_modules/@angular-devkit/build-angular",
    ":node_modules/@angular/cli",
    ":node_modules/@angular/compiler-cli",
    ":node_modules/@types/jasmine",
    ":node_modules/jasmine-core",
    ":node_modules/karma",
    ":node_modules/karma-chrome-launcher",
    ":node_modules/karma-coverage",
    ":node_modules/karma-jasmine",
    ":node_modules/karma-jasmine-html-reporter",
    ":node_modules/typescript",
]

angular_cli_bin.ng(
    name = "bin",
    srcs = [
        ":content",
    ] + APPLICATION_DEPS,
    args = ["build"],
    chdir = package_name(),
    log_level = "debug",
    out_dirs = ["dist/client"],
    visibility = [ "//visibility:public" ]
)