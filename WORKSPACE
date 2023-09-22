workspace(name = "live_update")

##############################
# Load @vaticle_dependencies #
##############################

load("//dependencies/vaticle:repositories.bzl", "vaticle_dependencies")
vaticle_dependencies()

# load("@vaticle_dependencies//distribution:deps.bzl", "vaticle_bazel_distribution")
# vaticle_bazel_distribution()

# # Load //@vaticle_bazel_distribution//common
# load("@vaticle_bazel_distribution//common:deps.bzl", "rules_pkg")
# rules_pkg()
# load("@rules_pkg//:deps.bzl", "rules_pkg_dependencies")
# rules_pkg_dependencies()

# # Load //distribution/helm
# load("@vaticle_dependencies//distribution/helm:deps.bzl", helm_deps = "deps")
# helm_deps()

# load("@com_github_masmovil_bazel_rules//repositories:repositories.bzl", helm_repositories = "repositories")
# helm_repositories()

# Load //builder/rust
load("@vaticle_dependencies//builder/rust:deps.bzl", rust_deps = "deps")
rust_deps()

load("@rules_rust//rust:repositories.bzl", "rust_repositories")
rust_repositories(edition="2021", include_rustc_srcs=True)

load("@vaticle_dependencies//library/crates:crates.bzl", "fetch_crates")
fetch_crates()
load("@crates//:defs.bzl", "crate_repositories")
crate_repositories()

# # Load //distribution/docker
# load("@vaticle_dependencies//distribution/docker:deps.bzl", docker_deps = "deps")
# docker_deps()

# load("@io_bazel_rules_go//go:deps.bzl", "go_register_toolchains", "go_rules_dependencies")
# load("@bazel_gazelle//:deps.bzl", "gazelle_dependencies", "go_repository")
# go_rules_dependencies()
# go_register_toolchains(version = "1.18.3")
# gazelle_dependencies()

# load("@io_bazel_rules_docker//repositories:repositories.bzl", bazel_rules_docker_repositories = "repositories")
# bazel_rules_docker_repositories()

# load("@io_bazel_rules_docker//repositories:deps.bzl", bazel_rules_docker_container_deps = "deps")
# bazel_rules_docker_container_deps()

# load("@io_bazel_rules_docker//container:container.bzl", "container_pull")
# container_pull(
#   name = "vaticle_ubuntu_image",
#   registry = "index.docker.io",
#   repository = "vaticle/ubuntu",
#   tag = "4ee548cea883c716055566847c4736a7ef791c38"
# )

# load("@io_bazel_rules_docker//rust:image.bzl", _rust_image_repos = "repositories")
# _rust_image_repos()

# # Load //tool/common
# load("@vaticle_dependencies//tool/common:deps.bzl", "vaticle_dependencies_ci_pip",
# vaticle_dependencies_tool_maven_artifacts = "maven_artifacts")
# vaticle_dependencies_ci_pip()

##########################################################
# Load package.json and pnpm-lock.yaml
##########################################################
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

http_archive(
    name = "aspect_rules_js",
    sha256 = "515277ae357e62f52e29e0bfb60b73d2d062b8d00d21351d31f37c5bb275d4f5",
    strip_prefix = "rules_js-1.5.3",
    url = "https://github.com/aspect-build/rules_js/archive/refs/tags/v1.5.3.tar.gz",
)

load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")

rules_js_dependencies()

load("@rules_nodejs//nodejs:repositories.bzl", "DEFAULT_NODE_VERSION", "nodejs_register_toolchains")

nodejs_register_toolchains(
    name = "nodejs",
    node_version = DEFAULT_NODE_VERSION,
)

load("@aspect_rules_js//npm:npm_import.bzl", "npm_translate_lock")

npm_translate_lock(
    name = "npm",
    pnpm_lock = "//ui:pnpm-lock.yaml",
    verify_node_modules_ignored = "//:.bazelignore",
    lifecycle_hooks_exclude = [
        "nice-napi",
    ]
)

load("@npm//:repositories.bzl", "npm_repositories")

npm_repositories()


# ##################
# # Load terraform #
# ##################

# http_archive(
#     name = "terraform_mac_amd_64",
#     urls = [ "https://releases.hashicorp.com/terraform/1.3.9/terraform_1.3.9_darwin_amd64.zip" ],
#     sha256 = "a73326ea8fb06f6976597e005f8047cbd55ac76ed1e517303d8f6395db6c7805",
#     build_file_content = 'exports_files(["terraform"])'
# )

# http_archive(
#     name = "terraform_mac_arm_64",
#     urls = [ "https://releases.hashicorp.com/terraform/1.3.9/terraform_1.3.9_darwin_arm64.zip" ],
#     sha256 = "d8a59a794a7f99b484a07a0ed2aa6520921d146ac5a7f4b1b806dcf5c4af0525",
#     build_file_content = 'exports_files(["terraform"])'
# )

# http_archive(
#     name = "terraform_linux_amd_64",
#     urls = [ "https://releases.hashicorp.com/terraform/1.3.9/terraform_1.3.9_linux_amd64.zip" ],
#     sha256 = "53048fa573effdd8f2a59b726234c6f450491fe0ded6931e9f4c6e3df6eece56",
#     build_file_content = 'exports_files(["terraform"])'
# )
