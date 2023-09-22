load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

def vaticle_dependencies():
    git_repository(
        name = "vaticle_dependencies",
        remote = "https://github.com/vaticle/dependencies",
        commit = "86e1de466e1fcb1eeb7fd85d5de18f8d1e4053b4", # sync-marker: do not remove this comment, this is used for sync-dependencies by @vaticle_dependencies
    )
