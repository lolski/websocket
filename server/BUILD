load("@rules_rust//rust:defs.bzl", "rust_binary")
# load("@vaticle_bazel_distribution//common:rules.bzl", "assemble_targz")

rust_binary(
    name = "bin",
    srcs = ["src/main.rs"],
    deps = [],
    visibility = ["//visibility:public"]
)

# assemble_targz(
#     name = "targz",
#     targets = [],
#     additional_files = {
#         "//application/backend/server:bin" : "server",
#         "//application/ui:distribution" : "ui"
#     },
#     empty_directories = ["ui/assets"],
#     permissions = {
#         "ui/assets": "0755"
#     },
#     output_filename = "typedb-cloud",
#     append_version = False,
#     visibility = ["//visibility:public"]
# )
