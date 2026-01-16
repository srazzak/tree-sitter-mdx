{
  description = "tree-sitter-mdx";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells = {
          default = pkgs.mkShell {
            packages = with pkgs; [
              glibc.dev
              stdenv.cc
              tree-sitter
              pnpm
              nodejs_22
              clang-tools
              clang
            ];
          };
        };
      }
    );
}
