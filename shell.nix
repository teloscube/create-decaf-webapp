with import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/24.05.tar.gz") { };

stdenv.mkDerivation {
  name = "create-decaf-webapp";

  buildInputs = with pkgs; [
    nodejs_22
  ];
}
