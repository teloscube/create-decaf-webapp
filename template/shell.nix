with import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/24.11.tar.gz") { };

stdenv.mkDerivation {
  name = "--projectname--";

  buildInputs = with pkgs; [
    nodejs_22
  ];
}
